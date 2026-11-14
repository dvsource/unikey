// The 28-day runner (spec §13 "The run"): hidden students play simulated days against the engine.
// `runStudent` is pure (no disk, no clock); the CLI at the bottom writes the logs and prints the checks.
import { pathToFileURL } from "node:url";
import {
  answer, defaultConfig, endSession, extend, newState, setCurrentTopic, skip, startSession, DAY_MS,
  type Choice, type Config, type Content, type EndInfo, type Moment, type Profile, type Served, type SkipReason,
  type State, type Step, type ValueMessage,
} from "../src/index.js";
import {
  decay, decide, learn, meanKnowledge, newHidden, playsToday, resolvePersona, sessionEnded, wantsExtend,
  type Hidden, type Persona, type PersonaSpec, type Traits,
} from "./student.js";

/** Simulated day 0: 2027-01-18 18:00 Sri Lanka time. */
export const SIM_START = Date.UTC(2027, 0, 18, 12, 30);
/** Sessions on one day start this far apart. */
export const SESSION_GAP_MS = 3 * 3_600_000;
/** Time a "Not now" tap takes. */
export const SKIP_MS = 3000;
/** "Wrong answers close together": wrongs (and "I don't know") among this many last answers of the session. */
export const RECENT_WINDOW = 8;
/** Safety stop: more steps than this in one session is a runner or engine bug. */
const MAX_STEPS = 1000;

export type LogLine = {
  /** Simulated day, 0-based. `session`: the student's session number (1-based, every startSession call). */
  day: number; session: number;
  /** Cards served so far in this session (0 on the start line). */
  n: number;
  kind: "start" | "card" | "skip" | "confirm-skip" | "end" | "offer-extend" | "moment" | "quit";
  served?: Served; choice?: Choice; right?: boolean; ms?: number; end?: EndInfo; moment?: Moment;
  /** On card / skip / confirm-skip / quit lines: the session's effort was above the hidden stamina when it was served. */
  hiddenFatigued?: boolean;
  /** start: the session budget the engine asked (`state.session.budget`) and the four profile numbers. */
  budget?: number; profile?: { comfort: number; memory: number; h3Share: number; stamina: number };
  /** start: the engine treated it as a comeback session; the "teaching now" topic at the start. */
  comeback?: boolean; topic?: { id: string; source: "class" | "student" } | null;
  /** skip: the reason given and the section's remind day afterwards (simulated day, null if none). */
  skipReason?: SkipReason; remindDay?: number | null;
  /** confirm-skip: the value message shown. */
  value?: ValueMessage;
  /** offer-extend: whether the student took "5 more". */
  accepted?: boolean;
  /** card: the hidden knowledge of the card's skill before and after the answer. */
  kBefore?: number; kAfter?: number;
  /** card: the wrong option's error tag, if any. */
  tag?: string;
};

export type StudentLog = {
  persona: string; seed: number; lines: LogLine[]; profileByDay: (Profile & { day: number })[];
  knowledge: { day0: number; day14: number; dayEnd: number }; quitAppDay: number | null;
  traits: Traits; contentExhausted: number;
};

export type RunOpts = { days: number; seed: number; start: number; cfg: Config };

/** A persona's seed: independent per persona index, repeatable per run seed. */
export function personaSeed(runSeed: number, index: number): number {
  let x = (Math.imul(runSeed >>> 0, 0x9e3779b1) ^ Math.imul(index + 1, 0x85ebca6b)) >>> 0;
  x = Math.imul(x ^ (x >>> 16), 0x7feb352d) >>> 0;
  x = Math.imul(x ^ (x >>> 15), 0x846ca68b) >>> 0;
  return (x ^ (x >>> 16)) >>> 0;
}

const UNIT_ORDER = ["phy.mech", "phy.therm", "phy.elec"];

/** Topics in content order within Mechanics, then Thermal, then Electricity (other units after, in content order). */
export function topicOrder(content: Content): string[] {
  const rank = (u: string) => { const i = UNIT_ORDER.indexOf(u); return i < 0 ? UNIT_ORDER.length : i; };
  return Object.values(content.topics).map((t, i) => ({ t, i }))
    .sort((a, b) => rank(a.t.unit) - rank(b.t.unit) || a.i - b.i).map((x) => x.t.id);
}

const four = (p: Profile) => ({ comfort: p.comfort, memory: p.memory, h3Share: p.h3Share, stamina: p.stamina });

/** Plays `opts.days` simulated days for one persona. Pure: same inputs, identical log. */
export function runStudent(p: Persona | PersonaSpec, content: Content, opts: RunOpts): StudentLog {
  const { days, seed, start, cfg } = opts;
  const persona = resolvePersona(p, content);
  let h: Hidden = newHidden(persona, content, (seed ^ 0x5bd1e995) >>> 0);
  let state: State = newState(persona.id, seed, cfg);
  const lines: LogLine[] = [];
  const profileByDay: StudentLog["profileByDay"] = [];
  const topics = topicOrder(content);
  const day0 = meanKnowledge(h, content);
  let day14: number | null = null;
  let quitAppDay: number | null = null;
  let contentExhausted = 0;
  let session = 0;
  // An engine day number, to turn remind days into simulated days.
  const engineDay0 = Math.floor((start + cfg.tzOffsetMinutes * 60_000) / DAY_MS);

  if (persona.traits.classPace === null && topics.length > 0) state = setCurrentTopic(state, topics[0]!, "student");

  for (let d = 0; d < days; d++) {
    if (d === 14) day14 = meanKnowledge(h, content);
    h = decay(h, d);
    if (persona.traits.classPace !== null && topics.length > 0)
      state = setCurrentTopic(state, topics[Math.min(topics.length - 1, Math.floor(d / persona.traits.classPace))]!, "class");
    const plays = h.quitApp ? 0 : playsToday(h, 0, d);
    for (let k = 0; k < plays && !h.quitApp; k++) {
      session += 1;
      const r = playSession(state, h, content, cfg, start + d * DAY_MS + k * SESSION_GAP_MS, d, session, engineDay0, lines);
      state = r.state;
      h = r.hidden;
      if (r.end.kind === "content-exhausted") contentExhausted += 1;
      if (h.quitApp && quitAppDay === null) quitAppDay = d;
    }
    profileByDay.push({ day: d, ...JSON.parse(JSON.stringify(state.profile)) as Profile });
  }
  const dayEnd = meanKnowledge(h, content);
  return {
    persona: persona.id, seed, lines, profileByDay,
    knowledge: { day0, day14: day14 ?? dayEnd, dayEnd }, quitAppDay, traits: persona.traits, contentExhausted,
  };
}

/** One session from start to end. Appends its lines; returns the new engine state, hidden student and the end. */
function playSession(state0: State, h0: Hidden, content: Content, cfg: Config, startAt: number, day: number,
  session: number, engineDay0: number, lines: LogLine[]): { state: State; hidden: Hidden; end: EndInfo } {
  let h = h0;
  let now = startAt;
  let n = 0;
  let quit = false;
  const recent: boolean[] = [];
  const log = (l: Omit<LogLine, "day" | "session" | "n">) => lines.push({ day, session, n, ...l });
  const logMoments = (st: Step) => { for (const m of st.moments) log({ kind: "moment", moment: m }); };

  let st = startSession(state0, content, now, cfg);
  const started = st.events.find((e) => e.type === "session_start");
  if (started) {
    log({ kind: "start", budget: st.state.session?.budget ?? (started.data.budget as number), profile: four(state0.profile), comeback: started.data.comeback as boolean, topic: state0.currentTopic });
  }
  for (let steps = 0; ; steps++) {
    if (steps > MAX_STEPS) throw new Error(`runner: session ${session} on day ${day} did not end after ${MAX_STEPS} steps`);
    logMoments(st);
    const nx = st.next;
    if (nx.kind === "end") {
      log({ kind: "end", end: nx.end });
      if (started) h = sessionEnded(h, quit);
      return { state: st.state, hidden: h, end: nx.end };
    }
    if (nx.kind === "offer-extend") {
      const [want, h2] = wantsExtend(h);
      h = h2;
      log({ kind: "offer-extend", accepted: want });
      st = want ? extend(st.state, content, now, cfg) : endSession(st.state, content, now, cfg);
      continue;
    }
    if (nx.kind === "confirm-skip") throw new Error("runner: unexpected confirm-skip outside a skip");
    const sv = nx.card;
    n += 1;
    const effort = st.state.session?.spent ?? 0;
    const hiddenFatigued = effort > h.traits.stamina;
    const recentWrong = recent.slice(-RECENT_WINDOW).filter((r) => !r).length;
    const out = decide(h, content, sv, { effort, recentWrong }, day);
    h = out.hidden;
    const a = out.action;
    if (a.kind === "quit") {
      log({ kind: "quit", served: sv, hiddenFatigued });
      quit = true;
      st = endSession(st.state, content, now, cfg, { left: true });
      continue;
    }
    if (a.kind === "skip") {
      now += SKIP_MS;
      const input = { card: sv.card, ...(a.reason !== undefined ? { reason: a.reason } : {}) };
      st = skip(st.state, content, input, now, cfg);
      if (st.next.kind === "confirm-skip") {
        log({ kind: "confirm-skip", served: sv, value: st.next.value, hiddenFatigued });
        st = skip(st.state, content, { ...input, confirmed: true }, now, cfg);
      }
      const rd = st.state.sections[sv.section]?.remindDay ?? null;
      log({ kind: "skip", served: sv, ...(a.reason !== undefined ? { skipReason: a.reason } : {}), remindDay: rd === null ? null : rd - engineDay0, hiddenFatigued });
      continue;
    }
    now += a.ms;
    const kBefore = h.k[sv.skill] ?? 0;
    st = answer(st.state, content, { card: sv.card, choice: a.choice, ms: a.ms }, now, cfg);
    if (!st.feedback) throw new Error(`runner: answer to ${sv.card} on day ${day} was stale`);
    const right = st.feedback.right;
    const tag = st.feedback.tag;
    h = learn(h, sv, right, day, tag);
    recent.push(right);
    log({ kind: "card", served: sv, choice: a.choice, right, ms: a.ms, hiddenFatigued, kBefore, kAfter: h.k[sv.skill] ?? 0, ...(tag !== undefined ? { tag } : {}) });
  }
}

// ---------- CLI ----------

type Args = { days: number; seed: number; packs: string; out: string | null; persona: string | null; config: string | null };

function parseArgs(argv: string[]): Args {
  const a: Args = { days: 28, seed: 1, packs: "all", out: null, persona: null, config: null };
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i]!;
    const v = argv[i + 1];
    const need = () => { if (v === undefined) throw new Error(`missing value for ${k}`); i++; return v; };
    if (k === "--days") a.days = Number(need());
    else if (k === "--seed") a.seed = Number(need());
    else if (k === "--packs") a.packs = need();
    else if (k === "--out") a.out = need();
    else if (k === "--persona") a.persona = need();
    else if (k === "--config") a.config = need();
    else throw new Error(`unknown option ${k}`);
  }
  if (!Number.isInteger(a.days) || a.days < 1) throw new Error("--days must be a positive integer");
  if (!Number.isInteger(a.seed)) throw new Error("--seed must be an integer");
  return a;
}

function isObj(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null && !Array.isArray(x);
}

/** `over` deep-merged onto `base` (objects merge, everything else replaces). */
export function deepMerge<T>(base: T, over: unknown): T {
  if (!isObj(base) || !isObj(over)) return (over === undefined ? base : over) as T;
  const out: Record<string, unknown> = { ...base };
  for (const [k, v] of Object.entries(over)) out[k] = k in base ? deepMerge((base as Record<string, unknown>)[k], v) : v;
  return out as T;
}

async function main(argv: string[]): Promise<number> {
  const { readFileSync, writeFileSync, mkdirSync } = await import("node:fs");
  const { join, dirname, resolve } = await import("node:path");
  const { fileURLToPath } = await import("node:url");
  const { loadFromRepo } = await import("../src/node/load.js");
  const { personas } = await import("./personas.js");
  const { runChecks } = await import("./checks.js");

  const args = parseArgs(argv);
  const engineDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  const content = loadFromRepo(resolve(engineDir, ".."), args.packs === "all" ? undefined : args.packs.split(","));
  const cfg: Config = args.config ? deepMerge(defaultConfig, JSON.parse(readFileSync(args.config, "utf8"))) : defaultConfig;
  const out = args.out ?? join("runs", new Date().toISOString().replace(/[:.]/g, "-"));
  const chosen = personas.map((p, i) => ({ p, i })).filter(({ p }) => args.persona === null || p.id === args.persona);
  if (chosen.length === 0) throw new Error(`no persona ${args.persona}`);
  mkdirSync(out, { recursive: true });
  const logs: StudentLog[] = [];
  for (const { p, i } of chosen) {
    const log = runStudent(p, content, { days: args.days, seed: personaSeed(args.seed, i), start: SIM_START, cfg });
    logs.push(log);
    writeFileSync(join(out, `${log.persona}.log.jsonl`), log.lines.map((l) => JSON.stringify(l)).join("\n") + "\n");
    const { lines: _lines, ...summary } = log;
    void _lines;
    writeFileSync(join(out, `${log.persona}.summary.json`), JSON.stringify(summary, null, 2) + "\n");
  }
  const checks = runChecks(logs, cfg);
  writeFileSync(join(out, "checks.json"), JSON.stringify(checks, null, 2) + "\n");
  const w = Math.max(...checks.map((c) => c.name.length));
  console.log(`${logs.length} students, ${args.days} days, seed ${args.seed} → ${out}`);
  for (const c of checks) console.log(`${c.pass ? "PASS" : "FAIL"}  ${c.name.padEnd(w)}  ${c.detail}`);
  return checks.every((c) => c.pass) ? 0 : 1;
}

const isMain = process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  main(process.argv.slice(2)).then((code) => { process.exitCode = code; }, (e: unknown) => {
    console.error(e instanceof Error ? e.message : e);
    process.exitCode = 2;
  });
}
