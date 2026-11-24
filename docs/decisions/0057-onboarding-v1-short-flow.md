# DR-0057: Onboarding for this version: Welcome, placement test, About you and save, Home

- **Status:** Accepted (Viraj, 2026-11-24)
- **Date:** 2026-11-24 · **Owner:** Viraj
- **Area:** Product / Design
- **Supersedes in part:** [DR-0055](0055-onboarding-revised-for-anki-loop.md) (the nine-screen order). Ordering to be revised in later versions.

## Context
[DR-0055](0055-onboarding-revised-for-anki-loop.md) set nine onboarding screens. For the first in-app version, Viraj wants a shorter flow. Routine, covered units and the paywall come later.

## Options considered
1. Build the nine screens of DR-0055: complete / more to build and more before the first win
2. **Four steps for this version; the dropped screens go to the backlog** ✅ (Viraj, 2026-11-24)

## Decision
Order for this version:
1. **Welcome:** medium, optional class code
2. **Placement test:** 8 questions, the first session. It starts easy and climbs (the first-session ladder), about half MCQ, with the coach lines from DR-0055. It is called the placement test.
3. **About you + save progress (one screen):** optional name, goal, stream, exam year, then Google / phone / Later
4. **Home:** the normal Today screen. The first time after onboarding it shows a "Day 1 done" banner (streak 1, strong-in chips, the first skill started) and the widget offer.

Dropped from this version, each a backlog task:
- Routine (study time, WhatsApp reminder)
- Units covered. Until it returns, the engine has no covered-units input, so new skills follow the current unit and exam weight.
- Paywall ("Keep going"), and with it the combined parent consent and payment message

Still to settle: how parent consent is collected for under-18s while the paywall and its parent message are out ([DR-0026](0026-onboarding-flow.md) 7-day grace, legal check L5).

## Revisit triggers
- The next app version, when the backlog screens return
- Students drop at About you + save
- Review date: 2027-02-01

## Consequences
+ The first win (the placement test) comes after one screen
+ Less to build for this version
− No covered-units input, so a student can be shown sections the class hasn't taught; Skip is the only way out
− Parent consent needs a path outside onboarding for now
