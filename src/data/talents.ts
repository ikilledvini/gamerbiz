import { TALENT_IMAGES } from "./talent-images";
import { toSlug } from "@/lib/slug";

export type PublishStatus = "draft" | "published" | "hidden";

export type AnalyticsPoint = { label: string; value: number };

export type VideoInteractionPoint = {
  label: string;
  likes: number;
  comments: number;
  shares: number;
};

export type PlatformAnalytics = {
  metrics?: { label: string; value: string }[];
  dailyViews?: AnalyticsPoint[];
  age?: AnalyticsPoint[];
  gender?: AnalyticsPoint[];
  countries?: AnalyticsPoint[];
  languages?: AnalyticsPoint[];
  videoInteractions?: VideoInteractionPoint[];
};

export type TalentAnalytics = {
  summary?: PlatformAnalytics | null;
  youtube?: PlatformAnalytics | null;
  instagram?: PlatformAnalytics | null;
  tiktok?: PlatformAnalytics | null;
};

export type SocialPlatform = "youtube" | "instagram" | "tiktok" | "twitch" | "twitter";

export type SyncedYouTubeAnalytics = {
  periodDays: number;
  startDate: string;
  endDate: string;
  views: number | null;
  estimatedMinutesWatched: number | null;
  averageViewDurationSeconds: number | null;
  subscribersGained: number | null;
  likes: number | null;
  comments: number | null;
  averageViews: number | null;
  analyzedVideoCount: number;
  dailyViews: AnalyticsPoint[];
  countries: AnalyticsPoint[];
  age: AnalyticsPoint[];
  gender: AnalyticsPoint[];
};

export type SyncedTikTokAnalytics = {
  analyzedVideoCount: number;
  averageViews: number | null;
  totalViews: number | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;
  videos: Array<{
    id: string;
    createdAt: string | null;
    views: number;
    likes: number;
    comments: number;
    shares: number;
  }>;
};

export type SyncedSocialMetrics = {
  accountId: string | null;
  subscribers: number | null;
  totalViews: number | null;
  videoCount: number | null;
  averageViews?: number | null;
  analytics?: SyncedYouTubeAnalytics | null;
  tiktokAnalytics?: SyncedTikTokAnalytics | null;
  analyticsError?: string | null;
  lastSyncedAt: string | null;
  lastSyncError: string | null;
};

export type Talent = {
  id: string;
  slug: string;
  firstName?: string;
  stageName: string;
  username: string | null;
  category: string;
  categories: string[];
  shortDescription: string;
  relationship: "gamerbiz-talent" | "creator-parceiro" | null;
  status: PublishStatus;
  city: string | null;
  image: string | null;
  mediaKitUrl: string | null;
  socials: {
    instagram: string | null;
    tiktok: string | null;
    youtube: string | null;
    twitch: string | null;
    twitter: string | null;
  };
  stats: {
    followers: string | null;
    avgViews: string | null;
    engagement: string | null;
    audience: string | null;
  };
  achievements: string | null;
  contactEmail: string | null;
  analytics?: TalentAnalytics | null;
  socialMetrics?: Partial<Record<SocialPlatform, SyncedSocialMetrics>> | null;
};

const TALENT_NAMES = [
  "Nofaxu",
  "Thalera",
  "Frogman1",
  "Speed",
  "Ralisco",
  "Bladexzd",
  "legacyz1n",
  "Dubblez",
  "chicoimitador",
  "Vitto",
  "Vett",
  "OsuperWil",
  "Revmpt",
  "LuBu",
  "Colosso",
  "Nitrao",
  "CALURA9",
  "CerealForMe",
  "darkmoonknit",
  "Breitnerro",
  "NiMayumii",
  "ClaritySnicket",
  "IsaBrittis",
  "StarShimas",
  "Daniel_Gallante",
  "bennettarcontepyro",
  "Beletz",
  "RayDiva",
  "JoaoPdzin",
  "Celinett",
  "LuCroft",
  "Spok",
  "fbarreto",
  "giann",
  "jatozord",
  "nxghtt",
  "Ciber",
  "DobZ",
  "MagnumOfSpades",
  "Chonky",
  "oiLaris",
  "BiaGomez",
  "SpiderKong",
  "Panettoni",
  "Nivyzera",
  "GeoPasch",
  "Tetéia",
] as const;

const TALENT_CATEGORIES: Record<string, string> = {
  Nofaxu: "Minecraft",
  Thalera: "Mangá/Anime + Pokémon",
  Frogman1: "PUBG",
  Speed: "Mortal Kombat",
  Ralisco: "Arena Breakout",
  Bladexzd: "Call of Duty",
  legacyz1n: "Call of Duty + Counter-Strike 2",
  Dubblez: "Call of Duty + Valorant",
  chicoimitador: "Counter-Strike 2",
  Vitto: "Counter-Strike 2",
  Vett: "Point Blank",
  OsuperWil: "Valorant",
  Revmpt: "Valorant",
  LuBu: "Marvel Rivals",
  Colosso: "Marvel Rivals + Multigame",
  Nitrao: "Overwatch + Marvel Rivals",
  CALURA9: "Dead by Daylight",
  CerealForMe: "Dead by Daylight",
  darkmoonknit: "Dead by Daylight",
  Breitnerro: "League of Legends",
  NiMayumii: "League of Legends + Just Chatting",
  ClaritySnicket: "League of Legends + Wild Rift",
  IsaBrittis: "Anime/Geek + League of Legends",
  StarShimas: "Brawl Stars",
  Daniel_Gallante: "Diablo",
  bennettarcontepyro: "Genshin Impact",
  Beletz: "Roblox",
  RayDiva: "Roblox",
  JoaoPdzin: "Roblox + Brawl Stars",
  Celinett: "GTA V + Minecraft",
  LuCroft: "GTA V + Red Dead Redemption",
  Spok: "Minecraft + Roblox",
  fbarreto: "EAFC",
  giann: "Rocket League",
  jatozord: "Rocket League",
  nxghtt: "Rocket League",
  Ciber: "Rocket League + Brawl Stars",
  DobZ: "Teamfight Tactics",
  MagnumOfSpades: "Don't Starve",
  Chonky: "Multigame",
  oiLaris: "Multigame",
  BiaGomez: "Multigame + Counter-Strike 2",
  SpiderKong: "Multigame + EAFC",
  Panettoni: "Multigame + Pokémon",
  Nivyzera: "Multigame + Valorant",
};

// Dados reais apenas. Campos ainda não fornecidos pela Gamerbiz ficam nulos
// e serão preenchidos no painel interno (etapa seguinte).
// Um perfil só é publicado quando já possui foto real cadastrada.
function splitCategories(value: string): string[] {
  return value
    .split("+")
    .map((part) => part.trim())
    .filter(Boolean);
}

export const talents: Talent[] = TALENT_NAMES.map((stageName, index) => {
  const image = TALENT_IMAGES[stageName] ?? null;
  return {
    id: `talent-${String(index + 1).padStart(2, "0")}`,
    slug: toSlug(stageName),
    stageName,
    username: null,
    category: TALENT_CATEGORIES[stageName] ?? "Multigame",
    categories: splitCategories(TALENT_CATEGORIES[stageName] ?? "Multigame"),
    shortDescription: "",
    relationship: null,
    status: image ? ("published" as const) : ("draft" as const),
    city: null,
    image,
    mediaKitUrl: null,
    socials: { instagram: null, tiktok: null, youtube: null, twitch: null, twitter: null },
    stats: { followers: null, avgViews: null, engagement: null, audience: null },
    achievements: null,
    contactEmail: null,
  };
});

export const publishedTalents = talents.filter((t) => t.status === "published");

export function getTalentBySlug(slug: string) {
  return talents.find((t) => t.slug === slug) ?? null;
}

export const talentCategories = Array.from(
  new Set(talents.filter((t) => t.status === "published").flatMap((t) => t.categories)),
).sort((a, b) => a.localeCompare(b, "pt-BR"));

// Agrupamento macro usado APENAS no filtro do diretório.
// A categoria exibida em cada card continua sendo a original.
const CATEGORY_GROUPS: Record<string, string> = {
  "Call of Duty": "FPS",
  "Counter-Strike 2": "FPS",
  Valorant: "FPS",
  PUBG: "FPS",
  "Arena Breakout": "FPS",
  "Point Blank": "FPS",
  Overwatch: "Hero Shooter",
  "Marvel Rivals": "Hero Shooter",
  "League of Legends": "MOBA",
  "Wild Rift": "MOBA",
  "Teamfight Tactics": "MOBA",
  Minecraft: "Sandbox",
  Roblox: "Sandbox",
  "GTA V": "Mundo Aberto",
  "Red Dead Redemption": "Mundo Aberto",
  EAFC: "Esportes",
  "Rocket League": "Esportes",
  "Dead by Daylight": "Terror & Survival",
  "Don't Starve": "Terror & Survival",
  "Genshin Impact": "RPG & Anime",
  Diablo: "RPG & Anime",
  "Mangá/Anime": "RPG & Anime",
  "Anime/Geek": "RPG & Anime",
  Pokémon: "RPG & Anime",
  "Mortal Kombat": "Luta",
  "Brawl Stars": "Casual & Mobile",
  Multigame: "Variedades",
  "Just Chatting": "Variedades",
};

export function getTalentCategoryGroups(talent: Talent): string[] {
  return Array.from(new Set(talent.categories.map((c) => CATEGORY_GROUPS[c] ?? c)));
}

export const talentCategoryGroups = Array.from(
  new Set(
    talents.filter((t) => t.status === "published").flatMap((t) => getTalentCategoryGroups(t)),
  ),
).sort((a, b) => a.localeCompare(b, "pt-BR"));
