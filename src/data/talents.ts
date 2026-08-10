import { TALENT_IMAGES } from "./talent-images";
import { toSlug } from "@/lib/slug";

export type PublishStatus = "draft" | "published" | "hidden";

export type Talent = {
  id: string;
  slug: string;
  firstName?: string;
  stageName: string;
  username: string | null;
  category: string;
  shortDescription: string;
  relationship: "gamerbiz-talent" | "creator-parceiro" | null;
  status: PublishStatus;
  city: string | null;
  image: string | null;
  mediaKitUrl: string | null;
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
export const talents: Talent[] = TALENT_NAMES.map((stageName, index) => {
  const image = TALENT_IMAGES[stageName] ?? null;
  return {
    id: `talent-${String(index + 1).padStart(2, "0")}`,
    slug: toSlug(stageName),
    stageName,
    username: null,
    category: TALENT_CATEGORIES[stageName] ?? "Multigame",
    shortDescription: "",
    relationship: null,
    status: image ? ("published" as const) : ("draft" as const),
    city: null,
    image,
    mediaKitUrl: null,
  };
});

export const publishedTalents = talents.filter((t) => t.status === "published");

export function getTalentBySlug(slug: string) {
  return talents.find((t) => t.slug === slug) ?? null;
}


