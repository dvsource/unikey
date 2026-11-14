// Skip as "remind me later" (spec §6): the value message, applying a skip, the drip, the side door and
// the section's return. Internal helpers for session.ts, plus `valueMessage` and `setCurrentTopic`.
import { defaultConfig, type Config } from "./config.js";
import { byId } from "./util.js";
import { isSolid } from "./skill.js";
import { expectedSuccess } from "./estimate.js";
import { avail, firstOf, servable, solidNeighbour } from "./pick.js";
import type { Content, PickCtx, Picked, SectionRec, Served, SessionState, SkipReason, State, ValueMessage } from "./types.js";

function sectionRec(state: State, section: string): SectionRec {
  return state.sections[section]
    ?? { skipCount: 0, remindDay: null, lastReason: null, dripStopped: false, liking: 0, returned: false };
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

/** Skipped sections in content, not skipped this session, matching `keep`; earliest remind day first, then id. */
function skippedSections(state: State, content: Content, ctx: PickCtx, keep: (s: string) => boolean): string[] {
  const rd = (s: string) => state.sections[s].remindDay ?? ctx.day;
  return Object.keys(state.sections)
    .filter((s) => content.sections[s] && awaiting(state.sections[s]) && !ctx.blockedSections.includes(s) && keep(s))
    .sort((x, y) => rd(x) - rd(y) || byId(x, y));
}

/**
 * Side door: one section whose time has come; its card at the lowest available height, preferring a skill
 * with a solid `requires`/`helps` neighbour, then the highest expectedSuccess (then id). Higher heights
 * are tried only when nothing lower is eligible, so the section never fails to come back.
 */
function pickSideDoor(state: State, content: Content, ctx: PickCtx, cfg: Config): Picked | null {
  for (const sec of skippedSections(state, content, ctx, (s) => sideDoorDue(state, content, s, ctx.day, cfg))) {
    const cs = content.sections[sec].skills.map((id) => content.skills[id]).filter((d) => !!d)
      .flatMap((def) => avail(def).map((height) => ({
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
 * A middle-of-session card for a skipped section: the side door (at most one section per session), else the
 * drip (once per session, every `dripEverySessions`-th session, after `skip.dripAfterCards` answered cards).
 * `fallback`: only the side door, at any point (used before ending for lack of cards).
 */
export function pickSkipCard(state: State, content: Content, ss: SessionState, ctx: PickCtx, cfg: Config, fallback = false): Picked | null {
  const side = ss.sideDoor === null ? pickSideDoor(state, content, ctx, cfg) : null;
  if (side || fallback) return side;
  const dripTime = !ss.dripDone && state.sessionCount % cfg.session.dripEverySessions === 0
    && ss.history.length >= cfg.skip.dripAfterCards;
  return dripTime ? pickDrip(state, content, ctx, cfg) : null;
}

/**
 * Applies "Not now" to the served card `sv` on the run's own copy `s`. A drip card only stops the drip.
 * Otherwise (side-door cards included) the section's count and remind day move on, it leaves this session,
 * loses liking, and any repair or queued return for its skills is dropped. Costs no effort. Returns event data.
 */
export function applySkip(s: State, content: Content, sv: Served, reason: SkipReason | undefined, day: number, cfg: Config): Record<string, unknown> {
  const ss = s.session!;
  const sec = sv.section;
  const rec = sectionRec(s, sec);
  const drip = sv.reason === "skipped-drip";
  if (drip) {
    s.sections = { ...s.sections, [sec]: { ...rec, dripStopped: true } };
  } else {
    const n = rec.skipCount + 1;
    const gaps = cfg.skipRemindDays;
    s.sections = {
      ...s.sections,
      [sec]: {
        ...rec, skipCount: n, remindDay: day + gaps[Math.min(n - 1, gaps.length - 1)], lastReason: reason ?? "later",
        dripStopped: false, returned: false, liking: rec.liking - cfg.skip.likingPenalty,
      },
    };
    const inSec = (skill: string) => content.skills[skill]?.section === sec;
    if (ss.repair && inSec(ss.repair.skill)) ss.repair = null;
    ss.returns = ss.returns.filter((q) => !inSec(q.skill));
  }
  if (!ss.blockedSections.includes(sec)) ss.blockedSections = [...ss.blockedSections, sec];
  // Only answered close cards count toward `sessionEnd.maxExtraClose`.
  if (ss.phase === "closing" && ss.closeServed > 0) ss.closeServed -= 1;
  ss.served = null;
  const out = s.sections[sec];
  return {
    card: sv.card, variant: sv.variant, skill: sv.skill, section: sec, served: sv.reason, drip,
    reason: out.lastReason, skipCount: out.skipCount, remindDay: out.remindDay,
  };
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
    s.sections = { ...s.sections, [sec]: { ...s.sections[sec], returned: true, remindDay: null } };
    for (const id of content.sections[sec]?.skills ?? []) {
      const def = content.skills[id];
      const rec = s.skills[id];
      if (!def || !rec) continue;
      const low = servable(def, 1) ?? rec.height;
      s.skills[id] = { ...rec, height: low, noFullUntilDay: day + cfg.returning.noFullDays, windowStartSeq: low === rec.height ? rec.windowStartSeq : s.answered + 1 };
    }
    if (right) reveal = { section: sec };
  }
  const rec = s.sections[sec];
  if (right && rec && rec.returned && rec.skipCount > 0) s.sections = { ...s.sections, [sec]: { ...rec, skipCount: 0 } };
  return reveal;
}
