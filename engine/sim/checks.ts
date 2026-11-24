// The six code checks of spec §13 ("Checks done by code"). Pure functions over the runner's logs: no engine calls.
import type { Config } from "../src/index.js";
import type { LogLine, StudentLog } from "./run.js";

export type CheckResult = { name: string; pass: boolean; detail: string };

/** Lines that close one serve of a card (a served card ends in exactly one of these). */
const SERVE_KINDS: LogLine["kind"][] = ["card", "skip", "quit"];
const isServe = (l: LogLine) => SERVE_KINDS.includes(l.kind) && l.served !== undefined;
/** Ends the student caused: not the engine ending a session. */
const NOT_ENGINE_ENDS = ["left", "interrupted"];
/** Not the engine ending a real session: the student's own ends, and a daily cap at start time (no card served). */
const notEngineEnd = (e: NonNullable<LogLine["end"]>) => NOT_ENGINE_ENDS.includes(e.kind) || (e.kind === "daily-cap" && e.cards === 0);

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
        if (!notEngineEnd(l.end!) && l.recap !== true) {
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
      if (l.kind === "rejoin") { // the section's return: no longer kept away, counts as back through the side door
        if (l.section !== undefined) {
          blocks.delete(l.section);
          const r = sec.get(l.section);
          if (r && r.count > 0) r.returned = true;
        }
        return;
      }
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
      if (l.kind !== "skip" || sv.reason === "skipped-drip" || l.scope === "card") return;
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
      const back = log.lines.slice(i + 1).some((x) => x.day <= deadline
        && ((isServe(x) && x.served!.section === sv.section && x.served!.reason === "side-door") || (x.kind === "rejoin" && x.section === sv.section)));
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
    const lastDay = new Map<string, { day: number; right: boolean }>();
    for (const l of log.lines) {
      if (!isServe(l)) continue;
      serves++;
      const key = `${l.served!.card}#${l.served!.variant}`;
      const p = lastDay.get(key);
      // a close:winnable card may come again when its earlier answer was right at least `repeatRightAfterDays` before
      const winnable = l.served!.reason === "close:winnable" && p !== undefined && p.right && l.day - p.day >= cfg.closing.repeatRightAfterDays;
      if (p !== undefined && l.day - p.day < cfg.noRepeatDays && !winnable)
        bad.push(`${where(log, l)}: ${l.served!.card} variant ${l.served!.variant} again (first on day ${p.day})`);
      lastDay.set(key, { day: l.day, right: l.kind === "card" && l.right === true });
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

/**
 * Hidden knowledge at the end above day 0 for every student who kept practising (no app quit, ≥ 10 days). The detail
 * also gives their mean gain, pass or fail (the pass rule is only "above day 0").
 */
function knowledgeUp(logs: StudentLog[]): CheckResult {
  const bad: string[] = [];
  let n = 0;
  let gain = 0;
  for (const log of logs) {
    if (log.quitAppDay !== null || playedDays(log).length < 10) continue;
    n++;
    const k = log.knowledge;
    gain += k.dayEnd - k.day0;
    if (!(k.dayEnd > k.day0)) bad.push(`${log.persona}: knowledge ${k.day0.toFixed(3)} → ${k.dayEnd.toFixed(3)} after ${playedDays(log).length} days played`);
  }
  const mean = n ? gain / n : 0;
  const v = verdict("knowledge-up", bad, `${n} students kept practising, all ended above their day-0 knowledge`);
  return { ...v, detail: `${v.detail}; mean knowledge gain ${mean >= 0 ? "+" : "−"}${Math.abs(mean).toFixed(3)}` };
}

/**
 * A repair card (reason `repair:missing-piece`) is easier than the miss it repairs: level 1 → 1 on another card is the
 * only same-level case. T114: the repair comes near the session end (or opens the next session), so the miss it repairs
 * is the latest non-repair miss on the piece's skill in this session or the one before (a carried repair); a piece
 * with no such miss is from a neighbour skill and is always level 1.
 */
function repairStepsDown(logs: StudentLog[]): CheckResult {
  const bad: string[] = [];
  let repairs = 0;
  for (const log of logs) {
    const lastMiss = new Map<string, LogLine>(); // skill -> its latest answered non-repair miss
    for (const l of log.lines) {
      if (l.kind !== "card" || !l.served) continue;
      const sv = l.served;
      if (sv.reason === "repair:missing-piece") {
        repairs++;
        const m0 = lastMiss.get(sv.skill);
        const m = m0 && m0.session >= l.session - 1 ? m0 : undefined;
        if (m && sv.height >= m.served!.height && !(sv.height === 1 && m.served!.height === 1 && sv.card !== m.served!.card))
          bad.push(`${where(log, l)}: repair ${sv.card} at level ${sv.height} after a miss on ${m.served!.card} at level ${m.served!.height}`);
        if (!m && sv.height !== 1) bad.push(`${where(log, l)}: neighbour repair ${sv.card} at level ${sv.height}, not level 1`);
      }
      if (l.right !== true && !sv.reason.startsWith("repair:")) lastMiss.set(sv.skill, l);
    }
  }
  return verdict("repair-steps-down", bad, `${repairs} missing-piece repair cards, each easier than the miss (or level 1 on another card)`);
}

/** No session with 0 right answers goes on past 5 cards. */
function noLongZeroSession(logs: StudentLog[]): CheckResult {
  const bad: string[] = [];
  let ends = 0;
  for (const log of logs) for (const l of log.lines) {
    if (l.kind !== "end") continue;
    ends++;
    if (l.end!.right === 0 && l.end!.cards > 5) bad.push(`${where(log, l)}: ${l.end!.cards} cards, none right`);
  }
  return verdict("no-long-zero-session", bad, `${ends} sessions, none with 0 right over 5 cards`);
}

/** A side-door card is never served at level 3. */
function sideDoorNotFull(logs: StudentLog[]): CheckResult {
  const bad: string[] = [];
  let doors = 0;
  for (const log of logs) for (const l of log.lines) {
    if (!isServe(l) || l.served!.reason !== "side-door") continue;
    doors++;
    if (l.served!.height === 3) bad.push(`${where(log, l)}: side door ${l.served!.card} at level 3`);
  }
  return verdict("side-door-not-full", bad, `${doors} side-door cards, none at level 3`);
}

/** Session 1 of each student: after 5 right answers in a row, a level 2 or 3 card is served at or after the fifth. */
function dayOneFit(logs: StudentLog[]): CheckResult {
  const bad: string[] = [];
  let runs = 0;
  for (const log of logs) {
    const ls = log.lines.filter((l) => l.session === 1);
    let run = 0;
    let fifth = -1;
    ls.forEach((l, i) => {
      if (fifth >= 0 || l.kind !== "card") return; // skips are not answers: they neither count nor break the run
      // T114: a Hard is no credit toward going up; a fast right (under the guess line) never was.
      run = l.right === true && l.grade !== "hard" && l.fast !== true ? run + 1 : 0;
      if (run === 5) fifth = i;
    });
    if (fifth < 0) continue;
    runs++;
    if (!ls.slice(fifth).some((l) => isServe(l) && l.served!.height >= 2))
      bad.push(`${where(log, ls[fifth]!)}: 5 right in a row, no level 2 or 3 card from the fifth (${ls[fifth]!.served?.card})`);
  }
  return verdict("day-one-fit", bad, `${runs} first sessions with 5 right (not Hard) in a row, each moved up to level 2 or 3`);
}

/** After a non-guess miss on a level-3 card, no level-3 card of that skill is served for `full.restDays` days. */
function noFullAfterFullMiss(logs: StudentLog[], cfg: Config): CheckResult {
  const bad: string[] = [];
  let misses = 0;
  for (const log of logs) {
    const missDay = new Map<string, number>(); // skill -> day of its latest non-guess level-3 miss
    for (const l of log.lines) {
      if (!isServe(l) || l.served!.height !== 3) continue;
      const sk = l.served!.skill;
      const m = missDay.get(sk);
      if (m !== undefined && l.day - m < cfg.full.restDays)
        bad.push(`${where(log, l)}: level 3 card ${l.served!.card} on ${sk}, ${l.day - m} day${l.day - m === 1 ? "" : "s"} after a full-problem miss (day ${m}); rest is ${cfg.full.restDays}`);
      if (l.kind === "card" && l.right !== true && l.guess !== true) { missDay.set(sk, l.day); misses++; }
    }
  }
  return verdict("no-full-after-full-miss", bad, `${misses} missed full problems (not guesses), none followed by a full problem on the skill within ${cfg.full.restDays} days`);
}

/** The card after the given card line in the same session (the next card / skip / quit line), if any. */
function nextServe(log: StudentLog, i: number): LogLine | undefined {
  const l = log.lines[i]!;
  for (let j = i + 1; j < log.lines.length; j++) {
    const x = log.lines[j]!;
    if (x.session !== l.session) return undefined;
    if (isServe(x)) return x;
  }
  return undefined;
}

/** T114 (spec 2026-11-23 §4 item 8): after Again the same card is never served straight away (no same-card retry). */
function noRetryAfterAgain(logs: StudentLog[]): CheckResult {
  const bad: string[] = [];
  let agains = 0;
  for (const log of logs) {
    log.lines.forEach((l, i) => {
      if (l.kind !== "card" || l.right !== false) return;
      agains++;
      const nx = nextServe(log, i);
      if (nx && nx.served!.card === l.served!.card) bad.push(`${where(log, l)}: ${l.served!.card} served again straight after Again`);
    });
  }
  return verdict("no-retry-after-again", bad, `${agains} Agains (or misses), none followed by the same card`);
}

/** T114 (DR-0052): a repair card never comes straight after a miss; it waits for the session end. */
function repairNotStraightAfterMiss(logs: StudentLog[]): CheckResult {
  const bad: string[] = [];
  let repairs = 0;
  for (const log of logs) {
    log.lines.forEach((l, i) => {
      if (l.kind !== "card") return;
      const nx = nextServe(log, i);
      if (!nx || !nx.served!.reason.startsWith("repair:")) return;
      repairs++;
      if (l.right === false) bad.push(`${where(log, l)}: ${nx.served!.reason} ${nx.served!.card} straight after a miss on ${l.served!.card}`);
    });
  }
  return verdict("repair-not-straight-after-miss", bad, `${repairs} repair cards after an answer, none straight after a miss`);
}

export function runChecks(logs: StudentLog[], cfg: Config): CheckResult[] {
  return [
    noEndOnWrong(logs), skipTiming(logs, cfg), effortCapAndFairness(logs, cfg),
    noRepeat(logs, cfg), endsBeforeFade(logs), knowledgeUp(logs), noBackToBack(logs, cfg),
    repairStepsDown(logs), noLongZeroSession(logs), sideDoorNotFull(logs), dayOneFit(logs), noFullAfterFullMiss(logs, cfg),
    noRetryAfterAgain(logs), repairNotStraightAfterMiss(logs),
  ];
}
