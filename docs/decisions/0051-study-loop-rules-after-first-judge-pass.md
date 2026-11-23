# DR-0051: Study-loop rules after the first judge pass

- **Status:** Accepted (Viraj, 2026-11-16); change 1 timing amended by [DR-0052](0052-anki-style-self-grading.md), change 6 by [DR-0054](0054-one-screen-study-card.md)
- **Date:** 2026-11-16 · **Owner:** Viraj
- **Area:** Product / Retention
- **Source:** [judge report, seed 1](../reviews/2026-11-16-judge-report-seed1.md); [design changes](../superpowers/specs/2026-11-16-study-loop-design-changes.md) §2 rows 1 to 7, §6 decisions 1, 2, 6
- **Extends:** [DR-0048](0048-pilot-engine-simple-skill-schedule.md), [DR-0049](0049-effort-based-day-and-skip.md)

## Context
The first AI-judge pass ran on simulator seed 1 (28 days, 16 simulated students, engine at commit 38b8710). Two of the five "design must change" lines were met:
- The weak, impatient student left on day 2. Knowledge stayed at 0.15.
- The fast guesser stayed four weeks and gained 0.04.

Judges picked the right answer in 15 of 16 blind answers (7 of 8 pairs passed), so the app adapts. It adapts least after a wrong answer, on day 1, and for the weakest students. One code check also failed: no-end-on-wrong, 9 violations. By the spec, the design must change.

## Options considered
1. Make all 15 proposed changes in one plan, then judge again: slow, and hides which change helped
2. **Make changes 1 to 7 first (the ones behind the two met lines), then run a second judge pass** ✅ (Viraj, 2026-11-16)

## Decision
Seven changes to the study loop (section numbers refer to the [study loop design](../superpowers/specs/2026-11-12-study-loop-scheduler-design.md)):

| # | Change | Section |
|---|---|---|
| 1 | **A repair card is always easier than the card just failed.** Failed at full: guided or easy. Failed at guided: easy. Failed at easy: a different easy card of the same skill, or of its prerequisite. Never a same-level card of the same skill straight after a miss. | §5 |
| 2 | **Two misses in a row on a skill: leave that skill for the session.** "I don't know" counts as a miss. Next card is the easiest available card from a different section. | §5 |
| 3 | **Three misses in a row anywhere is a bad moment.** Two bad moments end the session after one easy win. After a session with 2 or fewer right answers, the next session uses the minimum budget and starts with easy cards. | §8 |
| 4 | **First sessions use a ladder, not a fixed level.** Start easy. Two right in a row: one level up. One miss: one level down. This replaces "easy until 10 answers". The first 3 sessions stay short. | §4, §8 |
| 5 | **Push up as well as down.** When the running success rate is 10 points above the target, the next non-repair card is one level higher or a new skill. | §7, §8 |
| 6 | **"Too hard" is about the card, not the section.** It lowers that skill one level and keeps the section. Only "Not learned yet" and "Later" put the section away. A side-door card is never a full problem and is always one level below what was skipped. | §6 |
| 7 | **A closing card may be one the student got right before**, if at least 3 days old. If the closing card is still missed, the session ends with a short recap of what was fixed today, with no question. A session never ends on a wrong answer. | §8 |

Decisions from the changes doc §6:
- **Decision 1:** "Too hard" is a card-level signal. Only two reasons put a section away (change 6).
- **Decision 2:** A closing card may repeat after 3 days, inside 14 days. A missed closing card ends in a recap with no question (change 7).
- **Decision 6:** Order is changes 1 to 7 first, then a second judge pass. Changes 8 to 15 wait for that pass.

Not decided here:
- [DR-0050](0050-session-length-rules-from-first-tuning.md) stays **Proposed**. Change 9 would replace part of it, and that is not accepted.
- Changes 8 to 15 are drafts. Decisions 3, 4 and 5 of the changes doc are open.

## Assumptions
- The judge pass shows where the design is weak. It does not show what real students will do; one simulated run, AI judges.
- Changes 1, 6 and 7 need an easy card for each of the 16 skills that have none. Until then the engine falls back to the prerequisite's easy card. That is a fallback, not a fix.

## Revisit triggers
- The second judge pass still meets a "design must change" line
- Real pilot students quit early on the new first-session ladder
- Review date: 2027-02-01

## Consequences
+ The two met lines get a direct fix, and the second pass shows if it worked
+ Smaller plan, easier to tell which change helped
− Changes 8 to 15 (moments, stamina, memory, guesses) wait one more cycle
− Seven rule changes touch the engine at once; the simulator and new code checks must be rerun
