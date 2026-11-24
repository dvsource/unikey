// T114: Again / Hard / Good / Easy (DR-0052, DR-0056) and the repair near the session end, on the default config.
import { test, expect } from "vitest";
import { dayOf, DAY_MS } from "../src/time.js";
import { answer, endSession, skip, startSession } from "../src/session.js";
import { recordAttempt } from "../src/skill.js";
import { ladderAfterAnswer } from "../src/ladder.js";
import { pickMiddle } from "../src/pick.js";
import { migrate, newState } from "../src/state.js";
import { defaultConfig as cfg } from "../src/config.js";
import type { Grade, PickCtx, Served, SkillRec, State, Step } from "../src/types.js";
import { fixture } from "./fixture.js";
import { T0, atts, rec, section, startedState, withProfile } from "./helpers.js";

const C = fixture();
const D0 = dayOf(T0);

function card(st: Step): Served {
  if (st.next.kind !== "card") throw new Error(`expected a card, got ${st.next.kind}`);
  return st.next.card;
}
const wrongIndex = (sv: Served) => C.cards[sv.card].variants[sv.variant].findIndex((o) => !o.correct);
const rightIndex = (sv: Served) => C.cards[sv.card].variants[sv.variant].findIndex((o) => o.correct);
/** Grades the open card (recall: nothing picked). ms 12 s: above every guess line. */
const grade = (st: Step, g: Grade, now: number, picked?: number) =>
  answer(st.state, C, { card: card(st).card, ms: 12_000, grade: g, ...(picked !== undefined ? { picked } : {}) }, now);

/** Four started skills at level 2, none due, a liked section A; a long session (stamina 30). */
function started(stamina = 30): State {
  const r = (): SkillRec => rec(2, atts(2, 3, 0, D0 - 3), { nextReviewDay: D0 + 20, gapIndex: 2 });
  const s = startedState({ a1: r(), a2: r(), b1: r(), b2: r() }, { sections: { "u.t1/A": section({ liking: 2 }), "u.t1/B": section() } });
  return withProfile(s, { stamina });
}

/** Plays the session: `first` grades the first card, every later card gets `rest`, until it is no longer a card. */
function playOut(s: State, first: Grade, rest: (sv: Served, i: number) => Grade) {
  let st = startSession(s, C, T0);
  const cards: { sv: Served; g: Grade }[] = [];
  let now = T0;
  for (let i = 0; st.next.kind === "card" && i < 60; i++) {
    const sv = card(st);
    const g = i === 0 ? first : rest(sv, i);
    now += 15_000;
    st = grade(st, g, now);
    cards.push({ sv, g });
  }
  return { st, cards };
}

// ---------- grade effects (DR-0052 table) ----------

test("grade effects on the review gap: again 1 day and back to the first step; hard holds the step; good advances; easy skips one", () => {
  const def = C.skills.a1;
  const base = rec(2, atts(2, 1, 0, D0 - 5), { gapIndex: 2, nextReviewDay: D0 });
  const at = (g: Grade) => recordAttempt(base, def, { day: D0, seq: 50, height: 2, right: g !== "again", ms: 9000, card: "a1.h2.1", grade: g }, 1, cfg).rec;
  const gaps = cfg.reviewGapsDays; // [1, 3, 7, 14, 30]
  expect(at("again")).toMatchObject({ gapIndex: 0, nextReviewDay: D0 + gaps[0] });
  expect(at("hard")).toMatchObject({ gapIndex: 2, nextReviewDay: D0 + gaps[1] }); // the step it is on, no advance
  expect(at("good")).toMatchObject({ gapIndex: 3, nextReviewDay: D0 + gaps[2] }); // as before grades
  expect(at("easy")).toMatchObject({ gapIndex: 4, nextReviewDay: D0 + gaps[3] }); // one step further, two steps on
  // an attempt saved before grades counts as good when right
  const old = recordAttempt(base, def, { day: D0, seq: 50, height: 2, right: true, ms: 9000, card: "a1.h2.1" }, 1, cfg).rec;
  expect({ ...old, attempts: [] }).toEqual({ ...at("good"), attempts: [] });
});

test("easy steps up at once (when allowed for the skill this session), never into a rested level 3; hard is no step-up credit", () => {
  const def = C.skills.a1;
  const a = (g: Grade, seq: number, day = D0) => ({ day, seq, height: 2 as const, right: g !== "again", ms: 9000, card: "a1.h2.1", grade: g });
  const fresh = rec(2, [], { windowStartSeq: 0 });
  const up = recordAttempt(fresh, def, a("easy", 1), 1, cfg, { easyUp: true });
  expect(up).toMatchObject({ steppedUp: true, easyUp: true });
  expect(up.rec.height).toBe(3);
  // already used this session: an easy counts as one right, no step yet
  expect(recordAttempt(fresh, def, a("easy", 1), 1, cfg, { easyUp: false })).toMatchObject({ steppedUp: false, easyUp: false });
  // a returning section's first days (or a full miss) rest level 3: no step up into it
  const rested = rec(2, [], { noFullUntilDay: D0 + 2 });
  expect(recordAttempt(rested, def, a("easy", 1), 1, cfg, { easyUp: true }).rec.height).toBe(2);
  // two goods a day apart step up; a hard in their place does not
  const one = recordAttempt(fresh, def, a("good", 1, D0 - 1), 1, cfg).rec;
  expect(recordAttempt(one, def, a("good", 2), 1, cfg).steppedUp).toBe(true);
  const hard1 = recordAttempt(fresh, def, a("hard", 1, D0 - 1), 1, cfg).rec;
  expect(recordAttempt(hard1, def, a("good", 2), 1, cfg).steppedUp).toBe(false);
  // a hard is not a miss: no step down
  expect(recordAttempt(hard1, def, a("hard", 2), 1, cfg).steppedDown).toBe(false);
});

test("ladder: a hard keeps the level and restarts the run of rights", () => {
  expect(ladderAfterAnswer({ level: 2, rightRun: 1 }, true, cfg, true)).toEqual({ level: 2, rightRun: 0 });
  expect(ladderAfterAnswer({ level: 2, rightRun: 1 }, true, cfg)).toEqual({ level: 3, rightRun: 0 });
});

test("an Easy step-up happens at most once per skill per session", () => {
  const s = started();
  const st0 = startSession(s, C, T0);
  const sv = card(st0);
  const st1 = grade(st0, "easy", T0 + 15_000);
  expect(st1.state.session!.easyUps).toEqual([sv.skill]);
  expect(st1.state.skills[sv.skill].height).toBe(3);
});

// ---------- the answer input ----------

test("the student's grade always counts: a wrong MCQ graded Good schedules as right; the result is logged next to it", () => {
  const st0 = startSession(started(), C, T0);
  const sv = card(st0);
  const before = st0.state.skills[sv.skill];
  const st1 = grade(st0, "good", T0 + 15_000, wrongIndex(sv));
  expect(st1.feedback).toMatchObject({ right: true, grade: "good", correct: false, correctIndex: rightIndex(sv) });
  const after = st1.state.skills[sv.skill];
  expect(after.gapIndex).toBe(before.gapIndex + 1); // not reset to the first step
  expect(st1.state.session!.repairQueue).toEqual([]); // no repair: not a miss
  const ev = st1.events.find((e) => e.type === "answer")!;
  expect(ev.data).toMatchObject({ grade: "good", mode: "mcq", picked: wrongIndex(sv), correct: false, right: true });
  // a right MCQ graded Again is a miss (the repair waits for the end)
  const st2 = grade(st0, "again", T0 + 15_000, rightIndex(sv));
  expect(st2.feedback).toMatchObject({ right: false, grade: "again", correct: true });
  expect(st2.state.session!.repairQueue.map((q) => q.skill)).toEqual([sv.skill]);
  // recall: nothing picked, correct is null
  expect(grade(st0, "hard", T0 + 15_000).feedback).toMatchObject({ right: true, grade: "hard", correct: null });
});

test("an invalid answer is a stale call; the old { choice } input still works (right → good, else again)", () => {
  const st0 = startSession(started(), C, T0);
  const sv = card(st0);
  const bad = [
    { card: sv.card, ms: 9000, grade: "meh" as Grade },
    { card: sv.card, ms: 9000, grade: "good" as Grade, picked: 99 },
    { card: sv.card, ms: 9000, grade: "good" as Grade, picked: 0, mode: "recall" as const },
  ];
  for (const input of bad) expect(answer(st0.state, C, input, T0 + 9000).events).toEqual([]);
  const legacy = answer(st0.state, C, { card: sv.card, choice: rightIndex(sv), ms: 12_000 }, T0 + 15_000);
  expect(legacy.feedback).toMatchObject({ right: true, grade: "good", correct: true });
  const dk = answer(st0.state, C, { card: sv.card, choice: "dont-know", ms: 12_000 }, T0 + 15_000);
  expect(dk.feedback).toMatchObject({ right: false, grade: "again", correct: null });
});

// ---------- repair timing (spec §4 item 3) ----------

test("after Again the repair is not the next card: it comes near the end, after the middle, never straight after a miss", () => {
  const { st, cards } = playOut(started(), "again", () => "good");
  const missed = cards[0].sv;
  expect(cards[1].sv.reason.startsWith("repair:")).toBe(false);
  expect(cards[1].sv.card).not.toBe(missed.card); // no same-card retry
  const r = cards.findIndex((c) => c.sv.reason === "repair:missing-piece");
  expect(r).toBeGreaterThan(2);
  expect(cards[r].sv.card).not.toBe(missed.card);
  expect(cards[r].sv.height).toBeLessThan(missed.height);
  // after the repair cards only the repair's own steps or the end: no more middle cards
  expect(cards.slice(r).every((c) => c.sv.reason.startsWith("repair:") || c.sv.reason === "close:winnable")).toBe(true);
  for (let i = 1; i < cards.length; i++) {
    if (cards[i].sv.reason.startsWith("repair:")) expect(cards[i - 1].g).not.toBe("again");
  }
  expect(st.next.kind === "end" || st.next.kind === "offer-extend").toBe(true);
});

test("a repair with no room left waits for the next session's opening", () => {
  const st0 = startSession(started(), C, T0);
  const missed = card(st0);
  const st1 = grade(st0, "again", T0 + 15_000);
  const left = endSession(st1.state, C, T0 + 30_000); // the student leaves before the end of the session
  expect(left.state.carryRepairs).toMatchObject([{ skill: missed.skill, failedHeight: missed.height, card: missed.card, carried: true }]);
  const next = startSession(left.state, C, T0 + DAY_MS);
  expect(card(next)).toMatchObject({ reason: "repair:missing-piece" });
  expect(card(next).card).not.toBe(missed.card);
  expect(next.why).toMatch(/carried from the last session/);
  expect(next.state.carryRepairs).toEqual([]);
});

test("two Hards in a row: the next card is one the student usually gets right", () => {
  let st = startSession(started(), C, T0);
  st = grade(st, "hard", T0 + 15_000);
  st = grade(st, "hard", T0 + 30_000);
  expect(card(st)).toMatchObject({ reason: "comfort-correction", height: 1 });
  expect(st.why).toMatch(/2 Hards in a row/);
});

test("three Easys in a row push up: a stretch card before the running rate would allow one", () => {
  const r2 = (): SkillRec => rec(2, atts(2, 7, 0, D0 - 3), { nextReviewDay: D0 + 20 });
  const s = startedState({ a1: r2(), b1: rec(1, atts(1, 2, 0, D0 - 3), { nextReviewDay: D0 + 20 }) });
  const ctx: PickCtx = {
    day: D0, remaining: 20, runningRight: 3, runningTotal: 3, newSkillsThisSession: 2, lastSkills: ["b1", "b1", "b1"],
    blockedSections: [], h3Spent: 0, spent: 4,
  };
  expect(pickMiddle(s, C, ctx, cfg)!.served.reason).not.toBe("stretch:up"); // 3 answers: under estimate.minRunning
  expect(pickMiddle(s, C, { ...ctx, pushUp: true }, cfg)!.served).toMatchObject({ skill: "a1", height: 3, reason: "stretch:up" });
});

// ---------- skip, why, migrate ----------

test("a skip with no reason is \"later\" (spec §4 item 6)", () => {
  const st0 = startSession(started(), C, T0);
  const sv = card(st0);
  const st1 = skip(st0.state, C, { card: sv.card }, T0 + 3000);
  expect(st1.state.sections[sv.section].lastReason).toBe("later");
});

test("every served card has a why; the step carries the same text", () => {
  let st = startSession(newState("w", 3), C, T0);
  for (let i = 0; st.next.kind === "card" && i < 30; i++) {
    expect(st.why).toBeTruthy();
    expect(st.why).toBe(card(st).why);
    st = grade(st, i % 3 === 0 ? "again" : "good", T0 + (i + 1) * 15_000);
  }
  expect(st.why).toBeUndefined();
  // a due card says what the last grade was and how long ago
  const due = startedState({ a1: rec(2, [{ day: D0 - 3, seq: 0, height: 2, right: true, ms: 9000, card: "a1.h2.1", grade: "good" }], { nextReviewDay: D0 }) },
    { sections: { "u.t1/A": section({ liking: 2 }) } });
  const s1 = startSession(due, C, T0);
  const c = card(s1);
  if (c.reason === "due-review") expect(c.why).toBe("due: Good 3 days ago");
});

test("migrate gives a state saved before T114 its new fields", () => {
  const st0 = startSession(started(), C, T0);
  const old = JSON.parse(JSON.stringify(st0.state));
  delete old.carryRepairs;
  delete old.session.repairQueue;
  delete old.session.repairing;
  delete old.session.easyUps;
  const m = migrate(old);
  expect(m.carryRepairs).toEqual([]);
  expect(m.session).toMatchObject({ repairQueue: [], repairing: false, easyUps: [] });
});
