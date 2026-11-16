import { test, expect } from "vitest";
import { defaultConfig as cfg } from "../src/config.js";
import { migrate, newState } from "../src/state.js";
import { dayOf } from "../src/time.js";
import { answer, skip, startSession } from "../src/session.js";
import { setCurrentTopic, setSkipReason, valueMessage } from "../src/skip.js";
import { eligibleCard, pickAny, pickClose, pickComeback, pickMiddle, pickOpen, pickReturn } from "../src/pick.js";
import { expectedSuccess } from "../src/estimate.js";
import type { PickCtx, SectionRec, Served, SkillRec, State, Step } from "../src/types.js";
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
  expect(sk.state.sections[B]).toEqual({ skipCount: 1, remindDay: D0 + 3, lastReason: "later", dripStopped: false, liking: 4, returned: false, skipTotal: 1, lastSkipSeq: 1000, skippedLevel: c0.height });
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
  // change 6: was reason "too-hard", which is now a card-level skip and never asks first
  const cs = skip(st.state, C, { card: c0.card, reason: "later" }, T0 + 10_000);
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
    // change 6: was reason "too-hard" (now a card-level skip): "not-learned" puts the section away
    const sk = skip(st.state, C, { card: c0.card, reason: "not-learned", confirmed: true }, T0 + 10_000);
    expect(sk.next.kind).toBe("card");
    expect(cardOf(sk).section).toBe(A);
    expect(sk.state.sections[B]).toEqual({
      skipCount: n + 1, remindDay: D0 + want[n - 1], lastReason: "not-learned", dripStopped: false, liking: 4, returned: false, skipTotal: n + 1, lastSkipSeq: 1000,
      skippedLevel: c0.height,
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
  expect(a.state.sections[B]).toEqual(section({ liking: 5, skipCount: 0, returned: true, skipTotal: 1 }));
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

// change 6: was "too-hard returns at height 1"; too-hard is now a card-level skip, so a section skip ("not-learned") is used.
test("a skipped section returns at height 1", () => {
  const st = startSession(startedAll(2, { b1: { height: 3, noFullUntilDay: null } }, { sections: { [B]: section({ liking: 5 }) } }), C, T0);
  expect(cardOf(st).section).toBe(B);
  const sk = skip(st.state, C, { card: cardOf(st).card, reason: "not-learned" }, T0 + 10_000);
  const d0 = run(C, sk, T0 + 10_000, allR).state;
  expect(d0.sections[B]).toMatchObject({ lastReason: "not-learned", remindDay: D0 + 3 });
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
    expect(p.state.sessionCount).toBe(4 + n); // startedState begins at sessionCount 4 (Task 11 R4c)
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

// change 6: was "side door falls back to a higher height when the section has no height-1 card". The fallback is gone:
// an old skip (no skippedLevel) allows level 1 only, so the section rejoins silently instead.
test("no higher-level side door when the section has no height-1 card: the section rejoins silently", () => {
  const noH1 = fixture({ drop: ["b1.h1.1", "b1.h1.2", "b1.h1.3", "b2.h1.1", "b2.h1.2", "b2.h1.3"] });
  const p = play(noH1, startedAll(2, { b1: { nextReviewDay: D0 } }, { sections: waitingB(D0) }), T0, allR);
  expect(cardsOf(p.steps).filter(isSide)).toEqual([]);
  expect(p.steps.flatMap((s) => s.events).filter((e) => e.type === "section_rejoined").map((e) => e.data)).toEqual([{ section: B }]);
  expect(cardsOf(p.steps).some((c) => c.section === B && c.height === 2)).toBe(true);
});

test("a due side door is served before a content-exhausted end", () => {
  // A waits for a later remind day; B's side door is due. Nothing else at all is eligible, even in the open.
  const s0 = startedAll(2, {}, { sections: { [A]: section({ skipCount: 1, remindDay: D0 + 5, lastReason: "later" }), ...waitingB(D0) } });
  const st = startSession(s0, C, T0);
  expect(cardOf(st)).toMatchObject({ reason: "side-door", section: B, height: 1 });
});

test("side door at the cap: a section whose cap day has come returns even after another side door this session", () => {
  // A and B both skipped once (remind gap 3). capAgo: days since the skip day, measured against the cap (14).
  const both = (skipAgo: number) => startedAll(2, {}, {
    sections: {
      [A]: section({ skipCount: 1, remindDay: D0 - skipAgo + 3, lastReason: "later" }),
      [B]: section({ skipCount: 1, remindDay: D0 - skipAgo + 3, lastReason: "later" }),
    },
  });
  const cap = Math.max(...cfg.skipRemindDays);
  const sides = (s: State) => served(play(C, s, T0, allR).steps).filter(isSide).map((c) => c.section).sort();
  expect(sides(both(cap))).toEqual([A, B]);
  // Remind day passed but the cap not reached: still one side door per session.
  expect(sides(both(cap - 1)).length).toBe(1);
});

// ---------- final review F10: the reason comes after the skip ----------

test("F10: setSkipReason sets the section's last skip reason after the skip; remind day and everything else stay", () => {
  const s0 = startedAll(2, {}, { sections: { [B]: section({ liking: 5 }) } });
  const st = startSession(s0, C, T0);
  const c0 = cardOf(st);
  expect(c0.section).toBe(B);
  const sk = skip(st.state, C, { card: c0.card }, T0 + 10_000); // no reason yet: "later"
  const before = sk.state.sections[B];
  const frozen = JSON.stringify(sk.state);
  // change 6: was ["not-learned", "too-hard"]; too-hard right after a section skip now turns it into a card skip
  for (const reason of ["not-learned", "later"] as const) {
    const out = setSkipReason(sk.state, C, B, reason, T0 + 12_000);
    expect(out.state.sections[B]).toEqual({ ...before, lastReason: reason });
    expect(out.state.sections[B].remindDay).toBe(before.remindDay);
    expect(out.events).toHaveLength(1);
    expect(out.events[0]).toMatchObject({ type: "skip_reason", session: sk.state.session!.id, data: { section: B, reason } });
    expect(out.state.seq).toBe(sk.state.seq + 1);
    // nothing else moves: the open card, the skills, the session
    expect({ ...out.state, sections: {}, seq: 0, lastNow: 0 }).toEqual({ ...sk.state, sections: {}, seq: 0, lastNow: 0 });
  }
  expect(JSON.stringify(sk.state)).toBe(frozen); // input not mutated
  // a section never skipped: nothing changes
  const none = setSkipReason(sk.state, C, A, "too-hard", T0 + 12_000);
  expect(none.state).toBe(sk.state);
  expect(none.events).toEqual([]);
});

// ---------- change 6: "too hard" is about the card; the side door is never a full problem ----------

const noH1B = ["b1.h1.1", "b1.h1.2", "b1.h1.3", "b2.h1.1", "b2.h1.2", "b2.h1.3"];
const noH2B = ["b1.h2.1", "b1.h2.2", "b1.h2.3", "b2.h2.1", "b2.h2.2", "b2.h2.3"];
const tooHard = (st: Step, at: number, c = C) => skip(st.state, c, { card: cardOf(st).card, reason: "too-hard" }, at);

test("too-hard: section record untouched, skill one level down, skill not served again this session, no effort", () => {
  const s0 = startedAll(2, {}, { sections: { [B]: section({ liking: 5 }) } });
  const st = startSession(s0, C, T0);
  const c0 = cardOf(st);
  expect(c0).toMatchObject({ section: B, height: 2 });
  const sk = tooHard(st, T0 + 10_000);
  expect(sk.next.kind).toBe("card"); // never confirm-skip
  expect(sk.feedback).toBeUndefined();
  expect(sk.state.sections).toEqual(s0.sections); // no count, remind day, liking or reason change
  const ss = sk.state.session!;
  expect(ss.blockedSections).toEqual([]);
  expect(ss.leftSkills).toEqual([c0.skill]);
  expect(ss.lastSkip).toBeNull();
  expect(sk.state.skills[c0.skill]).toEqual({ ...s0.skills[c0.skill], height: 1, windowStartSeq: s0.answered + 1 });
  // no effort, no answer, no history entry; the skipped card still counts as served (R5)
  expect({ spent: ss.spent, h3: ss.h3Spent, day: sk.state.day!.effort, answered: sk.state.answered, history: ss.history.length })
    .toEqual({ spent: 0, h3: 0, day: 0, answered: s0.answered, history: 0 });
  expect(ss.servedCards[0]).toBe(c0.card);
  expect(sk.events.map((e) => e.type)).toEqual(["skip", "card_served"]);
  expect(sk.events[0].data).toMatchObject({
    card: c0.card, section: B, skill: c0.skill, reason: "too-hard", scope: "card", fromLevel: 2, toLevel: 1, drip: false,
  });
  // the section stays: the next card may come from B (another skill); the skipped skill never comes back this session
  const rest = run(C, sk, T0 + 10_000, allR);
  const cards = [cardOf(sk), ...cardsOf(rest.steps)];
  expect(cards.filter((c) => c.skill === c0.skill)).toEqual([]);
  expect(cards.some((c) => c.section === B)).toBe(true);
  expect(lastStep(rest.steps).next.kind).toBe("end");
  // a repair and a queued return of that skill are dropped; another skill's stay
  const w = answer(st.state, C, { card: c0.card, choice: choiceFor(C, c0, "w"), ms: 8000 }, T0 + 10_000);
  const rc = cardOf(w);
  expect(rc).toMatchObject({ reason: "repair:missing-piece", skill: c0.skill });
  const patched: State = { ...w.state, session: { ...w.state.session!, returns: [{ skill: c0.skill, afterCard: 50 }, { skill: "a1", afterCard: 50 }] } };
  const sk2 = skip(patched, C, { card: rc.card, reason: "too-hard" }, T0 + 20_000);
  expect(sk2.state.session!.repair).toBeNull();
  expect(sk2.state.session!.returns).toEqual([{ skill: "a1", afterCard: 50 }]);
  expect(sk2.state.sections).toEqual(patched.sections);
  expect(cardOf(sk2).skill).not.toBe(c0.skill);
  // deterministic, input untouched, JSON-safe
  const before = JSON.stringify(st.state);
  const again = tooHard({ ...st, state: JSON.parse(before) as State }, T0 + 10_000);
  expect(JSON.stringify(st.state)).toBe(before);
  expect(JSON.stringify(again)).toBe(JSON.stringify(sk));
  expect(JSON.parse(JSON.stringify(sk.state))).toEqual(sk.state);
});

test("too-hard at the lowest level: skill rests 3 days, section stays", () => {
  // fix round 1: B's skills are due today, so the rest day is later than their review date (it never moves one earlier)
  const s0 = startedAll(1, { b1: { nextReviewDay: D0 }, b2: { nextReviewDay: D0 } }, { sections: { [B]: section({ liking: 5 }) } });
  const st = startSession(s0, C, T0);
  const c0 = cardOf(st);
  expect(c0).toMatchObject({ section: B, height: 1 });
  const sk = tooHard(st, T0 + 10_000);
  expect(sk.next.kind).toBe("card");
  expect(sk.state.sections).toEqual(s0.sections);
  expect(sk.state.skills[c0.skill]).toEqual({ ...s0.skills[c0.skill], nextReviewDay: D0 + cfg.skip.tooHardRestDays });
  expect(cfg.skip.tooHardRestDays).toBe(3);
  expect(sk.state.session!.leftSkills).toEqual([c0.skill]);
  expect(sk.events[0].data).toMatchObject({ scope: "card", skill: c0.skill, fromLevel: 1, toLevel: 1 });
  // A brand-new skill's first card (no record yet, section never skipped): the record is created, the section is not.
  const fresh = startSession(newState("s", 3), C, T0);
  const f0 = cardOf(fresh);
  expect(f0.height).toBe(1); // the first-session ladder starts at level 1
  expect(fresh.state.skills[f0.skill]).toBeUndefined();
  const fk = tooHard(fresh, T0 + 10_000);
  expect(fk.state.skills[f0.skill]).toMatchObject({ height: 1, attempts: [], nextReviewDay: D0 + 3 });
  expect(fk.state.sections).toEqual({});
  expect(fk.events[0].data).toMatchObject({ scope: "card", skill: f0.skill, fromLevel: 1, toLevel: 1 });
  // A new skill first served at level 2 starts at the lowest level below it (level 1), with no rest.
  // (the served card is made a guided card of a skill not started yet)
  const l0: Served = { ...f0, card: "a2.h2.1", skill: "a2", section: A, variant: 0, height: 2, effort: cfg.effort.h2 };
  expect(fresh.state.skills.a2).toBeUndefined();
  const lk = tooHard({ ...fresh, state: { ...fresh.state, session: { ...fresh.state.session!, served: l0 } }, next: { kind: "card", card: l0 } }, T0 + 10_000);
  expect(lk.state.skills[l0.skill]).toMatchObject({ height: 1, attempts: [], nextReviewDay: null });
  expect(lk.state.sections).toEqual({});
  expect(lk.events[0].data).toMatchObject({ fromLevel: 2, toLevel: 1 });
});

test("too-hard never returns confirm-skip, even on a section skipped before", () => {
  const s0 = startedAll(2, {}, { sections: { [B]: section({ liking: 5, skipCount: 1, returned: true }) } });
  const st = startSession(s0, C, T0);
  expect(cardOf(st).section).toBe(B);
  const sk = tooHard(st, T0 + 10_000);
  expect(sk.next.kind).toBe("card");
  expect(sk.state.sections).toEqual(s0.sections);
  // the same section with no reason still asks first
  expect(skip(st.state, C, { card: cardOf(st).card }, T0 + 10_000).next.kind).toBe("confirm-skip");
  // a close card skipped as too hard does not count toward maxExtraClose
  const closing = { ...st.state, session: { ...st.state.session!, phase: "closing" as const, closeServed: 1 } };
  const ck = skip(closing, C, { card: cardOf(st).card, reason: "too-hard" }, T0 + 10_000);
  expect(ck.state.session!.closeServed).toBe(1);
  expect(cardOf(ck)).toMatchObject({ reason: "close:winnable" });
  // a drip card: card level, the drip is not stopped and the section's skipped state is unchanged
  const dripS = startedAll(2, {}, { sessionCount: 1, sections: waitingB(D0 + 3) });
  const p = play(C, dripS, T0, until(isDrip));
  const dk = tooHard(lastStep(p.steps), p.now + 10_000);
  expect(dk.next.kind).toBe("card");
  expect(dk.state.sections[B]).toEqual(lastStep(p.steps).state.sections[B]);
  expect(dk.state.sections[B].dripStopped).toBe(false);
  expect(dk.events[0].data).toMatchObject({ scope: "card", drip: true });
  // a side-door card: card level, the section is still waiting to come back
  const sideS = startedAll(2, {}, { sections: waitingB(D0) });
  const q = play(C, sideS, T0, until(isSide));
  const sdk = tooHard(lastStep(q.steps), q.now + 10_000);
  expect(sdk.next.kind).toBe("card");
  expect(sdk.state.sections[B]).toEqual(lastStep(q.steps).state.sections[B]);
  expect(sdk.state.sections[B]).toMatchObject({ skipCount: 1, returned: false, remindDay: D0 });
});

test("later / not-learned / no reason: section skip as before, skippedLevel recorded, scope section", () => {
  for (const reason of ["later", "not-learned", undefined] as const) {
    const s0 = startedAll(2, {}, { sections: { [B]: section({ liking: 5 }) } });
    const st = startSession(s0, C, T0);
    const c0 = cardOf(st);
    expect(c0.section).toBe(B);
    const sk = skip(st.state, C, { card: c0.card, ...(reason ? { reason } : {}) }, T0 + 10_000);
    expect(sk.state.sections[B]).toEqual({
      skipCount: 1, remindDay: D0 + 3, lastReason: reason ?? "later", dripStopped: false, liking: 4, returned: false,
      skipTotal: 1, lastSkipSeq: 1000, skippedLevel: c0.height,
    });
    expect(sk.state.session!.blockedSections).toEqual([B]);
    expect(sk.state.session!.leftSkills).toEqual([]);
    expect(sk.state.skills[c0.skill]).toEqual(s0.skills[c0.skill]);
    expect(sk.events[0].data).toMatchObject({ scope: "section", section: B, reason: reason ?? "later" });
    expect(sk.events[0].data.fromLevel).toBeUndefined();
    expect(sk.state.session!.lastSkip).toEqual({ section: B, skill: c0.skill, level: c0.height, before: section({ liking: 5 }), card: c0.card });
  }
  // a skip of a section with no record: lastSkip.before is null
  const st = startSession(startedAll(2), C, T0);
  const sk = skip(st.state, C, { card: cardOf(st).card }, T0 + 10_000);
  expect(st.state.sections[cardOf(st).section]).toBeUndefined();
  expect(sk.state.session!.lastSkip).toMatchObject({ section: cardOf(st).section, before: null });
  // session end clears lastSkip
  expect(run(C, sk, T0 + 10_000, allR).state.session).toBeNull();
});

test("setSkipReason too-hard after a section skip: section record restored exactly, section unblocked, skill stepped down", () => {
  for (const sections of [{ [B]: section({ liking: 5, skipCount: 2, skipTotal: 4, returned: true, lastReason: "not-learned", lastSkipSeq: 900, skippedLevel: 3 }) }, {}] as Record<string, SectionRec>[]) {
    const s0 = startedAll(2, { b1: { attempts: atts(2, 9, 0, D0 - 2) } }, { sections });
    const st = startSession(s0, C, T0);
    const c0 = cardOf(st);
    const sec = c0.section;
    if (Object.keys(sections).length > 0) expect(sec).toBe(B); // fix round 1: the rich-record case really skips B
    const sk = skip(st.state, C, { card: c0.card, confirmed: true }, T0 + 10_000);
    expect(sk.state.session!.blockedSections).toEqual([sec]);
    const frozen = JSON.stringify(sk.state);
    const out = setSkipReason(sk.state, C, sec, "too-hard", T0 + 12_000);
    expect(JSON.stringify(sk.state)).toBe(frozen);
    if (s0.sections[sec]) expect(out.state.sections[sec]).toEqual(s0.sections[sec]);
    else expect(sec in out.state.sections).toBe(false);
    const ss = out.state.session!;
    expect(ss.blockedSections).toEqual([]);
    expect(ss.leftSkills).toEqual([c0.skill]);
    expect(ss.lastSkip).toBeNull();
    expect(ss.served).toEqual(sk.state.session!.served); // the open card stays
    expect(out.state.skills[c0.skill]).toEqual({ ...s0.skills[c0.skill], height: 1, windowStartSeq: s0.answered + 1 });
    expect(out.events).toHaveLength(1);
    expect(out.events[0]).toMatchObject({
      type: "skip_reason", data: { section: sec, reason: "too-hard", scope: "card", skill: c0.skill, fromLevel: 2, toLevel: 1 },
    });
    expect(JSON.parse(JSON.stringify(out.state))).toEqual(out.state);
    // a second call: nothing left to convert, the section has no skip (or only its old ones): as today
    const twice = setSkipReason(out.state, C, sec, "too-hard", T0 + 13_000);
    expect(twice.state.session!.lastSkip).toBeNull();
    expect(twice.state.skills[c0.skill]).toEqual(out.state.skills[c0.skill]);
  }
});

test("setSkipReason too-hard for an older skip or a closed session: only lastReason changes", () => {
  const s0 = startedAll(2, {}, { sections: { [B]: section({ liking: 5 }) } });
  const st = startSession(s0, C, T0);
  expect(cardOf(st).section).toBe(B);
  const skB = skip(st.state, C, { card: cardOf(st).card }, T0 + 10_000);
  const only = (from: State, sec: string) => {
    const out = setSkipReason(from, C, sec, "too-hard", T0 + 30_000);
    expect(out.state.sections[sec]).toEqual({ ...from.sections[sec], lastReason: "too-hard" });
    expect({ ...out.state, sections: {}, seq: 0, lastNow: 0 }).toEqual({ ...from, sections: {}, seq: 0, lastNow: 0 });
    expect(out.events).toHaveLength(1);
    expect(out.events[0].data).toEqual({ section: sec, reason: "too-hard" });
  };
  // the session's last skip is another section's (the fixture has two sections: a real skip of A would end the session)
  expect(cardOf(skB).section).toBe(A);
  const ssB = skB.state.session!;
  only({ ...skB.state, session: { ...ssB, lastSkip: { ...ssB.lastSkip!, section: A } } }, B);
  // a later card-level skip clears lastSkip too
  const skC = tooHard(skB, T0 + 20_000);
  expect(skC.state.session!.lastSkip).toBeNull();
  only(skC.state, B);
  // the session has closed
  const closed = run(C, skB, T0 + 10_000, allR).state;
  expect(closed.session).toBeNull();
  only(closed, B);
});

test("side door after skipping a level-3 card is level 2 or 1; after a level-2 card is level 1; never level 3", () => {
  // the skipped card's level is recorded by the skip
  const s3 = startedAll(2, { b1: { height: 3, noFullUntilDay: null }, b2: { height: 3, noFullUntilDay: null } }, { sections: { [B]: section({ liking: 5 }) } });
  const st = startSession(s3, C, T0);
  expect(cardOf(st).section).toBe(B);
  // the served card made a full problem (the open pick here is a guided one)
  const full: Served = { ...cardOf(st), card: "b1.h3", skill: "b1", variant: 0, height: 3, effort: cfg.effort.h3 };
  const at3 = { ...st.state, session: { ...st.state.session!, served: full } };
  expect(skip(at3, C, { card: "b1.h3" }, T0 + 10_000).state.sections[B].skippedLevel).toBe(3);
  expect(skip(st.state, C, { card: cardOf(st).card }, T0 + 10_000).state.sections[B].skippedLevel).toBe(cardOf(st).height);
  const sideOf = (c: typeof C, skippedLevel: 1 | 2 | 3 | null, over: Record<string, Partial<SkillRec>> = {}) => {
    const p = play(c, startedAll(2, over, { sections: waitingB(D0, { skippedLevel }) }), T0, allR);
    return cardsOf(p.steps).filter(isSide);
  };
  const b3 = { b1: { height: 3 as const, noFullUntilDay: null }, b2: { height: 3 as const, noFullUntilDay: null } };
  // after a level-3 card: the lowest level first (1), level 2 when the section has no level-1 card
  expect(sideOf(C, 3, b3).map((c) => c.height)).toEqual([1]);
  expect(sideOf(fixture({ drop: noH1B }), 3, b3).map((c) => c.height)).toEqual([2]);
  // after a level-2 card (and for an old state with no level): level 1
  expect(sideOf(C, 2, b3).map((c) => c.height)).toEqual([1]);
  expect(sideOf(C, null, b3).map((c) => c.height)).toEqual([1]);
  expect(sideOf(C, 1, b3).map((c) => c.height)).toEqual([1]);
  // never level 3, even when that is all the section has
  expect(sideOf(fixture({ drop: [...noH1B, ...noH2B] }), 3, b3)).toEqual([]);
  expect(sideOf(fixture({ drop: noH1B }), 2, b3)).toEqual([]);
});

test("no card below the skipped level: section rejoins with a section_rejoined event and no side-door card", () => {
  const noH1 = fixture({ drop: noH1B });
  const b3 = { b1: { height: 3 as const, noFullUntilDay: null, nextReviewDay: D0 }, b2: { height: 3 as const, noFullUntilDay: null, nextReviewDay: D0 } };
  const s0 = startedAll(2, b3, { sections: waitingB(D0, { skippedLevel: 2 }) });
  const p = play(noH1, s0, T0, allR);
  const ev = p.steps.flatMap((s) => s.events).filter((e) => e.type === "section_rejoined");
  expect(ev.map((e) => e.data)).toEqual([{ section: B }]);
  const cards = cardsOf(p.steps);
  expect(cards.filter(isSide)).toEqual([]);
  // the session goes on: B's cards are served like any other, at their lowest level, no full problem for 2 days
  const i = p.steps.findIndex((s) => s.events.some((e) => e.type === "section_rejoined"));
  const after = p.steps[i].state;
  expect(after.sections[B]).toMatchObject({ returned: true, remindDay: null, skipCount: 1 });
  for (const id of ["b1", "b2"]) expect(after.skills[id]).toMatchObject({ height: 2, noFullUntilDay: D0 + cfg.returning.noFullDays });
  expect(cards.filter((c) => c.section === B).length).toBeGreaterThan(0);
  expect(cards.filter((c) => c.section === B).every((c) => c.height === 2)).toBe(true);
  // once per skip cycle: another session the same day rejoins nothing
  const again = play(noH1, p.state, p.now + 60_000, allR);
  expect(again.steps.flatMap((s) => s.events).filter((e) => e.type === "section_rejoined")).toEqual([]);
  // not before the section is due
  const early = play(noH1, startedAll(2, b3, { sections: waitingB(D0 + 1, { skippedLevel: 2 }) }), T0, allR);
  expect(early.steps.flatMap((s) => s.events).filter((e) => e.type === "section_rejoined")).toEqual([]);
  expect(cardsOf(early.steps).filter((c) => c.section === B && !isDrip(c))).toEqual([]);
  // deterministic
  expect(JSON.stringify(play(noH1, s0, T0, allR))).toBe(JSON.stringify(p));
});

test("migrate defaults skippedLevel and lastSkip", () => {
  const st = startSession(startedAll(2, {}, { sections: { [B]: section({ skipCount: 1, remindDay: D0 + 3, lastReason: "later" }) } }), C, T0);
  const { lastSkip: _ls, ...oldSession } = st.state.session!;
  const { skippedLevel: _sl, ...oldSec } = st.state.sections[B];
  const m = migrate(JSON.parse(JSON.stringify({ ...st.state, session: oldSession, sections: { [B]: oldSec } })));
  expect(m.session!.lastSkip).toBeNull();
  expect(m.sections[B].skippedLevel).toBeNull();
  expect(m.sections[B]).toEqual(st.state.sections[B]);
  // kept when present
  const kept = { ...st.state, sections: { [B]: { ...st.state.sections[B], skippedLevel: 3 as const } } };
  expect(migrate(JSON.parse(JSON.stringify(kept))).sections[B].skippedLevel).toBe(3);
  expect(newState("s", 1).sections).toEqual({});
});

// ---------- change 6, fix round 1 ----------

const rejoinsOf = (steps: Step[]) => steps.flatMap((s) => s.events).filter((e) => e.type === "section_rejoined").map((e) => e.data);
/** Seen entries for every variant of these cards on `day`. */
const seenAll = (ids: string[], day: number, c = C) => ids.flatMap((id) => c.cards[id].variants.map((_, v) => ({ card: id, variant: v, day })));
const bH1 = ["b1.h1.1", "b1.h1.2", "b1.h1.3", "b2.h1.1", "b2.h1.2", "b2.h1.3"];

test("fix round 1: allowed cards exist but were all seen recently: no rejoin, no side door; served once one is eligible again", () => {
  // The simulator case: a level-1 side-door card skipped (skippedLevel 1); every level-1 B card seen within 14 days.
  // Seen on days D0-13 .. D0-8: card i is eligible again from day (seen day + noRepeatDays).
  const seen = bH1.map((card, i) => ({ card, variant: 0, day: D0 - 13 + i }));
  const s0 = startedAll(2, {}, { sections: waitingB(D0 - 2, { skippedLevel: 1 }), seen });
  const today = play(C, s0, T0, allR);
  expect(rejoinsOf(today.steps)).toEqual([]);
  expect(cardsOf(today.steps).filter((c) => c.section === B)).toEqual([]);
  expect(today.state.sections[B]).toMatchObject({ skipCount: 1, returned: false });
  // Day +1: b1.h1.1 (seen D0-13) is eligible again: the side door serves it, at level 1.
  const next = play(C, today.state, nextDay(T0), allR);
  expect(rejoinsOf(next.steps)).toEqual([]);
  const sides = cardsOf(next.steps).filter(isSide);
  expect(sides.map((c) => [c.card, c.height])).toEqual([["b1.h1.1", 1]]);
  expect(next.state.sections[B]).toMatchObject({ returned: true });
});

test("fix round 1: a true content gap at the allowed levels still rejoins silently", () => {
  const p = play(fixture({ drop: noH1B }), startedAll(2, {}, { sections: waitingB(D0, { skippedLevel: 1 }) }), T0, allR);
  expect(rejoinsOf(p.steps)).toEqual([{ section: B }]);
  expect(cardsOf(p.steps).filter(isSide)).toEqual([]);
});

test("fix round 1: for a due section exactly one holds: side-door card served, silent rejoin, or cards exist but none eligible", () => {
  const drops = [[], noH1B, [...noH1B, ...noH2B]];
  const levels = [null, 1, 2, 3] as const;
  const seens = (c: typeof C) => [[], seenAll(bH1.filter((id) => c.cards[id]), D0 - 1, c),
    seenAll([...bH1, ...noH2B].filter((id) => c.cards[id]), D0 - 1, c)];
  let n = 0;
  for (const drop of drops) {
    const c = fixture({ drop });
    for (const lvl of levels) {
      for (const seen of seens(c)) {
        const s0 = startedAll(2, {}, { sections: waitingB(D0, { skippedLevel: lvl }), seen });
        const allowed = lvl !== null && lvl > 1 ? ([1, 2] as const).filter((h) => h < lvl) : [1 as const];
        const hasCards = ["b1", "b2"].some((id) => allowed.some((h) => c.skills[id].cards[h].length > 0));
        const eligible = ["b1", "b2"].some((id) => allowed.some((h) => eligibleCard(s0, c, id, h, D0, s0.rng, {}, cfg) !== null));
        const p = play(c, s0, T0, allR);
        const side = cardsOf(p.steps).filter(isSide);
        const rejoined = rejoinsOf(p.steps).length > 0;
        const waiting = side.length === 0 && !rejoined && p.state.sections[B].returned === false && hasCards && !eligible;
        const tag = `drop ${drop.length} level ${lvl} seen ${seen.length}`;
        expect([side.length > 0, rejoined, waiting].filter(Boolean).length, tag).toBe(1);
        expect(side.every((x) => x.height !== 3 && allowed.includes(x.height as 1 | 2)), tag).toBe(true);
        if (!hasCards) expect(rejoined, tag).toBe(true);
        else if (eligible) expect(side.length, tag).toBe(1);
        else expect(waiting, tag).toBe(true);
        n++;
      }
    }
  }
  expect(n).toBe(36);
});

test("fix round 1: too-hard at the lowest level never brings a review date earlier", () => {
  const s0 = startedAll(1, { b1: { nextReviewDay: D0 + 20 }, b2: { nextReviewDay: D0 + 20 } }, { sections: { [B]: section({ liking: 5 }) } });
  const st = startSession(s0, C, T0);
  const c0 = cardOf(st);
  expect(c0).toMatchObject({ section: B, height: 1 });
  expect(tooHard(st, T0 + 10_000).state.skills[c0.skill].nextReviewDay).toBe(D0 + 20);
  // a nearer review date moves out to the rest day
  const s1 = startedAll(1, { b1: { nextReviewDay: D0 + 1 }, b2: { nextReviewDay: D0 + 1 } }, { sections: { [B]: section({ liking: 5 }) } });
  const st1 = startSession(s1, C, T0);
  expect(tooHard(st1, T0 + 10_000).state.skills[cardOf(st1).skill].nextReviewDay).toBe(D0 + cfg.skip.tooHardRestDays);
});

test("fix round 1: a record created by a too-hard skip of a new skill (no attempts) in later sessions", () => {
  const base: State = { ...newState("s", 3), sessionCount: 4, ladder: null, answered: 1000 };
  const st = startSession(base, C, T0);
  const c0 = cardOf(st);
  // the served card made a guided card of a skill not started yet → record at level 1, no rest
  const g: Served = { ...c0, card: "a2.h2.1", skill: "a2", section: A, variant: 0, height: 2, effort: cfg.effort.h2 };
  const sk = tooHard({ ...st, state: { ...st.state, session: { ...st.state.session!, served: g } }, next: { kind: "card", card: g } }, T0 + 10_000);
  expect(sk.state.skills.a2).toMatchObject({ height: 1, attempts: [], nextReviewDay: null });
  const es = expectedSuccess(sk.state, "a2", 1, cfg);
  expect(es).toBeGreaterThan(0);
  expect(es).toBeLessThanOrEqual(1);
  let state = run(C, sk, T0 + 10_000, allR).state;
  // the first a2 card of the next day is at its recorded level (or one above, as a stretch card)
  const first = cardsOf(play(C, state, T0 + 86_400_000, allR).steps).find((c) => c.skill === "a2");
  expect(first).toBeDefined();
  expect(first!.height).toBe(state.skills.a2.height + (first!.reason === "stretch:up" ? 1 : 0));
  // the next days: no crash; a2 is never a due review; when served it is served at its recorded level
  for (const d of [1, 2, 3, 4]) {
    const p = play(C, state, T0 + d * 86_400_000, allR);
    const a2 = cardsOf(p.steps).filter((c) => c.skill === "a2");
    for (const c of a2) {
      expect(c.reason, `day ${d}`).not.toBe("due-review");
      // treated as a started skill, never as a new one (the tiny fixture's no-repeat window decides the heights later on)
      expect(c.reason.startsWith("new:"), `day ${d}`).toBe(false);
    }
    expect(lastStep(p.steps).next.kind).toBe("end");
    state = p.state;
  }
  // the resting variant: a new skill's level-1 card → resting record, not due before the rest day
  const fresh = startSession(newState("s", 3), C, T0);
  const f0 = cardOf(fresh);
  const fk = tooHard(fresh, T0 + 10_000);
  let fs = run(C, fk, T0 + 10_000, allR).state;
  for (const d of [1, 2]) {
    const p = play(C, fs, T0 + d * 86_400_000, allR);
    expect(cardsOf(p.steps).filter((c) => c.skill === f0.skill && c.reason === "due-review"), `day ${d}`).toEqual([]);
    fs = p.state;
  }
});

test("fix round 1: a silent rejoin by class timing (not-learned, class teaching the topic, 2 days after the skip, content gap)", () => {
  const noH1 = fixture({ drop: noH1B });
  // skipped on D0-2 (remind day D0+1) as not-learned, a level-2 card: level 1 only, and B has none
  const waiting = startedAll(2, {}, { sections: waitingB(D0 + 1, { lastReason: "not-learned", skippedLevel: 2 }) });
  const cls = play(noH1, setCurrentTopic(waiting, "u.t1", "class"), T0, allR);
  expect(rejoinsOf(cls.steps)).toEqual([{ section: B }]);
  expect(cls.state.sections[B]).toMatchObject({ returned: true, remindDay: null });
  // without the class topic: not due yet, nothing happens
  const plain = play(noH1, waiting, T0, allR);
  expect(rejoinsOf(plain.steps)).toEqual([]);
  // class topic but only 1 day after the skip: too soon
  const soon = startedAll(2, {}, { sections: waitingB(D0 + 2, { lastReason: "not-learned", skippedLevel: 2 }) });
  expect(rejoinsOf(play(noH1, setCurrentTopic(soon, "u.t1", "class"), T0, allR).steps)).toEqual([]);
});

test("fix round 1: setSkipReason too-hard after a section skip of a brand-new skill's card: no section record, a record for the skill", () => {
  const st = startSession(newState("s", 3), C, T0);
  const c0 = cardOf(st);
  expect(st.state.skills[c0.skill]).toBeUndefined();
  expect(st.state.sections).toEqual({});
  const sk = skip(st.state, C, { card: c0.card }, T0 + 10_000);
  expect(sk.state.sections[c0.section]).toMatchObject({ skipCount: 1 });
  expect(sk.state.session!.lastSkip).toMatchObject({ before: null, skill: c0.skill, level: c0.height });
  const out = setSkipReason(sk.state, C, c0.section, "too-hard", T0 + 12_000);
  expect(out.state.sections).toEqual({});
  expect(out.state.session!.blockedSections).toEqual([]);
  expect(out.state.skills[c0.skill]).toMatchObject({ height: 1, attempts: [], nextReviewDay: D0 + cfg.skip.tooHardRestDays });
  expect(out.state.session!.leftSkills).toEqual([c0.skill]);
  expect(out.events[0].data).toMatchObject({ scope: "card", skill: c0.skill, fromLevel: 1, toLevel: 1 });
});
