// The first-session ladder (change 4): in a student's first `budget.firstSessions` sessions the level of the open and
// middle cards follows the student's answers from the first card, instead of starting everyone on easy cards.
import type { Config } from "./config.js";
import { byId } from "./util.js";
import { isDue } from "./skill.js";
import { cardSkills, firstOf, isBlocked, isReady, likedSections } from "./pick.js";
import type { Content, Height, Ladder, PickCtx, Picked, Reason, SkillDef, State } from "./types.js";

/**
 * After an answer on a ladder card: right → one more in the run, and at `ladder.upAfterRight` the level goes up one
 * (max 3) and the run starts again; a Hard keeps the level and restarts the run (T114); a miss (wrong or "I don't know") → the level down one (min 1), the run 0.
 * Repair, confidence, return, closing, drip, side-door and "5 more" cards never come here.
 */
export function ladderAfterAnswer(l: Ladder, right: boolean, cfg: Config, hard = false): Ladder {
  if (!right) return { level: Math.max(1, l.level - 1) as Height, rightRun: 0 };
  if (hard) return { level: l.level, rightRun: 0 }; // T114: a Hard is no credit toward going up, and breaks the run
  const run = l.rightRun + 1;
  if (run >= cfg.ladder.upAfterRight) return { level: Math.min(3, l.level + 1) as Height, rightRun: 0 };
  return { level: l.level, rightRun: run };
}

/** The levels tried in turn: the ladder level, then the nearest lower ones, then the nearest higher ones. */
export function ladderLevels(level: Height): Height[] {
  const all: Height[] = [1, 2, 3];
  return [level, ...all.filter((h) => h < level).reverse(), ...all.filter((h) => h > level)];
}

/**
 * The open or middle card while the ladder is active. Candidates: every skill with cards whose section is not blocked
 * and that is started or ready (its `requires` met). Each is served at the ladder level when it has an eligible card
 * there; when no skill has one, the nearest lower level, then the nearest higher. A card over the budget counts as not
 * eligible. The shared check (`firstOf`) keeps out blocked sections, left and excluded skills, the session's recent
 * cards, an over-long same-skill run and cards seen within `noRepeatDays`. The new-skill allowance does not apply
 * (nearly every first-session card is a new skill); a new skill gets its record at the served level when answered.
 * Level 3 (fix round 1): never for a skill whose `noFullUntilDay` is after today (back from a skip), and not at all once
 * `ctx.ladderFull` reaches `ladder.maxFullPerSession`: ladder level 3 is then served as level 2 (the level itself stays 3).
 *
 * Order (one comparator, `ladderOrder`): liked sections first (in `likedSections` order; other sections after), then
 * due skills, then the current topic, then higher weight, then skill id.
 *
 * Reason: `open:liked` for the session's first `session.openCards` cards (`ctx.lastSkills` holds one entry per card
 * so far); after them `due-review` for a due skill, `new:class-topic` / `new:exam-weight` for a new skill (in the
 * current topic or not), and `open:liked` for a started skill that is not due.
 */
export function pickLadder(state: State, content: Content, ctx: PickCtx, cfg: Config): Picked | null {
  const fullDone = (ctx.ladderFull ?? 0) >= cfg.ladder.maxFullPerSession;
  const level = Math.min(state.ladder?.level ?? 1, fullDone ? 2 : 3) as Height;
  const fullOk = (d: SkillDef) => { const u = state.skills[d.id]?.noFullUntilDay ?? null; return u === null || u <= ctx.day; };
  const liked = likedSections(state, content, cfg);
  const cur = state.currentTopic?.id ?? null;
  const sectionRank = (d: SkillDef) => { const i = liked.indexOf(d.section); return i < 0 ? liked.length : i; };
  const due = (d: SkillDef) => (d.id in state.skills && isDue(state.skills[d.id], ctx.day) ? 0 : 1);
  const inTopic = (d: SkillDef) => (d.topic === cur ? 0 : 1);
  const ladderOrder = (x: SkillDef, y: SkillDef) => sectionRank(x) - sectionRank(y) || due(x) - due(y)
    || inTopic(x) - inTopic(y) || y.weight - x.weight || byId(x.id, y.id);
  const defs = cardSkills(content, Object.keys(content.skills))
    .filter((d) => !isBlocked(state, d.section, ctx.day, ctx.blockedSections) && (d.id in state.skills || isReady(state, content, d)))
    .sort(ladderOrder);
  const opening = ctx.lastSkills.length < cfg.session.openCards;
  const reason = (d: SkillDef): Reason => {
    if (opening) return "open:liked";
    if (!(d.id in state.skills)) return d.topic === cur ? "new:class-topic" : "new:exam-weight";
    return due(d) === 0 ? "due-review" : "open:liked";
  };
  for (const height of ladderLevels(level).filter((h) => h < 3 || !fullDone)) {
    const cands = defs.filter((def) => def.cards[height].length > 0 && (height < 3 || fullOk(def))).map((def) => ({ def, height }));
    const p = firstOf(state, content, cands, (c) => reason(c.def), ctx, cfg);
    if (p) return p;
  }
  return null;
}
