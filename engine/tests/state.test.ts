import { test, expect } from "vitest";
import { newState, migrate, effectiveNow, knownSkills } from "../src/state.js";
import { newSkillRec } from "../src/skill.js";
import { defaultConfig } from "../src/config.js";
import { DAY_MS } from "../src/time.js";
import { fixture } from "./fixture.js";
import type { State } from "../src/types.js";

test("newState defaults", () => {
  const s = newState("s1", 42);
  expect(s.profile).toMatchObject({ comfort: 0.75, memory: 1, h3Share: 0.4, stamina: 13.34 });
  expect(s).toMatchObject({ v: 1, seq: 0, lastNow: 0, rng: { seed: 42, n: 0 }, currentTopic: null, day: null, session: null });
  expect(s.ladder).toEqual({ level: 1, rightRun: 0 }); // change 4
  expect(JSON.parse(JSON.stringify(s))).toEqual(s);
});
test("migrate rejects unknown version", () => expect(() => migrate({ v: 9 })).toThrow("unsupported state version"));
test("effectiveNow never goes back by up to clock.correctionDays; further back is a clock correction (F4)", () => {
  const s = { ...newState("s", 1), lastNow: 5000 };
  expect(effectiveNow(s, 1000)).toBe(5000);
  expect(effectiveNow(s, 9000)).toBe(9000);
  const late = { ...newState("s", 1), lastNow: 100 * DAY_MS };
  const lim = defaultConfig.clock.correctionDays * DAY_MS;
  expect(effectiveNow(late, 100 * DAY_MS - lim)).toBe(100 * DAY_MS); // exactly the limit: still never back
  expect(effectiveNow(late, 100 * DAY_MS - lim - 1)).toBe(100 * DAY_MS - lim - 1); // beyond it: the new time
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

test("migrate gives an open session from before Task 11 badDay, slowBefore and servedCards", () => {
  const s = newState("s", 1);
  const ss = { phase: "middle", fadeEffort: 3, sideDoor: null, confident: [] } as unknown as NonNullable<typeof s.session>;
  const m = migrate(JSON.parse(JSON.stringify({ ...s, session: ss })));
  expect(m.session).toMatchObject({ badDay: true, slowBefore: [], servedCards: [] }); // an old fadeEffort meant bad day
  const m2 = migrate(JSON.parse(JSON.stringify({ ...s, session: { ...ss, fadeEffort: null } })));
  expect(m2.session).toMatchObject({ badDay: false, slowBefore: [], servedCards: [] });
});

test("change 3/7: migrate defaults lastSession, a stored lastEnd's recap / fixedSkills and the open session's new fields", () => {
  const { lastSession: _l, ...old } = newState("s", 1);
  const m = migrate(JSON.parse(JSON.stringify({ ...old, lastEnd: { kind: "budget", effort: 8, cards: 5, right: 4, fixed: 0, streakKept: true } })));
  expect(m.lastSession).toBeNull();
  expect(m.lastEnd).toEqual({ kind: "budget", effort: 8, cards: 5, right: 4, fixed: 0, streakKept: true, recap: false, fixedSkills: [], rightSkills: [] }); // F3: rightSkills defaulted
  expect(newState("s", 1).lastSession).toBeNull();
  const ss = { phase: "middle", fadeEffort: null } as unknown as NonNullable<State["session"]>;
  const ms = migrate(JSON.parse(JSON.stringify({ ...newState("s", 1), session: ss })));
  expect(ms.session).toMatchObject({ missRun: 0, lowStart: false, fixedSkills: [], extendEffortLeft: 0 });
  const kept = migrate({ ...newState("s", 1), lastSession: { cards: 4, right: 1 } });
  expect(kept.lastSession).toEqual({ cards: 4, right: 1 });
});

test("final review F3: migrate defaults a stored lastEnd's rightSkills to []; a stored list is kept", () => {
  const end = { kind: "budget", effort: 8, cards: 5, right: 4, fixed: 0, streakKept: true, recap: false, fixedSkills: [] };
  expect(migrate(JSON.parse(JSON.stringify({ ...newState("s", 1), lastEnd: end }))).lastEnd!.rightSkills).toEqual([]);
  const kept = migrate(JSON.parse(JSON.stringify({ ...newState("s", 1), lastEnd: { ...end, rightSkills: ["a1"] } })));
  expect(kept.lastEnd!.rightSkills).toEqual(["a1"]);
});
