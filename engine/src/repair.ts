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
 * piece: height 1 preferring tag then note → height 2 only on a tag/note match → any height 1 →
 * height 1 of the weakest `requires` skill. confidence: same skill, `failedHeight − 1` (min 1), nearest at or below.
 */
export function nextRepairCard(
  state: State, content: Content, repair: RepairState, day: number, cfg: Config,
): { served: Served; rng: Rng } | null {
  const def = content.skills[repair.skill];
  if (!def) return null;
  if (repair.stage === "confidence") {
    const want = Math.max(1, repair.failedHeight - 1);
    for (let h = want; h >= 1; h--) {
      const e = eligibleCard(state, content, def.id, h as Height, day, state.rng, {}, cfg);
      if (e) return { served: build(content, e.card, e.variant, "repair:confidence", cfg), rng: e.rng };
    }
    return null;
  }
  const tag = telling(content, def, repair.tag);
  const note = repair.note;
  const prefs = { ...(tag !== undefined ? { preferTag: tag } : {}), ...(note !== undefined ? { preferNote: note } : {}) };
  const matches = (id: string) =>
    (tag !== undefined && hasTag(content, id, tag)) || (note !== undefined && content.cards[id].noteRef === note);
  const piece = (e: { card: string; variant: number; rng: Rng }) =>
    ({ served: build(content, e.card, e.variant, "repair:missing-piece", cfg), rng: e.rng });

  const e1 = eligibleCard(state, content, def.id, 1, day, state.rng, prefs, cfg);
  if (e1 && matches(e1.card)) return piece(e1);
  const e2 = eligibleCard(state, content, def.id, 2, day, state.rng, prefs, cfg);
  if (e2 && matches(e2.card)) return piece(e2);
  if (e1) return piece(e1);
  const reqs = def.requires
    .filter((r) => content.skills[r] && !isBlocked(state, content.skills[r].section, day))
    .map((r) => ({ id: r, es: expectedSuccess(state, r, 1, cfg) }))
    .sort((x, y) => x.es - y.es || byId(x.id, y.id));
  for (const r of reqs) {
    const e = eligibleCard(state, content, r.id, 1, day, state.rng, {}, cfg);
    if (e) return piece(e);
  }
  return null;
}

/** One step down to the next lower height that has cards (a failed repair); unchanged at the bottom. */
export function stepDownOnce(rec: SkillRec, def: SkillDef, nextSeq: number): SkillRec {
  const lower = ([3, 2, 1] as Height[]).find((h) => h < rec.height && def.cards[h].length > 0);
  return lower === undefined ? rec : { ...rec, height: lower, windowStartSeq: nextSeq };
}
