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

type YouTubeAnalytics = {
  period_days: number;
  start_date: string;
  end_date: string;
  views: number | null;
  estimated_minutes_watched: number | null;
  average_view_duration_seconds: number | null;
  subscribers_gained: number | null;
  likes: number | null;
  comments: number | null;
  source: "youtube_analytics_v2";
};

type AnalyticsResponse = {
  columnHeaders?: Array<{ name?: string }>;
  rows?: Array<Array<number | string>>;
  error?: { message?: string };
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

function utcDate(daysAgo = 0) {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() - daysAgo);
  return date.toISOString().slice(0, 10);
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

function numberFromAnalyticsRow(
  headers: Array<{ name?: string }>,
  row: Array<number | string>,
  name: string,
) {
  const index = headers.findIndex((header) => header.name === name);
  if (index < 0) return null;
  const value = Number(row[index]);
  return Number.isFinite(value) ? value : null;
}

async function fetchYouTubeAnalytics(accessToken: string): Promise<YouTubeAnalytics> {
  // Analytics data is generally delayed, so use the last 28 complete days.
  const endDate = utcDate(1);
  const startDate = utcDate(28);
  const query = new URLSearchParams({
    ids: "channel==MINE",
    startDate,
    endDate,
    metrics:
      "views,estimatedMinutesWatched,averageViewDuration,subscribersGained,likes,comments",
  });
  const response = await fetch(`https://youtubeanalytics.googleapis.com/v2/reports?${query}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const payload = (await response.json()) as AnalyticsResponse;
  if (!response.ok) {
    throw new Error(payload.error?.message || `YouTube Analytics API returned ${response.status}`);
  }

  const headers = payload.columnHeaders ?? [];
  const row = payload.rows?.[0] ?? [];
  return {
    period_days: 28,
    start_date: startDate,
    end_date: endDate,
    views: numberFromAnalyticsRow(headers, row, "views"),
    estimated_minutes_watched: numberFromAnalyticsRow(
      headers,
      row,
      "estimatedMinutesWatched",
    ),
    average_view_duration_seconds: numberFromAnalyticsRow(
      headers,
      row,
      "averageViewDuration",
    ),
    subscribers_gained: numberFromAnalyticsRow(headers, row, "subscribersGained"),
    likes: numberFromAnalyticsRow(headers, row, "likes"),
    comments: numberFromAnalyticsRow(headers, row, "comments"),
    source: "youtube_analytics_v2",
  };
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
        let analytics: YouTubeAnalytics | null = null;
        let analyticsError: string | null = null;
        if (connection.connection_method === "oauth" && accessToken) {
          try {
            analytics = await fetchYouTubeAnalytics(accessToken);
          } catch (error) {
            // Keep basic channel metrics working while a creator re-authorizes
            // with the Analytics scope or while the API is being enabled.
            analyticsError =
              error instanceof Error ? error.message : "YouTube Analytics unavailable";
            console.warn("sync-social-metrics analytics", connection.id, error);
          }
        }
        const syncedMetrics = {
          ...metrics,
          ...(analytics ? { analytics } : {}),
          ...(analyticsError ? { analytics_error: analyticsError } : {}),
        };
        const syncedAt = new Date().toISOString();

        const { error: updateError } = await supabase
          .from("social_connections")
          .update({
            external_account_id: metrics.account_id,
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
