export type ClientLogo = {
  name: string;
  slug: string;
  /** TODO: substituir pelo arquivo oficial em public/assets/{brands|teams}/<slug>.svg */
  logo: string | null;
  category: "brand" | "team";
  alt: string;
};

const BRAND_NAMES = [
  "Riot Games",
  "Ubisoft",
  "Tencent Games",
  "Capcom",
  "Epic Games",
  "Activision",
  "Rebellion",
  "SEGA",
  "SNK Corporation",
  "Betano",
  "1XBET",
  "Team Liquid Brazil",
  "Imperial Esports",
  "Gamers Club",
  "Shure",
  "Corsair",
  "GameSir",
  "Logitech",
  "GIGABYTE",
  "ADATA/XPG",
  "Samsung",
  "LG Electronics",
  "Mercado Pago",
  "Mercado Bitcoin",
  "NovaDAX",
  "iFood",
  "Sadia",
  "Opera GX",
  "Hasbro",
  "Alares",
  "ExitLag",
  "NoPing",
  "Pichau",
  "KaBuM!",
  "Insider",
  "Reserva",
  "Eneba",
  "Dove",
  "Caixa Econômica Federal",
] as const;

const TEAM_NAMES = [
  "Team Liquid",
  "MIBR",
  "Imperial Esports",
  "FURIA",
  "ODDIK",
  "Legacy",
] as const;

function slugify(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export const brandLogos: ClientLogo[] = BRAND_NAMES.map((name) => ({
  name,
  slug: slugify(name),
  logo: null,
  category: "brand",
  alt: name,
}));

export const teamLogos: ClientLogo[] = TEAM_NAMES.map((name) => ({
  name,
  slug: slugify(name),
  logo: null,
  category: "team",
  alt: name,
}));
