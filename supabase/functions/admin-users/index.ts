import { createClient } from "npm:@supabase/supabase-js@2";

type AuthUser = { id: string };

type AppRole = "admin" | "creator";

type AccountInput = {
  email: string;
  password: string;
  displayName?: string | null;
  role: AppRole;
  talentId?: string | null;
};

type RequestBody =
  | { action: "list" }
  | ({ action: "create" } & AccountInput)
  | ({ action: "update"; userId: string } & Partial<AccountInput>)
  | { action: "delete"; userId: string }
  | { action: "bootstrap"; accounts: AccountInput[] };

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-setup-key",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function respond(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "content-type": "application/json; charset=utf-8" },
  });
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function validateAccount(input: AccountInput, requirePassword = true) {
  if (!/^\S+@\S+\.\S+$/.test(input.email)) throw new Error("Informe um e-mail válido.");
  if (requirePassword && input.password.length < 8) {
    throw new Error("A senha precisa ter pelo menos 8 caracteres.");
  }
  if (input.role === "creator" && !input.talentId) {
    throw new Error("Selecione o Media Kit do creator.");
  }
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return respond({ error: "Method not allowed" }, 405);

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    if (!supabaseUrl || !serviceRoleKey || !anonKey) {
      throw new Error("Supabase environment is incomplete.");
    }

    const body = (await request.json()) as RequestBody;
    const service = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const setupKey = Deno.env.get("USER_ADMIN_SETUP_KEY");
    const suppliedSetupKey = request.headers.get("x-setup-key");
    const isBootstrap =
      body.action === "bootstrap" && Boolean(setupKey) && suppliedSetupKey === setupKey;

    let actor: AuthUser | null = null;
    if (!isBootstrap) {
      const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
      if (!token) return respond({ error: "Authentication required" }, 401);

      const authClient = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: `Bearer ${token}` } },
        auth: { autoRefreshToken: false, persistSession: false },
      });
      const { data: authData, error: authError } = await authClient.auth.getUser(token);
      if (authError || !authData.user) return respond({ error: "Invalid session" }, 401);
      actor = authData.user;

      const { data: adminRole } = await service
        .from("user_roles")
        .select("id")
        .eq("user_id", actor.id)
        .eq("role", "admin")
        .maybeSingle();
      if (!adminRole) return respond({ error: "Administrator access required" }, 403);
    }

    async function applyAccess(userId: string, role: AppRole, talentId?: string | null) {
      if (actor?.id === userId && role !== "admin") {
        throw new Error("Você não pode remover o próprio acesso administrativo.");
      }

      if (role === "creator" && talentId) {
        const { data: existingAccess, error: accessLookupError } = await service
          .from("creator_talent_access")
          .select("user_id")
          .eq("talent_id", talentId)
          .maybeSingle();
        if (accessLookupError) throw accessLookupError;
        if (existingAccess && existingAccess.user_id !== userId) {
          throw new Error("Este Media Kit já está atribuído a outro usuário.");
        }
      }

      const { error: deleteRoleError } = await service
        .from("user_roles")
        .delete()
        .eq("user_id", userId);
      if (deleteRoleError) throw deleteRoleError;

      const { error: roleError } = await service
        .from("user_roles")
        .insert({ user_id: userId, role });
      if (roleError) throw roleError;

      const { error: clearAccessError } = await service
        .from("creator_talent_access")
        .delete()
        .eq("user_id", userId);
      if (clearAccessError) throw clearAccessError;

      if (role === "creator" && talentId) {
        const { error: accessError } = await service
          .from("creator_talent_access")
          .upsert({ user_id: userId, talent_id: talentId }, { onConflict: "user_id" });
        if (accessError) throw accessError;
      }
    }

    async function createOrUpdateAccount(account: AccountInput, allowExisting = false) {
      validateAccount(account);
      const email = normalizeEmail(account.email);
      const { data: usersData, error: listError } = await service.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });
      if (listError) throw listError;
      const existing = usersData.users.find((user) => user.email?.toLowerCase() === email);
      if (existing && !allowExisting) {
        throw new Error("Já existe um usuário com este e-mail.");
      }

      const authResult = existing
        ? await service.auth.admin.updateUserById(existing.id, {
            email,
            password: account.password,
            email_confirm: true,
            user_metadata: { ...existing.user_metadata, name: account.displayName || email },
          })
        : await service.auth.admin.createUser({
            email,
            password: account.password,
            email_confirm: true,
            user_metadata: { name: account.displayName || email },
          });
      if (authResult.error || !authResult.data.user) {
        throw authResult.error ?? new Error("User creation failed");
      }

      const user = authResult.data.user;
      const { error: profileError } = await service.from("profiles").upsert({
        user_id: user.id,
        email,
        display_name: account.displayName || null,
        must_change_password: account.role === "creator",
        updated_at: new Date().toISOString(),
      });
      if (profileError) throw profileError;
      await applyAccess(user.id, account.role, account.talentId);
      return { id: user.id, email, role: account.role, talentId: account.talentId ?? null };
    }

    if (body.action === "list") {
      const { data, error } = await service.auth.admin.listUsers({ page: 1, perPage: 1000 });
      if (error) throw error;
      return respond({
        users: data.users.map((user) => ({
          id: user.id,
          email: user.email ?? "",
          createdAt: user.created_at,
          lastSignInAt: user.last_sign_in_at ?? null,
        })),
      });
    }

    if (body.action === "bootstrap") {
      if (!isBootstrap) return respond({ error: "Invalid setup key" }, 403);
      const results = [];
      for (const account of body.accounts) {
        try {
          results.push({ ok: true, ...(await createOrUpdateAccount(account, true)) });
        } catch (error) {
          results.push({
            ok: false,
            email: normalizeEmail(account.email),
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }
      return respond({
        processed: results.length,
        succeeded: results.filter((item) => item.ok).length,
        failed: results.filter((item) => !item.ok).length,
        results,
      });
    }

    if (body.action === "create") {
      return respond({ user: await createOrUpdateAccount(body) }, 201);
    }

    if (body.action === "update") {
      if (!body.userId) throw new Error("User ID is required.");
      const { data: current, error: currentError } = await service.auth.admin.getUserById(
        body.userId,
      );
      if (currentError || !current.user) throw currentError ?? new Error("User not found");

      const { data: currentRole, error: currentRoleError } = await service
        .from("user_roles")
        .select("role")
        .eq("user_id", body.userId)
        .maybeSingle();
      if (currentRoleError) throw currentRoleError;

      const email = normalizeEmail(body.email || current.user.email || "");
      const update: {
        email: string;
        email_confirm: boolean;
        password?: string;
        user_metadata: Record<string, unknown>;
      } = {
        email,
        email_confirm: true,
        user_metadata: {
          ...current.user.user_metadata,
          name: body.displayName || current.user.user_metadata?.name || email,
        },
      };
      if (body.password) {
        if (body.password.length < 8)
          throw new Error("A senha precisa ter pelo menos 8 caracteres.");
        update.password = body.password;
      }

      const { error: updateError } = await service.auth.admin.updateUserById(body.userId, update);
      if (updateError) throw updateError;
      const shouldRequirePasswordChange =
        body.role === "creator" && (Boolean(body.password) || currentRole?.role !== "creator");
      const profileUpdate: Record<string, unknown> = {
        user_id: body.userId,
        email,
        display_name: body.displayName || null,
        updated_at: new Date().toISOString(),
      };
      if (body.role === "admin") profileUpdate.must_change_password = false;
      if (shouldRequirePasswordChange) profileUpdate.must_change_password = true;

      const { error: profileError } = await service.from("profiles").upsert(profileUpdate);
      if (profileError) throw profileError;

      if (body.role) {
        validateAccount(
          {
            email,
            password: body.password || "temporary-valid-password",
            displayName: body.displayName,
            role: body.role,
            talentId: body.talentId,
          },
          false,
        );
        await applyAccess(body.userId, body.role, body.talentId);
      }
      return respond({ ok: true });
    }

    if (body.action === "delete") {
      if (actor?.id === body.userId) {
        throw new Error("Você não pode excluir a conta usada nesta sessão.");
      }
      const { error } = await service.auth.admin.deleteUser(body.userId);
      if (error) throw error;
      const { error: roleCleanupError } = await service
        .from("user_roles")
        .delete()
        .eq("user_id", body.userId);
      if (roleCleanupError) throw roleCleanupError;
      return respond({ ok: true });
    }

    return respond({ error: "Unknown action" }, 400);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return respond({ error: message }, 400);
  }
});
