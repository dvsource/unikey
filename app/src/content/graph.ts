import { getPack, getSkill, Item, itemsForSkill, Lang, packs } from "./pack";

// The typed skill graph per unit (DR-0022), as bundled by build-content.mjs, and
// the prototype's stand-in for a mastery model. There is no scheduler yet, so a
// skill's state comes only from this phone's answers to the sample items.

export type GraphSkill = {
  id: string;
  topic: string;
  subtopic: string;
  ref: string;
  type: string;
  mastery: "practised" | "inferred" | string;
  minutes: number;
  name: Lang;
  exam: { primary: number; secondary: number };
  weight: number; // share of the unit's exam weight (sums to 1)
};
export type Topic = { id: string; ref: string; name: Lang; exam_share: number };
export type Edge = { type: "requires" | "encompasses" | "confusable" | "helps"; from: string; to: string; weight?: number };
export type Graph = {
  status: string;
  exam_note?: string;
  topics: Topic[];
  skills: GraphSkill[];
  outside: { id: string; name: Lang; ref: string | null }[];
  edges: Edge[];
};

export type SkillState = "mastered" | "practising" | "refresh" | "new" | "inferred" | "none";
type Answers = Record<string, { correct: boolean }>;

const graphs = new Map(packs.filter((p) => p.graph).map((p) => [p.id, p.graph as Graph]));
const nodeById = new Map<string, GraphSkill>();
const outsideById = new Map<string, { name: Lang }>();
const edges: Edge[] = [];
for (const g of graphs.values()) {
  for (const s of g.skills) nodeById.set(s.id, s);
  for (const o of g.outside) if (!outsideById.has(o.id)) outsideById.set(o.id, o);
  edges.push(...g.edges);
}

export const graphFor = (packId: string) => graphs.get(packId);
export const node = (id: string) => nodeById.get(id);
export const inGraph = (id: string) => nodeById.has(id);

// Sinhala where the graph or a sample has it; English otherwise (most graph skills
// have no content, and so no Sinhala name, yet).
export function skillName(id: string): Lang {
  return node(id)?.name ?? getSkill(id)?.name ?? outsideById.get(id)?.name ?? { en: id };
}

export const prerequisites = (id: string) => edges.filter((e) => e.type === "requires" && e.from === id).map((e) => e.to);
export const opens = (id: string) => edges.filter((e) => e.type === "requires" && e.to === id).map((e) => e.from);
export const mixedUpWith = (id: string) =>
  edges.filter((e) => e.type === "confusable" && (e.from === id || e.to === id)).map((e) => (e.from === id ? e.to : e.from));

// Every skill that rests on this one, directly or further up (R: "12 skills stand on this").
export function standsOn(id: string): string[] {
  const seen = new Set<string>();
  const stack = [id];
  while (stack.length) {
    for (const up of opens(stack.pop()!)) {
      if (!seen.has(up)) {
        seen.add(up);
        stack.push(up);
      }
    }
  }
  return [...seen];
}

export const pastPaperCount = (id: string) => {
  const e = node(id)?.exam;
  return e ? e.primary + e.secondary : 0;
};

export function skillState(id: string, answers: Answers): SkillState {
  const list = itemsForSkill(id);
  const answered = list.filter((it) => answers[it.id]);
  if (!answered.length) {
    if (node(id)?.mastery === "inferred") return "inferred";
    return list.length ? "new" : "none";
  }
  if (answered.some((it) => !answers[it.id].correct)) return "refresh";
  return answered.length === list.length ? "mastered" : "practising";
}

const VALUE: Record<SkillState, number> = { mastered: 1, practising: 0.5, refresh: 0.35, new: 0, inferred: 0, none: 0 };

// Exam-weighted readiness, 0–100: the share of the marks the student holds now.
// A prototype estimate from sample answers only, not the real mastery model.
export function readiness(skillIds: string[], answers: Answers) {
  const total = skillIds.reduce((n, id) => n + (node(id)?.weight ?? 0), 0);
  if (!total) return 0;
  const held = skillIds.reduce((n, id) => n + (node(id)?.weight ?? 0) * VALUE[skillState(id, answers)], 0);
  return Math.round((100 * held) / total);
}

export type TrailStop = {
  skill: string;
  kind: "refresh" | "keep" | "new" | "first";
  why: string;
};

// D, the trail: the skills of today's queue, in order, each with one reason
// taken from the graph. A prerequisite the student hasn't got, and that has
// questions to play, is suggested first and can be skipped.
export function trail(queue: Item[], answers: Answers): TrailStop[] {
  const order: string[] = [];
  for (const it of queue) if (!order.includes(it.skills[0])) order.push(it.skills[0]);
  const stops: TrailStop[] = [];
  for (const id of order.slice(0, 4)) {
    const state = skillState(id, answers);
    if (state === "new") {
      const first = prerequisites(id).find(
        (p) => itemsForSkill(p).length > 0 && !order.includes(p) && !["mastered", "practising"].includes(skillState(p, answers)),
      );
      if (first && !stops.some((s) => s.skill === first))
        stops.push({ skill: first, kind: "first", why: `${shortName(id)} builds on this. You can skip it.` });
    }
    stops.push({ skill: id, kind: state === "refresh" ? "refresh" : state === "new" || state === "none" ? "new" : "keep", why: reason(id, state) });
  }
  return stops.slice(0, 5);
}

function shortName(id: string) {
  const n = skillName(id);
  return n.si ?? n.en;
}

function reason(id: string, state: SkillState) {
  if (state === "refresh") return "You missed one last time. A quick question brings it back.";
  const papers = pastPaperCount(id);
  const up = standsOn(id).length;
  if (up >= 3) return `${up} skills stand on this one.`;
  if (papers) return `${papers} MCQ${papers === 1 ? "" : "s"} in the last 10 papers.`;
  return state === "new" ? "New today." : "Keep it going.";
}

// T, as one line: of today's skills, the one the most others stand on.
export function bestLever(skillIds: string[]) {
  let best: { skill: string; count: number } | null = null;
  for (const id of skillIds) {
    const count = standsOn(id).length;
    if (count > 0 && (!best || count > best.count)) best = { skill: id, count };
  }
  return best;
}

// After today: a skill that opens once today's skills are in place.
export function opensNext(skillIds: string[], answers: Answers) {
  for (const id of skillIds) {
    for (const up of opens(id)) {
      if (skillIds.includes(up)) continue;
      const blockers = prerequisites(up).filter((p) => inGraph(p) && !skillIds.includes(p) && skillState(p, answers) !== "mastered");
      if (!blockers.length) return up;
    }
  }
  return null;
}

export function topicsWithSkills(packId: string) {
  const g = graphFor(packId);
  if (!g) return [];
  return g.topics.map((t) => ({ ...t, skills: g.skills.filter((s) => s.topic === t.id) }));
}

export const packOfSkill = (id: string) => packs.find((p) => p.graph?.skills.some((s: GraphSkill) => s.id === id))?.id ?? getSkill(id)?.pack;
export const unitName = (packId: string) => getPack(packId)?.unit.name_si ?? "";
