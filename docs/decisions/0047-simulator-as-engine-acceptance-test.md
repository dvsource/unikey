# DR-0047: The simulator is the learning engine's acceptance test

- **Status:** Accepted (2026-11-09), as a soft gate
- **Date:** 2026-11-09 · **Owner:** Viraj
- **Area:** Tech / Process
- **Source:** [simulation and admin plan](../living/simulation-and-admin.md) §2, §7

## Context
The scheduler and mastery model ([DR-0022](0022-typed-skill-graph.md)) are the core of the product, and the dashboard's insights are built on them. Unit and property tests prove the code does what it says, not that its estimates are right. Real students can't tell us their true mastery. Synthetic students with known mastery can, before 100 real students and 3–4 teachers see the engine's mistakes.

## Options considered
1. Unit and property tests only: cheap / can't check accuracy or insights
2. Learn on the pilot: real data / mistakes land on real teachers in week 2
3. A simulator with known true mastery, run through the real backend, with fixed pass criteria that block the pilot start (hard gate)
4. **The same simulator and criteria, as a soft gate: results are reported but don't block the mid-January start** ✅ (Viraj, 2026-11-09)

## Decision
A full 8-week sim run (100 students, 7 personas, planted patterns) is run about a week before the pilot and checked against these criteria. It's a **soft gate**: the results go into a go/no-go report, and they don't block the mid-January start on their own.
- **Engine accuracy:** estimated vs true mastery, r ≥ 0.7 by sim week 2
- **Daily cap:** ≥ 95% of students stay within the daily cap
- **Invariants:** never scheduled in the past; mastery within 0–1
- **Teacher insights:** the planted bottleneck is found in ≥ 90% of classes; ≤ 1 false alarm per class per week
- **Data integrity:** no events lost or double-counted under faults; no simulated data in real views

The rest of the go/no-go table in the living doc (privacy, flows, performance, content, operations, humans) goes in the same report. Every failed row gets a note: fixed, fix planned in pilot week N, or accepted risk. Viraj reads the report and decides. The sim is rerun after every change to the scheduler or the insight rules.

## Assumptions
- The sim proves plumbing and engine consistency, not teen retention; that stays with the pilot ([E01](../experiments/E01-founding-100-pilot.md))

## Revisit triggers
- Pilot data shows the engine's estimates disagree with teacher judgement despite a passing sim
- A failed row (especially privacy or data integrity) causes a real problem in the pilot; then make that row a hard gate
- Review date: 2027-02-01

## Consequences
+ Engine and insight bugs found before teachers see them; reruns are cheap
+ The mid-January start date doesn't slip because of the sim
− 1.5–2 weeks of build before the pilot; engine and sim may share the same wrong assumptions
− A known failure can reach real students and teachers if Viraj chooses to launch anyway
