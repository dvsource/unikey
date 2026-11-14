import { next, type Rng, type Content, type Served, type SkipReason, type Height } from "../src/index.js";

/** Starting values of the hidden-student model; the tuning task changes them here only. */
export const simParams = {
  need: { 1: 0.25, 2: 0.5, 3: 0.75 } as Record<Height, number>,
  pFloor: 0.2, pCeil: 0.97, pBase: 0.5, pSlope: 1.5,
  learnRight: 0.04, learnWrong: 0.08,
  decayPerDay: 0.008, decayFloor: 0.5,
  fatigueK: 0.2, fatigueMs: 2.2, quitStaminaFactor: 1.3,
  skipChance: 0.5, featedK: 0.6, tooHardK: 0.1,
  msHeight: { 1: 1, 2: 1.5, 3: 4 } as Record<Height, number>,
  msJitterBase: 0.8, msJitterSpan: 0.4, guesserMs: 0.4,
  misconceptionDecay: 0.8,
  fiveMinEffort: 12,
  binge: { fast: 5, vanishUntil: 20 },
  gap10: { from: 9, to: 18 },
};

export type Habit = "daily" | "alternate" | "binge-vanish" | "gap10" | "five-min";
export type Traits = {
  prior: number; priorBySection?: Record<string, number>; learn: number; forget: number;
  calc: number; concept: number;
  misconceptions: Record<string, number>;
  patienceWrongs: number; patienceSessions: number;
  skipBelow: number; fearedSections: string[]; dontKnowBelow: number;
  stamina: number; baseMs: number; guesser: boolean; extendChance: number;
  habit: Habit; classPace: number | null;
};
export type Persona = { id: string; name: string; sheet: string; traits: Traits };
/** A persona whose content-dependent traits are placeholders `newHidden` / `resolvePersona` resolve. */
export type PersonaSpec = {
  id: string; name: string; sheet: string;
  traits: Omit<Traits, "misconceptions" | "fearedSections" | "priorBySection"> & {
    misconceptions: Record<string, number> | "auto";
    fearedSections: string[] | "auto";
    priorBySection?: Record<string, number>;
    /** With fearedSections "auto": the prior for the resolved feared section. */
    fearedPrior?: number;
  };
};
export type Hidden = {
  traits: Traits; k: Record<string, number>; k0: Record<string, number>;
  lastDay: Record<string, number | undefined>;
  badSessions: number; quitApp: boolean; rng: Rng;
};
export type Action =
  | { kind: "answer"; choice: number | "dont-know"; ms: number }
  | { kind: "skip"; reason?: SkipReason }
  | { kind: "quit" };

const clamp = (lo: number, hi: number, x: number) => Math.min(hi, Math.max(lo, x));

/** Tags by frequency among tagged wrong options, excluding generic ones; ties by name. */
function nonGenericTags(content: Content): string[] {
  const counts: Record<string, number> = {};
  let total = 0;
  for (const card of Object.values(content.cards))
    for (const v of card.variants) for (const o of v) if (!o.correct && o.tag) { counts[o.tag] = (counts[o.tag] ?? 0) + 1; total++; }
  return Object.keys(counts)
    .filter((t) => t !== "recall-gap" && counts[t]! / total <= 0.25)
    .sort((a, b) => counts[b]! - counts[a]! || (a < b ? -1 : 1));
}

function topSection(content: Content): string | undefined {
  const withCards = Object.values(content.sections).filter((s) => s.skills.some((id) => {
    const sk = content.skills[id];
    return sk && ([1, 2, 3] as Height[]).some((h) => sk.cards[h].length > 0);
  }));
  withCards.sort((a, b) => b.weight - a.weight || (a.id < b.id ? -1 : 1));
  return withCards[0]?.id;
}

export function resolvePersona(p: PersonaSpec | Persona, content: Content): Persona {
  const t = p.traits as PersonaSpec["traits"];
  const { fearedPrior, ...rest } = t;
  let misconceptions: Record<string, number>;
  if (t.misconceptions === "auto") {
    misconceptions = {};
    for (const tag of nonGenericTags(content).slice(0, 6)) misconceptions[tag] = 0.8;
  } else misconceptions = t.misconceptions;
  let fearedSections: string[];
  let priorBySection = t.priorBySection;
  if (t.fearedSections === "auto") {
    const s = topSection(content);
    fearedSections = s ? [s] : [];
    if (s && fearedPrior !== undefined) priorBySection = { ...(priorBySection ?? {}), [s]: fearedPrior };
  } else fearedSections = t.fearedSections;
  const traits: Traits = { ...rest, misconceptions, fearedSections };
  if (priorBySection) traits.priorBySection = priorBySection;
  return { id: p.id, name: p.name, sheet: p.sheet, traits };
}

export function newHidden(p: PersonaSpec | Persona, content: Content, seed: number): Hidden {
  const persona = resolvePersona(p, content);
  const k: Record<string, number> = {};
  for (const sk of Object.values(content.skills)) {
    if (!([1, 2, 3] as Height[]).some((h) => sk.cards[h].length > 0)) continue;
    k[sk.id] = clamp(0, 1, persona.traits.priorBySection?.[sk.section] ?? persona.traits.prior);
  }
  return { traits: persona.traits, k, k0: { ...k }, lastDay: {}, badSessions: 0, quitApp: false, rng: { seed, n: 0 } };
}

function kEff(h: Hidden, card: Served, sessionEffort: number): number {
  const t = h.traits;
  let v = (h.k[card.skill] ?? 0) + (card.height === 3 ? t.calc : t.concept);
  if (sessionEffort > t.stamina) v -= simParams.fatigueK;
  return v;
}

export function pRight(h: Hidden, card: Served, sessionEffort: number): number {
  return clamp(simParams.pFloor, simParams.pCeil,
    simParams.pBase + simParams.pSlope * (kEff(h, card, sessionEffort) - simParams.need[card.height]));
}

export function decide(h: Hidden, content: Content, card: Served,
  session: { effort: number; recentWrong: number }, day: number): { action: Action; hidden: Hidden } {
  void day;
  const t = h.traits;
  let rng = h.rng;
  const draw = (): number => { const [v, r] = next(rng); rng = r; return v; };
  const done = (action: Action) => ({ action, hidden: { ...h, rng } });

  if (session.recentWrong >= t.patienceWrongs || session.effort > simParams.quitStaminaFactor * t.stamina
    || (t.habit === "five-min" && session.effort >= simParams.fiveMinEffort)) return done({ kind: "quit" });

  const p = pRight(h, card, session.effort);
  const k = h.k[card.skill] ?? 0;
  const protectedCard = card.reason.startsWith("repair:") || card.reason === "close:winnable";
  if (!protectedCard) {
    const feared = t.fearedSections.includes(card.section) && k < simParams.featedK;
    if (feared || (p < t.skipBelow && draw() < simParams.skipChance))
      return done({ kind: "skip", reason: k > simParams.tooHardK ? "too-hard" : "not-learned" });
  }

  const msOf = (): number => {
    const jitter = simParams.msJitterBase + simParams.msJitterSpan * draw();
    let ms = t.baseMs * simParams.msHeight[card.height] * jitter;
    if (t.guesser) ms *= simParams.guesserMs;
    if (session.effort > t.stamina) ms *= simParams.fatigueMs;
    return Math.round(ms);
  };

  if (p < t.dontKnowBelow && !t.guesser) return done({ kind: "answer", choice: "dont-know", ms: msOf() });

  const options = content.cards[card.card]!.variants[card.variant]!;
  for (let i = 0; i < options.length; i++) {
    const o = options[i]!;
    const s = !o.correct && o.tag ? t.misconceptions[o.tag] : undefined;
    if (s !== undefined && draw() < s * (1 - k)) return done({ kind: "answer", choice: i, ms: msOf() });
  }
  const right = draw() < p;
  const idx = options.map((o, i) => (o.correct === right ? i : -1)).filter((i) => i >= 0);
  const choice = idx[Math.min(idx.length - 1, Math.floor(draw() * idx.length))]!;
  return done({ kind: "answer", choice, ms: msOf() });
}

/** `tag`: the tag of the wrong option chosen, if any (shrinks that misconception). */
export function learn(h: Hidden, card: Served, right: boolean, day: number, tag?: string): Hidden {
  const k = h.k[card.skill] ?? 0;
  const nk = clamp(0, 1, k + h.traits.learn * (right ? simParams.learnRight : simParams.learnWrong) * (1 - k));
  let traits = h.traits;
  if (!right && tag && traits.misconceptions[tag] !== undefined)
    traits = { ...traits, misconceptions: { ...traits.misconceptions, [tag]: traits.misconceptions[tag]! * simParams.misconceptionDecay } };
  return { ...h, traits, k: { ...h.k, [card.skill]: nk }, lastDay: { ...h.lastDay, [card.skill]: day } };
}

export function decay(h: Hidden, day: number): Hidden {
  void day;
  const k = { ...h.k };
  for (const s of Object.keys(k)) {
    if (h.lastDay[s] === undefined) continue;
    const floor = (h.k0[s] ?? 0) * simParams.decayFloor;
    k[s] = Math.max(floor, k[s]! - h.traits.forget * simParams.decayPerDay * (1 - 0.5 * k[s]!));
  }
  return { ...h, k };
}

export function playsToday(h: Hidden, day0: number, day: number): number {
  if (h.quitApp) return 0;
  const d = day - day0;
  switch (h.traits.habit) {
    case "alternate": return d % 2 === 0 ? 1 : 0;
    case "binge-vanish":
      if (d <= simParams.binge.fast) return 2;
      return d < simParams.binge.vanishUntil ? 0 : 1;
    case "gap10": return d >= simParams.gap10.from && d <= simParams.gap10.to ? 0 : 1;
    default: return 1;
  }
}

export function wantsExtend(h: Hidden): [boolean, Hidden] {
  const [v, rng] = next(h.rng);
  return [v < h.traits.extendChance, { ...h, rng }];
}

/** Call when a session ends: `quit` true if the student walked out. A five-min student's quit is not a bad session. */
export function sessionEnded(h: Hidden, quit: boolean): Hidden {
  if (!quit) return { ...h, badSessions: 0 };
  if (h.traits.habit === "five-min") return h;
  const badSessions = h.badSessions + 1;
  return { ...h, badSessions, quitApp: h.quitApp || badSessions >= h.traits.patienceSessions };
}

export function meanKnowledge(h: Hidden, content: Content): number {
  void content;
  const v = Object.values(h.k);
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0;
}
