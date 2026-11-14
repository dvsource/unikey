import { defaultConfig, type Config } from "./config.js";
import { next, type Rng } from "./rng.js";
import { byId } from "./util.js";
import { knownSkills } from "./state.js";
import { isDue, isSolid, startHeight } from "./skill.js";
import { expectedSuccess, priorOf } from "./estimate.js";
import type { Content, Height, PickCtx, Picked, Reason, Served, SkillDef, State } from "./types.js";

const HEIGHTS: Height[] = [1, 2, 3];

export function effortOf(height: Height, cfg: Config): number {
  return height === 1 ? cfg.effort.h1 : height === 2 ? cfg.effort.h2 : cfg.effort.h3;
}

function avail(def: SkillDef): Height[] {
  return HEIGHTS.filter((h) => def.cards[h].length > 0);
}

/** The nearest height with cards (ties go lower), or null when the skill has no cards. */
export function servable(def: SkillDef, want: Height): Height | null {
  const a = avail(def);
  if (!a.length) return null;
  return [...a].sort((x, y) => Math.abs(x - want) - Math.abs(y - want) || x - y)[0];
}

/** Started: its record height. New: startHeight with comfortLow / returning. */
function currentHeight(state: State, def: SkillDef, cfg: Config): Height | null {
  const rec = state.skills[def.id];
  const want = rec
    ? rec.height
    : startHeight(def, state.profile.comfort >= cfg.estimate.comfortLowMark, state.sections[def.section]?.returned === true);
  return servable(def, want);
}

export function isBlocked(state: State, section: string, day: number, extra: string[] = []): boolean {
  const rd = state.sections[section]?.remindDay;
  return (rd != null && rd > day) || extra.includes(section);
}

function todayEffort(state: State, day: number): number {
  return state.day && state.day.day === day ? state.day.effort : 0;
}

function choose<T>(xs: T[], rng: Rng): [T, Rng] {
  if (xs.length === 1) return [xs[0], rng];
  const [v, r] = next(rng);
  return [xs[Math.floor(v * xs.length)], r];
}

/**
 * A card of `skill` at `height` with a (card, variant) not seen within `noRepeatDays` (entries dated after
 * `day` also count as recent). Tiers: `preferTag` on a wrong option → `preferNote` → rest; random within a tier.
 */
export function eligibleCard(
  state: State, content: Content, skill: string, height: Height, day: number, rng: Rng,
  opts: { preferTag?: string; preferNote?: string; exclude?: string[] } = {}, cfg: Config = defaultConfig,
): { card: string; variant: number; rng: Rng } | null {
  const def = content.skills[skill];
  if (!def) return null;
  const recent = new Set(state.seen.filter((s) => day - s.day < cfg.noRepeatDays).map((s) => `${s.card}#${s.variant}`));
  const exclude = new Set(opts.exclude ?? []);
  const open: { id: string; variants: number[] }[] = [];
  for (const id of def.cards[height]) {
    const card = content.cards[id];
    if (!card || exclude.has(id)) continue;
    const variants = card.variants.map((_, v) => v).filter((v) => !recent.has(`${id}#${v}`));
    if (variants.length) open.push({ id, variants });
  }
  if (!open.length) return null;
  const tagged = (id: string) => opts.preferTag !== undefined &&
    content.cards[id].variants.some((opt) => opt.some((o) => !o.correct && o.tag === opts.preferTag));
  const noted = (id: string) => opts.preferNote !== undefined && content.cards[id].noteRef === opts.preferNote;
  const t1 = open.filter((c) => tagged(c.id));
  const t2 = open.filter((c) => !tagged(c.id) && noted(c.id));
  const tier = t1.length ? t1 : t2.length ? t2 : open.filter((c) => !tagged(c.id) && !noted(c.id));
  const [pick, r1] = choose(tier, rng);
  const [variant, r2] = choose(pick.variants, r1);
  return { card: pick.id, variant, rng: r2 };
}

function cardSkills(content: Content, ids: string[]): SkillDef[] {
  return ids.map((id) => content.skills[id]).filter((d): d is SkillDef => !!d && avail(d).length > 0);
}

/**
 * Sections with any attempt, by liking desc then success rate desc (then id). With no attempts at all:
 * the sections of the current topic (else the first topic) by mean prior-based expected success at each
 * skill's current height desc, then lowest weight, then id.
 */
export function likedSections(state: State, content: Content, cfg: Config = defaultConfig): string[] {
  const stats = new Map<string, { right: number; n: number }>();
  for (const id of knownSkills(state, content).sort(byId)) {
    const sec = content.skills[id].section;
    if (!content.sections[sec]) continue;
    for (const a of state.skills[id].attempts) {
      const s = stats.get(sec) ?? { right: 0, n: 0 };
      stats.set(sec, { right: s.right + (a.right ? 1 : 0), n: s.n + 1 });
    }
  }
  if (stats.size) {
    const liking = (s: string) => state.sections[s]?.liking ?? 0;
    const rate = (s: string) => stats.get(s)!.right / stats.get(s)!.n;
    return [...stats.keys()].sort((x, y) => liking(y) - liking(x) || rate(y) - rate(x) || byId(x, y));
  }
  const cur = state.currentTopic?.id;
  const topic = (cur !== undefined && content.topics[cur]) || content.topics[Object.keys(content.topics)[0]];
  if (!topic) return [];
  const scored: { id: string; mean: number; weight: number }[] = [];
  for (const sid of topic.sections) {
    const sec = content.sections[sid];
    if (!sec) continue;
    const es = cardSkills(content, sec.skills).map((d) => priorOf(currentHeight(state, d, cfg)!, cfg));
    if (es.length) scored.push({ id: sid, mean: es.reduce((a, b) => a + b, 0) / es.length, weight: sec.weight });
  }
  return scored.sort((x, y) => y.mean - x.mean || x.weight - y.weight || byId(x.id, y.id)).map((s) => s.id);
}

/** First solid `requires`/`helps` neighbour when the skill's section has returned from a skip. */
function borrowedFrom(state: State, content: Content, def: SkillDef, cfg: Config): string | undefined {
  if (state.sections[def.section]?.returned !== true) return undefined;
  return [...def.requires, ...def.helps].find((n) => {
    const r = state.skills[n]; const d = content.skills[n];
    return !!r && !!d && isSolid(r, d, cfg);
  });
}

type Cand = { def: SkillDef; height: Height };

/** `relax`: ignore `excludeSkills` and the same-skill run (the last-resort sweep's second pass). */
function tryServe(state: State, content: Content, c: Cand, reason: Reason, ctx: PickCtx, cfg: Config, relax = false): Picked | null {
  const { def, height } = c;
  if (isBlocked(state, def.section, ctx.day, ctx.blockedSections)) return null;
  if (!relax) {
    if (ctx.excludeSkills?.includes(def.id)) return null;
    const n = cfg.session.maxSameSkillRun;
    const tail = ctx.lastSkills.slice(-n);
    if (tail.length === n && tail.every((s) => s === def.id)) return null;
  }
  const effort = effortOf(height, cfg);
  if (effort > ctx.remaining && (ctx.strictBudget === true || todayEffort(state, ctx.day) >= cfg.budget.minimumDay)) return null;
  const e = eligibleCard(state, content, def.id, height, ctx.day, state.rng, {}, cfg);
  if (!e) return null;
  const served: Served = { card: e.card, variant: e.variant, skill: def.id, section: def.section, height, reason, effort };
  const b = borrowedFrom(state, content, def, cfg);
  if (b !== undefined) served.borrowedFrom = b;
  return { served, rng: e.rng };
}

function firstOf(state: State, content: Content, cs: Cand[], reason: (c: Cand) => Reason, ctx: PickCtx, cfg: Config): Picked | null {
  for (const c of cs) {
    const p = tryServe(state, content, c, reason(c), ctx, cfg);
    if (p) return p;
  }
  return null;
}

function started(state: State, content: Content): SkillDef[] {
  return cardSkills(content, knownSkills(state, content).sort(byId));
}

function withHeight(state: State, defs: SkillDef[], cfg: Config): Cand[] {
  return defs.map((def) => ({ def, height: currentHeight(state, def, cfg)! }));
}

/** 0 for the preferred side of the session's height-3 effort share, 1 otherwise. */
function h3Rank(h: Height, state: State, ctx: PickCtx): number {
  const share = ctx.spent > 0 ? ctx.h3Spent / ctx.spent : 0;
  if (share < state.profile.h3Share) return h === 3 ? 0 : 1;
  if (share > state.profile.h3Share) return h < 3 ? 0 : 1;
  return 0;
}

/** Brand-new path: lowest available height of the highest-weight skill with no `requires` (others after). */
function newcomer(state: State, content: Content, section: string, reason: Reason, ctx: PickCtx, cfg: Config): Picked | null {
  if (ctx.newSkillsThisSession >= cfg.session.maxNewSkills) return null;
  const defs = cardSkills(content, content.sections[section]?.skills ?? [])
    .filter((d) => !(d.id in state.skills))
    .sort((x, y) => Number(x.requires.length > 0) - Number(y.requires.length > 0) || y.weight - x.weight || byId(x.id, y.id));
  return firstOf(state, content, defs.map((def) => ({ def, height: avail(def)[0] })), () => reason, ctx, cfg);
}

export function pickOpen(state: State, content: Content, ctx: PickCtx, cfg: Config): Picked | null {
  const comfort = state.profile.comfort;
  for (const sec of likedSections(state, content, cfg)) {
    if (isBlocked(state, sec, ctx.day, ctx.blockedSections)) continue;
    const st = started(state, content).filter((d) => d.section === sec);
    if (!st.length) {
      const p = newcomer(state, content, sec, "open:liked", ctx, cfg);
      if (p) return p;
      continue;
    }
    const cands = withHeight(state, st, cfg)
      .map((c) => ({ ...c, es: expectedSuccess(state, c.def.id, c.height, cfg) }))
      .sort((x, y) => y.es - x.es || byId(x.def.id, y.def.id))
      .map((c) => {
        if (c.es >= comfort) return c;
        const lower = [...avail(c.def)].reverse().find((h) => h < c.height);
        return lower === undefined ? c : { ...c, height: lower };
      });
    const p = firstOf(state, content, cands, () => "open:liked", ctx, cfg);
    if (p) return p;
  }
  return null;
}

export function pickMiddle(state: State, content: Content, ctx: PickCtx, cfg: Config): Picked | null {
  const comfort = state.profile.comfort;
  const cur = state.currentTopic?.id ?? null;
  const rate = ctx.runningTotal > 0 ? ctx.runningRight / ctx.runningTotal : null;
  const correcting = ctx.runningTotal >= cfg.estimate.minRunning && rate !== null && rate < comfort;
  const st = started(state, content);
  const notDue = st.filter((d) => !isDue(state.skills[d.id], ctx.day));
  const inTopic = (d: SkillDef) => (d.topic === cur ? 0 : 1);

  if (correcting) {
    // Per skill: the highest height ≤ current whose expectedSuccess reaches comfort; skills by that estimate.
    const rows = withHeight(state, notDue, cfg).map((c) => {
      const hs = avail(c.def).filter((h) => h <= c.height).reverse()
        .map((h) => ({ def: c.def, height: h, es: expectedSuccess(state, c.def.id, h, cfg) }))
        .filter((x) => x.es >= comfort);
      return hs;
    }).filter((hs) => hs.length)
      .sort((x, y) => y[0].es - x[0].es || byId(x[0].def.id, y[0].def.id));
    return firstOf(state, content, rows.flat(), () => "comfort-correction", ctx, cfg);
  }

  // (1) due skills
  const due = withHeight(state, st.filter((d) => isDue(state.skills[d.id], ctx.day)), cfg)
    .sort((x, y) => inTopic(x.def) - inTopic(y.def) || y.def.weight - x.def.weight
      || state.skills[x.def.id].nextReviewDay! - state.skills[y.def.id].nextReviewDay!
      || h3Rank(x.height, state, ctx) - h3Rank(y.height, state, ctx) || byId(x.def.id, y.def.id));
  const p1 = firstOf(state, content, due, () => "due-review", ctx, cfg);
  if (p1) return p1;

  // (2) a new skill
  if (ctx.newSkillsThisSession < cfg.session.maxNewSkills && (rate === null || rate >= comfort)) {
    const ready = (d: SkillDef) => d.requires.every((r) =>
      r in state.skills || !content.skills[r] || avail(content.skills[r]).length === 0);
    const fresh = cardSkills(content, Object.keys(content.skills))
      .filter((d) => !(d.id in state.skills) && ready(d));
    const cands = withHeight(state, fresh, cfg)
      .sort((x, y) => inTopic(x.def) - inTopic(y.def) || y.def.weight - x.def.weight
        || h3Rank(x.height, state, ctx) - h3Rank(y.height, state, ctx) || byId(x.def.id, y.def.id));
    const p2 = firstOf(state, content, cands, (c) => (c.def.topic === cur ? "new:class-topic" : "new:exam-weight"), ctx, cfg);
    if (p2) return p2;
  }

  // (3) the started, not-due skill the student is most likely to get right
  const easy = withHeight(state, notDue, cfg)
    .map((c) => ({ ...c, es: expectedSuccess(state, c.def.id, c.height, cfg) }))
    .sort((x, y) => y.es - x.es || byId(x.def.id, y.def.id));
  return firstOf(state, content, easy, () => "comfort-correction", ctx, cfg);
}

export function pickClose(state: State, content: Content, ctx: PickCtx, cfg: Config): Picked | null {
  const liked = likedSections(state, content, cfg).filter((s) => !isBlocked(state, s, ctx.day, ctx.blockedSections));
  const st = started(state, content);
  const pairs: (Cand & { es: number; si: number })[] = [];
  liked.forEach((sec, si) => {
    for (const c of withHeight(state, st.filter((d) => d.section === sec), cfg)) {
      for (const h of avail(c.def).filter((x) => x <= c.height)) {
        pairs.push({ def: c.def, height: h, es: expectedSuccess(state, c.def.id, h, cfg), si });
      }
    }
  });
  const reason = () => "close:winnable" as const;
  const winnable = pairs.filter((p) => p.es >= cfg.session.winnable)
    .sort((x, y) => x.si - y.si || y.height - x.height || y.es - x.es || byId(x.def.id, y.def.id));
  const p1 = firstOf(state, content, winnable, reason, ctx, cfg);
  if (p1) return p1;
  const best = [...pairs].sort((x, y) => y.es - x.es || x.si - y.si || y.height - x.height || byId(x.def.id, y.def.id));
  const p2 = firstOf(state, content, best, reason, ctx, cfg);
  if (p2) return p2;
  for (const sec of liked) {
    if (st.some((d) => d.section === sec)) continue;
    const p = newcomer(state, content, sec, "close:winnable", ctx, cfg);
    if (p) return p;
  }
  return null;
}

/**
 * Comeback open (spec §8): height-1 cards of started skills in sections where some skill is solid,
 * sections in liked order, solid skills first, then by height-1 estimate.
 */
export function pickComeback(state: State, content: Content, ctx: PickCtx, cfg: Config): Picked | null {
  const st = started(state, content);
  const solid = (d: SkillDef) => isSolid(state.skills[d.id], d, cfg);
  const secs = new Set(st.filter(solid).map((d) => d.section));
  const order = [...new Set([...likedSections(state, content, cfg).filter((x) => secs.has(x)), ...[...secs].sort(byId)])];
  const cands: Cand[] = order.flatMap((sec) => st.filter((d) => d.section === sec && d.cards[1].length > 0)
    .map((def) => ({ def, solid: solid(def), es: expectedSuccess(state, def.id, 1, cfg) }))
    .sort((x, y) => Number(y.solid) - Number(x.solid) || y.es - x.es || byId(x.def.id, y.def.id))
    .map(({ def }) => ({ def, height: 1 as Height })));
  return firstOf(state, content, cands, () => "comeback:solid", ctx, cfg);
}

/**
 * The first queued repair return whose time has come (`historyLength ≥ afterCard`), at the skill's current
 * height, as a variant not seen lately. The skill's own exclusion in `ctx.excludeSkills` does not apply.
 */
export function pickReturn(
  state: State, content: Content, ctx: PickCtx, returns: { skill: string; afterCard: number }[], historyLength: number, cfg: Config,
): Picked | null {
  const own = { ...ctx, excludeSkills: [] };
  for (const q of returns) {
    const def = content.skills[q.skill];
    const rec = state.skills[q.skill];
    if (historyLength < q.afterCard || !def || !rec) continue;
    const height = servable(def, rec.height);
    if (height === null) continue;
    const p = tryServe(state, content, { def, height }, "repair:return", own, cfg);
    if (p) return p;
  }
  return null;
}

/**
 * Last-resort sweep, used before any `content-exhausted` end: every non-blocked skill with cards (started
 * first, then not started with `requires` met, then the rest) at every available height; the eligible card
 * with the highest expectedSuccess wins, ties to the lower height, then skill id. A first pass keeps the
 * same-skill run and `excludeSkills`; a second pass drops them.
 */
export function pickAny(state: State, content: Content, ctx: PickCtx, cfg: Config, reason: Reason): Picked | null {
  const ready = (d: SkillDef) => d.requires.every((r) =>
    r in state.skills || !content.skills[r] || avail(content.skills[r]).length === 0);
  const group = (d: SkillDef) => (d.id in state.skills ? 0 : ready(d) ? 1 : 2);
  const cands = cardSkills(content, Object.keys(content.skills).sort(byId))
    .flatMap((def) => avail(def).map((height) => ({ def, height, g: group(def), es: expectedSuccess(state, def.id, height, cfg) })))
    .sort((x, y) => x.g - y.g || y.es - x.es || x.height - y.height || byId(x.def.id, y.def.id));
  for (const relax of [false, true]) {
    for (const c of cands) {
      const p = tryServe(state, content, c, reason, ctx, cfg, relax);
      if (p) return p;
    }
  }
  return null;
}
