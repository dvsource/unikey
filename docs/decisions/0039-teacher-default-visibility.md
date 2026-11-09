# DR-0039: By default a teacher sees effort plus the skill map

- **Status:** Accepted (Viraj, 2026-11-07)
- **Date:** 2026-11-07 · **Owner:** Viraj
- **Area:** Product / Privacy
- **Extends:** [DR-0018](0018-student-is-primary-customer.md) (student controls sharing) to teachers

## Context
Parents see effort only by default (DR-0018). Teachers need more to help: which skills a class is stuck on and which mistakes repeat.

## Options considered
1. Effort only, like parents
2. **Effort + skill map** (practice days, streak, skill mastery, mistake patterns) ✅
3. Everything, including scores and individual answers

## Decision
- Default for a student in a class: effort + skill map. Raw scores and individual answers are never shown.
- At join the student gives the name their teacher knows them by, and sees "Your teacher sees your practice days, topic progress and mistake patterns", and that their results count in anonymous class totals. They can lower it to effort only at any time in settings.
- **No skill data before parent consent:** until a parent replies YES (A8, 7-day grace, [DR-0026](0026-onboarding-flow.md)), the teacher sees the name and effort only. Check against legal item L5.
- Class-level patterns appear only with at least 5 active students.

## Revisit triggers
- Many students lower the level, or refuse to join classes
- Legal review of minors' data says otherwise ([legal](../living/legal-and-privacy.md))
- Review date: 2027-04-01

## Consequences
+ Teachers can act on bottleneck skills and misconceptions
− More data shared by default than with parents, so the join screen must say it plainly
