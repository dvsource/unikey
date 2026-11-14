export const defaultConfig = {
  effort: { h1: 1, h2: 1.5, h3: 4, wrong: 1, dontKnow: 0 },
  budget: { staminaDefault: 13.34, margin: 0.1, minimumDay: 8, dailyCap: 40, comeback: 8, extendCards: 5 },
  reviewGapsDays: [1, 3, 7, 14, 30],
  memory: { default: 1, min: 0.5, max: 2, up: 1.05, down: 0.85 },
  skipRemindDays: [3, 5, 8, 13, 14],
  comfort: { default: 0.75, min: 0.65, max: 0.85, upOnQuit: 0.03, downOnStreak: 0.01, streakSessions: 3, quitMargin: 0.05 },
  noRepeatDays: 14,
  stepUp: { rightInRow: 2, minCardsApart: 5 },
  stepDown: { wrongs: 2, window: 4 },
  badDay: { moments: 3, withinCards: 8, slowFactor: 2, slowRun: 3 },
  session: { openCards: 2, maxSameSkillRun: 3, maxNewSkills: 2, returnAfterCards: 4, winnable: 0.85, dripEverySessions: 2, maxMoments: 2 },
  priors: { h1: 0.85, h2: 0.7, h3: 0.5 },
  calc: { h3ShareDefault: 0.4, h3ShareCalcWeak: 0.5, h3ShareConceptWeak: 0.2, gapBaseline: 0.2, band: 0.15, minWeakerShare: 0.2, minH3: 6, minH12: 10 },
  window: { cards: 60, sessions: 7 },
  moments: { thenNowMinDays: 5, avoidedMinSkips: 2, avoidedRight: 4, avoidedOf: 5 },
  returning: { noFullDays: 2, awayDays: 3 },
  skill: { attemptsKept: 12, solidDays: 2 },
  estimate: { priorWeight: 2, minOwnPrior: 10, minMsSamples: 5, minRunning: 3, comfortLowMark: 0.8 },
  /** Stamina (spec §7): blend toward the effort at which the student faded; steps after a clean end / extended session. */
  staminaUpdate: { keep: 0.7, take: 0.3, cleanStep: 0.5, extendStep: 1 },
  /** Section liking: steps for a fast right / slow answer / extend card, the slow factor over usual ms, and the ± clamp. */
  liking: { fastStep: 0.5, slowStep: 0.5, slowFactor: 1.5, extendStep: 2, clamp: 5 },
  tzOffsetMinutes: 330,
  sessionEnd: { maxExtraClose: 2 },
  answers: { msKept: 20 },
  /**
   * Skip (spec §6): drip only after this many answered cards; liking lost per skip; skills named in the value
   * message; class timing brings a not-learned section back no sooner than this many days after the skip.
   */
  skip: { dripAfterCards: 3, likingPenalty: 1, valueTopSkills: 3, classReturnMinDays: 2 },
};

export type Config = typeof defaultConfig;
