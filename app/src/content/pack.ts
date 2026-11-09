import { packs as rawPacks, tags as rawTags } from "../../assets/content";

// Shapes written by scripts/build-content.mjs.

export type Lang = { en: string; si?: string };

export type Option = {
  text: Lang;
  correct: boolean;
  tag?: string;
  detail?: Lang;
  svg?: string;
};

export type Figure = { svg?: string; engine?: string; params?: Record<string, number> };

export type Variant = {
  vid: string | null;
  values?: Record<string, number | string>;
  stem: Lang;
  figure: Figure | null;
  options: Option[];
};

export type Item = {
  id: string;
  kind: "card" | "pool" | "template" | "bank";
  pool_id?: string;
  version: number;
  status: string;
  layer: "L1" | "L2" | "L3" | "L4";
  form: string;
  skills: string[];
  difficulty: number;
  source_ref: string;
  constants: Record<string, number>;
  explanation: Lang;
  n_variants?: number;
  examples?: number[];
  variants: Variant[];
  pack: string;
  spec_version: string;
};

export type Skill = { id: string; name: Lang; type: string; pack: string };

export type Pack = {
  id: string;
  unit: { id: string; name_en: string; name_si: string };
  spec_version: string;
  status: string;
  built_at: string;
  skills: Skill[];
  items: Item[];
};

export type Tag = { group: string; meaning: string; message: Lang; proposed?: boolean };

export const packs: Pack[] = rawPacks.map((p: Pack) => ({
  ...p,
  skills: p.skills.map((s) => ({ ...s, pack: p.id })),
  items: p.items.map((it) => ({ ...it, pack: p.id, spec_version: p.spec_version })),
}));
export const tags: Record<string, Tag> = rawTags;

// All items across packs, in play order (packs in config order, then skill, then layer).
export const items: Item[] = packs.flatMap((p) => p.items);
export const skills: Skill[] = packs.flatMap((p) => p.skills);

const itemById = new Map(items.map((it) => [it.id, it]));
const skillById = new Map(skills.map((s) => [s.id, s]));

export const getItem = (id: string) => itemById.get(id);
export const getSkill = (id: string) => skillById.get(id);
export const itemsForSkill = (skillId: string) => items.filter((it) => it.skills[0] === skillId);
export const getPack = (id: string) => packs.find((p) => p.id === id);
// The unit the student has picked; an empty or unknown setting means the first pack.
export const currentPack = (unit: string) => getPack(unit) ?? packs[0];

// The variant a student plays by default, and the ones a reviewer steps through
// (the same examples review.md shows, so marks line up with the review doc).
export function reviewVariants(item: Item): number[] {
  return item.examples?.length ? item.examples : [0];
}

export function pick(text: Lang | undefined, lang: "si" | "en" = "si") {
  if (!text) return "";
  return lang === "si" ? text.si ?? text.en : text.en;
}

// What the student sees after picking a wrong option: the option's own detail,
// else the tag's student message (§7).
export function mistakeMessage(o: Option): { text: Lang; group?: string; proposed?: boolean } | null {
  if (!o.tag) return null;
  const t = tags[o.tag];
  if (o.detail) return { text: o.detail, group: t?.group };
  if (t) return { text: t.message, group: t.group, proposed: t.proposed };
  return null;
}

export const layerLabel: Record<Item["layer"], string> = {
  L1: "Recall",
  L2: "Concept",
  L3: "Which method?",
  L4: "Problem",
};

export function constantsLine(c: Record<string, number>) {
  const units: Record<string, string> = { g: "m s⁻²" };
  return Object.entries(c)
    .map(([k, v]) => (k === "pi" ? `π ≈ ${v}` : `${k} = ${v}${units[k] ? " " + units[k] : ""}`))
    .join(" · ");
}
