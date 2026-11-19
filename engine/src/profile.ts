// The student profile's dials (spec §7): memory, comfort, calculation vs concept, stamina, and section liking.
// Pure functions; session.ts calls `onAnswer` per answer and `onSessionEnd` once per session end.
import type { Config } from "./config.js";
import { eligibleCard, effortOf } from "./pick.js";
import type { Content, EndInfo, Picked, Height, Profile, SectionRec, SessionState, State } from "./types.js";

const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));

/**
 * What one answer tells the profile. `usualMs`: the student's usual time at `height` from before this answer
 * (null with too few samples). `extend`: the answer was a "5 more" card.
 */
export type AnswerInfo = {
  height: Height; right: boolean; ms: number; wasDueReviewFirstCard: boolean; usualMs: number | null; extend: boolean;
};

/**
 * Memory moves on the first card back of a due review at height 1 or 2 (F6: a height-3 miss is calculation, not
 * forgetting); the section's liking on speed and on extend cards; the last `answers.msKept` times per height are kept.
 */
export function onAnswer(profile: Profile, section: SectionRec, a: AnswerInfo, cfg: Config): { profile: Profile; section: SectionRec } {
  let memory = profile.memory;
  if (a.wasDueReviewFirstCard && a.height <= 2) memory = clamp(memory * (a.right ? cfg.memory.up : cfg.memory.down), cfg.memory.min, cfg.memory.max);
  const by = profile.msByHeight;
  const next: Profile = { ...profile, memory, msByHeight: { ...by, [a.height]: [...(by[a.height] ?? []), a.ms].slice(-cfg.answers.msKept) } };
  const L = cfg.liking;
  let liking = section.liking;
  if (a.usualMs !== null) {
    if (a.right && a.ms < a.usualMs) liking += L.fastStep;
    else if (a.ms > L.slowFactor * a.usualMs) liking -= L.slowStep;
  }
  if (a.extend) liking += L.extendStep;
  liking = clamp(liking, -L.clamp, L.clamp);
  return { profile: next, section: liking === section.liking ? section : { ...section, liking } };
}

/**
 * Success at heights 1-2 minus success at height 3 minus the baseline, over the last `window.cards` attempts,
 * or null with too little data (`calc.minH3` / `calc.minH12`).
 */
function calcGap(state: State, cfg: Config): number | null {
  const all = Object.keys(state.skills).sort().flatMap((k) => state.skills[k].attempts).sort((x, y) => x.seq - y.seq).slice(-cfg.window.cards);
  const hi = all.filter((x) => x.height === 3);
  const lo = all.filter((x) => x.height !== 3);
  if (hi.length < cfg.calc.minH3 || lo.length < cfg.calc.minH12) return null;
  const rate = (xs: typeof all) => xs.filter((x) => x.right).length / xs.length;
  return rate(lo) - rate(hi) - cfg.calc.gapBaseline;
}

/** Calculation-weak: heights 1-2 clearly ahead of height 3 (the gap is above `calc.band`). */
export function isCalcWeak(state: State, cfg: Config): boolean {
  const g = calcGap(state, cfg);
  return g !== null && g > cfg.calc.band;
}

/** The share of height-3 effort to aim for: default unless one side is clearly weaker. */
function h3ShareOf(state: State, cfg: Config): number {
  const g = calcGap(state, cfg);
  let share = cfg.calc.h3ShareDefault;
  if (g !== null && g > cfg.calc.band) share = cfg.calc.h3ShareCalcWeak;
  else if (g !== null && g < -cfg.calc.band) share = cfg.calc.h3ShareConceptWeak;
  return clamp(share, cfg.calc.minWeakerShare, 1 - cfg.calc.minWeakerShare);
}

/**
 * Comfort, stamina and h3Share at a session end. `interrupted` (and a session with no answers) change nothing.
 * `left` below `comfort + quitMargin` raises comfort; `streakSessions` good finishes in a row lower it; any other
 * end resets the streak. Stamina blends toward `session.fadeEffort` when set (never up); otherwise it grows only after
 * an accepted "5 more" finished with no fade (`extendStep`). A clean budget end leaves it as it was.
 */
export function onSessionEnd(state: State, end: EndInfo, session: SessionState, cfg: Config): State {
  if (end.kind === "interrupted" || end.cards === 0) return state;
  const p = state.profile;
  const judged = end.cards - session.guesses; // guesses are no evidence: they count neither as right nor as failures
  const success = judged > 0 ? end.right / judged : 0;
  const C = cfg.comfort;
  let comfort = p.comfort;
  let goodStreak = p.goodStreak;
  if (judged <= 0) { /* only guesses: comfort and the good-finish streak stay as they were */ }
  else if (end.kind === "left" && success < comfort + C.quitMargin) {
    comfort += C.upOnQuit;
    goodStreak = 0;
  } else if ((end.kind === "budget" || end.kind === "extended-done") && success >= comfort) {
    goodStreak += 1;
    if (goodStreak >= C.streakSessions) {
      comfort -= C.downOnStreak;
      goodStreak = 0;
    }
  } else goodStreak = 0;
  const U = cfg.staminaUpdate;
  let stamina = p.stamina;
  if (session.fadeEffort !== null) stamina = Math.min(stamina, U.keep * stamina + U.take * session.fadeEffort); // a fade never raises stamina
  else if (end.kind === "extended-done") stamina += U.extendStep;
  const lo = cfg.budget.minimumDay / (1 - cfg.budget.margin);
  return {
    ...state,
    profile: {
      ...p, comfort: clamp(comfort, C.min, C.max), goodStreak, stamina: clamp(stamina, lo, cfg.budget.dailyCap), h3Share: h3ShareOf(state, cfg),
    },
  };
}

/**
 * The ramp (spec §7): for a height-3 pick of a started skill while the student is calculation-weak, a height-2
 * card of the same skill (the pick's reason kept) to serve first. Null unless an eligible height-2 card exists,
 * both cards fit in `room`, and the two would not make the skill's same-skill run too long. `recent`: card ids not to
 * serve (R5).
 */
export function rampBefore(
  state: State, content: Content, p: Picked, lastSkills: string[], day: number, room: number, cfg: Config, recent: string[] = [],
): Picked | null {
  const sv = p.served;
  if (sv.height !== 3 || !isCalcWeak(state, cfg) || !(sv.skill in state.skills)) return null;
  if (effortOf(2, cfg) + sv.effort > room) return null;
  const n = cfg.session.maxSameSkillRun;
  let run = 0; // the skill's current run, then the ramp card and the height-3 card: all within the limit
  while (run < lastSkills.length && lastSkills[lastSkills.length - 1 - run] === sv.skill) run++;
  if (run + 2 > n) return null;
  const e = eligibleCard(state, content, sv.skill, 2, day, p.rng, { exclude: [...recent, sv.card] }, cfg);
  if (!e) return null;
  const { borrowedFrom: _b, ...rest } = sv;
  return { served: { ...rest, card: e.card, variant: e.variant, height: 2, effort: effortOf(2, cfg) }, rng: e.rng };
}
