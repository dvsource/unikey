# DR-0054: One-screen study card: two buttons, silent section skip, hold for English

- **Status:** Accepted (Viraj, 2026-11-23)
- **Date:** 2026-11-23 · **Owner:** Viraj
- **Area:** Product / Design
- **Source:** [student journey redesign](../superpowers/specs/2026-11-23-student-journey-redesign-design.md) §3
- **Amends:** [DR-0049](0049-effort-based-day-and-skip.md) (drops the skip reason), [DR-0051](0051-study-loop-rules-after-first-judge-pass.md) change 6 ("Too hard" is no longer a student signal)

## Context
The engine build shows the question on one screen and the answer on a second. Under every question there are four buttons: I don't know, Not now, Too hard and End session. Only "Not now" was a decision ([DR-0049](0049-effort-based-day-and-skip.md)). "Too hard" was meant to be an optional reason on a toast after the skip, and "I don't know" was a design call. The EN chip at the top was built for reviewers checking translations. Viraj wants the answer below the question, only "Show answer" and "Skip", and English on hold in a corner.

## Options considered
1. Keep the current buttons and fix only the layout: little work / still too many choices
2. **Two buttons on every card, the answer on the same screen, grade buttons after the reveal** ✅ (Viraj, 2026-11-23)

## Decision
- **One screen per card.** The question stays put. After Show answer, the answer or the marked options, the mistake line and the explanation appear below it, and the screen scrolls if needed.
- **Before the reveal:** two buttons, **Skip** and **Show answer**. After it: Again / Hard / Good / Easy, or one Next when the app marked an MCQ wrong ([DR-0052](0052-anki-style-self-grading.md)).
- **Skip** is the DR-0049 section skip (remind after 3, 5, 8, 13, then every 14 days) with **no reason asked**. Every skip counts as "Later". "Not learned yet" is covered by the covered-units screen in onboarding ([DR-0055](0055-onboarding-revised-for-anki-loop.md)).
- **No "I don't know", "Too hard" or "End session" buttons.** The phone's Back ends the session with no "are you sure?". Progress is saved and the streak counts if the student reached the minimum day.
- **EN, top-left:** press and hold to show English under each line, let go to hide it. Not a toggle.
- **Effort bar:** a thin bar at the top with no numbers. Nothing else above the question.
- **Separate reviewer build.** The student APK has no reviewer UI. The reviewer APK keeps item ids, the Review button and the reviewer tools.

## Revisit triggers
- Students can't find how to end a session (pilot feedback or many killed apps mid-session)
- Without a reason, skips can't tell "not learned yet" from "don't like it", and that hurts scheduling
- Review date: 2027-02-01

## Consequences
+ One action to think about at a time: answer, then grade
+ Reviewer-only tools stop leaking into the student view
− The engine loses the "too hard" and "not learned yet" skip reasons
− Two builds to keep in step
