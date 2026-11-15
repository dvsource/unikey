import { defaultConfig } from "./config.js";
import type { Card, Content, Height, SectionDef, SkillDef } from "./types.js";

// Only the fields of app/assets/content/packs/*.json that the engine reads.
export type RawPack = {
  id: string;
  unit: { id: string };
  graph?: {
    skills: { id: string; topic: string; subtopic: string; weight: number; name: { en: string } }[];
    edges: { type: string; from: string; to: string }[];
  } | null;
  items: {
    id: string; pool_id?: string; layer: "L1" | "L2" | "L3" | "L4"; form: string; skills: string[];
    variants: { options: { correct: boolean; tag?: string }[] }[];
  }[];
};

function heightOf(layer: string, form: string): Height {
  if (layer === "L1") return 1;
  if (layer === "L2" && form === "F10") return 1;
  if (layer === "L4") return 3;
  return 2;
}

/**
 * The engine's content from built packs. Every pack needs its skill graph (F7: a pack without one is an error, not
 * skipped). `exclude`: card ids left out (default `content.exclude` of the config, F8).
 */
export function buildContent(
  packs: RawPack[], noteRefs: Record<string, string> = {}, exclude: readonly string[] = defaultConfig.content.exclude,
): Content {
  const out: Content = { cards: {}, skills: {}, sections: {}, topics: {} };
  const skip = new Set(exclude);
  for (const pack of packs) {
    const g = pack.graph;
    if (!g) throw new Error(`pack ${pack.id} has no skill graph`);
    const unit = pack.unit.id;
    for (const s of g.skills) {
      const section = `${s.topic}/${s.subtopic}`;
      const def: SkillDef = {
        id: s.id, unit, topic: s.topic, section, weight: s.weight,
        requires: g.edges.filter(e => e.type === "requires" && e.from === s.id).map(e => e.to),
        helps: g.edges.filter(e => e.type === "helps" && (e.from === s.id || e.to === s.id))
          .map(e => (e.from === s.id ? e.to : e.from)),
        cards: { 1: [], 2: [], 3: [] }, name: s.name.en,
      };
      out.skills[s.id] = def;
      const sec: SectionDef = out.sections[section] ??
        (out.sections[section] = { id: section, unit, topic: s.topic, name: s.subtopic, skills: [], weight: 0 });
      sec.skills.push(s.id);
      sec.weight += s.weight;
      const top = out.topics[s.topic] ?? (out.topics[s.topic] = { id: s.topic, unit, sections: [] });
      if (!top.sections.includes(section)) top.sections.push(section);
    }
    for (const it of pack.items) {
      const skill = out.skills[it.skills[0]];
      if (!skill || skip.has(it.id)) continue;
      const card: Card = {
        id: it.id, skill: skill.id, section: skill.section, height: heightOf(it.layer, it.form),
        variants: it.variants.map(v => v.options.map(o => (o.tag === undefined ? { correct: o.correct } : { correct: o.correct, tag: o.tag }))),
      };
      if (it.pool_id !== undefined) card.poolId = it.pool_id;
      if (noteRefs[it.id] !== undefined) card.noteRef = noteRefs[it.id];
      out.cards[card.id] = card;
      skill.cards[card.height].push(card.id);
    }
  }
  return out;
}
