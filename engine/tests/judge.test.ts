import { test, expect } from "vitest";
import { readFileSync, mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { defaultConfig } from "../src/index.js";
import { loadFromRepo } from "../src/node/load.js";
import { personas } from "../sim/personas.js";
import { runStudent, personaSeed, SIM_START } from "../sim/run.js";
import { runChecks } from "../sim/checks.js";
import {
  BLIND_PAIRS, blindName, buildPackets, collect, eventLines, loadPrompts, parseReport, readRun, type RunFiles,
} from "../sim/judge.js";

const engineDir = join(import.meta.dirname, "..");
const content = loadFromRepo(join(engineDir, ".."));
const prompts = loadPrompts(join(engineDir, "judge", "prompts"));
const DAYS = 9;

const runs = new Map<string, RunFiles>();
/** All 16 personas for a few days (or the full 28) on the real content, as the CLI would read them back from disk. */
function runOf(seed: number, days = DAYS): RunFiles {
  const hit = runs.get(`${seed}/${days}`);
  if (hit) return hit;
  const logs = personas.map((p, i) => runStudent(p, content, { days, seed: personaSeed(seed, i), start: SIM_START, cfg: defaultConfig }));
  const r: RunFiles = {
    summaries: logs.map(({ lines: _l, ...s }) => s),
    lines: Object.fromEntries(logs.map((l) => [l.persona, l.lines])),
    checks: runChecks(logs, defaultConfig),
  };
  runs.set(`${seed}/${days}`, r);
  return r;
}

const TRAIT_KEYS = Object.keys(personas[0]!.traits).concat(["priorBySection", "fearedPrior"]);
/** Words the brief and the rulings say may never appear in a student or blind packet. */
const HIDDEN_WORDS = ["knowledge", "stamina", "comfort", "h3Share", "budget", "hiddenFatigued", "kBefore", "kAfter", "quitAppDay", "profileByDay", "traits"];
/** Why a hidden student walked out is hidden state: these words of the runner's quit reasons must never show. */
const QUIT_PHRASES = ["fed up", "too tired", "out of time", "frustration", "fatigue", "time-up"];
const CHECK_NAMES = ["no-end-on-wrong", "skip-timing", "effort-cap-and-fairness", "no-repeat-14d", "ends-before-fade", "knowledge-up", "no-back-to-back-card"];

function leaks(packet: string, opts: { blind?: boolean } = {}): string[] {
  const found: string[] = [];
  // a persona's own sheet is theirs to see ("I get fed up quickly"); scan everything else
  const text = personas.reduce((t, p) => t.split(p.sheet).join(""), packet);
  for (const q of QUIT_PHRASES) if (new RegExp(`\\b${q}\\b`, "i").test(text)) found.push(`quit reason ${q}`);
  if (opts.blind) for (const p of personas) if (new RegExp(`\\b${p.id}\\b`).test(text)) found.push(`persona id ${p.id}`);
  for (const k of TRAIT_KEYS) {
    // Short trait keys are ordinary English ("I learn slowly"); as a key they would appear as `key:` or `"key"`.
    const asKey = new RegExp(`(["']${k}["']|\\b${k}\\s*[:=])`);
    const distinctive = k.length > 7 || /[A-Z]/.test(k);
    if (asKey.test(text) || (distinctive && new RegExp(`\\b${k}\\b`, "i").test(text))) found.push(`trait key ${k}`);
  }
  // "comfort-correction" is one of the engine's own card reasons (spec §10) and is meant to be shown.
  for (const w of HIDDEN_WORDS) if (new RegExp(`\\b${w}\\b(?!-correction)`, "i").test(text)) found.push(`word ${w}`);
  for (const c of CHECK_NAMES) if (text.includes(c)) found.push(`check ${c}`);
  if (/\b(PASS|FAIL)\b/.test(text)) found.push("check result");
  return found;
}

test("student packet contains the sheet and reasons, and none of: traits keys, 'knowledge', 'stamina', 'comfort'", () => {
  const files = buildPackets(runOf(1), content, prompts);
  const students = Object.keys(files).filter((f) => f.startsWith("student-"));
  expect(students.length).toBe(16);
  for (const p of personas) {
    const text = files[`student-${p.id}.input.md`]!;
    expect(text).toContain(p.sheet);
    expect(leaks(text)).toEqual([]);
    // engine reasons in brackets, heights as words, skill names (not ids) from content
    expect(text).toMatch(/\[(open:liked|due-review|new:class-topic|new:exam-weight|comfort-correction|close:winnable)\]/);
    expect(text).toMatch(/H[123] (easy|guided|full)/);
    expect(text).toContain("- fallback:any: "); // F9: the legend explains every reason the engine gives
    expect(text).toContain("- stretch:up: a card one level above your usual one, because today is going well"); // change 5
    expect(text).not.toMatch(/phy\.(mech|therm|elec)\.[a-z]/);
    // the rubric from spec §13, verbatim
    for (const row of [
      "| 1 | **Fit:** by day 3, was the difficulty right for me? |",
      "| 2 | **Reaction:** after I got something wrong, did the next cards help me or punish me? |",
      "| 3 | **Skips:** did the section I skipped stay away, come back gently, and show me why it matters? |",
      "| 4 | **Kept adjusting:** when I changed (improved, came back after a gap, had a bad day), did the app change with me? |",
      "| 5 | **Workload:** did the app ever ask too much of me, or too little? |",
      "| 6 | **Progress shown:** did the app show me real improvement, at moments that were true? |",
      "| 7 | **Would I quit?** Where, and why. |",
      "- Score each rubric line from 1 to 5 and quote the log lines that justify the score. No score without a quote.",
      "- Do not judge the physics content; judge how the app treated you.",
    ]) expect(text).toContain(row);
  }
  // one event per line: every session start and end is its own line, with day and session of the day
  const strong = files["student-strong.input.md"]!;
  const ev = eventLines(strong);
  expect(ev.some((l) => /^D01 S1 start\b/.test(l))).toBe(true);
  expect(ev.some((l) => /^D01 S1 end\s+— end: /.test(l))).toBe(true);
  expect(ev.some((l) => /^D01 S1 #1 {2}\[[a-z:-]+\] H[123] /.test(l))).toBe(true);
  // same run ⇒ byte-identical packets
  expect(JSON.stringify(buildPackets(runOf(1), content, prompts))).toBe(JSON.stringify(files));
});

test("blind packet has no persona id or sheet text; key file maps X/Y; order differs across seeds", () => {
  expect(BLIND_PAIRS.length).toBe(8);
  const a = buildPackets(runOf(1), content, prompts);
  const b = buildPackets(runOf(2), content, prompts);
  const blind = Object.keys(a).filter((f) => f.startsWith("blind-") && f.endsWith(".input.md"));
  expect(blind.length).toBe(8);
  BLIND_PAIRS.forEach(([x, y], i) => {
    const name = blindName(i);
    expect(name).toBe(`blind-${i + 1}`);
    const text = a[`${name}.input.md`]!;
    expect(text).toContain("## Student X");
    expect(text).toContain("## Student Y");
    for (const p of personas) {
      expect(text).not.toMatch(new RegExp(`\\b${p.id}\\b`));
      expect(text).not.toContain(p.sheet.slice(0, 40));
    }
    expect(text).not.toContain(".key.json");
    expect(leaks(text, { blind: true })).toEqual([]);
    const key = JSON.parse(a[`${name}.key.json`]!) as { pair: string[]; X: string; Y: string; questions: { id: string; answer: string }[] };
    expect(key.pair).toEqual([x, y]);
    expect([key.X, key.Y].sort()).toEqual([x, y].sort());
    expect(key.questions.map((q) => q.id)).toEqual(["Q1", "Q2"]);
    for (const q of key.questions) expect(["X", "Y"]).toContain(q.answer);
    // the X log in the packet is the X persona's log
    const xLog = eventLines(text.split("## Student Y")[0]!);
    const xOwn = eventLines(a[`student-${key.X}.input.md`]!);
    expect(xLog).toEqual(xOwn);
  });
  // no blind file name (input, key, or the report a judge writes) names a persona
  for (const f of Object.keys(a).filter((f) => f.startsWith("blind-")).concat(BLIND_PAIRS.map((_, i) => `${blindName(i)}.report.md`)))
    for (const p of personas) expect(f).not.toContain(p.id);
  const order = (f: Record<string, string>) => BLIND_PAIRS.map((_, i) => (JSON.parse(f[`${blindName(i)}.key.json`]!) as { X: string }).X);
  expect(order(a)).not.toEqual(order(b));
  expect(order(buildPackets(runOf(1), content, prompts))).toEqual(order(a));
  // truth packets carry the hidden side
  expect(Object.keys(a).filter((f) => f.startsWith("truth-")).length).toBe(16);
  expect(a["truth-strong.input.md"]).toContain("patienceWrongs");
  expect(a["truth-strong.input.md"]).toContain("Day 0");
});

test("leak scan on full 28-day packets, including students who close the app and leave it", () => {
  const run = runOf(1, 28);
  const files = buildPackets(run, content, prompts);
  const quitLines = Object.entries(files).filter(([f]) => f.startsWith("student-"))
    .flatMap(([, t]) => eventLines(t).filter((l) => l.includes("closed the app without answering")));
  expect(quitLines.length).toBeGreaterThan(0);
  for (const l of quitLines) expect(l).toMatch(/closed the app without answering$/);
  // weak-impatient gives up quickly: its packet has quit lines and is scanned like every other
  expect(files["student-weak-impatient.input.md"]).toContain("closed the app without answering");
  for (const [f, t] of Object.entries(files)) {
    if (f.startsWith("student-")) expect([f, leaks(t)]).toEqual([f, []]);
    if (f.startsWith("blind-") && f.endsWith(".input.md")) expect([f, leaks(t, { blind: true })]).toEqual([f, []]);
  }
  // the truth packet is given the hidden side, quit reasons included
  const truthAll = Object.entries(files).filter(([f]) => f.startsWith("truth-")).map(([, t]) => t).join("\n");
  expect(truthAll).toMatch(/frustration|fatigue|time-up/);
});

/** Valid reports for all 16 students (so judge-dependent design lines can be decided), with overrides. */
function allStudents(files: Record<string, string>, over: Record<string, string> = {}): Record<string, string> {
  const out: Record<string, string> = { ...files };
  for (const p of personas) out[`student-${p.id}.report.md`] = studentReport(files[`student-${p.id}.input.md`]!, null);
  return { ...out, ...over };
}
/** A blind report: every answer right, wrong, or "cannot tell". */
function blindReport(files: Record<string, string>, i: number, how: "right" | "wrong" | "cannot"): string {
  const key = JSON.parse(files[`${blindName(i)}.key.json`]!) as { questions: { id: string; answer: "X" | "Y" }[] };
  const answers = Object.fromEntries(key.questions.map((q) => [q.id, how === "cannot" ? "cannot tell" : how === "right" ? q.answer : q.answer === "X" ? "Y" : "X"]));
  const ev = (source: "app" | "student") => [{ source, line: "X: D01 S1 #1 ...", shows: "something" }];
  return "```json\n" + JSON.stringify({ answers, evidence: { Q1: ev("app"), Q2: ev("student") } }) + "\n```\n";
}

/** A valid student report quoting real lines of the packet. */
function studentReport(packet: string, quitPoint: string | null, over: Record<string, unknown> = {}): string {
  const ev = eventLines(packet).filter((l) => / #\d+ /.test(l));
  const keys = ["fit", "reaction", "skips", "adjusting", "workload", "progress", "quit"];
  const json = {
    scores: Object.fromEntries(keys.map((k) => [k, 4])),
    quotes: Object.fromEntries(keys.map((k, i) => [k, [ev[i]!]])),
    quit_point: quitPoint, worst_moment: "the long session on day 2",
    ...over,
  };
  return "```json\n" + JSON.stringify(json, null, 2) + "\n```\n\nIt felt fine to me, mostly.\n";
}

test("collect: valid report scored; a score without quotes is listed invalid; blind accuracy computed from keys", () => {
  const run = runOf(1);
  const files = buildPackets(run, content, prompts);
  const judge: Record<string, string> = { ...files };
  judge["student-strong.report.md"] = studentReport(files["student-strong.input.md"]!, null);
  const weakPacket = files["student-weak-stubborn.input.md"]!;
  const bad = JSON.parse(parseReport(studentReport(weakPacket, null)).json!) as { scores: Record<string, number>; quotes: Record<string, string[]> };
  bad.quotes.reaction = [];
  bad.scores.workload = 7;
  bad.quotes.progress = ["D02 S1 #3  [due-review] H2 guided  Made-up › line — right, 3s"];
  judge["student-weak-stubborn.report.md"] = "```json\n" + JSON.stringify({ ...bad, quit_point: null }) + "\n```\nvoice\n";
  judge["student-slow-reader.report.md"] = "I refuse to write JSON.";
  judge["student-fast-guesser.report.md"] = "```json\n{ not json\n```";
  // blind: first pair all right, second pair all wrong, third "cannot tell"
  const [p0, p1, p2] = BLIND_PAIRS;
  judge["blind-1.report.md"] = blindReport(files, 0, "right");
  judge["blind-2.report.md"] = blindReport(files, 1, "wrong");
  judge["blind-3.report.md"] = blindReport(files, 2, "cannot");
  judge["truth-strong.report.md"] = "```json\n" + JSON.stringify({ wrong: [{ number: "stamina", engine: 13.3, truth: "25 effort", by_day: 9 }], right: [] }) + "\n```\n";

  const out = collect(run, judge, prompts.summary);
  const s = out.summaryInput;
  // valid report scored
  expect(s).toMatch(/\| strong \| 4 \| 4 \| 4 \| 4 \| 4 \| 4 \| 4 \|/);
  // the bad scores are listed invalid with reasons, the good ones of the same report still count
  const inv = out.invalid.map((i) => `${i.file}: ${i.reason}`).join("\n");
  expect(inv).toMatch(/student-weak-stubborn\.report\.md: reaction: no quote/);
  expect(inv).toMatch(/student-weak-stubborn\.report\.md: workload: score 7 is not 1–5/);
  expect(inv).toMatch(/student-weak-stubborn\.report\.md: progress: quote not in the packet log/);
  expect(s).toMatch(/\| weak-stubborn \| 4 \| — \| 4 \| 4 \| — \| — \| 4 \|/);
  expect(inv).toMatch(/student-slow-reader\.report\.md: no ```json block/);
  expect(inv).toMatch(/student-fast-guesser\.report\.md: invalid JSON/);
  expect(inv).toMatch(/student-average-noclass\.report\.md: missing/);
  // blind accuracy from the keys
  expect(s).toContain(`| 1 | ${p0![0]} / ${p0![1]} | 2 / 2 |`);
  expect(s).toContain(`| 2 | ${p1![0]} / ${p1![1]} | 0 / 2 |`);
  expect(s).toContain(`| 3 | ${p2![0]} / ${p2![1]} | 0 / 2 |`);
  expect(s).toMatch(/^- \*\*met\*\* — two different personas get near-identical sessions/m);
  // three pairs judged, two failed: 67% > 25%
  // only 3 of 8 pairs judged, 2 failed: 2 of 8 is not more than a quarter, the rest are unknown
  expect(s).toMatch(/^- \*\*unknown\*\* — the blind comparison fails for more than a quarter of pairs.*only 3 of 8 pairs judged/m);
  expect(s).toContain("| 4 | ");
  expect(s).toMatch(/\| 1 \| strong \/ weak-stubborn \| 2 \/ 2 \| 1 \|/);
  // F13: each piece of blind evidence is labelled app or student; only app evidence counts toward "the app adapts"
  expect(s).toMatch(/^- Q1 .* Evidence \(app 1, student 0\): \[app\] X: D01 S1 #1/m);
  expect(s).toMatch(/^- Q2 .* Evidence \(app 0, student 1\): \[student\] X: D01 S1 #1/m);
  expect(s).toMatch(/Right answers with app evidence: 1 of 2 right answers/);
  // truth-check misses and all seven code checks
  expect(s).toMatch(/strong.*stamina.*13\.3.*25 effort/);
  for (const c of CHECK_NAMES) expect(s).toContain(`| ${c} |`);
  expect(s).toContain(prompts.summary.trim().split("\n")[0]!);
  // five design lines
  expect((s.match(/^- \*\*(met|not met|unknown)\*\*/gm) ?? []).length).toBe(5);
});

test("collect flags 'quit before day 7' when a quit_point is D05", () => {
  const run = runOf(1);
  // nobody quits the app in this run, so only the judge's quit point can trigger the line
  const quiet: RunFiles = { ...run, summaries: run.summaries.map((s) => ({ ...s, quitAppDay: null })) };
  const files = buildPackets(quiet, content, prompts);
  const packet = files["student-strong.input.md"]!;
  // one report of 16 and no quit seen: cannot say "not met"
  const one = collect(quiet, { ...files, "student-strong.report.md": studentReport(packet, null) }, prompts.summary).summaryInput;
  expect(one).toMatch(/^- \*\*unknown\*\* — any persona would quit before day 7.*only 1 of 16 students judged/m);
  const before = collect(quiet, allStudents(files), prompts.summary).summaryInput;
  expect(before).toMatch(/^- \*\*not met\*\* — any persona would quit before day 7/m);
  // a single early quit point is enough, however many reports are in
  const after = collect(quiet, { ...files, "student-strong.report.md": studentReport(packet, "D05 S1 #3") }, prompts.summary).summaryInput;
  expect(after).toMatch(/^- \*\*met\*\* — any persona would quit before day 7/m);
  expect(after).toMatch(/strong: judge's quit point D05 S1 #3/);
  // D07 is not before day 7
  const d7 = collect(quiet, allStudents(files, { "student-strong.report.md": studentReport(packet, "D07 S1 #3") }), prompts.summary).summaryInput;
  expect(d7).toMatch(/^- \*\*not met\*\* — any persona would quit before day 7/m);
  // the hidden student leaving the app on day index 1 (D02) also triggers it
  const left: RunFiles = { ...quiet, summaries: quiet.summaries.map((s) => (s.persona === "weak-impatient" ? { ...s, quitAppDay: 1 } : s)) };
  expect(collect(left, files, prompts.summary).summaryInput).toMatch(/weak-impatient: stopped using the app on D02/);
});

test("importing the module does not run the CLI; prompts are readable on their own", () => {
  // (the import at the top of this file would have thrown or printed otherwise)
  for (const k of ["student", "blind", "truth", "summary"] as const) expect(prompts[k].length).toBeGreaterThan(400);
  const runbook = readFileSync(join(engineDir, "judge", "JUDGING.md"), "utf8");
  expect(runbook).toContain("npm run judge -- packets --run runs/");
  expect(runbook).toContain("npm run judge -- collect --run runs/");
  expect(runbook).toContain("Do not read any other file in this folder.");
  expect(runbook).toMatch(/Viraj/);
});

test("blind lines with all 8 pairs judged: 2 failed is not met, 3 failed is met", () => {
  const run = runOf(1);
  const files = buildPackets(run, content, prompts);
  const judged = (wrong: number) => {
    const f = { ...files };
    BLIND_PAIRS.forEach((_, i) => { f[`${blindName(i)}.report.md`] = blindReport(files, i, i < wrong ? "wrong" : "right"); });
    return collect(run, f, prompts.summary).summaryInput;
  };
  expect(judged(0)).toMatch(/^- \*\*not met\*\* — two different personas get near-identical sessions/m);
  expect(judged(2)).toMatch(/^- \*\*not met\*\* — the blind comparison fails for more than a quarter of pairs.*2 of 8 pairs failed/m);
  expect(judged(3)).toMatch(/^- \*\*met\*\* — the blind comparison fails for more than a quarter of pairs.*3 of 8 pairs failed/m);
  // 3 failed among only 3 judged is already more than a quarter of all 8
  const f3 = { ...files };
  for (const i of [0, 1, 2]) f3[`${blindName(i)}.report.md`] = blindReport(files, i, "wrong");
  expect(collect(run, f3, prompts.summary).summaryInput).toMatch(/^- \*\*met\*\* — the blind comparison fails for more than a quarter/m);
});

test("collect lists the remaining invalid cases", () => {
  const run = runOf(1);
  const files = buildPackets(run, content, prompts);
  const packet = files["student-strong.input.md"]!;
  const base = JSON.parse(parseReport(studentReport(packet, null)).json!) as Record<string, Record<string, unknown>>;
  const report = (o: Record<string, unknown>, prose = "voice") => "```json\n" + JSON.stringify({ ...base, ...o }) + "\n```\n" + prose + "\n";
  const judge: Record<string, string> = {
    ...files,
    "student-strong.report.md": report({ scores: { ...base.scores, fit: 2.5, reaction: 0 }, quit_point: "day 7" }),
    "student-weak-stubborn.report.md": studentReport(files["student-weak-stubborn.input.md"]!, "D01 S1 #99").replace(/\n\n[^\n]*\n$/, "\n\n" + "word ".repeat(250) + "\n"),
    "student-average-noclass.report.md": report({ quit_point: "D01 S1 #0" }),
    "blind-1.report.md": "```json\n" + JSON.stringify({ answers: { Q1: "Student X", Q2: "Y" } }) + "\n```\n",
    "blind-2.report.md": blindReport(files, 1, "right"),
    "blind-2.key.json": "{ not json",
    "truth-strong.report.md": "```json\n" + JSON.stringify({ wrong: [{ number: "patience", engine: 1, truth: "x", by_day: 1 }], right: [] }) + "\n```\n",
  };
  const out = collect(run, judge, prompts.summary);
  const inv = out.invalid.map((i) => `${i.file}: ${i.reason}`).join("\n");
  expect(inv).toMatch(/student-strong\.report\.md: fit: score 2\.5 is not 1–5/);
  expect(inv).toMatch(/student-strong\.report\.md: reaction: score 0 is not 1–5/);
  expect(inv).toMatch(/student-strong\.report\.md: quit_point "day 7" is not like "D07 S1 #5"/);
  expect(inv).toMatch(/student-weak-stubborn\.report\.md: quit_point D01 S1 #99 is not a card or skip line/);
  expect(inv).toMatch(/student-average-noclass\.report\.md: quit_point D01 S1 #0 is not a card or skip line/);
  // over 200 words: a note, not invalid; the scores still count
  expect(out.notes.map((n) => `${n.file}: ${n.reason}`).join("\n")).toMatch(/student-weak-stubborn\.report\.md: voice text is 250 words/);
  expect(inv).not.toMatch(/250 words/);
  expect(out.summaryInput).toMatch(/\| weak-stubborn \| 4 \| 4 \| 4 \| 4 \| 4 \| 4 \| 4 \|/);
  expect(inv).toMatch(/blind-1\.report\.md: Q1: answer "Student X" is not "X", "Y" or "cannot tell"/);
  expect(inv).toMatch(/blind-2\.report\.md: key file blind-2\.key\.json is not valid JSON/);
  expect(inv).toMatch(/truth-strong\.report\.md: wrong entry .*"number" must be one of comfort, memory, h3Share, stamina/);
  // no checks.json in the run folder
  expect(collect({ ...run, checks: null }, files, prompts.summary).summaryInput).toContain("No checks.json found in the run folder.");
});

test("readRun names a missing log file", () => {
  const dir = mkdtempSync(join(tmpdir(), "judge-"));
  try {
    const { lines: _l, ...summary } = runStudent(personas[0]!, content, { days: 2, seed: 1, start: SIM_START, cfg: defaultConfig });
    writeFileSync(join(dir, `${summary.persona}.summary.json`), JSON.stringify(summary));
    expect(() => readRun(dir)).toThrow(new RegExp(`${summary.persona}\\.log\\.jsonl`));
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

// ---------- Task 8: the readable log follows changes 1-7 ----------

import { readableLog, LOG_LEGEND } from "../sim/judge.js";
import type { LogLine } from "../sim/run.js";
import type { Served } from "../src/index.js";

const sk = Object.values(content.skills)[0]!;
const secId = sk.section;
const served = (reason: Served["reason"], height: 1 | 2 | 3 = 2): Served =>
  ({ card: "c1", variant: 0, skill: sk.id, section: secId, height, reason, effort: 1.5 });
const endLine = (over: Partial<LogLine["end"] & object>): LogLine => ({
  day: 0, session: 1, n: 4, kind: "end",
  end: { kind: "budget", effort: 6, cards: 4, right: 1, fixed: 1, streakKept: false, recap: false, fixedSkills: [], rightSkills: [], ...over },
});
const startLine: LogLine = { day: 0, session: 1, n: 0, kind: "start" };
const logOf = (...ls: LogLine[]) => readableLog([startLine, ...ls], content, 1);

test("a recap end says no question and names the fixed skills", () => {
  const lines = logOf(endLine({ recap: true, fixed: 1, fixedSkills: [sk.id] }));
  const end = lines.find((l) => l.includes("— end:"))!;
  expect(end).toContain(`— end: recap, no question (fixed today: ${sk.name}), 6 effort, 4 cards (1 right)`);
  const none = logOf(endLine({ recap: true, fixed: 0, fixedSkills: [] })).find((l) => l.includes("— end:"))!;
  expect(none).toContain("end: recap, no question (nothing fixed today)");
  // F3: nothing fixed but something right: the skills answered right instead
  const sk2 = Object.values(content.skills)[1]!;
  const rt = logOf(endLine({ recap: true, fixed: 0, fixedSkills: [], rightSkills: [sk.id, sk2.id] })).find((l) => l.includes("— end:"))!;
  expect(rt).toContain(`end: recap, no question (nothing fixed today; right today: ${sk.name}, ${sk2.name}), 6 effort`);
  // a fixed skill wins: the right list is not shown
  expect(logOf(endLine({ recap: true, fixed: 1, fixedSkills: [sk.id], rightSkills: [sk2.id] })).find((l) => l.includes("— end:"))).not.toContain("right today");
  // a normal end keeps today's wording
  expect(logOf(endLine({})).find((l) => l.includes("— end:"))).toContain("— end: planned session done, 6 effort, 4 cards (1 right), fixed 1");
  expect(logOf(endLine({ kind: "bad-day" })).find((l) => l.includes("— end:"))).toContain("the app ended the session early");
});

test("a card skip differs from a section skip; a rejoin has its own line", () => {
  const card: LogLine = { day: 0, session: 1, n: 3, kind: "skip", served: served("due-review", 3), skipReason: "too-hard", scope: "card", remindDay: null };
  const sec: LogLine = { day: 0, session: 1, n: 3, kind: "skip", served: served("due-review", 3), skipReason: "not-learned", scope: "section", remindDay: 5 };
  const [c, s] = [logOf(card).find((l) => l.includes("skipped"))!, logOf(sec).find((l) => l.includes("skipped"))!];
  expect(c).toContain('skipped this card ("Too hard")');
  expect(c).toMatch(/one level down or rests/);
  expect(c).not.toContain("Not now");
  expect(c).not.toContain("comes back");
  expect(s).toContain('skipped ("Not now")');
  expect(s).toContain("section comes back from D06");
  expect(s).not.toContain("this card");
  const rj = logOf({ day: 0, session: 1, n: 0, kind: "rejoin", section: secId }).find((l) => l.includes("back in normal practice"))!;
  expect(rj).toMatch(/^D01 S1 {2}.+ is back in normal practice$/);
  expect(rj).toContain(content.sections[secId]!.name);
  expect(eventLines(rj)).toEqual([rj]);
  // new reasons print as their code and level words
  const card2 = logOf({ day: 0, session: 1, n: 1, kind: "card", served: served("open:easy", 1), choice: 0, right: true, ms: 4000 });
  expect(card2.join("\n")).toContain("[open:easy] H1 easy");
});

test("the legend explains the new reasons and rules", () => {
  expect(LOG_LEGEND).toContain("- stretch:up: ");
  expect(LOG_LEGEND).toContain("- open:easy: an easy start, because the last session went badly");
  expect(LOG_LEGEND).toMatch(/recap/i);
  expect(LOG_LEGEND).toMatch(/no question/i);
  expect(LOG_LEGEND).toMatch(/"Too hard".*one level/s);
  expect(LOG_LEGEND).toMatch(/first sessions/i);
  expect(LOG_LEGEND).toMatch(/only one closing card/i);
  expect(LOG_LEGEND).toMatch(/"5 more".*effort/s);
  for (const w of ["budget", "stamina", "threshold"]) expect(LOG_LEGEND.toLowerCase()).not.toContain(w);
});

test("new-style lines in a real 28-day run carry no numbers beyond effort and cards", () => {
  const files = buildPackets(runOf(1, 28), content, prompts);
  const all = Object.entries(files).filter(([f]) => f.startsWith("student-")).flatMap(([, t]) => eventLines(t));
  const fresh = all.filter((l) => /end: recap|skipped this card|back in normal practice|ended the session early/.test(l));
  expect(fresh.length).toBeGreaterThan(0);
  for (const l of fresh) {
    expect(l).not.toMatch(/budget|stamina|comfort(?!-correction)|h3Share|knowledge|fatigue|fed up|too tired/i);
    if (/end: recap/.test(l)) expect(l).toMatch(/^D\d\d S\d+ end {2}— end: recap, no question \([^)]*\), [\d.]+ effort, \d+ cards \(\d+ right\)(, streak kept)?$/);
  }
});
