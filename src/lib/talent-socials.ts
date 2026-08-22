import { getTalentSocialLinks } from "@/data/talent-social-links";
import type { Talent } from "@/data/talents";

type Socials = Talent["socials"];

/**
 * Completa os links sociais de um talento com os links cadastrados manualmente.
 * Valores vindos do banco sempre têm prioridade.
 */
export function withManualSocials(
  stageName: string,
  socials: Socials,
  ...aliases: (string | null | undefined)[]
): Socials {
  const manual = getTalentSocialLinks(stageName, ...aliases);
  if (!manual) return socials;
  return {
    instagram: socials.instagram ?? manual.instagram ?? null,
    tiktok: socials.tiktok ?? manual.tiktok ?? null,
    youtube: socials.youtube ?? manual.youtube ?? null,
    twitch: socials.twitch ?? manual.twitch ?? null,
    twitter: socials.twitter ?? manual.twitter ?? null,
    youtube2: socials.youtube2 ?? manual.youtube2 ?? null,
    kick: socials.kick ?? manual.kick ?? null,
  };
}

export type SocialEntry = {
  key: string;
  platform: "instagram" | "youtube" | "tiktok" | "twitter" | "twitch" | "kick";
  label: string;
  url: string;
  handle: string;
};

const PLATFORM_LABEL: Record<SocialEntry["platform"], string> = {
  instagram: "Instagram",
  youtube: "YouTube",
  tiktok: "TikTok",
  twitter: "X",
  twitch: "Twitch",
  kick: "Kick",
};

export function socialHandle(url: string) {
  try {
    const parsed = new URL(url);
    const path = parsed.pathname.replace(/\/+$/, "").split("/").filter(Boolean).pop();
    return path ? `@${path.replace(/^@/, "")}` : parsed.hostname;
  } catch {
    return url;
  }
}

/** Lista ordenada de redes com link válido, pronta para renderizar. */
export function socialEntries(socials: Socials): SocialEntry[] {
  const rows: { key: string; platform: SocialEntry["platform"]; url: string | null | undefined }[] =
    [
      { key: "instagram", platform: "instagram", url: socials.instagram },
      { key: "youtube", platform: "youtube", url: socials.youtube },
      { key: "youtube2", platform: "youtube", url: socials.youtube2 },
      { key: "tiktok", platform: "tiktok", url: socials.tiktok },
      { key: "twitter", platform: "twitter", url: socials.twitter },
      { key: "twitch", platform: "twitch", url: socials.twitch },
      { key: "kick", platform: "kick", url: socials.kick },
    ];

  return rows
    .filter((row): row is typeof row & { url: string } => Boolean(row.url))
    .map((row) => ({
      key: row.key,
      platform: row.platform,
      label: PLATFORM_LABEL[row.platform],
      url: row.url,
      handle: socialHandle(row.url),
    }));
}
