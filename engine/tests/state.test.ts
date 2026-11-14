import { test, expect } from "vitest";
import { newState, migrate, effectiveNow, knownSkills } from "../src/state.js";
import { newSkillRec } from "../src/skill.js";
import { fixture } from "./fixture.js";

test("newState defaults", () => {
  const s = newState("s1", 42);
  expect(s.profile).toMatchObject({ comfort: 0.75, memory: 1, h3Share: 0.4, stamina: 13.34 });
  expect(s).toMatchObject({ v: 1, seq: 0, lastNow: 0, rng: { seed: 42, n: 0 }, currentTopic: null, day: null, session: null });
  expect(JSON.parse(JSON.stringify(s))).toEqual(s);
});
test("migrate rejects unknown version", () => expect(() => migrate({ v: 9 })).toThrow("unsupported state version"));
test("effectiveNow never goes back", () => {
  const s = { ...newState("s", 1), lastNow: 5000 };
  expect(effectiveNow(s, 1000)).toBe(5000);
  expect(effectiveNow(s, 9000)).toBe(9000);
});
test("unknown skill in state is tolerated", () => {
  const s = newState("s", 1);
  s.skills["a1"] = newSkillRec(2);
  s.skills["ghost.skill"] = newSkillRec(2);
  expect(knownSkills(s, fixture())).toEqual(["a1"]);
});
test("migrate defaults answered and lastEnd on an older stored v1 state", () => {
  const { answered: _a, lastEnd: _l, ...old } = newState("s", 1);
  const m = migrate(JSON.parse(JSON.stringify(old)));
  expect(m.answered).toBe(0);
  expect(m.lastEnd).toBeNull();
  const kept = migrate({ ...newState("s", 1), answered: 7 });
  expect(kept.answered).toBe(7);
});
