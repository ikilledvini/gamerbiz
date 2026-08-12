import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";
import { TALENT_COLUMNS, mapTalentRow, type TalentRow } from "@/lib/talent-mapper";
import type { SocialPlatform, SyncedSocialMetrics, SyncedYouTubeAnalytics } from "@/data/talents";

type SocialConnectionRow = {
  talent_id: string;
  platform: SocialPlatform;
  profile_url: string | null;
  connection_method: string;
  connection_status: string;
  current_metrics: Database["public"]["Tables"]["social_connections"]["Row"]["current_metrics"];
  last_synced_at: string | null;
  last_sync_error: string | null;
};

function metricNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function analyticsPoints(value: unknown, labelKey: string, valueKey: string) {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) return [];
    const row = entry as Record<string, unknown>;
    const label = row[labelKey];
    const pointValue = metricNumber(row[valueKey]);
    return typeof label === "string" && pointValue !== null ? [{ label, value: pointValue }] : [];
  });
}

function mapYouTubeAnalytics(value: unknown): SyncedYouTubeAnalytics | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const analytics = value as Record<string, unknown>;
  if (typeof analytics["source"] !== "string") return null;
  return {
    periodDays: metricNumber(analytics["period_days"]) ?? 28,
    startDate: typeof analytics["start_date"] === "string" ? analytics["start_date"] : "",
    endDate: typeof analytics["end_date"] === "string" ? analytics["end_date"] : "",
    views: metricNumber(analytics["views"]),
    estimatedMinutesWatched: metricNumber(analytics["estimated_minutes_watched"]),
    averageViewDurationSeconds: metricNumber(analytics["average_view_duration_seconds"]),
    subscribersGained: metricNumber(analytics["subscribers_gained"]),
    likes: metricNumber(analytics["likes"]),
    comments: metricNumber(analytics["comments"]),
    averageViews: metricNumber(analytics["average_views"]),
    analyzedVideoCount: metricNumber(analytics["analyzed_video_count"]) ?? 0,
    dailyViews: analyticsPoints(analytics["daily_views"], "date", "views"),
    countries: analyticsPoints(analytics["countries"], "country", "percentage"),
    age: analyticsPoints(analytics["age"], "age_group", "percentage"),
    gender: analyticsPoints(analytics["gender"], "gender", "percentage"),
  };
}

function mapSocialMetrics(row: SocialConnectionRow): SyncedSocialMetrics {
  const metrics =
    row.current_metrics &&
    typeof row.current_metrics === "object" &&
    !Array.isArray(row.current_metrics)
      ? row.current_metrics
      : {};

  return {
    accountId: typeof metrics["account_id"] === "string" ? metrics["account_id"] : null,
    subscribers: metricNumber(metrics["subscribers"]),
    totalViews: metricNumber(metrics["total_views"]),
    videoCount: metricNumber(metrics["video_count"]),
    analytics: mapYouTubeAnalytics(metrics["analytics"]),
    analyticsError:
      typeof metrics["analytics_error"] === "string" ? metrics["analytics_error"] : null,
    lastSyncedAt: row.last_synced_at,
    lastSyncError: row.last_sync_error,
  };
}

type TalentInput = {
  id?: string | null;
  slug: string;
  stage_name: string;
  username: string | null;
  category: string;
  city: string | null;
  bio: string | null;
  image_url: string | null;
  media_kit_url: string | null;
  status: "draft" | "published" | "hidden";
  sort_order: number;
  achievements: string | null;
  contact_email: string | null;
};

function serverPublicClient() {
  // Lovable injects the VITE_* variables into the published SSR bundle. Prefer
  // those values so server loaders use the same Supabase project as the browser.
  const url = import.meta.env["VITE_SUPABASE_URL"] || process.env["SUPABASE_URL"];
  const key =
    import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] || process.env["SUPABASE_PUBLISHABLE_KEY"];

  if (!url || !key) {
    throw new Error("Supabase public connection is not configured for the published site.");
  }

  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

function isMissingOptionalSocialMetricsTable(error: { code?: string; message?: string }) {
  const message = `${error.code ?? ""} ${error.message ?? ""}`.toLowerCase();
  return (
    error.code === "PGRST205" ||
    (message.includes("public.social_connections") && message.includes("schema cache"))
  );
}

/** Lista pública: apenas talentos publicados. */
export const listPublicTalents = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = serverPublicClient();
  const { data, error } = await supabase
    .from("talents")
    .select(TALENT_COLUMNS)
    .eq("status", "published")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);

  const rows = (data ?? []) as TalentRow[];
  if (rows.length === 0) return [];

  const { data: socialData, error: socialError } = await supabase
    .from("social_connections")
    .select(
      "talent_id, platform, profile_url, connection_method, connection_status, current_metrics, last_synced_at, last_sync_error",
    )
    .in(
      "talent_id",
      rows.map((row) => row.id),
    );
  // Social metrics are an enhancement for public Media Kits. If a newly
  // published Lovable environment has not refreshed PostgREST's schema cache
  // yet, keep the directory and profiles available without those metrics.
  if (socialError && !isMissingOptionalSocialMetricsTable(socialError)) {
    throw new Error(socialError.message);
  }

  const metricsByTalent = new Map<string, Partial<Record<SocialPlatform, SyncedSocialMetrics>>>();
  const profilesByTalent = new Map<string, Partial<Record<SocialPlatform, string>>>();
  for (const connection of (socialData ?? []) as SocialConnectionRow[]) {
    if (connection.connection_method !== "oauth" || connection.connection_status !== "connected") {
      continue;
    }
    const talentMetrics = metricsByTalent.get(connection.talent_id) ?? {};
    talentMetrics[connection.platform] = mapSocialMetrics(connection);
    metricsByTalent.set(connection.talent_id, talentMetrics);
    if (connection.profile_url) {
      const talentProfiles = profilesByTalent.get(connection.talent_id) ?? {};
      talentProfiles[connection.platform] = connection.profile_url;
      profilesByTalent.set(connection.talent_id, talentProfiles);
    }
  }

  return rows.map((row) => {
    const talent = mapTalentRow(row);
    const profiles = profilesByTalent.get(row.id) ?? {};
    return {
      ...talent,
      socials: {
        instagram: profiles.instagram ?? null,
        tiktok: profiles.tiktok ?? null,
        youtube: profiles.youtube ?? null,
        twitch: profiles.twitch ?? null,
        twitter: profiles.twitter ?? null,
      },
      socialMetrics: metricsByTalent.get(row.id) ?? null,
    };
  });
});

/** Lista completa (admin), incluindo rascunhos e ocultos. */
export const adminListTalents = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("talents")
      .select(TALENT_COLUMNS)
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []) as TalentRow[];
  });

export const adminIsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    return { isAdmin: Boolean(data) };
  });

export const adminSaveTalent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: TalentInput) => input)
  .handler(async ({ data, context }) => {
    const { id, ...values } = data;
    const query = id
      ? context.supabase.from("talents").update(values).eq("id", id)
      : context.supabase.from("talents").insert(values);
    const { error } = await query;
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminReorderTalents = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { ids: string[] }) => input)
  .handler(async ({ data, context }) => {
    for (const [index, id] of data.ids.entries()) {
      const { error } = await context.supabase
        .from("talents")
        .update({ sort_order: index + 1 })
        .eq("id", id);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const adminDeleteTalent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("talents").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
