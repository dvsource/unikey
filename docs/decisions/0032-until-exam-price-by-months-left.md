# DR-0032: Until-exam price depends on the student's exam year and months left

- **Status:** Accepted (Viraj: "depends on the user's exam year. and remaining months")
- **Date:** 2026-11-07 · **Owner:** Viraj
- **Amended:** 2026-11-07, same day: formula chosen
- **Area:** Pricing

## Context
The until-exam plan was a flat ~6,000–7,000 LKR one-off, and the canvas still shows an `[EXAM PRICE]` placeholder. A flat price is unfair to a student who joins 3 months before the exam and a bargain for one who joins 20 months before.

## Options considered
1. Flat 5,000 / 6,000 / 7,000 LKR
2. **Priced from the months left until the student's exam (from the exam year chosen at onboarding)** ✅

## Decision
- Until-exam price = f(months left until the student's A/L exam). The exam year comes from onboarding (A2).
- It must stay clearly cheaper than paying 900/month for the same months, so the plan is worth choosing.
- **Formula:** price = max(1,500, months left × 900 × 0.75), i.e. 25% off monthly, never below 1,500 LKR. Examples: 10 months = 6,750; 3 months = 2,025; 1 month = 1,500.
- Round to a clean number on screen (rule to set in design).
- **Still open:** what happens if the exam date moves (the 2026 A/L moved to August).

## Revisit triggers
- Few students choose it over monthly
- The exam calendar moves enough to make the price feel wrong
- Review date: 2027-04-01

## Consequences
+ Fair for every join date; locks in revenue before the post-exam churn
− The price shown differs per student, so the paywall and the parent's WhatsApp message must show the number and the end date clearly
