import { TALENT_IMAGES } from "@/data/talent-images";
import type { PublishStatus, Talent } from "@/data/talents";

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
  };
}

export const TALENT_COLUMNS =
  "id, slug, stage_name, username, category, city, bio, image_url, media_kit_url, status, sort_order";
