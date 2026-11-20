import { migrate, type EngineEvent, type State } from "../../../engine/src/index";

export type SavedStudy = { state: State; events: EngineEvent[]; legacyEvents: number };

function record(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null && !Array.isArray(x);
}

// migrate fills older v1 fields but accepts incomplete v1 objects. Check the
// structures the scheduler traverses before a damaged save enters its cache.
function usable(s: State) {
  const p = s.profile;
  const ss = s.session;
  return typeof s.student === "string" && record(s.rng) && Number.isFinite(s.rng.seed) && Number.isFinite(s.rng.n)
    && [s.seq, s.lastNow, s.answered, s.sessionCount].every(Number.isFinite)
    && record(p) && [p.comfort, p.memory, p.h3Share, p.stamina, p.goodStreak].every(Number.isFinite)
    && [1, 2, 3].every(h => Array.isArray(p.msByHeight?.[h as 1 | 2 | 3]))
    && record(s.skills) && Object.values(s.skills).every(k => record(k) && [1, 2, 3].includes(k.height)
      && Array.isArray(k.attempts) && k.attempts.every(record) && Array.isArray(k.solidDays))
    && record(s.sections) && Object.values(s.sections).every(x => record(x) && Number.isFinite(x.skipCount))
    && Array.isArray(s.seen) && s.seen.every(x => record(x) && typeof x.card === "string")
    && Array.isArray(s.pendingMoments) && s.pendingMoments.every(record) && Array.isArray(s.momentsDone)
    && (s.day === null || (record(s.day) && Number.isFinite(s.day.day) && Number.isFinite(s.day.effort)))
    && (ss === null || (record(ss) && typeof ss.id === "string" && typeof ss.startProfile?.comfort === "number"
      && [ss.startedAt, ss.budget, ss.spent].every(Number.isFinite)
      && [ss.history, ss.returns, ss.badMoments, ss.blockedSections, ss.servedCards, ss.moments, ss.fixedSkills,
        ss.leftSkills, ss.slowBefore, ss.confident].every(Array.isArray)
      && ss.history.every(record) && ss.returns.every(record)
      && (ss.served === null || (record(ss.served) && typeof ss.served.card === "string" && Number.isInteger(ss.served.variant)))));
}

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
