// The six code checks of spec §13 ("Checks done by code"). Pure functions over the runner's logs: no engine calls.
import type { Config } from "../src/index.js";
import type { LogLine, StudentLog } from "./run.js";

export type CheckResult = { name: string; pass: boolean; detail: string };

/** Lines that close one serve of a card (a served card ends in exactly one of these). */
const SERVE_KINDS: LogLine["kind"][] = ["card", "skip", "quit"];
const isServe = (l: LogLine) => SERVE_KINDS.includes(l.kind) && l.served !== undefined;
/** Ends the student caused, or that close no real session: not the engine ending a session. */
const NOT_ENGINE_ENDS = ["left", "interrupted", "daily-cap"];

/** Days with a session opened (a start line). */
export function playedDays(log: StudentLog): number[] {
  return [...new Set(log.lines.filter((l) => l.kind === "start").map((l) => l.day))].sort((a, b) => a - b);
}

function verdict(name: string, bad: string[], ok: string): CheckResult {
  return bad.length === 0 ? { name, pass: true, detail: ok }
    : { name, pass: false, detail: `${bad.length} violation${bad.length > 1 ? "s" : ""}; first: ${bad[0]}` };
}

const where = (log: StudentLog, l: LogLine) => `${log.persona} day ${l.day} session ${l.session}`;

/** No session ends (by the engine) right after a wrong answer. */
function noEndOnWrong(logs: StudentLog[]): CheckResult {
  const bad: string[] = [];
  let ends = 0;
  for (const log of logs) {
    let last: LogLine | null = null;
    for (const l of log.lines) {
      if (l.kind === "start") last = null;
      else if (l.kind === "card" || l.kind === "skip") last = l;
      else if (l.kind === "end") {
        if (!NOT_ENGINE_ENDS.includes(l.end!.kind)) {
          ends++;
          if (last?.kind === "card" && last.right === false)
            bad.push(`${where(log, l)}: ended (${l.end!.kind}) after a wrong answer on ${last.served!.card}`);
        }
        last = null;
      }
    }
  }
  return verdict("no-end-on-wrong", bad, `${ends} engine-ended sessions, none after a wrong answer`);
}

/**
 * Skips, checked against the schedule rather than the engine's word:
 * - every non-drip skip has a remind day exactly `skipRemindDays[min(count − 1, last)]` after the skip day, where
 *   `count` is the section's skip count tracked from the log (reset, as in the engine, when the section has come back
 *   through the side door and is then answered right);
 * - no card from the section before that remind day, except drip cards, and a side door brought forward by class
 *   timing (spec §6: a not-learned skip, the class topic contains the section, from skip day + `classReturnMinDays`);
 * - every skip is followed by a side door for its section by the first played day on or after skip day + the last
 *   remind gap (the cap), when the student plays that late.
 */
function skipTiming(logs: StudentLog[], cfg: Config): CheckResult {
  const bad: string[] = [];
  const gaps = cfg.skipRemindDays;
  const cap = Math.max(...gaps);
  let skips = 0;
  for (const log of logs) {
    const blocks = new Map<string, { remind: number; skipDay: number; reason: string }>();
    const sec = new Map<string, { count: number; returned: boolean }>();
    let topic: LogLine["topic"] = null;
    const played = playedDays(log);
    log.lines.forEach((l, i) => {
      if (l.kind === "start") topic = l.topic ?? null;
      if (!isServe(l)) return;
      const sv = l.served!;
      const b = blocks.get(sv.section);
      if (b && l.day >= b.remind) blocks.delete(sv.section);
      else if (b && sv.reason !== "skipped-drip") {
        const t = topic as LogLine["topic"];
        const classEarly = sv.reason === "side-door" && b.reason === "not-learned" && t?.source === "class"
          && sv.section.startsWith(`${t.id}/`) && l.day >= b.skipDay + cfg.skip.classReturnMinDays;
        if (classEarly) blocks.delete(sv.section);
        else bad.push(`${where(log, l)}: ${sv.card} (${sv.reason}) from skipped section ${sv.section} before its remind day ${b.remind}`);
      }
      const rec = sec.get(sv.section) ?? { count: 0, returned: false };
      if (l.kind === "card") { // the engine's afterSectionAnswer
        if (sv.reason === "side-door" && rec.count > 0 && !rec.returned) rec.returned = true;
        if (l.right === true && rec.returned && rec.count > 0) rec.count = 0;
        sec.set(sv.section, rec);
        return;
      }
      if (l.kind !== "skip" || sv.reason === "skipped-drip") return;
      skips++;
      rec.count += 1;
      rec.returned = false;
      sec.set(sv.section, rec);
      const want = l.day + gaps[Math.min(rec.count - 1, gaps.length - 1)]!;
      const reason = l.skipReason ?? "later";
      if (l.remindDay === undefined || l.remindDay === null) {
        bad.push(`${where(log, l)}: section ${sv.section} skipped (${sv.card}, skip ${rec.count}) with no remind day (expected ${want})`);
        blocks.set(sv.section, { remind: want, skipDay: l.day, reason });
      } else {
        if (l.remindDay !== want) bad.push(`${where(log, l)}: section ${sv.section} skipped (${sv.card}, skip ${rec.count}): remind day ${l.remindDay}, expected ${want}`);
        blocks.set(sv.section, { remind: Math.max(l.remindDay, want), skipDay: l.day, reason });
      }
      const deadline = played.find((d) => d >= l.day + cap);
      if (deadline === undefined) return; // the student stopped playing before the cap
      const back = log.lines.slice(i + 1).some((x) => x.day <= deadline && isServe(x) && x.served!.section === sv.section && x.served!.reason === "side-door");
      if (!back) bad.push(`${where(log, l)}: section ${sv.section} skipped (${sv.card}) and no side door by day ${deadline}`);
    });
  }
  return verdict("skip-timing", bad, `${skips} skips, remind days on schedule, kept away until then and back by the cap`);
}

/** Within one session, the same card (any variant) is not served again within the next `session.returnAfterCards` serves. */
function noBackToBack(logs: StudentLog[], cfg: Config): CheckResult {
  const bad: string[] = [];
  const gap = cfg.session.returnAfterCards;
  let serves = 0;
  for (const log of logs) {
    let session = -1;
    let recent: string[] = [];
    for (const l of log.lines) {
      if (!isServe(l)) continue;
      if (l.session !== session) { session = l.session; recent = []; }
      serves++;
      const card = l.served!.card;
      const j = recent.lastIndexOf(card);
      if (j >= 0 && recent.length - j <= gap)
        bad.push(`${where(log, l)}: ${card} (${l.served!.reason}) again ${recent.length - j} serve${recent.length - j > 1 ? "s" : ""} after the last`);
      recent.push(card);
    }
  }
  return verdict("no-back-to-back-card", bad, `${serves} serves, no card again within ${gap} serves in a session`);
}

/** Mean over played days of the day's asked effort (the sum of session budgets at start). */
export function meanAsked(log: StudentLog): number {
  const byDay = new Map<number, number>();
  for (const l of log.lines) if (l.kind === "start") byDay.set(l.day, (byDay.get(l.day) ?? 0) + (l.budget ?? 0));
  return byDay.size ? [...byDay.values()].reduce((a, b) => a + b, 0) / byDay.size : 0;
}

/** No day's effort above the daily cap; weak students not asked more per day, on average, than the strong one. */
function effortCapAndFairness(logs: StudentLog[], cfg: Config): CheckResult {
  const bad: string[] = [];
  let maxDay = 0;
  for (const log of logs) {
    const byDay = new Map<number, number>();
    for (const l of log.lines) if (l.kind === "end") byDay.set(l.day, (byDay.get(l.day) ?? 0) + l.end!.effort);
    for (const [day, e] of [...byDay].sort((a, b) => a[0] - b[0])) {
      maxDay = Math.max(maxDay, e);
      if (e > cfg.budget.dailyCap) bad.push(`${log.persona} day ${day}: effort ${e} above the daily cap ${cfg.budget.dailyCap}`);
    }
  }
  const strong = logs.find((l) => l.persona === "strong");
  const fmt = (x: number) => x.toFixed(2);
  let fair = "fairness not checked (strong or weak personas missing)";
  if (strong) {
    const s = meanAsked(strong);
    const parts: string[] = [];
    for (const id of ["weak-stubborn", "weak-impatient"]) {
      const w = logs.find((l) => l.persona === id);
      if (!w) continue;
      const m = meanAsked(w);
      parts.push(`${id} ${fmt(m)}`);
      if (m > s) bad.push(`${id}: mean daily effort asked ${fmt(m)} above strong's ${fmt(s)}`);
    }
    if (parts.length) fair = `mean asked/day strong ${fmt(s)}, ${parts.join(", ")}`;
  }
  return verdict("effort-cap-and-fairness", bad, `max day effort ${maxDay} ≤ ${cfg.budget.dailyCap}; ${fair}`);
}

/** No card variant served twice within `noRepeatDays`. */
function noRepeat(logs: StudentLog[], cfg: Config): CheckResult {
  const bad: string[] = [];
  let serves = 0;
  for (const log of logs) {
    const lastDay = new Map<string, number>();
    for (const l of log.lines) {
      if (!isServe(l)) continue;
      serves++;
      const key = `${l.served!.card}#${l.served!.variant}`;
      const p = lastDay.get(key);
      if (p !== undefined && l.day - p < cfg.noRepeatDays)
        bad.push(`${where(log, l)}: ${l.served!.card} variant ${l.served!.variant} again (first on day ${p})`);
      lastDay.set(key, l.day);
    }
  }
  return verdict("no-repeat-14d", bad, `${serves} serves, no variant repeated within ${cfg.noRepeatDays} days`);
}

/** Per student: days with any card served past the hidden stamina ≤ 1 in 5 of the days played. */
function endsBeforeFade(logs: StudentLog[]): CheckResult {
  const bad: string[] = [];
  let worst = 0;
  for (const log of logs) {
    const played = playedDays(log).length;
    const tired = new Set(log.lines.filter((l) => l.hiddenFatigued === true).map((l) => l.day));
    if (played === 0) continue;
    worst = Math.max(worst, tired.size / played);
    if (tired.size > 0.2 * played) {
      const first = log.lines.find((l) => l.hiddenFatigued === true)!;
      bad.push(`${log.persona}: ${tired.size} of ${played} days past hidden stamina (first ${where(log, first)}, ${first.served?.card})`);
    }
  }
  return verdict("ends-before-fade", bad, `worst share of days past hidden stamina ${(100 * worst).toFixed(0)}% ≤ 20%`);
}

/** Hidden knowledge at the end above day 0 for every student who kept practising (no app quit, ≥ 10 days). */
function knowledgeUp(logs: StudentLog[]): CheckResult {
  const bad: string[] = [];
  let n = 0;
  for (const log of logs) {
    if (log.quitAppDay !== null || playedDays(log).length < 10) continue;
    n++;
    const k = log.knowledge;
    if (!(k.dayEnd > k.day0)) bad.push(`${log.persona}: knowledge ${k.day0.toFixed(3)} → ${k.dayEnd.toFixed(3)} after ${playedDays(log).length} days played`);
  }
  return verdict("knowledge-up", bad, `${n} students kept practising, all ended above their day-0 knowledge`);
}

export function runChecks(logs: StudentLog[], cfg: Config): CheckResult[] {
  return [
    noEndOnWrong(logs), skipTiming(logs, cfg), effortCapAndFairness(logs, cfg),
    noRepeat(logs, cfg), endsBeforeFade(logs), knowledgeUp(logs), noBackToBack(logs, cfg),
  ];
}
