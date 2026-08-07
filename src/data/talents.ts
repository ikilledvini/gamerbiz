export type Talent = {
  id: string;
  firstName?: string;
  stageName: string;
  category: string;
  shortDescription: string;
  relationship: "gamerbiz-talent" | "creator-parceiro" | null;
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
] as const;

// TODO: substituir category, shortDescription, relationship, image e mediaKitUrl
// pelos dados oficiais da Gamerbiz quando forem fornecidos.
export const talents: Talent[] = TALENT_NAMES.map((stageName, index) => ({
  id: `talent-${String(index + 1).padStart(2, "0")}`,
  stageName,
  category: "[NICHO / CATEGORIA]",
  shortDescription: "[DESCRIÇÃO CURTA]",
  relationship: null,
  image: null,
  mediaKitUrl: null,
}));
