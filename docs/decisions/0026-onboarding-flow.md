# DR-0026: Onboarding flow: first win before sign-in, optional name, pre-filled units, 7-day consent grace

- **Status:** Superseded in part by [DR-0055](0055-onboarding-revised-for-anki-loop.md) (was Accepted, Viraj: "Keep them")
- **Date:** 2026-11-07 · **Owner:** Viraj
- **Area:** Product / Design

## Context
The onboarding flow (A1–A9) had six open questions. Guiding rules: first win within 5 minutes and before any friction; ask only what changes the experience; no push notifications ([DR-0020](0020-no-push-notifications.md)); a class code is optional.

## Decision
| # | Question | Decision |
|---|---|---|
| 1 | Sign-in before the quick check, or after the first session? | **After the first session (A7).** A hidden anonymous account is created on the device at A1 and upgraded to Google or phone OTP at A7, so nothing is lost. A7 has a "Later" option. |
| 2 | Name or nickname: A2 or at sign-in? | **A2, one optional field** ("What should we call you?"). If skipped, Google sign-in fills it later. |
| 3 | Pick units already covered before the quick check? | **Yes, pre-filled (A4a).** Guess covered units from exam year and current month; the student taps to fix. The quick check only asks about covered units. |
| 4 | Grace period while parent consent is pending? | **7 days.** Until a parent replies YES: no class link, no WhatsApp messages to the student, and only the minimum data is kept. **Needs a legal check before the pilot** ([L5](../living/legal-and-privacy.md)). |
| 5 | Friend invite on day 1 or day 2? | **Neither.** Show it after the first week summary or a 3-day streak, as a share link (no Friends tab in the pilot). |
| 6 | Widget offer | **At A9 (day-1 home)**, right after the first win, not at A3. |

Still open: pilot payments (manual vs payment link) and the free plan (10 a day vs a trial week). The A4/A6 merge idea was not adopted; they stay separate screens.

Screens: Onboarding page of the [direction canvas](https://claude.ai/artifact/Mx5aKCgCPibgzR24HZ7Woi), in "Dawn" ([DR-0025](0025-dawn-design-system.md)).

## Revisit triggers
- Pilot data shows many students drop at A7 or lose progress before signing in
- Legal review says the 7-day grace isn't allowed under PDPA
- Quick-check accuracy is poor because the pre-filled units are often wrong
- Review date: 2027-02-01

## Consequences
+ First win comes before any account, consent or payment
+ Shorter quick check, fewer "haven't learned this yet" taps
− Anonymous accounts need a clean merge path at sign-in
− A short window where an under-18 uses the app before consent
