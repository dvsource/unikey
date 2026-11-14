// Judge packets, report collector and summary input (spec §13 "What each judge agent is told", "Two extra judges",
// "Output", "The design changes when..."). Pure functions first; the thin CLI at the bottom reads and writes files.
//   npm run judge -- packets --run runs/<name>   → runs/<name>/judge/*.input.md (+ blind-N.key.json)
//   npm run judge -- collect --run runs/<name>   → runs/<name>/judge/summary-input.md
// No clock and no randomness: the same run folder gives byte-identical packets.
import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import type { Content, EndInfo, Height } from "../src/index.js";
import type { LogLine, StudentLog } from "./run.js";
import type { CheckResult } from "./checks.js";
import { personas } from "./personas.js";

export type Summary = Omit<StudentLog, "lines">;
/** A run folder as read from disk: `<id>.summary.json`, `<id>.log.jsonl`, `checks.json`. */
export type RunFiles = { summaries: Summary[]; lines: Record<string, LogLine[]>; checks: CheckResult[] | null };
export type Prompts = { student: string; blind: string; truth: string; summary: string };
export type Invalid = { file: string; reason: string };

/** Blind files are numbered (`blind-1` … `blind-8`, in BLIND_PAIRS order) so no file name names a persona. */
export const blindName = (i: number) => `blind-${i + 1}`;

/** The eight blind pairs (brief, Task 12). Their two questions each live in `blind-comparison.md`. */
export const BLIND_PAIRS = [
  ["strong", "weak-stubborn"],
  ["weak-stubborn", "weak-impatient"],
  ["smart-impatient", "strong"],
  ["memory-good-calc-weak", "calc-strong-memory-poor"],
  ["underconfident-skipper", "confident-misconceptions"],
  ["average-noclass", "average-fastclass"],
  ["slow-reader", "fast-guesser"],
  ["steady-five-min", "binge-quit"],
] as const satisfies readonly (readonly [string, string])[];

export const RUBRIC = ["fit", "reaction", "skips", "adjusting", "workload", "progress", "quit"] as const;
export type RubricKey = (typeof RUBRIC)[number];
const RUBRIC_TITLE: Record<RubricKey, string> = {
  fit: "Fit", reaction: "Reaction", skips: "Skips", adjusting: "Kept adjusting", workload: "Workload", progress: "Progress shown", quit: "Would I quit?",
};
const PROFILE_NUMBERS = ["comfort", "memory", "h3Share", "stamina"] as const;
/** "The design changes when ... a weak persona's hidden knowledge is flat": weak = prior at most this; flat = gain below FLAT_GAIN. */
export const WEAK_PRIOR = 0.3;
export const FLAT_GAIN = 0.05;

/** Everything above this marker in a prompt file is copied into packets; below it are notes for the packet builder. */
export const BUILDER_MARKER = "<!-- builder:";

/** The part of a prompt file that goes into a packet. */
export function promptPart(md: string): string {
  const i = md.indexOf(BUILDER_MARKER);
  return (i < 0 ? md : md.slice(0, i)).trimEnd() + "\n";
}

// ---------- readable log ----------

const HEIGHT_WORD: Record<Height, string> = { 1: "easy", 2: "guided", 3: "full" };
const HEIGHT_PHRASE: Record<Height, string> = { 1: "easy cards", 2: "guided problems", 3: "full problems" };
const UNIT_NAME: Record<string, string> = { "phy.mech": "Mechanics", "phy.therm": "Thermal physics", "phy.elec": "Current electricity" };
const END_WORDS: Record<EndInfo["kind"], string> = {
  "budget": "planned session done",
  "bad-day": "stopped early: a bad day",
  "extended-done": "the 5 extra cards done",
  "daily-cap": "today's limit reached",
  "content-exhausted": "nothing left to ask",
  "left": "the student left mid-session",
  "interrupted": "interrupted",
};
const SKIP_WORDS = { "not-learned": "not learned yet", "too-hard": "too hard", "later": "later" } as const;

const pad2 = (n: number) => String(n).padStart(2, "0");
/** Simulated day index (0-based) as the packets show it: D01 is the first day. */
export const dayLabel = (d: number) => `D${pad2(d + 1)}`;
const secs = (ms: number) => `${Math.round(ms / 1000)}s`;
const num = (x: number) => String(Math.round(x * 10) / 10);

function namer(content: Content) {
  const skill = (id: string) => content.skills[id]?.name ?? id;
  const section = (id: string) => content.sections[id]?.name ?? id.split("/").pop() ?? id;
  const unit = (id: string) => UNIT_NAME[content.sections[id]?.unit ?? ""] ?? content.sections[id]?.unit ?? "the unit";
  const topic = (id: string) => {
    const t = content.topics[id];
    if (!t) return id;
    const names = t.sections.map(section);
    return names.slice(0, 3).join(", ") + (names.length > 3 ? ", …" : "");
  };
  return { skill, section, unit, topic };
}

/**
 * One student's log as readable text, one event per line: the same for student and blind packets. Shows only what
 * the app saw: never budgets, profile numbers, hidden knowledge, fatigue flags, or why a student walked out.
 */
export function readableLog(lines: LogLine[], content: Content, days: number): string[] {
  const nm = namer(content);
  const out: string[] = [];
  // session number within its day, in order of appearance
  const sessOfDay = new Map<number, number>();
  const perDay = new Map<number, number>();
  for (const l of lines) {
    if (sessOfDay.has(l.session)) continue;
    const k = (perDay.get(l.day) ?? 0) + 1;
    perDay.set(l.day, k);
    sessOfDay.set(l.session, k);
  }
  const at = (l: LogLine) => `${dayLabel(l.day)} S${sessOfDay.get(l.session)}`;
  const cardText = (l: LogLine) => {
    const s = l.served!;
    const borrowed = s.borrowedFrom ? ` (the app points out you are solid on ${nm.skill(s.borrowedFrom)})` : "";
    return `[${s.reason}] H${s.height} ${HEIGHT_WORD[s.height]}  ${nm.section(s.section)} › ${nm.skill(s.skill)}${borrowed}`;
  };
  let lastDay: number | null = null;
  let lastTopic: string | null = null;
  const gap = (from: number, to: number) => {
    // days from..to (inclusive, 0-based) had no session
    if (to < from) return;
    const n = to - from + 1;
    out.push(from === to ? `${dayLabel(from)}  no session` : `${dayLabel(from)}–${dayLabel(to)}  no sessions (${n} days)`);
  };
  for (const l of lines) {
    if (l.kind === "start") {
      gap(lastDay === null ? 0 : lastDay + 1, l.day - 1);
      lastDay = l.day;
      const bits: string[] = [];
      if (l.topic && l.topic.id !== lastTopic) {
        bits.push(l.topic.source === "class" ? `the class is now teaching: ${nm.topic(l.topic.id)}` : `topic picked in the app: ${nm.topic(l.topic.id)}`);
        lastTopic = l.topic.id;
      }
      if (l.comeback) bits.push("the app treats this as a comeback after time away");
      out.push(`${at(l)} start` + (bits.length ? `  — ${bits.join("; ")}` : ""));
      continue;
    }
    const n = `#${l.n}`;
    switch (l.kind) {
      case "card": {
        const act = l.choice === "dont-know" ? `"I don't know"` : l.right ? "right" : "wrong";
        out.push(`${at(l)} ${n}  ${cardText(l)} — ${act}, ${secs(l.ms ?? 0)}`);
        break;
      }
      case "confirm-skip": {
        const v = l.value!;
        const top = v.topSkills.map((t) => `${nm.skill(t.skill)} (${t.solid ? "solid" : "not solid yet"})`).join(", ");
        out.push(`${at(l)} ${n}  before the skip the app shows: "${nm.section(v.section)} is about ${v.sharePct}% of ${nm.unit(v.section)} marks. Skills that give most of them: ${top}." — the student skips anyway`);
        break;
      }
      case "skip": {
        const why = l.skipReason ? `reason "${SKIP_WORDS[l.skipReason]}"` : "no reason given";
        const back = l.remindDay === null || l.remindDay === undefined ? "no return day set" : `section comes back from ${dayLabel(l.remindDay)}`;
        out.push(`${at(l)} ${n}  ${cardText(l)} — skipped ("Not now"), ${why}; ${back}`);
        break;
      }
      case "quit": {
        out.push(`${at(l)} ${n}  ${cardText(l)} — closed the app without answering`);
        break;
      }
      case "offer-extend":
        out.push(`${at(l)} after #${l.n}  the app offers "5 more" — ${l.accepted ? "taken" : "declined"}`);
        break;
      case "moment":
        out.push(`${at(l)} after #${l.n}  ★ moment shown: ${momentText(l, nm)}`);
        break;
      case "end": {
        const e = l.end!;
        out.push(`${at(l)} end  — end: ${END_WORDS[e.kind]}, ${num(e.effort)} effort, ${e.cards} cards (${e.right} right), fixed ${e.fixed}${e.streakKept ? ", streak kept" : ""}`);
        break;
      }
    }
  }
  gap(lastDay === null ? 0 : lastDay + 1, days - 1);
  out.push(`(the four weeks end after ${dayLabel(days - 1)})`);
  return out;
}

function momentText(l: LogLine, nm: ReturnType<typeof namer>): string {
  const m = l.moment!;
  switch (m.type) {
    case "height-up": return `"${nm.skill(m.skill)}: ${HEIGHT_PHRASE[m.from]} → ${HEIGHT_PHRASE[m.to]}"`;
    case "then-wrong-now-right": return `"${nm.skill(m.skill)}: wrong on ${dayLabel(l.day - (m.nowDay - m.thenDay))}, right now"`;
    case "avoided-now-done": return `"${nm.section(m.section)}: you avoided it, now you have done it"`;
    case "missing-piece-fixed": return `"${nm.skill(m.skill)}: missing piece fixed"`;
    case "section-solid": return `"${nm.section(m.section)}: section solid"`;
  }
}

/** What the log lines mean; shown above every log. Not part of the log (quotes are checked against event lines only). */
export const LOG_LEGEND = `How to read the log. One line per event.
- \`D03 S1 #4\` is day 3 of 28, the first session that day, the 4th card of that session. \`D03 S1 start\` and \`D03 S1 end\` open and close a session. \`after #4\` means between card 4 and card 5.
- \`[repair:missing-piece]\` is the app's own reason for choosing that card (list below).
- \`H1 easy\`, \`H2 guided\`, \`H3 full\` is how demanding the card is: an easy theory or recall card, a guided problem, or a full exam-style problem.
- Then the section of the syllabus › the skill, what the student did (right, wrong, "I don't know", skipped with "Not now", or closed the app), and how many seconds it took.
- Session ends give how the session ended, the effort it took (an easy card costs 1, a guided card 1.5, a full problem 4, a wrong answer 1 more, "I don't know" nothing extra; the app allows at most 40 a day), the cards answered, how many were right, and how many missing pieces were fixed.
- After every answer the app shows whether it was right. After a wrong answer it shows the mistake's message and the explanation; "I don't know" gets the explanation with no negative message and costs no extra effort. Then the next card comes. The app shows no score, no backlog and no "due" count.
- "★ moment shown" is a message the app showed to point out progress. "5 more" is the app's offer of five extra cards at the end.

The app's reasons:
- open:liked: an opening card from a section the student does well in or enjoys
- close:winnable: a closing card picked so the session ends on a likely win
- repair:missing-piece: after a wrong answer, an easier card on the piece that was probably missing
- repair:confidence: an easy card on the same skill to rebuild confidence
- repair:return: the skill that went wrong comes back, to check it is fixed
- due-review: something learned before, brought back before it fades
- new:class-topic: a new skill from what the class is teaching now (or the topic picked in the app)
- new:exam-weight: a new skill chosen because it carries many exam marks
- side-door: a section the student skipped earlier, coming back gently with one easy card
- skipped-drip: one very easy card from a skipped section, not labelled as that section
- comfort-correction: an easier (or more fitting) card because recent answers went worse or better than planned
- extend:liked: one of the "5 more" cards
- comeback:solid: after time away, a skill the student was solid on, to restart with a win
`;

/** The event lines of a packet: lines that start with a day label (the legend and prose are not quotable). */
export function eventLines(packet: string): string[] {
  return packet.split("\n").filter((l) => /^D\d\d[ –]/.test(l));
}

// ---------- packets ----------

const sheetOf = (id: string) => personas.find((p) => p.id === id)?.sheet;

/** Deterministic 32-bit mix (no Math.random): X/Y order of a blind pair from the two personas' run seeds. */
export function mix32(a: number, b: number): number {
  let x = (Math.imul(a >>> 0, 0x85ebca6b) ^ Math.imul((b >>> 0) + 0x9e3779b9, 0xc2b2ae35)) >>> 0;
  x = Math.imul(x ^ (x >>> 16), 0x7feb352d) >>> 0;
  x = Math.imul(x ^ (x >>> 15), 0x846ca68b) >>> 0;
  return (x ^ (x >>> 16)) >>> 0;
}

export type BlindQuestion = { id: "Q1" | "Q2"; text: string; answerId: string };
/** The pair questions table at the bottom of `blind-comparison.md`: `| a / b | Q1 or Q2 | question | persona id |`. */
export function blindQuestions(blindMd: string): Record<string, BlindQuestion[]> {
  const out: Record<string, BlindQuestion[]> = {};
  const notes = blindMd.slice(Math.max(0, blindMd.indexOf(BUILDER_MARKER)));
  for (const row of notes.split("\n")) {
    const c = row.split("|").map((x) => x.trim());
    if (c.length < 6 || !/^Q[12]$/.test(c[2]!)) continue;
    const [a, b] = c[1]!.split("/").map((x) => x.trim());
    const key = `${a}/${b}`;
    (out[key] ??= []).push({ id: c[2] as "Q1" | "Q2", text: c[3]!, answerId: c[4]!.replace(/`/g, "") });
  }
  for (const [a, b] of BLIND_PAIRS) {
    const qs = out[`${a}/${b}`];
    if (!qs || qs.length !== 2 || qs[0]!.id !== "Q1" || qs[1]!.id !== "Q2" || qs.some((q) => q.answerId !== a && q.answerId !== b))
      throw new Error(`blind-comparison.md: pair ${a} / ${b} needs rows Q1 and Q2 whose answer is ${a} or ${b}`);
  }
  return out;
}

const ordered = (run: RunFiles) => {
  const rank = (id: string) => { const i = personas.findIndex((p) => p.id === id); return i < 0 ? personas.length : i; };
  return [...run.summaries].sort((a, b) => rank(a.persona) - rank(b.persona) || (a.persona < b.persona ? -1 : 1));
};
const daysOf = (s: Summary) => s.profileByDay.length;

export function studentPacket(prompt: string, sheet: string, log: string[]): string {
  return [
    promptPart(prompt).trimEnd(), "",
    "## Who you are", "", sheet, "",
    "## What happened to you over four weeks", "", LOG_LEGEND, "```text", ...log, "```", "",
  ].join("\n");
}

export function blindPacket(prompt: string, qs: BlindQuestion[], xLog: string[], yLog: string[]): string {
  return [
    promptPart(prompt).trimEnd(), "",
    "## Your two questions", "",
    ...qs.map((q) => `- **${q.id}:** ${q.text}`), "",
    LOG_LEGEND,
    "## Student X", "", "```text", ...xLog, "```", "",
    "## Student Y", "", "```text", ...yLog, "```", "",
  ].join("\n");
}

export function truthPacket(prompt: string, s: Summary, lines: LogLine[]): string {
  const r = (x: number) => (Math.round(x * 1000) / 1000).toString();
  const rows = s.profileByDay.map((p) => `| ${p.day} | ${r(p.comfort)} | ${r(p.memory)} | ${r(p.h3Share)} | ${r(p.stamina)} |`);
  // what the student did each day, from the log (so the judge can see what the engine was looking at)
  const act = new Map<number, { sessions: Set<number>; cards: number; right: number; dk: number; skips: number; left: number; why: string[]; tired: number; ms: number[] }>();
  for (const l of lines) {
    const a = act.get(l.day) ?? { sessions: new Set<number>(), cards: 0, right: 0, dk: 0, skips: 0, left: 0, why: [], tired: 0, ms: [] };
    act.set(l.day, a);
    a.sessions.add(l.session);
    if (l.kind === "card") { a.cards++; if (l.right) a.right++; if (l.choice === "dont-know") a.dk++; a.ms.push(l.ms ?? 0); }
    if (l.kind === "skip") a.skips++;
    if (l.kind === "quit") { a.left++; if (l.quitReason) a.why.push(l.quitReason); }
    if ((l.kind === "card" || l.kind === "skip") && l.hiddenFatigued) a.tired++;
  }
  const med = (xs: number[]) => { if (!xs.length) return "–"; const s2 = [...xs].sort((a, b) => a - b); return secs(s2[Math.floor(s2.length / 2)]!); };
  const actRows = [...act.entries()].map(([d, a]) =>
    `| ${d} | ${a.sessions.size} | ${a.cards} | ${a.right} | ${a.dk} | ${a.skips} | ${a.left}${a.why.length ? ` (${a.why.join(", ")})` : ""} | ${a.tired} | ${med(a.ms)} |`);
  return [
    promptPart(prompt).trimEnd(), "",
    `## Student: ${s.persona}`, "",
    "### The hidden student's real traits", "", "```json", JSON.stringify(s.traits, null, 2), "```", "",
    "### Hidden knowledge (mean over all skills, 0 to 1)", "",
    `Day 0: ${r(s.knowledge.day0)} · Day 14: ${r(s.knowledge.day14)} · End: ${r(s.knowledge.dayEnd)}` +
      (s.quitAppDay === null ? "" : ` · The student stopped using the app on day ${s.quitAppDay}.`), "",
    "### What the engine learned: the four profile numbers at the end of each day", "",
    "| Day | comfort | memory | h3Share | stamina |", "|---|---|---|---|---|", ...rows, "",
    "### What the student did each day (from the log)", "",
    "| Day | Sessions | Cards | Right | \"I don't know\" | Skips | Left mid-session (hidden reason) | Answers past real stamina | Median answer time |",
    "|---|---|---|---|---|---|---|---|---|", ...actRows, "",
  ].join("\n");
}

/** Every packet and key file for a run, by file name. */
export function buildPackets(run: RunFiles, content: Content, prompts: Prompts): Record<string, string> {
  const files: Record<string, string> = {};
  const byId = new Map(ordered(run).map((s) => [s.persona, s]));
  const log = (id: string) => readableLog(run.lines[id] ?? [], content, daysOf(byId.get(id)!));
  for (const s of byId.values()) {
    const sheet = sheetOf(s.persona);
    if (sheet === undefined) throw new Error(`no persona sheet for ${s.persona}`);
    files[`student-${s.persona}.input.md`] = studentPacket(prompts.student, sheet, log(s.persona));
  }
  const questions = blindQuestions(prompts.blind);
  for (const [i, [a, b]] of BLIND_PAIRS.entries()) {
    const sa = byId.get(a), sb = byId.get(b);
    if (!sa || !sb) continue;
    const aIsX = (mix32(sa.seed, sb.seed) & 1) === 0;
    const [x, y] = aIsX ? [a, b] : [b, a];
    const qs = questions[`${a}/${b}`]!;
    const name = blindName(i);
    files[`${name}.input.md`] = blindPacket(prompts.blind, qs, log(x), log(y));
    files[`${name}.key.json`] = JSON.stringify({
      blind: i + 1, pair: [a, b], X: x, Y: y,
      questions: qs.map((q) => ({ id: q.id, text: q.text, answerId: q.answerId, answer: q.answerId === x ? "X" : "Y" })),
    }, null, 2) + "\n";
  }
  for (const s of byId.values()) files[`truth-${s.persona}.input.md`] = truthPacket(prompts.truth, s, run.lines[s.persona] ?? []);
  return files;
}

// ---------- reports ----------

/** The first fenced ```json block of a report and the prose after it. */
export function parseReport(text: string): { json?: string; prose: string; error?: string } {
  const m = /```json[^\n]*\n([\s\S]*?)\n?```/.exec(text);
  if (!m) return { prose: text, error: "no ```json block" };
  return { json: m[1]!, prose: text.slice(m.index + m[0].length).trim() };
}

const norm = (s: string) => s.replace(/\s+/g, " ").trim();
/** A quote counts when, whitespace collapsed, it is at least 12 characters and part of one event line of the packet. */
export function quoteInLog(quote: string, events: string[]): boolean {
  const q = norm(quote);
  return q.length >= 12 && events.some((l) => norm(l).includes(q));
}

export type StudentScore = {
  persona: string; scores: Partial<Record<RubricKey, number | null>>; quotes: Partial<Record<RubricKey, string[]>>;
  quitPoint: string | null; worst: string | null; prose: string;
};

/** A served card's line: answered, skipped with "Not now", or left by closing the app (not the value-message line). */
const isCardOrSkip = (l: string) => / \[[a-z:-]+\] H[123] /.test(l);
const isObj = (x: unknown): x is Record<string, unknown> => typeof x === "object" && x !== null && !Array.isArray(x);
const QUIT_POINT = /^D(\d\d) S(\d+) #(\d+)$/;

/** Validates one student report against that student's packet. Each bad score is listed and left out; the rest count. */
export function validateStudent(persona: string, file: string, text: string | undefined, packet: string | undefined):
  { score: StudentScore | null; invalid: Invalid[]; notes: Invalid[] } {
  const bad = (reason: string): { score: null; invalid: Invalid[]; notes: Invalid[] } => ({ score: null, invalid: [{ file, reason }], notes: [] });
  if (text === undefined) return bad("missing");
  if (packet === undefined) return bad(`its packet student-${persona}.input.md is missing, quotes cannot be checked`);
  const p = parseReport(text);
  if (p.error) return bad(p.error);
  let j: unknown;
  try { j = JSON.parse(p.json!); } catch (e) { return bad(`invalid JSON (${e instanceof Error ? e.message : String(e)})`); }
  if (!isObj(j) || !isObj(j.scores)) return bad("the JSON has no \"scores\" object");
  const quotes = isObj(j.quotes) ? j.quotes : {};
  const events = eventLines(packet);
  const invalid: Invalid[] = [];
  const s: StudentScore = { persona, scores: {}, quotes: {}, quitPoint: null, worst: null, prose: p.prose };
  for (const k of RUBRIC) {
    const v = j.scores[k];
    const qs = quotes[k];
    if (v === null) { s.scores[k] = null; continue; } // "does not apply to me": shown as n/a
    if (v === undefined) { invalid.push({ file, reason: `${k}: no score` }); continue; }
    if (typeof v !== "number" || !Number.isInteger(v) || v < 1 || v > 5) { invalid.push({ file, reason: `${k}: score ${JSON.stringify(v)} is not 1–5` }); continue; }
    if (!Array.isArray(qs) || qs.length === 0) { invalid.push({ file, reason: `${k}: no quote` }); continue; }
    const missing = qs.filter((q) => typeof q !== "string" || !quoteInLog(q, events));
    if (missing.length) { invalid.push({ file, reason: `${k}: quote not in the packet log: ${JSON.stringify(missing[0])}` }); continue; }
    s.scores[k] = v;
    s.quotes[k] = qs as string[];
  }
  if (typeof j.quit_point === "string") {
    const m = QUIT_POINT.exec(j.quit_point.trim());
    const line = m ? events.find((l) => l.startsWith(`D${m[1]} S${m[2]} #${m[3]} `) && isCardOrSkip(l)) : undefined;
    if (!m) invalid.push({ file, reason: `quit_point ${JSON.stringify(j.quit_point)} is not like "D07 S1 #5"` });
    else if (!line) invalid.push({ file, reason: `quit_point ${j.quit_point} is not a card or skip line in the packet log` });
    else s.quitPoint = j.quit_point.trim();
  } else if (j.quit_point !== null && j.quit_point !== undefined) invalid.push({ file, reason: "quit_point must be a string or null" });
  if (typeof j.worst_moment === "string") s.worst = j.worst_moment;
  const words = p.prose.split(/\s+/).filter(Boolean).length;
  // Over 200 words is a note, not invalid: the length rule is for readability, the scores and quotes still count.
  const notes: Invalid[] = words > 200 ? [{ file, reason: `voice text is ${words} words (limit 200); scores still counted` }] : [];
  return { score: s, invalid, notes };
}

type Key = { pair: [string, string]; X: string; Y: string; questions: { id: string; text: string; answerId: string; answer: "X" | "Y" }[] };
export type BlindResult = { pair: [string, string]; asked: number; correct: number; rows: { q: Key["questions"][number]; given: string; ok: boolean; evidence: string }[] };

export function validateBlind(file: string, text: string | undefined, keyText: string | undefined): { result: BlindResult | null; invalid: Invalid[] } {
  const bad = (reason: string) => ({ result: null, invalid: [{ file, reason }] });
  if (keyText === undefined) return bad("its key file is missing");
  let key: Key;
  try { key = JSON.parse(keyText) as Key; } catch { return bad(`key file ${file.replace(/\.report\.md$/, ".key.json")} is not valid JSON`); }
  if (text === undefined) return bad("missing");
  const p = parseReport(text);
  if (p.error) return bad(p.error);
  let j: unknown;
  try { j = JSON.parse(p.json!); } catch (e) { return bad(`invalid JSON (${e instanceof Error ? e.message : String(e)})`); }
  if (!isObj(j) || !isObj(j.answers)) return bad("the JSON has no \"answers\" object");
  const answers = j.answers;
  const evidence = isObj(j.evidence) ? j.evidence : {};
  const invalid: Invalid[] = [];
  const res: BlindResult = { pair: key.pair, asked: 0, correct: 0, rows: [] };
  for (const q of key.questions) {
    const k = Object.keys(answers).find((a) => a.trim() === q.id || a.trim().startsWith(`${q.id}:`) || a.trim().startsWith(`${q.id} `) || norm(a) === norm(q.text));
    const given = k === undefined ? undefined : answers[k];
    if (given !== "X" && given !== "Y" && given !== "cannot tell") {
      invalid.push({ file, reason: `${q.id}: answer ${JSON.stringify(given)} is not "X", "Y" or "cannot tell"` });
      continue;
    }
    const ev = k === undefined ? undefined : evidence[k] ?? evidence[q.id];
    res.asked++;
    const ok = given === q.answer;
    if (ok) res.correct++;
    res.rows.push({ q, given, ok, evidence: ev === undefined ? "" : typeof ev === "string" ? ev : JSON.stringify(ev) });
  }
  return { result: res.asked ? res : null, invalid };
}

type Miss = { number: string; engine: unknown; truth: unknown; by_day: unknown };
export function validateTruth(file: string, text: string | undefined): { wrong: Miss[] | null; right: unknown[]; invalid: Invalid[] } {
  const bad = (reason: string) => ({ wrong: null, right: [], invalid: [{ file, reason }] });
  if (text === undefined) return bad("missing");
  const p = parseReport(text);
  if (p.error) return bad(p.error);
  let j: unknown;
  try { j = JSON.parse(p.json!); } catch (e) { return bad(`invalid JSON (${e instanceof Error ? e.message : String(e)})`); }
  if (!isObj(j) || !Array.isArray(j.wrong)) return bad("the JSON has no \"wrong\" list");
  const invalid: Invalid[] = [];
  const wrong: Miss[] = [];
  for (const w of j.wrong) {
    if (!isObj(w) || !(PROFILE_NUMBERS as readonly string[]).includes(String(w.number))) { invalid.push({ file, reason: `wrong entry ${JSON.stringify(w)}: "number" must be one of ${PROFILE_NUMBERS.join(", ")}` }); continue; }
    wrong.push({ number: String(w.number), engine: w.engine, truth: w.truth, by_day: w.by_day });
  }
  return { wrong, right: Array.isArray(j.right) ? j.right : [], invalid };
}

// ---------- collect ----------

const signed = (x: number) => { const r = Math.round(x * 1000) / 1000; return `${r >= 0 ? "+" : "−"}${Math.abs(r).toFixed(3)}`; };
const cell = (s: string) => s.replace(/\|/g, "\\|").replace(/\n/g, " ");

/** Reads every report among `files` (judge folder, by file name) and writes the summary agent's input. */
export function collect(run: RunFiles, files: Record<string, string>, summaryPrompt: string): { summaryInput: string; invalid: Invalid[]; notes: Invalid[] } {
  const sums = ordered(run);
  const invalid: Invalid[] = [];
  const notes: Invalid[] = [];
  const students: StudentScore[] = [];
  for (const s of sums) {
    const name = `student-${s.persona}`;
    const v = validateStudent(s.persona, `${name}.report.md`, files[`${name}.report.md`], files[`${name}.input.md`]);
    invalid.push(...v.invalid);
    notes.push(...v.notes);
    if (v.score) students.push(v.score);
  }
  const blind: BlindResult[] = [];
  /** Pairs with a packet (both personas in the run): number, pair, result if valid. */
  const pairs: { n: number; a: string; b: string; result: BlindResult | null }[] = [];
  for (const [i, [a, b]] of BLIND_PAIRS.entries()) {
    const name = blindName(i);
    if (files[`${name}.input.md`] === undefined) continue;
    const v = validateBlind(`${name}.report.md`, files[`${name}.report.md`], files[`${name}.key.json`]);
    invalid.push(...v.invalid);
    if (v.result) blind.push(v.result);
    pairs.push({ n: i + 1, a, b, result: v.result });
  }
  const truth: { persona: string; wrong: Miss[] }[] = [];
  for (const s of sums) {
    const name = `truth-${s.persona}`;
    const v = validateTruth(`${name}.report.md`, files[`${name}.report.md`]);
    invalid.push(...v.invalid);
    if (v.wrong) truth.push({ persona: s.persona, wrong: v.wrong });
  }
  const scoreOf = new Map(students.map((x) => [x.persona, x]));
  const out: string[] = [promptPart(summaryPrompt).trimEnd(), "", "---", "", "# Summary input", ""];
  out.push(`${sums.length} students, ${sums[0] ? daysOf(sums[0]) : 0} days. Valid reports: ${students.length} student, ${blind.length} blind, ${truth.length} truth check. Invalid entries: ${invalid.length}.`, "");

  // design lines
  const quitEarly: string[] = [];
  for (const s of sums) {
    const qp = scoreOf.get(s.persona)?.quitPoint;
    const m = qp ? QUIT_POINT.exec(qp) : null;
    if (m && Number(m[1]) < 7) quitEarly.push(`${s.persona}: judge's quit point ${qp}`);
    if (s.quitAppDay !== null && s.quitAppDay + 1 < 7) quitEarly.push(`${s.persona}: stopped using the app on ${dayLabel(s.quitAppDay)}`);
  }
  const allMissed = blind.filter((b) => b.correct === 0);
  const failed = blind.filter((b) => b.correct < b.asked);
  const flat = sums.filter((s) => s.traits.prior <= WEAK_PRIOR).map((s) => ({ s, gain: s.knowledge.dayEnd - s.knowledge.day0 }));
  const flatHit = flat.filter((f) => f.gain < FLAT_GAIN);
  const skipCheck = run.checks?.find((c) => c.name === "skip-timing");
  const mark = (met: boolean | null) => (met === null ? "**unknown**" : met ? "**met**" : "**not met**");
  const pairName = (b: BlindResult) => `${b.pair[0]} / ${b.pair[1]}`;
  // A line that depends on judge reports is "not met" only when every report it needs is valid; a hit is a hit.
  const allStudents = students.length === sums.length;
  const nPairs = pairs.length;
  const allPairs = nPairs > 0 && blind.length === nPairs;
  const judgedStudents = `${students.length} of ${sums.length} students judged`;
  const judgedPairs = `${blind.length} of ${nPairs} pairs judged`;
  out.push("## The five \"design must change\" lines (spec §13)", "");
  out.push(`- ${mark(quitEarly.length > 0 ? true : allStudents ? false : null)} — any persona would quit before day 7. Evidence: ${quitEarly.length ? `${quitEarly.join("; ")} (${judgedStudents})` : allStudents ? `no quit point before D07 and no student stopped using the app before D07 (${judgedStudents})` : `no quit before D07 seen so far, but only ${judgedStudents}`}.`);
  out.push(`- ${mark(allMissed.length > 0 ? true : allPairs ? false : null)} — two different personas get near-identical sessions. Evidence: ${allMissed.length ? `every answer wrong or "cannot tell" for ${allMissed.map(pairName).join("; ")} (${judgedPairs})` : allPairs ? `every pair had at least one answer right (${judgedPairs})` : `no pair with every answer missed so far, but only ${judgedPairs}`}.`);
  out.push(`- ${mark(flat.length ? flatHit.length > 0 : null)} — a weak persona's hidden knowledge is flat after 4 weeks (weak: prior ≤ ${WEAK_PRIOR}; flat: gain < ${FLAT_GAIN}). Evidence: ${flat.length ? flat.map((f) => `${f.s.persona} ${f.s.knowledge.day0.toFixed(2)} → ${f.s.knowledge.dayEnd.toFixed(2)} (${f.gain < FLAT_GAIN ? "flat" : "not flat"}, ${signed(f.gain)})${f.s.quitAppDay !== null ? ` (stopped using the app on ${dayLabel(f.s.quitAppDay)})` : ""}`).join("; ") : "no weak persona in the run"}.`);
  out.push(`- ${mark(skipCheck ? !skipCheck.pass : null)} — a skipped section returns the next day, or never. Evidence: ${skipCheck ? `code check skip-timing ${skipCheck.pass ? "passed" : "failed"}: ${skipCheck.detail}` : run.checks === null ? "no checks.json found in the run folder" : "no skip-timing check in checks.json"}.`);
  // The share is over all pairs in the run: missing reports never shrink the denominator.
  const overQuarter = nPairs > 0 && failed.length / nPairs > 0.25;
  const failedText = `${failed.length} of ${nPairs} pairs failed (${nPairs ? Math.round((failed.length / nPairs) * 100) : 0}%)${failed.length ? `: ${failed.map(pairName).join("; ")}` : ""}`;
  out.push(`- ${mark(overQuarter ? true : allPairs ? false : null)} — the blind comparison fails for more than a quarter of pairs (a pair fails unless every answer is right). Evidence: ${allPairs || overQuarter ? `${failedText} (${judgedPairs})` : `only ${judgedPairs}; ${failed.length} failed so far`}.`);
  out.push("");

  out.push("## Rubric scores (1 = the app failed me, 5 = it did this well; — = invalid or missing, n/a = does not apply)", "");
  out.push(`| Persona | ${RUBRIC.map((k) => RUBRIC_TITLE[k]).join(" | ")} | Quit point | Left the app | Worst moment |`);
  out.push(`|---|${RUBRIC.map(() => "---").join("|")}|---|---|---|`);
  for (const s of sums) {
    const sc = scoreOf.get(s.persona);
    const cells = RUBRIC.map((k) => { const v = sc?.scores[k]; return v === undefined ? "—" : v === null ? "n/a" : String(v); });
    out.push(`| ${s.persona} | ${cells.join(" | ")} | ${sc?.quitPoint ?? (sc ? "none" : "—")} | ${s.quitAppDay === null ? "no" : dayLabel(s.quitAppDay)} | ${cell(sc?.worst ?? "")} |`);
  }
  out.push("");

  out.push("## Blind comparison accuracy", "");
  out.push("| Blind file | Pair | Correct / asked | Answers (given → right answer) |", "|---|---|---|---|");
  for (const { n, a, b: bb, result: b } of pairs)
    out.push(b ? `| ${n} | ${a} / ${bb} | ${b.correct} / ${b.asked} | ${b.rows.map((r) => `${r.q.id} ${r.given} → ${r.q.answer} (${r.q.answerId})`).join("; ")} |` : `| ${n} | ${a} / ${bb} | — | no valid report |`);
  const tot = blind.reduce((t, b) => [t[0]! + b.correct, t[1]! + b.asked], [0, 0]);
  out.push("", `All pairs: ${tot[0]} / ${tot[1]} answers right.`, "");
  for (const { n, result: b } of pairs) {
    if (!b) continue;
    out.push(`### blind-${n}: ${pairName(b)}`, "");
    for (const r of b.rows) out.push(`- ${r.q.id} (${r.q.text}) answered ${r.given}, right answer ${r.q.answer} = ${r.q.answerId}${r.ok ? "" : " (missed)"}. Evidence: ${r.evidence || "none given"}`);
    out.push("");
  }

  out.push("## Truth check: where the engine got the student wrong", "");
  out.push("| Persona | Number | Engine | Truth | By day |", "|---|---|---|---|---|");
  for (const t of truth) {
    if (t.wrong.length === 0) out.push(`| ${t.persona} | none | | | |`);
    for (const w of t.wrong) out.push(`| ${t.persona} | ${w.number} | ${cell(String(JSON.stringify(w.engine)))} | ${cell(typeof w.truth === "string" ? w.truth : JSON.stringify(w.truth))} | ${cell(String(w.by_day ?? ""))} |`);
  }
  for (const s of sums) if (!truth.some((t) => t.persona === s.persona)) out.push(`| ${s.persona} | — | no valid report | | |`);
  out.push("");

  out.push("## Code checks (run before any judge)", "", "| Check | Result | Detail |", "|---|---|---|");
  if (run.checks === null) out.splice(out.length - 2, 2, "No checks.json found in the run folder.");
  else for (const c of run.checks) out.push(`| ${c.name} | ${c.pass ? "pass" : "FAIL"} | ${cell(c.detail)} |`);
  out.push("");

  out.push("## Hidden knowledge (mean over all skills)", "", "| Persona | Day 0 | Day 14 | End | Left the app | Content ran out (sessions) |", "|---|---|---|---|---|---|");
  for (const s of sums) out.push(`| ${s.persona} | ${s.knowledge.day0.toFixed(2)} | ${s.knowledge.day14.toFixed(2)} | ${s.knowledge.dayEnd.toFixed(2)} | ${s.quitAppDay === null ? "no" : dayLabel(s.quitAppDay)} | ${s.contentExhausted} |`);
  out.push("");

  out.push("## Invalid entries (not scored)", "");
  if (invalid.length === 0) out.push("None.");
  for (const i of invalid) out.push(`- ${i.file}: ${i.reason}`);
  out.push("");
  if (notes.length) {
    out.push("## Notes (counted, but outside the report rules)", "");
    for (const i of notes) out.push(`- ${i.file}: ${i.reason}`);
    out.push("");
  }

  out.push("## Each student's report", "");
  for (const s of sums) {
    const sc = scoreOf.get(s.persona);
    out.push(`### ${s.persona}`, "", `Sheet: ${sheetOf(s.persona) ?? ""}`, "");
    if (!sc) { out.push("No valid report.", ""); continue; }
    for (const k of RUBRIC) {
      const v = sc.scores[k];
      if (v === undefined) continue;
      out.push(`- ${RUBRIC_TITLE[k]}: ${v === null ? "n/a" : v}${(sc.quotes[k] ?? []).map((q) => `\n  - \`${q.replace(/`/g, "'")}\``).join("")}`);
    }
    out.push(`- Quit point: ${sc.quitPoint ?? "none"}`, `- Worst moment: ${sc.worst ?? ""}`, "", "In the student's voice:", "", sc.prose || "(none)", "");
  }
  return { summaryInput: out.join("\n"), invalid, notes };
}

// ---------- file IO ----------

/** The four prompt files from `engine/judge/prompts`. */
export function loadPrompts(dir: string): Prompts {
  const read = (f: string) => readFile(join(dir, f));
  return { student: read("student-judge.md"), blind: read("blind-comparison.md"), truth: read("truth-check.md"), summary: read("summary.md") };
}

const readFile = (p: string) => readFileSync(p, "utf8");

/** Reads a run folder written by `npm run sim`. */
export function readRun(dir: string): RunFiles {
  const ids = readdirSync(dir).filter((f) => f.endsWith(".summary.json")).map((f) => f.slice(0, -".summary.json".length)).sort();
  if (ids.length === 0) throw new Error(`${dir}: no <id>.summary.json files; run \`npm run sim -- --out ${dir}\` first`);
  const readJson = <T>(f: string): T => {
    const path = join(dir, f);
    if (!existsSync(path)) throw new Error(`${path}: file is missing (the run folder is incomplete; re-run \`npm run sim\`)`);
    try { return JSON.parse(readFile(path)) as T; } catch (e) { throw new Error(`${path}: not valid JSON (${e instanceof Error ? e.message : String(e)})`); }
  };
  const summaries = ids.map((id) => readJson<Summary>(`${id}.summary.json`));
  const lines = Object.fromEntries(ids.map((id) => {
    const path = join(dir, `${id}.log.jsonl`);
    if (!existsSync(path)) throw new Error(`${path}: file is missing (the run folder is incomplete; re-run \`npm run sim\`)`);
    return [id, readFile(path).split("\n").filter(Boolean).map((l, k) => {
      try { return JSON.parse(l) as LogLine; } catch { throw new Error(`${path}: line ${k + 1} is not valid JSON`); }
    })];
  }));
  const checks = existsSync(join(dir, "checks.json")) ? readJson<CheckResult[]>("checks.json") : null;
  return { summaries, lines, checks };
}

async function main(argv: string[]): Promise<number> {
  const [cmd, ...rest] = argv;
  let runDir: string | null = null;
  for (let i = 0; i < rest.length; i++) {
    if (rest[i] === "--run" && rest[i + 1] !== undefined) runDir = rest[++i]!;
    else throw new Error(`unknown option ${rest[i]}`);
  }
  if ((cmd !== "packets" && cmd !== "collect") || runDir === null) throw new Error("usage: npm run judge -- packets|collect --run runs/<name>");
  const engineDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  const prompts = loadPrompts(join(engineDir, "judge", "prompts"));
  const run = readRun(runDir);
  const out = join(runDir, "judge");
  mkdirSync(out, { recursive: true });
  if (cmd === "packets") {
    const { loadFromRepo } = await import("../src/node/load.js");
    const files = buildPackets(run, loadFromRepo(resolve(engineDir, "..")), prompts);
    for (const [f, text] of Object.entries(files)) writeFileSync(join(out, f), text);
    const count = (p: string) => Object.keys(files).filter((f) => f.startsWith(p) && f.endsWith(".input.md")).length;
    console.log(`${count("student-")} student, ${count("blind-")} blind, ${count("truth-")} truth packets → ${out}`);
    console.log("Launching judge agents needs Viraj's go-ahead: see engine/judge/JUDGING.md.");
    return 0;
  }
  const files: Record<string, string> = {};
  for (const f of readdirSync(out)) if (/\.(input\.md|report\.md|key\.json)$/.test(f)) files[f] = readFile(join(out, f));
  if (!Object.keys(files).some((f) => f.endsWith(".input.md"))) throw new Error(`${out}: no packets; run \`npm run judge -- packets --run ${runDir}\` first`);
  if (run.checks === null) console.log(`no checks.json found in ${runDir}`);
  const { summaryInput, invalid, notes } = collect(run, files, prompts.summary);
  writeFileSync(join(out, "summary-input.md"), summaryInput);
  console.log(`summary input → ${join(out, "summary-input.md")} (${invalid.length} invalid entries)`);
  for (const i of invalid) console.log(`  invalid  ${i.file}: ${i.reason}`);
  for (const i of notes) console.log(`  note     ${i.file}: ${i.reason}`);
  return 0;
}

const isMain = process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  main(process.argv.slice(2)).then((code) => { process.exitCode = code; }, (e: unknown) => {
    console.error(e instanceof Error ? e.message : e);
    process.exitCode = 2;
  });
}
