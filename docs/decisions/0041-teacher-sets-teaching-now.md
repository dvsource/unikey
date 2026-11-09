# DR-0041: The teacher sets "Teaching now" for each class

- **Status:** Accepted (Viraj, 2026-11-07)
- **Date:** 2026-11-07 · **Owner:** Viraj
- **Area:** Product
- **Source:** [teacher dashboard plan](../living/teacher-dashboard.md)

## Context
The practice order uses an "in current unit" factor ([DR-0022](0022-typed-skill-graph.md)), but the app can only guess what the class is on. The onboarding pre-fill guesses covered units from the exam year and month ([DR-0026](0026-onboarding-flow.md)).

## Options considered
1. Guess from the calendar only
2. **The teacher taps the topic being taught now, per class** ✅

## Decision
- One tap per class picks the current topic. It drives the student queue's `in_current_unit` factor and the dashboard's "fading" signal.
- Students without a class keep the calendar guess.

## Revisit triggers
- Teachers forget to update it, so queues go stale
- Review date: 2027-04-01

## Consequences
+ Practice matches what's being taught in class this week
− Stale if the teacher doesn't update it; needs a gentle reminder in the digest
