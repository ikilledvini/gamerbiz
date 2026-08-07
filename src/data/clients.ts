import teamLiquidLogo from "@/assets/team-liquid.png.asset.json";
import furiaLogo from "@/assets/furia.png.asset.json";
import mibrLogo from "@/assets/mibr.png.asset.json";
import imperialLogo from "@/assets/imperial.png.asset.json";
import legacyLogo from "@/assets/legacy-mark.png.asset.json";
import ifoodLogo from "@/assets/ifood.png.asset.json";
import lgLogo from "@/assets/lg.png.asset.json";
import logitechLogo from "@/assets/logitech.png.asset.json";
import xbetWiki from "@/assets/1xbet.png.asset.json";
import adataXpgWiki from "@/assets/adata-xpg.png.asset.json";
import activisionWiki from "@/assets/activision.png.asset.json";
import betanoWiki from "@/assets/betano.png.asset.json";
import caixaEconMicaFederalWiki from "@/assets/caixa-econ-mica-federal.png.asset.json";
import capcomWiki from "@/assets/capcom.png.asset.json";
import corsairWiki from "@/assets/corsair.png.asset.json";
import doveWiki from "@/assets/dove.png.asset.json";
import enebaWiki from "@/assets/eneba.png.asset.json";
import epicGamesWiki from "@/assets/epic-games.png.asset.json";
import gigabyteWiki from "@/assets/gigabyte.png.asset.json";
import gamesirWiki from "@/assets/gamesir.png.asset.json";
import hasbroWiki from "@/assets/hasbro.png.asset.json";
import kabumWiki from "@/assets/kabum.png.asset.json";
import mercadoBitcoinWiki from "@/assets/mercado-bitcoin.png.asset.json";
import operaGxWiki from "@/assets/opera-gx.png.asset.json";
import rebellionWiki from "@/assets/rebellion.png.asset.json";
import riotGamesWiki from "@/assets/riot-games.png.asset.json";
import segaWiki from "@/assets/sega.png.asset.json";
import snkCorporationWiki from "@/assets/snk-corporation.png.asset.json";
import sadiaWiki from "@/assets/sadia.png.asset.json";
import samsungWiki from "@/assets/samsung.png.asset.json";
import shureWiki from "@/assets/shure.png.asset.json";
import tencentGamesWiki from "@/assets/tencent-games.png.asset.json";
import ubisoftWiki from "@/assets/ubisoft.png.asset.json";
import gamersClubLogo from "@/assets/gamers-club.png.asset.json";
import novadaxLogo from "@/assets/novadax.png.asset.json";
import pichauLogo from "@/assets/pichau.png.asset.json";
import exitlagLogo from "@/assets/exitlag.png.asset.json";

export type ClientLogo = {
  name: string;
  slug: string;
  /** Domínio usado para buscar o logo oficial via Logo.dev */
  domain: string | null;
  logo: string | null;
  category: "brand" | "team";
  alt: string;
  forceWhite?: boolean;
};

const BRANDS: Array<[string, string | null]> = [
  ["Riot Games", "riotgames.com"],
  ["Ubisoft", "ubisoft.com"],
  ["Tencent Games", "tencent.com"],
  ["Capcom", "capcom.com"],
  ["Epic Games", "epicgames.com"],
  ["Activision", "activision.com"],
  ["Rebellion", "rebellion.com"],
  ["SEGA", "sega.com"],
  ["SNK Corporation", "snk-corp.co.jp"],
  ["Betano", "betano.com"],
  ["1XBET", "1xbet.com"],
  ["Team Liquid Brazil", "teamliquid.com"],
  ["Imperial Esports", "imperial.gg"],
  ["Gamers Club", "gamersclub.com.br"],
  ["Shure", "shure.com"],
  ["Corsair", "corsair.com"],
  ["GameSir", "gamesir.hk"],
  ["Logitech", "logitech.com"],
  ["GIGABYTE", "gigabyte.com"],
  ["ADATA/XPG", "xpg.com"],
  ["Samsung", "samsung.com"],
  ["LG Electronics", "lg.com"],
  ["Mercado Pago", "mercadopago.com.br"],
  ["Mercado Bitcoin", "mercadobitcoin.com.br"],
  ["NovaDAX", "novadax.com.br"],
  ["iFood", "ifood.com.br"],
  ["Sadia", "sadia.com.br"],
  ["Opera GX", "opera.com"],
  ["Hasbro", "hasbro.com"],
  ["Alares", "alaresinternet.com.br"],
  ["ExitLag", "exitlag.com"],
  ["NoPing", "noping.com"],
  ["Pichau", "pichau.com.br"],
  ["KaBuM!", "kabum.com.br"],
  ["Insider", "insiderstore.com.br"],
  ["Reserva", "usereserva.com"],
  ["Eneba", "eneba.com"],
  ["Dove", "dove.com"],
  ["Caixa Econômica Federal", "caixa.gov.br"],
];

const TEAMS: Array<[string, string | null]> = [
  ["Team Liquid", "teamliquid.com"],
  ["MIBR", "mibr.gg"],
  ["Imperial Esports", "imperial.gg"],
  ["FURIA", "furia.gg"],
  ["ODDIK", "oddik.com.br"],
  ["Legacy", "legacy.gg"],
];

function slugify(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const LOGO_DEV_TOKEN = import.meta.env["VITE_LOVABLE_CONNECTOR_LOGO_DEV_API_KEY"] as
  | string
  | undefined;

export function logoUrl(domain: string | null) {
  if (!domain || !LOGO_DEV_TOKEN) return null;
  return `https://img.logo.dev/${domain}?token=${LOGO_DEV_TOKEN}&size=200&format=png&retina=true&fallback=404&theme=light`;
}

/** Logos oficiais enviados manualmente (PNG transparente) */
const LOGO_OVERRIDES: Record<string, string> = {
  "Team Liquid": teamLiquidLogo.url,
  "Team Liquid Brazil": teamLiquidLogo.url,
  FURIA: furiaLogo.url,
  MIBR: mibrLogo.url,
  "Imperial Esports": imperialLogo.url,
  Legacy: legacyLogo.url,
  "iFood": ifoodLogo.url,
  "LG Electronics": lgLogo.url,
  Logitech: logitechLogo.url,
  "1XBET": xbetWiki.url,
  "ADATA/XPG": adataXpgWiki.url,
  "Activision": activisionWiki.url,
  "Betano": betanoWiki.url,
  "Caixa Econ\u00f4mica Federal": caixaEconMicaFederalWiki.url,
  "Capcom": capcomWiki.url,
  "Corsair": corsairWiki.url,
  "Dove": doveWiki.url,
  "Eneba": enebaWiki.url,
  "Epic Games": epicGamesWiki.url,
  "GIGABYTE": gigabyteWiki.url,
  "GameSir": gamesirWiki.url,
  "Hasbro": hasbroWiki.url,
  "KaBuM!": kabumWiki.url,
  "Mercado Bitcoin": mercadoBitcoinWiki.url,
  "Opera GX": operaGxWiki.url,
  "Rebellion": rebellionWiki.url,
  "Riot Games": riotGamesWiki.url,
  "SEGA": segaWiki.url,
  "SNK Corporation": snkCorporationWiki.url,
  "Sadia": sadiaWiki.url,
  "Samsung": samsungWiki.url,
  "Shure": shureWiki.url,
  "Tencent Games": tencentGamesWiki.url,
  "Ubisoft": ubisoftWiki.url,
  "Gamers Club": gamersClubLogo.url,
  "NovaDAX": novadaxLogo.url,
  "Pichau": pichauLogo.url,
  "ExitLag": exitlagLogo.url,
};

function build(entries: Array<[string, string | null]>, category: "brand" | "team"): ClientLogo[] {
  return entries.map(([name, domain]) => ({
    name,
    slug: `${category}-${slugify(name)}`,
    domain,
    logo: LOGO_OVERRIDES[name] ?? logoUrl(domain),
    category,
    alt: name,
    forceWhite: name === "Activision" || name === "Ubisoft",
  }));
}

export const brandLogos: ClientLogo[] = build(BRANDS, "brand");
export const teamLogos: ClientLogo[] = build(TEAMS, "team");
