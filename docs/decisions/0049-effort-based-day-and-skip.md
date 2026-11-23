# DR-0049: The day is measured in effort, with a skip action

- **Status:** Accepted (Viraj, 2026-11-14); skip reason dropped by [DR-0054](0054-one-screen-study-card.md)
- **Date:** 2026-11-14 · **Owner:** Viraj
- **Area:** Product / Retention
- **Source:** [study-loop scheduler design](../superpowers/specs/2026-11-12-study-loop-scheduler-design.md) §6, §8, §12
- **Amends:** [DR-0019](0019-teen-retention-design.md)

## Context
[DR-0019](0019-teen-retention-design.md) counts a minimum day and a session as "10 questions". Ten easy cards and ten hard ones are not the same work, and a student having a bad day should not lose a streak for stopping early. Students also need a way to say "not now" to a card without feeling they failed.

## Options considered
1. Keep "10 questions": simple / ignores how hard the work was
2. **Measure the day in effort, let a bad day end early and still count, add a "Not now" skip** ✅ (Viraj, 2026-11-14)

## Decision
The minimum day and the session length are measured in effort, not "10 questions". Sessions can end early on a bad day and still count. A skip action is added.
- **Minimum day:** 8 effort keeps the streak
- **Bad-day early end:** keeps the streak
- **Daily cap:** 40 effort
- **"Not now" skip:** skips the card's section. Remind times are 3, 5, 8, 13 and then 14 days. The cap is 14 days. A right answer on the section resets the count.

## Assumptions
- Effort per card (height 1 = 1, height 2 = 1.5, height 3 = 4, wrong = 1, don't know = 0) tracks real work well enough
- A visible skip does not teach students to skip everything

## Revisit triggers
- Pilot data shows students use "Not now" to avoid whole units
- Streaks at 8 effort are too easy or too hard in practice

## Consequences
+ A short, honest day still counts, so fewer streaks break on bad days
+ Skips are gentle and come back on a schedule
− Effort numbers are a model; they need checking against pilot data
− Streak rules differ from DR-0019 and teachers need to be told

## Note on numbering
The expert review's proposed DR numbers (0048–0059) were never written. Those proposals shift up if they are adopted.
