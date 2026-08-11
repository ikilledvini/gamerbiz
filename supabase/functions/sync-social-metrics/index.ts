import { createClient } from "npm:@supabase/supabase-js@2";

type SocialConnection = {
  id: string;
  platform: "youtube" | "instagram" | "tiktok" | "twitch" | "twitter";
  handle: string | null;
  external_account_id: string | null;
  connection_method: "manual" | "oauth";
};

type OAuthToken = {
  connection_id: string;
  refresh_token: string;
  access_token: string | null;
  access_token_expires_at: string | null;
};

type YouTubeChannel = {
  id: string;
  statistics?: {
    subscriberCount?: string;
    viewCount?: string;
    videoCount?: string;
  };
};

const jsonHeaders = { "content-type": "application/json; charset=utf-8" };

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: jsonHeaders });
}

function requiredSecret(name: string) {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing required secret: ${name}`);
  return value;
}

function toNumber(value?: string) {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

async function refreshYouTubeAccessToken(
  refreshToken: string,
  clientId: string,
  clientSecret: string,
) {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
    }),
  });
  const payload = (await response.json()) as { access_token?: string; expires_in?: number; error?: string };
  if (!response.ok || !payload.access_token) {
    throw new Error(payload.error || "YouTube OAuth token refresh failed");
  }
  return payload;
}

async function fetchYouTubeMetrics(
  connection: SocialConnection,
  options: { apiKey?: string; accessToken?: string },
) {
  const query = new URLSearchParams({
    part: "statistics",
  });
  const headers: Record<string, string> = {};

  if (options.accessToken) {
    headers.Authorization = `Bearer ${options.accessToken}`;
  } else if (options.apiKey) {
    query.set("key", options.apiKey);
  } else {
    throw new Error("YouTube credentials are not configured");
  }

  if (connection.external_account_id) {
    query.set("id", connection.external_account_id);
  } else if (connection.handle) {
    query.set("forHandle", connection.handle.replace(/^@/, ""));
  } else {
    throw new Error("YouTube connection has neither an account ID nor a handle");
  }

  const response = await fetch(`https://www.googleapis.com/youtube/v3/channels?${query}`, { headers });
  if (!response.ok) {
    const details = await response.text();
    throw new Error(`YouTube API ${response.status}: ${details.slice(0, 300)}`);
  }

  const payload = (await response.json()) as { items?: YouTubeChannel[] };
  const channel = payload.items?.[0];
  if (!channel) throw new Error("YouTube channel was not found");

  return {
    account_id: channel.id,
    subscribers: toNumber(channel.statistics?.subscriberCount),
    total_views: toNumber(channel.statistics?.viewCount),
    video_count: toNumber(channel.statistics?.videoCount),
    source: "youtube_data_api_v3",
  };
}

Deno.serve(async (request) => {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const syncSecret = requiredSecret("SOCIAL_SYNC_SECRET");
    const providedSecret = request.headers.get("x-sync-secret");
    if (!providedSecret || providedSecret !== syncSecret) {
      return json({ error: "Unauthorized" }, 401);
    }

    const supabase = createClient(
      requiredSecret("SUPABASE_URL"),
      requiredSecret("SUPABASE_SERVICE_ROLE_KEY"),
      { auth: { persistSession: false, autoRefreshToken: false } },
    );

    const youtubeApiKey = Deno.env.get("YOUTUBE_API_KEY");
    const googleClientId = Deno.env.get("GOOGLE_YOUTUBE_CLIENT_ID");
    const googleClientSecret = Deno.env.get("GOOGLE_YOUTUBE_CLIENT_SECRET");
    if (!youtubeApiKey && (!googleClientId || !googleClientSecret)) {
      throw new Error("Configure YOUTUBE_API_KEY or the Google YouTube OAuth secrets.");
    }
    const { data, error } = await supabase
      .from("social_connections")
      .select("id, platform, handle, external_account_id, connection_method")
      .eq("platform", "youtube")
      .eq("sync_enabled", true);

    if (error) throw error;

    const results: Array<{ id: string; ok: boolean; error?: string }> = [];

    for (const connection of (data ?? []) as SocialConnection[]) {
      try {
        let accessToken: string | undefined;
        if (connection.connection_method === "oauth" && googleClientId && googleClientSecret) {
          const { data: oauthToken, error: oauthTokenError } = await supabase
            .from("social_oauth_tokens")
            .select("connection_id, refresh_token, access_token, access_token_expires_at")
            .eq("connection_id", connection.id)
            .maybeSingle();
          if (oauthTokenError) throw oauthTokenError;
          if (oauthToken) {
            const token = oauthToken as OAuthToken;
            const expiresAt = token.access_token_expires_at
              ? new Date(token.access_token_expires_at).getTime()
              : 0;
            if (token.access_token && expiresAt > Date.now() + 60_000) {
              accessToken = token.access_token;
            } else {
              const refreshed = await refreshYouTubeAccessToken(
                token.refresh_token,
                googleClientId,
                googleClientSecret,
              );
              accessToken = refreshed.access_token;
              await supabase
                .from("social_oauth_tokens")
                .update({
                  access_token: refreshed.access_token,
                  access_token_expires_at: new Date(
                    Date.now() + (refreshed.expires_in ?? 3600) * 1000,
                  ).toISOString(),
                  updated_at: new Date().toISOString(),
                })
                .eq("connection_id", token.connection_id);
            }
          }
        }

        const metrics = await fetchYouTubeMetrics(connection, {
          apiKey: youtubeApiKey,
          accessToken,
        });
        const syncedAt = new Date().toISOString();

        const { error: updateError } = await supabase
          .from("social_connections")
          .update({
            external_account_id: metrics.account_id,
            current_metrics: metrics,
            last_synced_at: syncedAt,
            last_sync_error: null,
            connection_status: "connected",
          })
          .eq("id", connection.id);
        if (updateError) throw updateError;

        const { error: snapshotError } = await supabase.from("social_metric_snapshots").insert({
          connection_id: connection.id,
          metrics,
          captured_at: syncedAt,
        });
        if (snapshotError) throw snapshotError;

        results.push({ id: connection.id, ok: true });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown sync error";
        await supabase
          .from("social_connections")
          .update({
            last_sync_error: message.slice(0, 500),
            connection_status: "error",
          })
          .eq("id", connection.id);
        results.push({ id: connection.id, ok: false, error: message });
      }
    }

    return json({
      processed: results.length,
      succeeded: results.filter((result) => result.ok).length,
      failed: results.filter((result) => !result.ok).length,
      results,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown sync error";
    return json({ error: message }, 500);
  }
});
