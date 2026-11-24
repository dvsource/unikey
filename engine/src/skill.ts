import type { Config } from "./config.js";
import type { Attempt, Grade, Height, SkillDef, SkillRec } from "./types.js";

const HEIGHTS: Height[] = [1, 2, 3];

export function newSkillRec(height: Height): SkillRec {
  return {
    height, attempts: [], gapIndex: 0, nextReviewDay: null, firstFailedDay: null,
    firstFailedHeight: null, solidDays: [], noFullUntilDay: null, windowStartSeq: 0,
  };
}

function available(def: SkillDef): Height[] {
  return HEIGHTS.filter((h) => def.cards[h].length > 0);
}

/** The grade of an attempt; one saved before grades counts as good when right, again when not. */
export const gradeOf = (a: { right: boolean; grade?: Grade }): Grade => a.grade ?? (a.right ? "good" : "again");

/**
 * T114 grade effects (DR-0052): again resets the gap to 1 day (a miss). hard is right but the gap step does not advance
 * and it is no credit toward a step up (it breaks "right in a row"). good is today's right. easy skips one gap step and,
 * when `opts.easyUp` (not yet used this session for the skill), steps the skill up at once (never into a rested level 3).
 */
export function recordAttempt(
  rec: SkillRec, def: SkillDef, a: Attempt, memory: number, cfg: Config, opts: { easyUp?: boolean } = {},
): { rec: SkillRec; steppedUp: boolean; steppedDown: boolean; easyUp: boolean } {
  const out: SkillRec = {
    ...rec, attempts: [...rec.attempts, a].slice(-cfg.skill.attemptsKept), solidDays: [...rec.solidDays],
  };
  const avail = available(def);
  const top = avail.length ? avail[avail.length - 1] : null;

  if (!a.right && out.firstFailedDay === null) {
    out.firstFailedDay = a.day;
    out.firstFailedHeight = a.height;
  }

  // Rule 2: a missed full problem rests the skill's full problems; the rest is never moved earlier.
  if (!a.right && a.height === 3) out.noFullUntilDay = Math.max(out.noFullUntilDay ?? 0, a.day + cfg.full.restDays);

  // Review gap. `gapIndex` is the step the next good answer uses.
  const grade = gradeOf(a);
  const lastGap = cfg.reviewGapsDays.length - 1;
  if (a.right) {
    if (a.height >= rec.height) {
      // hard: the step it is on (the one before `gapIndex`), no advance; easy: one step further, two steps on.
      const at = grade === "hard" ? Math.max(0, rec.gapIndex - 1) : grade === "easy" ? rec.gapIndex + 1 : rec.gapIndex;
      const gap = cfg.reviewGapsDays[Math.min(at, lastGap)];
      out.nextReviewDay = a.day + Math.max(1, Math.round(gap * memory));
      out.gapIndex = Math.min(rec.gapIndex + (grade === "hard" ? 0 : grade === "easy" ? 2 : 1), lastGap);
    }
  } else {
    out.gapIndex = 0;
    out.nextReviewDay = a.day + cfg.reviewGapsDays[0];
  }

  // Solid days.
  if (a.right && top !== null && a.height === top && !out.solidDays.includes(a.day)) {
    out.solidDays = [...out.solidDays, a.day].slice(-cfg.skill.solidDays);
  }

  // Steps, judged on attempts at the current height since the window start.
  let steppedUp = false;
  let steppedDown = false;
  let easyUp = false;
  const fullRested = (h: Height) => h === 3 && out.noFullUntilDay !== null && a.day < out.noFullUntilDay;
  if (a.height === rec.height && grade === "easy" && opts.easyUp === true && a.fast !== true) {
    // T114: Easy steps up at once (once per skill per session, the caller says), never into a rested level 3 (a full
    // miss, or a returning section's first days).
    const higher = avail.find((h) => h > rec.height);
    if (higher !== undefined && !fullRested(higher)) {
      out.height = higher;
      out.windowStartSeq = a.seq + 1;
      steppedUp = true;
      easyUp = true;
    }
  }
  if (a.height === rec.height && !easyUp) {
    // A fast right answer (rule 1) is skipped: it is neither a right nor a break in "right in a row", and cannot step up.
    const win = out.attempts.filter((x) => x.height === rec.height && x.seq >= rec.windowStartSeq);
    if (a.right && a.fast !== true) {
      const n = cfg.stepUp.rightInRow;
      const last = win.filter((x) => x.fast !== true).slice(-n); // fast rights are left out of step-up only
      let ok = last.length === n && last.every((x) => x.right && gradeOf(x) !== "hard"); // a hard is no credit
      for (let i = 1; ok && i < last.length; i++) {
        ok = last[i].day !== last[i - 1].day || last[i].seq - last[i - 1].seq >= cfg.stepUp.minCardsApart;
      }
      if (ok) {
        const higher = avail.find((h) => h > rec.height);
        if (higher !== undefined && !fullRested(higher)) {
          out.height = higher;
          steppedUp = true;
        }
      }
    } else if (!a.right) {
      const recent = win.slice(-cfg.stepDown.window);
      if (recent.filter((x) => !x.right).length >= cfg.stepDown.wrongs) {
        const lower = [...avail].reverse().find((h) => h < rec.height);
        if (lower !== undefined) {
          out.height = lower;
          steppedDown = true;
        }
      }
    }
    if (steppedUp || steppedDown) out.windowStartSeq = a.seq + 1;
  }
  // Rule 3: the skill's last two full-problem attempts are both misses: a skill recorded at 3 goes to 2, new window.
  if (!a.right && a.height === 3 && out.height === 3) {
    const full = out.attempts.filter((x) => x.height === 3).slice(-2);
    const lower = [...avail].reverse().find((h) => h < 3);
    if (full.length === 2 && full.every((x) => !x.right) && lower !== undefined) {
      out.height = lower;
      out.windowStartSeq = a.seq + 1;
      steppedDown = true;
    }
  }
  return { rec: out, steppedUp, steppedDown, easyUp };
}

export function isSolid(rec: SkillRec, def: SkillDef, cfg: Config): boolean {
  const avail = available(def);
  const top = avail.length ? avail[avail.length - 1] : 1;
  return top >= 2 && rec.solidDays.length >= cfg.skill.solidDays;
}

export function isDue(rec: SkillRec, day: number): boolean {
  return rec.nextReviewDay !== null && rec.nextReviewDay <= day;
}

/** Default start 2; comfortLow or returning starts at 1; falls back to the nearest available height. */
export function startHeight(def: SkillDef, comfortLow: boolean, returning: boolean): Height {
  const want: Height = comfortLow || returning ? 1 : 2;
  const avail = available(def);
  if (avail.length === 0) return want;
  return [...avail].sort((x, y) => Math.abs(x - want) - Math.abs(y - want) || x - y)[0];
}
