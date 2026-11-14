import type { Rng } from "./rng.js";
export type Height = 1 | 2 | 3;
export type CardOption = { correct: boolean; tag?: string };
export type Card = {
  id: string; skill: string; section: string; height: Height; poolId?: string;
  noteRef?: string; variants: CardOption[][];
};
export type SkillDef = {
  id: string; unit: string; topic: string; section: string; weight: number;
  requires: string[]; helps: string[]; cards: Record<Height, string[]>; name: string;
};
export type SectionDef = { id: string; unit: string; topic: string; name: string; skills: string[]; weight: number };
export type Content = {
  cards: Record<string, Card>;
  skills: Record<string, SkillDef>;
  sections: Record<string, SectionDef>;
  topics: Record<string, { id: string; unit: string; sections: string[] }>;
};

export type Attempt = { day: number; seq: number; height: Height; right: boolean; ms: number; card: string };
export type SkillRec = {
  height: Height;
  attempts: Attempt[]; // last 12 kept
  gapIndex: number;
  nextReviewDay: number | null;
  firstFailedDay: number | null;
  firstFailedHeight: Height | null;
  solidDays: number[];
  noFullUntilDay: number | null;
  /** Attempts with seq below this no longer count toward step up/down (set after a step). */
  windowStartSeq: number;
};
export type SkipReason = "not-learned" | "too-hard" | "later";
export type SectionRec = {
  skipCount: number; remindDay: number | null; lastReason: SkipReason | null;
  dripStopped: boolean; liking: number; returned: boolean;
  /** Lifetime count of skips of this section (never reset, unlike `skipCount`). */
  skipTotal: number;
  /** `answered` when the section was last skipped (attempts with a higher `seq` came after it), else null. */
  lastSkipSeq: number | null;
};
export type Profile = {
  comfort: number; memory: number; h3Share: number; stamina: number;
  goodStreak: number; msByHeight: Record<Height, number[]>; // last 20 ms per height
};
export type Seen = { card: string; variant: number; day: number };
export type SessionHistoryEntry = {
  skill: string; right: boolean | null; ms: number; bad: boolean;
  /** Height of the answered card and whether the answer took over `badDay.slowFactor × usualMs(height)`. */
  height: Height; slow: boolean;
};
/**
 * The open session. Invariant: `served === null` while a session is open only when "5 more" is on offer.
 * `closeServed` counts close cards served since `phase` became "closing".
 * `sideDoor`: the section served through the side door this session (at most one), else null.
 */
export type SessionState = {
  id: string; startedAt: number; budget: number; spent: number; h3Spent: number;
  served: Served | null; history: SessionHistoryEntry[];
  repair: RepairState | null; returns: { skill: string; afterCard: number }[];
  newSkills: number; badMoments: number[]; extended: boolean; extendLeft: number;
  phase: "open" | "middle" | "closing" | "extend"; comeback: boolean; fixed: number;
  blockedSections: string[]; dripDone: boolean; moments: Moment[]; fadeEffort: number | null;
  closeServed: number; sideDoor: string | null;
  /** Skills whose repair ended with the confidence card right (their return card can fix a missing piece). */
  confident: string[];
  /** The four profile numbers when the session began (a `profile` event is emitted only if they changed). */
  startProfile: { comfort: number; memory: number; h3Share: number; stamina: number };
  /** A height-3 card waiting behind the height-2 ramp card just served, else null. */
  ramp: Served | null;
  /** The height-3 card last served as the second half of a ramp (its due-review reason is not a new first card back). */
  tailCard: string | null;
};

export type Choice = number | "dont-know";
export type EndKind = "budget" | "bad-day" | "extended-done" | "daily-cap" | "content-exhausted" | "left" | "interrupted";
export type EndInfo = { kind: EndKind; effort: number; cards: number; right: number; fixed: number; streakKept: boolean };
export type Feedback = { right: boolean; correctIndex: number; tag?: string; reveal?: { section: string } };
/** Shown before a second (or later) skip of a section: its share of the unit's weight and its top skills. */
export type ValueMessage = { section: string; sharePct: number; topSkills: { skill: string; solid: boolean }[] };
/** Implemented in Task 8 (moments). */
export type Moment =
  | { type: "section-solid"; section: string }
  | { type: "avoided-now-done"; section: string }
  | { type: "then-wrong-now-right"; skill: string; thenDay: number; nowDay: number }
  | { type: "missing-piece-fixed"; skill: string }
  | { type: "height-up"; skill: string; from: Height; to: Height };
export type Next =
  | { kind: "card"; card: Served }
  | { kind: "offer-extend" }
  | { kind: "end"; end: EndInfo }
  | { kind: "confirm-skip"; value: ValueMessage };
export type EngineEvent = {
  id: string; student: string; at: number; session: string | null;
  type: "session_start" | "card_served" | "answer" | "skip" | "session_end" | "profile" | "moment";
  data: Record<string, unknown>;
};
export type Step = { state: State; events: EngineEvent[]; feedback?: Feedback; moments: Moment[]; next: Next };
export type State = {
  v: 1; student: string; rng: Rng; seq: number; lastNow: number;
  profile: Profile; skills: Record<string, SkillRec>; sections: Record<string, SectionRec>;
  seen: Seen[]; currentTopic: { id: string; source: "class" | "student" } | null;
  day: { day: number; effort: number; streakKept: boolean } | null;
  sessionCount: number; lastSessionDay: number | null; session: SessionState | null;
  /** Lifetime answered cards; each answer's `Attempt.seq`. */
  answered: number;
  /** Section-solid / avoided-now-done moments held for the next session's first step. */
  pendingMoments: Moment[];
  /** Moments already shown, keyed `${type}:${skill or section}`. */
  momentsDone: string[];
  /** How the last session (or daily-cap start) ended; replayed for a stale call with no open session. */
  lastEnd: EndInfo | null;
};

export type Reason = "open:liked" | "close:winnable" | "repair:missing-piece" | "repair:confidence" | "repair:return"
  | "due-review" | "new:class-topic" | "new:exam-weight" | "side-door" | "skipped-drip"
  | "comfort-correction" | "extend:liked" | "comeback:solid";

export type Served = {
  card: string; variant: number; skill: string; section: string; height: Height;
  reason: Reason; effort: number; borrowedFrom?: string;
};

/**
 * Everything session-specific a pick needs. `lastSkills` is oldest first, most recent last.
 * `h3Spent` / `spent` are the session's height-3 effort and total effort so far.
 * `strictBudget`: skip any candidate over `remaining`, even while today's effort is under `minimumDay`
 * (the session uses it to tell "nothing fits the budget" from "nothing to serve").
 * `excludeSkills`: skills not to serve now (a repaired skill waiting for its return).
 */
export type PickCtx = {
  day: number; remaining: number; runningRight: number; runningTotal: number;
  newSkillsThisSession: number; lastSkills: string[]; blockedSections: string[];
  h3Spent: number; spent: number; strictBudget?: boolean; excludeSkills?: string[];
};

export type Picked = { served: Served; rng: Rng };

/** A repair in flight (spec §5). `tag` / `note` are absent (never undefined) when unknown. */
export type RepairState = { skill: string; failedHeight: Height; tag?: string; note?: string; stage: "piece" | "confidence" };
