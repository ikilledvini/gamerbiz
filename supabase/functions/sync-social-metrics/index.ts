import { createClient } from "npm:@supabase/supabase-js@2";
import { fetchTikTokMetrics, refreshTikTokAccessToken } from "../_shared/tiktok.ts";
import { fetchYouTubeAnalytics, type YouTubeAnalytics } from "../_shared/youtube-analytics.ts";

type SocialConnection = {
  id: string;
  talent_id: string;
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
  scope?: string | null;
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

async function isAuthorized(request: Request, supabase: ReturnType<typeof createClient>) {
  const syncSecret = Deno.env.get("SOCIAL_SYNC_SECRET");
  const providedSecret = request.headers.get("x-sync-secret");
  if (syncSecret && providedSecret === syncSecret) return true;

  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) return false;
  const accessToken = authorization.slice("Bearer ".length).trim();
  if (!accessToken) return false;

  const { data: authData, error: authError } = await supabase.auth.getUser(accessToken);
  if (authError || !authData.user) return false;

  const { data: role, error: roleError } = await supabase
    .from("user_roles")
    .select("user_id")
    .eq("user_id", authData.user.id)
    .eq("role", "admin")
    .maybeSingle();
  if (roleError) throw roleError;
  return Boolean(role);
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
  const payload = (await response.json()) as {
    access_token?: string;
    expires_in?: number;
    error?: string;
  };
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

  const response = await fetch(`https://www.googleapis.com/youtube/v3/channels?${query}`, {
    headers,
  });
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

async function accessTokenForConnection(
  supabase: ReturnType<typeof createClient>,
  connection: SocialConnection,
  credentials: {
    googleClientId?: string;
    googleClientSecret?: string;
    tiktokClientKey?: string;
    tiktokClientSecret?: string;
  },
) {
  const { data, error } = await supabase
    .from("social_oauth_tokens")
    .select("connection_id, refresh_token, access_token, access_token_expires_at, scope")
    .eq("connection_id", connection.id)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error(`OAuth token not found for ${connection.platform}`);

  const token = data as OAuthToken;
  const expiresAt = token.access_token_expires_at
    ? new Date(token.access_token_expires_at).getTime()
    : 0;
  if (token.access_token && expiresAt > Date.now() + 60_000) return token.access_token;

  if (connection.platform === "youtube") {
    if (!credentials.googleClientId || !credentials.googleClientSecret) {
      throw new Error("Google YouTube OAuth secrets are not configured");
    }
    const refreshed = await refreshYouTubeAccessToken(
      token.refresh_token,
      credentials.googleClientId,
      credentials.googleClientSecret,
    );
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
    return refreshed.access_token!;
  }

  if (connection.platform === "tiktok") {
    if (!credentials.tiktokClientKey || !credentials.tiktokClientSecret) {
      throw new Error("TikTok OAuth secrets are not configured");
    }
    const refreshed = await refreshTikTokAccessToken(
      token.refresh_token,
      credentials.tiktokClientKey,
      credentials.tiktokClientSecret,
    );
    await supabase
      .from("social_oauth_tokens")
      .update({
        access_token: refreshed.access_token,
        refresh_token: refreshed.refresh_token,
        access_token_expires_at: new Date(
          Date.now() + (refreshed.expires_in ?? 86400) * 1000,
        ).toISOString(),
        scope: refreshed.scope || token.scope,
        updated_at: new Date().toISOString(),
      })
      .eq("connection_id", token.connection_id);
    return refreshed.access_token;
  }

  throw new Error(`OAuth sync is not implemented for ${connection.platform}`);
}

Deno.serve(async (request) => {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const supabase = createClient(
      requiredSecret("SUPABASE_URL"),
      requiredSecret("SUPABASE_SERVICE_ROLE_KEY"),
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    if (!(await isAuthorized(request, supabase))) {
      return json({ error: "Unauthorized" }, 401);
    }

    const requestBody = (await request.json().catch(() => ({}))) as {
      trigger?: string;
      connectionIds?: unknown;
    };
    const connectionIds = Array.isArray(requestBody.connectionIds)
      ? requestBody.connectionIds.filter((id): id is string => typeof id === "string").slice(0, 200)
      : [];
    const triggerSource = requestBody.trigger === "scheduler" ? "scheduler" : "admin";
    const { data: syncRun } = await supabase
      .from("social_sync_runs")
      .insert({ trigger_source: triggerSource, connection_ids: connectionIds })
      .select("id")
      .maybeSingle();

    const youtubeApiKey = Deno.env.get("YOUTUBE_API_KEY");
    const googleClientId = Deno.env.get("GOOGLE_YOUTUBE_CLIENT_ID");
    const googleClientSecret = Deno.env.get("GOOGLE_YOUTUBE_CLIENT_SECRET");
    const tiktokClientKey = Deno.env.get("TIKTOK_CLIENT_KEY");
    const tiktokClientSecret = Deno.env.get("TIKTOK_CLIENT_SECRET");
    let connectionQuery = supabase
      .from("social_connections")
      .select("id, talent_id, platform, handle, external_account_id, connection_method")
      .in("platform", ["youtube", "tiktok"])
      .eq("sync_enabled", true);
    if (connectionIds.length) connectionQuery = connectionQuery.in("id", connectionIds);
    const { data, error } = await connectionQuery;

    if (error) throw error;

    const results: Array<{ id: string; ok: boolean; error?: string; warning?: string }> = [];

    for (const connection of (data ?? []) as SocialConnection[]) {
      try {
        let accessToken: string | undefined;
        if (connection.connection_method === "oauth") {
          accessToken = await accessTokenForConnection(supabase, connection, {
            googleClientId,
            googleClientSecret,
            tiktokClientKey,
            tiktokClientSecret,
          });
        }

        let syncedMetrics: Record<string, unknown>;
        let analyticsError: string | null = null;
        let profileUrl: string | undefined;
        let handle: string | null | undefined;

        if (connection.platform === "youtube") {
          if (!youtubeApiKey && !accessToken) {
            throw new Error("Configure YOUTUBE_API_KEY or the Google YouTube OAuth secrets.");
          }
          const metrics = await fetchYouTubeMetrics(connection, {
            apiKey: youtubeApiKey,
            accessToken,
          });
          let analytics: YouTubeAnalytics | null = null;
          if (connection.connection_method === "oauth" && accessToken) {
            try {
              analytics = await fetchYouTubeAnalytics(accessToken);
            } catch (error) {
              analyticsError =
                error instanceof Error ? error.message : "YouTube Analytics unavailable";
              console.warn("sync-social-metrics analytics", connection.id, error);
            }
          }
          syncedMetrics = {
            ...metrics,
            ...(analytics ? { analytics } : {}),
            ...(analyticsError ? { analytics_error: analyticsError } : {}),
          };
        } else if (connection.platform === "tiktok") {
          if (!accessToken) throw new Error("TikTok OAuth token is unavailable");
          const metrics = await fetchTikTokMetrics(accessToken);
          syncedMetrics = metrics;
          profileUrl = metrics.profile_url;
          handle = metrics.handle;
        } else {
          throw new Error(`Automatic sync is not implemented for ${connection.platform}`);
        }
        const syncedAt = new Date().toISOString();

        const { error: updateError } = await supabase
          .from("social_connections")
          .update({
            external_account_id: syncedMetrics["account_id"],
            ...(profileUrl ? { profile_url: profileUrl } : {}),
            ...(handle !== undefined ? { handle } : {}),
            current_metrics: syncedMetrics,
            last_synced_at: syncedAt,
            last_sync_error: null,
            connection_status: "connected",
          })
          .eq("id", connection.id);
        if (updateError) throw updateError;

        const { error: snapshotError } = await supabase.from("social_metric_snapshots").insert({
          connection_id: connection.id,
          metrics: syncedMetrics,
          captured_at: syncedAt,
        });
        if (snapshotError) throw snapshotError;

        if (connection.platform === "tiktok" && profileUrl) {
          const { error: talentError } = await supabase
            .from("talents")
            .update({ tiktok_url: profileUrl, updated_at: syncedAt })
            .eq("id", connection.talent_id);
          if (talentError) throw talentError;
        }

        results.push({
          id: connection.id,
          ok: true,
          ...(analyticsError ? { warning: analyticsError } : {}),
        });
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

    const summary = {
      processed: results.length,
      succeeded: results.filter((result) => result.ok).length,
      failed: results.filter((result) => !result.ok).length,
      results,
    };
    if (syncRun?.id) {
      await supabase
        .from("social_sync_runs")
        .update({
          ...summary,
          status: summary.failed === 0 ? "completed" : summary.succeeded > 0 ? "partial" : "failed",
          completed_at: new Date().toISOString(),
        })
        .eq("id", syncRun.id);
    }
    return json(summary);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown sync error";
    return json({ error: message }, 500);
  }
});
