import { test, expect } from "vitest";
import { fixture } from "./fixture.js";
import { personas } from "../sim/personas.js";
import { newHidden, decide, learn, decay, pRight, playsToday, sessionEnded, resolvePersona, meanKnowledge, type Hidden, type PersonaSpec } from "../sim/student.js";
import type { Served } from "../src/index.js";

const content = fixture();
const byId = (id: string): PersonaSpec => personas.find((p) => p.id === id)!;
const served = (card: string, o: Partial<Served> = {}): Served => {
  const c = content.cards[card]!;
  return { card, variant: 0, skill: c.skill, section: c.section, height: c.height, reason: "due-review", effort: 1, ...o };
};
const withK = (h: Hidden, skill: string, k: number): Hidden => ({ ...h, k: { ...h.k, [skill]: k } });
const S = { effort: 0, recentWrong: 0 };

test("16 personas, unique ids, each sheet has no digits", () => {
  expect(personas).toHaveLength(16);
  expect(new Set(personas.map((p) => p.id)).size).toBe(16);
  for (const p of personas) { expect(p.sheet).not.toMatch(/\d/); expect(p.sheet.split(/(?<=[.!?])\s+/).length).toBeGreaterThanOrEqual(3); }
});

test("auto personas resolve against content", () => {
  const f = resolvePersona(byId("one-feared-section"), content);
  expect(f.traits.fearedSections).toEqual(["u.t1/B"]);
  expect(f.traits.priorBySection).toEqual({ "u.t1/B": 0.1 });
  const m = resolvePersona(byId("confident-misconceptions"), content);
  expect(m.traits.misconceptions).toEqual({ "sign-error": 0.8 });
  const h = newHidden(byId("one-feared-section"), content, 1);
  expect(h.k["b1"]).toBe(0.1);
  expect(h.k["a1"]).toBe(0.5);
  expect(Object.keys(h.k).sort()).toEqual(["a1", "a2", "b1", "b2"]);
  expect(h.lastDay["a1"]).toBeUndefined();
  expect(meanKnowledge(h, content)).toBeCloseTo((0.1 + 0.1 + 0.5 + 0.5) / 4);
});

test("pRight: k 0.5 at h2 → 0.575; k 1 at h1 → 0.97; k 0 at h3 → 0.2", () => {
  // Task 11 R7: need at h2 is 0.45 (was 0.5), so k 0.5 gives 0.5 + 1.5 × 0.05.
  const h = newHidden(byId("average-noclass"), content, 1);
  expect(pRight(withK(h, "a1", 0.5), served("a1.h2.1"), 0)).toBeCloseTo(0.575);
  expect(pRight(withK(h, "a1", 1), served("a1.h1.1"), 0)).toBe(0.97);
  expect(pRight(withK(h, "a1", 0), served("a1.h3"), 0)).toBe(0.2);
  expect(pRight(withK(h, "a1", 0.15), served("a1.h1.1"), 0)).toBeCloseTo(0.575); // R7: need at h1 0.1
  expect(pRight(withK(h, "a1", 0.5), served("a1.h2.1"), 15)).toBeCloseTo(0.575 - 0.3);
});

test("misconception: strength 1, k 0 → always picks the tagged wrong option", () => {
  let h = newHidden(byId("confident-misconceptions"), content, 3);
  h = withK({ ...h, traits: { ...h.traits, misconceptions: { "sign-error": 1 } } }, "a1", 0);
  const card = served("a1.h3", { variant: 2 });
  for (let i = 0; i < 30; i++) {
    const r = decide(h, content, card, S, 0);
    h = r.hidden;
    expect(r.action.kind).toBe("answer");
    if (r.action.kind === "answer") expect(r.action.choice).toBe(1);
  }
});

test("learning raises k more after a wrong answer than a right one; decay lowers it, floor at half start", () => {
  const h = newHidden(byId("average-noclass"), content, 1);
  const card = served("a1.h1.1");
  const r = learn(h, card, true, 0), w = learn(h, card, false, 0);
  expect(r.k["a1"]!).toBeCloseTo(0.4 + 0.06 * 0.6); // Task 11 R7: learnRight 0.06 (was 0.04)
  expect(w.k["a1"]!).toBeCloseTo(0.4 + 0.10 * 0.6); // learnWrong 0.10 (was 0.08)
  expect(w.k["a1"]!).toBeGreaterThan(r.k["a1"]!);
  expect(w.lastDay["a1"]).toBe(0);
  expect(learn(h, card, false, 0, "sign-error").traits.misconceptions).toEqual({});
  let d = w;
  const before = d.k["a1"]!;
  d = decay(d, 1);
  expect(d.k["a1"]!).toBeLessThan(before);
  expect(d.k["b1"]).toBe(0.4); // never seen: no decay
  for (let i = 0; i < 2000; i++) d = decay(d, i);
  expect(d.k["a1"]!).toBeCloseTo(0.2);
});

test("quit when recentWrong ≥ patienceWrongs; app quit after patienceSessions quits in a row", () => {
  let h = newHidden(byId("average-noclass"), content, 1);
  const card = served("a1.h1.1");
  expect(decide(h, content, card, { effort: 0, recentWrong: 3 }, 0).action.kind).not.toBe("quit");
  expect(decide(h, content, card, { effort: 0, recentWrong: 4 }, 0).action.kind).toBe("quit");
  expect(decide(h, content, card, { effort: 14 * 1.3 + 0.1, recentWrong: 0 }, 0).action.kind).toBe("quit");
  h = sessionEnded(h, true); h = sessionEnded(h, true);
  expect(h.quitApp).toBe(false);
  expect(sessionEnded(sessionEnded(h, false), true).badSessions).toBe(1);
  h = sessionEnded(h, true);
  expect(h.badSessions).toBe(3);
  expect(h.quitApp).toBe(true);
  expect(playsToday(h, 0, 5)).toBe(0);
  const f = newHidden(byId("steady-five-min"), content, 1);
  expect(decide(f, content, card, { effort: 12, recentWrong: 0 }, 0).action.kind).toBe("quit");
  let g = f;
  for (let i = 0; i < 10; i++) g = sessionEnded(g, true);
  expect(g.badSessions).toBe(0);
  expect(g.quitApp).toBe(false);
});

test("never skips a repair or close card", () => {
  let h = newHidden(byId("underconfident-skipper"), content, 5);
  h = withK(h, "b1", 0);
  const kinds = new Set<string>();
  for (const reason of ["repair:missing-piece", "repair:confidence", "repair:return", "close:winnable"] as const)
    for (let i = 0; i < 40; i++) {
      const r = decide(h, content, served("b1.h3", { reason }), S, 0);
      h = r.hidden; kinds.add(r.action.kind);
    }
  expect(kinds.has("skip")).toBe(false);
  // control: the same student does skip an ordinary card, and a feared section always
  let skips = 0;
  for (let i = 0; i < 40; i++) { const r = decide(h, content, served("b1.h3"), S, 0); h = r.hidden; if (r.action.kind === "skip") skips++; }
  expect(skips).toBeGreaterThan(0);
  const f = resolvePersona(byId("one-feared-section"), content);
  const fh = newHidden(f, content, 1);
  const r = decide(withK(fh, "b2", 0.3), content, served("b2.h1.1"), S, 0).action;
  // T114 (spec §4 item 6): the student path gives no reason: every skip is "later"
  expect(r).toEqual({ kind: "skip" });
  expect(decide(withK(fh, "b2", 0), content, served("b2.h1.1"), S, 0).action).toEqual({ kind: "skip" });
});

test("habits: gap10 plays 0 on days 9–18; binge-vanish 2/day on days 0–5", () => {
  const g = newHidden(byId("comeback-10"), content, 1);
  for (let d = 0; d < 30; d++) expect(playsToday(g, 0, d)).toBe(d >= 9 && d <= 18 ? 0 : 1);
  const b = newHidden(byId("binge-quit"), content, 1);
  for (let d = 0; d <= 5; d++) expect(playsToday(b, 0, d)).toBe(2);
  for (let d = 6; d < 20; d++) expect(playsToday(b, 0, d)).toBe(0);
  expect(playsToday(b, 0, 20)).toBe(1);
  const a = newHidden(byId("smart-impatient"), content, 1);
  expect([0, 1, 2, 3].map((d) => playsToday(a, 0, d))).toEqual([1, 0, 1, 0]);
  expect(playsToday(newHidden(byId("average-noclass"), content, 1), 3, 4)).toBe(1);
});

test("same seed → same decisions", () => {
  const run = (seed: number) => {
    let h = newHidden(byId("average-noclass"), content, seed);
    const out: unknown[] = [];
    for (const id of ["a1.h1.1", "a1.h2.1", "a2.h3", "b1.h1.2", "b2.h3"]) {
      const r = decide(h, content, served(id), S, 0);
      h = r.hidden; out.push(r.action);
    }
    return out;
  };
  expect(run(7)).toEqual(run(7));
  expect(JSON.stringify(run(7))).not.toBe(JSON.stringify(run(8)));
});

import { simParams, wantsExtend } from "../sim/student.js";

test("quit boundaries and reasons", () => {
  const card = served("a1.h1.1");
  const a = newHidden(byId("average-noclass"), content, 1);
  expect(decide(a, content, card, { effort: 15, recentWrong: 0 }, 0).action.kind).not.toBe("quit");
  expect(decide(a, content, card, { effort: 14 * 1.3 - 0.01, recentWrong: 0 }, 0).action.kind).not.toBe("quit");
  expect(decide(a, content, card, { effort: 14 * 1.3 + 0.01, recentWrong: 0 }, 0).action).toEqual({ kind: "quit", reason: "fatigue" });
  expect(decide(a, content, card, { effort: 0, recentWrong: 4 }, 0).action).toEqual({ kind: "quit", reason: "frustration" });
  const f = newHidden(byId("steady-five-min"), content, 1);
  expect(decide(f, content, card, { effort: 11, recentWrong: 0 }, 0).action.kind).not.toBe("quit");
  expect(decide(f, content, card, { effort: 12, recentWrong: 0 }, 0).action).toEqual({ kind: "quit", reason: "time-up" });
});

test("five-min: frustration quits count toward app quit, time-up does not", () => {
  let f = newHidden(byId("steady-five-min"), content, 1); // patienceSessions 4
  for (let i = 0; i < 10; i++) f = sessionEnded(f, true, "time-up");
  expect(f.badSessions).toBe(0);
  for (let i = 0; i < 3; i++) f = sessionEnded(f, true, "frustration");
  expect(f.quitApp).toBe(false);
  f = sessionEnded(f, true, "fatigue");
  expect(f.quitApp).toBe(true);
  const a = sessionEnded(newHidden(byId("average-noclass"), content, 1), true, "time-up");
  expect(a.badSessions).toBe(0);
});

test("dont-know below dontKnowBelow unless guesser", () => {
  const h = withK(newHidden(byId("average-noclass"), content, 1), "a1", 0); // p 0.2 < 0.3
  const r = decide({ ...h, traits: { ...h.traits, skipBelow: 0 } }, content, served("a1.h3"), S, 0).action;
  expect(r.kind === "answer" && r.choice).toBe("dont-know");
  const g = withK(newHidden(byId("fast-guesser"), content, 1), "a1", 0);
  let gh = { ...g, traits: { ...g.traits, skipBelow: 0, dontKnowBelow: 0.9 } };
  for (let i = 0; i < 50; i++) {
    const x = decide(gh, content, served("a1.h3"), S, 0); gh = x.hidden;
    expect(x.action.kind === "answer" && x.action.choice).not.toBe("dont-know");
  }
});

test("ms: height factors, guesser, fatigue, jitter", () => {
  const base = newHidden(byId("average-noclass"), content, 4);
  const h = { ...base, traits: { ...base.traits, dontKnowBelow: 0, skipBelow: 0 } };
  const msFor = (hh: Hidden, id: string, effort = 0) => {
    let x = hh; const out: number[] = [];
    for (let i = 0; i < 60; i++) { const r = decide(x, content, served(id), { effort, recentWrong: 0 }, 0); x = r.hidden; if (r.action.kind === "answer") out.push(r.action.ms); }
    return out;
  };
  // Task 11 fix round 1: a distracted answer (distractChance) takes distractFactor × the normal time.
  const inBand = (m: number, f: number) => m >= 9000 * f * 0.8 - 1 && m <= 9000 * f * 1.2 + 1;
  const within = (v: number[], f: number) => {
    for (const m of v) expect(inBand(m, f) || inBand(m, f * simParams.distractFactor), `${m} for factor ${f}`).toBe(true);
    expect(v.filter((m) => inBand(m, f)).length).toBeGreaterThan(v.length * 0.8);
    expect(new Set(v).size).toBeGreaterThan(5);
  };
  within(msFor(h, "a1.h1.1"), 1);
  within(msFor(h, "a1.h2.1"), 1.5);
  within(msFor(h, "a1.h3"), 4);
  within(msFor(h, "a1.h1.1", 15), 2.2);
  const g = { ...h, traits: { ...h.traits, guesser: true } };
  within(msFor(g, "a1.h1.1"), 0.4);
});

test("right/wrong frequency follows pRight", () => {
  const base = withK(newHidden(byId("average-noclass"), content, 11), "a1", 0.5);
  let h: Hidden = { ...base, traits: { ...base.traits, dontKnowBelow: 0, skipBelow: 0, misconceptions: {} } };
  const card = served("a1.h2.1"); // p = 0.575
  let right = 0; const N = 2000;
  for (let i = 0; i < N; i++) {
    const r = decide(h, content, card, S, 0); h = r.hidden;
    if (r.action.kind === "answer" && r.action.choice === 0) right++;
  }
  expect(Math.abs(right / N - pRight(h, card, 0))).toBeLessThan(0.04);
  const c2 = served("a1.h3"); // p = 0.5 + 1.5*(0.5-0.75) = 0.125 -> 0.2
  right = 0;
  for (let i = 0; i < N; i++) { const r = decide(h, content, c2, S, 0); h = r.hidden; if (r.action.kind === "answer" && r.action.choice === 0) right++; }
  expect(Math.abs(right / N - 0.2)).toBeLessThan(0.04);
});

test("misconception (1 - k) factor", () => {
  const base = withK(newHidden(byId("confident-misconceptions"), content, 5), "a1", 0.5);
  let h: Hidden = { ...base, traits: { ...base.traits, misconceptions: { "sign-error": 1 }, skipBelow: 0 } };
  const card = served("a1.h3", { variant: 0 }); // option 1 is sign-error; p(right)=0.2 so the rest is mostly wrong
  let picked = 0; const N = 2000;
  for (let i = 0; i < N; i++) { const r = decide(h, content, card, S, 0); h = r.hidden; if (r.action.kind === "answer" && r.action.choice === 1) picked++; }
  // 0.5 direct + remaining 0.5 * (0.2 right -> 0 | 0.8 wrong -> 1/3 to option 1)
  const expected = 0.5 + 0.5 * 0.8 / 3;
  expect(Math.abs(picked / N - expected)).toBeLessThan(0.04);
});

test("wantsExtend follows extendChance; never when fatigued", () => {
  let h = newHidden(byId("strong"), content, 9); // 0.7
  let yes = 0; const N = 2000;
  for (let i = 0; i < N; i++) { const [w, n] = wantsExtend(h); h = n; if (w) yes++; }
  expect(Math.abs(yes / N - 0.7)).toBeLessThan(0.04);
  for (let i = 0; i < 100; i++) expect(wantsExtend(h, 26)[0]).toBe(false);
  expect(wantsExtend(h, 26)[1]).toBe(h);
});

test("small fixes: hasOwn lookups, no wrong options, learn sets k0, params", () => {
  const h = newHidden(byId("average-noclass"), content, 1);
  expect(learn(h, served("a1.h1.1"), false, 0, "constructor").traits.misconceptions).toEqual({});
  const noK = { ...h, k: {}, k0: {} };
  const l = learn(noK, served("a1.h1.1"), true, 0);
  expect(l.k0["a1"]).toBe(0);
  const orig = content.cards["a1.h1.1"]!.variants[0]!;
  content.cards["a1.h1.1"]!.variants[0] = [{ correct: true }];
  const r = decide({ ...h, traits: { ...h.traits, skipBelow: 0, dontKnowBelow: 0 } }, content, served("a1.h1.1"), S, 0).action;
  content.cards["a1.h1.1"]!.variants[0] = orig;
  expect(r.kind === "answer" && r.choice).toBe(0);
  expect(simParams.decayCurve).toBe(0.5);
  expect(simParams.fearedK).toBe(0.6);
  // Task 11 R7 recalibration
  expect(simParams.need).toEqual({ 1: 0.1, 2: 0.45, 3: 0.75 });
  expect([simParams.learnRight, simParams.learnWrong, simParams.decayPerDay]).toEqual([0.06, 0.10, 0.003]);
});

test("distraction: with distractChance an answer takes distractFactor × its time, independent of fatigue; seeded", () => {
  expect([simParams.distractChance, simParams.distractFactor]).toEqual([0.05, 3]);
  const base = newHidden(byId("average-noclass"), content, 21);
  let h: Hidden = { ...base, traits: { ...base.traits, dontKnowBelow: 0, skipBelow: 0, misconceptions: {} } };
  const card = served("a1.h1.1"); // msHeight 1, baseMs 9000: normal time 7200..10800
  let long = 0; const N = 4000; const maxNormal = 9000 * (simParams.msJitterBase + simParams.msJitterSpan);
  for (let i = 0; i < N; i++) {
    const r = decide(h, content, card, S, 0); h = r.hidden;
    if (r.action.kind === "answer" && r.action.ms > maxNormal) {
      long++;
      expect(r.action.ms).toBeGreaterThanOrEqual(Math.round(9000 * simParams.msJitterBase * simParams.distractFactor) - 1);
    }
  }
  expect(Math.abs(long / N - simParams.distractChance)).toBeLessThan(0.015);
  const again = (seed: number) => { let x: Hidden = { ...h, rng: { seed, n: 0 } }; const out: number[] = [];
    for (let i = 0; i < 50; i++) { const r = decide(x, content, card, S, 0); x = r.hidden; if (r.action.kind === "answer") out.push(r.action.ms); } return out; };
  expect(again(3)).toEqual(again(3));
});

test("wantsExtend: a student who would be past stamina within five more cards' effort declines, with no draw", () => {
  const h = newHidden(byId("strong"), content, 9); // stamina 25
  expect(simParams.extendFeel).toBe(5);
  expect(wantsExtend(h, 25 - simParams.extendFeel + 0.5)).toEqual([false, h]);
  let yes = 0; let x = h;
  for (let i = 0; i < 400; i++) { const [w, n] = wantsExtend(x, 25 - simParams.extendFeel); x = n; if (w) yes++; }
  expect(yes).toBeGreaterThan(200); // extendChance 0.7 still applies below the line
});
