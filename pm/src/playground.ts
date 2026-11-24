// Engine playground (T126, docs/superpowers/specs/2026-11-24-engine-playground-design.md): runs the real engine
// (engine/src) for one sandbox student. Stateless: the browser keeps the scenario (the grades Viraj gave, day by day)
// and every call replays it from a fresh state, then forecasts the rest of today and the next 6 days with a default
// grade. The engine is pure and seeded, so the same scenario always gives the same answer. Nothing is written to disk.
// Load it after ./engine-hooks.ts has run (see serve.ts: loadPlayground), so the engine's `.js` imports resolve.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  answer, endSession, extend, newState, skip, startSession, DAY_MS, GRADES,
  type Content, type Grade, type Served, type SkillRec, type State, type Step, type EndInfo,
} from "../../engine/src/index.ts";
import { loadPackSet } from "../../engine/sim/pack-set.ts";
import { personas } from "../../engine/sim/personas.ts";
import { decide, learn, newHidden, wantsExtend, type Hidden } from "../../engine/sim/student.ts";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
/** Day 0 of the sandbox: Monday 2027-01-04, 18:00 Sri Lanka time. One session a day. */
export const DAY0 = Date.UTC(2027, 0, 4, 12, 30);
/** Days in the view: today and the next 6. */
export const AHEAD = 6;
const CARD_MS = 12_000; // think time of every answer: above every guess line
const STEP_MS = 15_000;
const MAX_CARDS = 80; // a safety stop per session

/** The default for cards nobody graded: a grade, or a simulator persona's behaviour (`persona:<id>`). */
export type Default = Grade | `persona:${string}`;
export type Act =
  | { kind: "grade"; grade: Grade }
  | { kind: "skip" }
  | { kind: "extend" }
  | { kind: "decline" }
  /** Next day: the rest of that day's session was graded with this default. */
  | { kind: "finish"; with: Default };
export type Scenario = { pack: string; seed: number; deflt: Default; days: Act[][] };

export type SkillNums = { height: number; gapIndex: number; nextDue: number | null; stepRun: number; noFullUntil: number | null };
export type Row = {
  card: string; variant: number; skill: string; skillName: string; section: string; height: number; reason: string;
  why: string; effort: number;
  /** you: Viraj graded it; default: the default grade, frozen by Next day; forecast: what would happen. */
  source: "you" | "default" | "forecast";
  /** What was done with it (null: it is the open card, waiting for a grade). */
  did: Grade | "skip" | "quit" | null;
  before: SkillNums | null; after: SkillNums | null;
  /** Today's open card: the one to grade next (its `did` is the forecast's default). */
  open?: true;
};
export type DayView = {
  day: number; label: string; date: string; rows: Row[]; end: (EndInfo & { offered?: boolean; took?: boolean }) | null;
  /** today only: what the engine is waiting for (a card to grade, or the "5 more" offer). */
  pending: "card" | "offer-extend" | null;
};
export type Result = {
  today: number; days: DayView[]; deflt: Default; pack: string;
  /** The open card's skill numbers now (today's next card). */
  skills: Record<string, SkillNums>;
};

// ---------- content ----------

type PackInfo = { id: string; edition: "v1" | "v2"; unit: string };
let packList: PackInfo[] | null = null;
export function packs(): PackInfo[] {
  if (packList) return packList;
  const read = (f: string, edition: "v1" | "v2") =>
    (JSON.parse(fs.readFileSync(path.join(REPO, f), "utf8")).packs as { id: string }[]).map((p) => {
      const built = path.join(REPO, "app/assets/content/packs", p.id + ".json");
      const unit = fs.existsSync(built) ? (JSON.parse(fs.readFileSync(built, "utf8")).unit?.name_en ?? p.id) : p.id;
      return { id: p.id, edition, unit };
    });
  packList = [...read("content/sample-v2/content-packs.json", "v2"), ...read("app/content-packs.json", "v1")];
  return packList;
}
const contentCache = new Map<string, Content>();
function contentOf(pack: string): Content {
  const p = packs().find((x) => x.id === pack);
  if (!p) throw new BadRequest(`unknown pack ${pack}`);
  let c = contentCache.get(pack);
  if (!c) { c = loadPackSet(REPO, p.edition, [pack]); contentCache.set(pack, c); }
  return c;
}

/** The question and answer of one card variant, from the built pack (English and Sinhala). */
export function cardText(pack: string, id: string, variant: number): unknown {
  contentOf(pack); // validates the pack id
  const built = JSON.parse(fs.readFileSync(path.join(REPO, "app/assets/content/packs", pack + ".json"), "utf8"));
  const item = (built.items as { id: string; variants: unknown[] }[]).find((i) => i.id === id);
  if (!item) throw new BadRequest(`no card ${id} in ${pack}`);
  const v = (item.variants[variant] ?? item.variants[0]) as Record<string, unknown>;
  const { variants: _v, ...rest } = item as Record<string, unknown>;
  return { ...rest, variant: v };
}

export class BadRequest extends Error {}

// ---------- the run ----------

const dayLabel = (d: number) => new Date(DAY0 + d * DAY_MS).toLocaleDateString("en-GB", { weekday: "short", timeZone: "Asia/Colombo" });
const dayDate = (d: number) => new Date(DAY0 + d * DAY_MS).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "Asia/Colombo" });

function nums(rec: SkillRec | undefined, engineDay0: number): SkillNums | null {
  if (!rec) return null;
  // Rights in a row at the current level since the step window started (what a step up needs; hard and fast break it).
  let run = 0;
  for (const a of rec.attempts.filter((x) => x.height === rec.height && x.seq >= rec.windowStartSeq)) {
    if (a.fast) continue;
    run = a.right && a.grade !== "hard" ? run + 1 : 0;
  }
  return {
    height: rec.height, gapIndex: rec.gapIndex, stepRun: run,
    nextDue: rec.nextReviewDay === null ? null : rec.nextReviewDay - engineDay0,
    noFullUntil: rec.noFullUntilDay === null ? null : rec.noFullUntilDay - engineDay0,
  };
}

/** One answer the default would give: a grade, or what the persona's hidden student does. */
type Choice = { kind: "grade"; grade: Grade; correct: boolean } | { kind: "skip" } | { kind: "quit" };

class Sandbox {
  state: State;
  hidden = new Map<string, Hidden>();
  readonly engineDay0: number;
  readonly content: Content;
  constructor(content: Content, seed: number, personaIds: string[]) {
    this.content = content;
    this.state = newState("playground", seed);
    this.engineDay0 = Math.floor((DAY0 + 330 * 60_000) / DAY_MS);
    for (const id of personaIds) {
      const p = personas.find((x) => x.id === id);
      if (!p) throw new BadRequest(`unknown persona ${id}`);
      this.hidden.set(id, newHidden(p, content, seed));
    }
  }
  /** Every hidden student learns from every answered card (the truth: the grade is not again). */
  learnAll(sv: Served, right: boolean, day: number): void {
    for (const [id, h] of this.hidden) this.hidden.set(id, learn(h, sv, right, day));
  }
  choose(d: Default, sv: Served, st: Step, day: number, recentWrong: number): Choice {
    if (!d.startsWith("persona:")) return { kind: "grade", grade: d as Grade, correct: d !== "again" };
    const id = d.slice(8);
    const h = this.hidden.get(id)!;
    const out = decide(h, this.content, sv, { effort: st.state.session?.spent ?? 0, recentWrong }, day);
    this.hidden.set(id, out.hidden);
    const a = out.action;
    if (a.kind === "answer") return { kind: "grade", grade: a.grade, correct: a.correct };
    return a.kind === "skip" ? { kind: "skip" } : { kind: "quit" };
  }
  takesExtend(d: Default): boolean {
    if (!d.startsWith("persona:")) return false;
    const id = d.slice(8);
    const [want, h] = wantsExtend(this.hidden.get(id)!, this.state.session?.spent ?? 0);
    this.hidden.set(id, h);
    return want;
  }
}

/**
 * Plays day `d`'s session: the recorded `acts` first, then `auto` for the rest (null: stop at the first card with no
 * act, leaving the session open). Returns the view of the day; the sandbox state moves on.
 */
function playDay(sb: Sandbox, d: number, acts: Act[], auto: Default | null, source: Row["source"]): DayView {
  const { content } = sb;
  let now = DAY0 + d * DAY_MS;
  let st = startSession(sb.state, content, now);
  const view: DayView = { day: d, label: dayLabel(d), date: dayDate(d), rows: [], end: null, pending: null };
  let i = 0;
  const wrongs: boolean[] = [];
  for (let n = 0; n < MAX_CARDS; n++) {
    const nx = st.next;
    if (nx.kind === "end") { view.end = { ...nx.end }; break; }
    const act = i < acts.length && acts[i].kind !== "finish" ? acts[i] : undefined;
    const finish = acts[i]?.kind === "finish" ? (acts[i] as { with: Default }).with : null;
    const use = act ? null : finish ?? auto;
    if (!act && use === null) { view.pending = nx.kind === "card" ? "card" : "offer-extend"; if (nx.kind === "card") view.rows.push(row(sb, nx.card, null, null, "forecast")); break; }
    const src: Row["source"] = act ? "you" : finish !== null ? "default" : source;
    now += STEP_MS;
    if (nx.kind === "offer-extend") {
      const take = act ? act.kind === "extend" : sb.takesExtend(use!);
      if (act && act.kind !== "extend" && act.kind !== "decline") throw new BadRequest(`day ${d}: the engine offers "5 more", got ${act.kind}`);
      if (act) i++;
      st = take ? extend(st.state, content, now) : endSession(st.state, content, now);
      view.end = null;
      if (!take && st.next.kind === "end") { view.end = { ...st.next.end, offered: true, took: false }; break; }
      continue;
    }
    if (nx.kind === "confirm-skip") { // a second skip of a section: confirm it (the value message is the app's)
      st = skip(st.state, content, { card: st.state.session!.served!.card, confirmed: true }, now);
      continue;
    }
    const sv = nx.card;
    const before = nums(st.state.skills[sv.skill], sb.engineDay0);
    let did: Row["did"];
    if (act) {
      if (act.kind !== "grade" && act.kind !== "skip") throw new BadRequest(`day ${d}: the engine shows a card, got ${act.kind}`);
      i++;
      did = act.kind === "grade" ? act.grade : "skip";
    } else {
      const c = sb.choose(use!, sv, st, d, wrongs.slice(-8).filter((w) => w).length);
      did = c.kind === "grade" ? c.grade : c.kind;
    }
    if (did === "quit") {
      view.rows.push(row(sb, sv, did, before, src, before));
      st = endSession(st.state, content, now);
      continue;
    }
    if (did === "skip") {
      st = skip(st.state, content, { card: sv.card }, now);
      if (st.next.kind === "confirm-skip") st = skip(st.state, content, { card: sv.card, confirmed: true }, now);
    } else {
      st = answer(st.state, content, { card: sv.card, ms: CARD_MS, grade: did }, now);
      sb.learnAll(sv, did !== "again", d);
      wrongs.push(did === "again");
    }
    view.rows.push(row(sb, sv, did, before, src, nums(st.state.skills[sv.skill], sb.engineDay0)));
  }
  sb.state = st.state;
  return view;
}

function row(sb: Sandbox, sv: Served, did: Row["did"], before: SkillNums | null, source: Row["source"], after: SkillNums | null = null): Row {
  return {
    card: sv.card, variant: sv.variant, skill: sv.skill, skillName: sb.content.skills[sv.skill]?.name ?? sv.skill,
    section: sb.content.sections[sv.section]?.name ?? sv.section, height: sv.height, reason: sv.reason, why: sv.why ?? sv.reason,
    effort: sv.effort, source, did, before: before ?? nums(sb.state.skills[sv.skill], sb.engineDay0), after,
  };
}

export function validate(sc: unknown): Scenario {
  const s = sc as Scenario;
  const isDefault = (d: unknown): d is Default =>
    typeof d === "string" && (GRADES.includes(d as Grade) || (d.startsWith("persona:") && personas.some((p) => `persona:${p.id}` === d)));
  if (!s || typeof s.pack !== "string" || !Number.isInteger(s.seed) || !isDefault(s.deflt) || !Array.isArray(s.days) || s.days.length < 1 || s.days.length > 366)
    throw new BadRequest("a scenario is { pack, seed, deflt, days: Act[][] } with at least one day");
  for (const day of s.days) {
    if (!Array.isArray(day)) throw new BadRequest("each day is a list of acts");
    for (const a of day) {
      const ok = a && (a.kind === "grade" ? GRADES.includes(a.grade) : a.kind === "finish" ? isDefault(a.with) : ["skip", "extend", "decline"].includes(a.kind));
      if (!ok) throw new BadRequest(`bad act ${JSON.stringify(a)}`);
    }
  }
  return s;
}

/** Replays the scenario and forecasts: past days as played, today up to its open card, then the forecast. */
export function run(input: unknown): Result {
  const sc = validate(input);
  const content = contentOf(sc.pack);
  const personaIds = new Set<string>();
  const collect = (d: Default) => { if (d.startsWith("persona:")) personaIds.add(d.slice(8)); };
  collect(sc.deflt);
  for (const day of sc.days) for (const a of day) if (a.kind === "finish") collect(a.with);
  const sb = new Sandbox(content, sc.seed, [...personaIds]);
  const today = sc.days.length - 1;
  const days: DayView[] = [];
  for (let d = 0; d < today; d++) {
    const acts = sc.days[d];
    if (acts.at(-1)?.kind !== "finish") throw new BadRequest(`day ${d} is past: it must end with a finish act`);
    days.push(playDay(sb, d, acts, null, "default"));
  }
  // Today, twice from the same start: up to the open card (what the engine waits for), and on with the default (the
  // forecast). The engine is pure, so both runs agree up to the open card. The next days follow the forecast run.
  const snap = { state: sb.state, hidden: new Map(sb.hidden) };
  const upTo = playDay(sb, today, sc.days[today], null, "you");
  const skills: Result["skills"] = {};
  for (const [id, rec] of Object.entries(sb.state.skills)) { const n = nums(rec, sb.engineDay0); if (n) skills[id] = n; }
  sb.state = snap.state;
  sb.hidden = snap.hidden;
  const view = playDay(sb, today, sc.days[today], sc.deflt, "forecast");
  const open = upTo.rows.findIndex((r) => r.did === null);
  if (open >= 0) view.rows[open] = { ...view.rows[open], open: true };
  view.pending = upTo.pending;
  days.push(view);
  for (let d = today + 1; d <= today + AHEAD; d++) days.push(playDay(sb, d, [], sc.deflt, "forecast"));
  return { today, days, deflt: sc.deflt, pack: sc.pack, skills };
}
