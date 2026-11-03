# DR-0003: Pilot price = 300 LKR for 8 weeks ("Founding 100")

- **Status:** Accepted
- **Date:** 2026-11-01 · **Owner:** Viraj
- **Area:** Pricing / GTM

## Context
Free pilots don't reveal willingness to pay. Parents are the payers. We want real payment data and committed users, but enough signups to produce usable data.

## Options considered
1. Free pilot: max signups, zero willingness-to-pay signal
2. **300 LKR + money-back guarantee** ✅: low friction, real signal
3. Full 900/month: strong signal, too few signups for data

## Decision
Option 2, framed as **"Founding 100"**: 300 LKR for 8 weeks (anchored as "normally 1,800"); founding members lock in 600/month for life, including future subjects; refund if the mock MCQ score doesn't improve; a "founding students" wall; early access. Friends and the wife's students pay too. Payment by bank transfer / eZ Cash / LankaQR → activation code ([DR-0014](0014-payments.md)).

## Assumptions
- [A3](../experiments/assumptions.md): ≥60% of approached parents pay 300
- [A4](../experiments/assumptions.md): refund requests <15%

## Revisit triggers
- Conversion <30% after 2 weeks of recruiting
- Refund rate >25%
- Review date: 2027-01-15

## Consequences
+ Real payment data, committed users, clean outcome data (from the guarantee)
− Manual payment/activation overhead; a lifetime 600 price lowers future ARPU for founders
