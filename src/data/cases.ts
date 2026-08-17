export type CaseStudy = {
  id: string;
  featured: boolean;
  resultValue: string;
  href?: string;
  imageUrl?: string;
  imageAlt?: string;
};

export const cases: CaseStudy[] = [
  { id: "vittozao-brskins", featured: false, resultValue: "R$ 2.78M" },
  { id: "dubblez-fate-trigger", featured: false, resultValue: "Top" },
  {
    id: "bladexzd",
    featured: true,
    resultValue: "125,5 mil",
    href: "/blogs/bladexzd-gamesir",
    imageUrl: "https://sa-east-1.graphassets.com/AosAnUDNpTw6wZCHJ4g7xz/cmmixw2np1evn07lxna8eapn2",
    imageAlt:
      "Bladexzd apresenta o controle GameSir G7 Pro durante uma partida de Call of Duty: Warzone",
  },
];
