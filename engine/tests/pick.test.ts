import { test, expect } from "vitest";
import { defaultConfig as cfg } from "../src/config.js";
import { newState, effectiveNow } from "../src/state.js";
import { newSkillRec } from "../src/skill.js";
import { dayOf, DAY_MS } from "../src/time.js";
import { expectedSuccess, usualMs } from "../src/estimate.js";
import { closeSweepReason, eligibleCard, likedSections, pickAny, pickOpen, pickMiddle, pickClose } from "../src/pick.js";
import { pickLadder } from "../src/ladder.js";
import { newSectionRec as newSection } from "../src/skip.js";
import type { PickCtx } from "../src/types.js";
import type { Attempt, Content, Height, Seen, SkillRec, State } from "../src/types.js";
import { fixture } from "./fixture.js";

const C = fixture();
const D = 100;
let seq = 0;
const att = (height: Height, right: boolean, day = D - 3): Attempt => ({ day, seq: ++seq, height, right, ms: 1000, card: "c" });
const rec = (height: Height, extra: Partial<SkillRec> = {}): SkillRec => ({ ...newSkillRec(height), ...extra });
function st(skills: Record<string, SkillRec> = {}, patch: Partial<State> = {}): State {
  return { ...newState("s", 7), skills, ...patch };
}
const ctx = (p: Partial<PickCtx> = {}): PickCtx => ({
  day: D, remaining: 20, runningRight: 0, runningTotal: 0, newSkillsThisSession: 0,
  lastSkills: [], blockedSections: [], h3Spent: 0, spent: 0, ...p,
});
const due = (h: Height, overdue = 1, extra: Partial<SkillRec> = {}) => rec(h, { nextReviewDay: D - overdue, ...extra });
const notDue = (h: Height, extra: Partial<SkillRec> = {}) => rec(h, { nextReviewDay: D + 5, ...extra });
const seenAll = (cards: string[], day: number): Seen[] => cards.map((card) => ({ card, variant: 0, day }));

/** Copy of content with section A moved to topic u.t2 (so "current topic" can differ by section). */
function twoTopics(): Content {
  const c = structuredClone(C);
  for (const id of c.sections["u.t1/A"].skills) c.skills[id].topic = "u.t2";
  c.sections["u.t1/A"].topic = "u.t2";
  c.topics["u.t1"].sections = ["u.t1/B"];
  c.topics["u.t2"] = { id: "u.t2", unit: "u", sections: ["u.t1/A"] };
  return c;
}

// ---------- estimates ----------

test("expectedSuccess: no history → priors 0.85/0.7/0.5", () => {
  const s = st();
  expect(expectedSuccess(s, "a1", 1, cfg)).toBeCloseTo(0.85);
  expect(expectedSuccess(s, "a1", 2, cfg)).toBeCloseTo(0.7);
  expect(expectedSuccess(s, "a1", 3, cfg)).toBeCloseTo(0.5);
});

test("expectedSuccess: 3 right 1 wrong at h2 → (3 + 1.4) / 6", () => {
  const s = st({ a1: rec(2, { attempts: [att(2, true), att(2, true), att(2, false), att(2, true), att(1, false)] }) });
  expect(expectedSuccess(s, "a1", 2, cfg)).toBeCloseTo((3 + 1.4) / 6, 10);
  // Attempts at other heights do not count; another skill with no history stays on the prior.
  expect(expectedSuccess(s, "a1", 1, cfg)).toBeCloseTo((0 + 1.7) / 3, 10);
  expect(expectedSuccess(s, "b1", 2, cfg)).toBeCloseTo(0.7, 10);
});

test("expectedSuccess: student's own prior once ≥ 10 attempts at that height across skills", () => {
  const nine = Array.from({ length: 9 }, (_, i) => att(1, i < 3));
  expect(expectedSuccess(st({ a2: rec(1, { attempts: nine }) }), "b1", 1, cfg)).toBeCloseTo(0.85, 10);
  const s = st({ a2: rec(1, { attempts: nine }), b2: rec(1, { attempts: [att(1, false)] }) });
  // 3 right of 10 → own prior 0.3 for a skill with no history
  expect(expectedSuccess(s, "b1", 1, cfg)).toBeCloseTo(0.3, 10);
  expect(cfg.estimate).toEqual({ priorWeight: 2, minOwnPrior: 10, minMsSamples: 5, comfortLowMark: 0.8, minRunning: 5 });
});

test("usualMs: median of last ms, null under 5 samples", () => {
  const s = st();
  s.profile = { ...s.profile, msByHeight: { 1: [5, 1, 3, 2], 2: [9, 1, 5, 3, 7], 3: [4, 1, 3, 2, 6, 5] } };
  expect(usualMs(s, 1)).toBeNull();
  expect(usualMs(s, 2)).toBe(5);
  expect(usualMs(s, 3)).toBe(3.5);
});

// ---------- eligibleCard ----------

test("eligibleCard skips anything seen in last 14 days, allows day 15", () => {
  const s = st({}, { seen: [...seenAll(["a1.h2.1", "a1.h2.2"], 1), ...Array.from({ length: 19 }, (_, v) => ({ card: "a1.h3", variant: v, day: 1 }))] });
  const at14 = new Set<string>(); const at15 = new Set<string>(); const h3v = new Set<number>();
  for (let seed = 1; seed <= 40; seed++) {
    at14.add(eligibleCard(s, C, "a1", 2, 14, { seed, n: 0 })!.card);
    at15.add(eligibleCard(s, C, "a1", 2, 15, { seed, n: 0 })!.card);
    const h3 = eligibleCard(s, C, "a1", 3, 14, { seed, n: 0 })!;
    expect(h3.card).toBe("a1.h3"); h3v.add(h3.variant);
  }
  expect([...at14]).toEqual(["a1.h2.3"]);
  expect([...at15].sort()).toEqual(["a1.h2.1", "a1.h2.2", "a1.h2.3"]);
  expect([...h3v]).toEqual([19]);
});

test("eligibleCard prefers tag, then note, then rest", () => {
  const s = st();
  const r = { seed: 3, n: 0 };
  expect(eligibleCard(s, C, "a1", 1, D, r, { preferTag: "sign-error" })!.card).toBe("a1.h1.2");
  expect(eligibleCard(s, C, "a2", 2, D, r, { preferNote: "n1" })!.card).toBe("a2.h2.2");
  // Tag beats note; note beats rest.
  const c = structuredClone(C); c.cards["a1.h1.1"].noteRef = "n9";
  const opts = { preferTag: "sign-error", preferNote: "n9" };
  expect(eligibleCard(s, c, "a1", 1, D, r, opts)!.card).toBe("a1.h1.2");
  const s2 = st({}, { seen: seenAll(["a1.h1.2"], D) });
  for (let seed = 1; seed <= 20; seed++) expect(eligibleCard(s2, c, "a1", 1, D, { seed, n: 0 }, opts)!.card).toBe("a1.h1.1");
  const s3 = st({}, { seen: seenAll(["a1.h1.1", "a1.h1.2"], D) });
  expect(eligibleCard(s3, c, "a1", 1, D, r, opts)!.card).toBe("a1.h1.3");
  expect(eligibleCard(s, c, "a1", 1, D, r, { exclude: ["a1.h1.2"], preferTag: "sign-error" })!.card).not.toBe("a1.h1.2");
});

test("eligibleCard returns null when all seen", () => {
  const s = st({}, { seen: seenAll(["a1.h1.1", "a1.h1.2", "a1.h1.3"], D - 2) });
  expect(eligibleCard(s, C, "a1", 1, D, { seed: 1, n: 0 })).toBeNull();
  expect(eligibleCard(st(), fixture({ drop: ["b1.h3"] }), "b1", 3, D, { seed: 1, n: 0 })).toBeNull();
});

// ---------- liked sections ----------

test("likedSections: liking desc then success rate; fallback is the easiest section of the current topic", () => {
  // No attempts: all skills start at h2 (prior 0.7) → tie → lowest weight section A (0.4 < 0.6).
  expect(likedSections(st(), C)[0]).toBe("u.t1/A");
  const s = st({ a1: rec(2, { attempts: [att(2, true), att(2, false)] }), b1: rec(2, { attempts: [att(2, true)] }) });
  expect(likedSections(s, C)).toEqual(["u.t1/B", "u.t1/A"]);
  s.sections = { "u.t1/A": { skipCount: 0, remindDay: null, lastReason: null, dripStopped: false, liking: 2, returned: false, skipTotal: 0, lastSkipSeq: null, skippedLevel: null } };
  expect(likedSections(s, C)).toEqual(["u.t1/A", "u.t1/B"]);
});

// ---------- middle ----------

test("middle: due beats new; due order = current topic, weight, overdue", () => {
  // a1 started (so a2 is a valid new skill), b1 & b2 due, a1 due longest.
  const skills = { a1: due(2, 9), b1: due(2, 1), b2: due(2, 1) };
  const r = pickMiddle(st(skills), C, ctx(), cfg)!;
  expect(r.served).toMatchObject({ skill: "b2", reason: "due-review" }); // weight 0.4 beats overdue a1
  // Current topic beats weight: a1 (weight 0.1) is in the current topic u.t2.
  const c2 = twoTopics();
  const r2 = pickMiddle(st(skills, { currentTopic: { id: "u.t2", source: "class" } }), c2, ctx(), cfg)!;
  expect(r2.served).toMatchObject({ skill: "a1", reason: "due-review" });
  // Equal weight → most overdue.
  const c3 = structuredClone(C); c3.skills["b1"].weight = 0.4;
  const r3 = pickMiddle(st({ a1: notDue(2), b1: due(2, 4), b2: due(2, 2) }), c3, ctx(), cfg)!;
  expect(r3.served.skill).toBe("b1");
});

test("middle: h3 share breaks ties among otherwise-equal candidates", () => {
  const c = structuredClone(C); c.skills["b1"].weight = 0.4;
  const s = st({ a1: notDue(2), b1: due(2, 2), b2: due(3, 2) });
  expect(pickMiddle(s, c, ctx({ h3Spent: 0, spent: 10 }), cfg)!.served).toMatchObject({ skill: "b2", height: 3 });
  expect(pickMiddle(s, c, ctx({ h3Spent: 8, spent: 10 }), cfg)!.served).toMatchObject({ skill: "b1", height: 2 });
});

test("middle: new skill needs requires started → a2 not offered before a1", () => {
  const block = ctx({ blockedSections: ["u.t1/B"] });
  const r = pickMiddle(st(), C, block, cfg)!;
  expect(r.served).toMatchObject({ skill: "a1", reason: "new:exam-weight", height: 2 });
  const r2 = pickMiddle(st({ a1: notDue(2) }), C, block, cfg)!;
  expect(r2.served).toMatchObject({ skill: "a2", reason: "new:exam-weight" });
  // A requires-skill without content does not block.
  const noA1 = fixture({ drop: ["a1.h1.1", "a1.h1.2", "a1.h1.3", "a1.h2.1", "a1.h2.2", "a1.h2.3", "a1.h3"] });
  expect(pickMiddle(st(), noA1, block, cfg)!.served.skill).toBe("a2");
  // In the current topic → new:class-topic, and topic beats weight.
  const r3 = pickMiddle(st({}, { currentTopic: { id: "u.t2", source: "student" } }), twoTopics(), ctx(), cfg)!;
  expect(r3.served).toMatchObject({ skill: "a1", reason: "new:class-topic" });
  // Without topic: highest weight overall (b2 0.4).
  expect(pickMiddle(st(), C, ctx(), cfg)!.served).toMatchObject({ skill: "b2", reason: "new:exam-weight" });
});

test("middle: max 2 new skills per session", () => {
  const s = st({ a1: notDue(2) });
  expect(pickMiddle(s, C, ctx({ newSkillsThisSession: 1 }), cfg)!.served.reason).toBe("new:exam-weight");
  const r = pickMiddle(s, C, ctx({ newSkillsThisSession: 2 }), cfg)!;
  expect(r.served).toMatchObject({ skill: "a1", reason: "comfort-correction" });
  // Also no new skill when the running rate is below comfort.
  expect(pickMiddle(s, C, ctx({ runningRight: 1, runningTotal: 2 }), cfg)!.served.reason).toBe("comfort-correction");
});

test("middle: running rate below comfort → comfort-correction with expectedSuccess ≥ comfort", () => {
  const s = st({
    a1: notDue(2, { attempts: [att(2, true), att(2, true), att(2, true), att(2, true)] }), // h2: 5.4/6 = 0.9
    b1: notDue(3),                                                                     // best is h1 prior 0.85
    b2: due(3, 2),                                                                     // due, would win otherwise
  });
  expect(pickMiddle(s, C, ctx({ runningRight: 3, runningTotal: 4 }), cfg)!.served.skill).toBe("b2");
  const r = pickMiddle(s, C, ctx({ runningRight: 1, runningTotal: 4 }), cfg)!;
  // Task 11 R2: lowest height first among those reaching comfort (a1 h1 prior 0.85 before a1 h2 0.9).
  expect(r.served).toMatchObject({ skill: "a1", height: 1, reason: "comfort-correction" });
  expect(expectedSuccess(s, r.served.skill, r.served.height, cfg)).toBeGreaterThanOrEqual(s.profile.comfort);
  // Nothing reaches comfort → b1 dropped to h1 (0.85) once a1 is unavailable.
  const r2 = pickMiddle(s, C, ctx({ runningRight: 1, runningTotal: 4, blockedSections: ["u.t1/A"] }), cfg)!;
  expect(r2.served).toMatchObject({ skill: "b1", height: 1, reason: "comfort-correction" });
  // Fix round 1 (finding 2): nothing reaches comfort → still the lowest height (it returned null before).
  const hard = { ...s, profile: { ...s.profile, comfort: 0.95 } };
  expect(pickMiddle(hard, C, ctx({ runningRight: 1, runningTotal: 4 }), cfg)!.served).toMatchObject({ height: 1, reason: "comfort-correction" });
});

test("middle: blocked section never returned", () => {
  const skills = { a1: notDue(2), b1: due(2, 3), b2: due(3, 3) };
  const skipped = st(skills, { sections: { "u.t1/B": { skipCount: 1, remindDay: D + 3, lastReason: "later", dripStopped: false, liking: 0, returned: false, skipTotal: 1, lastSkipSeq: null, skippedLevel: null } } });
  for (let seed = 1; seed <= 10; seed++) {
    const r = pickMiddle({ ...skipped, rng: { seed, n: 0 } }, C, ctx(), cfg)!;
    expect(r.served.section).toBe("u.t1/A");
  }
  // On the remind day it is still kept for the side door (Task 6); once it has returned it is back.
  expect(pickMiddle(skipped, C, ctx({ day: D + 3 }), cfg)!.served.section).toBe("u.t1/A");
  const back = { ...skipped, sections: { "u.t1/B": { ...skipped.sections["u.t1/B"], remindDay: null, returned: true } } };
  expect(pickMiddle(back, C, ctx({ day: D + 3 }), cfg)!.served.section).toBe("u.t1/B");
  // ctx.blockedSections blocks too.
  expect(pickMiddle(st(skills), C, ctx({ blockedSections: ["u.t1/B"] }), cfg)!.served.section).toBe("u.t1/A");
  expect(pickMiddle(st({ b1: due(2) }), C, ctx({ blockedSections: ["u.t1/B", "u.t1/A"] }), cfg)).toBeNull();
});

test("middle: no 4th card in a row on one skill", () => {
  const s = st({ a1: notDue(2), b1: due(2, 1), b2: due(2, 1) });
  expect(pickMiddle(s, C, ctx({ lastSkills: ["a1", "b2", "b2"] }), cfg)!.served.skill).toBe("b2");
  expect(pickMiddle(s, C, ctx({ lastSkills: ["b2", "b2", "b2"] }), cfg)!.served.skill).toBe("b1");
});

test("middle: h3 card not served when it would pass budget, unless under minimum day", () => {
  const skills = { a1: notDue(1), b2: due(3, 2) };
  const over = st(skills, { day: { day: D, effort: 10, streakKept: true } });
  const r = pickMiddle(over, C, ctx({ remaining: 3 }), cfg)!;
  expect(r.served.skill).not.toBe("b2");
  expect(r.served.height).not.toBe(3);
  expect(r.served.effort).toBeLessThanOrEqual(3);
  const under = st(skills, { day: { day: D, effort: 2, streakKept: false } });
  expect(pickMiddle(under, C, ctx({ remaining: 3 }), cfg)!.served).toMatchObject({ skill: "b2", height: 3, effort: 4 });
  // Yesterday's effort does not count toward today.
  const stale = st(skills, { day: { day: D - 1, effort: 30, streakKept: true } });
  expect(pickMiddle(stale, C, ctx({ remaining: 3 }), cfg)!.served.skill).toBe("b2");
  expect(pickMiddle(over, C, ctx({ remaining: 4 }), cfg)!.served.skill).toBe("b2");
});

test("borrowed strength: returned section names a solid neighbour", () => {
  const s = st({ a1: notDue(3, { solidDays: [D - 5, D - 4] }), a2: due(2, 1) }, {
    sections: { "u.t1/A": { skipCount: 0, remindDay: null, lastReason: null, dripStopped: false, liking: 0, returned: true, skipTotal: 0, lastSkipSeq: null, skippedLevel: null } },
  });
  const r = pickMiddle(s, C, ctx({ blockedSections: ["u.t1/B"] }), cfg)!;
  expect(r.served).toMatchObject({ skill: "a2", borrowedFrom: "a1" });
  const plain = st({ a1: notDue(3, { solidDays: [D - 5, D - 4] }), a2: due(2, 1) });
  expect(pickMiddle(plain, C, ctx({ blockedSections: ["u.t1/B"] }), cfg)!.served.borrowedFrom).toBeUndefined();
});

// ---------- open / close ----------

test("open: brand-new student gets height-1 card, reason open:liked", () => {
  const r = pickOpen(st(), C, ctx(), cfg)!;
  expect(r.served).toMatchObject({ skill: "a1", section: "u.t1/A", height: 1, reason: "open:liked", effort: 1 });
  expect(r.served.card).toMatch(/^a1\.h1\./);
  expect(r.rng).not.toEqual(st().rng);
  // Started student: best liked section, skill with highest expectedSuccess, one height lower when below comfort.
  const s = st({
    a1: notDue(3, { attempts: [att(3, false), att(3, false)] }), // h3: 1/4 → drop to h2
    b1: notDue(2, { attempts: [att(2, true), att(2, true), att(2, true)] }),
  });
  s.sections = { "u.t1/A": { skipCount: 0, remindDay: null, lastReason: null, dripStopped: false, liking: 1, returned: false, skipTotal: 0, lastSkipSeq: null, skippedLevel: null } };
  s.answered = 1000; // a student with history (Task 11 R3 starts students with fewer answers at the lowest height)
  expect(pickOpen(s, C, ctx(), cfg)!.served).toMatchObject({ skill: "a1", height: 2, reason: "open:liked" });
});

test("close: winnable ≥ 0.85 from liked section, reason close:winnable", () => {
  const s = st({
    a1: notDue(2, { attempts: [att(2, true), att(2, false), att(2, true), att(2, false), att(1, true), att(1, true), att(1, true), att(1, true)] }),
    b1: notDue(2, { attempts: [att(2, false), att(2, false), att(2, false), att(2, false)] }),
  });
  expect(likedSections(s, C)).toEqual(["u.t1/A", "u.t1/B"]);
  const r = pickClose(s, C, ctx(), cfg)!;
  expect(r.served).toMatchObject({ skill: "a1", height: 1, reason: "close:winnable", section: "u.t1/A" });
  // Highest expected success at the lowest height (a1 h1 ≈ 0.95 over b1 h1 0.85). F1 removed the unused 0.85 bar
  // (config session.winnable): it only decided whether a close card followed a right answer.
  expect(expectedSuccess(s, "a1", 1, cfg)).toBeGreaterThan(expectedSuccess(s, "b1", 1, cfg));
  // Never above current height.
  expect(pickClose(st({ a1: notDue(1) }), C, ctx(), cfg)!.served.height).toBe(1);
});

// ---------- clock and determinism ----------

test("clock backwards: picks made with effectiveNow never return a card seen 'in the future'", () => {
  const later = Date.UTC(2027, 2, 10, 9, 0);
  // F4: two days back (was three): further than clock.correctionDays back is now a clock correction, accepted.
  const naiveNow = later - 2 * DAY_MS; // device clock moved back two days
  const L = dayOf(later);
  const base = st({}, { lastNow: later, seen: seenAll(["a1.h1.1", "a1.h1.2"], L) });
  const day = dayOf(effectiveNow(base, naiveNow));
  expect(day).toBe(L);
  for (let seed = 1; seed <= 30; seed++) {
    const s = { ...base, rng: { seed, n: 0 } };
    const r = pickOpen(s, C, ctx({ day }), cfg)!;
    expect(r.served.card).toBe("a1.h1.3");
    // Even a naive (earlier) day treats a future-dated seen entry as recent.
    expect(eligibleCard(s, C, "a1", 1, dayOf(naiveNow), s.rng)!.card).toBe("a1.h1.3");
  }
});

test("deterministic: same state twice → same Served", () => {
  const s = st({ a1: notDue(2), b1: due(3, 2), b2: due(2, 1) }, { rng: { seed: 99, n: 4 } });
  const frozen = structuredClone(s);
  for (const f of [pickOpen, pickMiddle, pickClose]) {
    const x = f(s, C, ctx(), cfg); const y = f(structuredClone(s), C, ctx(), cfg);
    expect(x).not.toBeNull();
    expect(x).toEqual(y);
  }
  expect(s).toEqual(frozen); // inputs not mutated
});

// ---------- last-resort sweep ----------

test("pickAny: highest expectedSuccess over every height of every unblocked skill; started skills first", () => {
  // a1 started with every h1/h2 card seen: only its h3 is left. Task 11 R2: height 3 comes after every lower
  // height, so an unstarted ready skill's height-1 card wins (before Task 11 the started a1's h3 did).
  const seen = seenAll(["a1.h1.1", "a1.h1.2", "a1.h1.3", "a1.h2.1", "a1.h2.2", "a1.h2.3"], D - 1);
  const s = st({ a1: rec(1, { attempts: [att(1, false), att(1, false)] }) }, { seen });
  const p = pickAny(s, C, ctx({ strictBudget: true, remaining: 99 }), cfg, "comfort-correction")!;
  expect(p.served).toMatchObject({ skill: "a2", height: 1, reason: "comfort-correction" });
  // Only height 3 left anywhere → the started a1's height-3 card.
  const lowSeen = [...seen, ...["a2", "b1", "b2"].flatMap((x) => [1, 2, 3].flatMap((i) => [`${x}.h1.${i}`, `${x}.h2.${i}`])).map((card) => ({ card, variant: 0, day: D - 1 }))];
  const p3 = pickAny({ ...s, seen: lowSeen }, C, ctx({ strictBudget: true, remaining: 99 }), cfg, "comfort-correction")!;
  expect(p3.served).toMatchObject({ skill: "a1", height: 3 });
  // nothing of a1 left: an unstarted skill whose requires are met (a1 started → a2 is ready too), best estimate,
  // lower height on ties, then id → a1-free choice at height 1
  const all1 = [...seen, ...Array.from({ length: 20 }, (_, v) => ({ card: "a1.h3", variant: v, day: D - 1 }))];
  const q = pickAny(st({ a1: rec(1) }, { seen: all1 }), C, ctx({ strictBudget: true, remaining: 99 }), cfg, "close:winnable")!;
  expect(q.served).toMatchObject({ skill: "a2", height: 1, reason: "close:winnable" });
  // blocked sections never; the same-skill run only as a second pass
  const blocked = { "u.t1/A": { skipCount: 1, remindDay: D + 2, lastReason: null, dripStopped: false, liking: 0, returned: false, skipTotal: 1, lastSkipSeq: null, skippedLevel: null } };
  const r = pickAny(st({ a1: rec(1) }, { seen: all1, sections: blocked }), C, ctx({ strictBudget: true, remaining: 99 }), cfg, "comfort-correction")!;
  expect(r.served.section).toBe("u.t1/B");
  const only = fixture({ drop: ["a2", "b1", "b2"].flatMap((x) => [`${x}.h1.1`, `${x}.h1.2`, `${x}.h1.3`, `${x}.h2.1`, `${x}.h2.2`, `${x}.h2.3`, `${x}.h3`]) });
  const run3 = pickAny(st({ a1: rec(1) }), only, ctx({ lastSkills: ["a1", "a1", "a1"], strictBudget: true, remaining: 99 }), cfg, "comfort-correction");
  expect(run3!.served.skill).toBe("a1");
  // empty only when nothing is eligible
  const none = [...all1, ...["a2", "b1", "b2"].flatMap((x) => [`${x}.h1.1`, `${x}.h1.2`, `${x}.h1.3`, `${x}.h2.1`, `${x}.h2.2`, `${x}.h2.3`].map((card) => ({ card, variant: 0, day: D - 1 }))),
    ...["a2", "b1", "b2"].flatMap((x) => Array.from({ length: 20 }, (_, v) => ({ card: `${x}.h3`, variant: v, day: D - 1 })))];
  expect(pickAny(st({}, { seen: none }), C, ctx({ remaining: 99 }), cfg, "comfort-correction")).toBeNull();
});

// ---------- tuning pass (Task 11) ----------

test("close (R1): the lowest available height of a skill, highest expectedSuccess first; never h3 while h1/h2 is eligible", () => {
  // a1 at height 3 with ten right h3 answers (h3 ≈ 0.92): the close card is still its height-1 card.
  const tenH3 = Array.from({ length: 10 }, () => att(3, true));
  const b1Weak = [att(2, false), att(2, false), att(1, false), att(1, false)];
  const s = st({ a1: notDue(3, { attempts: tenH3 }), b1: notDue(2, { attempts: b1Weak }) });
  const r = pickClose(s, C, ctx(), cfg)!;
  expect(r.served).toMatchObject({ skill: "a1", height: 1, reason: "close:winnable" });
  // a1's h1 cards all seen → another skill's height-1 card (fix round 1, finding 2: height first across skills; it was
  // a1's h2); with every other h1 card out of reach, a1's next height (h2), never its h3.
  const h1Seen = { ...s, seen: seenAll(["a1.h1.1", "a1.h1.2", "a1.h1.3"], D - 1) };
  expect(pickClose(h1Seen, C, ctx(), cfg)!.served).toMatchObject({ skill: "a2", height: 1 });
  const noH1 = { ...s, seen: seenAll(["a1.h1.1", "a1.h1.2", "a1.h1.3", "a2.h1.1", "a2.h1.2", "a2.h1.3"], D - 1) };
  expect(pickClose(noH1, C, ctx({ blockedSections: ["u.t1/B"] }), cfg)!.served).toMatchObject({ skill: "a1", height: 2 });
  // Only h3 left on every started skill → an unstarted skill's height-1 card beats any height-3 card.
  const onlyH3 = st({ a1: notDue(3, { attempts: tenH3 }) }, {
    seen: seenAll(["a1.h1.1", "a1.h1.2", "a1.h1.3", "a1.h2.1", "a1.h2.2", "a1.h2.3"], D - 1),
  });
  const q = pickClose(onlyH3, C, ctx(), cfg)!;
  expect(q.served.height).toBe(1);
  expect(q.served.skill).not.toBe("a1");
  // Every other section blocked → the height-3 card is the last resort.
  const alone = pickClose(onlyH3, C, ctx({ blockedSections: ["u.t1/B"] }), cfg);
  const a2Seen = { ...onlyH3, seen: [...onlyH3.seen, ...seenAll(["a2.h1.1", "a2.h1.2", "a2.h1.3", "a2.h2.1", "a2.h2.2", "a2.h2.3"], D - 1)] };
  expect(alone!.served.height).toBe(1); // a2 (same section, ready) at height 1
  expect(pickClose(a2Seen, C, ctx({ blockedSections: ["u.t1/B"] }), cfg)!.served).toMatchObject({ skill: "a1", height: 3 });
});

test("comfort correction (R2): lower height first, then expectedSuccess; never height 3 while a lower card is eligible", () => {
  const four = (h: Height) => Array.from({ length: 4 }, () => att(h, true));
  // a1 at height 3: h3 (4+1)/6 ≈ 0.83, h2 0.9, h1 prior 0.85 all reach comfort → height 1 first.
  const s = st({ a1: notDue(3, { attempts: [...four(3), ...four(2)] }) });
  const r = pickMiddle(s, C, ctx({ runningRight: 1, runningTotal: 4, newSkillsThisSession: 2 }), cfg)!;
  expect(r.served).toMatchObject({ skill: "a1", height: 1, reason: "comfort-correction" });
  // Nothing due, no new skill allowed, running rate at comfort: the fallback still keeps height 3 last.
  // (Change 5: at comfort, not 4 of 4: well above it, an extra new skill would come first.)
  const r2 = pickMiddle(s, C, ctx({ runningRight: 3, runningTotal: 4, newSkillsThisSession: 2 }), cfg)!;
  expect(r2.served.reason).toBe("comfort-correction");
  expect(r2.served.height).toBeLessThan(3);
  // After two "I don't know" (fewer than three answers): the fallback goes lowest height first.
  const r3 = pickMiddle(s, C, ctx({ runningRight: 0, runningTotal: 2, newSkillsThisSession: 2 }), cfg)!;
  expect(r3.served).toMatchObject({ skill: "a1", height: 1, reason: "comfort-correction" });
});

test("pickAny (R2): below comfort → lowest height first, then expectedSuccess", () => {
  // a1 started: h2 0.9, h1 0.425. Below comfort the height-1 card with the best estimate wins (an unstarted, ready skill).
  const s = st({ a1: rec(2, { attempts: [...Array.from({ length: 4 }, () => att(2, true)), att(1, false), att(1, false)] }) });
  const easy = pickAny(s, C, ctx({ strictBudget: true, remaining: 99, runningRight: 0, runningTotal: 2 }), cfg, "comfort-correction")!;
  expect(easy.served.height).toBe(1);
  expect(expectedSuccess(s, easy.served.skill, 1, cfg)).toBeCloseTo(0.85, 10);
  // At comfort: started skills first, highest estimate → a1 height 2.
  const ok = pickAny(s, C, ctx({ strictBudget: true, remaining: 99, runningRight: 3, runningTotal: 3 }), cfg, "comfort-correction")!;
  expect(ok.served).toMatchObject({ skill: "a1", height: 2 });
});

test("change 4: open has no fresh mode: with fewer than estimate.minOwnPrior answers the skill's own height (the ladder sets the level in the first sessions)", () => {
  const good = Array.from({ length: 4 }, () => att(2, true)); // h2 0.9 ≥ comfort
  const s = st({ a1: notDue(2, { attempts: good }) }, { answered: cfg.estimate.minOwnPrior - 1 });
  expect(pickOpen(s, C, ctx(), cfg)!.served).toMatchObject({ skill: "a1", height: 2, reason: "open:liked" });
  expect(pickOpen({ ...s, answered: 0 }, C, ctx(), cfg)!.served).toMatchObject({ skill: "a1", height: 2 });
});

test("change 4: pickLadder replaces fresh mode: the level first across skills; another level only when nothing is eligible at it", () => {
  // a1 started (section A is the only liked one), its h1/h2 cards all seen: only a1.h3 is left in it. Ladder at 1:
  // another skill's level-1 card, not a1's level 3.
  const lowA1 = ["a1.h1.1", "a1.h1.2", "a1.h1.3", "a1.h2.1", "a1.h2.2", "a1.h2.3"];
  const s = st({ a1: notDue(2, { attempts: [att(2, true), att(2, true)] }) }, { answered: 2, seen: seenAll(lowA1, D - 1) });
  const r = pickLadder(s, C, ctx(), cfg)!;
  expect(r.served).toMatchObject({ height: 1, reason: "open:liked" });
  expect(r.served.skill).not.toBe("a1");
  // Also when the session's new-skill allowance is used up (nearly every first-session card is a new skill).
  expect(pickLadder(s, C, ctx({ newSkillsThisSession: 2 }), cfg)!.served.height).toBe(1);
  // Every height-1/2 card seen → height 3 (the nearest higher level with an eligible card).
  const allLow = ["a1", "a2", "b1", "b2"].flatMap((x) => [1, 2, 3].flatMap((i) => [`${x}.h1.${i}`, `${x}.h2.${i}`]));
  expect(pickLadder({ ...s, seen: seenAll(allLow, D - 1) }, C, ctx(), cfg)!.served.height).toBe(3);
});

test("close (finding 2): height first across skills — any eligible height-1 card before any height-2 card", () => {
  // a1 has no height-1 cards; started, h2 0.9. b1 is not started (ready): its h1 card comes first.
  const noA1h1 = fixture({ drop: ["a1.h1.1", "a1.h1.2", "a1.h1.3"] });
  const s = st({ a1: notDue(2, { attempts: Array.from({ length: 4 }, () => att(2, true)) }) },
    { seen: seenAll(["a2.h1.1", "a2.h1.2", "a2.h1.3"], D - 1) });
  const r = pickClose(s, noA1h1, ctx(), cfg)!;
  expect(r.served).toMatchObject({ height: 1, reason: "close:winnable" });
  expect(r.served.section).toBe("u.t1/B");
  // liked section first among height-1 cards: a2 (section A, liked) before B's skills
  const s2 = st({ a1: notDue(2, { attempts: Array.from({ length: 4 }, () => att(2, true)) }) });
  expect(pickClose(s2, noA1h1, ctx(), cfg)!.served).toMatchObject({ skill: "a2", height: 1 });
});

test("middle below comfort (finding 2): height first, even with fewer than three answers and a due height-3 skill", () => {
  const s = st({ a1: notDue(2), b2: due(3, 2) });
  // at comfort: the due skill at its height
  expect(pickMiddle(s, C, ctx({ runningRight: 2, runningTotal: 2 }), cfg)!.served).toMatchObject({ skill: "b2", height: 3, reason: "due-review" });
  const r = pickMiddle(s, C, ctx({ runningRight: 1, runningTotal: 2 }), cfg)!;
  expect(r.served).toMatchObject({ height: 1, reason: "comfort-correction" });
});

// ---------- final review F9: fallback:any ----------

test("F9: closeSweepReason: a height-1/2 sweep pick while closing is close:winnable; a height-3 one only when nothing lower is eligible", () => {
  const s = st({ a1: notDue(1) });
  expect(closeSweepReason(s, C, ctx(), cfg, 1)).toBe("close:winnable");
  expect(closeSweepReason(s, C, ctx(), cfg, 2)).toBe("close:winnable");
  // lower cards exist (even if only the session's recent cards or a run limit kept them out): not the easiest
  expect(closeSweepReason(s, C, ctx({ recentCards: Object.keys(C.cards).filter((id) => !id.endsWith(".h3")) }), cfg, 3)).toBe("fallback:any");
  // every height-1/2 card seen lately: the height-3 card is the easiest eligible
  const lowSeen = seenAll(Object.keys(C.cards).filter((id) => !id.endsWith(".h3")), D);
  expect(closeSweepReason(st({ a1: notDue(1) }, { seen: lowSeen }), C, ctx(), cfg, 3)).toBe("close:winnable");
});

// ---------- change 5: stretch cards when a student is well above target ----------

const rights = (h: Height, n: number) => Array.from({ length: n }, () => att(h, true));
/**
 * Every started skill with its own evidence (fix round 1): a1 record 2, 7 right at h2 ((7 + 1.4) / 9 ≈ 0.93); b1 record
 * 1, 2 right at h1 ((2 + 1.7) / 4 ≈ 0.93, below a1); b2 record 2 and due, 2 right at h2 ((2 + 1.4) / 4 = 0.85); a2 not
 * started.
 */
const stretchState = (over: Record<string, Partial<SkillRec>> = {}) => st({
  a1: notDue(2, { attempts: rights(2, 7), ...over.a1 }),
  b1: notDue(1, { attempts: rights(1, 2), ...over.b1 }), b2: due(2, 1, { attempts: rights(2, 2), ...over.b2 }),
});
const above = (p: Partial<PickCtx> = {}) => ctx({ runningRight: 5, runningTotal: 5, newSkillsThisSession: 2, ...p });

test("4 of 4 right, comfort 0.75 → next middle card is stretch:up one level above the skill's level", () => {
  // Fix round 1: estimate.minRunning is 5, so "4 of 4" is now 5 of 5 (`above()`).
  expect(cfg.comfort.pushUpBand).toBe(0.1);
  expect(cfg.estimate.minRunning).toBe(5);
  const s = stretchState();
  expect(s.profile.comfort).toBe(0.75);
  // Before the usual order (b2 is due): the started skill with the highest estimate at its own level, one level up.
  const r = pickMiddle(s, C, above(), cfg)!;
  expect(r.served).toMatchObject({ skill: "a1", height: 3, reason: "stretch:up", effort: cfg.effort.h3 });
  expect(r.extraNew).toBeUndefined();
  // a1 may not have a level-3 card today (back from a skip) → b1 (h1 0.93 beats b2's h2 0.85) at level 2.
  const noFull = stretchState({ a1: { noFullUntilDay: D + 1 } });
  expect(pickMiddle(noFull, C, above(), cfg)!.served).toMatchObject({ skill: "b1", height: 2, reason: "stretch:up" });
  // noFullUntilDay today or earlier does not forbid it.
  expect(pickMiddle(stretchState({ a1: { noFullUntilDay: D } }), C, above(), cfg)!.served).toMatchObject({ skill: "a1", height: 3 });
  // Every standing rule applies: excluded / left skills, the budget, the recent cards, a blocked section, 14 days.
  expect(pickMiddle(s, C, above({ excludeSkills: ["a1"] }), cfg)!.served).toMatchObject({ skill: "b1", height: 2, reason: "stretch:up" });
  expect(pickMiddle(s, C, above({ leftSkills: ["a1"] }), cfg)!.served).toMatchObject({ skill: "b1", height: 2 });
  expect(pickMiddle(s, C, above({ remaining: 3, strictBudget: true }), cfg)!.served).toMatchObject({ skill: "b1", height: 2, reason: "stretch:up" });
  expect(pickMiddle(s, C, above({ recentCards: ["a1.h3"] }), cfg)!.served).toMatchObject({ skill: "b1", height: 2 });
  expect(pickMiddle(s, C, above({ blockedSections: ["u.t1/A"] }), cfg)!.served).toMatchObject({ skill: "b1", height: 2 });
  const a1h3Seen = { ...s, seen: Array.from({ length: 20 }, (_, v) => ({ card: "a1.h3", variant: v, day: D - 1 })) };
  expect(pickMiddle(a1h3Seen, C, above(), cfg)!.served).toMatchObject({ skill: "b1", height: 2 });
  // Exactly one level above the record: a record-1 skill whose level-2 cards are gone does not jump to 3.
  const noB1h2 = fixture({ drop: ["b1.h2.1", "b1.h2.2", "b1.h2.3"] });
  expect(pickMiddle(s, noB1h2, above({ excludeSkills: ["a1"] }), cfg)!.served).toMatchObject({ skill: "b2", height: 3, reason: "stretch:up" });
  // Weight breaks a tie in the estimate, then id: b1 / b2 both at record 1 with the same history.
  const tie = st({ b1: notDue(1, { attempts: rights(1, 2) }), b2: notDue(1, { attempts: rights(1, 2) }) });
  expect(pickMiddle(tie, C, above(), cfg)!.served).toMatchObject({ skill: "b2", height: 2 }); // b2 weight 0.4 > b1 0.2
  const c2 = structuredClone(C); c2.skills["b1"].weight = 0.4;
  expect(pickMiddle(tie, c2, above(), cfg)!.served).toMatchObject({ skill: "b1", height: 2 });
  // Deterministic, inputs untouched.
  const before = JSON.stringify(s);
  expect(pickMiddle(s, C, above(), cfg)).toEqual(r);
  expect(JSON.stringify(s)).toBe(before);
});

test("3 of 4 right (0.75 < 0.85) → no stretch", () => {
  const s = stretchState();
  expect(pickMiddle(s, C, above({ runningRight: 3, runningTotal: 4 }), cfg)!.served).toMatchObject({ skill: "b2", height: 2, reason: "due-review" });
  // At comfort + band exactly (e.g. a higher comfort lowers nothing): 0.85 needs 0.85 of the answers.
  const hi = { ...s, profile: { ...s.profile, comfort: 0.8 } };
  expect(pickMiddle(hi, C, above({ runningRight: 8, runningTotal: 9 }), cfg)!.served.reason).toBe("due-review"); // 0.889 < 0.9
  expect(pickMiddle(hi, C, above({ runningRight: 9, runningTotal: 10 }), cfg)!.served.reason).toBe("stretch:up"); // 0.9
  // 6 of 8 (0.75) with enough answers: still no stretch. 17 of 20 = 0.85 at comfort 0.75 is enough.
  expect(pickMiddle(s, C, above({ runningRight: 6, runningTotal: 8 }), cfg)!.served.reason).toBe("due-review");
  expect(pickMiddle(s, C, above({ runningRight: 17, runningTotal: 20 }), cfg)!.served.reason).toBe("stretch:up");
});

test("fewer than estimate.minRunning (5) answers → no stretch", () => {
  const s = stretchState();
  for (const n of [0, 2, 3, 4]) {
    expect(pickMiddle(s, C, above({ runningRight: n, runningTotal: n }), cfg)!.served).toMatchObject({ skill: "b2", reason: "due-review" });
  }
  expect(pickMiddle(s, C, above({ runningRight: 5, runningTotal: 5 }), cfg)!.served).toMatchObject({ skill: "a1", reason: "stretch:up" });
  // The session's off switch (open cards, the card after a miss or a stretch card, the ladder) wins.
  expect(pickMiddle(s, C, above({ stretchOff: true }), cfg)!.served).toMatchObject({ skill: "b2", reason: "due-review" });
});

test("no skill can go up → one extra new skill beyond maxNewSkills", () => {
  // a1 at the top (3), nothing else started: no stretch card. The new-skill allowance is used up.
  const s = st({ a1: notDue(3, { attempts: [att(3, true), att(3, true)] }) });
  const r = pickMiddle(s, C, above(), cfg)!;
  expect(r.served).toMatchObject({ skill: "b2", reason: "new:exam-weight" }); // highest weight, ready
  expect(r.extraNew).toBe(true);
  // Current topic → new:class-topic.
  const t = pickMiddle({ ...s, currentTopic: { id: "u.t2", source: "class" } }, twoTopics(), above(), cfg)!;
  expect(t.served).toMatchObject({ skill: "a2", reason: "new:class-topic" });
  // One extra per session: once used, the usual order (no new skill).
  const used = pickMiddle(s, C, above({ extraNewUsed: true }), cfg)!;
  expect(used.served).toMatchObject({ skill: "a1", reason: "comfort-correction" });
  expect(used.extraNew).toBeUndefined();
  // Not above comfort + band → no extra new skill.
  expect(pickMiddle(s, C, above({ runningRight: 4, runningTotal: 5 }), cfg)!.served.reason).toBe("comfort-correction");
  // While the allowance is not used up, the usual order serves new skills (not flagged as the extra).
  const usual = pickMiddle(s, C, above({ newSkillsThisSession: 1 }), cfg)!;
  expect(usual.served.reason).toBe("new:exam-weight");
  expect(usual.extraNew).toBeUndefined();
  // A stretch candidate wins over the extra new skill.
  const two = st({ a1: notDue(3), b1: notDue(1, { attempts: rights(1, 2) }) });
  expect(pickMiddle(two, C, above(), cfg)!.served).toMatchObject({ skill: "b1", height: 2, reason: "stretch:up" });
});

test("change 5 fix: a stretch skill needs its own evidence: estimate at its level ≥ comfort and its most recent attempt there right", () => {
  // Only b1 started (record 1); the session is well above comfort; the extra new skill is used, so no stretch → usual order.
  const only = (attempts: Attempt[], extra: Partial<SkillRec> = {}) => st({ b1: notDue(1, { attempts, ...extra }) });
  const pick = (s: State) => pickMiddle(s, C, above({ extraNewUsed: true }), cfg)!.served;
  const F = (h: Height) => att(h, false);
  const R = (h: Height) => att(h, true);
  // right → candidate (one attempt is enough; estimate (1 + 1.7) / 3 = 0.9)
  expect(pick(only([R(1)]))).toMatchObject({ skill: "b1", height: 2, reason: "stretch:up" });
  // wrong then right → candidate (estimate of right, right, wrong, right: 4.7 / 6 ≈ 0.78)
  expect(pick(only([R(1), R(1), F(1), R(1)]))).toMatchObject({ skill: "b1", height: 2, reason: "stretch:up" });
  // right then wrong / wrong as the most recent → not (right ×3, wrong: estimate 0.78, so only the last answer decides)
  expect(pick(only([R(1), F(1)])).reason).not.toBe("stretch:up");
  expect(pick(only([R(1), R(1), R(1), F(1)])).reason).not.toBe("stretch:up");
  // no attempt at the current level → not; attempts at another level do not count
  expect(pick(only([])).reason).not.toBe("stretch:up");
  expect(pick(only([R(2), R(2)])).reason).not.toBe("stretch:up");
  expect(pick(only([R(1), R(1), R(1), F(1), R(2), R(2)])).reason).not.toBe("stretch:up");
  // attempts before the step window do not count (the step-up rule's window)
  const before = [R(1), R(1)];
  expect(pick(only(before, { windowStartSeq: before[1].seq + 1 })).reason).not.toBe("stretch:up");
  // most recent right but the estimate at its level below comfort: (2 + 1.7) / 7 ≈ 0.53 < 0.75 → not
  const weak = only([F(1), F(1), F(1), R(1), R(1)]);
  expect(expectedSuccess(weak, "b1", 1, cfg)).toBeLessThan(weak.profile.comfort);
  expect(pick(weak).reason).not.toBe("stretch:up");
  // In the full state with a1 and b1 excluded: b2 (estimate (4 + 1.4) / 7 ≈ 0.77, most recent wrong) is not stretched
  // although the session rate is high: the usual order serves it as due.
  const s = stretchState({ b2: { attempts: [...rights(2, 4), F(2)] } });
  expect(pickMiddle(s, C, above({ excludeSkills: ["a1", "b1"], extraNewUsed: true }), cfg)!.served.reason).toBe("due-review");
});

// ---------- change 7a: closers that can be won ----------

/** Only a1 (height 1, three cards) and b1 (height 1 and 2) have cards; a2 and b2 none. */
const ONLY = fixture({ drop: [
  ...["a2", "b2"].flatMap((x) => [1, 2, 3].flatMap((i) => [`${x}.h1.${i}`, `${x}.h2.${i}`]).concat(`${x}.h3`)),
  "a1.h2.1", "a1.h2.2", "a1.h2.3", "a1.h3", "b1.h3",
] });
const A = "u.t1/A";
const B = "u.t1/B";
const seenAt = (card: string, day: number, right?: boolean): Seen => ({ card, variant: 0, day, ...(right !== undefined ? { right } : {}) });

test("change 7: closing card may be a card answered right 3 days ago; not one answered right 2 days ago; not one answered wrong", () => {
  const base = (seen: Seen[]) => st({ a1: notDue(1) }, { seen });
  const close = (s: State) => pickClose(s, ONLY, ctx({ blockedSections: [B] }), cfg, { repeatRight: true });
  const s3 = base([seenAt("a1.h1.1", D - 3, true), seenAt("a1.h1.2", D - 2, true), seenAt("a1.h1.3", D - 5, false)]);
  expect(close(s3)!.served).toMatchObject({ card: "a1.h1.1", reason: "close:winnable", height: 1 });
  // without the option (every other picker): nothing
  expect(pickClose(s3, ONLY, ctx({ blockedSections: [B] }), cfg)).toBeNull();
  expect(pickOpen(s3, ONLY, ctx({ blockedSections: [B] }), cfg)).toBeNull();
  expect(pickMiddle(s3, ONLY, ctx({ blockedSections: [B] }), cfg)).toBeNull();
  expect(eligibleCard(s3, ONLY, "a1", 1, D, s3.rng, {}, cfg)).toBeNull();
  expect(eligibleCard(s3, ONLY, "a1", 1, D, s3.rng, { repeatRightAfterDays: 3 }, cfg)).toMatchObject({ card: "a1.h1.1", repeat: true });
  // right 2 days ago only: not yet
  expect(close(base([seenAt("a1.h1.1", D - 2, true), seenAt("a1.h1.2", D - 2, true), seenAt("a1.h1.3", D - 5, false)]))).toBeNull();
  // the most recent entry counts: right 6 days ago, then wrong 4 days ago → not
  expect(close(base([seenAt("a1.h1.1", D - 6, true), seenAt("a1.h1.1", D - 4, false), seenAt("a1.h1.2", D - 1), seenAt("a1.h1.3", D - 1)]))).toBeNull();
  // Seen without `right` (served, not answered; or skipped) is not right
  expect(close(base([seenAt("a1.h1.1", D - 5), seenAt("a1.h1.2", D - 5), seenAt("a1.h1.3", D - 5)]))).toBeNull();
  // never a card among the session's recent cards
  expect(pickClose(s3, ONLY, ctx({ blockedSections: [B], recentCards: ["a1.h1.1"] }), cfg, { repeatRight: true })).toBeNull();
  // the sweep in the closing order gets it only with the option
  expect(pickAny(s3, ONLY, ctx({ blockedSections: [B] }), cfg, "close:winnable")).toBeNull();
  expect(pickAny(s3, ONLY, ctx({ blockedSections: [B] }), cfg, "close:winnable", { repeatRight: true })!.served.card).toBe("a1.h1.1");
});

test("change 7: a repeat closer ranks after an unseen card of the same level and before any higher level", () => {
  const sections = { [A]: { ...newSection(), liking: 5 } }; // a1's section is liked: it would come first
  const a1Seen = [seenAt("a1.h1.1", D - 3, true), seenAt("a1.h1.2", D - 1, false), seenAt("a1.h1.3", D - 1, false)];
  const s = st({ a1: notDue(1), b1: notDue(1) }, { sections, seen: a1Seen });
  // b1 has an unseen height-1 card: it beats a1's repeat
  expect(pickClose(s, ONLY, ctx(), cfg, { repeatRight: true })!.served).toMatchObject({ skill: "b1", height: 1 });
  // b1's height-1 cards seen (wrong): a1's height-1 repeat beats b1's unseen height-2 card
  const b1Seen = ["b1.h1.1", "b1.h1.2", "b1.h1.3"].map((c) => seenAt(c, D - 1, false));
  const s2 = { ...s, seen: [...a1Seen, ...b1Seen] };
  expect(pickClose(s2, ONLY, ctx(), cfg, { repeatRight: true })!.served).toMatchObject({ card: "a1.h1.1", height: 1 });
  // without the option: b1 at height 2
  expect(pickClose(s2, ONLY, ctx(), cfg)!.served).toMatchObject({ skill: "b1", height: 2 });
});

test("fix round 1 (change 7): a repeat closer counts at its level in the closing sweep and its reason", () => {
  const keep = new Set(["a1.h1.1", "a1.h1.2", "a1.h1.3", "a1.h3"]);
  const one3 = fixture({ drop: Object.keys(C.cards).filter((id) => !keep.has(id)) });
  const s = st({ a1: notDue(1) }, { seen: [seenAt("a1.h1.1", D - 3, true), seenAt("a1.h1.2", D - 1, false), seenAt("a1.h1.3", D - 1, false)] });
  // plain sweep: the unseen full problem; with repeats: the level-1 repeat comes first (before any higher level)
  expect(pickAny(s, one3, ctx(), cfg, "close:winnable")!.served.height).toBe(3);
  expect(pickAny(s, one3, ctx(), cfg, "close:winnable", { repeatRight: true })!.served).toMatchObject({ card: "a1.h1.1", height: 1 });
  // a level-3 sweep pick is close:winnable only when nothing lower is eligible, the repeat counted as a level-1 card
  expect(closeSweepReason(s, one3, ctx(), cfg, 3)).toBe("close:winnable");
  expect(closeSweepReason(s, one3, ctx(), cfg, 3, { repeatRight: true })).toBe("fallback:any");
  expect(closeSweepReason(s, one3, ctx(), cfg, 1, { repeatRight: true })).toBe("close:winnable");
});

test("rule 1: a skill whose most recent attempt at its level is a fast right answer is not a stretch candidate", () => {
  const fastLast = (): Attempt[] => [...rights(2, 6), { ...att(2, true), fast: true }];
  const s = stretchState({ a1: { attempts: fastLast() } });
  expect(pickMiddle(s, C, above(), cfg)!.served).not.toMatchObject({ skill: "a1", reason: "stretch:up" });
  // the same history with a normal last answer is a stretch candidate
  expect(pickMiddle(stretchState(), C, above(), cfg)!.served).toMatchObject({ skill: "a1", height: 3, reason: "stretch:up" });
});
