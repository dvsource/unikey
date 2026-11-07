# DR-0021: Tie the money-back guarantee to usage

- **Status:** Proposed (if accepted, it supersedes the guarantee clause of DR-0003)
- **Date:** 2026-11-03 · **Owner:** Viraj
- **Area:** Pricing

## Context
DR-0003's guarantee ("refund if the mock score doesn't improve") invites the "used it twice, it didn't work, refund" story, which misreports the product as a failure.

## Options considered
1. Unconditional score-based guarantee (DR-0003 as written)
2. **"Practise at least 20 days in 8 weeks. If your mock score doesn't improve, full refund."** ✅ Fair, and it pushes students to use the app.
3. No guarantee. This adds risk for cautious parents.

## Decision
Option 2. Also consider a **7-day free trial** before the first payment (post-pilot), so students who don't engage never pay and never feel cheated. That's an open question in [pricing](../living/pricing.md#open-pricing-questions).

## Assumptions
- [A4](../experiments/assumptions.md): refund requests < 15%

## Revisit triggers
- Parents perceive the condition as a catch (feedback during recruiting)
- Review date: 2027-01-15

## Consequences
+ Cleaner outcome data; more usage
− Usage has to be tracked and explained clearly
