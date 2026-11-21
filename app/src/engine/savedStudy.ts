import { migrate, type EngineEvent, type State } from "../../../engine/src/index";

export type SavedStudy = { state: State; events: EngineEvent[]; legacyEvents: number };

function record(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null && !Array.isArray(x);
}

// Only check persisted fields the app or engine consumes. Extra fields survive.
type Check = (value: unknown) => boolean;
const string: Check = x => typeof x === "string";
const bool: Check = x => typeof x === "boolean";
const number: Check = Number.isFinite;
const height: Check = x => x === 1 || x === 2 || x === 3;
const nullable = (check: Check): Check => x => x === null || check(x);
const array = (check: Check): Check => x => Array.isArray(x) && x.every(check);
const dictionary = (check: Check): Check => x => record(x) && Object.values(x).every(check);
const shape = (fields: Record<string, Check>): Check => x =>
  record(x) && Object.entries(fields).every(([key, check]) => check(x[key]));

const maybeNumber = nullable(number);
const numbers = array(number);
const strings = array(string);
const moment = shape({ type: string });
const profileNumbers = { comfort: number, memory: number, h3Share: number, stamina: number };
const served = shape({ card: string, variant: Number.isInteger, skill: string, section: string, height, reason: string, effort: number });
const section = shape({
  skipCount: number, skipTotal: number, remindDay: maybeNumber, lastReason: nullable(string),
  dripStopped: bool, liking: number, returned: bool, lastSkipSeq: maybeNumber, skippedLevel: nullable(height),
});
const skill = shape({
  height, gapIndex: number, nextReviewDay: maybeNumber, firstFailedDay: maybeNumber, firstFailedHeight: nullable(height),
  solidDays: numbers, noFullUntilDay: maybeNumber, windowStartSeq: number,
  attempts: array(shape({ day: number, seq: number, height, right: bool, ms: number, card: string })),
});
const session = shape({
  id: string, startedAt: number, budget: number, spent: number, h3Spent: number, served: nullable(served),
  history: array(shape({ skill: string, right: nullable(bool), ms: number, bad: bool, height, slow: bool })),
  repair: nullable(shape({ skill: string, failedHeight: height, stage: string })),
  returns: array(shape({ skill: string, afterCard: number })), newSkills: number, badMoments: numbers,
  extended: bool, extendLeft: number, phase: string, comeback: bool, fixed: number, blockedSections: strings,
  dripDone: bool, moments: array(moment), fadeEffort: maybeNumber, closeServed: number, sideDoor: nullable(string),
  confident: strings, startProfile: shape(profileNumbers), ramp: nullable(served), tailCard: nullable(string),
  badDay: bool, guardClose: bool, slowBefore: numbers, servedCards: strings, leftSkills: strings,
  ladderCard: nullable(string), ladderFull: number, stretchCard: nullable(string), extraNew: bool,
  lastSkip: nullable(shape({ section: string, skill: string, level: height, before: nullable(section), card: string })),
  guesses: number, guessNudged: bool, missRun: number, lowStart: bool, fixedSkills: strings, extendEffortLeft: number,
});

// migrate fills fields absent in older v1 saves, but also accepts {"v":1}.
// Validate its result so an invalid nested collection cannot break the next call.
const usable = shape({
  student: string, rng: shape({ seed: number, n: number }), seq: number, lastNow: number, answered: number,
  profile: shape({ ...profileNumbers, goodStreak: number, msByHeight: shape({ 1: numbers, 2: numbers, 3: numbers }) }),
  skills: dictionary(skill), sections: dictionary(section), seen: array(shape({ card: string, variant: number, day: number })),
  currentTopic: nullable(shape({ id: string, source: string })), day: nullable(shape({ day: number, effort: number, streakKept: bool })),
  sessionCount: number, lastSessionDay: maybeNumber, session: nullable(session),
  lastEnd: nullable(shape({ kind: string, effort: number, cards: number, right: number, fixed: number,
    streakKept: bool, recap: bool, fixedSkills: strings, rightSkills: strings })),
  pendingMoments: array(moment), momentsDone: strings, ladder: nullable(shape({ level: height, rightRun: number })),
  lastSession: nullable(shape({ cards: number, right: number })),
});

function validEvent(e: unknown): e is EngineEvent {
  return record(e) && typeof e.id === "string" && typeof e.student === "string"
    && typeof e.at === "number" && Number.isFinite(new Date(e.at).getTime())
    && typeof e.type === "string" && record(e.data)
    && (e.type !== "answer" || (typeof e.data.card === "string" && typeof e.data.right === "boolean"));
}

export function decodeStudy(text: string): SavedStudy {
  const raw: unknown = JSON.parse(text);
  const envelope = record(raw) && "state" in raw ? raw : undefined;
  const state = migrate(envelope ? envelope.state : raw);
  const events = envelope ? envelope.events : [];
  if (!usable(state) || !Array.isArray(events) || !events.every(validEvent)) throw new Error("Invalid study save");
  // The previous app mirrored these journal entries into prototype Progress.
  const legacyEvents = envelope?.legacyEvents ?? events.length;
  if (typeof legacyEvents !== "number" || !Number.isInteger(legacyEvents) || legacyEvents < 0 || legacyEvents > events.length) {
    throw new Error("Invalid Progress migration offset");
  }
  return { state, events, legacyEvents };
}
