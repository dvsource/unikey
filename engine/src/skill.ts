import type { Config } from "./config.js";
import type { Attempt, Height, SkillDef, SkillRec } from "./types.js";

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

export function recordAttempt(
  rec: SkillRec, def: SkillDef, a: Attempt, memory: number, cfg: Config,
): { rec: SkillRec; steppedUp: boolean; steppedDown: boolean } {
  const out: SkillRec = {
    ...rec, attempts: [...rec.attempts, a].slice(-cfg.skill.attemptsKept), solidDays: [...rec.solidDays],
  };
  const avail = available(def);
  const top = avail.length ? avail[avail.length - 1] : null;

  if (!a.right && out.firstFailedDay === null) {
    out.firstFailedDay = a.day;
    out.firstFailedHeight = a.height;
  }

  // Review gap.
  if (a.right) {
    if (a.height >= rec.height) {
      const gap = cfg.reviewGapsDays[Math.min(rec.gapIndex, cfg.reviewGapsDays.length - 1)];
      out.nextReviewDay = a.day + Math.max(1, Math.round(gap * memory));
      out.gapIndex = Math.min(rec.gapIndex + 1, cfg.reviewGapsDays.length - 1);
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
  if (a.height === rec.height) {
    const win = out.attempts.filter((x) => x.height === rec.height && x.seq >= rec.windowStartSeq);
    if (a.right) {
      const n = cfg.stepUp.rightInRow;
      const last = win.slice(-n);
      let ok = last.length === n && last.every((x) => x.right);
      for (let i = 1; ok && i < last.length; i++) {
        ok = last[i].day !== last[i - 1].day || last[i].seq - last[i - 1].seq >= cfg.stepUp.minCardsApart;
      }
      if (ok) {
        const higher = avail.find((h) => h > rec.height);
        if (higher !== undefined && !(higher === 3 && out.noFullUntilDay !== null && a.day < out.noFullUntilDay)) {
          out.height = higher;
          steppedUp = true;
        }
      }
    } else {
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
  return { rec: out, steppedUp, steppedDown };
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
