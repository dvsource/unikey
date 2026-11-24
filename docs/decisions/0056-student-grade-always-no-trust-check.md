# DR-0056: The student's grade always counts; no trust check for now

- **Status:** Accepted (Viraj, 2026-11-24)
- **Date:** 2026-11-24 · **Owner:** Viraj
- **Area:** Product
- **Supersedes in part:** [DR-0052](0052-anki-style-self-grading.md) (the forced Again and Next button on a wrong or empty MCQ, and the trust check)

## Context
[DR-0052](0052-anki-style-self-grading.md) made the app set Again, with one Next button, when an MCQ was wrong or nothing was picked. It also added a hidden trust check that discounted a student's Good and Easy when their MCQ results disagreed. Reading the explanation, Viraj chose to accept what the student presses for now. How grades should be checked or corrected will be decided from pilot data.

## Options considered
1. Keep DR-0052 as written: honest marks on MCQ, a correction for over-confidence / overrides the student, and the trust check is built before there is data
2. **Always show the four grades and use the student's grade; log the MCQ result; no trust check yet** ✅ (Viraj, 2026-11-24)

## Decision
- After Show answer, **every card shows Again / Hard / Good / Easy**: a recall card, a right MCQ, a wrong MCQ, and an MCQ with nothing picked. There is no Next button.
- **The engine schedules from the student's grade only.** The MCQ's right or wrong is still shown on screen (the correct option green, a wrong pick red) and saved in the event log, but it does not change the grade.
- **No trust check** in this version. Pilot data (grades against MCQ results) will decide whether a trust check or something like it is built.
- The grade effects in DR-0052 (when a skill returns and its level) are unchanged. They are starting values to be tested against pilot data and revised.
- The day-1 MCQ share of about half ([DR-0053](0053-recall-first-content-mix.md)) stays, so the placement test and the event log have checked answers.

## Revisit triggers
- Pilot data shows self-grades on MCQ often disagree with the result (for example Good or Easy on a wrong pick)
- Review date: 2027-02-01

## Consequences
+ The student is in control of every grade; one rule for every card
+ Nothing is built before there is data to tune it
− An over-confident student can move up faster than they should until a check exists
− The event log must keep the MCQ result next to the grade, so the later analysis is possible
