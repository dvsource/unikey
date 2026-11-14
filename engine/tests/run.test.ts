import { test, expect } from "vitest";
import { join } from "node:path";
import { fixture } from "./fixture.js";
import { defaultConfig, type Served } from "../src/index.js";
import { loadFromRepo } from "../src/node/load.js";
import { personas } from "../sim/personas.js";
import { resolvePersona, type PersonaSpec } from "../sim/student.js";
import { runStudent, personaSeed, deepMerge, recentWrongOf, DONT_KNOW_WEIGHT, SIM_START, type LogLine, type StudentLog } from "../sim/run.js";
import { runChecks } from "../sim/checks.js";

const byId = (id: string): PersonaSpec => personas.find((p) => p.id === id)!;
const opts = (days: number, seed: number) => ({ days, seed, start: SIM_START, cfg: defaultConfig });

test("runStudent is repeatable: same seed → identical log", () => {
  const content = fixture();
  for (const id of ["average-noclass", "weak-impatient"]) {
    const a = runStudent(byId(id), content, opts(6, 11));
    const b = runStudent(byId(id), content, opts(6, 11));
    expect(a.lines.length).toBeGreaterThan(0);
    expect(JSON.stringify(b)).toBe(JSON.stringify(a));
    const c = runStudent(byId(id), content, opts(6, 12));
    expect(JSON.stringify(c.lines)).not.toBe(JSON.stringify(a.lines));
  }
  // per-persona seeds differ by index and by run seed, and repeat
  expect(personaSeed(1, 0)).toBe(personaSeed(1, 0));
  expect(personaSeed(1, 0)).not.toBe(personaSeed(1, 1));
  expect(personaSeed(1, 0)).not.toBe(personaSeed(2, 0));
});

test("log has what §13 needs: every card line has served.reason, height, right, ms; ends have kind", () => {
  const content = fixture();
  const log = runStudent(byId("average-noclass"), content, opts(6, 3));
  expect(log.persona).toBe("average-noclass");
  expect(log.seed).toBe(3);
  expect(log.traits).toEqual(resolvePersona(byId("average-noclass"), content).traits);
  const cards = log.lines.filter((l) => l.kind === "card");
  expect(cards.length).toBeGreaterThan(5);
  for (const l of cards) {
    expect(typeof l.served!.reason).toBe("string");
    expect([1, 2, 3]).toContain(l.served!.height);
    expect(typeof l.right).toBe("boolean");
    expect(l.ms).toBeGreaterThan(0);
    expect(l.choice).toBeDefined();
    expect(typeof l.hiddenFatigued).toBe("boolean");
  }
  const ends = log.lines.filter((l) => l.kind === "end");
  expect(ends.length).toBeGreaterThan(0);
  for (const l of ends) expect(typeof l.end!.kind).toBe("string");
  // every opened session has a start line with the asked budget and the day's profile numbers, and one end
  const starts = log.lines.filter((l) => l.kind === "start");
  expect(starts.length).toBeGreaterThan(0);
  for (const s of starts) {
    expect(s.budget).toBeGreaterThan(0);
    expect(typeof s.profile!.stamina).toBe("number");
    expect(ends.filter((e) => e.session === s.session)).toHaveLength(1);
  }
  // profile day by day, knowledge snapshots
  expect(log.profileByDay.map((p) => p.day)).toEqual([0, 1, 2, 3, 4, 5]);
  expect(typeof log.profileByDay[0]!.comfort).toBe("number");
  expect(log.knowledge.day0).toBeGreaterThan(0);
  expect(log.knowledge.dayEnd).not.toBe(log.knowledge.day0);
  expect(log.quitAppDay).toBeNull();
  expect(log.contentExhausted).toBe(ends.filter((e) => e.end!.kind === "content-exhausted").length);
  // days and lines are in order
  for (let i = 1; i < log.lines.length; i++) expect(log.lines[i]!.day).toBeGreaterThanOrEqual(log.lines[i - 1]!.day);
});

// ---------- hand-made logs ----------

const sv = (card: string, o: Partial<Served> = {}): Served =>
  ({ card, variant: 0, skill: "s1", section: "A", height: 1, reason: "due-review", effort: 1, ...o });
const end = (effort: number) => ({ kind: "budget" as const, effort, cards: 1, right: 1, fixed: 0, streakKept: true });
const prof = { comfort: 0.75, memory: 1, h3Share: 0.4, stamina: 13.34, goodStreak: 0, msByHeight: { 1: [], 2: [], 3: [] } };

/** One session per day for `days` days: start, one right card `c<day>`, end at `effort`. */
function cleanLines(days: number, budget = 10, effort = 5): LogLine[] {
  const out: LogLine[] = [];
  for (let d = 0; d < days; d++) {
    const s = d + 1;
    out.push({ day: d, session: s, n: 0, kind: "start", budget, profile: { comfort: 0.75, memory: 1, h3Share: 0.4, stamina: 13.34 } });
    out.push({ day: d, session: s, n: 1, kind: "card", served: sv(`c${d}`), choice: 0, right: true, ms: 5000, hiddenFatigued: false });
    out.push({ day: d, session: s, n: 1, kind: "end", end: end(effort) });
  }
  return out;
}
function mk(persona: string, lines: LogLine[], o: Partial<StudentLog> = {}): StudentLog {
  const days = new Set(lines.map((l) => l.day)).size;
  return {
    persona, seed: 1, lines, profileByDay: Array.from({ length: days }, (_, day) => ({ day, ...prof })),
    knowledge: { day0: 0.4, day14: 0.45, dayEnd: 0.5 }, quitAppDay: null, traits: resolvePersona(byId("strong"), fixture()).traits,
    contentExhausted: 0, ...o,
  };
}
const NAMES = ["no-end-on-wrong", "skip-timing", "effort-cap-and-fairness", "no-repeat-14d", "ends-before-fade", "knowledge-up", "no-back-to-back-card"];
function result(logs: StudentLog[], name: string) {
  const all = runChecks(logs, defaultConfig);
  expect(all.map((c) => c.name)).toEqual(NAMES);
  return all.find((c) => c.name === name)!;
}
/** The named check fails, every other check passes (isolation); returns the failing detail. */
function onlyFails(logs: StudentLog[], name: string): string {
  const all = runChecks(logs, defaultConfig);
  expect(all.map((c) => c.name)).toEqual(NAMES);
  for (const c of all) expect(c.pass, `${c.name}: ${c.detail}`).toBe(c.name !== name);
  const d = all.find((c) => c.name === name)!.detail;
  expect(d).toMatch(/^\d+ violations?; first: /);
  return d;
}
const allPass = (logs: StudentLog[]) => { for (const c of runChecks(logs, defaultConfig)) expect(c.pass, `${c.name}: ${c.detail}`).toBe(true); };
const skipLine = (day: number, card: string, section: string, remindDay: number | null | undefined, o: Partial<LogLine> = {}): LogLine =>
  ({ day, session: day + 1, n: 2, kind: "skip", served: sv(card, { section }), skipReason: "too-hard", ...(remindDay !== undefined ? { remindDay } : {}), hiddenFatigued: false, ...o });
/** Days of cleanLines with the day-`d` card replaced by `served` (and `extra` fields). */
function withCard(lines: LogLine[], d: number, served: Served, extra: Partial<LogLine> = {}): LogLine[] {
  return lines.map((l) => (l.day === d && l.kind === "card" ? { ...l, served, ...extra } : l));
}
/** cleanLines with a skip of `section` (card `k<day>s`) inserted before the end of day `d`. */
function withSkip(lines: LogLine[], d: number, section: string, remindDay: number | null | undefined, o: Partial<LogLine> = {}): LogLine[] {
  const i = lines.findIndex((l) => l.day === d && l.kind === "end");
  return [...lines.slice(0, i), skipLine(d, `k${d}s`, section, remindDay, o), ...lines.slice(i)];
}

test("each check catches a planted violation, and only its own check fails", () => {
  const clean = [mk("strong", cleanLines(12)), mk("weak-stubborn", cleanLines(12, 8)), mk("weak-impatient", cleanLines(12, 8))];
  allPass(clean);

  // end after wrong
  const wrong = cleanLines(12);
  wrong[4] = { ...wrong[4]!, right: false, choice: 1 };
  let d = onlyFails([mk("strong", wrong)], "no-end-on-wrong");
  expect(d).toMatch(/strong day 1 .*c1/);
  // ...but a student who walked out after a wrong answer is not the engine's end
  const left = cleanLines(12);
  left[4] = { ...left[4]!, right: false, choice: 1 };
  left[5] = { ...left[5]!, end: { ...end(5), kind: "left" } };
  allPass([mk("strong", left)]);

  // repeat on day 5 (c0 again, 5 days after day 0)
  const rep = cleanLines(12);
  rep[16] = { ...rep[16]!, served: sv("c0") };
  d = onlyFails([mk("strong", rep)], "no-repeat-14d");
  expect(d).toMatch(/strong day 5.*c0/);
  // a different variant of the same card on another day is fine
  rep[16] = { ...rep[16]!, served: sv("c0", { variant: 1 }) };
  allPass([mk("strong", rep)]);

  // 45 effort on one day
  const big = cleanLines(12);
  big[8] = { ...big[8]!, end: end(45) };
  d = onlyFails([mk("strong", big)], "effort-cap-and-fairness");
  expect(d).toMatch(/strong day 2.*45/);
  // two sessions on one day adding to 41 also break the cap
  const two = [...cleanLines(1, 10, 20), ...cleanLines(1, 10, 21).map((l) => ({ ...l, session: 99, ...(l.served ? { served: sv("other") } : {}) }))];
  onlyFails([mk("strong", two)], "effort-cap-and-fairness");
  // fairness: a weak student asked more than the strong one
  d = onlyFails([mk("strong", cleanLines(12, 8)), mk("weak-stubborn", cleanLines(12, 12)), mk("weak-impatient", cleanLines(12, 8))], "effort-cap-and-fairness");
  expect(d).toMatch(/weak-stubborn/);

  // hidden fatigue on 3 of 12 days (> 20%)
  const tired = cleanLines(12).map((l, i) => (l.kind === "card" && i < 9 ? { ...l, hiddenFatigued: true } : l));
  d = onlyFails([mk("strong", tired)], "ends-before-fade");
  expect(d).toMatch(/strong.*3 of 12/);
  allPass([mk("strong", cleanLines(12).map((l, i) => (l.kind === "card" && i < 6 ? { ...l, hiddenFatigued: true } : l)))]);

  // flat knowledge
  d = onlyFails([mk("strong", cleanLines(12), { knowledge: { day0: 0.4, day14: 0.4, dayEnd: 0.4 } })], "knowledge-up");
  expect(d).toMatch(/strong/);
  // not required for a student who quit the app, or who played fewer than 10 days
  allPass([mk("strong", cleanLines(12), { knowledge: { day0: 0.4, day14: 0.4, dayEnd: 0.4 }, quitAppDay: 11 })]);
  allPass([mk("strong", cleanLines(9), { knowledge: { day0: 0.4, day14: 0.4, dayEnd: 0.4 } })]);

  // the same card again two serves later in one session (another variant, so no-repeat-14d is untouched)
  const b2b = cleanLines(12);
  const i3 = b2b.findIndex((l) => l.day === 3 && l.kind === "card");
  const day3 = (cards: Served[]): LogLine[] => cards.map((s, j) => ({ ...b2b[i3]!, n: j + 1, served: s }));
  const x0 = sv("x", { variant: 0 }), x1 = sv("x", { variant: 1 });
  const near = [...b2b.slice(0, i3), ...day3([x0, sv("y1"), x1]), ...b2b.slice(i3 + 1)];
  d = onlyFails([mk("strong", near)], "no-back-to-back-card");
  expect(d).toMatch(/strong day 3 .*x/);
  // five serves apart is fine
  allPass([mk("strong", [...b2b.slice(0, i3), ...day3([x0, sv("y1"), sv("y2"), sv("y3"), sv("y4"), x1]), ...b2b.slice(i3 + 1)])]);
  // a skip counts as a serve too
  const nearSkip = [...b2b.slice(0, i3), ...day3([x0]), { ...b2b[i3]!, n: 2, kind: "skip" as const, served: { ...x1, section: "Z" }, remindDay: 6, skipReason: "too-hard" as const }, ...b2b.slice(i3 + 1)];
  expect(result([mk("strong", nearSkip)], "no-back-to-back-card").pass).toBe(false);
});

test("skip-timing checks remind days against skipRemindDays, not the engine's own word", () => {
  const plays = cleanLines(22);
  // on time: skip day 0 (count 1 → 3 days), side door on day 3 skipped again (count 2 → +5 = day 8),
  // side door on day 8 answered right (back: count resets), skip day 10 (count 1 → day 13), side door day 13
  let on = withSkip(plays, 0, "B", 3);
  on = withCard(on, 3, sv("k3", { section: "B", reason: "side-door" }));
  on = on.map((l) => (l.day === 3 && l.kind === "card" ? { ...l, kind: "skip" as const, remindDay: 8, skipReason: "too-hard" as const, choice: undefined, right: undefined, ms: undefined } : l));
  on = withCard(on, 8, sv("k8", { section: "B", reason: "side-door" }));
  on = withSkip(on, 10, "B", 13);
  on = withCard(on, 13, sv("k13", { section: "B", reason: "side-door" }));
  allPass([mk("strong", on)]);

  // a remind day sooner than the schedule (skipDay + 1), even if the engine kept to it
  let d = onlyFails([mk("strong", withSkip(plays, 0, "B", 1))], "skip-timing");
  expect(d).toMatch(/strong day 0 .*B.*remind day 1.*expected 3/);
  // the second skip must use the second gap: day 3 + 3 is too early
  const second = on.map((l) => (l.day === 3 && l.kind === "skip" ? { ...l, remindDay: 6 } : l));
  expect(onlyFails([mk("strong", second)], "skip-timing")).toMatch(/day 3 .*expected 8/);
  // a null or missing remind day on a skip
  expect(onlyFails([mk("strong", withSkip(plays, 0, "B", null))], "skip-timing")).toMatch(/no remind day/);
  onlyFails([mk("strong", withSkip(plays, 0, "B", undefined))], "skip-timing");

  // a card from the section before its remind day (the side door on day 1)
  d = onlyFails([mk("strong", withCard(withSkip(plays, 0, "B", 3), 1, sv("k1", { section: "B", reason: "side-door" })))], "skip-timing");
  expect(d).toMatch(/strong day 1 .*k1/);
  // a drip card is allowed before the remind day
  allPass([mk("strong", withCard(withCard(withSkip(plays, 0, "B", 3), 1, sv("k1", { section: "B", reason: "skipped-drip" })), 3, sv("k3", { section: "B", reason: "side-door" })))]);

  // class timing: a not-learned skip may come back through the side door from skipDay + classReturnMinDays
  const cls = plays.map((l) => (l.kind === "start" ? { ...l, topic: { id: "T", source: "class" as const } } : l));
  const early = (reason: "not-learned" | "later", day: number) =>
    withCard(withSkip(cls, 0, "T/B", 3, { skipReason: reason }), day, sv(`k${day}`, { section: "T/B", reason: "side-door" }));
  allPass([mk("strong", early("not-learned", 2))]);
  expect(onlyFails([mk("strong", early("not-learned", 1))], "skip-timing")).toMatch(/day 1 .*k1/); // too soon even for class timing
  expect(onlyFails([mk("strong", early("later", 2))], "skip-timing")).toMatch(/day 2 .*k2/); // only not-learned skips
  // a student-chosen topic does not bring it forward
  const own = withCard(withSkip(plays.map((l) => (l.kind === "start" ? { ...l, topic: { id: "T", source: "student" as const } } : l)), 0, "T/B", 3, { skipReason: "not-learned" }), 2, sv("k2", { section: "T/B", reason: "side-door" }));
  onlyFails([mk("strong", own)], "skip-timing");

  // never back: skipped on day 0, the student plays on to day 21
  d = onlyFails([mk("strong", withSkip(plays, 0, "B", 3))], "skip-timing");
  expect(d).toMatch(/strong day 0 .*section B .*no side door by day 14/);
  // ...unless the student stopped playing before the cap
  allPass([mk("strong", withSkip(cleanLines(12), 0, "B", 3), { knowledge: { day0: 0.4, day14: 0.5, dayEnd: 0.5 } })]);
  // a side door on day 15 (the student skipped day 14) is the first played day at the cap: on time
  const gap = withSkip(plays.filter((l) => l.day !== 14), 0, "B", 3);
  allPass([mk("strong", withCard(gap, 15, sv("k15", { section: "B", reason: "side-door" })))]);
  onlyFails([mk("strong", withCard(gap, 16, sv("k16", { section: "B", reason: "side-door" })))], "skip-timing");
});

test("deepMerge (--config): objects merge, arrays and values replace", () => {
  const cfg = deepMerge(defaultConfig, { budget: { dailyCap: 10 }, skipRemindDays: [1, 2], noRepeatDays: 7, extra: { a: 1 } });
  expect(cfg.budget).toEqual({ ...defaultConfig.budget, dailyCap: 10 });
  expect(cfg.skipRemindDays).toEqual([1, 2]);
  expect(cfg.noRepeatDays).toBe(7);
  expect(cfg.effort).toEqual(defaultConfig.effort);
  expect((cfg as unknown as { extra: unknown }).extra).toEqual({ a: 1 });
  expect(defaultConfig.budget.dailyCap).toBe(40); // the default is not changed
  expect(deepMerge(defaultConfig, undefined)).toBe(defaultConfig);
});

test("runner: quit reasons are logged; I don't know weighs half toward recentWrong", () => {
  const content = fixture();
  // Seed 1 (was 5): after Task 11 (small first sessions, no card back-to-back) seed 5 runs the tiny fixture dry before a time-up quit.
  const log = runStudent(byId("steady-five-min"), content, opts(4, 1));
  const quits = log.lines.filter((l) => l.kind === "quit");
  expect(quits.length).toBeGreaterThan(0);
  for (const q of quits) expect(["time-up", "frustration", "fatigue"]).toContain(q.quitReason);
  expect(quits.some((q) => q.quitReason === "time-up")).toBe(true);
  expect(log.quitAppDay).toBeNull(); // time-up quits are not bad sessions
  expect(DONT_KNOW_WEIGHT).toBe(0.5);
  expect(recentWrongOf([true, false, "dk", "dk"], 8)).toBe(2);
  expect(recentWrongOf([false, false, false, true, true], 2)).toBe(0);
  expect(recentWrongOf(["dk", "dk", "dk"], 2)).toBe(1);
});

test("real content, 3 personas, 10 days: no throw; checks run", () => {
  const content = loadFromRepo(join(import.meta.dirname, "..", ".."));
  const ids = ["strong", "weak-impatient", "underconfident-skipper"];
  const logs = ids.map((id) => runStudent(byId(id), content, opts(10, personaSeed(1, personas.findIndex((p) => p.id === id)))));
  for (const log of logs) {
    expect(log.lines.filter((l) => l.kind === "card").length).toBeGreaterThan(0);
    expect(log.profileByDay).toHaveLength(10);
    expect(log.knowledge.day14).toBe(log.knowledge.dayEnd); // fewer than 15 days: day 14 is the end
  }
  const checks = runChecks(logs, defaultConfig);
  expect(checks.map((c) => c.name)).toEqual(NAMES);
  for (const c of checks) { expect(typeof c.pass).toBe("boolean"); expect(c.detail.length).toBeGreaterThan(0); }
}, 60_000);
