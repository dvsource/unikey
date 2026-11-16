import { test, expect } from "vitest";
import { defaultConfig as cfg } from "../src/config.js";
import { migrate, newState } from "../src/state.js";
import { pickAny } from "../src/pick.js";
import { DAY_MS, dayOf } from "../src/time.js";
import { answer, endSession, extend, skip, startSession } from "../src/session.js";
import type { Served } from "../src/types.js";
import type { Content, EndInfo, Height, SkillRec, State, Step } from "../src/types.js";
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

test("first session: opens open:liked, ends by budget, effort ≤ 12 and within one card of 8, streak kept", () => {
  const { state, steps } = play(C, newState("s", 1), T0, allR);
  expect(served(steps)[0].reason).toBe("open:liked");
  const end = endOf(lastStep(steps));
  expect(end.kind).toBe("budget");
  expect(end.effort).toBeLessThanOrEqual(12);
  // F1: a right last answer ends the session with no close card, so a minimum-day budget may end a card short of 8;
  // the budget end keeps the streak anyway.
  expect(end.effort).toBeGreaterThan(cfg.budget.minimumDay - cfg.effort.h2);
  expect(end.streakKept).toBe(true);
  expect(end.cards).toBe(served(steps).length);
  expect(state.day).toEqual({ day: D0, effort: end.effort, streakKept: true });
  expect(state.session).toBeNull();
  expect(state.sessionCount).toBe(1);
  expect(state.lastSessionDay).toBe(D0);
});

test("all right at height 2: the budget keeps a wrong close card in reserve; a height-3 skill costs more", () => {
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
  // Before Task 11 the height-3 card came back with new variants card after card (so fewer cards); R5 keeps a card
  // away for session.returnAfterCards serves, so the height-3 card is served once here and costs 4 of the budget.
  expect(c3.filter((c) => c.height === 3).length).toBe(1);
  const e3 = endOf(lastStep(r3.steps));
  expect(e3.kind).toBe("budget");
  expect(e3.effort).toBeLessThanOrEqual(12);
});

// ---------- final review F1: no close card after a right answer ----------

/**
 * A student in their first sessions (minimum-day budget 8), all four skills started at height 2. Change 4: ladder off
 * (as for a stored state from before it), so the cards stay at the records' height 2 and the session ends below 8.
 */
const firstSessions = () => ({ ...startedAt(2, 4, 1), sessionCount: 0, ladder: null });

test("F1: budget spent after a right answer → the session ends there (budget), no close card, streak kept under the minimum day", () => {
  const { steps } = play(C, firstSessions(), T0, allR);
  const cards = served(steps);
  expect(cards.some((c) => c.reason === "close:winnable")).toBe(false);
  const end = endOf(lastStep(steps));
  expect(end.kind).toBe("budget");
  expect(end.effort).toBeLessThan(cfg.budget.minimumDay);
  expect(end.streakKept).toBe(true);
  expect(lastStep(steps).state.day!.streakKept).toBe(true);
});

test("F1: budget spent after a wrong answer → a close card as before", () => {
  const n = served(play(C, firstSessions(), T0, allR).steps).length;
  const { steps } = play(C, firstSessions(), T0, (_s, i) => (i === n - 1 ? "w" : "r"));
  const cards = served(steps);
  expect(cards.length).toBe(n + 1);
  expect(cards[n].reason).toBe("close:winnable");
  expect(lastStep(steps).feedback?.right).toBe(true);
  expect(endOf(lastStep(steps)).kind).toBe("budget");
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

test("no session ends on a wrong answer, except after 1 + maxExtraClose close cards all wrong (close cards answered by the pattern too)", () => {
  // F14: close cards are answered as the pattern says, not always right.
  const patterns: ((s: Served, i: number) => "r" | "w" | "dk")[] = [
    () => "w", (_s, i) => (i % 2 ? "w" : "r"), (_s, i) => (i % 3 === 0 ? "dk" : i % 3 === 1 ? "w" : "r"), (_s, i) => (i % 4 === 3 ? "r" : "w"),
  ];
  let onRight = 0;
  let afterCloses = 0;
  for (const [pi, fn] of patterns.entries()) {
    let state = startedAt(2, 2, 1);
    let now = T0;
    for (let i = 0; i < 5; i++) {
      const r = play(C, state, now, fn);
      const cards = served(r.steps);
      expect(cards.length, `pattern ${pi} session ${i} served nothing`).toBeGreaterThanOrEqual(1);
      const end = endOf(lastStep(r.steps));
      const answered = r.steps.filter((st) => st.feedback !== undefined);
      if (answered[answered.length - 1]?.feedback?.right === true) onRight++;
      else {
        const tail = cards.slice(-(1 + cfg.sessionEnd.maxExtraClose));
        const closesAllWrong = tail.length === 1 + cfg.sessionEnd.maxExtraClose && tail.every((c) => c.reason === "close:winnable")
          && answered.slice(-tail.length).every((st) => st.feedback!.right === false);
        const exhausted = end.kind === "content-exhausted" && !anyEligible(r.state, C, dayOf(r.now));
        expect(closesAllWrong || exhausted || end.kind === "daily-cap", `pattern ${pi} session ${i}: ${end.kind} after ${cards.map((c) => c.reason).join(",")}`).toBe(true);
        if (closesAllWrong) afterCloses++;
      }
      state = r.state;
      now = nextDay(now);
    }
  }
  expect(onRight).toBeGreaterThan(0);
  expect(afterCloses).toBeGreaterThan(0); // the all-wrong pattern reaches the close-card limit
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

/**
 * The fixture plus b3, a copy of b1 in section B (not started). Change 2: the bad-day run below leaves a1, b1 and a2
 * (two misses each) and a wrong close card twice on one skill leaves it too, so the four-skill fixture runs out.
 */
function withB3(): Content {
  const c = structuredClone(C);
  const ids = (h: 1 | 2 | 3) => c.skills["b1"].cards[h].map((id) => id.replace("b1.", "b3."));
  for (const id of Object.keys(c.cards).filter((x) => x.startsWith("b1."))) {
    const nid = id.replace("b1.", "b3.");
    c.cards[nid] = { ...structuredClone(c.cards[id]), id: nid, skill: "b3" };
  }
  c.skills["b3"] = { ...c.skills["b1"], id: "b3", name: "b3", cards: { 1: ids(1), 2: ids(2), 3: ids(3) } };
  c.sections["u.t1/B"] = { ...c.sections["u.t1/B"], skills: [...c.sections["u.t1/B"].skills, "b3"] };
  return c;
}
const C5 = withB3();

/** The bad-day run of the next test, answering the first `wrongCloses` close cards wrong. */
function badDayRun(wrongCloses: number) {
  const start = withProfile(startedAt(2, 2, 1), { stamina: 30 });
  let closes = 0;
  return play(C5, start, T0, (s: Served) => {
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
  const p = play(C, fastStart(), T0, allR, { offer: "stop" });
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

  // Fix round 1 (finding 4b): "5 more" no longer needs answers faster than usual. At the usual pace it is offered;
  // with a slow answer (> 2× usual) in the session it is not.
  const usualPace = play(C, fastStart(), T0, allR, { ms: () => 25_000, offer: "stop" });
  expect(lastStep(usualPace.steps).next).toEqual({ kind: "offer-extend" });
  const slow = play(C, fastStart(), T0, allR, { ms: (_s, i) => (i === 1 ? 41_000 : 20_000) });
  expect(endOf(lastStep(slow.steps)).kind).toBe("budget");
  // below comfort: no offer
  const half = play(C, fastStart(), T0, (_s, i) => (i % 2 ? "w" : "r"));
  expect(lastStep(half.steps).next.kind).toBe("end");
});

test("declining the offer → end budget", () => {
  const p = play(C, fastStart(), T0, allR, { offer: "stop" });
  const last = lastStep(p.steps);
  expect(last.next.kind).toBe("offer-extend");
  const e = endSession(last.state, C, p.now + 5000);
  const end = endOf(e);
  expect(end.kind).toBe("budget");
  expect(e.state.session).toBeNull();
  // Fix round 1 (finding 4a): a declined offer leaves stamina as it was, so no profile number moves here.
  expect(e.events.map((x) => x.type)).toEqual(["session_end"]);
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
  // Budget 8 is the minimum day: the session may use its close reserve to reach it (Task 11), then one close card.
  expect(endOf(lastStep(steps)).effort).toBeLessThanOrEqual(8 + cfg.effort.h1 + cfg.effort.wrong);
  expect(endOf(lastStep(steps)).streakKept).toBe(true);

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
  const p = play(C, fastStart(), T0, allR, { offer: "stop" });
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
  // sessionCount 4: past the budget.firstSessions small first sessions (Task 11 R4c)
  const s = withProfile({ ...newState("s", 1), sessionCount: 4 }, { stamina: 4 });
  const first = startSession(s, C, T0, custom);
  expect(first.state.session!.budget).toBe(4);
  const big = startSession(withProfile({ ...newState("s", 1), sessionCount: 4 }, { stamina: 100 }), C, T0);
  // capped by dailyCap − day.effort − (1 + maxExtraClose) × (effort.h1 + effort.wrong)
  expect(big.state.session!.budget).toBe(cfg.budget.dailyCap - 3 * (cfg.effort.h1 + cfg.effort.wrong));
});

// ---------- tuning pass (Task 11) ----------

test("stamina (finding 4a): grows only after an accepted \"5 more\" finished with no fade; a clean budget end leaves it", () => {
  const before = fastStart().profile.stamina;
  // offered and declined → budget end: unchanged
  const p = play(C, fastStart(), T0, allR, { offer: "stop" });
  expect(lastStep(p.steps).next.kind).toBe("offer-extend");
  const e = endSession(lastStep(p.steps).state, C, p.now + 5000);
  expect(endOf(e).kind).toBe("budget");
  expect(e.state.profile.stamina).toBe(before);
  // accepted and finished, no slow answer → + extendStep
  const ex = extend(lastStep(p.steps).state, C, p.now + 5000);
  const done = run(C, ex, p.now + 5000, allR, { ms: () => 20_000 });
  expect(endOf(lastStep(done.steps)).kind).toBe("extended-done");
  expect(done.state.profile.stamina).toBeCloseTo(before + cfg.staminaUpdate.extendStep, 10);
  // accepted, but two slow answers in the extra cards → a fade: never raised
  const tired = run(C, ex, p.now + 5000, allR, { ms: (_s, i) => (i >= 2 ? 50_000 : 20_000) });
  expect(endOf(lastStep(tired.steps)).kind).toBe("extended-done");
  expect(tired.state.profile.stamina).toBeLessThan(before);
});

test("fade (R4b): fade.slowAnswers slow answers, not in a row → fadeEffort is the effort before the first; the session goes on", () => {
  const usual = { 1: Array(10).fill(8000), 2: Array(10).fill(8000), 3: Array(10).fill(8000) };
  const start = withProfile(startedAt(2, 4, 1), { msByHeight: usual });
  const U = cfg.staminaUpdate;
  const endData = (steps: Step[]) => lastStep(steps).events.find((x) => x.type === "session_end")!.data;
  const effortBefore = (steps: Step[], i: number) => served(steps).slice(0, i).reduce((a, c) => a + c.effort, 0);
  // Two slow answers apart record the fade at the first; one alone does not.
  expect(cfg.fade.slowAnswers).toBe(2);
  const p1 = play(C, start, T0, allR, { ms: (_s, i) => (i === 2 ? 17_000 : 8000) });
  expect(endData(p1.steps)).toMatchObject({ fadeEffort: null });
  // Stamina blends toward the fade.
  const d = play(C, start, T0, allR, { ms: (_s, i) => (i === 2 || i === 4 ? 17_000 : 8000) });
  const before = effortBefore(d.steps, 2);
  expect(endData(d.steps)).toMatchObject({ kind: "budget", fadeEffort: before });
  const floor = cfg.budget.minimumDay / (1 - cfg.budget.margin);
  expect(d.state.profile.stamina).toBeCloseTo(Math.max(floor, Math.min(start.profile.stamina, U.keep * start.profile.stamina + U.take * before)), 10);
  expect(d.state.profile.stamina).toBeLessThan(start.profile.stamina);
  // No slow answer: no fade.
  expect(endData(play(C, start, T0, allR).steps)).toMatchObject({ fadeEffort: null });
});

test("budget (R4c): a student's first budget.firstSessions sessions use the minimum-day budget", () => {
  let s = newState("s", 1);
  let now = T0;
  const budgets: number[] = [];
  for (let i = 0; i < cfg.budget.firstSessions + 1; i++) {
    const r = play(C, s, now, allR, { ms: () => 8000 });
    budgets.push(r.steps[0].state.session!.budget);
    s = r.state;
    now = nextDay(now);
  }
  expect(budgets.slice(0, cfg.budget.firstSessions)).toEqual(Array(cfg.budget.firstSessions).fill(cfg.budget.minimumDay));
  expect(budgets[cfg.budget.firstSessions]).toBeCloseTo(s.profile.stamina * (1 - cfg.budget.margin), 1);
  expect(budgets[cfg.budget.firstSessions]).toBeGreaterThan(cfg.budget.minimumDay);
});

test("no same card back-to-back (R5): a card id (any variant) is not served again within session.returnAfterCards serves", () => {
  // Every card has many variants, so only the rule (not the 14-day no-repeat) keeps a card from coming straight back.
  const many = structuredClone(C);
  for (const card of Object.values(many.cards)) card.variants = Array.from({ length: 30 }, () => card.variants[0]);
  const patterns: ((s: Served, i: number) => "r" | "w" | "dk" | "s")[] = [
    () => "r", (_s, i) => (i % 2 ? "w" : "r"), (_s, i) => (i % 3 === 0 ? "dk" : i % 3 === 1 ? "w" : "r"), () => "w",
  ];
  for (const [pi, fn] of patterns.entries()) {
    let state = withProfile(startedAt(2, 3, 1), { stamina: 30 });
    let now = T0;
    for (let d = 0; d < 6; d++) {
      const r = play(many, state, now, fn);
      const ids = served(r.steps).map((x) => x.card);
      ids.forEach((id, i) => {
        const back = ids.slice(Math.max(0, i - cfg.session.returnAfterCards), i);
        expect(back.includes(id), `pattern ${pi} day ${d} serve ${i}: ${id} in ${back.join(",")}`).toBe(false);
      });
      state = r.state;
      now = nextDay(now);
    }
  }
});

test("finding 5: a close card blocked by the daily cap ends the session daily-cap, not budget", () => {
  // No height-1 cards: every close card is height 2 (1.5, +1 wrong), so the cap can block the next one.
  const noH1 = fixture({ drop: ["a1", "a2", "b1", "b2"].flatMap((x) => [1, 2, 3].map((i) => `${x}.h1.${i}`)) });
  const s0 = { ...startedAt(2, 2, 1), day: { day: D0, effort: 33, streakKept: true } };
  const { steps } = play(noH1, s0, T0, () => "w");
  const last = lastStep(steps);
  expect(last.feedback?.right).toBe(false);
  expect(endOf(last).kind).toBe("daily-cap");
  expect(last.state.day!.effort).toBeLessThanOrEqual(cfg.budget.dailyCap);
});

test("finding 5: when only the session's recent cards are left, the least recent is served (not content-exhausted)", () => {
  const drop = ["a2", "b1", "b2"].flatMap((x) => [1, 2, 3].flatMap((i) => [`${x}.h1.${i}`, `${x}.h2.${i}`]).concat(`${x}.h3`));
  const one = fixture({ drop: [...drop, "a1.h1.1", "a1.h1.2", "a1.h1.3", "a1.h2.1", "a1.h2.2", "a1.h2.3"] }); // a1.h3 only, 20 variants
  const s0 = startedState({ a1: rec(3, atts(3, 4, 0, D0 - 2), { nextReviewDay: D0 + 20 }) });
  const { steps } = play(one, s0, T0, allR);
  const cards = served(steps);
  expect(cards.length).toBeGreaterThan(1);
  expect(cards.every((c) => c.card === "a1.h3")).toBe(true);
  expect(endOf(lastStep(steps)).kind).not.toBe("content-exhausted");
  // F9: the least-recent fallback is labelled for what it is, not comfort-correction
  expect(cards.slice(1).every((c) => c.reason === "fallback:any")).toBe(true);
});

test("\"5 more\" needs a usual time at every height played (otherwise a slow answer could not have been seen)", () => {
  // A brand-new student has no usual times: all right, but no offer and no stamina growth.
  const p = play(C, newState("s", 1), T0, allR, { offer: "stop" });
  expect(lastStep(p.steps).next.kind).toBe("end");
  // With usual times known: offered.
  expect(lastStep(play(C, fastStart(), T0, allR, { ms: () => 20_000, offer: "stop" }).steps).next.kind).toBe("offer-extend");
});

// ---------- final review F3, F5 ----------

test("F3: a new skill's SkillRec starts at the height actually served, so a right answer schedules its review", () => {
  const first = startSession(newState("s", 1), C, T0);
  if (first.next.kind !== "card") throw new Error("no card");
  const c = first.next.card;
  expect(c.height).toBe(1); // change 4: a fresh student starts on the ladder at level 1, below the default start height 2
  const a = answer(first.state, C, { card: c.card, choice: choiceFor(C, c, "r"), ms: 8000 }, T0 + 10_000);
  const r = a.state.skills[c.skill];
  expect(r.height).toBe(c.height);
  expect(r.nextReviewDay).not.toBeNull();
  expect(r.nextReviewDay!).toBeGreaterThan(D0);
});

test("F4: a clock more than clock.correctionDays behind is a correction: accepted, one clock_corrected event, nothing moved", () => {
  const ahead = play(C, newState("s", 1), T0 + 365 * DAY_MS, allR).state; // the phone's date was a year ahead
  const fixed = startSession(ahead, C, T0);
  const ev = fixed.events.filter((e) => e.type === "clock_corrected");
  expect(ev).toHaveLength(1);
  expect(ev[0].data).toEqual({ from: ahead.lastNow, to: T0 });
  expect(fixed.events[0].type).toBe("clock_corrected");
  expect(fixed.state.lastNow).toBe(T0);
  expect(fixed.state.day!.day).toBe(D0);
  expect(fixed.state.session!.startedAt).toBe(T0);
  // review dates, seen entries and the last session day stay as they were (never moved earlier or deleted)
  for (const [id, r] of Object.entries(ahead.skills)) expect(fixed.state.skills[id].nextReviewDay).toBe(r.nextReviewDay);
  expect(fixed.state.seen.slice(0, ahead.seen.length)).toEqual(ahead.seen);
  // the next call goes on from the corrected time
  if (fixed.next.kind !== "card") throw new Error("no card");
  const c = fixed.next.card;
  const a = answer(fixed.state, C, { card: c.card, choice: choiceFor(C, c, "r"), ms: 8000 }, T0 + 10_000);
  expect(a.state.lastNow).toBe(T0 + 10_000);
  expect(a.events.some((e) => e.type === "clock_corrected")).toBe(false);
  // up to clock.correctionDays back: today's behaviour (the time never goes back), no event
  const small = startSession(ahead, C, ahead.lastNow - cfg.clock.correctionDays * DAY_MS);
  expect(small.events.some((e) => e.type === "clock_corrected")).toBe(false);
  expect(small.state.lastNow).toBe(ahead.lastNow);
});

test("F5: a session that crosses local midnight belongs to the day it started on (minimum day, streak, cap)", () => {
  const start = Date.UTC(2027, 0, 4, 18, 26); // 23:56 Sri Lanka time
  const D = dayOf(start);
  let st = startSession(withProfile(startedAt(2, 4, 1), { stamina: 30 }), C, start);
  let now = start;
  while (st.next.kind === "card" && st.state.session!.spent < cfg.budget.minimumDay) {
    const c = st.next.card;
    now += 60_000;
    st = answer(st.state, C, { card: c.card, choice: choiceFor(C, c, "r"), ms: 8000 }, now);
  }
  expect(dayOf(now)).toBe(D + 1); // midnight has passed
  const spent = st.state.session!.spent;
  expect(spent).toBeGreaterThanOrEqual(cfg.budget.minimumDay);
  expect(st.state.day).toEqual({ day: D, effort: spent, streakKept: true });
  const left = endSession(st.state, C, now + 1000);
  expect(endOf(left)).toMatchObject({ kind: "left", streakKept: true });
  expect(left.state.lastSessionDay).toBe(D);
  // the next session, after midnight, starts a fresh day
  const next = startSession(left.state, C, start + 34 * 60_000); // 00:30
  expect(next.state.day).toEqual({ day: D + 1, effort: 0, streakKept: false });
});

// ---------- follow-up: streak on short sessions, and the dead end after a repair ----------

/**
 * Only a1 is started (height 2, not due, no recent wrongs), and it has no second height-1 card, so its repair has no
 * confidence stage. A wrong open card, a right missing-piece card: a1 now waits for its return (4 cards later).
 */
const oneSkill = () => startedState({ a1: rec(2, atts(2, 8, 0, D0 - 2), { nextReviewDay: D0 + 20, noFullUntilDay: D0 + 20 }) }, { sessionCount: 4 });
const CR = fixture({ drop: ["a1.h1.2", "a1.h1.3"] });

test("repair leaves its skill waiting for the return and nothing else is eligible: the return is served early, not a dead end", () => {
  const { steps } = play(CR, oneSkill(), T0, (_s, i) => (i === 0 ? "w" : "r"));
  const cards = served(steps);
  const end = endOf(lastStep(steps));
  // Before the fix: wrong open card, right repair card, `budget` after 2 cards, effort 3.5 of 12.
  expect(cards.length).toBeGreaterThan(2);
  expect(cards[2].reason).toBe("repair:return");
  expect(end.effort).toBeGreaterThanOrEqual(8);
});

test("streak: a `budget` end far below the minimum day with the budget mostly unspent does not keep the streak", () => {
  // After the dead-end fix such an end is no longer reached by play; the state is built directly: two answered cards
  // (effort 3.5 of a 12 budget), no card open, and the student closes the session.
  const first = startSession(oneSkill(), CR, T0);
  let st = answer(first.state, CR, { card: first.state.session!.served!.card, choice: choiceFor(CR, first.state.session!.served!, "w"), ms: 8000 }, T0 + 10_000);
  const sv = st.state.session!.served!;
  st = answer(st.state, CR, { card: sv.card, choice: choiceFor(CR, sv, "r"), ms: 8000 }, T0 + 20_000);
  const open = JSON.parse(JSON.stringify(st.state)) as State;
  open.session!.served = null; // as at an offer of "5 more"
  expect(open.session!.spent).toBe(3.5);
  const ended = endSession(open, CR, T0 + 30_000);
  expect(endOf(ended)).toMatchObject({ kind: "budget", effort: 3.5, streakKept: false });
  expect(ended.state.day).toEqual({ day: D0, effort: 3.5, streakKept: false });
});

test("streak: a `budget` end that really spent its budget keeps it even under the minimum day (first session, budget 8)", () => {
  const { steps } = play(C, firstSessions(), T0, allR);
  const end = endOf(lastStep(steps));
  expect(end.kind).toBe("budget");
  expect(end.effort).toBeLessThan(cfg.budget.minimumDay);
  // the unspent part is within h3 + the close reserve, and at least half of the budget was spent
  expect(end.effort).toBeGreaterThanOrEqual(Math.max(8 - (cfg.effort.h3 + cfg.effort.h1 + Math.max(cfg.effort.wrong, cfg.effort.dontKnow)), 8 / 2));
  expect(end.streakKept).toBe(true);
});

// ---------- follow-up: a card or a skip after midnight belongs to the day it happens on ----------

/** 23:56 Sri Lanka time on the day of T0. */
const LATE = Date.UTC(2027, 0, 4, 18, 26);

test("midnight: a card answered after midnight is dated on the new day; the effort and streak stay on the start day", () => {
  expect(dayOf(LATE)).toBe(D0);
  const first = startSession(startedAt(2, 4, 1), C, LATE);
  expect(first.state.seen.at(-1)!.day).toBe(D0); // served before midnight
  const afterMidnight = LATE + 5 * 60_000; // 00:01
  expect(dayOf(afterMidnight)).toBe(D0 + 1);
  const sv = (first.next as { card: Served }).card;
  const second = answer(first.state, C, { card: sv.card, choice: choiceFor(C, sv, "r"), ms: 8000 }, afterMidnight);
  expect(second.state.skills[sv.skill].attempts.at(-1)!.day).toBe(D0 + 1);
  expect(second.state.skills[sv.skill].nextReviewDay).toBeGreaterThanOrEqual(D0 + 2);
  if (second.next.kind === "card") expect(second.state.seen.at(-1)).toMatchObject({ card: second.next.card.card, day: D0 + 1 });
  const done = run(C, second, afterMidnight, allR);
  const end = endOf(lastStep(done.steps));
  expect(end.streakKept).toBe(true);
  // The day record, the minimum day, the cap and lastSessionDay stay on the day the session started.
  expect(done.state.day).toEqual({ day: D0, effort: end.effort, streakKept: true });
  expect(done.state.lastSessionDay).toBe(D0);
  for (const a of Object.values(done.state.skills).flatMap((r) => r.attempts).filter((a) => a.seq > 1000)) expect(a.day).toBe(D0 + 1);
});

test("midnight: a skip after midnight sets remindDay = the new day + 3", () => {
  const first = startSession(startedAt(2, 4, 1), C, LATE);
  const sv = (first.next as { card: Served }).card;
  const sk = skip(first.state, C, { card: sv.card, confirmed: true }, LATE + 5 * 60_000);
  expect(sk.state.sections[sv.section].remindDay).toBe(D0 + 1 + cfg.skipRemindDays[0]);
  expect(sk.state.day!.day).toBe(D0);
});

test("a session left open and answered three days later: the attempt is dated on the day of the answer, the day record stays", () => {
  const first = startSession(startedAt(2, 4, 1), C, T0);
  const sv = (first.next as { card: Served }).card;
  const later = T0 + 3 * DAY_MS;
  const st = answer(first.state, C, { card: sv.card, choice: choiceFor(C, sv, "r"), ms: 8000 }, later);
  expect(st.state.skills[sv.skill].attempts.at(-1)!.day).toBe(D0 + 3);
  expect(st.state.day).toMatchObject({ day: D0 });
  if (st.next.kind === "card") expect(st.state.seen.at(-1)!.day).toBe(D0 + 3);
});

/** A session at an offer of "5 more" (nothing open) with `spent` of `budget` effort used, closed with endSession. */
function budgetEnd(spent: number, budget: number): EndInfo {
  const first = startSession(oneSkill(), CR, T0);
  const open = JSON.parse(JSON.stringify(first.state)) as State;
  open.session!.served = null;
  open.session!.spent = spent;
  open.session!.budget = budget;
  open.day = { day: D0, effort: spent, streakKept: false };
  return endOf(endSession(open, CR, T0 + 30_000));
}

test("streak: a budget end keeps it when the unspent part is at most the largest card plus the close reserve, and at least half is spent", () => {
  const reach = cfg.effort.h3 + cfg.effort.h1 + Math.max(cfg.effort.wrong, cfg.effort.dontKnow);
  expect(reach).toBe(6);
  expect(budgetEnd(6.5, 12)).toMatchObject({ kind: "budget", streakKept: true }); // only a height-3 card was left
  expect(budgetEnd(7, 9.8)).toMatchObject({ kind: "budget", streakKept: true });
  expect(budgetEnd(3.5, 12)).toMatchObject({ kind: "budget", streakKept: false }); // the old dead end
  // at least half of the budget must be spent: with a budget of 8 the slack alone would keep it from 2 effort
  expect(budgetEnd(3.5, 8)).toMatchObject({ kind: "budget", streakKept: false });
  expect(budgetEnd(4, 8)).toMatchObject({ kind: "budget", streakKept: true });
});

// ---------- change 2 (2026-11-16): two misses in a row on a skill leave it for the session ----------

/** a1 at height 3 and served first (section A liked most); b1, b2 started at height 2 in section B. */
function leadA1(): State {
  const skills: Record<string, SkillRec> = {
    a1: rec(3, atts(3, 10, 0, D0 - 2), { nextReviewDay: D0 + 20 }),
    b1: rec(2, atts(2, 3, 0, D0 - 2), { nextReviewDay: D0 + 20, noFullUntilDay: D0 + 20 }),
    b2: rec(2, atts(2, 3, 0, D0 - 2), { nextReviewDay: D0 + 20, noFullUntilDay: D0 + 20 }),
  };
  const s = startedState(skills, {
    sections: { "u.t1/A": { ...section(), liking: 2 }, "u.t1/B": section() },
  });
  return withProfile(s, { stamina: 30 });
}
function section() {
  return { skipCount: 0, remindDay: null, lastReason: null, dripStopped: false, liking: 0, returned: false, skipTotal: 0, lastSkipSeq: null };
}
const cardOf = (st: Step): Served => {
  if (st.next.kind !== "card") throw new Error(`expected a card, got ${st.next.kind}`);
  return st.next.card;
};

function twoMisses(a: "w" | "dk", start: State = leadA1()) {
  const s0 = startSession(start, C, T0);
  expect(cardOf(s0)).toMatchObject({ skill: "a1", height: 3 });
  const s1 = answer(s0.state, C, { card: cardOf(s0).card, choice: choiceFor(C, cardOf(s0), a), ms: 8000 }, T0 + 10_000);
  expect(cardOf(s1)).toMatchObject({ skill: "a1", reason: "repair:missing-piece" });
  const s2 = answer(s1.state, C, { card: cardOf(s1).card, choice: choiceFor(C, cardOf(s1), a), ms: 8000 }, T0 + 20_000);
  return { s0, s1, s2 };
}

function expectLeft(s2: Step): void {
  const ss = s2.state.session!;
  expect(ss.leftSkills).toEqual(["a1"]);
  expect(ss.repair).toBeNull();
  expect(ss.returns).toEqual([]);
  expect(ss.badMoments).toEqual([1]);
  expect(ss.history.map((h) => h.bad)).toEqual([false, true]);
  expect(s2.state.skills["a1"].nextReviewDay).toBe(D0 + 1);
  expect(s2.state.skills["a1"].height).toBe(2); // one step down, not two
  // the next card: the easiest eligible card from another section
  expect(cardOf(s2)).toMatchObject({ section: "u.t1/B", height: 1, reason: "comfort-correction" });
  // a1 is not served again this session, closing card included
  const r = run(C, s2, T0 + 20_000, allR);
  expect(served(r.steps).length).toBeGreaterThan(2);
  expect(served(r.steps).every((c) => c.skill !== "a1")).toBe(true);
  expect(r.state.session).toBeNull();
  expect(r.state.skills["a1"].nextReviewDay).toBe(D0 + 1);
}

test("two misses in a row on a skill → skill in leftSkills, one level down (once), back tomorrow, not served again this session, next card from another section at its easiest", () => {
  expectLeft(twoMisses("w").s2);
  // two misses outside a repair count the same: a miss on a1 already in the session's answers, then a1 missed again
  const s0 = startSession(leadA1(), C, T0);
  const st = structuredClone(s0.state);
  st.session!.history = [{ skill: "a1", right: false, ms: 8000, bad: false, height: 3, slow: false }];
  const s1 = answer(st, C, { card: cardOf(s0).card, choice: choiceFor(C, cardOf(s0), "w"), ms: 8000 }, T0 + 10_000);
  expect(s1.state.session!.leftSkills).toEqual(["a1"]);
  expect(s1.state.session!.repair).toBeNull();
  expect(cardOf(s1)).toMatchObject({ section: "u.t1/B", reason: "comfort-correction" });
  // a missed drip card is not one of the two
  const d = structuredClone(s0.state);
  d.session!.history = [{ skill: "a1", right: false, ms: 8000, bad: false, height: 1, slow: false, drip: true }];
  const d1 = answer(d, C, { card: cardOf(s0).card, choice: choiceFor(C, cardOf(s0), "w"), ms: 8000 }, T0 + 10_000);
  expect(d1.state.session!.leftSkills).toEqual([]);
  expect(cardOf(d1).reason).toBe("repair:missing-piece");
});

test("'I don't know' twice on a skill counts the same", () => {
  expectLeft(twoMisses("dk").s2);
  // a right answer in between breaks the run: no leave
  const { s1 } = twoMisses("w");
  const r1 = answer(s1.state, C, { card: cardOf(s1).card, choice: choiceFor(C, cardOf(s1), "r"), ms: 8000 }, T0 + 20_000);
  expect(r1.state.session!.leftSkills).toEqual([]);
});

test("left skills are honoured by the sweep's relaxed pass", () => {
  const s0 = startSession(leadA1(), C, T0);
  const ctx = {
    day: D0, remaining: Infinity, runningRight: 0, runningTotal: 0, newSkillsThisSession: 0, lastSkills: [],
    blockedSections: ["u.t1/B"], h3Spent: 0, spent: 0,
  };
  // only section A is open; a1 and a2 excluded: the relaxed pass would take them, left skills stay out
  expect(pickAny(s0.state, C, { ...ctx, excludeSkills: ["a1", "a2"] }, cfg, "fallback:any")!.served.section).toBe("u.t1/A");
  expect(pickAny(s0.state, C, { ...ctx, excludeSkills: ["a1", "a2"], leftSkills: ["a1", "a2"] }, cfg, "fallback:any")).toBeNull();
});

test("migrate defaults leftSkills on an open session", () => {
  const s = startSession(leadA1(), C, T0).state;
  expect(s.session!.leftSkills).toEqual([]);
  const { leftSkills: _l, ...old } = s.session!;
  const m = migrate(JSON.parse(JSON.stringify({ ...s, session: old })));
  expect(m.session!.leftSkills).toEqual([]);
  const kept = migrate(JSON.parse(JSON.stringify({ ...s, session: { ...s.session!, leftSkills: ["a1"] } })));
  expect(kept.session!.leftSkills).toEqual(["a1"]);
  expect(migrate(JSON.parse(JSON.stringify(newState("s", 1)))).session).toBeNull();
});

test("after a skill is left, closing cards (bad-day path) and \"5 more\" cards never use it", () => {
  // closing: everything after the leave answered wrong → bad day → close cards; a1 (liked section A, level-1 cards)
  // would be the first close pick without the leave
  const { s2 } = twoMisses("w");
  const bad = run(C, s2, T0 + 20_000, () => "w");
  const after = served([s2, ...bad.steps]);
  expect(after.some((c) => c.reason === "close:winnable")).toBe(true);
  expect(after.every((c) => c.skill !== "a1")).toBe(true);
  expect(bad.state.session).toBeNull();

  // "5 more": everything right after the leave (a good day) → offer → extend → five extra cards, none on a1
  // usual times at every height, so a good day can offer "5 more"
  const usual = withProfile(leadA1(), { msByHeight: { 1: Array(5).fill(8000), 2: Array(5).fill(8000), 3: Array(5).fill(8000) } });
  const g2 = twoMisses("w", usual).s2;
  expect(g2.state.session!.leftSkills).toEqual(["a1"]);
  const good = run(C, g2, T0 + 20_000, allR, { offer: "stop" });
  expect(lastStep(good.steps).next.kind).toBe("offer-extend");
  expect(good.state.session!.leftSkills).toEqual(["a1"]);
  const e0 = extend(good.state, C, good.now + 1000);
  const more = run(C, e0, good.now + 1000, allR);
  const extra = served([e0, ...more.steps]).filter((c) => c.reason === "extend:liked" || c.reason === "fallback:any");
  expect(extra.length).toBeGreaterThan(0);
  expect(served([e0, ...more.steps]).every((c) => c.skill !== "a1")).toBe(true);
  expect(endOf(lastStep(more.steps)).kind).toBe("extended-done");
});

test("leaving a neighbour-piece skill: the repair it was a piece for ends; a repair of another skill not on a repair card runs on", () => {
  // a2's repair, its piece served from the requires skill a1, after a1 was already missed: two misses on a1
  const s0 = startSession(leadA1(), C, T0);
  const piece: Served = { card: "a1.h1.1", variant: 0, skill: "a1", section: "u.t1/A", height: 1, reason: "repair:missing-piece", effort: cfg.effort.h1 };
  const st = structuredClone(s0.state);
  st.session!.history = [{ skill: "a1", right: false, ms: 8000, bad: false, height: 3, slow: false }];
  st.session!.repair = { skill: "a2", failedHeight: 2, stage: "piece" };
  st.session!.served = piece;
  const s1 = answer(st, C, { card: piece.card, choice: choiceFor(C, piece, "w"), ms: 8000 }, T0 + 10_000);
  expect(s1.state.session!.leftSkills).toEqual(["a1"]);
  expect(s1.state.session!.repair).toBeNull();
  expect(cardOf(s1)).toMatchObject({ section: "u.t1/B", reason: "comfort-correction" });

  // a repair of a2 in flight while a b1 card (not a repair card) is missed for the second time: b1 is left, a2's runs on
  const other: Served = { card: "b1.h1.1", variant: 0, skill: "b1", section: "u.t1/B", height: 1, reason: "comfort-correction", effort: cfg.effort.h1 };
  const so = structuredClone(s0.state);
  so.session!.history = [{ skill: "b1", right: false, ms: 8000, bad: false, height: 1, slow: false }];
  so.session!.repair = { skill: "a2", failedHeight: 3, stage: "confidence" };
  so.session!.served = other;
  const o1 = answer(so, C, { card: other.card, choice: choiceFor(C, other, "w"), ms: 8000 }, T0 + 10_000);
  expect(o1.state.session!.leftSkills).toEqual(["b1"]);
  expect(o1.state.session!.repair).toEqual({ skill: "a2", failedHeight: 3, stage: "confidence" });
  expect(cardOf(o1)).toMatchObject({ skill: "a2", reason: "repair:confidence" });
});

// ---------- change 4: the first sessions use a ladder ----------

test("session 1, all right: levels 1 1 2 2 2 2 (no room for a full card at budget 8), ends budget with no close card; a full card at card 5 when the budget has room", () => {
  const { state, steps } = play(C, newState("s", 1), T0, allR, { offer: "stop" });
  const cards = served(steps);
  const last = lastStep(steps).next;
  expect(last.kind === "offer-extend" || (last.kind === "end" && last.end.kind === "budget")).toBe(true);
  expect(cards.some((c) => c.reason === "close:winnable")).toBe(false);
  // Budget 8 (minimum day): 1 + 1 + 1.5 + 1.5 = 5 spent at card 5, 3 left: a full card (effort 4) does not fit, so the
  // nearest lower level, 2, until the budget is spent.
  expect(cards.map((c) => c.height)).toEqual([1, 1, 2, 2, 2, 2]);
  expect(cards.slice(0, 2).every((c) => c.reason === "open:liked")).toBe(true);
  expect(state.ladder).toEqual({ level: 3, rightRun: 0 });
  // With room for a full card (a larger minimum day), card 5 is level 3.
  const big = { ...cfg, budget: { ...cfg.budget, minimumDay: 12 } };
  const wide = served(play(C, newState("s", 1), T0, allR, { cfg: big }).steps);
  expect(wide.slice(0, 5).map((c) => c.height)).toEqual([1, 1, 2, 2, 3]);
});

test("session 1, all wrong: every non-repair card is easy", () => {
  const { state, steps } = play(C, newState("s", 1), T0, () => "w");
  const cards = served(steps);
  expect(cards.length).toBeGreaterThan(2);
  expect(cards.some((c) => c.reason.startsWith("repair:"))).toBe(true);
  expect(cards.filter((c) => !c.reason.startsWith("repair:")).every((c) => c.height === 1)).toBe(true);
  expect(state.ladder).toEqual({ level: 1, rightRun: 0 });
});

test("session 4 does not use the ladder; ladder is null", () => {
  // Every skill recorded at height 1; the ladder at 3. Session 3 still uses it (a level-3 card first), session 4 does not.
  const free = { noFullUntilDay: null }; // fix round 1: a level-3 ladder card needs noFullUntilDay not after today
  const s = { ...startedAt(1, 1, 0, { a1: free, a2: free, b1: free, b2: free }), ladder: { level: 3 as Height, rightRun: 0 } };
  const third = startSession({ ...s, sessionCount: cfg.budget.firstSessions - 1 }, C, T0);
  expect(third.state.ladder).toEqual({ level: 3, rightRun: 0 });
  expect(third.next.kind === "card" && third.next.card.height).toBe(3);
  const fourth = startSession({ ...s, sessionCount: cfg.budget.firstSessions }, C, T0);
  expect(fourth.state.sessionCount).toBe(cfg.budget.firstSessions + 1);
  expect(fourth.state.ladder).toBeNull();
  expect(fourth.next.kind === "card" && fourth.next.card.height).toBe(1);
  // Played through, a fresh student's ladder is null from session 4 on and stays null.
  let st = newState("s", 1);
  let now = T0;
  for (let i = 0; i < cfg.budget.firstSessions; i++) {
    st = play(C, st, now, allR).state;
    expect(st.ladder).not.toBeNull();
    now = nextDay(now);
  }
  const p4 = play(C, st, now, allR);
  expect(p4.steps[0].state.ladder).toBeNull();
  expect(p4.state.ladder).toBeNull();
  expect(play(C, p4.state, nextDay(now), allR).state.ladder).toBeNull();
});

test("ladder level carries from session 1 to session 2", () => {
  const s1 = play(C, newState("s", 1), T0, ["r", "r", "r", "r", "w"]);
  // r r → 2, r r → 3, a miss → 2; the rest (repair and close cards) do not move it.
  expect(s1.state.ladder).toEqual({ level: 2, rightRun: 0 });
  const kept = migrate(JSON.parse(JSON.stringify(s1.state)));
  expect(kept.ladder).toEqual({ level: 2, rightRun: 0 });
  const s2 = startSession(kept, C, nextDay(s1.now));
  expect(s2.state.ladder).toEqual({ level: 2, rightRun: 0 });
  expect(s2.next.kind === "card" && s2.next.card.height).toBe(2);
});

test("migrate: old state with answers gets ladder null; an open session continues", () => {
  const p = play(C, { ...startedAt(2, 4, 1), sessionCount: 0 }, T0, ["r", "r"]);
  expect(p.state.session).not.toBeNull();
  const { ladder: _l, ...old } = JSON.parse(JSON.stringify(p.state)) as State;
  const { ladderCard: _c, ladderFull: _n, ...oldSession } = old.session!;
  const m = migrate({ ...old, session: oldSession });
  expect(m.ladder).toBeNull();
  expect(m.session!.ladderCard).toBeNull();
  expect(m.session!.ladderFull).toBe(0);
  const sv = m.session!.served!;
  const a = answer(m, C, { card: sv.card, choice: choiceFor(C, sv, "r"), ms: 8000 }, p.now + 10_000);
  expect(a.next.kind).toBe("card");
  expect(a.state.ladder).toBeNull();
  // A fresh stored state (no answers) gets the default ladder.
  const { ladder: _f, ...fresh } = newState("s", 1);
  expect(migrate(JSON.parse(JSON.stringify(fresh))).ladder).toEqual({ level: 1, rightRun: 0 });
});

// ---------- change 4, fix round 1 ----------

test("fix 1/2: a due skill served by the ladder below its record and answered right gets its next review; memory does not move", () => {
  // Section B liked; only b1.h1.1 / b2.h1.1 left in it. Cards 1–2 take them (ladder 1 → 2); card 3 is a2 (record 3, due)
  // at level 2: due-review, below its record.
  const bCards = Object.keys(C.cards).filter((id) => C.cards[id].section === "u.t1/B" && id !== "b1.h1.1" && id !== "b2.h1.1");
  const seen = bCards.flatMap((card) => C.cards[card].variants.map((_, variant) => ({ card, variant, day: D0 - 1 })));
  const nd = { nextReviewDay: D0 + 5 };
  const s0 = startedState({
    a1: rec(2, atts(2, 1, 0, D0 - 3), nd), a2: rec(3, atts(3, 1, 0, D0 - 3), { nextReviewDay: D0, gapIndex: 1 }),
    b1: rec(2, atts(2, 1, 0, D0 - 3), nd), b2: rec(2, atts(2, 1, 0, D0 - 3), nd),
  }, { sessionCount: 1, seen, sections: { "u.t1/B": { skipCount: 0, remindDay: null, lastReason: null, dripStopped: false, liking: 2, returned: false, skipTotal: 0, lastSkipSeq: null } } });
  const { steps } = play(C, s0, T0, allR);
  const cards = served(steps);
  expect(cards.slice(0, 3).map((c) => [c.skill, c.height])).toEqual([["b2", 1], ["b1", 1], ["a2", 2]]);
  expect(cards[2].reason).toBe("due-review");
  const after3 = steps[3].state;
  expect(after3.skills.a2.height).toBe(3);
  // gap index 1 → reviewGapsDays[1] = 3 days × memory 1; the index advances
  expect(after3.skills.a2.nextReviewDay).toBe(D0 + 3);
  expect(after3.skills.a2.gapIndex).toBe(2);
  expect(after3.profile.memory).toBe(steps[2].state.profile.memory);
  expect(cards.slice(3).some((c) => c.skill === "a2" && c.reason === "due-review")).toBe(false);
});

test("fix 3: an all-right session 2 starting at ladder level 3 serves one level-3 card, then level 2 (more than 3 cards)", () => {
  expect(cfg.ladder.maxFullPerSession).toBe(1);
  const s1 = play(C, newState("s", 1), T0, allR);
  expect(s1.state.ladder).toEqual({ level: 3, rightRun: 0 });
  const s2 = play(C, s1.state, nextDay(s1.now), allR);
  const cards = served(s2.steps);
  expect(cards[0].height).toBe(3);
  expect(cards.filter((c) => c.height === 3).length).toBe(1);
  expect(cards.length).toBeGreaterThan(3);
  expect(cards.slice(1).every((c) => c.height <= 2)).toBe(true);
  expect(s2.state.ladder!.level).toBe(3); // the ladder's own level stays 3
});
