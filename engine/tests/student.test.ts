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

test("pRight: k 0.5 at h2 → 0.5; k 1 at h1 → 0.97; k 0 at h3 → 0.2", () => {
  const h = newHidden(byId("average-noclass"), content, 1);
  expect(pRight(withK(h, "a1", 0.5), served("a1.h2.1"), 0)).toBeCloseTo(0.5);
  expect(pRight(withK(h, "a1", 1), served("a1.h1.1"), 0)).toBe(0.97);
  expect(pRight(withK(h, "a1", 0), served("a1.h3"), 0)).toBe(0.2);
  expect(pRight(withK(h, "a1", 0.5), served("a1.h2.1"), 15)).toBeCloseTo(0.5 - 0.3);
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
  expect(r.k["a1"]!).toBeCloseTo(0.4 + 0.04 * 0.6);
  expect(w.k["a1"]!).toBeCloseTo(0.4 + 0.08 * 0.6);
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
  expect(r).toEqual({ kind: "skip", reason: "too-hard" });
  expect(decide(withK(fh, "b2", 0), content, served("b2.h1.1"), S, 0).action).toEqual({ kind: "skip", reason: "not-learned" });
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
