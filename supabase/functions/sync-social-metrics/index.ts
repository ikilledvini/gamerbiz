import { createClient } from "npm:@supabase/supabase-js@2";

type SocialConnection = {
  id: string;
  platform: "youtube" | "instagram" | "tiktok" | "twitch" | "twitter";
  handle: string | null;
  external_account_id: string | null;
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

async function fetchYouTubeMetrics(connection: SocialConnection, apiKey: string) {
  const query = new URLSearchParams({
    part: "statistics",
    key: apiKey,
  });

  if (connection.external_account_id) {
    query.set("id", connection.external_account_id);
  } else if (connection.handle) {
    query.set("forHandle", connection.handle.replace(/^@/, ""));
  } else {
    throw new Error("YouTube connection has neither an account ID nor a handle");
  }

  const response = await fetch(`https://www.googleapis.com/youtube/v3/channels?${query}`);
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

    const youtubeApiKey = requiredSecret("YOUTUBE_API_KEY");
    const { data, error } = await supabase
      .from("social_connections")
      .select("id, platform, handle, external_account_id")
      .eq("platform", "youtube")
      .eq("sync_enabled", true);

    if (error) throw error;

    const results: Array<{ id: string; ok: boolean; error?: string }> = [];

    for (const connection of (data ?? []) as SocialConnection[]) {
      try {
        const metrics = await fetchYouTubeMetrics(connection, youtubeApiKey);
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
