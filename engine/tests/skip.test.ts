import { test, expect } from "vitest";
import { defaultConfig as cfg } from "../src/config.js";
import { migrate, newState } from "../src/state.js";
import { dayOf } from "../src/time.js";
import { answer, skip, startSession } from "../src/session.js";
import { setCurrentTopic, valueMessage } from "../src/skip.js";
import { pickAny, pickClose, pickComeback, pickMiddle, pickOpen, pickReturn } from "../src/pick.js";
import type { PickCtx, Served, SkillRec, State, Step } from "../src/types.js";
import { fixture } from "./fixture.js";
import { T0, atts, choiceFor, lastStep, nextDay, play, rec, run, section, served, startedState } from "./helpers.js";

const C = fixture();
const D0 = dayOf(T0);
const A = "u.t1/A";
const B = "u.t1/B";
const allR = () => "r" as const;
const cardOf = (st: Step): Served => {
  if (st.next.kind !== "card") throw new Error(`expected card, got ${st.next.kind}`);
  return st.next.card;
};
/** Answers right until `stop(card)`, leaving that card open. */
const until = (stop: (s: Served) => boolean) => (s: Served) => (stop(s) ? undefined : ("r" as const));
const isDrip = (s: Served) => s.reason === "skipped-drip";
const isSide = (s: Served) => s.reason === "side-door";

/** All four skills started at `height`, not due, no height-3 step for a while; `over` per skill; `patch` on State. */
function startedAll(height: 1 | 2 | 3, over: Record<string, Partial<SkillRec>> = {}, patch: Partial<State> = {}): State {
  const skills: Record<string, SkillRec> = {};
  for (const id of ["a1", "a2", "b1", "b2"]) {
    skills[id] = rec(height, atts(height, 4, 1, D0 - 2), { nextReviewDay: D0 + 20, noFullUntilDay: D0 + 20, ...over[id] });
  }
  return startedState(skills, patch);
}
const solidH3: Partial<SkillRec> = { height: 3, attempts: atts(3, 4, 0, D0 - 3), solidDays: [D0 - 5, D0 - 3], noFullUntilDay: null };
/** B skipped once, waiting to come back on `remindDay`. */
const waitingB = (remindDay: number | null, extra: Parameters<typeof section>[0] = {}) =>
  ({ [B]: section({ skipCount: 1, remindDay, lastReason: "later", ...extra }) });
/** Every card of every session played (startSession card included), in order. */
const cardsOf = (steps: Step[]) => served(steps);

// ---------- skip and the value message ----------

test("first skip: applies at once, remindDay = day+3, section gone for the rest of the session", () => {
  const s0 = startedAll(2, {}, { sections: { [B]: section({ liking: 5 }) } });
  const st = startSession(s0, C, T0);
  const c0 = cardOf(st);
  expect(c0.section).toBe(B);
  const sk = skip(st.state, C, { card: c0.card }, T0 + 10_000);
  expect(sk.next.kind).toBe("card");
  expect(sk.state.sections[B]).toEqual({ skipCount: 1, remindDay: D0 + 3, lastReason: "later", dripStopped: false, liking: 4, returned: false });
  expect(sk.state.session!.blockedSections).toEqual([B]);
  expect(sk.feedback).toBeUndefined();
  expect(sk.events.map((e) => e.type)).toEqual(["skip", "card_served"]);
  expect(sk.events[0].data).toMatchObject({ card: c0.card, section: B, skill: c0.skill, reason: "later", skipCount: 1, remindDay: D0 + 3, drip: false });
  const rest = run(C, sk, T0 + 10_000, allR);
  const cards = [cardOf(sk), ...cardsOf(rest.steps)];
  expect(cards.length).toBeGreaterThanOrEqual(4);
  expect(cards.filter((c) => c.section === B)).toEqual([]);
  expect(lastStep(rest.steps).next.kind).toBe("end");
  // A second session the same day: still away (only a drip may show it; this is session 2, a drip session).
  const again = play(C, rest.state, rest.now + 60_000, allR);
  expect(cardsOf(again.steps).filter((c) => c.section === B && !isDrip(c))).toEqual([]);
});

test("second skip: confirm-skip with value; sharePct for fixture section B = 60; topSkills b2,b1", () => {
  const s0 = startedAll(2, { b2: solidH3 }, { sections: { [B]: section({ liking: 5, skipCount: 1, returned: true }) } });
  const st = startSession(s0, C, T0);
  const c0 = cardOf(st);
  expect(c0.section).toBe(B);
  const cs = skip(st.state, C, { card: c0.card, reason: "too-hard" }, T0 + 10_000);
  expect(cs.next).toEqual({
    kind: "confirm-skip",
    value: { section: B, sharePct: 60, topSkills: [{ skill: "b2", solid: true }, { skill: "b1", solid: false }] },
  });
  expect(cs.state).toBe(st.state); // nothing changed
  expect(cs.events).toEqual([]);
  // Section A: 0.4 of the unit; a2 (0.3) before a1 (0.1). valueTopSkills caps the list.
  expect(valueMessage(st.state, C, A)).toEqual({ section: A, sharePct: 40, topSkills: [{ skill: "a2", solid: false }, { skill: "a1", solid: false }] });
  const one = { ...cfg, skip: { ...cfg.skip, valueTopSkills: 1 } };
  expect(valueMessage(st.state, C, B, one).topSkills).toEqual([{ skill: "b2", solid: true }]);
  // A skill without cards is left out of topSkills.
  const noB2 = fixture({ drop: ["b2.h1.1", "b2.h1.2", "b2.h1.3", "b2.h2.1", "b2.h2.2", "b2.h2.3", "b2.h3"] });
  expect(valueMessage(st.state, noB2, B).topSkills).toEqual([{ skill: "b1", solid: false }]);
});

test("confirmed second skip → remindDay = day+5; then 8, 13, 14, 14", () => {
  const want = [5, 8, 13, 14, 14];
  for (let n = 1; n <= 5; n++) {
    const s0 = startedAll(2, {}, { sections: { [B]: section({ liking: 5, skipCount: n, returned: true }) } });
    const st = startSession(s0, C, T0);
    const c0 = cardOf(st);
    expect(c0.section).toBe(B);
    const sk = skip(st.state, C, { card: c0.card, reason: "too-hard", confirmed: true }, T0 + 10_000);
    expect(sk.next.kind).toBe("card");
    expect(cardOf(sk).section).toBe(A);
    expect(sk.state.sections[B]).toEqual({
      skipCount: n + 1, remindDay: D0 + want[n - 1], lastReason: "too-hard", dripStopped: false, liking: 4, returned: false,
    });
    expect(sk.events[0]).toMatchObject({ type: "skip", data: { skipCount: n + 1, remindDay: D0 + want[n - 1] } });
  }
});

test("answering after confirm-skip continues the card with no skip applied", () => {
  const s0 = startedAll(2, {}, { sections: { [B]: section({ liking: 5, skipCount: 1, returned: true }) } });
  const st = startSession(s0, C, T0);
  const c0 = cardOf(st);
  const cs = skip(st.state, C, { card: c0.card }, T0 + 10_000);
  expect(cs.next.kind).toBe("confirm-skip");
  const a = answer(cs.state, C, { card: c0.card, choice: choiceFor(C, c0, "r"), ms: 8000 }, T0 + 20_000);
  expect(a.feedback?.right).toBe(true);
  expect(a.events.map((e) => e.type)).toEqual(["answer", "card_served"]);
  expect(a.state.session!.blockedSections).toEqual([]);
  expect(a.state.session!.spent).toBe(1.5);
  // A right answer on a section that has returned resets its skip count; nothing else changed.
  expect(a.state.sections[B]).toEqual(section({ liking: 5, skipCount: 0, returned: true }));
  // The confirm is replayable: confirming the same card applies the skip.
  const ok = skip(cs.state, C, { card: c0.card, confirmed: true }, T0 + 20_000);
  expect(ok.state.sections[B]).toMatchObject({ skipCount: 2, remindDay: D0 + 5 });
});

test("a skip for a card that is not current is stale: same state, same next, no events", () => {
  const st = startSession(startedAll(2), C, T0);
  const c0 = cardOf(st);
  const bad = skip(st.state, C, { card: "nope" }, T0 + 10_000);
  expect(bad.state).toBe(st.state);
  expect(bad.events).toEqual([]);
  expect(bad.next).toEqual({ kind: "card", card: c0 });
  const none = skip(newState("s", 1), C, { card: c0.card }, T0);
  expect(none.next.kind).toBe("end");
  expect(none.events).toEqual([]);
});

test("skip costs no effort", () => {
  const st = startSession(startedAll(2), C, T0);
  const c0 = cardOf(st);
  const a = answer(st.state, C, { card: c0.card, choice: choiceFor(C, c0, "r"), ms: 8000 }, T0 + 10_000);
  const before = { spent: a.state.session!.spent, h3: a.state.session!.h3Spent, day: a.state.day!.effort, answered: a.state.answered };
  const sk = skip(a.state, C, { card: cardOf(a).card }, T0 + 20_000);
  expect(sk.next.kind).toBe("card");
  expect({ spent: sk.state.session!.spent, h3: sk.state.session!.h3Spent, day: sk.state.day!.effort, answered: sk.state.answered }).toEqual(before);
  expect(sk.state.session!.history.length).toBe(1);
});

test("skip drops in-flight repair for that section", () => {
  const s0 = startedAll(2, {}, { sections: { [B]: section({ liking: 5 }) } });
  const st = startSession(s0, C, T0);
  const c0 = cardOf(st);
  expect(c0.section).toBe(B);
  const w = answer(st.state, C, { card: c0.card, choice: choiceFor(C, c0, "w"), ms: 8000 }, T0 + 10_000);
  const rc = cardOf(w);
  expect(rc).toMatchObject({ reason: "repair:missing-piece", section: B });
  expect(w.state.session!.repair).not.toBeNull();
  // Queued returns for skills in B are dropped too; others stay.
  const ss = w.state.session!;
  const patched: State = { ...w.state, session: { ...ss, returns: [{ skill: "b1", afterCard: 50 }, { skill: "a1", afterCard: 50 }] } };
  const sk = skip(patched, C, { card: rc.card }, T0 + 20_000);
  expect(sk.state.session!.repair).toBeNull();
  expect(sk.state.session!.returns).toEqual([{ skill: "a1", afterCard: 50 }]);
  expect(cardOf(sk).section).toBe(A);
  expect(cardOf(sk).reason.startsWith("repair")).toBe(false);
});

test("after a skip with nothing else eligible the session ends content-exhausted", () => {
  // A is waiting to come back (not yet), B is the only section left; session 1 has no drip.
  const s0 = startedAll(2, {}, { sections: { [A]: section({ skipCount: 1, remindDay: D0 + 5, lastReason: "later" }) } });
  const st = startSession(s0, C, T0);
  const c0 = cardOf(st);
  expect(c0.section).toBe(B);
  const sk = skip(st.state, C, { card: c0.card }, T0 + 10_000);
  expect(sk.next).toEqual({ kind: "end", end: { kind: "content-exhausted", effort: 0, cards: 0, right: 0, fixed: 0, streakKept: false } });
  expect(sk.events.map((e) => e.type)).toEqual(["skip", "session_end"]);
});

test("skip is deterministic, leaves its input untouched and survives a JSON round trip", () => {
  const st = startSession(startedAll(2, {}, { sections: { [B]: section({ liking: 5 }) } }), C, T0);
  const before = JSON.stringify(st.state);
  const x = skip(st.state, C, { card: cardOf(st).card, reason: "not-learned" }, T0 + 10_000);
  const y = skip(JSON.parse(before) as State, C, { card: cardOf(st).card, reason: "not-learned" }, T0 + 10_000);
  expect(JSON.stringify(st.state)).toBe(before);
  expect(JSON.stringify(x)).toBe(JSON.stringify(y));
  expect(JSON.parse(JSON.stringify(x.state))).toEqual(x.state);
  expect(x.state.session!.sideDoor).toBeNull();
  // A stored mid-session state from before Task 6 gets `sideDoor: null`.
  const { sideDoor: _drop, ...old } = st.state.session!;
  expect(migrate({ ...st.state, session: old }).session!.sideDoor).toBeNull();
});

// ---------- blocked sections ----------

test("a section waiting to come back is never used by open, middle, close, comeback, return or sweep picks", () => {
  const skills = { a1: rec(2, []), a2: rec(2, []), b1: rec(2, [], { nextReviewDay: D0 - 1, solidDays: [D0 - 4, D0 - 2] }), b2: rec(2, []) };
  const ctx: PickCtx = {
    day: D0, remaining: 20, runningRight: 0, runningTotal: 0, newSkillsThisSession: 0, lastSkills: [],
    blockedSections: [A], h3Spent: 0, spent: 0,
  };
  // remindDay has passed but the side door has not been answered yet: still blocked for normal picks.
  const waiting = startedState(skills, { sections: waitingB(D0 - 1) });
  expect(pickOpen(waiting, C, ctx, cfg)).toBeNull();
  expect(pickMiddle(waiting, C, ctx, cfg)).toBeNull();
  expect(pickClose(waiting, C, ctx, cfg)).toBeNull();
  expect(pickComeback(waiting, C, ctx, cfg)).toBeNull();
  expect(pickReturn(waiting, C, ctx, [{ skill: "b1", afterCard: 0 }], 5, cfg)).toBeNull();
  expect(pickAny(waiting, C, ctx, cfg, "comfort-correction")).toBeNull();
  // Once returned, the same section is served again.
  const back = startedState(skills, { sections: waitingB(null, { returned: true }) });
  expect(pickAny(back, C, ctx, cfg, "comfort-correction")!.served.section).toBe(B);
  expect(pickReturn(back, C, ctx, [{ skill: "b1", afterCard: 0 }], 5, cfg)!.served.section).toBe(B);
});

test("skipped section absent from every card on days 1..2; side-door appears on day 3", () => {
  let now = T0;
  const st = startSession(newState("s", 3), C, now);
  const S = cardOf(st).section;
  const sk = skip(st.state, C, { card: cardOf(st).card }, now + 10_000);
  let r = run(C, sk, now + 10_000, allR);
  expect(r.state.sections[S].remindDay).toBe(D0 + 3);
  for (const d of [1, 2]) {
    now = nextDay(now);
    r = play(C, r.state, now, allR);
    const fromS = cardsOf(r.steps).filter((c) => c.section === S);
    // Only the every-second-session drip (a height-1 card) may come from S.
    expect(fromS.every((c) => isDrip(c) && c.height === 1), `day ${d}`).toBe(true);
  }
  now = nextDay(now);
  r = play(C, r.state, now, allR);
  const cards = cardsOf(r.steps);
  const first = cards.findIndex((c) => c.section === S);
  expect(first).toBeGreaterThanOrEqual(cfg.session.openCards);
  expect(cards[first].reason).toBe("side-door");
  expect(cards.filter(isSide).length).toBe(1);
  expect(r.state.sections[S]).toMatchObject({ returned: true, remindDay: null });
});

// ---------- side door ----------

test("side door right → feedback.reveal, section returned, skills at height 1, no height-3 for 2 days", () => {
  const b3: Partial<SkillRec> = { height: 3, attempts: atts(3, 4, 1, D0 - 6), noFullUntilDay: null };
  const s0 = startedAll(2, { b1: b3, b2: b3 }, { sections: waitingB(D0) });
  const { state, steps } = play(C, s0, T0, allR);
  const cards = cardsOf(steps);
  const i = cards.findIndex(isSide);
  expect(i).toBeGreaterThanOrEqual(cfg.session.openCards);
  expect(cards.slice(0, i).filter((c) => c.section === B)).toEqual([]);
  expect(cards[i]).toMatchObject({ section: B, height: 1 });
  expect(steps[i + 1].feedback).toMatchObject({ right: true, reveal: { section: B } });
  const after = steps[i + 1].state;
  expect(after.sections[B]).toMatchObject({ returned: true, remindDay: null, skipCount: 0 });
  for (const id of ["b1", "b2"]) {
    expect(after.skills[id].height, id).toBe(1);
    expect(after.skills[id].noFullUntilDay, id).toBe(D0 + cfg.returning.noFullDays);
  }
  // Other answers carry no reveal.
  expect(steps.filter((s) => s.feedback?.reveal).length).toBe(1);
  // The section rejoins normal scheduling, guided before full: no height-3 card from B for 2 days.
  const day1 = play(C, state, nextDay(T0), allR);
  const bCards = [...cards.slice(i + 1), ...cardsOf(day1.steps)].filter((c) => c.section === B);
  expect(bCards.length).toBeGreaterThan(0);
  expect(bCards.every((c) => c.height < 3)).toBe(true);
  expect(day1.state.skills.b1.height).toBeLessThan(3);
  expect(day1.state.skills.b2.height).toBeLessThan(3);
});

test("side door skipped → next remind per sequence", () => {
  const s0 = startedAll(2, {}, { sections: waitingB(D0) });
  const r = play(C, s0, T0, until(isSide));
  const last = lastStep(r.steps);
  const sd = cardOf(last);
  expect(sd.section).toBe(B);
  // Second skip of B: asks first.
  const cs = skip(last.state, C, { card: sd.card }, r.now + 10_000);
  expect(cs.next.kind).toBe("confirm-skip");
  const sk = skip(last.state, C, { card: sd.card, confirmed: true }, r.now + 10_000);
  expect(sk.state.sections[B]).toMatchObject({ skipCount: 2, remindDay: D0 + 5, returned: false, lastReason: "later" });
  const rest = run(C, sk, r.now + 10_000, allR);
  expect([cardOf(sk), ...cardsOf(rest.steps)].filter((c) => c.section === B)).toEqual([]);
  // No second side door this session or the next days; it comes back on day +5.
  let state = rest.state;
  for (const d of [1, 2, 3, 4]) {
    const p = play(C, state, T0 + d * 86_400_000, allR);
    expect(cardsOf(p.steps).filter((c) => c.section === B && !isDrip(c)), `day ${d}`).toEqual([]);
    state = p.state;
  }
  const back = play(C, state, T0 + 5 * 86_400_000, allR);
  expect(cardsOf(back.steps).filter(isSide).map((c) => c.section)).toEqual([B]);
});

test("side door wrong → normal repair; the section still rejoins", () => {
  const s0 = startedAll(2, {}, { sections: waitingB(D0) });
  const r = play(C, s0, T0, until(isSide));
  const sd = cardOf(lastStep(r.steps));
  const w = answer(lastStep(r.steps).state, C, { card: sd.card, choice: choiceFor(C, sd, "w"), ms: 8000 }, r.now + 10_000);
  expect(w.feedback).toEqual({ right: false, correctIndex: 0, tag: "recall-gap" });
  expect(cardOf(w).reason).toBe("repair:missing-piece");
  expect(w.state.session!.repair?.skill).toBe(sd.skill);
  expect(w.state.sections[B]).toMatchObject({ returned: true, remindDay: null, skipCount: 1 });
});

test("borrowedFrom set when a solid neighbour exists", () => {
  // b2 helps a1. b1 is the easier skill, but b2 has a solid neighbour, so b2 opens the side door.
  const base = { b1: { height: 1 as const, attempts: atts(1, 6, 0, D0 - 9) }, b2: { height: 2 as const } };
  const withSolid = startedAll(2, { ...base, a1: solidH3 }, { sections: waitingB(D0) });
  const p1 = play(C, withSolid, T0, until(isSide));
  expect(cardOf(lastStep(p1.steps))).toMatchObject({ reason: "side-door", skill: "b2", height: 1, borrowedFrom: "a1" });
  const plain = startedAll(2, base, { sections: waitingB(D0) });
  const p2 = play(C, plain, T0, until(isSide));
  const sd = cardOf(lastStep(p2.steps));
  expect(sd).toMatchObject({ reason: "side-door", skill: "b1", height: 1 });
  expect(sd.borrowedFrom).toBeUndefined();
});

test("not-learned + class topic set to that topic → side door from skip day + 2, never sooner", () => {
  // No drips here, so "nothing from B" is literal; a 1-day no-repeat window keeps the tiny fixture serving.
  const c = { ...cfg, noRepeatDays: 1, session: { ...cfg.session, dripEverySessions: 99 } };
  const H = 3_600_000;
  const dayZero = (reason: "not-learned" | "later", topicFirst = false) => {
    const s0 = startedAll(2, {}, { sections: { [B]: section({ liking: 5 }) } });
    const st = startSession(topicFirst ? setCurrentTopic(s0, "u.t1", "class") : s0, C, T0, c);
    expect(cardOf(st).section).toBe(B);
    const sk = skip(st.state, C, { card: cardOf(st).card, reason }, T0 + 10_000, c);
    return run(C, sk, T0 + 10_000, allR, { cfg: c }).state;
  };
  const fromB = (st: State, now: number) => {
    const p = play(C, st, now, allR, { cfg: c });
    return { state: p.state, b: cardsOf(p.steps).filter((x) => x.section === B) };
  };
  /** Later on day 0, then day 1: nothing from B; day 2: B's side door. */
  const check = (st: State) => {
    const later0 = fromB(st, T0 + 2 * H);
    expect(later0.b, "day 0, later session").toEqual([]);
    const d1 = fromB(later0.state, T0 + 86_400_000);
    expect(d1.b, "day 1").toEqual([]);
    const d2 = fromB(d1.state, T0 + 2 * 86_400_000);
    expect(d2.b.filter(isSide).map((x) => x.section), "day 2").toEqual([B]);
    expect(d2.b[0].reason).toBe("side-door");
  };
  const nl = dayZero("not-learned");
  expect(nl.sections[B]).toMatchObject({ lastReason: "not-learned", remindDay: D0 + 3 });
  const cls = setCurrentTopic(nl, "u.t1", "class");
  expect(cls.currentTopic).toEqual({ id: "u.t1", source: "class" });
  expect(nl.currentTopic).toBeNull(); // input untouched
  check(cls);
  // The class topic was already B's topic when the student skipped: same rule.
  check(dayZero("not-learned", true));
  // Not when the topic came from the student, nor for another reason: the normal remind day (day 3).
  const stu = fromB(fromB(setCurrentTopic(nl, "u.t1", "student"), T0 + 86_400_000).state, T0 + 2 * 86_400_000);
  expect(stu.b).toEqual([]);
  const later = fromB(fromB(setCurrentTopic(dayZero("later"), "u.t1", "class"), T0 + 86_400_000).state, T0 + 2 * 86_400_000);
  expect(later.b).toEqual([]);
  expect(setCurrentTopic(cls, null, "class").currentTopic).toBeNull();
});

test("too-hard returns at height 1", () => {
  const st = startSession(startedAll(2, { b1: { height: 3, noFullUntilDay: null } }, { sections: { [B]: section({ liking: 5 }) } }), C, T0);
  expect(cardOf(st).section).toBe(B);
  const sk = skip(st.state, C, { card: cardOf(st).card, reason: "too-hard" }, T0 + 10_000);
  const d0 = run(C, sk, T0 + 10_000, allR).state;
  expect(d0.sections[B]).toMatchObject({ lastReason: "too-hard", remindDay: D0 + 3 });
  const p = play(C, d0, T0 + 3 * 86_400_000, until(isSide));
  const sd = cardOf(lastStep(p.steps));
  expect(sd).toMatchObject({ section: B, height: 1 });
  const a = answer(lastStep(p.steps).state, C, { card: sd.card, choice: choiceFor(C, sd, "r"), ms: 8000 }, p.now + 10_000);
  expect(a.feedback?.reveal).toEqual({ section: B });
  expect(a.state.skills.b1.height).toBe(1);
  expect(a.state.skills.b2.height).toBe(1);
});

// ---------- drip ----------

test("drip: one skipped-drip height-1 card every second session, not first 3 cards, never last", () => {
  // The fixture is tiny: a 1-day no-repeat window keeps four daily sessions full length.
  const short = { ...cfg, noRepeatDays: 1 };
  let state = startedAll(2, {}, { sections: waitingB(D0 + 10) });
  for (let n = 1; n <= 4; n++) {
    const p = play(C, state, T0 + (n - 1) * 86_400_000, allR, { cfg: short });
    const cards = cardsOf(p.steps);
    const drips = cards.filter(isDrip);
    expect(p.state.sessionCount).toBe(n);
    expect(cards.filter((c) => c.section === B && !isDrip(c)), `session ${n}`).toEqual([]);
    expect(lastStep(p.steps).next.kind).toBe("end");
    if (n % 2 === 0) {
      expect(drips.length, `session ${n}`).toBe(1);
      expect(drips[0]).toMatchObject({ section: B, height: 1, effort: cfg.effort.h1 });
      const i = cards.indexOf(drips[0]);
      expect(i).toBeGreaterThanOrEqual(cfg.skip.dripAfterCards);
      expect(i).toBeLessThan(cards.length - 1);
    } else {
      expect(drips, `session ${n}`).toEqual([]);
    }
    // A drip never changes the remind time.
    expect(p.state.sections[B]).toMatchObject({ skipCount: 1, remindDay: D0 + 10, returned: false });
    state = p.state;
  }
});

test("drip skipped → no drips until remind", () => {
  const s0 = startedAll(2, {}, { sessionCount: 1, sections: waitingB(D0 + 3) });
  const p = play(C, s0, T0, until(isDrip));
  const last = lastStep(p.steps);
  const drip = cardOf(last);
  expect(drip.section).toBe(B);
  // No confirm for a drip, even though B was skipped before.
  const sk = skip(last.state, C, { card: drip.card }, p.now + 10_000);
  expect(sk.next.kind).toBe("card");
  expect(sk.events[0]).toMatchObject({ type: "skip", data: { section: B, drip: true } });
  expect(sk.state.sections[B]).toEqual(section({ skipCount: 1, remindDay: D0 + 3, lastReason: "later", dripStopped: true }));
  let state = run(C, sk, p.now + 10_000, allR).state;
  for (const d of [1, 2]) {
    // sessions 3 and 4: session 4 would be a drip session
    const q = play(C, state, T0 + d * 86_400_000, allR);
    expect(cardsOf(q.steps).filter((c) => c.section === B), `day ${d}`).toEqual([]);
    state = q.state;
  }
  const back = play(C, state, T0 + 3 * 86_400_000, allR);
  expect(cardsOf(back.steps).filter(isSide).map((c) => c.section)).toEqual([B]);
});

test("drip wrong → no repair, no bad moment", () => {
  const h1: Partial<SkillRec> = { height: 1, attempts: atts(1, 2, 1, D0 - 2) };
  const s0 = startedAll(2, { b1: h1, b2: h1 }, { sessionCount: 1, sections: waitingB(D0 + 10) });
  const p = play(C, s0, T0, until(isDrip));
  const last = lastStep(p.steps);
  const drip = cardOf(last);
  const w = answer(last.state, C, { card: drip.card, choice: choiceFor(C, drip, "w"), ms: 8000 }, p.now + 10_000);
  expect(w.feedback).toEqual({ right: false, correctIndex: 0, tag: "recall-gap" });
  expect(w.state.session).not.toBeNull(); // still open, so the checks below run
  const ss = w.state.session!;
  expect(ss.repair).toBeNull();
  expect(ss.badMoments).toEqual([]);
  expect(ss.history[ss.history.length - 1].bad).toBe(false);
  expect(cardOf(w).reason.startsWith("repair")).toBe(false);
  expect(w.state.skills[drip.skill].height).toBe(1);
  expect(w.state.sections[B]).toMatchObject({ skipCount: 1, remindDay: D0 + 10, returned: false });
});

// ---------- skips in other phases, side-door fallbacks ----------

/** The startSession card, with the session patched into another phase. */
function inPhase(patch: Partial<NonNullable<State["session"]>>): { state: State; card: Served } {
  const st = startSession(startedAll(2, {}, { sections: { [B]: section({ liking: 5 }) } }), C, T0);
  expect(cardOf(st).section).toBe(B);
  return { state: { ...st.state, session: { ...st.state.session!, ...patch } }, card: cardOf(st) };
}

test("skipping a close card: another close card; skipped ones do not count toward maxExtraClose", () => {
  const { state, card } = inPhase({ phase: "closing", closeServed: 1 });
  const sk = skip(state, C, { card: card.card }, T0 + 10_000);
  expect(sk.state.sections[B]).toMatchObject({ skipCount: 1 });
  const c1 = cardOf(sk);
  expect(c1).toMatchObject({ reason: "close:winnable", section: A });
  expect(sk.state.session!.closeServed).toBe(1);
  // Answered wrong: the usual 1 + maxExtraClose close cards are answered before the end.
  const r = run(C, sk, T0 + 10_000, () => "w");
  expect(r.steps.length).toBe(1 + cfg.sessionEnd.maxExtraClose);
  expect(lastStep(r.steps).next.kind).toBe("end");
  expect(cardsOf([sk, ...r.steps]).every((x) => x.reason === "close:winnable" && x.section === A)).toBe(true);
});

test("skipping a \"5 more\" card: another extend card, extendLeft unchanged", () => {
  const { state, card } = inPhase({ phase: "extend", extended: true, extendLeft: 3 });
  const sk = skip(state, C, { card: card.card }, T0 + 10_000);
  expect(cardOf(sk)).toMatchObject({ reason: "extend:liked", section: A });
  expect(sk.state.session).toMatchObject({ phase: "extend", extendLeft: 3, spent: 0 });
});

test("side door falls back to a higher height when the section has no height-1 card", () => {
  const noH1 = fixture({ drop: ["b1.h1.1", "b1.h1.2", "b1.h1.3", "b2.h1.1", "b2.h1.2", "b2.h1.3"] });
  const p = play(noH1, startedAll(2, {}, { sections: waitingB(D0) }), T0, until(isSide));
  expect(cardOf(lastStep(p.steps))).toMatchObject({ reason: "side-door", section: B, height: 2 });
});

test("a due side door is served before a content-exhausted end", () => {
  // A waits for a later remind day; B's side door is due. Nothing else at all is eligible, even in the open.
  const s0 = startedAll(2, {}, { sections: { [A]: section({ skipCount: 1, remindDay: D0 + 5, lastReason: "later" }), ...waitingB(D0) } });
  const st = startSession(s0, C, T0);
  expect(cardOf(st)).toMatchObject({ reason: "side-door", section: B, height: 1 });
});
