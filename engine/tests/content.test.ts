import { test, expect } from "vitest";
import { join } from "node:path";
import { loadFromRepo } from "../src/node/load.js";
import { fixture } from "./fixture.js";

const real = loadFromRepo(join(import.meta.dirname, "..", ".."));

test("real packs index", () => {
  expect(Object.keys(real.skills).length).toBe(175);
  expect(Object.values(real.skills).filter(s => [1, 2, 3].some(h => s.cards[h as 1].length)).length).toBe(56);
  expect(Object.keys(real.cards).length).toBe(241);
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
