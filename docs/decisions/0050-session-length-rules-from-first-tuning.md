# DR-0050: Session-length rules from the first tuning pass

- **Status:** Proposed (awaiting Viraj)
- **Date:** 2026-11-15 · **Owner:** Viraj
- **Area:** Product / Retention
- **Source:** [study-loop scheduler design](../superpowers/specs/2026-11-12-study-loop-scheduler-design.md) §7, §8, §13; tuning notes `engine/runs-notes/2026-first-tuning.md`
- **Extends:** [DR-0049](0049-effort-based-day-and-skip.md)

## Context
[DR-0049](0049-effort-based-day-and-skip.md) measures the day in effort: 8 keeps the streak, 40 is the cap. It does not say how long one session is, when it ends, or how its length changes for a student. The engine's first tuning pass against the 16 simulated students had to settle these, so that weak students are never asked for more than strong ones, sessions end before the student tires, and a session does not end on a wrong answer. These rules were made in tuning, not by Viraj. This record writes them down for his decision.

## Options considered
1. Fixed session length (for example 10 cards or 12 effort) for everyone: simple / ignores the student, and the weak and strong students get the same load
2. Length from the student's stamina, grown on any clean session: adapts fast / in the simulation it grew on noise and ran students past their limit
3. **Length from the student's stamina, grown only on the student's own choice of "5 more", shrunk on a fade sign; small first sessions; easy first and closing cards** ✅ (tuning, awaiting Viraj)

## Decision
The engine's session-length rules, as tuned:
- **First sessions:** a student's first 3 sessions use the minimum-day budget, 8 effort.
- **Stamina grows** only when the student takes "5 more" and finishes it with no fade sign (+1). A clean session that ends by its budget leaves it as it was.
- **Stamina shrinks** after a fade: two slow answers in a session (each over 2 times the student's usual time), three bad moments, or leaving early. It moves 30% of the way toward the effort where the fade began, and never rises on a fade.
- **"5 more" is offered** when the session's success is at or above the student's comfort level and no slow answer was seen.
- **A day's sessions are planned under the cap:** a new session plans only what still leaves room for its closing cards under 40, so new sessions stop at about 34 effort for the day.
- **A session that ends by its budget keeps the streak**, even under 8 effort.
- **No ending on a wrong answer:** when the budget is spent and the last answer was right, the session ends there. After a wrong answer an easy closing card follows, and after a wrong closing card another one, at most 3 in all. **Open question for Viraj:** when all three closing cards go wrong, the session ends on a wrong answer. Accept that, raise the limit, add more easy cards, or end with something that is not a question.
- **Easy where it matters:** a new student's first cards, and every closing card, are the easiest eligible cards (the lowest height available anywhere, height 3 only when nothing lower is left).
- **No card comes back within 4 cards** of the same session.

## Assumptions
- The simulated students' tiredness and patience are close enough to real students' for these numbers to be a fair start
- Students take "5 more" when they feel able to; a student who never taps it is happy with the length they have
- Two slow answers in one session are a sign of tiredness more often than of distraction

## Revisit triggers
- Pilot data shows sessions ending well before students would stop by themselves, or students leaving mid-session often
- Students who never tap "5 more" stay at short sessions while doing well
- The weakest students end sessions on a wrong answer more than about 1 session in 20
- Review date: 2027-02-01

## Consequences
+ Weak students are never asked for more effort than strong ones (in the simulation, on all seeds)
+ Sessions end on a right answer except in the three-wrong-closing-cards case
+ Length grows from evidence the student gives (taking "5 more"), not from guesses
− Students who never tap "5 more" keep short sessions, however well they do
− Strong students get easy first days: three 8-effort sessions and easy opening cards, before their stamina can grow
− Two distractions in one session read as a fade and shorten the next sessions a little
− A very weak student can still end a session on three wrong closing cards (6 to 9 sessions in 28 days per simulated run, almost all one persona)
