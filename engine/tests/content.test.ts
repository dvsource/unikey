import { test, expect } from "vitest";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { loadFromRepo } from "../src/node/load.js";
import { buildContent, type RawPack } from "../src/content.js";
import { defaultConfig } from "../src/config.js";
import { fixture } from "./fixture.js";

const real = loadFromRepo(join(import.meta.dirname, "..", ".."));

test("real packs index", () => {
  expect(Object.keys(real.skills).length).toBe(175);
  expect(Object.values(real.skills).filter(s => [1, 2, 3].some(h => s.cards[h as 1].length)).length).toBe(56);
  // F8: 240 (was 241): phy.therm.c043 ("the same copper bar") depends on another card and is excluded (spec §11).
  expect(Object.keys(real.cards).length).toBe(240);
  expect(real.cards["phy.therm.c043"]).toBeUndefined();
  expect(Object.values(real.skills).some((s) => [1, 2, 3].some((h) => s.cards[h as 1].includes("phy.therm.c043")))).toBe(false);
});
test("height mapping", () => {
  expect(real.cards["phy.mech.c001"].height).toBe(1);                        // L1
  for (const c of Object.values(real.cards)) expect([1, 2, 3]).toContain(c.height);
  expect(Object.values(real.cards).filter(c => c.height === 3).length).toBe(33);   // 11+10+12 L4 items
});
test("note refs come through", () => {
  expect(Object.values(real.cards).some(c => c.noteRef?.startsWith("phy.mech.note."))).toBe(true);
});
test("fixture shape", () => {
  const f = fixture();
  expect(f.sections["u.t1/A"].skills).toEqual(["a1", "a2"]);
  expect(f.sections["u.t1/B"].weight).toBeCloseTo(0.6);
  expect(f.skills.a2.requires).toEqual(["a1"]);
  expect(f.cards["a1.h3"].variants.length).toBe(20);
  expect(f.cards["a1.h3"].variants[0][1].tag).toBe("sign-error");
});

// ---------- final review F7, F8 ----------

const tiny = (id: string, graph = true): RawPack => ({
  id, unit: { id: `u.${id}` },
  graph: graph ? { skills: [{ id: `${id}.s1`, topic: `${id}.t`, subtopic: "A", weight: 1, name: { en: "s1" } }], edges: [] } : null,
  items: [
    { id: `${id}.c1`, layer: "L1", form: "F00", skills: [`${id}.s1`], variants: [{ options: [{ correct: true }, { correct: false }] }] },
    { id: `${id}.c2`, layer: "L2", form: "F00", skills: [`${id}.s1`], variants: [{ options: [{ correct: true }, { correct: false }] }] },
  ],
});

test("F7: buildContent throws on a pack with no skill graph", () => {
  expect(() => buildContent([tiny("p1"), tiny("p2", false)])).toThrow("pack p2 has no skill graph");
  expect(Object.keys(buildContent([tiny("p1")]).cards)).toEqual(["p1.c1", "p1.c2"]);
});

test("F8: config content.exclude; buildContent leaves excluded cards out (default: the config list)", () => {
  expect(defaultConfig.content).toEqual({ exclude: ["phy.therm.c043"] });
  const c = buildContent([tiny("p1")], {}, ["p1.c2"]);
  expect(Object.keys(c.cards)).toEqual(["p1.c1"]);
  expect(c.skills["p1.s1"].cards[2]).toEqual([]);
});

/** A repo folder with app/content-packs.json, the built packs and their source items.json files. */
function repo(entries: string[], packs: RawPack[]): string {
  const root = mkdtempSync(join(tmpdir(), "unikey-load-"));
  const write = (p: string, x: unknown) => { mkdirSync(dirname(join(root, p)), { recursive: true }); writeFileSync(join(root, p), JSON.stringify(x)); };
  write("app/content-packs.json", { packs: entries.map((id) => ({ id, dir: `content/samples/${id}` })) });
  for (const id of entries) write(`content/samples/${id}/items.json`, { cards: [] });
  for (const p of packs) write(`app/assets/content/packs/${p.id}.json`, p);
  return root;
}

test("F7: loadFromRepo fails loudly: unknown pack id, a built pack with no graph, zero cards", () => {
  expect(Object.keys(loadFromRepo(repo(["p1"], [tiny("p1")])).cards)).toEqual(["p1.c1", "p1.c2"]);
  expect(() => loadFromRepo(repo(["p1"], [tiny("p1")]), ["p1", "nope"])).toThrow(/pack nope is not in app\/content-packs\.json/);
  expect(() => loadFromRepo(repo(["p1", "p2"], [tiny("p1"), tiny("p2", false)]))).toThrow("pack p2 has no skill graph");
  const empty = { ...tiny("p1"), items: [] };
  expect(() => loadFromRepo(repo(["p1"], [empty]))).toThrow(/no cards loaded \(packs: p1\)/);
});
