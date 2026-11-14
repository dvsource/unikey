import { defaultConfig, type Config } from "./config.js";
import type { Content, State } from "./types.js";

export function newState(student: string, seed: number, cfg: Config = defaultConfig): State {
  return {
    v: 1, student, rng: { seed, n: 0 }, seq: 0, lastNow: 0,
    profile: {
      comfort: cfg.comfort.default, memory: cfg.memory.default, h3Share: cfg.calc.h3ShareDefault,
      stamina: cfg.budget.staminaDefault, goodStreak: 0, msByHeight: { 1: [], 2: [], 3: [] },
    },
    skills: {}, sections: {}, seen: [], currentTopic: null, day: null,
    sessionCount: 0, lastSessionDay: null, session: null,
  };
}

export function migrate(json: unknown): State {
  if (typeof json !== "object" || json === null || (json as { v?: unknown }).v !== 1) {
    throw new Error("unsupported state version");
  }
  return json as State;
}

export function effectiveNow(state: State, now: number): number {
  return Math.max(now, state.lastNow);
}

/** Skill ids present in state that still exist in content (drops ghosts). */
export function knownSkills(state: State, content: Content): string[] {
  return Object.keys(state.skills).filter((id) => id in content.skills);
}
