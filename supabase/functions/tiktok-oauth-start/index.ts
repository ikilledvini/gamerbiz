import { createClient } from "npm:@supabase/supabase-js@2";
import { TIKTOK_SCOPES } from "../_shared/tiktok.ts";

const jsonHeaders = { "content-type": "application/json; charset=utf-8" };

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: jsonHeaders });
}

function requiredSecret(name: string) {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing required secret: ${name}`);
  return value;
}

function bearerToken(request: Request) {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) return null;
  return authorization.slice("Bearer ".length).trim() || null;
}

Deno.serve(async (request) => {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const accessToken = bearerToken(request);
    if (!accessToken) return json({ error: "Unauthorized" }, 401);

    const supabaseUrl = requiredSecret("SUPABASE_URL");
    const service = createClient(supabaseUrl, requiredSecret("SUPABASE_SERVICE_ROLE_KEY"), {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: authData, error: authError } = await service.auth.getUser(accessToken);
    if (authError || !authData.user) return json({ error: "Unauthorized" }, 401);

    const userId = authData.user.id;
    const [{ data: role, error: roleError }, { data: access, error: accessError }] =
      await Promise.all([
        service
          .from("user_roles")
          .select("user_id")
          .eq("user_id", userId)
          .eq("role", "creator")
          .maybeSingle(),
        service
          .from("creator_talent_access")
          .select("talent_id")
          .eq("user_id", userId)
          .maybeSingle(),
      ]);
    if (roleError) throw roleError;
    if (accessError) throw accessError;
    if (!role) return json({ error: "Creator access required" }, 403);
    if (!access) return json({ error: "Nenhum Media Kit está atribuído a esta conta." }, 400);

    const state = `${crypto.randomUUID()}${crypto.randomUUID()}`;
    const { error: stateError } = await service.from("social_oauth_states").insert({
      state,
      user_id: userId,
      talent_id: access.talent_id,
      platform: "tiktok",
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    });
    if (stateError) throw stateError;

    const redirectUri =
      Deno.env.get("TIKTOK_REDIRECT_URI") ||
      `${supabaseUrl.replace(/\/$/, "")}/functions/v1/tiktok-oauth-callback`;
    const query = new URLSearchParams({
      client_key: requiredSecret("TIKTOK_CLIENT_KEY"),
      redirect_uri: redirectUri,
      response_type: "code",
      scope: TIKTOK_SCOPES.join(","),
      state,
    });

    return json({
      authorizationUrl: `https://www.tiktok.com/v2/auth/authorize/?${query.toString()}`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao iniciar o TikTok OAuth.";
    console.error("tiktok-oauth-start", error);
    return json({ error: message }, 500);
  }
});
