import type { Config } from "./config.js";
import type { Rng } from "./rng.js";
import { expectedSuccess } from "./estimate.js";
import { byId } from "./util.js";
import { effortOf, eligibleCard, isBlocked } from "./pick.js";
import type { Content, Height, Reason, RepairState, Served, SkillDef, SkillRec, State } from "./types.js";

function build(content: Content, card: string, variant: number, reason: Reason, cfg: Config): Served {
  const c = content.cards[card];
  return { card, variant, skill: c.skill, section: c.section, height: c.height, reason, effort: effortOf(c.height, cfg) };
}

function hasTag(content: Content, id: string, tag: string): boolean {
  return content.cards[id].variants.some((opts) => opts.some((o) => !o.correct && o.tag === tag));
}

/**
 * A tag only points at a missing piece when it singles out some of the skill's height-1/2 cards.
 * A tag every one of them carries (e.g. `recall-gap` on every option) tells nothing, so the note decides.
 */
function telling(content: Content, def: SkillDef, tag: string | undefined): string | undefined {
  if (tag === undefined) return undefined;
  const ids = [...def.cards[1], ...def.cards[2]].filter((id) => content.cards[id]);
  return ids.some((id) => !hasTag(content, id, tag)) ? tag : undefined;
}

/**
 * The next card of a repair stage, or null when the stage has nothing eligible (the caller then skips it).
 * piece (change 1: always below the failed level F; when F is 1, a different level-1 card): among the skill's cards at
 * the allowed levels, a tag match first, then a note match, then the rest; within a tier the lowest level first. Then a
 * level-1 card of the weakest `requires` skill, then of the weakest `helps` neighbour, outside blocked sections
 * (`blocked`: the session's skipped ones) and the session's left skills. confidence: same skill, `failedHeight − 1`
 * (min 1), nearest at or below.
 * `recent`: card ids not to serve (R5: the session's last `session.returnAfterCards` serves). The failed card was the
 * last card served, so it is always among them: the missing piece is a different card. T114: a repair waiting for the
 * session end names its missed card (`repair.card`), which is left out too.
 */
export function nextRepairCard(
  state: State, content: Content, repair: RepairState, day: number, cfg: Config, blocked: string[] = [], recent: string[] = [],
): { served: Served; rng: Rng } | null {
  const ex = { exclude: repair.card !== undefined ? [...recent, repair.card] : recent }; // T114: never the missed card itself
  const def = content.skills[repair.skill];
  if (!def) return null;
  if (repair.stage === "confidence") {
    const want = Math.max(1, repair.failedHeight - 1);
    for (let h = want; h >= 1; h--) {
      const e = eligibleCard(state, content, def.id, h as Height, day, state.rng, ex, cfg);
      if (e) return { served: build(content, e.card, e.variant, "repair:confidence", cfg), rng: e.rng };
    }
    return null;
  }
  const tag = telling(content, def, repair.tag);
  const note = repair.note;
  const prefs = { ...ex, ...(tag !== undefined ? { preferTag: tag } : {}), ...(note !== undefined ? { preferNote: note } : {}) };
  /** 0 tag match, 1 note match, 2 the rest (the tiers `eligibleCard` picks within). */
  const tier = (id: string) =>
    tag !== undefined && hasTag(content, id, tag) ? 0 : note !== undefined && content.cards[id].noteRef === note ? 1 : 2;
  const piece = (e: { card: string; variant: number; rng: Rng }) =>
    ({ served: build(content, e.card, e.variant, "repair:missing-piece", cfg), rng: e.rng });

  const allowed: Height[] = repair.failedHeight === 1 ? [1] : ([1, 2] as Height[]).filter((h) => h < repair.failedHeight);
  let best: { e: { card: string; variant: number; rng: Rng }; tier: number } | null = null;
  for (const h of allowed) { // lowest level first: a lower level wins a tie
    const e = eligibleCard(state, content, def.id, h, day, state.rng, prefs, cfg);
    if (e && (best === null || tier(e.card) < best.tier)) best = { e, tier: tier(e.card) };
  }
  if (best) return piece(best.e);
  const left = state.session?.leftSkills ?? [];
  const weakest = (ids: string[]) => ids
    .filter((n) => n !== def.id && content.skills[n] && !left.includes(n) && !isBlocked(state, content.skills[n].section, day, blocked))
    .map((n) => ({ id: n, es: expectedSuccess(state, n, 1, cfg) }))
    .sort((x, y) => x.es - y.es || byId(x.id, y.id));
  for (const r of [...weakest(def.requires), ...weakest(def.helps.filter((n) => !def.requires.includes(n)))]) {
    const e = eligibleCard(state, content, r.id, 1, day, state.rng, ex, cfg);
    if (e) return piece(e);
  }
  return null;
}

/** One step down to the next lower height that has cards (a failed repair); unchanged at the bottom. */
export function stepDownOnce(rec: SkillRec, def: SkillDef, nextSeq: number): SkillRec {
  const lower = ([3, 2, 1] as Height[]).find((h) => h < rec.height && def.cards[h].length > 0);
  return lower === undefined ? rec : { ...rec, height: lower, windowStartSeq: nextSeq };
}
