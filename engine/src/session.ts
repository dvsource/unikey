import { defaultConfig, type Config } from "./config.js";
import { dayOf } from "./time.js";
import { effectiveNow, knownSkills } from "./state.js";
import { isSolid, newSkillRec, recordAttempt, startHeight } from "./skill.js";
import { expectedSuccess, usualMs } from "./estimate.js";
import {
  effortOf, eligibleCard, isBlocked, likedSections, pickClose, pickMiddle, pickOpen, servable,
  type PickCtx, type Picked, type Served,
} from "./pick.js";
import { nextRepairCard, stepDownOnce } from "./repair.js";
import { isBadDay, isComeback, offersExtend, pendingKind, sessionBudget } from "./budget.js";
import type {
  Choice, Content, EndInfo, EndKind, EngineEvent, Feedback, Next, SessionState, State, Step,
} from "./types.js";

/** One public call in progress: a private copy of the state, the clock, and the events emitted so far. */
type Run = { s: State; content: Content; cfg: Config; now: number; day: number; events: EngineEvent[] };
/** The answer just given, for deciding what comes next. `avoid`: a section to leave after a failed repair. */
type Last = { right: boolean; winnable: boolean; avoid?: string } | null;

const byId = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);

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

function step(r: Run, next: Next, feedback?: Feedback): Step {
  return feedback ? { state: r.s, events: r.events, feedback, moments: [], next } : { state: r.s, events: r.events, moments: [], next };
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

// ---------- profile hooks (Task 7 extends these) ----------

/** Per answer. Here: keep the last `answers.msKept` answer times per height. */
function onAnswerProfile(s: State, sv: Served, _right: boolean, ms: number, cfg: Config): State {
  const by = s.profile.msByHeight;
  return { ...s, profile: { ...s.profile, msByHeight: { ...by, [sv.height]: [...(by[sv.height] ?? []), ms].slice(-cfg.answers.msKept) } } };
}

/** Per session end. Here: nothing (comfort, memory, stamina, liking and h3Share are Task 7). */
function onSessionEndProfile(s: State, _end: EndInfo, _session: SessionState, _cfg: Config): State {
  return s;
}

// ---------- picking ----------

/**
 * `strict`: only cards within `remaining`, and skills waiting for a repair return are left alone ("then leave
 * the skill"). Loose contexts (strict false) answer "is there anything at all to serve?".
 */
function ctxOf(r: Run, strict: boolean, remaining: number, extraBlocked: string[] = []): PickCtx {
  const ss = r.s.session!;
  const done = ss.history.filter((h) => h.right !== null);
  return {
    day: r.day, remaining, runningRight: done.filter((h) => h.right).length, runningTotal: done.length,
    newSkillsThisSession: ss.newSkills, lastSkills: ss.history.map((h) => h.skill),
    blockedSections: [...ss.blockedSections, ...extraBlocked], h3Spent: ss.h3Spent, spent: ss.spent, strictBudget: strict,
    excludeSkills: strict ? ss.returns.map((q) => q.skill) : [],
  };
}

function runTooLong(r: Run, skill: string): boolean {
  const n = r.cfg.session.maxSameSkillRun;
  const tail = r.s.session!.history.slice(-n);
  return tail.length === n && tail.every((h) => h.skill === skill);
}

function withReason(p: Picked | null, reason: Served["reason"]): Picked | null {
  return p && { ...p, served: { ...p.served, reason } };
}

/** Comeback open: height-1 cards of started skills in sections where some skill is solid (solid skills first). */
function pickComeback(r: Run, room: number): Picked | null {
  const { s, content, cfg } = r;
  const solid = (id: string) => isSolid(s.skills[id], content.skills[id], cfg);
  const secs = new Set(knownSkills(s, content).filter(solid).map((id) => content.skills[id].section));
  const order = [...likedSections(s, content, cfg).filter((x) => secs.has(x)), ...[...secs].sort(byId)];
  if (effortOf(1, cfg) > room) return null;
  for (const sec of [...new Set(order)]) {
    if (!content.sections[sec] || isBlocked(s, sec, r.day, s.session!.blockedSections)) continue;
    const ids = content.sections[sec].skills
      .filter((id) => id in s.skills && content.skills[id]?.cards[1].length)
      .map((id) => ({ id, solid: solid(id), es: expectedSuccess(s, id, 1, cfg) }))
      .sort((x, y) => Number(y.solid) - Number(x.solid) || y.es - x.es || byId(x.id, y.id));
    for (const { id } of ids) {
      if (runTooLong(r, id)) continue;
      const e = eligibleCard(s, content, id, 1, r.day, s.rng, {}, cfg);
      if (e) return { served: { card: e.card, variant: e.variant, skill: id, section: sec, height: 1, reason: "comeback:solid", effort: effortOf(1, cfg) }, rng: e.rng };
    }
  }
  return null;
}

/** A queued return whose time has come, at the skill's current height, as a variant not seen lately. */
function pickReturn(r: Run, room: number): Picked | null {
  const { s, content, cfg } = r;
  const ss = s.session!;
  for (let i = 0; i < ss.returns.length; i++) {
    const q = ss.returns[i];
    const def = content.skills[q.skill];
    const rec = s.skills[q.skill];
    if (ss.history.length < q.afterCard || !def || !rec) continue;
    if (isBlocked(s, def.section, r.day, ss.blockedSections) || runTooLong(r, q.skill)) continue;
    const h = servable(def, rec.height);
    if (h === null || effortOf(h, cfg) > room) continue;
    const e = eligibleCard(s, content, q.skill, h, r.day, s.rng, {}, cfg);
    if (!e) continue;
    ss.returns = ss.returns.filter((_, j) => j !== i);
    return { served: { card: e.card, variant: e.variant, skill: q.skill, section: def.section, height: h, reason: "repair:return", effort: effortOf(h, cfg) }, rng: e.rng };
  }
  return null;
}

function serve(r: Run, p: Picked): Next {
  const ss = r.s.session!;
  r.s.rng = p.rng;
  if (!(p.served.skill in r.s.skills)) ss.newSkills += 1;
  ss.served = p.served;
  r.s.seen = [...r.s.seen.filter((x) => r.day - x.day < r.cfg.noRepeatDays), { card: p.served.card, variant: p.served.variant, day: r.day }];
  emit(r, "card_served", { ...p.served });
  return { kind: "card", card: p.served };
}

// ---------- the loop ----------

function queueReturn(r: Run, skill: string): void {
  const ss = r.s.session!;
  ss.returns = [...ss.returns, { skill, afterCard: ss.history.length + r.cfg.session.returnAfterCards }];
}

function decide(r: Run, last: Last): Next {
  const ss = r.s.session!;
  if (ss.phase === "extend") {
    if (ss.extendLeft > 0) {
      const ctx = ctxOf(r, true, r.cfg.budget.dailyCap - r.s.day!.effort);
      const p = withReason(pickOpen(r.s, r.content, ctx, r.cfg) ?? pickClose(r.s, r.content, ctx, r.cfg), "extend:liked");
      if (p) return serve(r, p);
      return finish(r, last?.right ? "extended-done" : "content-exhausted");
    }
    return toClosing(r, last, false);
  }
  if (ss.phase === "closing") return closing(r, last, false);
  if (isBadDay(ss, r.cfg)) {
    ss.fadeEffort = ss.spent;
    return toClosing(r, last, true);
  }
  return normal(r, last);
}

function normal(r: Run, last: Last): Next {
  const { s, content, cfg } = r;
  const ss = s.session!;
  const room = ss.budget - ss.spent - cfg.effort.h1; // keep one height-1 card for the close
  const strict = (extra: string[] = []) => ctxOf(r, true, room, extra);

  while (ss.repair) {
    const rc = nextRepairCard(s, content, ss.repair, r.day, cfg);
    if (rc) {
      if (rc.served.effort <= room) return serve(r, rc);
      return toClosing(r, last, false);
    }
    if (ss.repair.stage === "piece") ss.repair = { ...ss.repair, stage: "confidence" };
    else {
      queueReturn(r, ss.repair.skill);
      ss.repair = null;
    }
  }
  if (last?.avoid !== undefined) {
    const p = pickOpen(s, content, strict([last.avoid]), cfg);
    if (p) return serve(r, p);
  }
  const open = ss.history.length < cfg.session.openCards;
  ss.phase = open ? "open" : "middle";
  if (open) {
    const p = (ss.comeback ? pickComeback(r, room) : null) ?? pickOpen(s, content, strict(), cfg);
    if (p) return serve(r, p);
  } else {
    const p = pickReturn(r, room);
    if (p) return serve(r, p);
  }
  const pm = pickMiddle(s, content, strict(), cfg);
  if (pm) return serve(r, pm);
  const loose = ctxOf(r, false, Infinity);
  if (pickMiddle(s, content, loose, cfg)) return toClosing(r, last, false); // something to serve, nothing that fits
  // pickMiddle had nothing (comfort mode found nothing at comfort): the most winnable card instead
  const pc = withReason(pickClose(s, content, strict(), cfg), "comfort-correction");
  if (pc) return serve(r, pc);
  if (pickClose(s, content, loose, cfg) || pickOpen(s, content, loose, cfg)) return toClosing(r, last, false);
  return finish(r, "content-exhausted");
}

function toClosing(r: Run, last: Last, forced: boolean): Next {
  const ss = r.s.session!;
  ss.phase = "closing";
  ss.closeServed = 0;
  ss.repair = null;
  return closing(r, last, forced);
}

/**
 * One close card, then the end. Skipped when the last answer was right on a winnable card (and today already
 * reached the minimum day), or when "5 more" ended right; `forced` (bad day) always serves it. A wrong close
 * answer gets another close card, at most `sessionEnd.maxExtraClose` extra.
 */
function closing(r: Run, last: Last, forced: boolean): Next {
  const { s, content, cfg } = r;
  const ss = s.session!;
  const pending = pendingKind(ss);
  const loose = () => pickClose(s, content, ctxOf(r, false, Infinity), cfg);
  if (ss.closeServed === 0) {
    const won = last !== null && last.right && (pending === "extended-done" || (last.winnable && s.day!.effort >= cfg.budget.minimumDay));
    if (won && !forced) return finish(r, pending);
    const p = pickClose(s, content, ctxOf(r, true, ss.budget - ss.spent), cfg) ?? loose();
    if (p) {
      ss.closeServed = 1;
      return serve(r, p);
    }
    return finish(r, last?.right ? pending : "content-exhausted");
  }
  if (last?.right || ss.closeServed > cfg.sessionEnd.maxExtraClose) return finish(r, pending);
  const p = loose();
  if (p) {
    ss.closeServed += 1;
    return serve(r, p);
  }
  return finish(r, "content-exhausted");
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
  if (kind === "bad-day" || (kind === "content-exhausted" && cards >= 1)) today.streakKept = true;
  if (kind === "left") ss.fadeEffort = ss.spent;
  for (const q of ss.returns) {
    if (r.s.skills[q.skill]) r.s.skills[q.skill] = { ...r.s.skills[q.skill], nextReviewDay: r.day + 1 };
  }
  const end: EndInfo = {
    kind, effort: ss.spent, cards, right: ss.history.filter((h) => h.right === true).length, fixed: ss.fixed,
    streakKept: today.streakKept,
  };
  r.s = onSessionEndProfile(r.s, end, ss, r.cfg);
  emit(r, "session_end", { ...end });
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
  if (today.effort >= cfg.budget.dailyCap) {
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
  };
  emit(r, "session_start", { budget, comeback, sessionCount: r.s.sessionCount });
  return step(r, decide(r, null));
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
  const winnable = expectedSuccess(r.s, sv.skill, sv.height, cfg) >= cfg.session.winnable;
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
    r.s.skills[sv.skill] = out.rec;
    steppedDown = out.steppedDown;
  }
  r.s = onAnswerProfile(r.s, sv, right, input.ms, cfg);

  const ss = r.s.session!;
  ss.spent += cost;
  if (sv.height === 3) ss.h3Spent += sv.effort;
  ss.history.push({ skill: sv.skill, right, ms: input.ms, bad: false, height: sv.height, slow });
  ss.served = null;
  if (sv.reason === "repair:return" && right) ss.fixed += 1;
  if (ss.phase === "extend") ss.extendLeft -= 1;
  emit(r, "answer", { card: sv.card, variant: sv.variant, skill: sv.skill, height: sv.height, choice: input.choice, right, ms: input.ms, tag: tag ?? null });
  const feedback: Feedback = { right, correctIndex: opts.findIndex((o) => o.correct), ...(tag !== undefined ? { tag } : {}) };

  let avoid: string | undefined;
  if (ss.phase === "open" || ss.phase === "middle") {
    if (ss.repair) {
      if (right && ss.repair.stage === "piece") ss.repair = { ...ss.repair, stage: "confidence" };
      else if (right) {
        queueReturn(r, ss.repair.skill);
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
    } else if (!right) {
      ss.repair = {
        skill: sv.skill, failedHeight: sv.height, ...(tag !== undefined ? { tag } : {}),
        ...(card.noteRef !== undefined ? { note: card.noteRef } : {}), stage: "piece",
      };
    }
  }
  return step(r, decide(r, { right, winnable, ...(avoid !== undefined ? { avoid } : {}) }), feedback);
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
 * Closes the open session: `budget` when "5 more" is declined, `left` when the student closed it
 * (`opts.left`), otherwise `interrupted`.
 */
export function endSession(
  state: State, content: Content, now: number, cfg: Config = defaultConfig, opts: { left?: boolean } = {},
): Step {
  if (!state.session) return stale(state);
  const r = begin(state, content, now, cfg);
  const ss = r.s.session!;
  const kind: EndKind = ss.served === null ? "budget" : opts.left ? "left" : "interrupted";
  return step(r, closeSession(r, kind));
}
