# DR-0029: No free plan (for now)

- **Status:** Accepted (Viraj: "no free plan. when something is free, it's less interested. this might change")
- **Date:** 2026-11-07 · **Owner:** Viraj
- **Area:** Pricing

## Context
The plan had a free tier (limited daily practice, e.g. 10 questions a day), with premium on top, and a free-limit screen in the design (B4). Open topic B3 asked where the free/paid line is. Viraj's view: what's free gets less commitment. This matches the pilot rule that everyone pays, friends included ([DR-0003](0003-pilot-price-300.md)).

## Options considered
1. Freemium with a daily limit. Bigger funnel (needs 20–50k free users for 1,000 payers, [A2](../experiments/assumptions.md)), but low commitment and a weaker signal.
2. Free trial week of everything, then pay.
3. **No free plan: every student pays** ✅

## Decision
- No ongoing free plan. Students pay to use the app.
- **Still open:** how much a student sees before paying (e.g. onboarding plus the first session, or a short trial), and whether students in a teacher's class get anything free.
- **Teachers stay free** ([DR-0011](0011-teachers-never-sell.md)).
- The free-limit screen (B4) is removed from the design. Its "Ask a parent" path moves to the paywall.

## Assumptions
- [A31](../experiments/assumptions.md): paid-only gives higher commitment and retention than freemium, and enough students still start

## Revisit triggers
- Sign-ups after the pilot are too low to reach the target (track the pricing page → paid rate)
- Teachers refuse to recommend an app their students must pay for before trying
- A competitor's free tier pulls students away
- Review date: 2027-04-01 (after the pilot)

## Consequences
+ Committed users, an honest signal, simpler product (no limits to build or tune)
+ Revenue math no longer depends on a 2–5% free→paid conversion
− Smaller top of funnel, so word of mouth from paying users matters more
− Teacher recommendation is harder when students must pay first
