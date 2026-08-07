export type ClientLogo = {
  name: string;
  slug: string;
  /** Domínio usado para buscar o logo oficial via Logo.dev */
  domain: string | null;
  logo: string | null;
  category: "brand" | "team";
  alt: string;
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
  return `https://img.logo.dev/${domain}?token=${LOGO_DEV_TOKEN}&size=200&format=png&retina=true`;
}

function build(entries: Array<[string, string | null]>, category: "brand" | "team"): ClientLogo[] {
  return entries.map(([name, domain]) => ({
    name,
    slug: `${category}-${slugify(name)}`,
    domain,
    logo: logoUrl(domain),
    category,
    alt: name,
  }));
}

export const brandLogos: ClientLogo[] = build(BRANDS, "brand");
export const teamLogos: ClientLogo[] = build(TEAMS, "team");
