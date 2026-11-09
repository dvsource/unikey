# Pricing

_Last updated: 2026-11-07_

## Plans (planned; validate before public launch)

| Plan | Price | Notes |
|---|---|---|
| 1 subject | 900 LKR/month | Premium: full question bank, exam sets, parent reports |
| Referral / bulk | 800 LKR/month | Referral code or bulk purchase |
| 2 subjects | 1,500 LKR/month | Once Chemistry exists |
| Stream bundle (3 subjects) | 2,000 LKR/month | Once a stream is covered |
| Until-exam plan | max(1,500, months left × 900 × 0.75) LKR ([DR-0032](../decisions/0032-until-exam-price-by-months-left.md)) | **Push this.** It locks in revenue before the post-exam churn cliff and dilutes gateway fixed fees. |

- **No free plan for students** ([DR-0029](../decisions/0029-no-free-plan.md)). Onboarding and the first session are free, then the paywall; class-code students pay the same, with a teacher discount code ([DR-0030](../decisions/0030-paywall-after-first-session.md)).
- **Teachers:** dashboard and class insights free, plus a fixed 100 LKR/month affiliate share per paying student who joins with their code; teacher tools decided later ([DR-0034](../decisions/0034-teacher-offer-free-tool-plus-affiliate.md)).
- Subjects are add-ons inside one app, never separate apps ([DR-0028](../decisions/0028-any-physics-student-adaptive.md)).
- Loyalty rewards are tied to measurable progress or referrals, not tenure (tenure ends at the exam anyway).

## Pilot offer: "Founding 100" ([DR-0003](../decisions/0003-pilot-price-300.md))
- **300 LKR for an 8-week pilot** (anchored as "normally 1,800").
- Founding members **lock in 600/month for life** (vs 900), including future subjects.
- **Money-back guarantee**: if their mock MCQ score doesn't improve, they get the 300 back. Accepted ([DR-0021](../decisions/0021-usage-tied-guarantee.md)): only if they practised **at least 20 days in 8 weeks**.
- Name on a "founding students" wall, plus early access to new features.
- "Only 100 places" (true, so it's honest scarcity).
- Friends and the wife's own students pay too. Payment is the most honest signal.

## Payment collection ([DR-0014](../decisions/0014-payments.md))

| Stage | Method | Cost |
|---|---|---|
| Pilot | Manual bank transfer / eZ Cash / LankaQR → activation code | ~0 |
| Teacher bulk / web | PayHere link → activation code | ~3.3–3.4% + LKR 30–50 per transaction (confirm current rates) |
| In-app individual | Google Play Billing via RevenueCat | 15% on subscriptions |

The trap: a ~50 LKR fixed fee on a 900 LKR monthly payment adds ~5.5%. Annual / exam-year plans dilute it.

## Revenue math

| Item (at 1,000 paying) | LKR / month |
|---|---|
| Gross (1,000 × ~850 avg) | ~850k |
| Store fee (15%) or gateway (~3%) | −25k to −130k |
| Infra + AI (content is pre-generated) | −30k to −60k |
| Content review + support labour | −50k to −100k |
| Marketing / CAC | 0 to −200k |
| **Net** | **~4–6.5 lakh, only if CAC ≈ 0** |

What the target hides:
- **No freemium funnel** ([DR-0029](../decisions/0029-no-free-plan.md)): 1,000 payers must come from paid sign-ups directly (teachers, word of mouth), not from converting 20–50k free users.
- **Seasonal churn**: a typical subscriber's lifetime is 6–18 months.

## Open pricing questions
- Monthly vs exam-year as the default plan? (Ask the advisor friend; test it after the pilot.)
- Will parents pay 900/month for one subject? Ask in the pilot parent survey ([A9](../experiments/assumptions.md)).
- A 7-day free trial before the first payment (post-pilot)? Students who don't engage never pay, so they never feel cheated ([DR-0021](../decisions/0021-usage-tied-guarantee.md)).
- Set expectations at purchase: "Results show after 3–4 weeks of 5+ days a week."
