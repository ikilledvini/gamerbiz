import { TALENT_IMAGES } from "@/data/talent-images";
import type { PublishStatus, Talent, TalentAnalytics } from "@/data/talents";

export type TalentRow = {
  id: string;
  slug: string;
  stage_name: string;
  username: string | null;
  category: string;
  city: string | null;
  bio: string | null;
  image_url: string | null;
  media_kit_url: string | null;
  status: PublishStatus;
  sort_order: number;
  instagram_url: string | null;
  tiktok_url: string | null;
  youtube_url: string | null;
  twitch_url: string | null;
  twitter_url: string | null;
  followers: string | null;
  avg_views: string | null;
  engagement: string | null;
  audience: string | null;
  achievements: string | null;
  contact_email: string | null;
  analytics?: TalentAnalytics | null;
};

export function splitCategories(value: string): string[] {
  return value
    .split("+")
    .map((part) => part.trim())
    .filter(Boolean);
}

/** Converte a linha do banco no formato usado pelos componentes públicos. */
export function mapTalentRow(row: TalentRow): Talent {
  const category = row.category || "Multigame";
  return {
    id: row.id,
    slug: row.slug,
    stageName: row.stage_name,
    username: row.username,
    category,
    categories: splitCategories(category),
    shortDescription: row.bio ?? "",
    relationship: null,
    status: row.status,
    city: row.city,
    image: row.image_url ?? TALENT_IMAGES[row.stage_name] ?? null,
    mediaKitUrl: row.media_kit_url,
    socials: {
      instagram: row.instagram_url ?? null,
      tiktok: row.tiktok_url ?? null,
      youtube: row.youtube_url ?? null,
      twitch: row.twitch_url ?? null,
      twitter: row.twitter_url ?? null,
    },
    stats: {
      followers: row.followers ?? null,
      avgViews: row.avg_views ?? null,
      engagement: row.engagement ?? null,
      audience: row.audience ?? null,
    },
    achievements: row.achievements ?? null,
    contactEmail: row.contact_email ?? null,
    analytics: row.analytics ?? null,
  };
}

export const TALENT_COLUMNS =
  "id, slug, stage_name, username, category, city, bio, image_url, media_kit_url, status, sort_order, instagram_url, tiktok_url, youtube_url, twitch_url, twitter_url, followers, avg_views, engagement, audience, achievements, contact_email, analytics";
