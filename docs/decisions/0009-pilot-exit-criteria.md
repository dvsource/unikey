# DR-0009: Pilot exit criteria for the WhatsApp rollout

- **Status:** Proposed (**must be Accepted before the pilot starts**, then not changed)
- **Date:** 2026-11-02 · **Owner:** Viraj
- **Area:** GTM / Product

## Context
Without pre-written criteria, results get reinterpreted after the fact, and a bad week feels like a verdict. Criteria must be set before the pilot starts so the goalposts can't move.

## Options considered
1. Decide by feel after the pilot: easy to rationalise
2. **Fixed, behaviour-based thresholds written now** ✅

## Decision
Proceed to the WhatsApp channel rollout only if **all** hold at the end of the pilot:

| Metric | Threshold |
|---|---|
| D30 retention | ≥ 40% |
| Study days per week | ≥ 4 |
| Mock MCQ score delta vs baseline (week 0 vs week 8, vs a non-user group if possible) | Clear positive gain |
| Refund requests | < 15% |
| Teachers actively using the dashboard | ≥ 3 of 4 |

If they're missed: **extend and fix; don't scale.** If D30 < 20%: rethink the core loop (write a new DR).

## Assumptions
- [A5](../experiments/assumptions.md), [A4](../experiments/assumptions.md), [A6](../experiments/assumptions.md)

## Revisit triggers
- Only at the end of the pilot (expected 2027-03-31)

## Consequences
+ An honest go/no-go; protects against both quitting early and scaling a broken product
− Might delay rollout into the pre-exam season
