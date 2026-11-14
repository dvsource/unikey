import { test, expect } from "vitest";
import { defaultConfig as cfg } from "../src/config.js";
import { dayOf } from "../src/time.js";
import { answer, startSession } from "../src/session.js";
import { detectMoments, recordMoments } from "../src/moments.js";
import { migrate } from "../src/state.js";
import type { Content, Height, Moment, Reason, Served, SkillRec, State, Step } from "../src/types.js";
import { fixture } from "./fixture.js";
import { T0, atts, choiceFor, rec, run, section, startedState } from "./helpers.js";

const C: Content = fixture();
const D0 = dayOf(T0);
const A = "u.t1/A";
const B = "u.t1/B";

const sv = (skill: string, height: Height, reason: Reason = "due-review"): Served => ({
  card: `${skill}.h${height}`, variant: 0, skill, section: skill[0].toUpperCase() === "A" ? A : B, height, reason, effort: 1,
});
const withSession = (s: State, extra: Partial<NonNullable<State["session"]>> = {}): State =>
  ({ ...s, session: { moments: [], confident: [], ...extra } as unknown as NonNullable<State["session"]> });
const detect = (before: State, after: State, a: Served, right = true, day = D0) => detectMoments(before, after, C, a, right, day, cfg);
const solidRec = (height: Height = 3) => rec(height, atts(height, 3, 0, D0 - 3), { solidDays: [D0 - 5, D0 - 3] });

// ---------- then-wrong-now-right ----------

test("then-wrong-now-right: exactly 5 days later fires with both dates; 4 days does not", () => {
  const mk = (failedDay: number) => startedState({ a1: rec(2, atts(2, 2, 1, D0), { firstFailedDay: failedDay, firstFailedHeight: 2 }) });
  const five = mk(D0 - 5);
  expect(detect(five, five, sv("a1", 2))).toEqual([{ type: "then-wrong-now-right", skill: "a1", thenDay: D0 - 5, nowDay: D0 }]);
  const four = mk(D0 - 4);
  expect(detect(four, four, sv("a1", 2))).toEqual([]);
});

test("then-wrong-now-right: right at the failed height fires, one height lower does not; a wrong answer never fires", () => {
  const s = startedState({ a1: rec(3, atts(3, 2, 1, D0), { firstFailedDay: D0 - 9, firstFailedHeight: 3 }) });
  expect(detect(s, s, sv("a1", 3)).map((m) => m.type)).toEqual(["then-wrong-now-right"]);
  expect(detect(s, s, sv("a1", 2))).toEqual([]);
  expect(detect(s, s, sv("a1", 3), false)).toEqual([]);
});

// ---------- avoided-now-done ----------

/** Section A's last five attempts across a1 and a2 (seq order): `pattern` right/wrong. */
function sectionAState(pattern: boolean[], skipTotal: number): State {
  const at = (right: boolean, seq: number) => ({ day: D0 - 1, seq, height: 2 as Height, right, ms: 8000, card: "x" });
  const a1 = pattern.filter((_, i) => i % 2 === 0).map((r, j) => at(r, 1 + 2 * j));
  const a2 = pattern.filter((_, i) => i % 2 === 1).map((r, j) => at(r, 2 + 2 * j));
  const s = startedState({ a1: rec(2, a1), a2: rec(2, a2) }, { sections: { [A]: section({ skipCount: 0, skipTotal, returned: true }) } });
  return { ...s, skills: { a1: { ...s.skills.a1, attempts: a1 }, a2: { ...s.skills.a2, attempts: a2 } } };
}

test("avoided-now-done: 4 right of the last 5 after 2 skips fires; 3 of 5 does not; 1 skip does not", () => {
  const four = sectionAState([false, true, true, true, true], 2);
  expect(detect(four, four, sv("a1", 2))).toEqual([{ type: "avoided-now-done", section: A }]);
  const three = sectionAState([false, false, true, true, true], 2);
  expect(detect(three, three, sv("a1", 2))).toEqual([]);
  const oneSkip = sectionAState([false, true, true, true, true], 1);
  expect(detect(oneSkip, oneSkip, sv("a1", 2))).toEqual([]);
});

test("avoided-now-done counts only the last 5 attempts across the section's skills, and needs 5 of them", () => {
  const old = sectionAState([false, false, false, true, true, true, true], 2); // last five: f f t t t t -> f,t,t,t,t = 4
  expect(detect(old, old, sv("a2", 2)).map((m) => m.type)).toEqual(["avoided-now-done"]);
  const few = sectionAState([true, true, true, true], 2);
  expect(detect(few, few, sv("a1", 2))).toEqual([]);
});

// ---------- section-solid ----------

test("section-solid: every started skill solid and one at least; one started skill not solid blocks it", () => {
  const both = startedState({ a1: solidRec(), a2: solidRec() });
  expect(detect(both, both, sv("a1", 3))).toEqual([{ type: "section-solid", section: A }]);
  const one = startedState({ a1: solidRec(), a2: rec(2, atts(2, 2, 0, D0)) });
  expect(detect(one, one, sv("a1", 3))).toEqual([]);
  const onlyStarted = startedState({ a1: solidRec() }); // a2 never started: does not count
  expect(detect(onlyStarted, onlyStarted, sv("a1", 3)).map((m) => m.type)).toEqual(["section-solid"]);
  const none = startedState({ a1: rec(3, atts(3, 1, 0, D0), { solidDays: [D0] }) });
  expect(detect(none, none, sv("a1", 3))).toEqual([]);
});

// ---------- height-up ----------

test("height-up: a rise of the answered skill's height, with from and to; no rise, no moment", () => {
  const before = startedState({ a1: rec(2, atts(2, 1, 0, D0 - 1)) });
  const after = { ...before, skills: { a1: { ...before.skills.a1, height: 3 as Height } } };
  expect(detect(before, after, sv("a1", 2))).toEqual([{ type: "height-up", skill: "a1", from: 2, to: 3 }]);
  expect(detect(before, before, sv("a1", 2))).toEqual([]);
  const down = { ...before, skills: { a1: { ...before.skills.a1, height: 1 as Height } } };
  expect(detect(before, down, sv("a1", 2))).toEqual([]);
});

// ---------- missing-piece-fixed ----------

test("missing-piece-fixed: right on the return card after a right confidence card; not without the confidence, not on a wrong", () => {
  const s = startedState({ a1: rec(2, atts(2, 2, 0, D0)) });
  const ret = sv("a1", 2, "repair:return");
  expect(detect(s, withSession(s, { confident: ["a1"] }), ret)).toEqual([{ type: "missing-piece-fixed", skill: "a1" }]);
  expect(detect(s, withSession(s, { confident: [] }), ret)).toEqual([]);
  expect(detect(s, withSession(s, { confident: ["a1"] }), ret, false)).toEqual([]);
  expect(detect(s, withSession(s, { confident: ["a1"] }), sv("a1", 2, "due-review"))).toEqual([]);
});

// ---------- order, once, maximum ----------

test("several moments from one answer come strongest first (union order)", () => {
  const before = startedState({ a1: solidRec(2) }, { sections: { [A]: section({ skipTotal: 2 }) } });
  const s0 = { ...before, skills: { a1: { ...before.skills.a1, height: 3 as Height, firstFailedDay: D0 - 8, firstFailedHeight: 2 as Height,
    attempts: atts(2, 5, 0, D0).map((a, i) => ({ ...a, seq: i + 1 })) } } };
  const after = withSession(s0, { confident: ["a1"] });
  const types = detect(before, after, sv("a1", 3, "repair:return")).map((m) => m.type);
  expect(types).toEqual(["section-solid", "avoided-now-done", "then-wrong-now-right", "missing-piece-fixed", "height-up"]);
});

test("a moment already in momentsDone is not detected again", () => {
  const both = startedState({ a1: solidRec(), a2: solidRec() }, { momentsDone: [`section-solid:${A}`] });
  expect(detect(both, both, sv("a1", 3))).toEqual([]);
});

const solidA: Moment = { type: "section-solid", section: A };
const avoidedB: Moment = { type: "avoided-now-done", section: B };
const then: Moment = { type: "then-wrong-now-right", skill: "a1", thenDay: 1, nowDay: 9 };
const up: Moment = { type: "height-up", skill: "b1", from: 1, to: 2 };

test("recordMoments: at most 2 emitted per session; the dropped weak ones are gone, the dropped strong ones are held", () => {
  const s = withSession(startedState({}));
  const out = recordMoments(s, [then, up, solidA], cfg); // not sorted on purpose: the caller sorts
  expect(out).toEqual([then, up]);
  expect(s.session!.moments).toEqual([then, up]);
  expect(s.pendingMoments).toEqual([solidA]); // third, a held type
  expect(s.momentsDone).toEqual(["then-wrong-now-right:a1", "height-up:b1", `section-solid:${A}`]);

  const t = withSession(startedState({}), { moments: [up] });
  expect(recordMoments(t, [then, up], cfg)).toEqual([then]);
  expect(t.pendingMoments).toEqual([]);
  expect(t.momentsDone).toEqual(["then-wrong-now-right:a1"]); // the dropped one is not marked done
});

// ---------- through the session ----------

const card = (st: Step): Served => {
  if (st.next.kind !== "card") throw new Error(`expected card, got ${st.next.kind}`);
  return st.next.card;
};

test("a step up emits height-up with a moment event right after the answer event; once per skill", () => {
  const skills: Record<string, SkillRec> = {
    a1: rec(2, atts(2, 1, 0, D0 - 1), { nextReviewDay: D0 + 20 }),
    b1: rec(2, atts(2, 3, 0, D0 - 2), { nextReviewDay: D0 + 20, noFullUntilDay: D0 + 20 }),
    b2: rec(2, atts(2, 3, 0, D0 - 2), { nextReviewDay: D0 + 20, noFullUntilDay: D0 + 20 }),
  };
  const st0 = startSession(startedState(skills, { sections: { [A]: section({ liking: 3 }) } }), C, T0);
  const c = card(st0);
  expect(c).toMatchObject({ skill: "a1", height: 2 });
  const st1 = answer(st0.state, C, { card: c.card, choice: choiceFor(C, c, "r"), ms: 8000 }, T0 + 10_000);
  expect(st1.moments).toEqual([{ type: "height-up", skill: "a1", from: 2, to: 3 }]);
  const types = st1.events.map((e) => e.type);
  const i = types.indexOf("answer");
  expect(types[i + 1]).toBe("moment");
  expect(st1.events[i + 1].data).toEqual(st1.moments[0]);
  expect(types.indexOf("card_served")).toBeGreaterThan(i + 1);
  expect(st1.state.momentsDone).toEqual(["height-up:a1"]);
  expect(st1.state.session!.moments).toEqual(st1.moments);
  expect(JSON.parse(JSON.stringify(st1.state))).toEqual(st1.state);
  // once: the same key is never emitted again
  const again = detectMoments(st0.state, { ...st1.state, skills: { ...st1.state.skills, a1: { ...st1.state.skills.a1, height: 3 } } }, C, c, true, D0, cfg);
  expect(again).toEqual([]);
});

test("missing-piece-fixed: wrong, piece right, confidence right, then the return card right", () => {
  const lead: Record<string, SkillRec> = {
    a1: rec(3, atts(3, 10, 0, D0 - 2), { nextReviewDay: D0 + 20 }),
    b1: rec(2, atts(2, 3, 0, D0 - 2), { nextReviewDay: D0 + 20, noFullUntilDay: D0 + 20 }),
    b2: rec(2, atts(2, 3, 0, D0 - 2), { nextReviewDay: D0 + 20, noFullUntilDay: D0 + 20 }),
  };
  const s0 = { ...startedState(lead, { sections: { [A]: section({ liking: 2 }), [B]: section() } }) };
  s0.profile = { ...s0.profile, stamina: 30 };
  const first = startSession(s0, C, T0);
  const r = run(C, first, T0, (s, i) => (i === 0 ? "w" : "r"));
  const all = [first, ...r.steps];
  const idx = all.findIndex((st) => st.moments.some((m) => m.type === "missing-piece-fixed"));
  expect(idx).toBeGreaterThan(0);
  const prev = all[idx - 1].next;
  expect(prev.kind === "card" && prev.card.reason).toBe("repair:return");
  expect(all[idx].moments).toContainEqual({ type: "missing-piece-fixed", skill: "a1" });
  // a wrong answer on the return card gives none
  const r2 = run(C, first, T0, (s) => (s.reason === "repair:return" ? "w" : s.reason === "repair:missing-piece" && s.skill === "a1" && first.next.kind === "card" && s.card === card(first).card ? "w" : "r"));
  expect([first, ...r2.steps].flatMap((st) => st.moments).filter((m) => m.type === "missing-piece-fixed")).toEqual([]);
});

test("held moments open the next session's first step, count toward the maximum, and are cleared", () => {
  const skills: Record<string, SkillRec> = { a1: rec(2, atts(2, 3, 0, D0 - 2), { nextReviewDay: D0 - 1 }) };
  const held: Moment[] = [solidA, avoidedB, { type: "section-solid", section: "u.t1/Z" }];
  const s0 = startedState(skills, { pendingMoments: held, momentsDone: held.map((m) => `${m.type}:${"section" in m ? m.section : ""}`) });
  const st = startSession(s0, C, T0 + 3 * 86_400_000);
  expect(st.moments).toEqual([solidA, avoidedB]);
  expect(st.state.pendingMoments).toEqual([held[2]]);
  expect(st.state.session!.moments).toEqual([solidA, avoidedB]);
  const types = st.events.map((e) => e.type);
  expect(types.slice(0, 3)).toEqual(["session_start", "moment", "moment"]);
  expect(st.events[1].data).toEqual(solidA);
  // nothing further this session: the maximum is used up
  const c = card(st);
  const nx = answer(st.state, C, { card: c.card, choice: choiceFor(C, c, "r"), ms: 8000 }, T0 + 3 * 86_400_000 + 10_000);
  expect(nx.moments).toEqual([]);
  // the next session releases the remaining one
  const later = startSession({ ...nx.state, session: null }, C, T0 + 6 * 86_400_000);
  expect(later.moments).toEqual([held[2]]);
  expect(later.state.pendingMoments).toEqual([]);
});

test("migrate gives old states pendingMoments, momentsDone and skipTotal", () => {
  const old = JSON.parse(JSON.stringify(startedState({}, { sections: { [A]: section({ skipCount: 2 }) } })));
  delete old.pendingMoments; delete old.momentsDone; delete old.sections[A].skipTotal;
  const m = migrate(old);
  expect(m.pendingMoments).toEqual([]);
  expect(m.momentsDone).toEqual([]);
  expect(m.sections[A].skipTotal).toBe(2);
});
