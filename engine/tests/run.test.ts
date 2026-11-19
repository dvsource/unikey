import { test, expect } from "vitest";
import { join } from "node:path";
import { fixture } from "./fixture.js";
import { defaultConfig, type Served } from "../src/index.js";
import { loadFromRepo } from "../src/node/load.js";
import { personas } from "../sim/personas.js";
import { resolvePersona, simParams, type PersonaSpec } from "../sim/student.js";
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
const end = (effort: number) => ({ kind: "budget" as const, effort, cards: 1, right: 1, fixed: 0, streakKept: true, recap: false, fixedSkills: [] as string[], rightSkills: [] as string[] }); // change 7, F3: EndInfo shape
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
const NAMES = ["no-end-on-wrong", "skip-timing", "effort-cap-and-fairness", "no-repeat-14d", "ends-before-fade", "knowledge-up", "no-back-to-back-card", "repair-steps-down", "no-long-zero-session", "side-door-not-full", "day-one-fit", "no-full-after-full-miss"];
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
  // F2: a real session the engine ended daily-cap after a wrong answer counts...
  const capped = cleanLines(12);
  capped[4] = { ...capped[4]!, right: false, choice: 1 };
  capped[5] = { ...capped[5]!, end: { ...end(5), kind: "daily-cap" } };
  expect(onlyFails([mk("strong", capped)], "no-end-on-wrong")).toMatch(/strong day 1 .*daily-cap.*c1/);
  // ...a start-time cap (0 cards, no start line) does not
  const startCap = cleanLines(12);
  startCap.splice(6, 0, { day: 1, session: 99, n: 0, kind: "end", end: { kind: "daily-cap", effort: 0, cards: 0, right: 0, fixed: 0, streakKept: true, recap: false, fixedSkills: [], rightSkills: [] } }); // F3: EndInfo shape
  allPass([mk("strong", startCap)]);

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
  // F2: the mean knowledge gain is reported, pass or fail
  expect(d).toMatch(/mean knowledge gain \+0\.000/);
  expect(result([mk("strong", cleanLines(12)), mk("weak-stubborn", cleanLines(12, 8), { knowledge: { day0: 0.2, day14: 0.25, dayEnd: 0.4 } })], "knowledge-up").detail)
    .toMatch(/2 students kept practising.*mean knowledge gain \+0\.150/);
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
  // F14: the condition is set up directly (it used to depend on the seed, bent 5 → 1 → 3). A five-minute student who
  // is never frustrated or tired, and sessions long enough to pass simParams.fiveMinEffort from the first one.
  const base = byId("steady-five-min");
  const fiveMin: PersonaSpec = { ...base, traits: { ...base.traits, prior: 0.95, patienceWrongs: 99, stamina: 40, skipBelow: 0, dontKnowBelow: 0 } };
  const long = deepMerge(defaultConfig, { budget: { firstSessions: 0, staminaDefault: 30 } });
  expect(long.budget.staminaDefault * (1 - long.budget.margin)).toBeGreaterThan(simParams.fiveMinEffort);
  for (const seed of [1, 2, 3]) {
    const log = runStudent(fiveMin, content, { ...opts(3, seed), cfg: long });
    const quits = log.lines.filter((l) => l.kind === "quit");
    expect(quits.length, `seed ${seed}`).toBeGreaterThan(0);
    expect(quits.every((q) => q.quitReason === "time-up"), `seed ${seed}`).toBe(true);
    expect(log.quitAppDay).toBeNull(); // time-up quits are not bad sessions
  }
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

// ---------- Task 2: new checks and amendments (hand-built logs) ----------

/** One session on `day` (session number `session`): start, the given cards (right = true/false, with `served`), end. */
function session(day: number, sessionNo: number, cards: { s: Served; right?: boolean; kind?: "card" | "skip" }[], endOver: Partial<ReturnType<typeof end>> = {}): LogLine[] {
  const out: LogLine[] = [{ day, session: sessionNo, n: 0, kind: "start", budget: 10, profile: { comfort: 0.75, memory: 1, h3Share: 0.4, stamina: 13.34 } }];
  cards.forEach((c, i) => out.push(c.kind === "skip"
    ? { day, session: sessionNo, n: i + 1, kind: "skip", served: c.s, skipReason: "too-hard", remindDay: day + 3, hiddenFatigued: false }
    : { day, session: sessionNo, n: i + 1, kind: "card", served: c.s, choice: c.right === false ? 1 : 0, right: c.right ?? true, ms: 5000, hiddenFatigued: false }));
  out.push({ day, session: sessionNo, n: cards.length, kind: "end", end: { ...end(5), cards: cards.length, right: cards.filter((c) => c.right !== false && c.kind !== "skip").length, ...endOver } });
  return out;
}
/** Plays day 1.. (session 2..) of clean one-card days after `first`, so the student is a normal one. */
const after = (first: LogLine[], days = 11): LogLine[] => [...first, ...cleanLines(days + 1).filter((l) => l.day >= 1).map((l) => ({ ...l, ...(l.served ? { served: sv(`z${l.day}`) } : {}) }))];
const withRecap = (lines: LogLine[]): LogLine[] => lines.map((l) => (l.kind === "end" && l.session === 1 ? { ...l, recap: true } : l));
const day0 = (cards: { s: Served; right?: boolean; kind?: "card" | "skip" }[], endOver: Partial<ReturnType<typeof end>> = {}) => after(session(0, 1, cards, endOver));
const ok4 = [{ s: sv("a1"), right: true }, { s: sv("a2"), right: true }, { s: sv("a3", { height: 2 }), right: true }];

test("repair-steps-down: a repair card is easier than the missed card, level 1 → 1 on another card is fine", () => {
  allPass([mk("strong", day0(ok4))]);
  const rep = (missH: 1 | 2 | 3, repH: 1 | 2 | 3, o: Partial<Served> = {}) => day0([
    { s: sv("m", { height: missH }), right: false },
    { s: sv("r", { height: repH, reason: "repair:missing-piece", ...o }), right: true },
    { s: sv("a3", { height: 2 }), right: true },
  ]);
  allPass([mk("strong", rep(3, 2))]);
  allPass([mk("strong", rep(2, 1))]);
  allPass([mk("strong", rep(1, 1))]); // level 1 → level 1, different card
  const d = onlyFails([mk("strong", rep(3, 3, { skill: "s2" }))], "repair-steps-down"); // another skill, so the full-problem rest is not in play
  expect(d).toMatch(/^1 violation; first: strong day 0 session 1.*r/);
  onlyFails([mk("strong", rep(2, 3))], "repair-steps-down");
  expect(result([mk("strong", rep(1, 1, { card: "m", variant: 1 }))], "repair-steps-down").pass).toBe(false); // same card at level 1 (also trips no-back-to-back)
  // compared with the nearest earlier miss that is not itself a repair card
  allPass([mk("strong", day0([
    { s: sv("m", { height: 3 }), right: false },
    { s: sv("r1", { height: 2, reason: "repair:missing-piece" }), right: false },
    { s: sv("r2", { height: 2, reason: "repair:missing-piece" }), right: true }, // passes against m (3), would fail against r1 (2)
  ]))]);
  // a right answer is no anchor: no earlier miss, nothing to compare
  allPass([mk("strong", day0([{ s: sv("m", { height: 1 }), right: true }, { s: sv("r", { height: 3, reason: "repair:missing-piece" }), right: true }]))]);
  // a miss in another session is not the anchor: miss in session 1, same-level repair in session 2
  const cross = [...withRecap(session(0, 1, [{ s: sv("m", { height: 2 }), right: false }])), ...session(1, 2, [{ s: sv("r", { height: 2, reason: "repair:missing-piece" }), right: true }]), ...cleanLines(13).filter((l) => l.day >= 2)];
  allPass([mk("strong", cross)]);
  // "I don't know" (right !== true) is a miss
  const dk = day0([{ s: sv("m", { height: 2 }), right: false }, { s: sv("r", { height: 2, reason: "repair:missing-piece" }), right: true }]);
  onlyFails([mk("strong", dk)], "repair-steps-down");
});

test("no-long-zero-session: right 0 with more than 5 cards", () => {
  const cards = (n: number) => Array.from({ length: n }, (_, i) => ({ s: sv(`q${i}`), right: false }));
  // (the sessions end on a recap so no-end-on-wrong stays out of it)
  allPass([mk("strong", withRecap(day0(cards(5))))]);
  const d = onlyFails([mk("strong", withRecap(day0(cards(6))))], "no-long-zero-session");
  expect(d).toMatch(/^1 violation; first: strong day 0 session 1/);
  // one right answer is not a zero session
  allPass([mk("strong", day0([...cards(5), { s: sv("q9"), right: true }]))]);
});

test("side-door-not-full: no side-door card at level 3", () => {
  allPass([mk("strong", day0([{ s: sv("a1", { reason: "side-door", height: 2 }) }, { s: sv("a2", { reason: "side-door", height: 1 }) }, { s: sv("a3", { height: 3 }) }]))]);
  const d = onlyFails([mk("strong", day0([{ s: sv("a1", { height: 2 }) }, { s: sv("a2", { reason: "side-door", height: 3 }) }]))], "side-door-not-full");
  expect(d).toMatch(/^1 violation; first: strong day 0 session 1.*a2/);
  // a skipped (card scope) side-door card at level 3 was still served
  const sk = day0([{ s: sv("a2", { reason: "side-door", height: 3 }), kind: "skip" }]).map((l) => (l.kind === "skip" ? { ...l, scope: "card" as const } : l));
  onlyFails([mk("strong", sk)], "side-door-not-full");
});

test("day-one-fit: after 5 right in a row in session 1, a level 2 or 3 card at or after the fifth", () => {
  const r = (n: number, h: 1 | 2 | 3 = 1) => Array.from({ length: n }, (_, i) => ({ s: sv(`f${i}${h}${n}`, { height: h }), right: true }));
  allPass([mk("strong", day0(r(4)))]); // never reaches 5
  allPass([mk("strong", day0([...r(5), { s: sv("g", { height: 2 }), right: true }]))]); // 6th card is level 2
  allPass([mk("strong", day0([...r(4), { s: sv("g", { height: 3 }), right: true }]))]); // the fifth itself is level 3
  const d = onlyFails([mk("strong", day0(r(6)))], "day-one-fit");
  expect(d).toMatch(/^1 violation; first: strong day 0 session 1/);
  // a level 2 card before the fifth does not count
  onlyFails([mk("strong", day0([{ s: sv("g", { height: 2 }), right: true }, ...r(5)]))], "day-one-fit");
  // a miss resets the run
  allPass([mk("strong", day0([...r(3), { s: sv("w"), right: false }, ...r(4, 1).map((c, i) => ({ s: sv(`h${i}`), right: true }))]))]);
  // a skip between right answers neither counts nor breaks the run: 4 right + skip is no run of 5, 5 right around a skip is
  const cardSkip = (c: Served): { s: Served; kind: "skip" } => ({ s: c, kind: "skip" });
  const noScope = (lines: LogLine[]): LogLine[] => lines.map((l) => (l.kind === "skip" ? { ...l, scope: "card" as const } : l));
  allPass([mk("strong", noScope(day0([...r(4), cardSkip(sv("k1"))])))]);
  const around = [...r(2), cardSkip(sv("k2")), ...r(3, 1).map((c, i) => ({ s: sv(`j${i}`), right: true }))];
  onlyFails([mk("strong", noScope(day0(around)))], "day-one-fit");
  // a skipped level-2 card at or after the fifth right answer counts as a guided card seen
  allPass([mk("strong", noScope(day0([...r(5), cardSkip(sv("k3", { height: 2 }))])))]);
  // only session 1: the same run in session 2 is not checked
  const later = [...cleanLines(1), ...session(1, 2, r(8)), ...cleanLines(12).filter((l) => l.day >= 2)];
  allPass([mk("strong", later)]);
});

test("amendment: no-end-on-wrong ignores an end on a recap", () => {
  const wrong = cleanLines(12);
  wrong[4] = { ...wrong[4]!, right: false, choice: 1 };
  onlyFails([mk("strong", wrong)], "no-end-on-wrong");
  wrong[5] = { ...wrong[5]!, end: { ...end(5), kind: "budget" }, recap: true };
  allPass([mk("strong", wrong)]);
  wrong[5] = { ...wrong[5]!, recap: false };
  onlyFails([mk("strong", wrong)], "no-end-on-wrong");
});

test("amendment: no-repeat-14d allows a close:winnable repeat of a card right at least 3 days before", () => {
  const rep = (reason: Served["reason"], gapDay: number, firstRight = true) => {
    const l = cleanLines(12);
    l[1] = { ...l[1]!, right: firstRight, choice: firstRight ? 0 : 1 };
    const i = l.findIndex((x) => x.day === gapDay && x.kind === "card");
    l[i] = { ...l[i]!, served: sv("c0", { reason }) };
    return l;
  };
  // (the first answer c0 on day 0 is the earlier answer)
  onlyFails([mk("strong", rep("due-review", 3))], "no-repeat-14d");
  allPass([mk("strong", rep("close:winnable", 3))]);
  allPass([mk("strong", rep("close:winnable", 5))]);
  onlyFails([mk("strong", rep("close:winnable", 2))], "no-repeat-14d"); // only 2 days before
  const wrongFirst = rep("close:winnable", 5, false);
  // a wrong first answer makes the day-0 card end the session on a wrong answer; check only the repeat rule
  expect(result([mk("strong", wrongFirst)], "no-repeat-14d").pass).toBe(false);
  // the first serve was a skip: no right answer to rely on
  const skipFirst = cleanLines(12);
  skipFirst[1] = { ...skipFirst[1]!, kind: "skip", right: undefined, choice: undefined, ms: undefined, remindDay: 3, skipReason: "too-hard" };
  const j = skipFirst.findIndex((x) => x.day === 5 && x.kind === "card");
  skipFirst[j] = { ...skipFirst[j]!, served: sv("c0", { reason: "close:winnable" }) };
  expect(result([mk("strong", skipFirst)], "no-repeat-14d").pass).toBe(false);
  // the exemption follows cfg.closing.repeatRightAfterDays
  const logs = [mk("strong", rep("close:winnable", 2))];
  const cfg = { ...defaultConfig, closing: { repeatRightAfterDays: 2 } };
  expect(runChecks(logs, cfg).find((c) => c.name === "no-repeat-14d")!.pass).toBe(true);
});

test("amendment: skip-timing treats a rejoin as the section's return and ignores card-scope skips", () => {
  const plays = cleanLines(22);
  const rejoin = (day: number, section: string): LogLine => ({ day, session: day + 1, n: 1, kind: "rejoin", section });
  const putRejoin = (lines: LogLine[], day: number, section: string) => {
    const i = lines.findIndex((l) => l.day === day && l.kind === "card");
    return [...lines.slice(0, i), rejoin(day, section), ...lines.slice(i)];
  };
  // a card from the section on day 1, before the remind day 3: a violation without a rejoin
  const early = withCard(withSkip(plays, 0, "B", 3), 1, sv("k1", { section: "B", reason: "due-review" }));
  onlyFails([mk("strong", early)], "skip-timing");
  // with the section's rejoin first, the card is no violation (and the rejoin counts as the return by the cap)
  allPass([mk("strong", putRejoin(early, 1, "B"))]);
  // a rejoin of another section does not help
  onlyFails([mk("strong", putRejoin(early, 1, "C"))], "skip-timing");
  // never back: no side door by the cap; a rejoin is the return
  onlyFails([mk("strong", withSkip(plays, 0, "B", 3))], "skip-timing");
  allPass([mk("strong", putRejoin(withSkip(plays, 0, "B", 3), 4, "B"))]);
  // a card-scope skip has no remind-day schedule; a section skip with the same fields still does
  const cardSkip = withSkip(plays, 0, "B", undefined, { scope: "card" });
  allPass([mk("strong", cardSkip)]);
  onlyFails([mk("strong", withSkip(plays, 0, "B", undefined, { scope: "section" }))], "skip-timing");
  onlyFails([mk("strong", withSkip(plays, 0, "B", undefined))], "skip-timing");
});

// ---------- change 6: card-level "too hard" and the silent rejoin ----------

test("runner logs scope on skips and a rejoin line", () => {
  // B has only full problems, so a skipped B card can never come back through the side door (never level 3): it rejoins.
  // The student fears B (knowledge 0.05: "not learned yet", a section skip) and skips some A cards (knowledge 0.3: "too hard").
  const B = "u.t1/B";
  const content = fixture({ drop: ["b1.h1.1", "b1.h1.2", "b1.h1.3", "b2.h1.1", "b2.h1.2", "b2.h1.3", "b1.h2.1", "b1.h2.2", "b1.h2.3", "b2.h2.1", "b2.h2.2", "b2.h2.3"] });
  const base = byId("average-noclass");
  const spec: PersonaSpec = {
    ...base, id: "t6",
    traits: { ...base.traits, fearedSections: [B], priorBySection: { [B]: 0.05, "u.t1/A": 0.3 }, skipBelow: 0.6, patienceWrongs: 99, patienceSessions: 99, dontKnowBelow: 0 },
  };
  const log = runStudent(spec, content, opts(14, 5));
  const skips = log.lines.filter((l) => l.kind === "skip");
  expect(skips.every((l) => l.scope === "card" || l.scope === "section")).toBe(true);
  const card = skips.filter((l) => l.scope === "card");
  const sec = skips.filter((l) => l.scope === "section");
  expect(card.length).toBeGreaterThan(0);
  expect(sec.length).toBeGreaterThan(0);
  expect(card.every((l) => l.skipReason === "too-hard")).toBe(true);
  expect(sec.every((l) => l.skipReason !== "too-hard")).toBe(true);
  // a card-level skip is never asked to confirm
  log.lines.forEach((l, i) => { if (l.kind === "skip" && l.scope === "card") expect(log.lines[i - 1]?.kind).not.toBe("confirm-skip"); });
  const rejoins = log.lines.filter((l) => l.kind === "rejoin");
  expect(rejoins.length).toBeGreaterThan(0);
  for (const l of rejoins) {
    expect(l.section).toBe(B);
    expect(typeof l.day).toBe("number");
    expect(typeof l.session).toBe("number");
  }
  // no side door for B ever (it has no card below level 3); the log passes the skip checks
  expect(log.lines.some((l) => l.served?.reason === "side-door" && l.served.section === B)).toBe(false);
  const checks = runChecks([log], defaultConfig);
  for (const name of ["skip-timing", "side-door-not-full"]) expect(checks.find((c) => c.name === name), name).toMatchObject({ pass: true });
});

test("change 7: the runner copies the engine's recap onto every end line", () => {
  const content = fixture();
  let recaps = 0;
  for (const id of ["weak-stubborn", "weak-impatient", "average-noclass"]) {
    for (const seed of [1, 2, 3]) {
      const log = runStudent(byId(id), content, opts(8, seed));
      for (const l of log.lines.filter((x) => x.kind === "end")) {
        expect(l.recap).toBe(l.end!.recap);
        expect(typeof l.recap).toBe("boolean");
        if (l.recap) recaps++;
      }
    }
  }
  expect(recaps).toBeGreaterThan(0);
});

test("no-full-after-full-miss: a level-3 card of the skill inside the rest after a non-guess level-3 miss", () => {
  const plays = cleanLines(12);
  const f3 = (card: string, o: Partial<Served> = {}) => sv(card, { height: 3, ...o });
  // the miss closes its day as a recap, so no-end-on-wrong is not in play
  const miss = (d: number, o: Partial<LogLine> = {}) =>
    withCard(plays, d, f3(`m${d}`), { right: false, choice: 1, ...o }).map((l) => (l.day === d && l.kind === "end" ? { ...l, recap: true } : l));
  // the miss on day 2 then a full on day 3 (1 day later, rest is 2): violation
  let l = miss(2);
  l = withCard(l, 3, f3("again", { reason: "stretch:up" }));
  const d = onlyFails([mk("strong", l)], "no-full-after-full-miss");
  expect(d).toMatch(/strong day 3 .*again.*day 2/);
  // two days later is fine; so is another skill; so is a level 2 card
  let ok = withCard(miss(2), 4, f3("later"));
  allPass([mk("strong", ok)]);
  ok = withCard(miss(2), 3, f3("other", { skill: "s2" }));
  allPass([mk("strong", ok)]);
  ok = withCard(miss(2), 3, sv("easy", { height: 2 }));
  allPass([mk("strong", ok)]);
  // "I don't know" on a full problem also starts the rest
  const dk = withCard(miss(2, { choice: "dont-know" }), 3, f3("again"));
  onlyFails([mk("strong", dk)], "no-full-after-full-miss");
  // a guess on a level-3 card does not
  const guessed = withCard(miss(2, { guess: true }), 3, f3("again"));
  allPass([mk("strong", guessed)]);
  // a right answer does not
  allPass([mk("strong", withCard(withCard(plays, 2, f3("r2")), 3, f3("again")))]);
});

test("the runner logs guess on answers and a hint line for the nudge", () => {
  const log = runStudent(byId("fast-guesser"), fixture(), opts(8, 5));
  const cards = log.lines.filter((l) => l.kind === "card");
  const guesses = cards.filter((l) => l.guess === true);
  expect(guesses.length).toBeGreaterThan(3);
  for (const g of guesses) expect(g.right).toBe(false);
  for (const c of cards) expect(typeof c.guess).toBe("boolean");
  const hints = log.lines.filter((l) => l.kind === "hint");
  expect(hints.length).toBeGreaterThan(0);
  for (const h of hints) expect(h.hint).toBe("guess-nudge");
  // once per session, and only after a session's third guess
  const bySession = new Map<number, number>();
  for (const h of hints) bySession.set(h.session, (bySession.get(h.session) ?? 0) + 1);
  for (const n of bySession.values()) expect(n).toBe(1);
  for (const h of hints) expect(log.lines.filter((l) => l.session === h.session && l.guess === true && l.n <= h.n).length).toBeGreaterThanOrEqual(3);
});
