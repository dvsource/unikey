# DR-0048: The pilot engine uses a simple skill-level schedule

- **Status:** Accepted (Viraj, 2026-11-14)
- **Date:** 2026-11-14 · **Owner:** Viraj
- **Area:** Tech / Product
- **Source:** [study-loop scheduler design](../superpowers/specs/2026-11-12-study-loop-scheduler-design.md) §12
- **Supersedes in part:** [DR-0022](0022-typed-skill-graph.md)

## Context
[DR-0022](0022-typed-skill-graph.md) sets FSRS per card, Elo per skill, implicit review weights and adaptive placement. That is a lot of machinery to build and tune before we have any pilot data. The study-loop design needs something small that we can read, test and explain to teachers.

## Options considered
1. Keep the DR-0022 model as written: complete / slow to build, hard to tune with no data
2. **One simple skill-level schedule: heights plus review gaps scaled by a memory number** ✅ (Viraj, 2026-11-14)
3. Fixed review gaps with no per-student scaling: simplest / ignores that students differ

## Decision
For the pilot, heights plus review gaps scaled by a memory number replace FSRS per card plus Elo per skill, implicit review weights and adaptive placement. The graph, its edge types, exam weights and soft gating are kept and used. The fuller model can return when real data shows what it would improve.

The text simulator in this plan runs before, not instead of, the backend simulator in [DR-0047](0047-simulator-as-engine-acceptance-test.md).

## Assumptions
- Three heights per skill and review gaps of 1, 3, 7, 14 and 30 days are enough to schedule well for the pilot
- A single memory number per student, kept between 0.5 and 2, captures most of the difference between students

## Revisit triggers
- Pilot data shows review timing is clearly wrong for a group of students

## Consequences
+ The engine is small enough to test fully and to explain
+ The graph and exam weights are still used, so content work is not wasted
− Review timing is cruder than FSRS; some students will see cards too early or too late
− Readiness ([DR-0022](0022-typed-skill-graph.md)) is still not defined; the app shows skills by height per section until it is

## Note on numbering
The expert review's proposed DR numbers (0048–0059) were never written. Those proposals shift up if they are adopted.
