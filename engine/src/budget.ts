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

/**
 * max(minimumDay, stamina × (1 − margin)), or `budget.comeback`; `minimumDay` after a near-zero session (change 3); the student's first `budget.firstSessions` sessions
 * (`state.sessionCount` already counts the new one) use `minimumDay`: start small, grow on evidence (R4c). Capped by `dayRoom`.
 */
export function sessionBudget(state: State, comeback: boolean, cfg: Config): number {
  const b = afterLowRight(state, cfg) ? cfg.budget.minimumDay
    : comeback ? cfg.budget.comeback
    : state.sessionCount <= cfg.budget.firstSessions ? cfg.budget.minimumDay
    : Math.max(cfg.budget.minimumDay, state.profile.stamina * (1 - cfg.budget.margin));
  return Math.min(b, dayRoom(state, cfg));
}

/**
 * Change 3: the last session had at least `budget.lowRightMinCards` cards and at most `budget.lowRight` right: the next
 * session is a minimum day that opens on easy cards.
 */
export function afterLowRight(state: State, cfg: Config): boolean {
  const l = state.lastSession;
  return l !== null && l.cards >= cfg.budget.lowRightMinCards && l.right <= cfg.budget.lowRight;
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
  if (ss.badDay) return "bad-day";
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
 * Good day (spec §8.3, fix round 1): the session's success rate at or above comfort and no slow answer in it
 * (`slowBefore` empty). "Faster than usual" is no longer required: a steady student is rarely faster than their own
 * median. A usual time from before the session must exist at every height played, or a slow answer could not be seen.
 */
export function isGoodDay(state: State, ss: SessionState, cfg: Config): boolean {
  const n = ss.history.length;
  if (n === 0) return false;
  if (ss.history.filter((h) => h.right === true).length / n < state.profile.comfort || ss.slowBefore.length > 0) return false;
  return ([1, 2, 3] as Height[]).every((h) => {
    const k = ss.history.filter((x) => x.height === h && x.guess !== true).length; // a guess adds no timing sample
    return k === 0 || usualBefore(state, h, k, cfg) !== null;
  });
}

/** "5 more" is offered on a good day, when not already extended and the extra cards (at height-1 cost) fit under the daily cap. */
export function offersExtend(state: State, ss: SessionState, cfg: Config): boolean {
  if (ss.extended) return false;
  if ((state.day?.effort ?? 0) + cfg.budget.extendCards * cfg.effort.h1 > cfg.budget.dailyCap) return false;
  return isGoodDay(state, ss, cfg);
}

/**
 * Fade (R4b): after `fade.slowAnswers` slow answers in the session (not necessarily in a row), the effort spent before
 * the first of them; null before that. Does not end the session by itself.
 */
export function fadeFromSlow(ss: SessionState, cfg: Config): number | null {
  return ss.slowBefore.length >= cfg.fade.slowAnswers ? ss.slowBefore[0] : null;
}
