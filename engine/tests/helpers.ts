import { defaultConfig, type Config } from "../src/config.js";
import { DAY_MS } from "../src/time.js";
import { answer, skip, startSession } from "../src/session.js";
import type { Served } from "../src/types.js";
import { newState } from "../src/state.js";
import { newSkillRec } from "../src/skill.js";
import type { Attempt, Choice, Content, Height, SectionRec, SkillRec, State, Step } from "../src/types.js";

export type Choose = "r" | "w" | "dk";
/** "s": "Not now" (a confirmed skip). A function returning undefined stops the run with that card open. */
export type Ans = Choose | "s";
export type Answers = Ans[] | ((s: Served, i: number) => Ans | undefined);
export type PlayOpts = { ms?: (s: Served, i: number) => number; cfg?: Config };

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
  return { skipCount: 0, remindDay: null, lastReason: null, dripStopped: false, liking: 0, returned: false, skipTotal: extra.skipCount ?? 0, ...extra };
}
/**
 * A student who has already played. Attempt seqs are numbered 1.. per state (skill-id order, then attempt
 * order), and `answered` is set above them so new attempts come after.
 */
export function startedState(skills: Record<string, SkillRec>, patch: Partial<State> = {}): State {
  let n = 0;
  const numbered = Object.fromEntries(Object.keys(skills).sort().map((id) =>
    [id, { ...skills[id], attempts: skills[id].attempts.map((a) => ({ ...a, seq: ++n })) }]));
  return { ...newState("s", 7), answered: 1000, skills: numbered, ...patch };
}
/** Is any card variant in content servable at `day` (section not blocked, not seen within noRepeatDays)? */
export function anyEligible(state: State, content: Content, day: number, cfg: Config = defaultConfig): boolean {
  const recent = new Set(state.seen.filter((x) => day - x.day < cfg.noRepeatDays).map((x) => `${x.card}#${x.variant}`));
  const blocked = (sec: string) => { const rd = state.sections[sec]?.remindDay; return rd != null && rd > day; };
  return Object.values(content.cards).some((c) => content.skills[c.skill] && !blocked(c.section)
    && c.variants.some((_, v) => !recent.has(`${c.id}#${v}`)));
}
export function withProfile(s: State, p: Partial<State["profile"]>): State {
  return { ...s, profile: { ...s.profile, ...p } };
}
