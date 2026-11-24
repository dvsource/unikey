# DR-0055: Onboarding revised: the first session is the placement, paywall after sign-in, one parent message

- **Status:** Superseded in part by [DR-0057](0057-onboarding-v1-short-flow.md) (order for this version); was Accepted (Viraj, 2026-11-23)
- **Date:** 2026-11-23 · **Owner:** Viraj
- **Area:** Product / Design
- **Source:** [student journey redesign](../superpowers/specs/2026-11-23-student-journey-redesign-design.md) §2; copy in [UX design](../living/ux-design.md#a-onboarding)
- **Supersedes in part:** [DR-0026](0026-onboarding-flow.md) (the separate quick check, the A1–A9 order). Settles the order left open in [DR-0030](0030-paywall-after-first-session.md).

## Context
Onboarding (A1–A9, [DR-0026](0026-onboarding-flow.md)) was never built. The prototype was a reviewer tool, and onboarding was parked as a later sub-task. Viraj wants it in the app. With the Anki-style card ([DR-0052](0052-anki-style-self-grading.md)), DR-0026's quick check (8–15 questions) plus a first session (10 questions) means about 25 cards and 10 minutes before the paywall. The first-session ladder from [DR-0051](0051-study-loop-rules-after-first-judge-pass.md) change 4 already finds the student's level.

## Options considered
1. Keep A1–A9 as written: a better first map / a long start, and a test before any win
2. **Merge the quick check into the first session; teach the card with coach lines; paywall after sign-in; one parent message** ✅ (Viraj, 2026-11-23)

## Decision
New order (screen copy is in the UX design doc):
1. Welcome: medium, optional class code
2. About you: optional name, goal, stream, exam year
3. Routine: usual study time, WhatsApp reminder off by default. **Kept for now; to be revisited.**
4. Units covered: pre-filled, tap to fix. Also does the job of a "not learned yet" skip.
5. First session: about 5 minutes, starts easy and climbs (the ladder), about half MCQ. **This is the placement; there is no separate quick check.** One coach line teaches each action the first time it is needed (think then Show answer, be honest with the grade, MCQ selection, hold EN, skip). No tutorial screen.
6. Day 1 done with the starting map (strong-in chips, this week's topics, first skill started)
7. Save progress: Google, phone, or Later
8. Paywall (**after sign-in**), with "Ask a parent on WhatsApp" and "I have a code". In the pilot it takes the Founding 100 activation code.
9. Day-1 home with the widget offer

- **One parent message for consent and payment.** The student's WhatsApp to the parent carries one link. The page asks for consent first (what the parent will see), then payment. The 7-day consent grace and the legal check from DR-0026 still apply.
- Everyone sees the same screens, with or without a class code.

## Revisit triggers
- Many students stop before the first session ends
- First-session placement is often wrong (week-1 success far from the target)
- Legal review rejects combined consent and payment
- Review date: 2027-02-01

## Consequences
+ First win inside about 5 minutes, with no test feel
+ One parent step instead of two
− The starting map is rougher than a 15-question placement
− The routine screen still lengthens the start until it is revisited
