# DR-0008: Run the pilot in the close circle; open the WhatsApp channel after it

- **Status:** Accepted
- **Date:** 2026-11-02 · **Owner:** Viraj · **Consulted:** wife
- **Area:** GTM
- **Supersedes:** DR-0007 (pilot phase only)

## Context
The 500-teacher channel is a one-shot first impression. Spending it on a buggy v1 risks the wife's reputation and the channel's goodwill.

## Options considered
1. Pilot via the 500-teacher channel (DR-0007): more data, more risk
2. **Pilot with 3–4 close teacher friends + the wife's students (~100 students, 2–3 months)** ✅: forgiving users, fast iteration, reputation protected
3. Pilot with the wife's students only: too much selection bias

## Decision
Option 2. Counter friendly bias: include at least one teacher or class she doesn't teach and isn't close to, judge on behaviour rather than opinions, and charge 300 LKR to everyone. At pilot weeks 4–6, post an opt-in survey in the WhatsApp channel (with admin permission) to build a waitlist ([E02](../experiments/E02-teacher-channel-survey.md)). After exit criteria are met ([DR-0009](0009-pilot-exit-criteria.md)), onboard in waves ([DR-0010](0010-rollout-waves.md)).

## Assumptions
- ~100 students × ~30 items/day × 60 days ≈ 150–180k attempts, enough to calibrate a few hundred items

## Revisit triggers
- Fewer than 60 students recruited from the close circle by pilot start → widen to selected opt-in teachers
- Review date: 2027-01-15

## Consequences
+ Bugs fixed with friends, not in public; the channel stays fresh for a solid product
− Friendly bias; a smaller, less varied sample (fewer mediums and regions)
