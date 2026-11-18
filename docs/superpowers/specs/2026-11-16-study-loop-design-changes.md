# Study loop and scheduler: design changes after the first judge pass

_Date: 2026-11-16 · Status: changes 1–7 accepted (Viraj, 2026-11-16, DR-0051) and built (engine, 2026-11-18); changes 8–15 draft_

Changes to the [study loop design](2026-11-12-study-loop-scheduler-design.md) (section numbers below refer to it). Source: the [judge report, seed 1](../../reviews/2026-11-16-judge-report-seed1.md), the [tuning notes](../../../engine/runs-notes/2026-first-tuning.md) and [DR-0050](../../decisions/0050-session-length-rules-from-first-tuning.md) (still Proposed).

Every change is **(my call)** until Viraj accepts it. Evidence is from one simulated run with AI judges. It shows where the design is weak. It does not show what real students will do.

---

## 1. Why change

Two of the five "design must change" lines were met:
- The weak, impatient student left on day 2. Knowledge stayed at 0.15.
- The fast guesser stayed four weeks and gained 0.04.

The app does adapt: judges picked the right answer in 15 of 16 blind answers, from what the app did. It adapts least where it matters most: after a wrong answer, on the first day, and for the weakest students.

## 2. Changes, in order of expected effect

| # | Problem seen | Change | Section |
|---|---|---|---|
| 1 | After a wrong answer the "missing piece" card was often the same level, sometimes harder. Most common "worst moment". | **A repair card is always easier than the card just failed.** Failed at full → guided or easy. Failed at guided → easy. Failed at easy → a different easy card of the same skill, or of its prerequisite. Never a same-level card of the same skill straight after a miss. | §5 |
| 2 | Three or four misses in a row on one skill (weak-stubborn: 8 cards, 0 right). | **Two misses in a row on a skill: leave that skill for the session.** "I don't know" counts as a miss here. Next card is the easiest available card from a different section. | §5 |
| 3 | Zero-right sessions were the longest sessions. | **Three misses in a row anywhere is a bad moment.** Two bad moments end the session after one easy win. After a session with 2 or fewer right answers, the next session uses the minimum budget and starts with easy cards. | §8 |
| 4 | Strong students: 8 easy cards on day 1. Weak students: guided cards on day 1. | **First sessions use a ladder, not a fixed level.** Start easy. Two right in a row: next card one level up. One miss: one level down. This replaces "easy until 10 answers". The first 3 sessions stay short. | §4, §8 |
| 5 | Students at 95% right against a 75% target got no harder work. | **Push up as well as down.** When the running success rate is 10 points above the target, the next non-repair card is one level higher or a new skill. | §7, §8 |
| 6 | A skipped full problem came back as a full problem. Students who skip full problems answer guided cards on the same skill right. | **"Too hard" is about the card, not the section.** It lowers that skill one level and keeps the section. Only "Not learned yet" and "Later" put the section away. **A side-door card is never a full problem** and is always one level below what was skipped. | §6 |
| 7 | "Easy win" closing cards were wrong three times in a row for the weakest student. Easy cards ran out inside 14 days. | **A closing card may be one the student got right before**, if at least 3 days old. If the closing card is still missed, the session ends with a short recap of what was fixed today, with no question. A session never ends on a wrong answer. | §8 |
| 8 | "Section solid" after one card. "Moved to full problems" when no full problem was shown. | **Moments must be true.** "Section solid" needs every skill that has cards in the section, and at least 2 skills. "Level up" fires only after the first right answer at the new level, and names that level. Add one early moment: the first mistake fixed, shown in the first two sessions. | §9 |
| 9 | Stamina wrong for 9 of 16. Frustration was read as tiredness. One slow day cut sessions for weeks. | **Separate the two signals.** Leaving after wrong answers is frustration: it raises the comfort target (easier work) and does not touch stamina. Tiredness is slow answers late in a session. Stamina uses the last 5 sessions, not the last one. A clean day with no slow answers raises it a little (0.25). | §7, DR-0050 |
| 10 | Memory wrong for 6 of 16. Misconceptions were read as forgetting. | **Memory compares a review with what was expected** at that level, averaged over the last 10 reviews. The same wrong option on the same skill twice is a misconception: next card targets that mistake (a "what is wrong with this thinking" card where one exists). | §5, §7 |
| 11 | The calculation-strong student never saw a full problem. | Follows from changes 4 and 5. Also lower the evidence needed for the calculation-versus-concept number from 6 full problems to 3. | §7 |
| 12 | Fast guesser: wrong in 1 to 2 seconds, treated as knowledge gaps. | **A wrong answer faster than a third of the student's usual time is a guess.** It does not count as evidence about the skill. After 3 guesses in a session, show one line: "Not sure? Tap I don't know. It costs nothing." | §5, §7 |
| 13 | "5 more" repeated a skill just missed. A 100-second answer inside it was ignored. | Extra cards never use a skill missed in this session. One slow answer inside "5 more" ends it after one easy card. | §8 |
| 14 | Same opening card for weeks. A skill failed yesterday opened today. | An opener is never the skill that opened the last two sessions, and never a skill missed in the last session. | §8 |
| 15 | "Kinematics is about 1% of Mechanics marks" did not encourage anyone. | Show the value message only when the section is worth 5% or more. Below that, say what it unlocks: "Three later skills build on this." | §6 |

## 3. What this needs from content

| Need | Why |
|---|---|
| An easy card for each of the 16 skills that have none | Changes 1, 6 and 7 fail without one |
| More easy cards or variants in total (53 single-variant easy cards today) | The weakest student used them all inside 14 days |
| A "mistake" card per common misconception tag | Change 10 |
| Recap text per skill (one line: what you fixed) | Change 7 |

Where a skill has no easier card, the engine uses its prerequisite's easy card. That is the fallback, not the fix.

## 4. What stays

- Three levels, effort budget, daily cap, skip with remind times, the four profile numbers, events, pure engine.
- "Wrong on day X, right now" moments. Students liked these most.
- Comeback sessions. They worked.

## 5. New code checks for the simulator

| Check | Passes when |
|---|---|
| repair-steps-down | No repair card is at or above the level of the card just failed |
| no-long-zero-session | No session with 0 right answers has more than 5 cards |
| side-door-not-full | No side-door card is a full problem |
| moments-true | Every "level up" follows a right answer at that level; every "section solid" covers at least 2 skills |
| day-one-fit | By the end of session 1, a student with 5 right in a row has seen a guided card |

## 6. Decisions for Viraj

1. Change 6: is "Too hard" a card-level signal, with only two reasons putting a section away?
2. Change 7: may a closing card repeat inside 14 days, and is a no-question recap ending acceptable?
3. Change 9: this replaces part of DR-0050 (session length grows only through "5 more"). Accept the replacement, or keep DR-0050?
4. Change 12: is the "tap I don't know" nudge the right tone?
5. Blind comparison: hide right and wrong in blind packets for the next judge pass? Today a judge can lean on the student's own behaviour.
6. Order: all 15 changes in one plan, or changes 1 to 7 first (the ones behind the two met lines), then a second judge pass?

## 7. After approval

A new plan, then build, then rerun three seeds and one judge pass. Target for the next pass: no student quits before day 7, no weak student flat, and the new checks pass.
