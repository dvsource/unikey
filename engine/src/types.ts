export type Height = 1 | 2 | 3;
export type CardOption = { correct: boolean; tag?: string };
export type Card = {
  id: string; skill: string; section: string; height: Height; poolId?: string;
  noteRef?: string; variants: CardOption[][];
};
export type SkillDef = {
  id: string; unit: string; topic: string; section: string; weight: number;
  requires: string[]; helps: string[]; cards: Record<Height, string[]>; name: string;
};
export type SectionDef = { id: string; unit: string; topic: string; name: string; skills: string[]; weight: number };
export type Content = {
  cards: Record<string, Card>;
  skills: Record<string, SkillDef>;
  sections: Record<string, SectionDef>;
  topics: Record<string, { id: string; unit: string; sections: string[] }>;
};
