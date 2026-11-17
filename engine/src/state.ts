import { defaultConfig, type Config } from "./config.js";
import { DAY_MS } from "./time.js";
import type { Content, State } from "./types.js";

export function newState(student: string, seed: number, cfg: Config = defaultConfig): State {
  return {
    v: 1, student, rng: { seed, n: 0 }, seq: 0, lastNow: 0,
    profile: {
      comfort: cfg.comfort.default, memory: cfg.memory.default, h3Share: cfg.calc.h3ShareDefault,
      stamina: cfg.budget.staminaDefault, goodStreak: 0, msByHeight: { 1: [], 2: [], 3: [] },
    },
    skills: {}, sections: {}, seen: [], currentTopic: null, day: null,
    sessionCount: 0, lastSessionDay: null, session: null, answered: 0, lastEnd: null,
    pendingMoments: [], momentsDone: [], ladder: { level: 1, rightRun: 0 }, lastSession: null,
  };
}

export function migrate(json: unknown): State {
  if (typeof json !== "object" || json === null || (json as { v?: unknown }).v !== 1) {
    throw new Error("unsupported state version");
  }
  const s = json as State;
  // Fields added after the first v1 states were stored.
  // Task 11: before `badDay`, a set fadeEffort meant the bad-day rule had fired.
  const session = s.session ? {
    ...s.session, sideDoor: s.session.sideDoor ?? null, confident: s.session.confident ?? [],
    badDay: s.session.badDay ?? s.session.fadeEffort != null, slowBefore: s.session.slowBefore ?? [], servedCards: s.session.servedCards ?? [],
    leftSkills: s.session.leftSkills ?? [], ladderCard: s.session.ladderCard ?? null, ladderFull: s.session.ladderFull ?? 0,
    stretchCard: s.session.stretchCard ?? null, extraNew: s.session.extraNew ?? false, lastSkip: s.session.lastSkip ?? null,
    missRun: s.session.missRun ?? 0, lowStart: s.session.lowStart ?? false, // change 3
    fixedSkills: s.session.fixedSkills ?? [], // change 7
    extendEffortLeft: s.session.extendEffortLeft ?? 0, // extend ruling
  } : null;
  const sections = Object.fromEntries(Object.entries(s.sections ?? {}).map(([id, x]) => [id, {
    ...x, skipTotal: x.skipTotal ?? x.skipCount, lastSkipSeq: x.lastSkipSeq ?? null, skippedLevel: x.skippedLevel ?? null, // change 6
  }]));
  return {
    ...s, answered: s.answered ?? 0, session, sections,
    lastEnd: s.lastEnd ? { ...s.lastEnd, recap: s.lastEnd.recap ?? false, fixedSkills: s.lastEnd.fixedSkills ?? [] } : null, // change 7
    pendingMoments: s.pendingMoments ?? [], momentsDone: s.momentsDone ?? [],
    // Change 4: a student who answered before the ladder existed is past day one; a fresh one starts on it.
    ladder: s.ladder !== undefined ? s.ladder : (s.answered ?? 0) > 0 ? null : { level: 1, rightRun: 0 },
    lastSession: s.lastSession ?? null, // change 3
  };
}

/**
 * The time a call runs at: never before the last call's (a small backwards step of the device clock), unless `now` is
 * more than `clock.correctionDays` behind it. That is a clock correction (the phone's date was set ahead, then fixed):
 * `now` is accepted as the new time (F4).
 */
export function effectiveNow(state: State, now: number, cfg: Config = defaultConfig): number {
  return isClockCorrection(state, now, cfg) ? now : Math.max(now, state.lastNow);
}

/** `now` is more than `clock.correctionDays` behind the last call. */
export function isClockCorrection(state: State, now: number, cfg: Config = defaultConfig): boolean {
  return state.lastNow - now > cfg.clock.correctionDays * DAY_MS;
}

/** Skill ids present in state that still exist in content (drops ghosts). */
export function knownSkills(state: State, content: Content): string[] {
  return Object.keys(state.skills).filter((id) => id in content.skills);
}
