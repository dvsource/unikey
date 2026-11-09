# DR-0014: Payments: manual + activation codes for the pilot; PayHere + Play Billing later

- **Status:** Accepted for the pilot stage (Viraj, 2026-11-07: manual + activation codes). The later stages (PayHere, Play Billing) are still Proposed.
- **Date:** 2026-11-02 · **Owner:** Viraj
- **Area:** Tech / Pricing

## Context
Many students have no card; parents pay. App store billing costs 15% but is one-tap. Gateways (PayHere) are ~3.3–3.4% + a fixed LKR 30–50 per transaction, which is heavy on 900 LKR monthly payments. Google Play may require Play Billing for in-app digital purchases.

## Options considered
1. Build full billing before the pilot: wasted effort
2. **Pilot: bank transfer / eZ Cash / LankaQR → activation code. Later: PayHere on the web for teacher bulk and annual plans; Play Billing via RevenueCat for individual in-app purchases** ✅
3. Carrier billing: widest reach, large cut; reconsider later

## Decision
Option 2. The app is login-only for code-based purchases. Push annual/exam-year plans to dilute fixed fees.

## Revisit triggers
- Manual activation takes >2 h/week during the pilot → automate PayHere earlier
- Play policy check (legal L3) changes what's allowed
- Review date: before public launch (~2027-04)

## Consequences
+ Zero billing code for the pilot
− Manual overhead; two payment paths to maintain later
