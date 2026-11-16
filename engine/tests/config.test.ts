import { expect, test } from "vitest";
import { defaultConfig as c, dayOf, next } from "../src/index.js";
test("spec numbers", () => {
  expect(c.effort).toEqual({ h1: 1, h2: 1.5, h3: 4, wrong: 1, dontKnow: 0 });
  expect(c.budget).toEqual({ staminaDefault: 13.34, margin: 0.1, minimumDay: 8, dailyCap: 40, comeback: 8, extendCards: 5, firstSessions: 3 });
  expect(c.fade).toEqual({ slowAnswers: 2 });
  expect(c.reviewGapsDays).toEqual([1, 3, 7, 14, 30]);
  expect(c.memory).toEqual({ default: 1, min: 0.5, max: 2, up: 1.05, down: 0.85 });
  expect(c.skipRemindDays).toEqual([3, 5, 8, 13, 14]);
  expect(c.comfort).toEqual({ default: 0.75, min: 0.65, max: 0.85, upOnQuit: 0.03, downOnStreak: 0.01, streakSessions: 3, quitMargin: 0.05, pushUpBand: 0.1 });
  expect(c.noRepeatDays).toBe(14);
  expect(c.stepUp).toEqual({ rightInRow: 2, minCardsApart: 5 });
  expect(c.stepDown).toEqual({ wrongs: 2, window: 4 });
  expect(c.badDay).toEqual({ moments: 3, withinCards: 8, slowFactor: 2, slowRun: 3 });
  expect(c.session).toEqual({ openCards: 2, maxSameSkillRun: 3, maxNewSkills: 2, returnAfterCards: 4, dripEverySessions: 2, maxMoments: 2 });
  expect(c.priors).toEqual({ h1: 0.85, h2: 0.7, h3: 0.5 });
  expect(c.calc).toEqual({ h3ShareDefault: 0.4, h3ShareCalcWeak: 0.5, h3ShareConceptWeak: 0.2, gapBaseline: 0.2, band: 0.15, minWeakerShare: 0.2, minH3: 6, minH12: 10 });
  expect(c.window).toEqual({ cards: 60 }); // F9: window.sessions was never read
  expect(c.moments).toEqual({ thenNowMinDays: 5, avoidedMinSkips: 2, avoidedRight: 4, avoidedOf: 5 });
  expect(c.returning).toEqual({ noFullDays: 2, awayDays: 3 });
  expect(c.skill).toEqual({ attemptsKept: 12, solidDays: 2 });
  expect(c.estimate).toEqual({ priorWeight: 2, minOwnPrior: 10, minMsSamples: 5, comfortLowMark: 0.8, minRunning: 5 });
  expect(c.staminaUpdate).toEqual({ keep: 0.7, take: 0.3, extendStep: 1 }); // F9: cleanStep (0, a no-op) removed
  expect(c.liking).toEqual({ fastStep: 0.5, slowStep: 0.5, slowFactor: 1.5, extendStep: 2, clamp: 5 });
  expect(c.tzOffsetMinutes).toBe(330);
  expect(c.clock).toEqual({ correctionDays: 2 });
  expect(c.sessionEnd).toEqual({ maxExtraClose: 2 });
  expect(c.content).toEqual({ exclude: ["phy.therm.c043"] });
  expect(c.answers).toEqual({ msKept: 20 });
  expect(c.skip).toEqual({ dripAfterCards: 3, likingPenalty: 1, valueTopSkills: 3, classReturnMinDays: 2 });
  expect(c.closing).toEqual({ repeatRightAfterDays: 3 });
});
test("dayOf uses Sri Lanka time", () => {
  expect(dayOf(Date.UTC(2027, 0, 15, 18, 29))).toBe(dayOf(Date.UTC(2027, 0, 15, 0, 0)));
  expect(dayOf(Date.UTC(2027, 0, 15, 18, 30))).toBe(dayOf(Date.UTC(2027, 0, 15, 0, 0)) + 1);
});
test("rng is repeatable", () => {
  const [a, r1] = next({ seed: 7, n: 0 }); const [b] = next({ seed: 7, n: 0 });
  expect(a).toBe(b); expect(r1).toEqual({ seed: 7, n: 1 }); expect(a).toBeGreaterThanOrEqual(0); expect(a).toBeLessThan(1);
});
test("change 4: the ladder steps up after this many right answers in a row", () => {
  expect(c.ladder).toEqual({ upAfterRight: 2, maxFullPerSession: 1 });
});
