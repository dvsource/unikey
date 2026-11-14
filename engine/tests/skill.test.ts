import { test, expect } from "vitest";
import { defaultConfig as cfg } from "../src/config.js";
import { recordAttempt, isSolid, isDue, startHeight, newSkillRec } from "../src/skill.js";
import type { Attempt, Height, SkillRec } from "../src/types.js";
import { fixture } from "./fixture.js";

const def = fixture().skills["a1"];
const att = (day: number, seq: number, height: Height, right: boolean): Attempt => ({ day, seq, height, right, ms: 1000, card: "c" });
function run(rec: SkillRec, as: Attempt[], d = def, mem = 1) {
  let r = rec; let up = false; let down = false;
  for (const a of as) { const o = recordAttempt(r, d, a, mem, cfg); r = o.rec; up = o.steppedUp; down = o.steppedDown; }
  return { rec: r, up, down };
}

test("two right, same day, 5 apart → up", () => {
  const o = run(newSkillRec(2), [att(1, 1, 2, true), att(1, 6, 2, true)]);
  expect(o.rec.height).toBe(3); expect(o.up).toBe(true);
});
test("two right, same day, 2 apart → no step", () => {
  const o = run(newSkillRec(2), [att(1, 1, 2, true), att(1, 3, 2, true)]);
  expect(o.rec.height).toBe(2); expect(o.up).toBe(false);
});
test("two right on different days → up", () => {
  const o = run(newSkillRec(2), [att(1, 1, 2, true), att(2, 2, 2, true)]);
  expect(o.rec.height).toBe(3); expect(o.up).toBe(true);
});
test("2 wrong in last 4 at height → down, window restarts", () => {
  const o = run(newSkillRec(3), [att(1, 1, 3, true), att(1, 2, 3, false), att(1, 3, 3, false)]);
  expect(o.rec.height).toBe(2); expect(o.down).toBe(true);
  const o2 = run(o.rec, [att(1, 4, 2, false)]);
  expect(o2.rec.height).toBe(2); expect(o2.down).toBe(false);
  const o3 = run(o2.rec, [att(1, 5, 2, false)]);
  expect(o3.rec.height).toBe(1); expect(o3.down).toBe(true);
});
test("no height-3 cards → never steps to 3", () => {
  const d = fixture({ drop: ["a1.h3"] }).skills["a1"];
  const o = run(newSkillRec(2), [att(1, 1, 2, true), att(2, 2, 2, true), att(3, 3, 2, true)], d);
  expect(o.rec.height).toBe(2);
});
test("gaps 1,3,7,14,30 then stay 30; ×memory 0.5 → 1,2,4,7,15; wrong resets to 1", () => {
  const gaps = (mem: number) => {
    let r = newSkillRec(2); const out: number[] = [];
    for (let i = 0; i < 6; i++) { r = recordAttempt(r, def, att(100, 100 + i, 2, true), mem, cfg).rec; out.push(r.nextReviewDay! - 100); r = { ...r, height: 2 }; }
    return out;
  };
  expect(gaps(1)).toEqual([1, 3, 7, 14, 30, 30]);
  expect(gaps(0.5)).toEqual([1, 2, 4, 7, 15, 15]);
  let r = newSkillRec(2);
  r = recordAttempt(r, def, att(10, 1, 2, true), 1, cfg).rec;
  r = recordAttempt(r, def, att(11, 2, 2, false), 1, cfg).rec;
  expect(r.gapIndex).toBe(0); expect(r.nextReviewDay).toBe(12);
  expect(r.firstFailedDay).toBe(11); expect(r.firstFailedHeight).toBe(2);
  const below = recordAttempt({ ...newSkillRec(3) }, def, att(10, 3, 1, true), 1, cfg).rec;
  expect(below.gapIndex).toBe(0); expect(below.nextReviewDay).toBeNull();
  expect(isDue(r, 11)).toBe(false); expect(isDue(r, 12)).toBe(true); expect(isDue(newSkillRec(2), 99)).toBe(false);
});
test("blocked from height 3 before noFullUntilDay", () => {
  const rec = { ...newSkillRec(2), noFullUntilDay: 5 };
  const blocked = run(rec, [att(1, 1, 2, true), att(2, 2, 2, true)]);
  expect(blocked.rec.height).toBe(2); expect(blocked.up).toBe(false);
  const ok = run(rec, [att(4, 1, 2, true), att(5, 2, 2, true)]);
  expect(ok.rec.height).toBe(3);
});
test("solid after top-height right on two days; skill topping at 2 is solid at 2; topping at 1 never", () => {
  let r = newSkillRec(3);
  r = recordAttempt(r, def, att(1, 1, 3, true), 1, cfg).rec;
  expect(isSolid(r, def)).toBe(false);
  r = recordAttempt(r, def, att(1, 2, 3, true), 1, cfg).rec;
  expect(r.solidDays).toEqual([1]);
  r = recordAttempt(r, def, att(2, 3, 3, true), 1, cfg).rec;
  expect(isSolid(r, def)).toBe(true);
  const d2 = fixture({ drop: ["a1.h3"] }).skills["a1"];
  let r2 = newSkillRec(2);
  r2 = recordAttempt(r2, d2, att(1, 1, 2, true), 1, cfg).rec;
  r2 = recordAttempt(r2, d2, att(2, 2, 2, true), 1, cfg).rec;
  expect(isSolid(r2, d2)).toBe(true);
  const d1 = fixture({ drop: ["a1.h3", "a1.h2.1", "a1.h2.2", "a1.h2.3"] }).skills["a1"];
  let r1 = newSkillRec(1);
  r1 = recordAttempt(r1, d1, att(1, 1, 1, true), 1, cfg).rec;
  r1 = recordAttempt(r1, d1, att(2, 2, 1, true), 1, cfg).rec;
  expect(r1.solidDays).toEqual([1, 2]); expect(isSolid(r1, d1)).toBe(false);
});
test("keeps last 12 attempts and does not mutate input", () => {
  const rec = newSkillRec(2); const snap = JSON.stringify(rec);
  const o = run(rec, Array.from({ length: 15 }, (_, i) => att(i, i, 2, false)));
  expect(o.rec.attempts.length).toBe(12);
  expect(JSON.stringify(rec)).toBe(snap);
});
test("startHeight: default 2; comfortLow → 1; returning → 1; missing height → nearest available", () => {
  expect(startHeight(def, false, false)).toBe(2);
  expect(startHeight(def, true, false)).toBe(1);
  expect(startHeight(def, false, true)).toBe(1);
  const no2 = fixture({ drop: ["a1.h2.1", "a1.h2.2", "a1.h2.3"] }).skills["a1"];
  expect(startHeight(no2, false, false)).toBe(1);
  const no1 = fixture({ drop: ["a1.h1.1", "a1.h1.2", "a1.h1.3"] }).skills["a1"];
  expect(startHeight(no1, true, false)).toBe(2);
});
