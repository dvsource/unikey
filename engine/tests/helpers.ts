import { afterAll, beforeAll } from "vitest";
import { defaultConfig, type Config } from "../src/config.js";
import { DAY_MS } from "../src/time.js";
import { answer, endSession, skip, startSession } from "../src/session.js";
import type { Served } from "../src/types.js";
import { newState } from "../src/state.js";
import { newSkillRec } from "../src/skill.js";
import type { Attempt, Choice, Content, Height, SectionRec, SkillRec, State, Step } from "../src/types.js";

export type Choose = "r" | "w" | "dk";
/** "s": "Not now" (a confirmed skip). A function returning undefined stops the run with that card open. */
export type Ans = Choose | "s";
export type Answers = Ans[] | ((s: Served, i: number) => Ans | undefined);
/**
 * `offer`: what to do with an offer of "5 more" at the end. "decline" (default since fix round 1, when "5 more" became
 * common: it no longer needs answers faster than usual) ends the session `budget`; "stop" leaves the offer open.
 */
export type PlayOpts = { ms?: (s: Served, i: number) => number; cfg?: Config; offer?: "decline" | "stop" };

/** 08:30 Sri Lanka time on 2027-01-04. */
export const T0 = Date.UTC(2027, 0, 4, 3, 0);

export function nextDay(now: number): number {
  return now + DAY_MS;
}

/** The correct option ("r"), the first wrong option ("w") or "dont-know". */
export function choiceFor(content: Content, s: Served, a: Choose): Choice {
  if (a === "dk") return "dont-know";
  return content.cards[s.card].variants[s.variant].findIndex((o) => (a === "r" ? o.correct : !o.correct));
}

/**
 * Answers (or skips) every served card from `step` on (ms 8000 unless `opts.ms`), advancing now by 10 s per card,
 * until `next.kind` is not `card` or the answers run out.
 */
export function run(content: Content, step: Step, now: number, answers: Answers, opts: PlayOpts = {}):
  { state: State; steps: Step[]; now: number } {
  const cfg = opts.cfg ?? defaultConfig;
  const steps: Step[] = [];
  let cur = step;
  let i = 0;
  while (cur.next.kind === "card") {
    const s = cur.next.card;
    const a = typeof answers === "function" ? answers(s, i) : answers[i];
    if (a === undefined) break;
    now += 10_000;
    cur = a === "s"
      ? skip(cur.state, content, { card: s.card, confirmed: true }, now, cfg)
      : answer(cur.state, content, { card: s.card, choice: choiceFor(content, s, a), ms: opts.ms ? opts.ms(s, i) : 8000 }, now, cfg);
    steps.push(cur);
    i++;
  }
  if (cur.next.kind === "offer-extend" && opts.offer !== "stop") {
    now += 1000;
    cur = endSession(cur.state, content, now, cfg);
    steps.push(cur);
  }
  return { state: cur.state, steps, now };
}

/** Starts a session and answers it with `run`. `steps[0]` is the startSession step. */
export function play(content: Content, state: State, now: number, answers: Answers, opts: PlayOpts = {}):
  { state: State; steps: Step[]; now: number } {
  const first = startSession(state, content, now, opts.cfg ?? defaultConfig);
  const r = run(content, first, now, answers, opts);
  return { state: r.state, steps: [first, ...r.steps], now: r.now };
}

/** Every card served in these steps, in order. */
export function served(steps: Step[]): Served[] {
  return steps.flatMap((st) => (st.next.kind === "card" ? [st.next.card] : []));
}

export function lastStep(steps: Step[]): Step {
  return steps[steps.length - 1];
}

// ---------- building states ----------
/** `right` right then `wrong` wrong attempts at `height` on `day`. `seq` is 0 here; `startedState` numbers them. */
export function atts(height: Height, right: number, wrong: number, day: number): Attempt[] {
  return [...Array.from({ length: right }, () => true), ...Array.from({ length: wrong }, () => false)]
    .map((r) => ({ day, seq: 0, height, right: r, ms: 8000, card: "x" }));
}
export function rec(height: Height, attempts: Attempt[], extra: Partial<SkillRec> = {}): SkillRec {
  return { ...newSkillRec(height), attempts, ...extra };
}
export function section(extra: Partial<SectionRec> = {}): SectionRec {
  return { skipCount: 0, remindDay: null, lastReason: null, dripStopped: false, liking: 0, returned: false, skipTotal: extra.skipCount ?? 0, lastSkipSeq: null, skippedLevel: null, ...extra };
}
/**
 * A student who has already played. Attempt seqs are numbered 1.. per state (skill-id order, then attempt
 * order), and `answered` is set above them so new attempts come after. `sessionCount` 4: past the
 * `budget.firstSessions` small first sessions (Task 11 R4c), with the same drip parity as 0.
 */
export function startedState(skills: Record<string, SkillRec>, patch: Partial<State> = {}): State {
  let n = 0;
  const numbered = Object.fromEntries(Object.keys(skills).sort().map((id) =>
    [id, { ...skills[id], attempts: skills[id].attempts.map((a) => ({ ...a, seq: ++n })) }]));
  return { ...newState("s", 7), answered: 1000, sessionCount: 4, skills: numbered, ...patch };
}
/** Is any card variant in content servable at `day` (section not blocked, not seen within noRepeatDays)? */
export function anyEligible(state: State, content: Content, day: number, cfg: Config = defaultConfig): boolean {
  const recent = new Set(state.seen.filter((x) => day - x.day < cfg.noRepeatDays).map((x) => `${x.card}#${x.variant}`));
  const blocked = (sec: string) => { const rd = state.sections[sec]?.remindDay; return rd != null && rd > day; };
  // Rule 2: a full problem (height 3) of a skill whose noFullUntilDay is after today is never served.
  const rested = (c: { skill: string; id: string }) => {
    const u = state.skills[c.skill]?.noFullUntilDay ?? null;
    return u !== null && u > day && content.skills[c.skill].cards[3].includes(c.id);
  };
  return Object.values(content.cards).some((c) => content.skills[c.skill] && !blocked(c.section) && !rested(c)
    && c.variants.some((_, v) => !recent.has(`${c.id}#${v}`)));
}
export function withProfile(s: State, p: Partial<State["profile"]>): State {
  return { ...s, profile: { ...s.profile, ...p } };
}
/** Each answered card (skips left out) with the ladder before and after its answer (change 4). */
export function ladderSteps(steps: Step[]): { served: Served; before: State["ladder"]; after: State["ladder"] }[] {
  const out: { served: Served; before: State["ladder"]; after: State["ladder"] }[] = [];
  for (let k = 0; k + 1 < steps.length; k++) {
    const st = steps[k];
    const nx = steps[k + 1];
    if (st.next.kind !== "card" || !nx.events.some((e) => e.type === "answer")) continue;
    out.push({ served: st.next.card, before: st.state.ladder, after: nx.state.ladder });
  }
  return out;
}

/**
 * T114: the suites written for the repair timing before T114 (the repair straight after the miss) pin it for their whole
 * file with this call: they test the repair mechanics (piece, confidence, return, failed repairs, the guard), which do
 * not change. `tests/grades.test.ts` tests the T114 timing (the repair near the session end) on the default config.
 * Vitest runs each test file in its own module context, so the change never leaks into another file.
 */
export function useRepairTimingBeforeT114(): void {
  const was = defaultConfig.repairEnd.atEnd;
  beforeAll(() => { defaultConfig.repairEnd.atEnd = false; });
  afterAll(() => { defaultConfig.repairEnd.atEnd = was; });
}
