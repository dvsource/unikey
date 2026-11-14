import { defaultConfig, type Config } from "../src/config.js";
import { DAY_MS } from "../src/time.js";
import { answer, startSession } from "../src/session.js";
import type { Served } from "../src/pick.js";
import { newState } from "../src/state.js";
import { newSkillRec } from "../src/skill.js";
import type { Attempt, Choice, Content, Height, SectionRec, SkillRec, State, Step } from "../src/types.js";

export type Ans = "r" | "w" | "dk";
export type Answers = Ans[] | ((s: Served, i: number) => Ans);
export type PlayOpts = { ms?: (s: Served, i: number) => number; cfg?: Config };

/** 08:30 Sri Lanka time on 2027-01-04. */
export const T0 = Date.UTC(2027, 0, 4, 3, 0);

export function nextDay(now: number): number {
  return now + DAY_MS;
}

/** The correct option ("r"), the first wrong option ("w") or "dont-know". */
export function choiceFor(content: Content, s: Served, a: Ans): Choice {
  if (a === "dk") return "dont-know";
  return content.cards[s.card].variants[s.variant].findIndex((o) => (a === "r" ? o.correct : !o.correct));
}

/**
 * Answers every served card from `step` on (ms 8000 unless `opts.ms`), advancing now by 10 s per card,
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
    cur = answer(cur.state, content, { card: s.card, choice: choiceFor(content, s, a), ms: opts.ms ? opts.ms(s, i) : 8000 }, now, cfg);
    steps.push(cur);
    i++;
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
let seqN = 0;
/** `right` right then `wrong` wrong attempts at `height` on `day`. */
export function atts(height: Height, right: number, wrong: number, day: number): Attempt[] {
  return [...Array.from({ length: right }, () => true), ...Array.from({ length: wrong }, () => false)]
    .map((r) => ({ day, seq: ++seqN, height, right: r, ms: 8000, card: "x" }));
}
export function rec(height: Height, attempts: Attempt[], extra: Partial<SkillRec> = {}): SkillRec {
  return { ...newSkillRec(height), attempts, ...extra };
}
export function section(extra: Partial<SectionRec> = {}): SectionRec {
  return { skipCount: 0, remindDay: null, lastReason: null, dripStopped: false, liking: 0, returned: false, ...extra };
}
/** A student who has already played: `answered` is set high so new attempt seqs come after the given ones. */
export function startedState(skills: Record<string, SkillRec>, patch: Partial<State> = {}): State {
  return { ...newState("s", 7), answered: 1000, skills, ...patch };
}
export function withProfile(s: State, p: Partial<State["profile"]>): State {
  return { ...s, profile: { ...s.profile, ...p } };
}
