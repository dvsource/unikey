import { test, expect } from "vitest";
import { defaultConfig as cfg } from "../src/config.js";
import { newState } from "../src/state.js";
import { ladderAfterAnswer, pickLadder } from "../src/ladder.js";
import { answer, startSession } from "../src/session.js";
import { dayOf } from "../src/time.js";
import type { Height, PickCtx, Seen, State, Step } from "../src/types.js";
import { isCalcWeak } from "../src/profile.js";
import { fixture } from "./fixture.js";
import { T0, atts, choiceFor, ladderSteps, play, rec, section, served, startedState } from "./helpers.js";

const C = fixture();
const D0 = dayOf(T0);
const ctx = (p: Partial<PickCtx> = {}): PickCtx => ({
  day: D0, remaining: 20, runningRight: 0, runningTotal: 0, newSkillsThisSession: 0,
  lastSkills: [], blockedSections: [], h3Spent: 0, spent: 0, strictBudget: true, ...p,
});
/** Every variant of these cards seen yesterday. */
const seenAll = (cards: string[]): Seen[] => cards.flatMap((card) => C.cards[card].variants.map((_, variant) => ({ card, variant, day: D0 - 1 })));
const cardsAt = (h: Height) => Object.keys(C.cards).filter((id) => C.cards[id].height === h);
const at = (level: Height, patch: Partial<State> = {}): State => ({ ...newState("s", 3), ladder: { level, rightRun: 0 }, ...patch });

test("starts at 1; two right → 2; two more → 3; stays 3", () => {
  let l = newState("s", 1).ladder!;
  expect(l).toEqual({ level: 1, rightRun: 0 });
  expect(cfg.ladder.upAfterRight).toBe(2);
  l = ladderAfterAnswer(l, true, cfg);
  expect(l).toEqual({ level: 1, rightRun: 1 });
  l = ladderAfterAnswer(l, true, cfg);
  expect(l).toEqual({ level: 2, rightRun: 0 });
  l = ladderAfterAnswer(ladderAfterAnswer(l, true, cfg), true, cfg);
  expect(l).toEqual({ level: 3, rightRun: 0 });
  l = ladderAfterAnswer(ladderAfterAnswer(l, true, cfg), true, cfg);
  expect(l).toEqual({ level: 3, rightRun: 0 });
  const one = { level: 2 as Height, rightRun: 1 };
  ladderAfterAnswer(one, true, cfg);
  expect(one).toEqual({ level: 2, rightRun: 1 }); // the input is not changed
});

test("a miss drops one level and resets the run; never below 1", () => {
  expect(ladderAfterAnswer({ level: 3, rightRun: 1 }, false, cfg)).toEqual({ level: 2, rightRun: 0 });
  expect(ladderAfterAnswer({ level: 2, rightRun: 1 }, false, cfg)).toEqual({ level: 1, rightRun: 0 });
  expect(ladderAfterAnswer({ level: 1, rightRun: 1 }, false, cfg)).toEqual({ level: 1, rightRun: 0 });
  // In a session: right, right (level 2), then a wrong ladder card → level 1; "I don't know" is a miss too.
  const first = play(C, newState("s", 1), T0, ["r", "r", "w"]);
  expect(lastLadder(first.steps)).toEqual({ level: 1, rightRun: 0 });
  const dk = play(C, newState("s", 1), T0, ["r", "r", "dk"]);
  expect(lastLadder(dk.steps)).toEqual({ level: 1, rightRun: 0 });
});

test("no card at the level → nearest lower, then nearest higher", () => {
  // Level 2, every level-2 card seen lately → level 1.
  expect(pickLadder(at(2, { seen: seenAll(cardsAt(2)) }), C, ctx(), cfg)!.served.height).toBe(1);
  // Level 2, levels 1 and 2 seen → level 3.
  expect(pickLadder(at(2, { seen: seenAll([...cardsAt(1), ...cardsAt(2)]) }), C, ctx(), cfg)!.served.height).toBe(3);
  // Level 1, level 1 seen → level 2 (the nearest higher) before level 3.
  expect(pickLadder(at(1, { seen: seenAll(cardsAt(1)) }), C, ctx(), cfg)!.served.height).toBe(2);
  // Level 3: nearest lower is 2, before 1.
  expect(pickLadder(at(3, { seen: seenAll(cardsAt(3)) }), C, ctx(), cfg)!.served.height).toBe(2);
  // A level-3 card that does not fit the budget counts as not eligible: the nearest lower level.
  expect(pickLadder(at(3), C, ctx({ remaining: 3 }), cfg)!.served.height).toBe(2);
  expect(pickLadder(at(3), C, ctx(), cfg)!.served.height).toBe(3);
  // Nothing at all eligible → null.
  expect(pickLadder(at(2, { seen: seenAll(Object.keys(C.cards)) }), C, ctx(), cfg)).toBeNull();
});

test("repair and closing cards do not move the ladder", () => {
  // Right, right, wrong at card 3 (a ladder card: level 2 → 1, then a repair), everything else right; then the same
  // with the last card wrong too, so a close card follows it.
  const pattern = (i: number) => (i === 2 ? "w" : "r");
  const n = served(play(C, newState("s", 1), T0, (_s, i) => pattern(i)).steps).length;
  const { steps } = play(C, newState("s", 1), T0, (_s, i) => (i === 2 || i === n - 1 ? "w" : pattern(i)));
  const moves = ladderSteps(steps);
  const kinds = new Set(moves.map((m) => m.served.reason));
  expect(kinds.has("repair:missing-piece")).toBe(true);
  expect(kinds.has("repair:confidence")).toBe(true);
  expect(kinds.has("close:winnable")).toBe(true);
  for (const m of moves) {
    if (m.served.reason.startsWith("repair:") || m.served.reason === "close:winnable") expect(m.after).toEqual(m.before);
  }
  // The miss on card 3 moved it (a ladder card); the repair's piece is below the missed level.
  expect(moves[2]).toMatchObject({ before: { level: 2, rightRun: 0 }, after: { level: 1, rightRun: 0 } });
  expect(moves[3].served).toMatchObject({ reason: "repair:missing-piece", height: 1 });
});

test("a right ladder answer above the skill's record sets the record to that level; below it does not lower it", () => {
  // Session 1, ladder at 2; a2 recorded at height 1 (section A, the only liked one; a2 outweighs a1) → served at 2 (the
  // ladder decides), right → record 2, step window restarted.
  const low = startedState({ a2: rec(1, atts(1, 1, 0, D0 - 1), { nextReviewDay: D0 + 5 }) }, { sessionCount: 0, ladder: { level: 2, rightRun: 0 } });
  const s1 = startSession(low, C, T0);
  const c1 = cardOf(s1);
  expect(c1).toMatchObject({ skill: "a2", height: 2, reason: "open:liked" });
  const a1 = answer(s1.state, C, { card: c1.card, choice: choiceFor(C, c1, "r"), ms: 8000 }, T0 + 10_000);
  expect(a1.state.skills.a2.height).toBe(2);
  expect(a1.state.skills.a2.windowStartSeq).toBe(a1.state.answered + 1);
  // a2 recorded at 3, ladder at 1 → served at 1; right → still 3.
  const high = startedState({ a2: rec(3, atts(3, 2, 0, D0 - 1), { nextReviewDay: D0 + 5 }) }, { sessionCount: 0 });
  const s2 = startSession(high, C, T0);
  const c2 = cardOf(s2);
  expect(c2).toMatchObject({ skill: "a2", height: 1 });
  const a2 = answer(s2.state, C, { card: c2.card, choice: choiceFor(C, c2, "r"), ms: 8000 }, T0 + 10_000);
  expect(a2.state.skills.a2.height).toBe(3);
  // A new skill gets its record at the served level.
  const fresh = startSession({ ...newState("s", 1), ladder: { level: 2, rightRun: 0 } }, C, T0);
  const c3 = cardOf(fresh);
  expect(c3.height).toBe(2);
  const a3 = answer(fresh.state, C, { card: c3.card, choice: choiceFor(C, c3, "r"), ms: 8000 }, T0 + 10_000);
  expect(a3.state.skills[c3.skill].height).toBe(2);
});

test("pickLadder order: liked sections, then due skills, then current topic, then weight, then id", () => {
  const s0 = { ...newState("s", 3), ladder: { level: 1 as Height, rightRun: 0 } };
  // A fresh student: the first liked section; a1 is the only ready skill in it (a2 requires a1).
  const liked0 = pickLadder(s0, C, ctx(), cfg)!.served;
  expect(liked0).toMatchObject({ height: 1, reason: "open:liked" });
  // Every skill started, not due, section B liked more: B first, and in it the higher weight (b2 0.4 > b1 0.2).
  const nd = { nextReviewDay: D0 + 5 };
  const all = startedState({
    a1: rec(1, atts(1, 1, 0, D0 - 1), nd), a2: rec(1, atts(1, 1, 0, D0 - 1), nd),
    b1: rec(1, atts(1, 1, 0, D0 - 1), nd), b2: rec(1, atts(1, 1, 0, D0 - 1), nd),
  }, { sections: { "u.t1/B": section({ liking: 2 }) }, ladder: { level: 1, rightRun: 0 } });
  expect(pickLadder(all, C, ctx(), cfg)!.served.skill).toBe("b2");
  // A due skill in the liked section before a heavier not-due one; past the open cards its reason is due-review.
  const dueB1 = { ...all, skills: { ...all.skills, b1: { ...all.skills.b1, nextReviewDay: D0 } } };
  expect(pickLadder(dueB1, C, ctx({ lastSkills: ["x", "y"] }), cfg)!.served).toMatchObject({ skill: "b1", reason: "due-review" });
  // ...and within the open cards, open:liked.
  expect(pickLadder(dueB1, C, ctx(), cfg)!.served).toMatchObject({ skill: "b1", reason: "open:liked" });
  // A started, not-due skill past the open cards: open:liked.
  expect(pickLadder(all, C, ctx({ lastSkills: ["x", "y"] }), cfg)!.served).toMatchObject({ skill: "b2", reason: "open:liked" });
  // The new-skill allowance does not apply; a new skill past the open cards is new:class-topic / new:exam-weight.
  const onlyA1 = startedState({ a1: rec(1, atts(1, 1, 0, D0 - 1), nd) }, { ladder: { level: 1, rightRun: 0 } });
  const blockA = ctx({ blockedSections: ["u.t1/A"], newSkillsThisSession: 9, lastSkills: ["x", "y"] });
  expect(pickLadder(onlyA1, C, blockA, cfg)!.served).toMatchObject({ section: "u.t1/B", reason: "new:exam-weight" });
  const inTopic = { ...onlyA1, currentTopic: { id: "u.t1", source: "class" as const } };
  expect(pickLadder(inTopic, C, blockA, cfg)!.served).toMatchObject({ section: "u.t1/B", reason: "new:class-topic" });
  // leftSkills / excludeSkills / the same-skill run are honoured (through the shared check).
  expect(pickLadder(all, C, ctx({ excludeSkills: ["b2"] }), cfg)!.served.skill).toBe("b1");
  expect(pickLadder(all, C, ctx({ leftSkills: ["b2"] }), cfg)!.served.skill).toBe("b1");
  expect(pickLadder(all, C, ctx({ lastSkills: ["b2", "b2", "b2"] }), cfg)!.served.skill).toBe("b1");
});

test("a ramp card in front of a level-3 ladder pick does not move the ladder; the level-3 card behind it does", () => {
  // Calculation-weak (height-2 attempts mostly right, height-3 mostly wrong), every skill due, ladder at 3.
  const due = { nextReviewDay: D0 - 1, noFullUntilDay: D0 - 1 };
  const s0 = startedState({
    a1: rec(3, atts(2, 11, 1, D0 - 2), due), a2: rec(3, atts(2, 11, 1, D0 - 2), due),
    b1: rec(3, atts(3, 10, 2, D0 - 2), due), b2: rec(3, atts(3, 0, 12, D0 - 2), due),
  }, { sessionCount: 0, ladder: { level: 3, rightRun: 0 } });
  expect(isCalcWeak(s0, cfg)).toBe(true);
  const { steps } = play(C, s0, T0, ["r", "r"], { ms: (s) => (s.height === 3 ? 12_000 : 8000) }); // a level-3 right under 10 s would be a fast right
  const moves = ladderSteps(steps);
  expect(moves[0].served.height).toBe(2); // the ramp card
  expect(moves[1].served).toMatchObject({ height: 3, skill: moves[0].served.skill });
  expect(moves[0].after).toEqual({ level: 3, rightRun: 0 });
  expect(moves[1].after).toEqual({ level: 3, rightRun: 1 });
});

test("fix 4: no level-3 ladder card of a skill whose noFullUntilDay is after today; it may be served lower", () => {
  const nd = { nextReviewDay: D0 + 5 };
  const mk = (until: number | null) => startedState({
    a1: rec(2, atts(2, 1, 0, D0 - 1), { ...nd, noFullUntilDay: until }), a2: rec(2, atts(2, 1, 0, D0 - 1), { ...nd, noFullUntilDay: until }),
  }, { ladder: { level: 3, rightRun: 0 } });
  const only = ctx({ blockedSections: ["u.t1/B"] });
  expect(pickLadder(mk(D0 + 1), C, only, cfg)!.served.height).toBe(2);
  expect(pickLadder(mk(D0), C, only, cfg)!.served.height).toBe(3);
  expect(pickLadder(mk(null), C, only, cfg)!.served.height).toBe(3);
});

test("fix 3: once maxFullPerSession level-3 ladder cards are served, level 3 is served as level 2", () => {
  expect(pickLadder(at(3), C, ctx({ ladderFull: 0 }), cfg)!.served.height).toBe(3);
  expect(pickLadder(at(3), C, ctx({ ladderFull: 1 }), cfg)!.served.height).toBe(2);
  // not even as the fallback: with levels 1 and 2 all seen, nothing
  expect(pickLadder(at(3, { seen: seenAll([...cardsAt(1), ...cardsAt(2)]) }), C, ctx({ ladderFull: 1 }), cfg)).toBeNull();
});

function lastLadder(steps: Step[]) {
  return steps[steps.length - 1].state.ladder;
}
function cardOf(st: Step) {
  if (st.next.kind !== "card") throw new Error(`expected card, got ${st.next.kind}`);
  return st.next.card;
}
