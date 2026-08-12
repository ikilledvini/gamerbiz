import { createClient } from "npm:@supabase/supabase-js@2";
import { exchangeTikTokCode, fetchTikTokMetrics, TIKTOK_SCOPES } from "../_shared/tiktok.ts";

function requiredSecret(name: string) {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing required secret: ${name}`);
  return value;
}

function appUrl() {
  return (Deno.env.get("APP_URL") || "http://127.0.0.1:5173").replace(/\/$/, "");
}

function redirectResult(status: "connected" | "error", message?: string) {
  const url = new URL(`${appUrl()}/creator`);
  url.searchParams.set("tiktok", status);
  if (message) url.searchParams.set("message", message.slice(0, 240));
  return Response.redirect(url.toString(), 303);
}

function grantedScopes(value: string) {
  return new Set(
    value
      .split(/[\s,]+/)
      .map((scope) => scope.trim())
      .filter(Boolean),
  );
}

Deno.serve(async (request) => {
  if (request.method !== "GET") return new Response("Method not allowed", { status: 405 });

  try {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const providerError =
      url.searchParams.get("error_description") || url.searchParams.get("error");
    if (providerError) return redirectResult("error", providerError);
    if (!code || !state) return redirectResult("error", "Resposta OAuth incompleta.");

    const supabaseUrl = requiredSecret("SUPABASE_URL");
    const service = createClient(supabaseUrl, requiredSecret("SUPABASE_SERVICE_ROLE_KEY"), {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: pending, error: stateError } = await service
      .from("social_oauth_states")
      .delete()
      .eq("state", state)
      .select("state, user_id, talent_id, platform, expires_at")
      .maybeSingle();
    if (stateError) throw stateError;
    if (!pending || pending.platform !== "tiktok") {
      throw new Error("OAuth state inválido ou já utilizado.");
    }
    if (new Date(pending.expires_at).getTime() <= Date.now()) {
      throw new Error("A autorização expirou. Tente conectar novamente.");
    }

    const clientKey = requiredSecret("TIKTOK_CLIENT_KEY");
    const clientSecret = requiredSecret("TIKTOK_CLIENT_SECRET");
    const redirectUri =
      Deno.env.get("TIKTOK_REDIRECT_URI") ||
      `${supabaseUrl.replace(/\/$/, "")}/functions/v1/tiktok-oauth-callback`;
    const token = await exchangeTikTokCode(code, clientKey, clientSecret, redirectUri);
    const scopes = grantedScopes(token.scope);
    const missingScopes = TIKTOK_SCOPES.filter((scope) => !scopes.has(scope));
    if (missingScopes.length > 0) {
      throw new Error(`Autorize todas as permissões do TikTok: ${missingScopes.join(", ")}.`);
    }

    const metrics = await fetchTikTokMetrics(token.access_token);
    const now = new Date().toISOString();
    const { data: connection, error: connectionError } = await service
      .from("social_connections")
      .upsert(
        {
          talent_id: pending.talent_id,
          platform: "tiktok",
          profile_url: metrics.profile_url,
          handle: metrics.handle,
          external_account_id: metrics.account_id,
          connection_method: "oauth",
          sync_enabled: true,
          connection_status: "connected",
          connected_by: pending.user_id,
          connected_at: now,
          current_metrics: metrics,
          last_synced_at: now,
          last_sync_error: null,
          updated_at: now,
        },
        { onConflict: "talent_id,platform" },
      )
      .select("id")
      .single();
    if (connectionError || !connection) {
      throw connectionError ?? new Error("A conexão do TikTok não foi salva.");
    }

    const { error: tokenError } = await service.from("social_oauth_tokens").upsert(
      {
        connection_id: connection.id,
        provider: "tiktok",
        refresh_token: token.refresh_token,
        access_token: token.access_token,
        access_token_expires_at: new Date(Date.now() + token.expires_in * 1000).toISOString(),
        scope: token.scope,
        updated_at: now,
      },
      { onConflict: "connection_id" },
    );
    if (tokenError) throw tokenError;

    const { error: snapshotError } = await service.from("social_metric_snapshots").insert({
      connection_id: connection.id,
      metrics,
      captured_at: now,
    });
    if (snapshotError) throw snapshotError;

    const { error: talentError } = await service
      .from("talents")
      .update({ tiktok_url: metrics.profile_url, updated_at: now })
      .eq("id", pending.talent_id);
    if (talentError) throw talentError;

    return redirectResult("connected");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao conectar o TikTok.";
    console.error("tiktok-oauth-callback", error);
    return redirectResult("error", message);
  }
});
