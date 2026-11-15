// One public call in progress (used by session.ts and skip.ts): a private copy of the state, the clock, the day the
// call belongs to, and the events emitted so far. Internal.
import type { Config } from "./config.js";
import { dayOf } from "./time.js";
import { effectiveNow, isClockCorrection } from "./state.js";
import type { Content, EngineEvent, Feedback, Moment, Next, State, Step } from "./types.js";

export type Run = { s: State; content: Content; cfg: Config; now: number; day: number; events: EngineEvent[] };

export function begin(state: State, content: Content, now: number, cfg: Config): Run {
  const s = JSON.parse(JSON.stringify(state)) as State; // State is JSON by contract; the copy is ours to change
  const corrected = isClockCorrection(s, now, cfg);
  const from = s.lastNow;
  const at = effectiveNow(s, now, cfg);
  s.lastNow = at;
  const r: Run = { s, content, cfg, now: at, day: 0, events: [] };
  rollDay(r);
  // F4: review dates, seen entries and remind days are left as they are (never moved earlier or deleted).
  if (corrected) emit(r, "clock_corrected", { from, to: at });
  return r;
}

/**
 * F5: the day the call belongs to: an open session's start day (a session that crosses local midnight stays on the
 * day it started, for the minimum day, the streak and the daily cap), else today. The day record starts afresh on a
 * new day.
 */
export function rollDay(r: Run): void {
  const s = r.s;
  r.day = dayOf(s.session ? s.session.startedAt : r.now);
  if (!s.day || s.day.day !== r.day) s.day = { day: r.day, effort: 0, streakKept: false };
}

export function emit(r: Run, type: EngineEvent["type"], data: Record<string, unknown>): void {
  r.s.seq += 1;
  r.events.push({ id: `${r.s.student}:${r.s.seq}`, student: r.s.student, at: r.now, session: r.s.session?.id ?? null, type, data });
}

export function step(r: Run, next: Next, feedback?: Feedback, moments: Moment[] = []): Step {
  return feedback ? { state: r.s, events: r.events, feedback, moments, next } : { state: r.s, events: r.events, moments, next };
}

/** What the caller was last told: the open card, the pending offer, or the last end. */
export function currentNext(state: State): Next {
  const ss = state.session;
  if (ss && ss.served) return { kind: "card", card: ss.served };
  if (ss) return { kind: "offer-extend" };
  return { kind: "end", end: state.lastEnd ?? { kind: "interrupted", effort: 0, cards: 0, right: 0, fixed: 0, streakKept: false } };
}

export function stale(state: State): Step {
  return { state, events: [], moments: [], next: currentNext(state) };
}
