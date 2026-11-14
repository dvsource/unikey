import { test, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { defaultConfig } from "../src/index.js";
import { loadFromRepo } from "../src/node/load.js";
import { personas } from "../sim/personas.js";
import { runStudent, personaSeed, SIM_START } from "../sim/run.js";
import { runChecks } from "../sim/checks.js";
import {
  BLIND_PAIRS, buildPackets, collect, eventLines, loadPrompts, parseReport, type RunFiles,
} from "../sim/judge.js";

const engineDir = join(import.meta.dirname, "..");
const content = loadFromRepo(join(engineDir, ".."));
const prompts = loadPrompts(join(engineDir, "judge", "prompts"));
const DAYS = 9;

const runs = new Map<number, RunFiles>();
/** All 16 personas for a few days on the real content, as the CLI would read them back from disk. */
function runOf(seed: number): RunFiles {
  const hit = runs.get(seed);
  if (hit) return hit;
  const logs = personas.map((p, i) => runStudent(p, content, { days: DAYS, seed: personaSeed(seed, i), start: SIM_START, cfg: defaultConfig }));
  const r: RunFiles = {
    summaries: logs.map(({ lines: _l, ...s }) => s),
    lines: Object.fromEntries(logs.map((l) => [l.persona, l.lines])),
    checks: runChecks(logs, defaultConfig),
  };
  runs.set(seed, r);
  return r;
}

const TRAIT_KEYS = Object.keys(personas[0]!.traits).concat(["priorBySection", "fearedPrior"]);
/** Words the brief and the rulings say may never appear in a student or blind packet. */
const HIDDEN_WORDS = ["knowledge", "stamina", "comfort", "h3Share", "budget", "hiddenFatigued", "kBefore", "kAfter", "quitAppDay", "profileByDay", "traits"];
const CHECK_NAMES = ["no-end-on-wrong", "skip-timing", "effort-cap-and-fairness", "no-repeat-14d", "ends-before-fade", "knowledge-up", "no-back-to-back-card"];

function leaks(text: string): string[] {
  const found: string[] = [];
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
  for (const [x, y] of BLIND_PAIRS) {
    const name = `blind-${x}-${y}`;
    const text = a[`${name}.input.md`]!;
    expect(text).toContain("## Student X");
    expect(text).toContain("## Student Y");
    for (const p of personas) {
      expect(text).not.toMatch(new RegExp(`\\b${p.id}\\b`));
      expect(text).not.toContain(p.sheet.slice(0, 40));
    }
    expect(text).not.toContain(".key.json");
    expect(leaks(text)).toEqual([]);
    const key = JSON.parse(a[`${name}.key.json`]!) as { X: string; Y: string; questions: { id: string; answer: string }[] };
    expect([key.X, key.Y].sort()).toEqual([x, y].sort());
    expect(key.questions.map((q) => q.id)).toEqual(["Q1", "Q2"]);
    for (const q of key.questions) expect(["X", "Y"]).toContain(q.answer);
    // the X log in the packet is the X persona's log
    const xLog = eventLines(text.split("## Student Y")[0]!);
    const xOwn = eventLines(a[`student-${key.X}.input.md`]!);
    expect(xLog.slice(0, 5)).toEqual(xOwn.slice(0, 5).map((l) => l.replace(/ \((fed up|too tired to go on|out of time)\)$/, "")));
  }
  const order = (f: Record<string, string>) => BLIND_PAIRS.map(([x, y]) => (JSON.parse(f[`blind-${x}-${y}.key.json`]!) as { X: string }).X);
  expect(order(a)).not.toEqual(order(b));
  expect(order(buildPackets(runOf(1), content, prompts))).toEqual(order(a));
  // truth packets carry the hidden side
  expect(Object.keys(a).filter((f) => f.startsWith("truth-")).length).toBe(16);
  expect(a["truth-strong.input.md"]).toContain("patienceWrongs");
  expect(a["truth-strong.input.md"]).toContain("Day 0");
});

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
  const answer = (pair: readonly [string, string], how: "right" | "wrong" | "cannot") => {
    const key = JSON.parse(files[`blind-${pair[0]}-${pair[1]}.key.json`]!) as { questions: { id: string; answer: "X" | "Y" }[] };
    const answers = Object.fromEntries(key.questions.map((q) => [q.id, how === "cannot" ? "cannot tell" : how === "right" ? q.answer : q.answer === "X" ? "Y" : "X"]));
    return "```json\n" + JSON.stringify({ answers, evidence: { Q1: ["x"], Q2: ["y"] } }) + "\n```\n";
  };
  judge[`blind-${p0![0]}-${p0![1]}.report.md`] = answer(p0!, "right");
  judge[`blind-${p1![0]}-${p1![1]}.report.md`] = answer(p1!, "wrong");
  judge[`blind-${p2![0]}-${p2![1]}.report.md`] = answer(p2!, "cannot");
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
  expect(s).toContain(`| ${p0![0]} / ${p0![1]} | 2 / 2 |`);
  expect(s).toContain(`| ${p1![0]} / ${p1![1]} | 0 / 2 |`);
  expect(s).toContain(`| ${p2![0]} / ${p2![1]} | 0 / 2 |`);
  expect(s).toMatch(/^- \*\*met\*\* — two different personas get near-identical sessions/m);
  // three pairs judged, two failed: 67% > 25%
  expect(s).toMatch(/^- \*\*met\*\* — the blind comparison fails for more than a quarter of pairs/m);
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
  const before = collect(quiet, { ...files, "student-strong.report.md": studentReport(packet, null) }, prompts.summary).summaryInput;
  expect(before).toMatch(/^- \*\*not met\*\* — any persona would quit before day 7/m);
  const after = collect(quiet, { ...files, "student-strong.report.md": studentReport(packet, "D05 S1 #3") }, prompts.summary).summaryInput;
  expect(after).toMatch(/^- \*\*met\*\* — any persona would quit before day 7/m);
  expect(after).toMatch(/strong: judge's quit point D05 S1 #3/);
  // D07 is not before day 7
  const d7 = collect(quiet, { ...files, "student-strong.report.md": studentReport(packet, "D07 S1 #3") }, prompts.summary).summaryInput;
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
