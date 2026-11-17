// Skip as "remind me later" (spec §6): the value message, applying a skip, the drip, the side door and
// the section's return. Internal helpers for session.ts, plus `valueMessage` and `setCurrentTopic`.
import { defaultConfig, type Config } from "./config.js";
import { byId } from "./util.js";
import { isSolid, newSkillRec } from "./skill.js";
import { expectedSuccess } from "./estimate.js";
import { avail, firstOf, servable, solidNeighbour } from "./pick.js";
import { stepDownOnce } from "./repair.js";
import { begin, emit, type Run } from "./step.js";
import type {
  Content, EngineEvent, Height, PickCtx, Picked, SectionRec, Served, SessionState, SkipReason, State, ValueMessage,
} from "./types.js";

/** A section with no history yet. */
export function newSectionRec(): SectionRec {
  return {
    skipCount: 0, remindDay: null, lastReason: null, dripStopped: false, liking: 0, returned: false, skipTotal: 0, lastSkipSeq: null,
    skippedLevel: null,
  };
}

function sectionRec(state: State, section: string): SectionRec {
  return state.sections[section] ?? newSectionRec();
}

/**
 * The section's share of its unit's weight, rounded to a whole percent, and up to `skip.valueTopSkills` of
 * its skills that have cards, heaviest first (ties by id), each with whether the student is solid on it.
 */
export function valueMessage(state: State, content: Content, section: string, cfg: Config = defaultConfig): ValueMessage {
  const sec = content.sections[section];
  if (!sec) return { section, sharePct: 0, topSkills: [] };
  const unit = Object.values(content.sections).filter((x) => x.unit === sec.unit).reduce((a, x) => a + x.weight, 0);
  const topSkills = sec.skills.map((id) => content.skills[id])
    .filter((d) => !!d && avail(d).length > 0)
    .sort((x, y) => y.weight - x.weight || byId(x.id, y.id))
    .slice(0, cfg.skip.valueTopSkills)
    .map((d) => ({ skill: d.id, solid: !!state.skills[d.id] && isSolid(state.skills[d.id], d, cfg) }));
  return { section, sharePct: unit > 0 ? Math.round((100 * sec.weight) / unit) : 0, topSkills };
}

/** The "teaching now" topic, from the class or chosen by the student; null clears it. */
export function setCurrentTopic(state: State, topic: string | null, source: "class" | "student"): State {
  return { ...state, currentTopic: topic === null ? null : { id: topic, source } };
}

/**
 * F10 (spec §6): the one-tap reason, given on the toast after a skip. Sets the reason of the section's most recent
 * skip (`lastReason`) and appends one `skip_reason` event; the remind day never changes. A section never skipped: no
 * change, no event.
 * Change 6: "too-hard" for the session's last section-level skip (`session.lastSkip`, this section, session still open)
 * undoes that section skip instead: the section's record goes back exactly to what it was before (none, if it had none),
 * the section is no longer blocked this session, and the card-level rule applies to the skipped card's skill. The event
 * then has `scope: "card"`, `skill`, `fromLevel`, `toLevel`. A repair or queued returns the section skip dropped for
 * other skills of the section are not restored.
 */
export function setSkipReason(
  state: State, content: Content, section: string, reason: SkipReason, now: number, cfg: Config = defaultConfig,
): { state: State; events: EngineEvent[] } {
  const last = state.session?.lastSkip;
  if (reason === "too-hard" && last && last.section === section) {
    const r = begin(state, content, now, cfg);
    const ss = r.s.session!;
    const sections = { ...r.s.sections };
    if (last.before === null) delete sections[section];
    else sections[section] = { ...last.before };
    r.s.sections = sections;
    ss.blockedSections = ss.blockedSections.filter((x) => x !== section);
    ss.lastSkip = null;
    const out = cardLevelRule(r.s, content, last.skill, last.level, r.day, cfg);
    emit(r, "skip_reason", { section, reason, scope: "card", ...out });
    return { state: r.s, events: r.events };
  }
  if ((state.sections[section]?.skipTotal ?? 0) === 0) return { state, events: [] };
  const r = begin(state, content, now, cfg);
  r.s.sections = { ...r.s.sections, [section]: { ...r.s.sections[section], lastReason: reason } };
  emit(r, "skip_reason", { section, reason });
  return { state: r.s, events: r.events };
}

/** Skipped and not yet back through the side door. */
function awaiting(rec: SectionRec | undefined): rec is SectionRec {
  return !!rec && rec.skipCount > 0 && !rec.returned;
}

/**
 * Time for the side door: the remind day has come, or (not learned yet) the class is teaching its topic now
 * and at least `skip.classReturnMinDays` have passed since the skip. The skip day is recovered from the
 * remind day: `remindDay − skipRemindDays[min(skipCount − 1, last)]`.
 */
function sideDoorDue(state: State, content: Content, section: string, day: number, cfg: Config): boolean {
  const rec = state.sections[section];
  if (!awaiting(rec)) return false;
  if (rec.remindDay === null || rec.remindDay <= day) return true;
  const t = state.currentTopic;
  if (rec.lastReason !== "not-learned" || t === null || t.source !== "class" || t.id !== content.sections[section]?.topic) return false;
  const gaps = cfg.skipRemindDays;
  const skipDay = rec.remindDay - gaps[Math.min(rec.skipCount - 1, gaps.length - 1)];
  return day >= skipDay + cfg.skip.classReturnMinDays;
}

/**
 * The skip's cap has come: at least the last (largest) remind gap has passed since the skip day (recovered as in
 * `sideDoorDue`). Such a section may take a side door even when the session already had one, so it never comes back
 * later than the cap (spec §6, §13: "every one returns by the cap").
 */
function atCap(state: State, section: string, day: number, cfg: Config): boolean {
  const rec = state.sections[section];
  if (!awaiting(rec)) return false;
  if (rec.remindDay === null) return true;
  const gaps = cfg.skipRemindDays;
  const skipDay = rec.remindDay - gaps[Math.min(rec.skipCount - 1, gaps.length - 1)];
  return day >= skipDay + Math.max(...gaps);
}

/** Skipped sections in content, not skipped this session, matching `keep`; earliest remind day first, then id. */
function skippedSections(state: State, content: Content, ctx: PickCtx, keep: (s: string) => boolean): string[] {
  const rd = (s: string) => state.sections[s].remindDay ?? ctx.day;
  return Object.keys(state.sections)
    .filter((s) => content.sections[s] && awaiting(state.sections[s]) && !ctx.blockedSections.includes(s) && keep(s))
    .sort((x, y) => rd(x) - rd(y) || byId(x, y));
}

/**
 * Change 6: the levels a side door may serve: below the level of the card whose skip put the section away, never 3;
 * level 1 when that was a level-1 card or is unknown (a skip from before change 6).
 */
function sideDoorLevels(rec: SectionRec): Height[] {
  const below = ([1, 2] as Height[]).filter((h) => h < (rec.skippedLevel ?? 1));
  return below.length > 0 ? below : [1];
}

/**
 * Side door: one section whose time has come; its card at the lowest allowed height (`sideDoorLevels`), preferring a
 * skill with a solid `requires`/`helps` neighbour, then the highest expectedSuccess (then id). Nothing above the allowed
 * levels (change 6): a section with no card there rejoins silently instead (`rejoinSilently`).
 */
function pickSideDoor(state: State, content: Content, ctx: PickCtx, cfg: Config, capOnly = false): Picked | null {
  const due = (s: string) => sideDoorDue(state, content, s, ctx.day, cfg) && (!capOnly || atCap(state, s, ctx.day, cfg));
  for (const sec of skippedSections(state, content, ctx, due)) {
    const allowed = sideDoorLevels(state.sections[sec]);
    const cs = content.sections[sec].skills.map((id) => content.skills[id]).filter((d) => !!d)
      .flatMap((def) => avail(def).filter((h) => allowed.includes(h)).map((height) => ({
        def, height, nb: solidNeighbour(state, content, def, cfg) !== undefined ? 0 : 1, es: expectedSuccess(state, def.id, height, cfg),
      })))
      .sort((x, y) => x.height - y.height || x.nb - y.nb || y.es - x.es || byId(x.def.id, y.def.id));
    const p = firstOf(state, content, cs, () => "side-door", ctx, cfg, { unblock: sec });
    if (p) return p;
  }
  return null;
}

/** Drip: a height-1 card from a skipped section still waiting for its remind day, drips not stopped. */
function pickDrip(state: State, content: Content, ctx: PickCtx, cfg: Config): Picked | null {
  const keep = (s: string) => !state.sections[s].dripStopped && !sideDoorDue(state, content, s, ctx.day, cfg);
  for (const sec of skippedSections(state, content, ctx, keep)) {
    const cs = content.sections[sec].skills.map((id) => content.skills[id]).filter((d) => !!d && d.cards[1].length > 0)
      .map((def) => ({ def, height: 1 as const, es: expectedSuccess(state, def.id, 1, cfg) }))
      .sort((x, y) => y.es - x.es || byId(x.def.id, y.def.id));
    const p = firstOf(state, content, cs, () => "skipped-drip", ctx, cfg, { unblock: sec });
    if (p) return p;
  }
  return null;
}

/**
 * Change 6: a skipped section whose time has come (`sideDoorDue`: remind day, class timing; the cap is past the remind
 * day) but with NO card at all at the side door's allowed levels (a content gap) comes back without a card: `bringBack`,
 * one `section_rejoined` event. Fix round 1: when such cards exist but none is eligible today (seen within
 * `noRepeatDays`, the session's recent cards), nothing happens: the section stays skipped and due, and its side-door
 * card is served in the first session where one is eligible. Sections skipped this session (`blocked`) are left out.
 * Once per skip cycle (the section is then returned); in section-id order.
 */
export function rejoinSilently(r: Run, blocked: string[]): void {
  const { s, content, cfg, day } = r;
  const ids = Object.keys(s.sections).filter((sec) => content.sections[sec] && awaiting(s.sections[sec]) && !blocked.includes(sec)
    && sideDoorDue(s, content, sec, day, cfg)).sort(byId);
  for (const sec of ids) {
    const allowed = sideDoorLevels(s.sections[sec]);
    const has = content.sections[sec].skills.some((id) => {
      const def = content.skills[id];
      return !!def && allowed.some((h) => def.cards[h].length > 0);
    });
    if (has) continue;
    bringBack(s, content, sec, day, cfg);
    emit(r, "section_rejoined", { section: sec });
  }
}

/**
 * A middle-of-session card for a skipped section: the side door (one section per session, plus any section whose
 * cap has come: `atCap`), else the
 * drip (once per session, every `dripEverySessions`-th session, after `skip.dripAfterCards` answered cards).
 * `fallback`: only the side door, at any point (used before ending for lack of cards).
 */
export function pickSkipCard(state: State, content: Content, ss: SessionState, ctx: PickCtx, cfg: Config, fallback = false): Picked | null {
  const side = pickSideDoor(state, content, ctx, cfg, ss.sideDoor !== null);
  if (side || fallback) return side;
  const dripTime = !ss.dripDone && state.sessionCount % cfg.session.dripEverySessions === 0
    && ss.history.length >= cfg.skip.dripAfterCards;
  return dripTime ? pickDrip(state, content, ctx, cfg) : null;
}

/**
 * Change 6, the card-level "too hard" rule for `skill` (a card at `level` was too hard), on the run's own copy `s`: the
 * skill's record goes down one level that has cards (`stepDownOnce`, step window restarted); at its lowest level it
 * rests instead (`nextReviewDay = max(its own, day + skip.tooHardRestDays)`). A skill with no record gets one at the lowest level with
 * cards below `level`, or at `level`, resting, when there is none. The skill is left for the session (`leftSkills`); its
 * repair, waiting ramp card and queued return are dropped. No section changes. Returns the event fields.
 */
function cardLevelRule(s: State, content: Content, skill: string, level: Height, day: number, cfg: Config):
  { skill: string; fromLevel: Height; toLevel: Height } {
  const ss = s.session!;
  const def = content.skills[skill];
  const rec = s.skills[skill];
  const fromLevel = rec?.height ?? level;
  let toLevel = fromLevel;
  const rest = day + cfg.skip.tooHardRestDays;
  if (def && rec) {
    const down = stepDownOnce(rec, def, s.answered + 1);
    if (down.height < rec.height) toLevel = down.height;
    // Fix round 1: resting never brings a later review date earlier.
    s.skills[skill] = down.height < rec.height ? down : { ...rec, nextReviewDay: Math.max(rec.nextReviewDay ?? 0, rest) };
  } else if (def) {
    const low = avail(def).find((h) => h < level);
    toLevel = low ?? level;
    s.skills[skill] = low !== undefined ? newSkillRec(low) : { ...newSkillRec(level), nextReviewDay: rest };
  }
  ss.leftSkills = [...ss.leftSkills.filter((x) => x !== skill), skill];
  if (ss.repair && ss.repair.skill === skill) ss.repair = null;
  if (ss.ramp && ss.ramp.skill === skill) ss.ramp = null;
  ss.returns = ss.returns.filter((q) => q.skill !== skill);
  ss.confident = ss.confident.filter((x) => x !== skill);
  return { skill, fromLevel, toLevel };
}

/**
 * Change 6: "Not now" with reason "too-hard" on the served card `sv` (any card: drip and side door included), on the
 * run's own copy `s`: `cardLevelRule` for its skill. The section is not touched and not blocked; costs no effort; no
 * history entry; the card stays in `servedCards` (a skipped close card ends the session: see `skip` in session.ts).
 * Clears `lastSkip`. Returns event data (`scope: "card"`).
 */
export function applyCardSkip(s: State, content: Content, sv: Served, day: number, cfg: Config): Record<string, unknown> {
  const ss = s.session!;
  const out = cardLevelRule(s, content, sv.skill, sv.height, day, cfg);
  ss.lastSkip = null;
  ss.served = null;
  const rec = s.sections[sv.section];
  return {
    card: sv.card, variant: sv.variant, skill: sv.skill, section: sv.section, served: sv.reason, drip: sv.reason === "skipped-drip",
    reason: "too-hard", scope: "card", fromLevel: out.fromLevel, toLevel: out.toLevel,
    skipCount: rec?.skipCount ?? 0, remindDay: rec?.remindDay ?? null,
  };
}

/**
 * Applies "Not now" (no reason, "later" or "not-learned") to the served card `sv` on the run's own copy `s`: a
 * section-level skip. A drip card only stops the drip.
 * Otherwise (side-door cards included) the section's count and remind day move on, `skippedLevel` is the card's level,
 * it leaves this session, loses liking, and any repair or queued return for its skills is dropped. Costs no effort.
 * `session.lastSkip` remembers the section's record from before (for `setSkipReason(…, "too-hard")`). Returns event
 * data (`scope: "section"`).
 */
export function applySkip(s: State, content: Content, sv: Served, reason: SkipReason | undefined, day: number, cfg: Config): Record<string, unknown> {
  const ss = s.session!;
  const sec = sv.section;
  const rec = sectionRec(s, sec);
  const drip = sv.reason === "skipped-drip";
  const old = s.sections[sec];
  ss.lastSkip = { section: sec, skill: sv.skill, level: sv.height, before: old ? { ...old } : null, card: sv.card };
  if (drip) {
    s.sections = { ...s.sections, [sec]: { ...rec, dripStopped: true } };
  } else {
    const n = rec.skipCount + 1;
    const gaps = cfg.skipRemindDays;
    s.sections = {
      ...s.sections,
      [sec]: {
        ...rec, skipCount: n, skipTotal: rec.skipTotal + 1, lastSkipSeq: s.answered, remindDay: day + gaps[Math.min(n - 1, gaps.length - 1)], lastReason: reason ?? "later",
        dripStopped: false, returned: false, liking: Math.max(-cfg.liking.clamp, rec.liking - cfg.skip.likingPenalty),
        skippedLevel: sv.height,
      },
    };
    const inSec = (skill: string) => content.skills[skill]?.section === sec;
    if (ss.repair && inSec(ss.repair.skill)) ss.repair = null;
    ss.returns = ss.returns.filter((q) => !inSec(q.skill));
  }
  if (!ss.blockedSections.includes(sec)) ss.blockedSections = [...ss.blockedSections, sec];
  ss.served = null;
  const out = s.sections[sec];
  return {
    card: sv.card, variant: sv.variant, skill: sv.skill, section: sec, served: sv.reason, drip,
    reason: out.lastReason, scope: "section", skipCount: out.skipCount, remindDay: out.remindDay,
  };
}

/**
 * A skipped section comes back (through the side door, or silently: change 6): returned, no remind day, its started
 * skills at their lowest height with no height 3 for `returning.noFullDays`.
 */
function bringBack(s: State, content: Content, sec: string, day: number, cfg: Config): void {
  s.sections = { ...s.sections, [sec]: { ...s.sections[sec], returned: true, remindDay: null } };
  for (const id of content.sections[sec]?.skills ?? []) {
    const def = content.skills[id];
    const rec = s.skills[id];
    if (!def || !rec) continue;
    const low = servable(def, 1) ?? rec.height;
    s.skills[id] = { ...rec, height: low, noFullUntilDay: day + cfg.returning.noFullDays, windowStartSeq: low === rec.height ? rec.windowStartSeq : s.answered + 1 };
  }
}

/**
 * After an answer on `sv` (the run's own copy `s`): a side-door card brings its section back (right or
 * wrong) at the lowest height with no height 3 for `returning.noFullDays`; a right answer on a section that
 * has returned clears its skip count. Returns the reveal for a side door answered right.
 */
export function afterSectionAnswer(s: State, content: Content, sv: Served, right: boolean, day: number, cfg: Config): { section: string } | undefined {
  const sec = sv.section;
  let reveal: { section: string } | undefined;
  if (sv.reason === "side-door" && awaiting(s.sections[sec])) {
    bringBack(s, content, sec, day, cfg);
    if (right) reveal = { section: sec };
  }
  const rec = s.sections[sec];
  if (right && rec && rec.returned && rec.skipCount > 0) s.sections = { ...s.sections, [sec]: { ...rec, skipCount: 0 } };
  return reveal;
}
