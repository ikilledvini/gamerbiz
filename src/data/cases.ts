export type CaseStudy = {
  id: string;
  featured: boolean;
  resultValue: string;
};

export const cases: CaseStudy[] = [
  { id: "vittozao-brskins", featured: true, resultValue: "R$ 2.78M" },
  { id: "dubblez-fate-trigger", featured: false, resultValue: "Top" },
  { id: "bladexzd", featured: false, resultValue: "Alta" },
];
