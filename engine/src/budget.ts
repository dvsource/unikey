// Effort budget and session-ending rules (spec §8). Internal: used by session.ts.
import type { Config } from "./config.js";
import type { EndKind, Height, SessionState, State } from "./types.js";

/** Comeback: the last session was `returning.awayDays` or more days ago. */
export function isComeback(state: State, day: number, cfg: Config): boolean {
  return state.lastSessionDay !== null && day - state.lastSessionDay >= cfg.returning.awayDays;
}

/** The most one answer can add to a card's cost (a wrong answer, or "I don't know"). */
export function answerExtra(cfg: Config): number {
  return Math.max(cfg.effort.wrong, cfg.effort.dontKnow);
}

/** Room kept at the end of a session: one height-1 close card answered wrong. */
export function closeReserve(cfg: Config): number {
  return cfg.effort.h1 + answerExtra(cfg);
}

/** Effort a new session may plan for today: the daily cap less today's effort and every possible close card. */
export function dayRoom(state: State, cfg: Config): number {
  return cfg.budget.dailyCap - (state.day?.effort ?? 0) - (1 + cfg.sessionEnd.maxExtraClose) * closeReserve(cfg);
}

/** The largest card cost that, even answered wrong, keeps today's effort within the daily cap. */
export function capRoom(state: State, cfg: Config): number {
  return cfg.budget.dailyCap - (state.day?.effort ?? 0) - answerExtra(cfg);
}

/** max(minimumDay, stamina × (1 − margin)), or `budget.comeback`; capped by `dayRoom`. */
export function sessionBudget(state: State, comeback: boolean, cfg: Config): number {
  const b = comeback ? cfg.budget.comeback : Math.max(cfg.budget.minimumDay, state.profile.stamina * (1 - cfg.budget.margin));
  return Math.min(b, dayRoom(state, cfg));
}

/** `badDay.moments` bad moments within the last `withinCards` cards, or `slowRun` slow answers running. */
export function isBadDay(ss: SessionState, cfg: Config): boolean {
  const n = ss.history.length;
  if (ss.badMoments.filter((i) => i >= n - cfg.badDay.withinCards).length >= cfg.badDay.moments) return true;
  const tail = ss.history.slice(-cfg.badDay.slowRun);
  return tail.length === cfg.badDay.slowRun && tail.every((h) => h.slow);
}

/** The kind a session in `closing` ends with once its close card is done. */
export function pendingKind(ss: SessionState): EndKind {
  if (ss.extended && ss.extendLeft <= 0) return "extended-done";
  if (ss.fadeEffort !== null) return "bad-day";
  return "budget";
}

function median(xs: number[]): number {
  const s = [...xs].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

/**
 * The student's usual ms at `height` from before this session: `msByHeight` minus its last `inSession` entries
 * (this session's answers, appended last). Null with fewer than `estimate.minMsSamples` left.
 */
function usualBefore(state: State, height: Height, inSession: number, cfg: Config): number | null {
  const xs = state.profile.msByHeight[height] ?? [];
  const before = xs.slice(0, Math.max(0, xs.length - inSession));
  return before.length >= cfg.estimate.minMsSamples ? median(before) : null;
}

/**
 * Good day (spec §8.3): success above comfort, the session's median ms under the usual ms at every height
 * played, not already extended, and "5 more" (at height-1 cost) fits under the daily cap.
 */
export function offersExtend(state: State, ss: SessionState, cfg: Config): boolean {
  const n = ss.history.length;
  if (ss.extended || n === 0) return false;
  if (ss.history.filter((h) => h.right === true).length / n <= state.profile.comfort) return false;
  if ((state.day?.effort ?? 0) + cfg.budget.extendCards * cfg.effort.h1 > cfg.budget.dailyCap) return false;
  for (const h of [1, 2, 3] as Height[]) {
    const ms = ss.history.filter((x) => x.height === h).map((x) => x.ms);
    if (!ms.length) continue;
    const usual = usualBefore(state, h, ms.length, cfg);
    if (usual === null || median(ms) >= usual) return false;
  }
  return true;
}
