import { test, expect } from "vitest";
import { defaultConfig as cfg, type Config } from "../src/config.js";
import { newState, effectiveNow } from "../src/state.js";
import { newSkillRec } from "../src/skill.js";
import { dayOf, DAY_MS } from "../src/time.js";
import { expectedSuccess, usualMs } from "../src/estimate.js";
import { eligibleCard, likedSections, pickOpen, pickMiddle, pickClose, type PickCtx } from "../src/pick.js";
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
  expect(cfg.estimate).toEqual({ priorWeight: 2, minOwnPrior: 10, minMsSamples: 5, minRunning: 3, comfortLowMark: 0.8 });
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
  s.sections = { "u.t1/A": { skipCount: 0, remindDay: null, lastReason: null, dripStopped: false, liking: 2, returned: false } };
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
  expect(r.served).toMatchObject({ skill: "a1", height: 2, reason: "comfort-correction" });
  expect(expectedSuccess(s, r.served.skill, r.served.height, cfg)).toBeGreaterThanOrEqual(s.profile.comfort);
  // Nothing reaches comfort → b1 dropped to h1 (0.85) once a1 is unavailable.
  const r2 = pickMiddle(s, C, ctx({ runningRight: 1, runningTotal: 4, blockedSections: ["u.t1/A"] }), cfg)!;
  expect(r2.served).toMatchObject({ skill: "b1", height: 1, reason: "comfort-correction" });
  const hard = { ...s, profile: { ...s.profile, comfort: 0.95 } };
  expect(pickMiddle(hard, C, ctx({ runningRight: 1, runningTotal: 4 }), cfg)).toBeNull();
});

test("middle: blocked section never returned", () => {
  const skills = { a1: notDue(2), b1: due(2, 3), b2: due(3, 3) };
  const skipped = st(skills, { sections: { "u.t1/B": { skipCount: 1, remindDay: D + 3, lastReason: "later", dripStopped: false, liking: 0, returned: false } } });
  for (let seed = 1; seed <= 10; seed++) {
    const r = pickMiddle({ ...skipped, rng: { seed, n: 0 } }, C, ctx(), cfg)!;
    expect(r.served.section).toBe("u.t1/A");
  }
  // On the remind day itself the section is back.
  expect(pickMiddle(skipped, C, ctx({ day: D + 3 }), cfg)!.served.section).toBe("u.t1/B");
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
    sections: { "u.t1/A": { skipCount: 0, remindDay: null, lastReason: null, dripStopped: false, liking: 0, returned: true } },
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
  s.sections = { "u.t1/A": { skipCount: 0, remindDay: null, lastReason: null, dripStopped: false, liking: 1, returned: false } };
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
  expect(expectedSuccess(s, "a1", 1, cfg)).toBeGreaterThanOrEqual(cfg.session.winnable);
  // Nothing reaches a 0.99 bar → highest expected success available (a1 h1 ≈ 0.95 over b1 h1 0.85).
  const strict: Config = { ...cfg, session: { ...cfg.session, winnable: 0.99 } };
  const r2 = pickClose(s, C, ctx(), strict)!;
  expect(r2.served).toMatchObject({ skill: "a1", height: 1, reason: "close:winnable" });
  // Never above current height.
  expect(pickClose(st({ a1: notDue(1) }), C, ctx(), cfg)!.served.height).toBe(1);
});

// ---------- clock and determinism ----------

test("clock backwards: picks made with effectiveNow never return a card seen 'in the future'", () => {
  const later = Date.UTC(2027, 2, 10, 9, 0);
  const naiveNow = later - 3 * DAY_MS; // device clock moved back three days
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
