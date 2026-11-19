import { defaultConfig, type Config } from "./config.js";
import { dayOf } from "./time.js";
import { begin, emit, rollDay, stale, step, type Run } from "./step.js";
import { isDue, newSkillRec, recordAttempt } from "./skill.js";
import { isGuess, usualMs } from "./estimate.js";
import { closeSweepReason, pickAny, pickClose, pickComeback, pickMiddle, pickOpen, pickReturn } from "./pick.js";
import { nextRepairCard, stepDownOnce } from "./repair.js";
import { afterLowRight, capRoom, closeReserve, dayRoom, fadeFromSlow, isBadDay, isComeback, offersExtend, pendingKind, sessionBudget } from "./budget.js";
import { onAnswer, onSessionEnd, rampBefore } from "./profile.js";
import { detectMoments, recordMoments, releasePending } from "./moments.js";
import { afterSectionAnswer, applyCardSkip, applySkip, newSectionRec, pickSkipCard, rejoinSilently, valueMessage } from "./skip.js";
import { ladderAfterAnswer, pickLadder } from "./ladder.js";
import type {
  Choice, Content, EndInfo, EndKind, Feedback, Next, PickCtx, Picked, Reason, Served, SessionState, SkipReason, State, Step,
} from "./types.js";

/**
 * After an answer: `avoid`, a section to leave after a failed repair; `leave`, the section of a skill just left after
 * two misses in a row (change 2): the next card is the easiest eligible one outside it. `leave` is set only in the
 * open/middle phases; closing and "5 more" ignore it (their own picks already leave out the session's left skills).
 */
type Last = { avoid?: string; leave?: string } | null;

// ---------- profile hooks ----------

/**
 * Per answer: memory, section liking and the answer times (see profile.ts). `usual` is from before this answer.
 * `belowRecord` (change 4, fix round 1): a ladder card below the skill's recorded level: easier than what is being
 * remembered, so it does not move memory.
 */
function onAnswerProfile(r: Run, sv: Served, right: boolean, ms: number, usual: number | null, belowRecord = false): void {
  const s = r.s;
  const old = s.sections[sv.section] ?? newSectionRec();
  const out = onAnswer(s.profile, old, {
    height: sv.height, right, ms, wasDueReviewFirstCard: sv.reason === "due-review" && s.session!.tailCard !== sv.card && !belowRecord,
    usualMs: usual, extend: sv.reason === "extend:liked",
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
  // Change 5: no stretch card among the opening cards, right after a miss (wrong or "I don't know"), or right after a
  // stretch card (or the ramp card before one). The ladder / repair / closing / "5 more" clauses cannot be reached from
  // pickMiddle today (those paths never call it); they are kept as guards.
  const stretchOff = ss.history.length < r.cfg.session.openCards || ladderOn(r) || ss.repair !== null
    || ss.phase === "closing" || ss.phase === "extend" || ss.stretchCard !== null || done.at(-1)?.right === false;
  return {
    day: r.day, sessionDay: r.sessionDay, remaining: strict ? Math.min(remaining, capRoom(r.s, r.cfg)) : Infinity,
    runningRight: done.filter((h) => h.right).length, runningTotal: done.length,
    newSkillsThisSession: ss.newSkills, lastSkills: ss.history.map((h) => h.skill),
    blockedSections: [...ss.blockedSections, ...extraBlocked], h3Spent: ss.h3Spent, spent: ss.spent, strictBudget: strict,
    excludeSkills: [...(strict ? ss.returns.map((q) => q.skill) : []), ...ss.leftSkills],
    recentCards: recentCards(r), leftSkills: ss.leftSkills, ladderFull: ss.ladderFull, stretchOff, extraNewUsed: ss.extraNew,
  };
}
/** R5: the card ids of the session's last `session.returnAfterCards` serves, not to be served again yet. */
const recentCards = (r: Run) => r.s.session!.servedCards.slice(-r.cfg.session.returnAfterCards);
const loose = (r: Run) => ctxOf(r, false, Infinity);
/** `skills` kept out of this pick entirely, even by the sweep's relaxed pass (as a left skill is). */
const hold = (ctx: PickCtx, skills: string[]): PickCtx => ({ ...ctx, leftSkills: [...(ctx.leftSkills ?? []), ...skills] });
/** Anything at all eligible in content (ignoring budget, runs and exclusions)? */
const anyLeft = (r: Run) => pickAny(r.s, r.content, loose(r), r.cfg, "fallback:any") !== null;

/**
 * Review finding 5: when nothing outside the session's recent cards (R5) is eligible, the least recent of them: the
 * sweep is retried with the recent window shortened from its oldest end, down to none.
 */
function leastRecent(r: Run, base: PickCtx, reason: Reason, opts: { repeatRight?: boolean } = {}): Picked | null {
  const recent = base.recentCards ?? [];
  for (let k = recent.length - 1; k >= 0; k--) {
    const p = pickAny(r.s, r.content, { ...base, recentCards: recent.slice(recent.length - k) }, r.cfg, reason, opts);
    if (p) return p;
  }
  return null;
}

function withReason(p: Picked | null, reason: Reason): Picked | null {
  return p && { ...p, served: { ...p.served, reason } };
}

/**
 * `sweep`: a not-started skill served by the last-resort sweep or a close pick gets its SkillRec (at the served height)
 * when served, so it counts as started even if skipped; any other new skill gets it, at the served height, on its answer.
 * `ladder`: the card is a `pickLadder` pick (change 4): its answer moves the ladder. Any other card clears the mark,
 * except a ramp card served in front of a waiting ladder pick.
 * `stretch`: the card is a `stretch:up` pick (change 5): a right answer raises its skill's record. The mark follows the
 * ladder's (a ramp card in front of a waiting stretch pick keeps it; any other card clears it). `p.extraNew`: the pick
 * is the session's one extra new skill.
 */
function serve(r: Run, p: Picked, sweep = false, ladder = false, stretch = false): Next {
  const ss = r.s.session!;
  const sv = p.served;
  r.s.rng = p.rng;
  ss.ladderCard = ladder ? sv.card : ss.ramp !== null && ss.ramp.card === ss.ladderCard ? ss.ladderCard : null;
  ss.stretchCard = stretch ? sv.card : ss.ramp !== null && ss.ramp.card === ss.stretchCard ? ss.stretchCard : null;
  if (p.extraNew === true) ss.extraNew = true;
  if (ladder && sv.height === 3) ss.ladderFull += 1;
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

/**
 * Change 4: the ladder is active in this session: `startSession` left `state.ladder` set (the session is one of the
 * first `budget.firstSessions`) and the session is not a comeback.
 */
const ladderOn = (r: Run) => r.s.ladder !== null && !r.s.session!.comeback;

function decide(r: Run, last: Last): Next {
  const ss = r.s.session!;
  if (ss.phase === "extend") {
    if (ss.extendLeft > 0) {
      // Extend ruling: only a card whose effort fits what is left of the allowance (a cheaper one when it does not).
      // Final review F4: never a skill missed (wrong or "I don't know") earlier in the session.
      const ctx = hold(ctxOf(r, true, ss.extendEffortLeft), ss.history.filter((h) => h.right === false).map((h) => h.skill));
      const p = withReason(pickOpen(r.s, r.content, ctx, r.cfg) ?? pickClose(r.s, r.content, ctx, r.cfg), "extend:liked");
      if (p) return serve(r, p, true); // a not-started skill from pickClose starts at the served height
      const any = pickAny(r.s, r.content, ctx, r.cfg, "fallback:any");
      if (any) return serve(r, any, true);
      ss.extendLeft = 0; // nothing fits (the allowance, the cap or the content): "5 more" is over
    }
    return toClosing(r, false);
  }
  if (ss.phase === "closing") return closing(r, false);
  if (ss.badDay || isBadDay(ss, r.cfg)) { // ss.badDay: set by a zero-right miss run (change 3, fix round 1)
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
  rejoinSilently(r, ss.blockedSections); // change 6: a due section with no side-door card comes back without one
  // Change 1 (Task 9 fix): a return is never the card straight after a miss on its own skill (a repair with no piece
  // and no confidence card queues it at once; the early path below would otherwise serve it next, at the skill's level).
  const prev = ss.history.at(-1);
  const returns = () => (prev !== undefined && prev.right !== true ? ss.returns.filter((q) => q.skill !== prev.skill) : ss.returns);

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
      return serve(r, { served: q, rng: s.rng }, false, ss.ladderCard === q.card, ss.stretchCard === q.card);
    }
  }
  // Change 4: while the ladder is active, open and middle picks come from pickLadder (the level follows the answers).
  const ladder = ladderOn(r);
  const middle = ladder ? pickLadder : pickMiddle;
  const main = (p: Picked) => serveMain(r, p, room, ladder);
  if (last?.leave !== undefined) {
    // Change 2: the easiest eligible card from a different section (the close order, that section blocked).
    const p = withReason(pickClose(s, content, strict([last.leave]), cfg), "comfort-correction");
    if (p) return serve(r, p, true); // a not-started skill from pickClose starts at the served height
  }
  const open = ss.history.length < cfg.session.openCards;
  // Change 3: after a near-zero session the opening cards come from the closing order (easiest eligible anywhere),
  // before the ladder or a comeback's opening rule; they never move the ladder.
  const easy = (extra: string[] = []) => withReason(pickClose(s, content, strict(extra), cfg), "open:easy");
  if (last?.avoid !== undefined) {
    const p = open && ss.lowStart ? easy([last.avoid]) : (ladder ? pickLadder : pickOpen)(s, content, strict([last.avoid]), cfg);
    if (p) return p.served.reason === "open:easy" ? serve(r, p, true) : main(p);
  }
  ss.phase = open ? "open" : "middle";
  if (open && ss.lowStart) {
    const p = easy();
    if (p) return serve(r, p, true); // a not-started skill from pickClose starts at the served height
  }
  if (open) {
    const p = ladder ? pickLadder(s, content, strict(), cfg)
      : (ss.comeback ? pickComeback(s, content, strict(), cfg) : null) ?? pickOpen(s, content, strict(), cfg);
    if (p) return main(p);
  } else {
    const p = pickReturn(s, content, strict(), returns(), ss.history.length, cfg);
    if (p) {
      const i = ss.returns.findIndex((q) => q.skill === p.served.skill);
      ss.returns = ss.returns.filter((_, j) => j !== i);
      return serve(r, p);
    }
    const sk = pickSkipCard(s, content, ss, strict(), cfg); // side door or drip
    if (sk) return serve(r, sk);
  }
  const pm = middle(s, content, strict(), cfg);
  if (pm) return main(pm);
  // Nothing fits pickMiddle: the most winnable card, else the sweep. `waiting`: pickMiddle has something to serve, but
  // nothing that fits, or only a skill waiting for its repair return, which `strict` leaves alone. Final review F1: then
  // the sweep leaves waiting skills out too, and only in a true dead end is a waiting return that fits the budget served
  // now (early), so the session does not end after a repair with most of its budget unspent.
  const waiting = middle(s, content, loose(r), cfg) !== null;
  // After-miss guard (2026-11-18): while waiting, straight after a miss, a card not below the missed card's level is
  // not served; the session goes to closing instead (as before F1). A lower card is served as usual.
  const missed = waiting && prev !== undefined && prev.right !== true ? prev.height : null;
  const notBelow = (p: Picked) => missed !== null && p.served.height >= missed;
  const pc = withReason(pickClose(s, content, strict(), cfg), "comfort-correction");
  if (pc) return notBelow(pc) ? guardClosing(r) : serve(r, pc, true);
  const any = pickAny(s, content, waiting ? hold(strict(), ss.returns.map((q) => q.skill)) : strict(), cfg, "fallback:any");
  if (any) return notBelow(any) ? guardClosing(r) : serve(r, any, true);
  if (waiting) {
    const early = pickReturn(s, content, strict(), returns(), Infinity, cfg);
    if (early) {
      ss.returns = ss.returns.filter((q) => q.skill !== early.served.skill);
      return serve(r, early);
    }
    return toClosing(r, false);
  }
  const side = pickSkipCard(s, content, ss, strict(), cfg, true); // a due side door before ending for lack of cards
  if (side) return serve(r, side);
  if (anyLeft(r)) return toClosing(r, false);
  const lr = leastRecent(r, strict(), "fallback:any");
  if (lr) return serve(r, lr, true);
  return leastRecent(r, loose(r), "fallback:any") ? toClosing(r, false) : finish(r, "content-exhausted", lastMiss(ss)); // fix round 1: a recap after a miss
}

/**
 * Serves an open or middle pick; a height-3 pick for a calculation-weak student goes behind a height-2 ramp card.
 * `ladder`: a pickLadder pick (change 4); behind a ramp card it is still the ladder card (the ramp card is not).
 * The same for a `stretch:up` pick (change 5): the mark stays on the pick. Fix round 1: the ramp card in front of a
 * stretch pick is a card at the skill's own level, so it is labelled `open:liked`; the stretch card behind it keeps
 * `stretch:up`. A pick's `extraNew` is kept when a ramp card goes first (a new skill gets no ramp today; kept as a guard).
 */
function serveMain(r: Run, p: Picked, room: number, ladder = false): Next {
  const ss = r.s.session!;
  const stretch = p.served.reason === "stretch:up";
  const ramp = rampBefore(r.s, r.content, p, ss.history.map((h) => h.skill), r.day, room, r.cfg, recentCards(r));
  if (!ramp) return serve(r, p, false, ladder, stretch);
  ss.ramp = p.served;
  ss.ladderCard = ladder ? p.served.card : null;
  ss.stretchCard = stretch ? p.served.card : null;
  if (p.extraNew === true) ss.extraNew = true;
  return serve(r, stretch ? { ...ramp, served: { ...ramp.served, reason: "open:liked" } } : ramp);
}

/** The after-miss guard ends the session early: the engine's choice, so the streak counts (`SessionState.guardClose`). */
function guardClosing(r: Run): Next {
  r.s.session!.guardClose = true;
  return toClosing(r, false);
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
 * (bad day). Change 7: one closing card at most (`sessionEnd.maxExtraClose` is 0): when it is missed the session ends at
 * once on a recap (`EndInfo.recap`). A close card is never served past the daily cap; when the cap blocks it after a
 * miss the session ends `daily-cap`, also on a recap. When only the session's recent cards are left, the least recent
 * is served. `content-exhausted` only when nothing at all is eligible. Change 7: closing picks (and only they) may repeat a card answered right `closing.repeatRightAfterDays` ago.
 */
function closing(r: Run, forced: boolean): Next {
  const { s, content, cfg } = r;
  const ss = s.session!;
  const pending = pendingKind(ss);
  const first = ss.closeServed === 0;
  const lastRight = ss.history.length > 0 && ss.history[ss.history.length - 1].right === true;
  if (lastRight && !(first && forced)) return finish(r, pending);
  if (ss.closeServed > cfg.sessionEnd.maxExtraClose) return finish(r, pending, true); // the closing card was missed
  const capped = ctxOf(r, true, Infinity);
  const win = { repeatRight: true };
  const p = (first ? pickClose(s, content, ctxOf(r, true, ss.budget - ss.spent), cfg, win) : null) ?? pickClose(s, content, capped, cfg, win);
  // F9: a sweep pick keeps close:winnable only when it is an easy card (see closeSweepReason).
  const sweep = (q: Picked | null) => withReason(q, q ? closeSweepReason(s, content, capped, cfg, q.served.height, win) : "fallback:any");
  const any = p ? null : sweep(pickAny(s, content, capped, cfg, "close:winnable", win));
  if (p || any) {
    ss.closeServed += 1;
    return serve(r, (p ?? any)!, true);
  }
  if (lastRight) return finish(r, pending);
  const lr = sweep(leastRecent(r, capped, "close:winnable", win));
  if (lr) {
    ss.closeServed += 1;
    return serve(r, lr, true);
  }
  if (anyLeft(r) || leastRecent(r, loose(r), "fallback:any")) return finish(r, "daily-cap", lastMiss(ss)); // change 7: a recap after a miss
  return finish(r, "content-exhausted", lastMiss(ss)); // fix round 1: a recap after a miss
}

/** Final review F2: `fixedSkills` and the session's `fixed` count (always its length) change together. */
function setFixed(ss: SessionState, skills: string[]): void {
  ss.fixedSkills = skills;
  ss.fixed = skills.length;
}
const fix = (ss: SessionState, skill: string) => { if (!ss.fixedSkills.includes(skill)) setFixed(ss, [...ss.fixedSkills, skill]); };

/** The session's last answered card was a miss (wrong or "I don't know"). */
const lastMiss = (ss: SessionState) => ss.history.filter((h) => h.right !== null).at(-1)?.right === false;

/** A `budget` end may become an offer of "5 more" (never on a recap); everything else closes the session. */
function finish(r: Run, kind: EndKind, recap = false): Next {
  const ss = r.s.session!;
  if (kind === "budget" && !recap && offersExtend(r.s, ss, r.cfg)) {
    ss.served = null;
    return { kind: "offer-extend" };
  }
  return closeSession(r, kind, recap);
}

function closeSession(r: Run, kind: EndKind, recap = false): Next {
  const ss = r.s.session!;
  const today = r.s.day!;
  const cards = ss.history.length;
  // Spec §8: the minimum day keeps the streak (the answers did that already); a bad-day end and a content-exhausted end
  // with an answered card keep it; a budget end keeps it only when the session really spent its budget.
  // "Really spent": what is left is no more than the largest card that can fail to fit plus the closing reserve, and
  // at least half of the budget was spent (with a budget of 8 the slack alone would keep the streak from 2 effort).
  const spentBudget = ss.spent >= Math.max(ss.budget - (r.cfg.effort.h3 + closeReserve(r.cfg)), ss.budget / 2);
  // The after-miss guard (`guardClose`) is a bad-day-like early end the engine chose: the streak counts, whatever the end
  // kind (budget, or a recap after a missed closing card). A student who leaves, or an interruption, is not that.
  const guarded = ss.guardClose && kind !== "left" && kind !== "interrupted";
  if (guarded || kind === "bad-day" || ((kind === "budget" || kind === "extended-done") && (today.effort >= r.cfg.budget.minimumDay || spentBudget))
    || (kind === "content-exhausted" && cards >= 1)) today.streakKept = true;
  if (kind === "left") ss.fadeEffort = ss.fadeEffort ?? ss.spent; // a fade seen earlier (R4b) is kept
  for (const q of ss.returns) {
    if (r.s.skills[q.skill]) r.s.skills[q.skill] = { ...r.s.skills[q.skill], nextReviewDay: r.day + 1 };
  }
  const right = ss.history.filter((h) => h.right === true).length;
  const end: EndInfo = {
    kind, effort: ss.spent, cards, right, fixed: ss.fixed, streakKept: today.streakKept, recap, fixedSkills: [...ss.fixedSkills],
    rightSkills: [...new Set(ss.history.filter((h) => h.right === true).map((h) => h.skill))],
  };
  const changed = onSessionEndProfile(r, end, ss);
  emit(r, "session_end", { ...end, fadeEffort: ss.fadeEffort });
  if (changed) emit(r, "profile", changed);
  r.s.lastSessionDay = dayOf(ss.startedAt);
  r.s.session = null;
  r.s.lastEnd = end;
  r.s.lastSession = { cards, right }; // change 3: the next session's start reads it
  return { kind: "end", end };
}

// ---------- public API ----------

export function startSession(state: State, content: Content, now: number, cfg: Config = defaultConfig): Step {
  const r = begin(state, content, now, cfg);
  if (r.s.session) {
    closeSession(r, "interrupted");
    rollDay(r); // the new session belongs to today, not to the left-open session's day
  }
  const today = r.s.day!;
  if (dayRoom(r.s, cfg) < cfg.effort.h1) {
    const end: EndInfo = { kind: "daily-cap", effort: 0, cards: 0, right: 0, fixed: 0, streakKept: today.streakKept, recap: false, fixedSkills: [], rightSkills: [] };
    r.s.lastEnd = end;
    return step(r, { kind: "end", end });
  }
  r.s.sessionCount += 1;
  if (r.s.sessionCount > cfg.budget.firstSessions) r.s.ladder = null; // change 4: the ladder is for the first sessions
  const comeback = isComeback(r.s, r.day, cfg);
  const budget = sessionBudget(r.s, comeback, cfg);
  // Change 3: after a near-zero session, start again from easy (the ladder too, when it is still on).
  const lowStart = afterLowRight(r.s, cfg);
  if (lowStart && r.s.ladder !== null) r.s.ladder = { level: 1, rightRun: 0 };
  r.s.session = {
    id: `${r.s.student}:s${r.s.sessionCount}`, startedAt: r.now, budget, spent: 0, h3Spent: 0, served: null,
    history: [], repair: null, returns: [], newSkills: 0, badMoments: [], extended: false, extendLeft: 0,
    phase: "open", comeback, fixed: 0, blockedSections: [], dripDone: false, moments: [], fadeEffort: null, closeServed: 0,
    sideDoor: null, confident: [], leftSkills: [], ladderCard: null, ladderFull: 0, stretchCard: null, extraNew: false, lastSkip: null,
    startProfile: pickNumbers(r.s.profile), ramp: null, tailCard: null, badDay: false, guardClose: false, slowBefore: [], servedCards: [],
    missRun: 0, guesses: 0, lowStart, fixedSkills: [], extendEffortLeft: 0,
  };
  emit(r, "session_start", { budget, comeback, sessionCount: r.s.sessionCount, lowStart });
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
  // Rule 1: a fast wrong answer is a guess: it costs and misses like a wrong answer but is no evidence about the skill.
  const guess = isGuess(r.s, sv.height, right, input.choice, input.ms, cfg);
  const slow = !isGuess(r.s, sv.height, right, input.choice, input.ms, cfg) && usual !== null && input.ms > cfg.badDay.slowFactor * usual;
  const cost = sv.effort + (picked === null ? cfg.effort.dontKnow : right ? 0 : cfg.effort.wrong);

  const today = r.s.day!;
  today.effort += cost;
  if (today.effort >= cfg.budget.minimumDay) today.streakKept = true;
  r.s.answered += 1;
  // Change 4: only an answer on a pickLadder card moves the ladder.
  const fromLadder = r.s.ladder !== null && r.s.session!.ladderCard === sv.card;
  // Change 5: an answer on the stretch card itself (not the ramp card in front of it).
  const fromStretch = sv.reason === "stretch:up" && r.s.session!.stretchCard === sv.card;
  let steppedDown = false;
  let belowRecord = false;
  const def = content.skills[sv.skill];
  if (def && !guess) {
    // F3: a new skill starts at the height actually served (below it, a right answer would never schedule a review).
    const rec0 = r.s.skills[sv.skill] ?? newSkillRec(sv.height);
    const out = recordAttempt(rec0, def, { day: r.day, seq: r.s.answered, height: sv.height, right, ms: input.ms, card: sv.card }, r.s.profile.memory, cfg);
    // A drip is a height-1 card, the lowest height, so a wrong drip can never step its skill down.
    // Change 4: a right ladder answer above the skill's record sets the record to that level (the ladder is the
    // step-up rule in these sessions), with a new step window. A right answer below the record leaves it.
    // Fix round 1: a due skill answered right on a ladder card below its record gets its next review as recordAttempt
    // would give it at the record (which reschedules only at or above the record), so it is not served again as due.
    belowRecord = fromLadder && sv.height < rec0.height;
    // Change 5: a right stretch answer sets the record the same way (a stretch miss leaves it; the repair follows).
    let rec1 = out.rec;
    if ((fromLadder || fromStretch) && right && sv.height > rec0.height) rec1 = { ...rec1, height: sv.height, windowStartSeq: r.s.answered + 1 };
    else if (belowRecord && right && isDue(rec0, r.day)) {
      const gaps = cfg.reviewGapsDays;
      rec1 = {
        ...rec1, nextReviewDay: r.day + Math.max(1, Math.round(gaps[Math.min(rec0.gapIndex, gaps.length - 1)] * r.s.profile.memory)),
        gapIndex: Math.min(rec0.gapIndex + 1, gaps.length - 1),
      };
    }
    r.s.skills[sv.skill] = rec1;
    steppedDown = out.steppedDown;
  } else if (def && !r.s.skills[sv.skill]) {
    r.s.skills[sv.skill] = newSkillRec(sv.height); // a guess on a new skill: a neutral record at the served level, no attempt
  }
  if (fromLadder && !guess) r.s.ladder = ladderAfterAnswer(r.s.ladder!, right, cfg);
  const reveal = afterSectionAnswer(r.s, content, sv, right, r.day, cfg, guess);
  if (!guess) onAnswerProfile(r, sv, right, input.ms, usual, belowRecord); // a guess moves no profile number (and its ms is not a usual time)

  const ss = r.s.session!;
  if (slow) {
    ss.slowBefore = [...ss.slowBefore, ss.spent];
    ss.fadeEffort = ss.fadeEffort ?? fadeFromSlow(ss, cfg);
  }
  ss.spent += cost;
  if (sv.height === 3) ss.h3Spent += sv.effort;
  // Change 2: the session's last two answers (skips are not answers) both misses on this skill, neither a drip.
  const prev = ss.history.filter((h) => h.right !== null).at(-1);
  const twoMisses = !right && !drip && prev !== undefined && prev.skill === sv.skill && prev.right === false && prev.drip !== true && prev.guess !== true && !guess;
  ss.history.push({ skill: sv.skill, right, ms: input.ms, bad: false, height: sv.height, slow, ...(drip ? { drip: true } : {}), ...(guess ? { guess: true } : {}) });
  if (guess) ss.guesses += 1;
  ss.served = null;
  if (!right) setFixed(ss, ss.fixedSkills.filter((x) => x !== sv.skill)); // final review F2: a later miss unfixes it
  else if (sv.reason === "repair:return") fix(ss, sv.skill);
  // Change 7: the answer is written on the card's latest Seen entry (a closing card may repeat one answered right).
  let si = r.s.seen.length - 1;
  while (si >= 0 && !(r.s.seen[si].card === sv.card && r.s.seen[si].variant === sv.variant)) si--;
  if (si >= 0) r.s.seen = r.s.seen.map((x, j) => (j === si ? { ...x, right } : x));
  if (ss.phase === "extend") {
    ss.extendLeft -= 1;
    ss.extendEffortLeft -= sv.effort; // extend ruling: the card's own effort, not the wrong-answer surcharge
  }
  emit(r, "answer", { card: sv.card, variant: sv.variant, skill: sv.skill, height: sv.height, choice: input.choice, right, ms: input.ms, tag: tag ?? null, guess });
  const moments = recordMoments(r.s, detectMoments(state, r.s, content, sv, right, r.day, cfg), cfg);
  for (const m of moments) emit(r, "moment", { ...m });
  const feedback: Feedback = {
    right, correctIndex: opts.findIndex((o) => o.correct), ...(tag !== undefined ? { tag } : {}), ...(reveal ? { reveal } : {}),
  };

  let avoid: string | undefined;
  let leave: string | undefined;
  if (twoMisses) {
    // Change 2: leave the skill for the session. A bad moment, one step down (none if this answer already stepped it
    // down), its repair and queued return dropped, back tomorrow. In open/middle the next card comes from another section.
    const i = ss.history.length - 1;
    ss.badMoments.push(i);
    ss.history[i].bad = true;
    ss.leftSkills = [...ss.leftSkills.filter((x) => x !== sv.skill), sv.skill];
    // The repair goes when it is the left skill's, or when the missed card was its piece / confidence card (even a
    // neighbour skill's piece: that repair has failed, and there is no second repair). Any other repair runs on.
    const repairCard = sv.reason === "repair:missing-piece" || sv.reason === "repair:confidence";
    if (ss.repair && (ss.repair.skill === sv.skill || repairCard)) ss.repair = null;
    ss.ramp = null;
    ss.returns = ss.returns.filter((q) => q.skill !== sv.skill);
    ss.confident = ss.confident.filter((x) => x !== sv.skill);
    const lrec = r.s.skills[sv.skill];
    // Ruling (fix round 1): a left skill goes down one level, once: not again when recordAttempt just stepped it down.
    if (def && lrec) r.s.skills[sv.skill] = { ...(steppedDown ? lrec : stepDownOnce(lrec, def, r.s.answered + 1)), nextReviewDay: r.day + 1 };
    if (ss.phase === "open" || ss.phase === "middle") leave = sv.section;
  } else if (ss.phase === "open" || ss.phase === "middle") {
    if (ss.repair) {
      if (right && ss.repair.stage === "piece") ss.repair = { ...ss.repair, stage: "confidence" };
      else if (right) {
        fix(ss, ss.repair.skill); // final review F2: the repair ended with the confidence card right
        queueReturn(r, ss.repair.skill, true);
        ss.repair = null;
      } else if (guess) {
        ss.repair = null; // a guessed repair card is no result: the repair ends with no bad moment and no step down
      } else {
        // A failed repair that is not two misses in a row on one skill (a missed confidence card after a right piece,
        // or a missed piece of a neighbour skill): a bad moment, one step down, and away to another liked section.
        // No second repair (base design §5 step 5).
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
  // Change 3: `badDay.missRun` misses in a row (any skills; drips neither count nor break it) are one bad moment at the
  // last of them, once: the run restarts. When this answer is already a bad moment (a failed repair, a left skill), it
  // stays one.
  if (!drip && !guess) {
    ss.missRun = right ? 0 : ss.missRun + 1;
    if (ss.missRun >= cfg.badDay.missRun) {
      ss.missRun = 0;
      // Fix round 1: a run with no right answer yet this session makes the session a bad day at once.
      if (!ss.history.some((h) => h.right === true)) ss.badDay = true;
      const i = ss.history.length - 1;
      if (!ss.history[i].bad) {
        ss.badMoments.push(i);
        ss.history[i].bad = true;
      }
    }
  }
  return step(r, decide(r, { ...(avoid !== undefined ? { avoid } : {}), ...(leave !== undefined ? { leave } : {}) }), feedback, moments);
}

/**
 * "Not now" on the current card (spec §6). A second or later skip of the section first returns
 * `confirm-skip` with its value message and changes nothing; the caller then skips again with
 * `confirmed: true` or answers the card. A skip for any other card is stale.
 * Change 6: reason "too-hard" is about the card, not the section (`applyCardSkip`): never a confirm step, the section
 * is not put away. Any other reason (or none) is a section skip (`applySkip`).
 */
export function skip(
  state: State, content: Content, input: { card: string; reason?: SkipReason; confirmed?: boolean }, now: number, cfg: Config = defaultConfig,
): Step {
  const sv0 = state.session?.served;
  if (!sv0 || sv0.card !== input.card) return stale(state);
  const tooHard = input.reason === "too-hard";
  if (!tooHard && sv0.reason !== "skipped-drip" && (state.sections[sv0.section]?.skipCount ?? 0) >= 1 && input.confirmed !== true) {
    return { state, events: [], moments: [], next: { kind: "confirm-skip", value: valueMessage(state, content, sv0.section, cfg) } };
  }
  const r = begin(state, content, now, cfg);
  const sv = r.s.session!.served!;
  const closingCard = r.s.session!.phase === "closing";
  emit(r, "skip", tooHard ? applyCardSkip(r.s, content, sv, r.day, cfg) : applySkip(r.s, content, sv, input.reason, r.day, cfg));
  return step(r, closingCard ? closeCardSkipped(r) : decide(r, null));
}

/**
 * Change 7, fix round 1: a skipped closing card (a section skip or a card-level "too hard" skip) ends the session: no
 * further closing card, the pending end kind, and a recap when the last answered card was a miss.
 */
function closeCardSkipped(r: Run): Next {
  const ss = r.s.session!;
  return closeSession(r, pendingKind(ss), lastMiss(ss));
}

/** The student took "5 more". Only valid while the offer is pending. */
export function extend(state: State, content: Content, now: number, cfg: Config = defaultConfig): Step {
  if (!state.session || state.session.served !== null) return stale(state);
  const r = begin(state, content, now, cfg);
  const ss = r.s.session!;
  ss.extended = true;
  ss.guardClose = false; // the guard's early end is over: the extension ends by the normal rule
  ss.extendLeft = cfg.budget.extendCards;
  ss.extendEffortLeft = cfg.budget.extendEffort;
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
