# DR-0037: Teacher dashboard principles

- **Status:** Accepted (Viraj, 2026-11-07)
- **Date:** 2026-11-07 · **Owner:** Viraj
- **Area:** Product / Design
- **Source:** [teacher dashboard plan](../living/teacher-dashboard.md) (brainstorm session)

## Context
Teachers are the channel ([DR-0002](0002-teachers-as-channel.md)) and get the dashboard free ([DR-0034](0034-teacher-offer-free-tool-plus-affiliate.md)). Tuition teachers are busy, on phones, and live in WhatsApp.

## Options considered
1. A desktop analytics dashboard with charts and heatmaps
2. **An action-first, mobile-first web dashboard opened from WhatsApp** ✅
3. A teacher mobile app

## Decision
- **Actions, not charts:** each card is one sentence, one number or name, and one button.
- **WhatsApp is the front door:** the Sunday digest links into the dashboard.
- **No new app:** mobile-first web, phone-number sign-in.
- **Five minutes or less per visit.**
- **Supportive, not surveillance:** "quiet" or "needs a hand", no ranking, no teacher-side leaderboard.
- **Honest numbers:** practice readiness, never a predicted mark. Class patterns need at least 5 active students. A root-cause chain (prerequisite → skill → students) appears only with prerequisite-check data from at least 3 students, because some prerequisite edges are known to be too strict.
- **Feedback on every insight card:** "Useful / Not right?".
- **Dawn design** with more restraint. English UI with Sinhala skill and topic names (extends [DR-0024](0024-sinhala-medium-ui-language.md) to teachers).

## Revisit triggers
- Teachers ask for charts or exports they'd actually use
- Fewer than 3 of 4 pilot teachers open it weekly
- Review date: 2027-04-01

## Consequences
+ Fits how teachers actually work; quick to build
− Teachers who want deep analytics get less
