import { test, expect } from "vitest";
import { defaultConfig as cfg } from "../src/config.js";
import { newState } from "../src/state.js";
import { dayOf } from "../src/time.js";
import { answer, endSession, extend, startSession } from "../src/session.js";
import type { Served } from "../src/types.js";
import type { EndInfo, Height, SkillRec, State, Step } from "../src/types.js";
import { fixture } from "./fixture.js";
import {
  T0, anyEligible, atts, choiceFor, lastStep, nextDay, play, rec, run, served, startedState, withProfile,
} from "./helpers.js";

const C = fixture();
const D0 = dayOf(T0);
const endOf = (st: Step): EndInfo => {
  if (st.next.kind !== "end") throw new Error(`expected end, got ${st.next.kind}`);
  return st.next.end;
};
const allR = () => "r" as const;

/** All four skills started at `height`, not due, no height-3 step for a while, `r` right / `w` wrong there. */
function startedAt(height: Height, r: number, w: number, over: Record<string, Partial<SkillRec>> = {}): State {
  const skills: Record<string, SkillRec> = {};
  for (const id of ["a1", "a2", "b1", "b2"]) {
    skills[id] = rec(height, atts(height, r, w, D0 - 2), { nextReviewDay: D0 + 20, noFullUntilDay: D0 + 20, ...over[id] });
  }
  return startedState(skills);
}

test("first session: opens open:liked, ends by budget, effort ≤ 12 and ≥ 8, streak kept", () => {
  const { state, steps } = play(C, newState("s", 1), T0, allR);
  expect(served(steps)[0].reason).toBe("open:liked");
  const end = endOf(lastStep(steps));
  expect(end.kind).toBe("budget");
  expect(end.effort).toBeLessThanOrEqual(12);
  expect(end.effort).toBeGreaterThanOrEqual(8);
  expect(end.streakKept).toBe(true);
  expect(end.cards).toBe(served(steps).length);
  expect(state.day).toEqual({ day: D0, effort: end.effort, streakKept: true });
  expect(state.session).toBeNull();
  expect(state.sessionCount).toBe(1);
  expect(state.lastSessionDay).toBe(D0);
});

test("all right at height 2: the budget keeps a wrong close card in reserve; a height-3 skill → fewer cards", () => {
  // Budget 12.006, reserve effort.h1 + effort.wrong = 2: six height-2 cards (9), then 1.006 left fits nothing
  // plus the reserve → closing; the last card was right and winnable, so no close card is needed.
  const { steps } = play(C, startedAt(2, 4, 1), T0, allR);
  const cards = served(steps);
  expect(cards.length).toBe(6);
  expect(cards.every((c) => c.height === 2)).toBe(true);
  expect(endOf(lastStep(steps))).toMatchObject({ kind: "budget", effort: 9, cards: 6, right: 6 });

  const h3 = startedAt(2, 4, 1, { b2: { height: 3, attempts: atts(3, 10, 0, D0 - 2), noFullUntilDay: null } });
  const r3 = play(C, h3, T0, allR);
  const c3 = served(r3.steps);
  expect(c3.some((c) => c.height === 3)).toBe(true);
  expect(c3.length).toBeLessThan(6);
  const e3 = endOf(lastStep(r3.steps));
  expect(e3.kind).toBe("budget");
  expect(e3.effort).toBeLessThanOrEqual(12);
});

test("dont-know costs card effort only; wrong costs +1", () => {
  const first = startSession(newState("s", 1), C, T0);
  if (first.next.kind !== "card") throw new Error("no card");
  const c1 = first.next.card;
  const s1 = answer(first.state, C, { card: c1.card, choice: "dont-know", ms: 8000 }, T0 + 10_000);
  expect(s1.state.session!.spent).toBe(c1.effort);
  expect(s1.state.day!.effort).toBe(c1.effort);
  expect(s1.feedback).toEqual({ right: false, correctIndex: 0 });
  if (s1.next.kind !== "card") throw new Error("no card");
  const c2 = s1.next.card;
  const s2 = answer(s1.state, C, { card: c2.card, choice: choiceFor(C, c2, "w"), ms: 8000 }, T0 + 20_000);
  expect(s2.state.session!.spent).toBe(c1.effort + c2.effort + cfg.effort.wrong);
  expect(s2.state.day!.effort).toBe(c1.effort + c2.effort + cfg.effort.wrong);
  expect(s2.feedback).toEqual({ right: false, correctIndex: 0, tag: "recall-gap" });
});

test("no session ends on a wrong answer", () => {
  const fn = (s: Served) => (s.reason === "close:winnable" || s.reason === "repair:confidence" ? "r" : "w");
  let state = startedAt(2, 2, 1);
  let now = T0;
  for (let i = 0; i < 5; i++) {
    const r = play(C, state, now, fn);
    expect(served(r.steps).length, `session ${i} served nothing`).toBeGreaterThanOrEqual(1);
    const last = lastStep(r.steps);
    const end = endOf(last);
    // a wrong last answer is only allowed when nothing at all is left to serve
    if (last.feedback?.right !== true) {
      expect(end.kind, `session ${i}`).toBe("content-exhausted");
      expect(anyEligible(r.state, C, dayOf(r.now))).toBe(false);
    }
    state = r.state;
    now = nextDay(now);
  }
});

test("a weak student over 5 sessions always gets ≥ 1 card while any card is eligible", () => {
  let state = startedAt(2, 1, 2);
  let now = T0;
  let cards = 0;
  for (let i = 0; i < 5; i++) {
    const eligible = anyEligible(state, C, dayOf(now));
    const r = play(C, state, now, () => "w");
    const n = served(r.steps).length;
    if (eligible) expect(n, `session ${i}`).toBeGreaterThanOrEqual(1);
    else expect(endOf(lastStep(r.steps)).kind).toBe("content-exhausted");
    cards += n;
    state = r.state;
    now = nextDay(now);
  }
  expect(cards).toBeGreaterThan(10);
});

/** The bad-day run of the next test, answering the first `wrongCloses` close cards wrong. */
function badDayRun(wrongCloses: number) {
  const start = withProfile(startedAt(2, 2, 1), { stamina: 30 });
  let closes = 0;
  return play(C, start, T0, (s: Served) => {
    if (s.reason !== "close:winnable") return "w";
    return closes++ < wrongCloses ? "w" : "r";
  });
}

test("close card answered wrong once / twice → one more close card each time, then the end", () => {
  for (const k of [1, 2]) {
    const { steps } = badDayRun(k);
    const cards = served(steps);
    expect(cards.filter((c) => c.reason === "close:winnable").length, `k=${k}`).toBe(k + 1);
    expect(endOf(lastStep(steps)).kind).toBe("bad-day");
    expect(lastStep(steps).feedback?.right).toBe(true);
  }
  // every close card wrong: 1 + maxExtraClose close cards, then the session ends regardless
  const { steps } = badDayRun(99);
  expect(served(steps).filter((c) => c.reason === "close:winnable").length).toBe(1 + cfg.sessionEnd.maxExtraClose);
  expect(endOf(lastStep(steps)).kind).toBe("bad-day");
});

test("three bad moments in 8 cards → one winnable card → end bad-day, streakKept true", () => {
  const start = withProfile(startedAt(2, 2, 1), { stamina: 30 });
  const fn = (s: Served) => (s.reason === "close:winnable" ? "r" : "w");
  const { steps } = play(C, start, T0, fn);
  const cards = served(steps);
  expect(cards.filter((c) => c.reason === "close:winnable").length).toBe(1);
  expect(cards[cards.length - 1].reason).toBe("close:winnable");
  expect(cards.length).toBeLessThanOrEqual(9);
  const end = endOf(lastStep(steps));
  expect(end.kind).toBe("bad-day");
  expect(end.streakKept).toBe(true);
  expect(end.cards).toBe(cards.length);
  expect(lastStep(steps).state.day!.streakKept).toBe(true);
  expect(lastStep(steps).feedback?.right).toBe(true);
});

test("three slow answers (ms > 2× usual) → bad-day end", () => {
  const usual = { 1: Array(10).fill(8000), 2: Array(10).fill(8000), 3: Array(10).fill(8000) };
  const start = withProfile(startedAt(2, 4, 1), { msByHeight: usual });
  const { steps } = play(C, start, T0, allR, { ms: (_s, i) => (i < 3 ? 17_000 : 8000) });
  const cards = served(steps);
  expect(cards.length).toBe(4);
  expect(cards[3].reason).toBe("close:winnable");
  expect(endOf(lastStep(steps))).toMatchObject({ kind: "bad-day", cards: 4, streakKept: true });

  // 16 s is exactly 2× usual: not slow
  const ok = play(C, start, T0, allR, { ms: () => 16_000 });
  expect(endOf(lastStep(ok.steps)).kind).toBe("budget");
});

const fastStart = () =>
  withProfile(startedAt(2, 4, 1), { msByHeight: { 1: Array(10).fill(20_000), 2: Array(10).fill(20_000), 3: Array(10).fill(20_000) } });

test("fast + above comfort at budget → offer-extend; extend → exactly 5 cards → extended-done", () => {
  const p = play(C, fastStart(), T0, allR);
  const last = lastStep(p.steps);
  expect(last.next).toEqual({ kind: "offer-extend" });
  expect(last.state.session).not.toBeNull();
  const ex = extend(last.state, C, p.now + 5000);
  expect(ex.state.session!.phase).toBe("extend");
  expect(ex.state.session!.extended).toBe(true);
  const r = run(C, ex, p.now + 5000, allR);
  const cards = served([ex, ...r.steps]);
  expect(cards.length).toBe(5);
  expect(cards.every((c) => c.reason === "extend:liked")).toBe(true);
  const end = endOf(lastStep(r.steps));
  expect(end.kind).toBe("extended-done");
  expect(end.cards).toBe(served(p.steps).length + 5);

  // slow at the usual pace: no offer
  const slow = play(C, fastStart(), T0, allR, { ms: () => 25_000 });
  expect(endOf(lastStep(slow.steps)).kind).toBe("budget");
});

test("declining the offer → end budget", () => {
  const p = play(C, fastStart(), T0, allR);
  const last = lastStep(p.steps);
  expect(last.next.kind).toBe("offer-extend");
  const e = endSession(last.state, C, p.now + 5000);
  const end = endOf(e);
  expect(end.kind).toBe("budget");
  expect(e.state.session).toBeNull();
  expect(e.events.map((x) => x.type)).toEqual(["session_end", "profile"]);
  // a stale answer while the offer is pending keeps the offer
  const st = answer(last.state, C, { card: "a1.h1.1", choice: 0, ms: 1 }, p.now + 6000);
  expect(st.next).toEqual({ kind: "offer-extend" });
  expect(st.state).toBe(last.state);
});

test("daily cap: total effort for the day never exceeds 40; next start → end daily-cap", () => {
  const skills: Record<string, SkillRec> = {};
  for (const id of ["a1", "a2", "b1", "b2"]) skills[id] = rec(3, atts(3, 10, 0, D0 - 2), { nextReviewDay: D0 + 20 });
  const wrongHeavy = (s: Served, i: number) => (s.reason === "close:winnable" || i % 3 === 0 ? "r" : "w");
  for (const answers of [allR, wrongHeavy]) {
    let state = startedState(skills);
    let now = T0;
    const efforts: number[] = [];
    let capped: Step | null = null;
    for (let i = 0; i < 20 && !capped; i++) {
      const r = play(C, state, now, answers);
      for (const st of r.steps) expect(st.state.day!.effort).toBeLessThanOrEqual(cfg.budget.dailyCap);
      const end = endOf(lastStep(r.steps));
      if (end.kind === "daily-cap") capped = lastStep(r.steps);
      else efforts.push(end.effort);
      state = r.state;
      now = r.now + 60_000;
    }
    expect(capped).not.toBeNull();
    expect(efforts.length).toBeGreaterThan(1);
    expect(efforts.reduce((a, b) => a + b, 0)).toBe(state.day!.effort);
    // no session starts once the cap less every possible close card leaves less than a height-1 card
    expect(cfg.budget.dailyCap - state.day!.effort - (1 + cfg.sessionEnd.maxExtraClose) * 2).toBeLessThan(cfg.effort.h1);
    expect(capped!.events).toEqual([]);
    expect(capped!.state.session).toBeNull();
    expect(endOf(capped!)).toEqual({ kind: "daily-cap", effort: 0, cards: 0, right: 0, fixed: 0, streakKept: true });
    expect(startSession(state, C, nextDay(T0)).next.kind).toBe("card");
  }
});

test("comeback after 3+ days: budget 8, first cards comeback:solid at height 1", () => {
  const skills: Record<string, SkillRec> = {
    a1: rec(3, atts(3, 6, 0, D0 - 6), { solidDays: [D0 - 7, D0 - 6], nextReviewDay: D0 + 10 }),
    a2: rec(2, atts(2, 2, 2, D0 - 6), { nextReviewDay: D0 + 10 }),
    b1: rec(2, atts(2, 4, 0, D0 - 6), { nextReviewDay: D0 + 10 }),
  };
  const start = startedState(skills, { lastSessionDay: D0 - 3, sessionCount: 4 });
  const first = startSession(start, C, T0);
  expect(first.state.session).toMatchObject({ budget: 8, comeback: true });
  const { steps } = run(C, first, T0, allR);
  const cards = served([first, ...steps]);
  for (const c of cards.slice(0, cfg.session.openCards)) {
    expect(c).toMatchObject({ reason: "comeback:solid", height: 1, section: "u.t1/A" });
  }
  expect(endOf(lastStep(steps)).effort).toBeLessThanOrEqual(8);

  // 2 days away: a normal session
  const normal = startSession({ ...start, lastSessionDay: D0 - 2 }, C, T0);
  expect(normal.state.session!.comeback).toBe(false);
  expect(normal.state.session!.budget).toBeCloseTo(13.34 * 0.9, 10);
});

test("stale answer (wrong card id) → state unchanged, no events", () => {
  const first = startSession(newState("s", 1), C, T0);
  const r = answer(first.state, C, { card: "nope", choice: 0, ms: 5 }, T0 + 1000);
  expect(r.state).toBe(first.state);
  expect(r.events).toEqual([]);
  expect(r.moments).toEqual([]);
  expect(r.next).toEqual(first.next);
  // no open session: same last end
  const done = play(C, newState("s", 1), T0, allR);
  const again = answer(done.state, C, { card: "a1.h1.1", choice: 0, ms: 5 }, done.now + 1000);
  expect(again.state).toBe(done.state);
  expect(again.next).toEqual(lastStep(done.steps).next);
});

test("startSession over an open session → session_end interrupted, then session_start", () => {
  const p = play(C, newState("s", 1), T0, ["r", "r", "w"]);
  const open = p.state;
  expect(open.session).not.toBeNull();
  const fresh = startSession(open, C, p.now + 60_000);
  const types = fresh.events.map((e) => e.type);
  expect(types.slice(0, 3)).toEqual(["session_end", "session_start", "card_served"]);
  expect(fresh.events[0].data).toMatchObject({ kind: "interrupted", cards: 3, right: 2 });
  expect(fresh.events[0].session).toBe(open.session!.id);
  expect(fresh.events[1].session).toBe(fresh.state.session!.id);
  expect(fresh.state.session!.id).toBe("s:s2");
  expect(fresh.state.profile).toEqual(open.profile);
  expect(fresh.state.session!.spent).toBe(0);
});

test("content exhausted → end content-exhausted, no throw, no repeat", () => {
  const drop = ["a2", "b1", "b2"].flatMap((s) => [`${s}.h1.1`, `${s}.h1.2`, `${s}.h1.3`, `${s}.h2.1`, `${s}.h2.2`, `${s}.h2.3`, `${s}.h3`]);
  const one = fixture({ drop: [...drop, "a1.h3"] });
  let state = newState("s", 3);
  let now = T0;
  const all: Served[] = [];
  const kinds: string[] = [];
  for (let i = 0; i < 4; i++) {
    const r = play(one, state, now, allR);
    all.push(...served(r.steps));
    kinds.push(endOf(lastStep(r.steps)).kind);
    state = r.state;
    now = nextDay(now);
  }
  expect(kinds).toEqual(["content-exhausted", "content-exhausted", "content-exhausted", "content-exhausted"]);
  const keys = all.map((s) => `${s.card}#${s.variant}`);
  expect(new Set(keys).size).toBe(keys.length);
  expect(keys.length).toBe(6);
  expect(all.every((s) => s.skill === "a1")).toBe(true);
});

test("events: ids unique and increasing; JSON round-trip of state", () => {
  const fn = (s: Served, i: number) => (i % 3 === 1 && s.reason !== "close:winnable" ? "w" : "r");
  let state = startedAt(2, 3, 1);
  let now = T0;
  const events: Step["events"] = [];
  for (let i = 0; i < 3; i++) {
    const r = play(C, state, now, fn);
    for (const st of r.steps) {
      events.push(...st.events);
      expect(JSON.parse(JSON.stringify(st.state))).toEqual(st.state);
    }
    state = r.state;
    now = nextDay(now);
  }
  const seqs = events.map((e) => Number(e.id.split(":")[1]));
  expect(events.every((e) => e.id.startsWith("s:") && e.student === "s")).toBe(true);
  for (let i = 1; i < seqs.length; i++) expect(seqs[i]).toBe(seqs[i - 1] + 1);
  expect(seqs[seqs.length - 1]).toBe(state.seq);
  expect(events.filter((e) => e.type === "session_start").length).toBe(3);
  expect(events.filter((e) => e.type === "session_end").length).toBe(3);
  const served1 = events.find((e) => e.type === "card_served")!;
  expect(served1.data).toHaveProperty("reason");
  const ans = events.find((e) => e.type === "answer")!;
  expect(Object.keys(ans.data).sort()).toEqual(["card", "choice", "height", "ms", "right", "skill", "tag", "variant"]);
  // the state survives a JSON round trip mid-session too
  const mid = play(C, startedAt(2, 3, 1), T0, ["r", "w"]).state;
  const back = JSON.parse(JSON.stringify(mid)) as State;
  expect(back).toEqual(mid);
  expect(JSON.stringify(Object.values(mid.session!))).not.toContain("undefined");
});

test("determinism: two identical runs give identical JSON", () => {
  const base = startedAt(2, 3, 1);
  const frozen = JSON.stringify(base);
  const fn = (_s: Served, i: number) => (i % 4 === 2 ? "w" : "r");
  const go = () => {
    let state = base;
    let now = T0;
    const out: Step[] = [];
    for (let i = 0; i < 3; i++) {
      const r = play(C, state, now, fn);
      out.push(...r.steps);
      state = r.state;
      now = nextDay(now);
    }
    return JSON.stringify(out);
  };
  expect(go()).toBe(go());
  expect(JSON.stringify(base)).toBe(frozen);
});

test("state.day resets on a new local day; seen gets each served card", () => {
  const p = play(C, newState("s", 1), T0, allR);
  const cards = served(p.steps);
  expect(p.state.seen.slice(-cards.length)).toEqual(cards.map((c) => ({ card: c.card, variant: c.variant, day: D0 })));
  const t = startSession(p.state, C, nextDay(T0));
  expect(t.state.day).toEqual({ day: D0 + 1, effort: 0, streakKept: false });
});

test("endSession left: kind left, fadeEffort recorded; endSession with no session changes nothing", () => {
  const p = play(C, newState("s", 1), T0, ["r", "r"]);
  const spent = p.state.session!.spent;
  const e = endSession(p.state, C, p.now + 1000);
  expect(endOf(e)).toMatchObject({ kind: "left", cards: 2, right: 2 });
  expect(e.events.map((x) => x.type)).toEqual(["session_end", "profile"]);
  expect(e.events[0].data).toMatchObject({ kind: "left", fadeEffort: spent });
  expect(spent).toBeGreaterThan(0);
  expect(e.state.session).toBeNull();
  expect(endSession(p.state, C, p.now + 1000, undefined, { left: true }).events[0].data).toMatchObject({ kind: "left", fadeEffort: spent });
  // explicit left: false → interrupted, no fade
  const i = endSession(p.state, C, p.now + 1000, undefined, { left: false });
  expect(i.events[0].data).toMatchObject({ kind: "interrupted", fadeEffort: null });
  const again = endSession(e.state, C, p.now + 2000);
  expect(again.state).toBe(e.state);
  expect(again.events).toEqual([]);
});

test("extend: a wrong answer on the last extra card is followed by a close card", () => {
  const p = play(C, fastStart(), T0, allR);
  const ex = extend(lastStep(p.steps).state, C, p.now + 5000);
  const r = run(C, ex, p.now + 5000, (s: Served, i: number) => (i === 4 ? "w" : "r"));
  const cards = served([ex, ...r.steps]);
  expect(cards.map((c) => c.reason)).toEqual([...Array(5).fill("extend:liked"), "close:winnable"]);
  const last = lastStep(r.steps);
  expect(last.feedback?.right).toBe(true);
  expect(endOf(last).kind).toBe("extended-done");
});

test("budget comes from cfg: max(minimumDay, stamina × (1 − margin))", () => {
  const custom = { ...cfg, budget: { ...cfg.budget, minimumDay: 4, staminaDefault: 4 } };
  const s = withProfile(newState("s", 1), { stamina: 4 });
  const first = startSession(s, C, T0, custom);
  expect(first.state.session!.budget).toBe(4);
  const big = startSession(withProfile(newState("s", 1), { stamina: 100 }), C, T0);
  // capped by dailyCap − day.effort − (1 + maxExtraClose) × (effort.h1 + effort.wrong)
  expect(big.state.session!.budget).toBe(cfg.budget.dailyCap - 3 * (cfg.effort.h1 + cfg.effort.wrong));
});
