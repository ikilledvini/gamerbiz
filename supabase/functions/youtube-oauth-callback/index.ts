import { createClient } from "npm:@supabase/supabase-js@2";

const jsonHeaders = { "content-type": "application/json; charset=utf-8" };
const YOUTUBE_SCOPE = "https://www.googleapis.com/auth/youtube.readonly";

type TokenResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
  token_type?: string;
};

type ChannelResponse = {
  items?: Array<{
    id: string;
    snippet?: { title?: string; customUrl?: string };
    statistics?: {
      subscriberCount?: string;
      viewCount?: string;
      videoCount?: string;
    };
  }>;
};

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
  url.searchParams.set("youtube", status);
  if (message) url.searchParams.set("message", message.slice(0, 240));
  return Response.redirect(url.toString(), 303);
}

function toNumber(value?: string) {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function channelProfile(channelId: string, customUrl?: string) {
  if (customUrl) {
    const normalized = customUrl.replace(/^\/+/, "");
    return `https://www.youtube.com/${normalized}`;
  }
  return `https://www.youtube.com/channel/${channelId}`;
}

function channelHandle(customUrl?: string) {
  if (!customUrl) return null;
  const normalized = customUrl.replace(/^\/+/, "");
  return normalized.startsWith("@") ? normalized : null;
}

async function exchangeCode(
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string,
) {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  const payload = (await response.json()) as TokenResponse & { error?: string; error_description?: string };
  if (!response.ok || !payload.access_token) {
    throw new Error(payload.error_description || payload.error || "Google token exchange failed");
  }
  return payload;
}

async function fetchChannel(accessToken: string) {
  const response = await fetch(
    "https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true",
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  const payload = (await response.json()) as ChannelResponse & { error?: { message?: string } };
  if (!response.ok) {
    throw new Error(payload.error?.message || `YouTube API returned ${response.status}`);
  }

  const channel = payload.items?.[0];
  if (!channel) throw new Error("Nenhum canal do YouTube foi encontrado nessa conta Google.");
  return channel;
}

Deno.serve(async (request) => {
  if (request.method !== "GET") return new Response("Method not allowed", { status: 405 });

  try {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const providerError = url.searchParams.get("error_description") || url.searchParams.get("error");
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
    if (!pending || pending.platform !== "youtube") {
      throw new Error("OAuth state inválido ou já utilizado.");
    }
    if (new Date(pending.expires_at).getTime() <= Date.now()) {
      throw new Error("A autorização expirou. Tente conectar novamente.");
    }

    const clientId = requiredSecret("GOOGLE_YOUTUBE_CLIENT_ID");
    const clientSecret = requiredSecret("GOOGLE_YOUTUBE_CLIENT_SECRET");
    const redirectUri =
      Deno.env.get("GOOGLE_YOUTUBE_REDIRECT_URI") ||
      `${supabaseUrl.replace(/\/$/, "")}/functions/v1/youtube-oauth-callback`;
    const token = await exchangeCode(code, clientId, clientSecret, redirectUri);
    const channel = await fetchChannel(token.access_token!);
    const now = new Date().toISOString();
    const profileUrl = channelProfile(channel.id, channel.snippet?.customUrl);

    const { data: connection, error: connectionError } = await service
      .from("social_connections")
      .upsert(
        {
          talent_id: pending.talent_id,
          platform: "youtube",
          profile_url: profileUrl,
          handle: channelHandle(channel.snippet?.customUrl),
          external_account_id: channel.id,
          connection_method: "oauth",
          sync_enabled: true,
          connection_status: "connected",
          connected_by: pending.user_id,
          connected_at: now,
          current_metrics: {
            account_id: channel.id,
            subscribers: toNumber(channel.statistics?.subscriberCount),
            total_views: toNumber(channel.statistics?.viewCount),
            video_count: toNumber(channel.statistics?.videoCount),
            source: "youtube_oauth",
          },
          last_synced_at: now,
          last_sync_error: null,
          updated_at: now,
        },
        { onConflict: "talent_id,platform" },
      )
      .select("id")
      .single();
    if (connectionError || !connection) throw connectionError ?? new Error("Connection was not saved");

    let refreshToken = token.refresh_token;
    if (!refreshToken) {
      const { data: existingToken } = await service
        .from("social_oauth_tokens")
        .select("refresh_token")
        .eq("connection_id", connection.id)
        .maybeSingle();
      refreshToken = existingToken?.refresh_token;
    }
    if (!refreshToken) {
      throw new Error("O Google não retornou um refresh token. Tente autorizar novamente.");
    }

    const { error: tokenError } = await service.from("social_oauth_tokens").upsert(
      {
        connection_id: connection.id,
        provider: "youtube",
        refresh_token: refreshToken,
        access_token: token.access_token,
        access_token_expires_at: new Date(Date.now() + (token.expires_in ?? 3600) * 1000).toISOString(),
        scope: token.scope || YOUTUBE_SCOPE,
        updated_at: now,
      },
      { onConflict: "connection_id" },
    );
    if (tokenError) throw tokenError;

    const { error: talentError } = await service
      .from("talents")
      .update({ youtube_url: profileUrl, updated_at: now })
      .eq("id", pending.talent_id);
    if (talentError) throw talentError;

    return redirectResult("connected");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao conectar o YouTube.";
    console.error("youtube-oauth-callback", error);
    return redirectResult("error", message);
  }
});
