import { createServerFn } from "@tanstack/react-start";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";
import { TALENT_COLUMNS, mapTalentRow, type TalentRow } from "@/lib/talent-mapper";

export type PortalRole = "admin" | "creator" | "none";
export type SocialPlatform = Database["public"]["Enums"]["social_platform"];
export type SocialConnectionRow = Database["public"]["Tables"]["social_connections"]["Row"];
export type LeadRow = Database["public"]["Tables"]["lead_submissions"]["Row"];
export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type CreatorAccessRow = Database["public"]["Tables"]["creator_talent_access"]["Row"];
export type AdminUserRow = {
  id: string;
  email: string;
  createdAt: string;
  lastSignInAt: string | null;
};
export type ManagedUserRole = "admin" | "creator";
export type SocialSyncResult = {
  processed: number;
  succeeded: number;
  failed: number;
  results: Array<{ id: string; ok: boolean; error?: string; warning?: string }>;
};

const SOCIAL_PLATFORMS = new Set<SocialPlatform>([
  "youtube",
  "instagram",
  "tiktok",
  "twitch",
  "twitter",
]);

async function userHasRole(
  supabase: SupabaseClient<Database>,
  userId: string,
  role: Database["public"]["Enums"]["app_role"],
) {
  const { data, error } = await supabase.rpc("has_role", {
    _user_id: userId,
    _role: role,
  });
  if (error) throw new Error(error.message);
  return Boolean(data);
}

async function requireAdmin(supabase: SupabaseClient<Database>, userId: string) {
  if (!(await userHasRole(supabase, userId, "admin"))) {
    throw new Error("Administrator access required");
  }
}

async function requireCreator(
  supabase: SupabaseClient<Database>,
  userId: string,
  options: { allowPendingPasswordChange?: boolean } = {},
) {
  if (!(await userHasRole(supabase, userId, "creator"))) {
    throw new Error("Creator access required");
  }

  if (options.allowPendingPasswordChange) return;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("must_change_password")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (profile?.must_change_password) {
    throw new Error("Password change required before opening the creator portal");
  }
}

function assertPlatform(platform: SocialPlatform) {
  if (!SOCIAL_PLATFORMS.has(platform)) throw new Error("Invalid social platform");
}

export const getCurrentPortalAccess = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const [isAdmin, isCreator, profile] = await Promise.all([
      userHasRole(context.supabase, context.userId, "admin"),
      userHasRole(context.supabase, context.userId, "creator"),
      context.supabase
        .from("profiles")
        .select("must_change_password")
        .eq("user_id", context.userId)
        .maybeSingle(),
    ]);
    if (profile.error) throw new Error(profile.error.message);

    const role: PortalRole = isAdmin ? "admin" : isCreator ? "creator" : "none";
    return {
      role,
      userId: context.userId,
      mustChangePassword: role === "creator" && Boolean(profile.data?.must_change_password),
    };
  });

export const completeFirstPasswordChange = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireCreator(context.supabase, context.userId, { allowPendingPasswordChange: true });
    const { error } = await context.supabase.rpc("complete_first_password_change");
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDashboardOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context.supabase, context.userId);

    const [talents, connections, leads, profiles, access, roles, authUsers] = await Promise.all([
      context.supabase.from("talents").select(TALENT_COLUMNS).order("sort_order"),
      context.supabase
        .from("social_connections")
        .select("*")
        .order("updated_at", { ascending: false }),
      context.supabase
        .from("lead_submissions")
        .select("*")
        .order("created_at", { ascending: false }),
      context.supabase.from("profiles").select("*").order("email"),
      context.supabase.from("creator_talent_access").select("*").order("created_at"),
      context.supabase.from("user_roles").select("user_id, role").in("role", ["admin", "creator"]),
      context.supabase.functions.invoke<{ users: AdminUserRow[] }>("admin-users", {
        body: { action: "list" },
      }),
    ]);

    const firstError = [
      talents.error,
      connections.error,
      leads.error,
      profiles.error,
      access.error,
      roles.error,
    ].find(Boolean);
    if (firstError) throw new Error(firstError.message);

    return {
      talents: (talents.data ?? []) as TalentRow[],
      connections: connections.data ?? [],
      leads: leads.data ?? [],
      profiles: profiles.data ?? [],
      access: access.data ?? [],
      creatorUserIds: (roles.data ?? [])
        .filter((role) => role.role === "creator")
        .map((role) => role.user_id),
      adminUserIds: (roles.data ?? [])
        .filter((role) => role.role === "admin")
        .map((role) => role.user_id),
      authUsers: authUsers.data?.users ?? [],
      authUsersError: authUsers.error?.message ?? null,
    };
  });

export const adminManageUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(
    (
      input:
        | {
            action: "create";
            email: string;
            password: string;
            displayName: string | null;
            role: ManagedUserRole;
            talentId: string | null;
          }
        | {
            action: "update";
            userId: string;
            email: string;
            password?: string;
            displayName: string | null;
            role: ManagedUserRole;
            talentId: string | null;
          }
        | { action: "delete"; userId: string },
    ) => input,
  )
  .handler(async ({ data, context }) => {
    await requireAdmin(context.supabase, context.userId);
    const result = await context.supabase.functions.invoke("admin-users", { body: data });
    if (result.error) {
      let message = result.error.message;
      const response = "context" in result.error ? result.error.context : undefined;
      if (response instanceof Response) {
        try {
          const payload = (await response.clone().json()) as { error?: string; message?: string };
          const details = payload.error || payload.message;
          if (details) message = `${message}: ${details}`;
        } catch {
          // Keep the SDK error when the function response is not JSON.
        }
      }
      throw new Error(message);
    }
    return result.data as { ok?: boolean; user?: AdminUserRow };
  });

export const adminSyncSocialMetrics = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context.supabase, context.userId);

    const result = await context.supabase.functions.invoke<SocialSyncResult>(
      "sync-social-metrics",
      { body: { trigger: "admin" } },
    );
    if (result.error) {
      let message = result.error.message;
      const response = "context" in result.error ? result.error.context : undefined;
      if (response instanceof Response) {
        try {
          const payload = (await response.clone().json()) as { error?: string; message?: string };
          const details = payload.error || payload.message;
          if (details) message = details;
        } catch {
          // Keep the SDK error when the function response is not JSON.
        }
      }
      throw new Error(message);
    }
    if (!result.data) throw new Error("A sincronização não retornou um resultado.");
    return result.data;
  });

export const adminUpdateLeadStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: { id: string; status: Database["public"]["Enums"]["lead_status"] }) => input)
  .handler(async ({ data, context }) => {
    await requireAdmin(context.supabase, context.userId);
    const { error } = await context.supabase
      .from("lead_submissions")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminAssignCreator = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: { userId: string; talentId: string }) => input)
  .handler(async ({ data, context }) => {
    await requireAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.rpc("admin_assign_creator", {
      p_user_id: data.userId,
      p_talent_id: data.talentId,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminRemoveCreatorAccess = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: { userId: string }) => input)
  .handler(async ({ data, context }) => {
    await requireAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.rpc("admin_remove_creator_access", {
      p_user_id: data.userId,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const creatorPortalData = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireCreator(context.supabase, context.userId);

    const [profileResult, accessResult] = await Promise.all([
      context.supabase.from("profiles").select("*").eq("user_id", context.userId).maybeSingle(),
      context.supabase
        .from("creator_talent_access")
        .select("*")
        .eq("user_id", context.userId)
        .maybeSingle(),
    ]);
    if (profileResult.error) throw new Error(profileResult.error.message);
    if (accessResult.error) throw new Error(accessResult.error.message);

    if (!accessResult.data) {
      return {
        profile: profileResult.data,
        talent: null,
        connections: [] as SocialConnectionRow[],
      };
    }

    const [talentResult, connectionsResult] = await Promise.all([
      context.supabase
        .from("talents")
        .select(TALENT_COLUMNS)
        .eq("id", accessResult.data.talent_id)
        .single(),
      context.supabase
        .from("social_connections")
        .select("*")
        .eq("talent_id", accessResult.data.talent_id)
        .order("platform"),
    ]);
    if (talentResult.error) throw new Error(talentResult.error.message);
    if (connectionsResult.error) throw new Error(connectionsResult.error.message);

    return {
      profile: profileResult.data,
      talent: mapTalentRow(talentResult.data as TalentRow),
      connections: connectionsResult.data ?? [],
    };
  });

export const creatorStartYouTubeOAuth = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireCreator(context.supabase, context.userId);

    const clientId =
      import.meta.env["VITE_GOOGLE_YOUTUBE_CLIENT_ID"] || process.env["GOOGLE_YOUTUBE_CLIENT_ID"];
    if (!clientId) {
      throw new Error("A conexão do YouTube ainda não foi configurada pelo administrador.");
    }

    const { data: access, error: accessError } = await context.supabase
      .from("creator_talent_access")
      .select("talent_id")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (accessError) throw new Error(accessError.message);
    if (!access) throw new Error("Nenhum Media Kit está atribuído a esta conta.");

    const state = `${crypto.randomUUID()}${crypto.randomUUID()}`;
    const { error: stateError } = await context.supabase.from("social_oauth_states").insert({
      state,
      user_id: context.userId,
      talent_id: access.talent_id,
      platform: "youtube",
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    });
    if (stateError) throw new Error(stateError.message);

    const supabaseUrl = import.meta.env["VITE_SUPABASE_URL"] || process.env["SUPABASE_URL"];
    if (!supabaseUrl) throw new Error("A URL do Supabase não está configurada.");

    const redirectUri = `${supabaseUrl.replace(/\/$/, "")}/functions/v1/youtube-oauth-callback`;
    const query = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      access_type: "offline",
      prompt: "consent",
      include_granted_scopes: "true",
      scope: [
        "https://www.googleapis.com/auth/youtube.readonly",
        "https://www.googleapis.com/auth/yt-analytics.readonly",
      ].join(" "),
      state,
    });

    return {
      authorizationUrl: `https://accounts.google.com/o/oauth2/v2/auth?${query.toString()}`,
    };
  });

export const creatorDisconnectConnection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: { platform: SocialPlatform }) => input)
  .handler(async ({ data, context }) => {
    await requireCreator(context.supabase, context.userId);
    assertPlatform(data.platform);
    const { error } = await context.supabase.rpc("creator_disconnect_social_connection", {
      p_platform: data.platform,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
