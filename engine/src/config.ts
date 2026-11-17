export const defaultConfig = {
  effort: { h1: 1, h2: 1.5, h3: 4, wrong: 1, dontKnow: 0 },
  /**
   * `lowRight` / `lowRightMinCards` (change 3): after a session of at least this many cards with at most `lowRight` right,
   * the next session is a minimum day opening on easy cards.
   */
  budget: {
    staminaDefault: 13.34, margin: 0.1, minimumDay: 8, dailyCap: 40, comeback: 8, extendCards: 5, firstSessions: 3,
    lowRight: 2, lowRightMinCards: 3,
  },
  /** Fade (R4b): this many slow answers in a session (not necessarily in a row) record a fade at the first one. */
  fade: { slowAnswers: 2 },
  reviewGapsDays: [1, 3, 7, 14, 30],
  memory: { default: 1, min: 0.5, max: 2, up: 1.05, down: 0.85 },
  skipRemindDays: [3, 5, 8, 13, 14],
  /** `pushUpBand` (change 5): a session running this far above comfort gets stretch cards (see `estimate.minRunning`). */
  comfort: { default: 0.75, min: 0.65, max: 0.85, upOnQuit: 0.03, downOnStreak: 0.01, streakSessions: 3, quitMargin: 0.05, pushUpBand: 0.1 },
  noRepeatDays: 14,
  stepUp: { rightInRow: 2, minCardsApart: 5 },
  stepDown: { wrongs: 2, window: 4 },
  /** `missRun` (change 3): this many misses in a row across the session's answered cards are one bad moment. */
  badDay: { moments: 2, withinCards: 8, slowFactor: 2, slowRun: 3, missRun: 3 },
  session: { openCards: 2, maxSameSkillRun: 3, maxNewSkills: 2, returnAfterCards: 4, dripEverySessions: 2, maxMoments: 2 },
  priors: { h1: 0.85, h2: 0.7, h3: 0.5 },
  calc: { h3ShareDefault: 0.4, h3ShareCalcWeak: 0.5, h3ShareConceptWeak: 0.2, gapBaseline: 0.2, band: 0.15, minWeakerShare: 0.2, minH3: 6, minH12: 10 },
  window: { cards: 60 },
  moments: { thenNowMinDays: 5, avoidedMinSkips: 2, avoidedRight: 4, avoidedOf: 5 },
  returning: { noFullDays: 2, awayDays: 3 },
  skill: { attemptsKept: 12, solidDays: 2 },
  /** `minRunning` (change 5): the session's answers needed before its running rate can call for a stretch card. */
  estimate: { priorWeight: 2, minOwnPrior: 10, minMsSamples: 5, comfortLowMark: 0.8, minRunning: 5 },
  /** Stamina (spec §7): blend toward the effort at which the student faded; the step after an extended session. */
  staminaUpdate: { keep: 0.7, take: 0.3, extendStep: 1 },
  /** Section liking: steps for a fast right / slow answer / extend card, the slow factor over usual ms, and the ± clamp. */
  liking: { fastStep: 0.5, slowStep: 0.5, slowFactor: 1.5, extendStep: 2, clamp: 5 },
  tzOffsetMinutes: 330,
  /** F4: a call whose time is more than this many days behind the last one is a clock correction (accepted as the new time). */
  clock: { correctionDays: 2 },
  /** Change 7: one closing card at most; a missed one ends the session on a recap. */
  sessionEnd: { maxExtraClose: 2 },
  /** Cards left out of the content (spec §11): `phy.therm.c043` ("the same copper bar") depends on another card. */
  content: { exclude: ["phy.therm.c043"] as string[] },
  answers: { msKept: 20 },
  /**
   * Skip (spec §6): drip only after this many answered cards; liking lost per skip; skills named in the value
   * message; class timing brings a not-learned section back no sooner than this many days after the skip.
   * `tooHardRestDays` (change 6): a card skipped as "too hard" at its skill's lowest level puts the skill off this long.
   */
  skip: { dripAfterCards: 3, likingPenalty: 1, valueTopSkills: 3, classReturnMinDays: 2, tooHardRestDays: 3 },
  /** Closing (spec §2): a card answered right this many days ago or more may be served again as the close:winnable card. */
  closing: { repeatRightAfterDays: 3 },
  /**
   * First-session ladder (change 4): this many right ladder answers in a row raise the level by one (max 3); at most
   * this many level-3 ladder cards per session (after that, level 3 is served as level 2 for the rest of the session).
   */
  ladder: { upAfterRight: 2, maxFullPerSession: 1 },
};

export type Config = typeof defaultConfig;
