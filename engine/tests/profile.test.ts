import { test, expect } from "vitest";
import { defaultConfig as cfg } from "../src/config.js";
import { newState } from "../src/state.js";
import { dayOf } from "../src/time.js";
import { answer, endSession, extend, skip, startSession } from "../src/session.js";
import { isCalcWeak, onAnswer, onSessionEnd, rampBefore } from "../src/profile.js";
import { usualMs } from "../src/estimate.js";
import type { EndInfo, Height, SectionRec, SessionState, SkillRec, State } from "../src/types.js";
import { fixture } from "./fixture.js";
import { T0, atts, choiceFor, nextDay, play, rec, run, section, served, startedState, withProfile } from "./helpers.js";

const C = fixture();
const D0 = dayOf(T0);
const SKILLS = ["a1", "a2", "b1", "b2"];

function startedAt(height: Height, r: number, w: number, extra: Partial<SkillRec> = {}): State {
  const skills: Record<string, SkillRec> = {};
  for (const id of SKILLS) skills[id] = rec(height, atts(height, r, w, D0 - 2), { nextReviewDay: D0 + 20, noFullUntilDay: D0 + 20, ...extra });
  return startedState(skills);
}
const ans = { height: 2 as Height, right: true, ms: 8000, wasDueReviewFirstCard: false, usualMs: null as number | null, extend: false };
const sec0 = section();
const prof = (p: Partial<State["profile"]> = {}) => withProfile(newState("s", 1), p).profile;

/** A state with an open session, for calling onSessionEnd directly. */
function open(profile: Partial<State["profile"]> = {}, ss: Partial<SessionState> = {}, base: State = newState("s", 1)): { s: State; ss: SessionState } {
  const st = startSession(withProfile(base, profile), C, T0).state;
  return { s: st, ss: { ...st.session!, ...ss } };
}
const endOf = (kind: EndInfo["kind"], cards: number, right: number): EndInfo => ({ kind, effort: 10, cards, right, fixed: 0, streakKept: true, recap: false, fixedSkills: [], rightSkills: [] }); // change 7, F3: EndInfo shape
const close = (profile: Partial<State["profile"]>, end: EndInfo, ss: Partial<SessionState> = {}, base?: State) => {
  const o = open(profile, ss, base);
  return onSessionEnd(o.s, end, o.ss, cfg).profile;
};

test("memory: due-review first card right ×1.05, wrong ×0.85, clamped 0.5..2", () => {
  const due = { ...ans, wasDueReviewFirstCard: true };
  expect(onAnswer(prof(), sec0, due, cfg).profile.memory).toBeCloseTo(1.05, 10);
  expect(onAnswer(prof(), sec0, { ...due, right: false }, cfg).profile.memory).toBeCloseTo(0.85, 10);
  expect(onAnswer(prof({ memory: 1.99 }), sec0, due, cfg).profile.memory).toBe(2);
  expect(onAnswer(prof({ memory: 0.51 }), sec0, { ...due, right: false }, cfg).profile.memory).toBe(0.5);
  expect(onAnswer(prof(), sec0, ans, cfg).profile.memory).toBe(1);
  // through a real session: each due-review card is the first card back for its skill
  const st = startedAt(2, 6, 0, { nextReviewDay: D0 - 1, noFullUntilDay: D0 - 1 });
  const { steps } = play(C, st, T0, () => "r");
  const sv = served(steps);
  const dues = sv.map((x, i) => i).filter((i) => sv[i].reason === "due-review");
  expect(dues.length).toBeGreaterThan(0);
  for (const i of dues) expect(steps[i + 1].state.profile.memory / steps[i].state.profile.memory).toBeCloseTo(1.05, 10);
});

test("F6: memory moves only on due-review first cards at heights 1 and 2 (a height-3 miss is calculation, not forgetting)", () => {
  const due = { ...ans, wasDueReviewFirstCard: true };
  for (const h of [1, 2] as Height[]) {
    expect(onAnswer(prof(), sec0, { ...due, height: h, right: false }, cfg).profile.memory).toBeCloseTo(cfg.memory.down, 10);
    expect(onAnswer(prof(), sec0, { ...due, height: h }, cfg).profile.memory).toBeCloseTo(cfg.memory.up, 10);
  }
  expect(onAnswer(prof(), sec0, { ...due, height: 3, right: false }, cfg).profile.memory).toBe(1);
  expect(onAnswer(prof(), sec0, { ...due, height: 3 }, cfg).profile.memory).toBe(1);
});

test("comfort: left early at low success → +0.03; three good finishes → −0.01; clamps", () => {
  expect(close({}, endOf("left", 10, 5)).comfort).toBeCloseTo(0.78, 10);
  expect(close({}, endOf("left", 10, 9)).comfort).toBe(0.75); // left but doing well: no change
  expect(close({ comfort: 0.85 }, endOf("left", 10, 5)).comfort).toBe(0.85);
  let st = newState("s", 1);
  for (let i = 1; i <= 3; i++) {
    const o = open({}, {}, st);
    st = onSessionEnd(o.s, endOf(i === 2 ? "extended-done" : "budget", 10, 9), o.ss, cfg);
    expect(st.profile.goodStreak).toBe(i === 3 ? 0 : i);
  }
  expect(st.profile.comfort).toBeCloseTo(0.74, 10);
  expect(close({ comfort: 0.65, goodStreak: 2 }, endOf("budget", 10, 9)).comfort).toBe(0.65);
  expect(close({ goodStreak: 2 }, endOf("bad-day", 10, 9)).goodStreak).toBe(0);
  expect(close({ goodStreak: 2 }, endOf("budget", 10, 5)).goodStreak).toBe(0); // finished but below comfort
});

test("interrupted session changes no profile number and emits no profile event", () => {
  const o = open({ comfort: 0.8, goodStreak: 2, stamina: 20 }, { fadeEffort: 3 });
  const after = onSessionEnd(o.s, endOf("interrupted", 10, 2), o.ss, cfg);
  expect(after.profile).toEqual(o.s.profile);
  const s0 = startSession(startedAt(2, 6, 0), C, T0);
  const s1 = endSession(s0.state, C, T0 + 5000, cfg, { left: false });
  expect(s1.events.map((e) => e.type)).toEqual(["session_end"]);
});

test("stamina: fade at 6 effort → 0.7×13.34+0.3×6; clean end +0.5; never below 8/0.9", () => {
  expect(close({}, endOf("left", 10, 5), { fadeEffort: 6 }).stamina).toBeCloseTo(0.7 * 13.34 + 0.3 * 6, 10);
  expect(close({}, endOf("bad-day", 10, 5), { fadeEffort: 6 }).stamina).toBeCloseTo(0.7 * 13.34 + 0.3 * 6, 10);
  // Task 11 R4a: a clean budget end raises stamina only on a good day (this session has no fast answers): unchanged.
  // The good-day case is in session.test.ts ("stamina (R4a)").
  expect(close({}, endOf("budget", 10, 9)).stamina).toBe(13.34);
  expect(close({}, endOf("extended-done", 10, 9)).stamina).toBeCloseTo(14.34, 10);
  expect(close({}, endOf("budget", 10, 5)).stamina).toBe(13.34); // budget reached but missing a lot: not clean
  expect(close({ stamina: 9 }, endOf("bad-day", 10, 5), { fadeEffort: 0 }).stamina).toBeCloseTo(8 / 0.9, 10);
  expect(close({ stamina: 39.8 }, endOf("extended-done", 10, 9)).stamina).toBe(40);
});

/** A state whose skills hold `n12` attempts at heights 1–2 (right of them `r12`) and `n3` at height 3 (`r3` right). */
function withAttempts(r12: number, n12: number, r3: number, n3: number, base = newState("s", 1)): State {
  const s = startedState({ a1: rec(2, atts(2, r12, n12 - r12, D0)), a2: rec(3, atts(3, r3, n3 - r3, D0)) });
  return { ...base, skills: s.skills, answered: s.answered };
}
const h3After = (s: State) => {
  const o = open({}, {}, s);
  return onSessionEnd({ ...o.s, skills: s.skills }, endOf("budget", 10, 9), o.ss, cfg).profile.h3Share;
};

/**
 * Calculation-weak, with b1 a skill the student does well at height 3: a1/a2 hold 12 height-2 attempts (11 right),
 * b1 12 attempts at height 3 (10 right), b2 12 at height 3 (none right). All due.
 */
function calcWeakState(): State {
  const due = { nextReviewDay: D0 - 1, noFullUntilDay: D0 - 1 };
  return startedState({
    a1: rec(3, atts(2, 11, 1, D0 - 2), due), a2: rec(3, atts(2, 11, 1, D0 - 2), due),
    b1: rec(3, atts(3, 10, 2, D0 - 2), due), b2: rec(3, atts(3, 0, 12, D0 - 2), due),
  });
}

test("calc weak (r12 0.9, r3 0.3) → h3Share 0.5 and a height-2 ramp card before each height-3 card", () => {
  expect(h3After(withAttempts(9, 10, 3, 10))).toBe(0.5);
  const s0 = withProfile(calcWeakState(), { stamina: 30 });
  expect(isCalcWeak(s0, cfg)).toBe(true);
  const { steps } = play(C, s0, T0, () => "r");
  const budget = steps[0].state.session!.budget;
  const sv = served(steps);
  const plain = new Set(["close:winnable", "repair:missing-piece", "repair:confidence", "repair:return", "skipped-drip", "side-door"]);
  const h3 = sv.map((x, i) => ({ x, i })).filter(({ x }) => x.height === 3 && !plain.has(x.reason));
  expect(h3.length).toBeGreaterThan(0);
  let ramps = 0;
  for (const { x, i } of h3) {
    const spent = sv.slice(0, i).reduce((a, y) => a + y.effort, 0); // all answers right: effort is the card costs
    const prev = i > 0 ? sv[i - 1] : null;
    if (prev && prev.height === 2 && prev.skill === x.skill && prev.reason === x.reason) {
      ramps++;
      continue;
    }
    // no ramp: only when no longer calculation-weak, or a ramp card plus this card would not fit
    expect(!isCalcWeak(steps[i].state, cfg) || budget - spent - 2 < 1.5 + 4).toBe(true);
  }
  expect(ramps).toBeGreaterThanOrEqual(1);
  // not calculation-weak: the first height-3 card is served as it is
  const base = withProfile(startedAt(3, 10, 0, { nextReviewDay: D0 - 1, noFullUntilDay: D0 - 1 }), { h3Share: 0.4 });
  expect(isCalcWeak(base, cfg)).toBe(false);
  expect(served(play(C, base, T0, () => "r").steps)[0].height).toBe(3);
});

test("calc weak, no eligible height-2 card → no ramp", () => {
  const c2 = fixture({ drop: ["a1.h2.1", "a1.h2.2", "a1.h2.3", "a2.h2.1", "a2.h2.2", "a2.h2.3", "b1.h2.1", "b1.h2.2", "b1.h2.3", "b2.h2.1", "b2.h2.2", "b2.h2.3"] });
  const s0 = calcWeakState();
  const sv = served(play(c2, s0, T0, () => "r").steps);
  expect(sv.some((x) => x.height === 2)).toBe(false);
  expect(sv.some((x) => x.height === 3)).toBe(true);
});

test("concept weak (r12 0.5, r3 0.8) → h3Share 0.2", () => {
  expect(h3After(withAttempts(5, 10, 8, 10))).toBe(0.2);
});

test("too little data → h3Share stays 0.4", () => {
  expect(h3After(withAttempts(9, 10, 1, 5))).toBe(0.4); // only 5 height-3 attempts
  expect(h3After(withAttempts(8, 9, 3, 10))).toBe(0.4); // only 9 at heights 1–2
  expect(h3After(withAttempts(9, 10, 6, 10))).toBe(0.4); // gap 0.9−0.6−0.2 = 0.1 inside the band
  // and it returns to the default when the evidence goes
  const o = open({ h3Share: 0.5 }, {}, newState("s", 1));
  expect(onSessionEnd(o.s, endOf("budget", 10, 9), o.ss, cfg).profile.h3Share).toBe(0.4);
});

test("liking: fast right +0.5; slow −0.5; extend +2; clamp", () => {
  const lik = (a: Partial<typeof ans>, sec: Partial<SectionRec> = {}) => onAnswer(prof(), section(sec), { ...ans, usualMs: 8000, ...a }, cfg).section.liking;
  expect(lik({ ms: 5000 })).toBe(0.5);
  expect(lik({ ms: 5000, right: false })).toBe(0);
  expect(lik({ ms: 8000 })).toBe(0);
  expect(lik({ ms: 12000 })).toBe(0); // exactly 1.5 × usual is not slower
  expect(lik({ ms: 12001 })).toBe(-0.5);
  expect(lik({ ms: 20000, right: false })).toBe(-0.5);
  expect(lik({ extend: true })).toBe(2);
  expect(lik({ ms: 1, usualMs: null } as never)).toBe(0);
  expect(lik({ extend: true }, { liking: 4.5 })).toBe(5);
  expect(lik({ ms: 20000 }, { liking: -4.8 })).toBe(-5);
  // the msByHeight window keeps the last 20
  let p = prof();
  for (let i = 0; i < 25; i++) p = onAnswer(p, sec0, { ...ans, ms: 1000 + i }, cfg).profile;
  expect(p.msByHeight[2]).toEqual(Array.from({ length: 20 }, (_, i) => 1005 + i));
  // extend cards in a real session
  const s0 = startedAt(2, 12, 0);
  const r = play(C, s0, T0, () => "r", { ms: () => 8000 });
  expect(r.steps.at(-1)!.next.kind === "offer-extend" || r.steps.at(-1)!.next.kind === "end").toBe(true);
  // skip clamps at −5
  const st = startSession(s0, C, T0);
  const card = st.next.kind === "card" ? st.next.card : null;
  const stBad = { ...st.state, sections: { ...st.state.sections, [card!.section]: section({ liking: -5 }) } };
  expect(skip(stBad, C, { card: card!.card, confirmed: true }, T0 + 1000).state.sections[card!.section].liking).toBe(-5);
});

test("liking: cards answered in an extended session raise the section's liking", () => {
  const fast = { 1: Array(8).fill(8000), 2: Array(8).fill(8000), 3: [] as number[] };
  const s0 = withProfile(startedAt(2, 12, 0), { msByHeight: fast });
  const r1 = run(C, startSession(s0, C, T0), T0, () => "r", { ms: () => 4000, offer: "stop" });
  expect(r1.steps.at(-1)!.next.kind).toBe("offer-extend");
  const ext = extend(r1.state, C, r1.now + 1000);
  const card = ext.next.kind === "card" ? ext.next.card : null;
  expect(card!.reason).toBe("extend:liked");
  const before = ext.state.sections[card!.section]?.liking ?? 0;
  const usual = usualMs(ext.state, card!.height)!; // answering at exactly the usual time: only the extend step counts
  const a1 = answer(ext.state, C, { card: card!.card, choice: choiceFor(C, card!, "r"), ms: usual }, r1.now + 2000);
  expect(a1.state.sections[card!.section].liking - before).toBeCloseTo(2, 10);
});

test("profile event: one per session end that changed a number, carrying the four numbers", () => {
  // goodStreak 2: this all-right finish is the third good one, so comfort moves (before Task 11 R4a stamina moved too).
  const s0 = withProfile(startedAt(2, 12, 0), { goodStreak: 2 });
  const { state, steps } = play(C, s0, T0, () => "r");
  const ev = steps.flatMap((s) => s.events).filter((e) => e.type === "profile");
  const last = steps.at(-1)!;
  expect(last.next.kind).toBe("end");
  expect(ev.length).toBe(1);
  const { comfort, memory, h3Share, stamina } = state.profile;
  expect(ev[0].data).toEqual({ comfort, memory, h3Share, stamina });
  // a session closed with nothing answered changes nothing
  const e0 = endSession(startSession(s0, C, T0).state, C, T0 + 1000);
  expect(e0.events.map((e) => e.type)).toEqual(["session_end"]);
  // JSON round trip
  expect(JSON.parse(JSON.stringify(state))).toEqual(state);
});

/** `pattern` gets the answer number across all sessions, so "40% right" is 40% over the whole run. */
function lived(pattern: (i: number) => "r" | "w", sessions: number, takesMore = false): State {
  let state = newState("s", 3);
  let now = T0;
  let i = 0;
  for (let n = 0; n < sessions; n++) {
    const r = play(C, state, now, () => pattern(i++), { offer: "stop" });
    state = r.state;
    // `takesMore`: accepts "5 more" when offered (fix round 1: stamina grows only on an extended session)
    if (state.session && takesMore) {
      const x = run(C, extend(state, C, r.now + 1000), r.now + 1000, () => pattern(i++), { offer: "stop" });
      state = x.state;
    }
    if (state.session) state = endSession(state, C, r.now + 1000).state;
    now = nextDay(now);
  }
  return state;
}
const nextBudget = (s: State, days: number) => startSession(s, C, T0 + days * 86_400_000).state.session!.budget;

test("weak never asked more: after 5 sessions answering 40% right, budget ≤ budget of a 90%-right student", () => {
  const weak = lived((i) => (i % 5 === 1 || i % 5 === 4 ? "r" : "w"), 5);
  // Stamina grows only on an accepted "5 more", which needs a usual level-3 time (5 samples). Change 4 fix round 1: at
  // most one level-3 card per ladder session, so the strong student's first offer comes in session 6.
  const strong = lived((i) => (i % 10 === 9 ? "w" : "r"), 6, true);
  expect(weak.profile.stamina).toBeLessThanOrEqual(cfg.budget.staminaDefault);
  expect(weak.profile.stamina).toBeGreaterThanOrEqual(8 / 0.9);
  expect(strong.profile.stamina).toBeGreaterThan(cfg.budget.staminaDefault);
  expect(nextBudget(weak, 5)).toBeLessThan(nextBudget(strong, 6));
});

test("dials differ: 7 sessions each for an all-right and a half-wrong student → their profiles and next session's first 5 Served differ", () => {
  const good = lived(() => "r", 7, true); // stamina grows only on an accepted "5 more"
  const half = lived((i) => (i % 2 === 0 ? "r" : "w"), 7);
  expect(good.profile).not.toEqual(half.profile);
  expect(good.profile.stamina).toBeGreaterThan(half.profile.stamina);
  const first5 = (s: State) => served(play(C, s, T0 + 7 * 86_400_000, () => "r").steps).slice(0, 5).map((x) => `${x.card}#${x.variant}:${x.reason}:${x.height}`);
  expect(first5(good)).not.toEqual(first5(half));
  expect(nextBudget(good, 7)).toBeGreaterThan(nextBudget(half, 7));
});

test("memory moves once when a ramp precedes a due-review height-3 card", () => {
  const s0 = withProfile(calcWeakState(), { stamina: 30 });
  const { steps } = play(C, s0, T0, () => "r");
  const sv = served(steps);
  const i = sv.findIndex((x, k) => x.height === 3 && x.reason === "due-review" && k > 0 && sv[k - 1].height === 2 && sv[k - 1].reason === "due-review" && sv[k - 1].skill === x.skill);
  expect(i).toBeGreaterThan(0);
  const mem = (k: number) => steps[k].state.profile.memory;
  expect(mem(i) / mem(i - 1)).toBeCloseTo(1.05, 10); // the ramp card (first back)
  expect(mem(i + 1)).toBeCloseTo(mem(i), 10); // the height-3 card: unchanged
});

test("interrupted end after answering a due-review card emits no profile event", () => {
  const st = startedAt(2, 6, 0, { nextReviewDay: D0 - 1, noFullUntilDay: D0 - 1 });
  let cur = startSession(st, C, T0);
  let n = 0;
  let answeredDue = false;
  while (cur.next.kind === "card" && !answeredDue) {
    const c = cur.next.card;
    answeredDue = c.reason === "due-review";
    cur = answer(cur.state, C, { card: c.card, choice: choiceFor(C, c, "r"), ms: 8000 }, T0 + 1000 * ++n);
  }
  expect(answeredDue).toBe(true);
  expect(cur.state.profile.memory).not.toBe(1); // memory moved, so the start snapshot differs
  const end = endSession(cur.state, C, T0 + 100_000, cfg, { left: false });
  expect(end.next.kind === "end" && end.next.end.kind).toBe("interrupted");
  expect(end.events.map((e) => e.type)).toEqual(["session_end"]);
});

test("a fade never raises stamina", () => {
  expect(close({ stamina: 10 }, endOf("left", 10, 5), { fadeEffort: 20 }).stamina).toBe(10);
  expect(close({ stamina: 10 }, endOf("bad-day", 10, 5), { fadeEffort: 10 }).stamina).toBe(10);
});

test("ramp same-skill run: no ramp when the skill already ran maxSameSkillRun - 1 cards", () => {
  const s0 = withProfile(calcWeakState(), { stamina: 30 });
  const o = startSession(s0, C, T0).state;
  const mk = (skill: string) => ({ served: { card: `${skill}.h3`, variant: 0, skill, section: "x", height: 3 as Height, reason: "due-review" as const, effort: 4 }, rng: o.rng });
  const room = 20;
  const run = (last: string[]) => rampBefore(s0, C, mk("b1"), last, D0, room, cfg);
  expect(run([])).not.toBeNull();
  expect(run(["b1", "a1"])).not.toBeNull(); // run 0 + ramp + h3 = 2
  expect(run(["a1", "b1"])).not.toBeNull(); // run 1 + 2 = 3, at the limit
  expect(run(["b1", "b1"])).toBeNull(); // run 2 + 2 = 4, over the limit
});
