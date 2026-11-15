import { defaultConfig, type Config } from "./config.js";
import { dayOf } from "./time.js";
import { effectiveNow } from "./state.js";
import { newSkillRec, recordAttempt, startHeight } from "./skill.js";
import { usualMs } from "./estimate.js";
import { pickAny, pickClose, pickComeback, pickMiddle, pickOpen, pickReturn } from "./pick.js";
import { nextRepairCard, stepDownOnce } from "./repair.js";
import { capRoom, closeReserve, dayRoom, fadeFromSlow, isBadDay, isComeback, offersExtend, pendingKind, sessionBudget } from "./budget.js";
import { onAnswer, onSessionEnd, rampBefore } from "./profile.js";
import { detectMoments, recordMoments, releasePending } from "./moments.js";
import { afterSectionAnswer, applySkip, newSectionRec, pickSkipCard, valueMessage } from "./skip.js";
import type {
  Choice, Content, EndInfo, EndKind, EngineEvent, Feedback, Moment, Next, PickCtx, Picked, Reason, Served, SessionState, SkipReason, State, Step,
} from "./types.js";

/** One public call in progress: a private copy of the state, the clock, and the events emitted so far. */
type Run = { s: State; content: Content; cfg: Config; now: number; day: number; events: EngineEvent[] };
/** After an answer: `avoid`, a section to leave after a failed repair. */
type Last = { avoid?: string } | null;

function begin(state: State, content: Content, now: number, cfg: Config): Run {
  const s = JSON.parse(JSON.stringify(state)) as State; // State is JSON by contract; the copy is ours to change
  const at = effectiveNow(s, now);
  s.lastNow = at;
  const day = dayOf(at);
  if (!s.day || s.day.day !== day) s.day = { day, effort: 0, streakKept: false };
  return { s, content, cfg, now: at, day, events: [] };
}

function emit(r: Run, type: EngineEvent["type"], data: Record<string, unknown>): void {
  r.s.seq += 1;
  r.events.push({ id: `${r.s.student}:${r.s.seq}`, student: r.s.student, at: r.now, session: r.s.session?.id ?? null, type, data });
}

function step(r: Run, next: Next, feedback?: Feedback, moments: Moment[] = []): Step {
  return feedback ? { state: r.s, events: r.events, feedback, moments, next } : { state: r.s, events: r.events, moments, next };
}

/** What the caller was last told: the open card, the pending offer, or the last end. */
function currentNext(state: State): Next {
  const ss = state.session;
  if (ss && ss.served) return { kind: "card", card: ss.served };
  if (ss) return { kind: "offer-extend" };
  return { kind: "end", end: state.lastEnd ?? { kind: "interrupted", effort: 0, cards: 0, right: 0, fixed: 0, streakKept: false } };
}

function stale(state: State): Step {
  return { state, events: [], moments: [], next: currentNext(state) };
}

// ---------- profile hooks ----------

/** Per answer: memory, section liking and the answer times (see profile.ts). `usual` is from before this answer. */
function onAnswerProfile(r: Run, sv: Served, right: boolean, ms: number, usual: number | null): void {
  const s = r.s;
  const old = s.sections[sv.section] ?? newSectionRec();
  const out = onAnswer(s.profile, old, {
    height: sv.height, right, ms, wasDueReviewFirstCard: sv.reason === "due-review" && s.session!.tailCard !== sv.card, usualMs: usual, extend: sv.reason === "extend:liked",
  }, r.cfg);
  s.profile = out.profile;
  if (out.section !== old) s.sections = { ...s.sections, [sv.section]: out.section };
}

/** Per session end: the profile numbers move (profile.ts). Returns them when any of the four changed since the start. */
function onSessionEndProfile(r: Run, end: EndInfo, session: SessionState): ReturnType<typeof pickNumbers> | null {
  r.s = onSessionEnd(r.s, end, session, r.cfg);
  if (end.kind === "interrupted") return null;
  const n = pickNumbers(r.s.profile);
  const o = session.startProfile;
  return o.comfort !== n.comfort || o.memory !== n.memory || o.h3Share !== n.h3Share || o.stamina !== n.stamina ? n : null;
}

const pickNumbers = (p: State["profile"]) => ({ comfort: p.comfort, memory: p.memory, h3Share: p.h3Share, stamina: p.stamina });

// ---------- picking ----------

/**
 * `strict`: only cards within `remaining` (never more than `capRoom`, so the daily cap holds even on a wrong
 * answer), and skills waiting for a repair return are left alone ("then leave the skill"). The loose context
 * (strict false, no limit) answers "is there anything at all to serve?".
 */
function ctxOf(r: Run, strict: boolean, remaining: number, extraBlocked: string[] = []): PickCtx {
  const ss = r.s.session!;
  const done = ss.history.filter((h) => h.right !== null);
  return {
    day: r.day, remaining: strict ? Math.min(remaining, capRoom(r.s, r.cfg)) : Infinity,
    runningRight: done.filter((h) => h.right).length, runningTotal: done.length,
    newSkillsThisSession: ss.newSkills, lastSkills: ss.history.map((h) => h.skill),
    blockedSections: [...ss.blockedSections, ...extraBlocked], h3Spent: ss.h3Spent, spent: ss.spent, strictBudget: strict,
    excludeSkills: strict ? ss.returns.map((q) => q.skill) : [],
    recentCards: recentCards(r),
  };
}
/** R5: the card ids of the session's last `session.returnAfterCards` serves, not to be served again yet. */
const recentCards = (r: Run) => r.s.session!.servedCards.slice(-r.cfg.session.returnAfterCards);
const loose = (r: Run) => ctxOf(r, false, Infinity);
/** Anything at all eligible in content (ignoring budget, runs and exclusions)? */
const anyLeft = (r: Run) => pickAny(r.s, r.content, loose(r), r.cfg, "comfort-correction") !== null;

/**
 * Review finding 5: when nothing outside the session's recent cards (R5) is eligible, the least recent of them: the
 * sweep is retried with the recent window shortened from its oldest end, down to none.
 */
function leastRecent(r: Run, base: PickCtx, reason: Reason): Picked | null {
  const recent = base.recentCards ?? [];
  for (let k = recent.length - 1; k >= 0; k--) {
    const p = pickAny(r.s, r.content, { ...base, recentCards: recent.slice(recent.length - k) }, r.cfg, reason);
    if (p) return p;
  }
  return null;
}

function withReason(p: Picked | null, reason: Reason): Picked | null {
  return p && { ...p, served: { ...p.served, reason } };
}

/** `sweep`: a not-started skill served by the last-resort sweep or a close pick starts at the served height. */
function serve(r: Run, p: Picked, sweep = false): Next {
  const ss = r.s.session!;
  const sv = p.served;
  r.s.rng = p.rng;
  if (!(sv.skill in r.s.skills)) {
    ss.newSkills += 1;
    if (sweep) r.s.skills[sv.skill] = newSkillRec(sv.height);
  }
  ss.served = sv;
  ss.servedCards = [...ss.servedCards, sv.card];
  if (sv.reason === "side-door") ss.sideDoor = sv.section;
  if (sv.reason === "skipped-drip") ss.dripDone = true;
  r.s.seen = [...r.s.seen.filter((x) => r.day - x.day < r.cfg.noRepeatDays), { card: sv.card, variant: sv.variant, day: r.day }];
  emit(r, "card_served", { ...sv });
  return { kind: "card", card: sv };
}

// ---------- the loop ----------

/** `confident`: the repair's confidence card was answered right (for missing-piece-fixed on the return). */
function queueReturn(r: Run, skill: string, confident = false): void {
  const ss = r.s.session!;
  ss.confident = [...ss.confident.filter((x) => x !== skill), ...(confident ? [skill] : [])];
  ss.returns = [...ss.returns, { skill, afterCard: ss.history.length + r.cfg.session.returnAfterCards }];
}

function decide(r: Run, last: Last): Next {
  const ss = r.s.session!;
  if (ss.phase === "extend") {
    if (ss.extendLeft > 0) {
      const ctx = ctxOf(r, true, Infinity);
      const p = withReason(pickOpen(r.s, r.content, ctx, r.cfg) ?? pickClose(r.s, r.content, ctx, r.cfg), "extend:liked");
      if (p) return serve(r, p, true); // a not-started skill from pickClose starts at the served height
      const any = pickAny(r.s, r.content, ctx, r.cfg, "comfort-correction");
      if (any) return serve(r, any, true);
      ss.extendLeft = 0; // nothing fits: "5 more" is over
    }
    return toClosing(r, false);
  }
  if (ss.phase === "closing") return closing(r, false);
  if (isBadDay(ss, r.cfg)) {
    ss.badDay = true;
    ss.fadeEffort = ss.fadeEffort ?? ss.spent; // a fade seen earlier (R4b) is kept
    return toClosing(r, true);
  }
  return normal(r, last);
}

function normal(r: Run, last: Last): Next {
  const { s, content, cfg } = r;
  const ss = s.session!;
  // Keep a wrong close card's worth; but while today is under the minimum day, the session may use its budget up to
  // the minimum day (a minimum-day budget, R4c / comeback, is spent in full).
  const left = ss.budget - ss.spent;
  const room = Math.min(Math.max(left - closeReserve(cfg), Math.min(left, cfg.budget.minimumDay - s.day!.effort)), capRoom(s, cfg));
  const strict = (extra: string[] = []) => ctxOf(r, true, room, extra);

  while (ss.repair) {
    const rc = nextRepairCard(s, content, ss.repair, r.day, cfg, ss.blockedSections, recentCards(r));
    if (rc) return rc.served.effort <= room ? serve(r, rc) : toClosing(r, false);
    if (ss.repair.stage === "piece") ss.repair = { ...ss.repair, stage: "confidence" };
    else {
      queueReturn(r, ss.repair.skill);
      ss.repair = null;
    }
  }
  if (ss.ramp) { // the height-3 card the ramp card was served for
    const q = ss.ramp;
    ss.ramp = null;
    if (!ss.blockedSections.includes(q.section) && q.effort <= room) {
      ss.tailCard = q.card; // the second half of a ramp: not a first card back for memory
      return serve(r, { served: q, rng: s.rng });
    }
  }
  const main = (p: Picked) => serveMain(r, p, room);
  if (last?.avoid !== undefined) {
    const p = pickOpen(s, content, strict([last.avoid]), cfg);
    if (p) return main(p);
  }
  const open = ss.history.length < cfg.session.openCards;
  ss.phase = open ? "open" : "middle";
  if (open) {
    const p = (ss.comeback ? pickComeback(s, content, strict(), cfg) : null) ?? pickOpen(s, content, strict(), cfg);
    if (p) return main(p);
  } else {
    const p = pickReturn(s, content, strict(), ss.returns, ss.history.length, cfg);
    if (p) {
      const i = ss.returns.findIndex((q) => q.skill === p.served.skill);
      ss.returns = ss.returns.filter((_, j) => j !== i);
      return serve(r, p);
    }
    const sk = pickSkipCard(s, content, ss, strict(), cfg); // side door or drip
    if (sk) return serve(r, sk);
  }
  const pm = pickMiddle(s, content, strict(), cfg);
  if (pm) return main(pm);
  if (pickMiddle(s, content, loose(r), cfg)) return toClosing(r, false); // something to serve, nothing that fits
  // pickMiddle had nothing (comfort mode found nothing at comfort): the most winnable card, else the sweep
  const pc = withReason(pickClose(s, content, strict(), cfg), "comfort-correction");
  if (pc) return serve(r, pc, true);
  const any = pickAny(s, content, strict(), cfg, "comfort-correction");
  if (any) return serve(r, any, true);
  const side = pickSkipCard(s, content, ss, strict(), cfg, true); // a due side door before ending for lack of cards
  if (side) return serve(r, side);
  if (anyLeft(r)) return toClosing(r, false);
  const lr = leastRecent(r, strict(), "comfort-correction");
  if (lr) return serve(r, lr, true);
  return leastRecent(r, loose(r), "comfort-correction") ? toClosing(r, false) : finish(r, "content-exhausted");
}

/** Serves an open or middle pick; a height-3 pick for a calculation-weak student goes behind a height-2 ramp card. */
function serveMain(r: Run, p: Picked, room: number): Next {
  const ss = r.s.session!;
  const ramp = rampBefore(r.s, r.content, p, ss.history.map((h) => h.skill), r.day, room, r.cfg, recentCards(r));
  if (!ramp) return serve(r, p);
  ss.ramp = p.served;
  return serve(r, ramp);
}

function toClosing(r: Run, forced: boolean): Next {
  const ss = r.s.session!;
  ss.phase = "closing";
  ss.closeServed = 0;
  ss.repair = null;
  ss.ramp = null;
  return closing(r, forced);
}

/**
 * The end of a session (final review F1). When the last answer was right the session ends there, whatever the
 * estimate and today's effort; a close card is served only when the last answer was not right, or when `forced`
 * (bad day). A wrong close answer gets another close card, at most `sessionEnd.maxExtraClose` extra. A close card is
 * never served past the daily cap; when the cap blocks it after a wrong answer the session ends `daily-cap`. When only
 * the session's recent cards are left, the least recent is served. `content-exhausted` only when nothing at all is
 * eligible.
 */
function closing(r: Run, forced: boolean): Next {
  const { s, content, cfg } = r;
  const ss = s.session!;
  const pending = pendingKind(ss);
  const first = ss.closeServed === 0;
  const lastRight = ss.history.length > 0 && ss.history[ss.history.length - 1].right === true;
  if (lastRight && !(first && forced)) return finish(r, pending);
  if (ss.closeServed > cfg.sessionEnd.maxExtraClose) return finish(r, pending);
  const capped = ctxOf(r, true, Infinity);
  const p = (first ? pickClose(s, content, ctxOf(r, true, ss.budget - ss.spent), cfg) : null) ?? pickClose(s, content, capped, cfg);
  const any = p ? null : pickAny(s, content, capped, cfg, "close:winnable");
  if (p || any) {
    ss.closeServed += 1;
    return serve(r, (p ?? any)!, true);
  }
  if (lastRight) return finish(r, pending);
  const lr = leastRecent(r, capped, "close:winnable");
  if (lr) {
    ss.closeServed += 1;
    return serve(r, lr, true);
  }
  return finish(r, anyLeft(r) || leastRecent(r, loose(r), "close:winnable") ? "daily-cap" : "content-exhausted");
}

/** A `budget` end may become an offer of "5 more"; everything else closes the session. */
function finish(r: Run, kind: EndKind): Next {
  const ss = r.s.session!;
  if (kind === "budget" && offersExtend(r.s, ss, r.cfg)) {
    ss.served = null;
    return { kind: "offer-extend" };
  }
  return closeSession(r, kind);
}

function closeSession(r: Run, kind: EndKind): Next {
  const ss = r.s.session!;
  const today = r.s.day!;
  const cards = ss.history.length;
  // F1: a session the engine ended by its budget keeps the streak even under `budget.minimumDay`.
  if (kind === "bad-day" || kind === "budget" || kind === "extended-done" || (kind === "content-exhausted" && cards >= 1)) today.streakKept = true;
  if (kind === "left") ss.fadeEffort = ss.fadeEffort ?? ss.spent; // a fade seen earlier (R4b) is kept
  for (const q of ss.returns) {
    if (r.s.skills[q.skill]) r.s.skills[q.skill] = { ...r.s.skills[q.skill], nextReviewDay: r.day + 1 };
  }
  const end: EndInfo = {
    kind, effort: ss.spent, cards, right: ss.history.filter((h) => h.right === true).length, fixed: ss.fixed,
    streakKept: today.streakKept,
  };
  const changed = onSessionEndProfile(r, end, ss);
  emit(r, "session_end", { ...end, fadeEffort: ss.fadeEffort });
  if (changed) emit(r, "profile", changed);
  r.s.lastSessionDay = dayOf(ss.startedAt);
  r.s.session = null;
  r.s.lastEnd = end;
  return { kind: "end", end };
}

// ---------- public API ----------

export function startSession(state: State, content: Content, now: number, cfg: Config = defaultConfig): Step {
  const r = begin(state, content, now, cfg);
  if (r.s.session) closeSession(r, "interrupted");
  const today = r.s.day!;
  if (dayRoom(r.s, cfg) < cfg.effort.h1) {
    const end: EndInfo = { kind: "daily-cap", effort: 0, cards: 0, right: 0, fixed: 0, streakKept: today.streakKept };
    r.s.lastEnd = end;
    return step(r, { kind: "end", end });
  }
  r.s.sessionCount += 1;
  const comeback = isComeback(r.s, r.day, cfg);
  const budget = sessionBudget(r.s, comeback, cfg);
  r.s.session = {
    id: `${r.s.student}:s${r.s.sessionCount}`, startedAt: r.now, budget, spent: 0, h3Spent: 0, served: null,
    history: [], repair: null, returns: [], newSkills: 0, badMoments: [], extended: false, extendLeft: 0,
    phase: "open", comeback, fixed: 0, blockedSections: [], dripDone: false, moments: [], fadeEffort: null, closeServed: 0,
    sideDoor: null, confident: [],
    startProfile: pickNumbers(r.s.profile), ramp: null, tailCard: null, badDay: false, slowBefore: [], servedCards: [],
  };
  emit(r, "session_start", { budget, comeback, sessionCount: r.s.sessionCount });
  const held = releasePending(r.s, cfg);
  for (const m of held) emit(r, "moment", { ...m });
  return step(r, decide(r, null), undefined, held);
}

export function answer(
  state: State, content: Content, input: { card: string; choice: Choice; ms: number }, now: number, cfg: Config = defaultConfig,
): Step {
  const sv0 = state.session?.served;
  const opts = sv0 && sv0.card === input.card ? content.cards[sv0.card]?.variants[sv0.variant] : undefined;
  const okChoice = input.choice === "dont-know" || (Number.isInteger(input.choice) && input.choice >= 0 && opts !== undefined && input.choice < opts.length);
  if (!opts || !okChoice) return stale(state);

  const r = begin(state, content, now, cfg);
  const sv = r.s.session!.served!;
  const card = content.cards[sv.card];
  const picked = input.choice === "dont-know" ? null : opts[input.choice];
  const right = picked !== null && picked.correct;
  const tag = picked !== null && !right ? picked.tag : undefined;
  const drip = sv.reason === "skipped-drip";
  const usual = usualMs(r.s, sv.height, cfg);
  const slow = usual !== null && input.ms > cfg.badDay.slowFactor * usual;
  const cost = sv.effort + (picked === null ? cfg.effort.dontKnow : right ? 0 : cfg.effort.wrong);

  const today = r.s.day!;
  today.effort += cost;
  if (today.effort >= cfg.budget.minimumDay) today.streakKept = true;
  r.s.answered += 1;
  let steppedDown = false;
  const def = content.skills[sv.skill];
  if (def) {
    const comfortLow = r.s.profile.comfort >= cfg.estimate.comfortLowMark;
    const rec0 = r.s.skills[sv.skill] ?? newSkillRec(startHeight(def, comfortLow, r.s.sections[def.section]?.returned === true));
    const out = recordAttempt(rec0, def, { day: r.day, seq: r.s.answered, height: sv.height, right, ms: input.ms, card: sv.card }, r.s.profile.memory, cfg);
    // A drip is a height-1 card, the lowest height, so a wrong drip can never step its skill down.
    r.s.skills[sv.skill] = out.rec;
    steppedDown = out.steppedDown;
  }
  const reveal = afterSectionAnswer(r.s, content, sv, right, r.day, cfg);
  onAnswerProfile(r, sv, right, input.ms, usual);

  const ss = r.s.session!;
  if (slow) {
    ss.slowBefore = [...ss.slowBefore, ss.spent];
    ss.fadeEffort = ss.fadeEffort ?? fadeFromSlow(ss, cfg);
  }
  ss.spent += cost;
  if (sv.height === 3) ss.h3Spent += sv.effort;
  ss.history.push({ skill: sv.skill, right, ms: input.ms, bad: false, height: sv.height, slow });
  ss.served = null;
  if (sv.reason === "repair:return" && right) ss.fixed += 1;
  if (ss.phase === "extend") ss.extendLeft -= 1;
  emit(r, "answer", { card: sv.card, variant: sv.variant, skill: sv.skill, height: sv.height, choice: input.choice, right, ms: input.ms, tag: tag ?? null });
  const moments = recordMoments(r.s, detectMoments(state, r.s, content, sv, right, r.day, cfg), cfg);
  for (const m of moments) emit(r, "moment", { ...m });
  const feedback: Feedback = {
    right, correctIndex: opts.findIndex((o) => o.correct), ...(tag !== undefined ? { tag } : {}), ...(reveal ? { reveal } : {}),
  };

  let avoid: string | undefined;
  if (ss.phase === "open" || ss.phase === "middle") {
    if (ss.repair) {
      if (right && ss.repair.stage === "piece") ss.repair = { ...ss.repair, stage: "confidence" };
      else if (right) {
        queueReturn(r, ss.repair.skill, true);
        ss.repair = null;
      } else {
        // A failed repair: a bad moment, one step down, and away to another liked section. No second repair.
        const i = ss.history.length - 1;
        ss.badMoments.push(i);
        ss.history[i].bad = true;
        const rdef = content.skills[ss.repair.skill];
        const rrec = r.s.skills[ss.repair.skill];
        if (rdef && rrec && !(steppedDown && sv.skill === rdef.id)) r.s.skills[rdef.id] = stepDownOnce(rrec, rdef, r.s.answered + 1);
        avoid = rdef?.section;
        ss.repair = null;
      }
    } else if (!right && !drip) {
      ss.repair = {
        skill: sv.skill, failedHeight: sv.height, ...(tag !== undefined ? { tag } : {}),
        ...(card.noteRef !== undefined ? { note: card.noteRef } : {}), stage: "piece",
      };
    }
  }
  if (ss.repair) ss.ramp = null; // a wrong answer starts a repair; the waiting height-3 card is dropped
  return step(r, decide(r, avoid !== undefined ? { avoid } : {}), feedback, moments);
}

/**
 * "Not now" on the current card (spec §6). A second or later skip of the section first returns
 * `confirm-skip` with its value message and changes nothing; the caller then skips again with
 * `confirmed: true` or answers the card. A skip for any other card is stale.
 */
export function skip(
  state: State, content: Content, input: { card: string; reason?: SkipReason; confirmed?: boolean }, now: number, cfg: Config = defaultConfig,
): Step {
  const sv0 = state.session?.served;
  if (!sv0 || sv0.card !== input.card) return stale(state);
  if (sv0.reason !== "skipped-drip" && (state.sections[sv0.section]?.skipCount ?? 0) >= 1 && input.confirmed !== true) {
    return { state, events: [], moments: [], next: { kind: "confirm-skip", value: valueMessage(state, content, sv0.section, cfg) } };
  }
  const r = begin(state, content, now, cfg);
  emit(r, "skip", applySkip(r.s, content, r.s.session!.served!, input.reason, r.day, cfg));
  return step(r, decide(r, null));
}

/** The student took "5 more". Only valid while the offer is pending. */
export function extend(state: State, content: Content, now: number, cfg: Config = defaultConfig): Step {
  if (!state.session || state.session.served !== null) return stale(state);
  const r = begin(state, content, now, cfg);
  const ss = r.s.session!;
  ss.extended = true;
  ss.extendLeft = cfg.budget.extendCards;
  ss.phase = "extend";
  ss.closeServed = 0;
  return step(r, decide(r, null));
}

/**
 * Closes the open session: `budget` when "5 more" is declined; otherwise `left` (the student closed it,
 * `fadeEffort = spent`), or `interrupted` with an explicit `{ left: false }`.
 */
export function endSession(
  state: State, content: Content, now: number, cfg: Config = defaultConfig, opts: { left?: boolean } = {},
): Step {
  if (!state.session) return stale(state);
  const r = begin(state, content, now, cfg);
  const ss = r.s.session!;
  const kind: EndKind = ss.served === null ? "budget" : opts.left === false ? "interrupted" : "left";
  return step(r, closeSession(r, kind));
}
