import { test, expect } from "vitest";
import { join } from "node:path";
import { fixture } from "./fixture.js";
import { defaultConfig, type Served } from "../src/index.js";
import { loadFromRepo } from "../src/node/load.js";
import { personas } from "../sim/personas.js";
import { resolvePersona, type PersonaSpec } from "../sim/student.js";
import { runStudent, personaSeed, SIM_START, type LogLine, type StudentLog } from "../sim/run.js";
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
const NAMES = ["no-end-on-wrong", "skip-timing", "effort-cap-and-fairness", "no-repeat-14d", "ends-before-fade", "knowledge-up"];
function result(logs: StudentLog[], name: string) {
  const all = runChecks(logs, defaultConfig);
  expect(all.map((c) => c.name)).toEqual(NAMES);
  return all.find((c) => c.name === name)!;
}
const others = (logs: StudentLog[], name: string) =>
  runChecks(logs, defaultConfig).filter((c) => c.name !== name).every((c) => c.pass);

test("each check catches a planted violation", () => {
  const clean = [mk("strong", cleanLines(12)), mk("weak-stubborn", cleanLines(12, 8)), mk("weak-impatient", cleanLines(12, 8))];
  for (const c of runChecks(clean, defaultConfig)) expect(c, c.name).toMatchObject({ pass: true });

  // end after wrong
  const wrong = cleanLines(12);
  wrong[4] = { ...wrong[4]!, right: false, choice: 1 };
  let r = result([mk("strong", wrong)], "no-end-on-wrong");
  expect(r.pass).toBe(false);
  expect(r.detail).toMatch(/strong/);
  expect(r.detail).toMatch(/day 1/);
  expect(r.detail).toMatch(/c1/);
  expect(others([mk("strong", wrong)], "no-end-on-wrong")).toBe(true);
  // ...but a student who walked out after a wrong answer is not the engine's end
  const left = cleanLines(12);
  left[4] = { ...left[4]!, right: false, choice: 1 };
  left[5] = { ...left[5]!, end: { ...end(5), kind: "left" } };
  expect(result([mk("strong", left)], "no-end-on-wrong").pass).toBe(true);

  // repeat on day 5 (c0 again, 5 days after day 0)
  const rep = cleanLines(12);
  rep[16] = { ...rep[16]!, served: sv("c0") };
  r = result([mk("strong", rep)], "no-repeat-14d");
  expect(r.pass).toBe(false);
  expect(r.detail).toMatch(/strong.*day 5.*c0/);
  // a different variant of the same card is fine
  rep[16] = { ...rep[16]!, served: sv("c0", { variant: 1 }) };
  expect(result([mk("strong", rep)], "no-repeat-14d").pass).toBe(true);

  // 45 effort on one day
  const big = cleanLines(12);
  big[8] = { ...big[8]!, end: end(45) };
  r = result([mk("strong", big)], "effort-cap-and-fairness");
  expect(r.pass).toBe(false);
  expect(r.detail).toMatch(/strong.*day 2.*45/);
  // two sessions on one day adding to 41 also break the cap
  const two = [...cleanLines(12, 10, 20).slice(0, 3), ...cleanLines(12, 10, 21).slice(0, 3).map((l) => ({ ...l, session: 99 }))];
  expect(result([mk("strong", two)], "effort-cap-and-fairness").pass).toBe(false);
  // fairness: a weak student asked more than the strong one
  r = result([mk("strong", cleanLines(12, 8)), mk("weak-stubborn", cleanLines(12, 12)), mk("weak-impatient", cleanLines(12, 8))], "effort-cap-and-fairness");
  expect(r.pass).toBe(false);
  expect(r.detail).toMatch(/weak-stubborn/);

  // side door on day 1 after a skip on day 0 (remind day 3)
  const sd = cleanLines(12);
  sd.splice(2, 0, { day: 0, session: 1, n: 2, kind: "skip", served: sv("k0", { section: "B" }), skipReason: "too-hard", remindDay: 3, hiddenFatigued: false });
  const onTime = sd.map((l) => l);
  sd[5] = { ...sd[5]!, served: sv("k1", { section: "B", reason: "side-door" }) };
  r = result([mk("strong", sd)], "skip-timing");
  expect(r.pass).toBe(false);
  expect(r.detail).toMatch(/strong.*day 1.*k1/);
  // a drip card before the remind day is fine; the side door on day 3 is on time
  sd[5] = { ...sd[5]!, served: sv("k1", { section: "B", reason: "skipped-drip" }) };
  onTime[11] = { ...onTime[11]!, served: sv("k3", { section: "B", reason: "side-door" }) };
  sd[11] = onTime[11]!;
  expect(result([mk("strong", sd)], "skip-timing").pass).toBe(true);
  // a skipped section that never comes back while the student plays on
  r = result([mk("strong", [...onTime.slice(0, 11), ...cleanLines(18).slice(10)])], "skip-timing");
  expect(r.pass).toBe(false);
  expect(r.detail).toMatch(/strong.*B/);
  // ...unless the student stopped playing before the cap
  expect(result([mk("strong", onTime.slice(0, 11))], "skip-timing").pass).toBe(true);

  // hidden fatigue on 3 of 12 days (> 20%)
  const tired = cleanLines(12).map((l, i) => (l.kind === "card" && i < 9 ? { ...l, hiddenFatigued: true } : l));
  r = result([mk("strong", tired)], "ends-before-fade");
  expect(r.pass).toBe(false);
  expect(r.detail).toMatch(/strong.*3.*12/);
  const twoTired = cleanLines(12).map((l, i) => (l.kind === "card" && i < 6 ? { ...l, hiddenFatigued: true } : l));
  expect(result([mk("strong", twoTired)], "ends-before-fade").pass).toBe(true);

  // flat knowledge
  r = result([mk("strong", cleanLines(12), { knowledge: { day0: 0.4, day14: 0.4, dayEnd: 0.4 } })], "knowledge-up");
  expect(r.pass).toBe(false);
  expect(r.detail).toMatch(/strong/);
  // not required for a student who quit the app, or who played fewer than 10 days
  expect(result([mk("strong", cleanLines(12), { knowledge: { day0: 0.4, day14: 0.4, dayEnd: 0.4 }, quitAppDay: 11 })], "knowledge-up").pass).toBe(true);
  expect(result([mk("strong", cleanLines(9), { knowledge: { day0: 0.4, day14: 0.4, dayEnd: 0.4 } })], "knowledge-up").pass).toBe(true);
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
