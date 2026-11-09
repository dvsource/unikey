# E01: Founding 100 pilot

- **Status:** Planned
- **Owner:** Viraj (product, data) · wife (teachers, content) · **Start:** mid-January 2027 (decided 2026-11-07) · **End:** +8 weeks (max 2–3 months)
- **Tests assumptions:** A3, A4, A5, A6, A7, A8, A9, A15, A19, A20–A27, A29
- **Decisions:** [DR-0003](../decisions/0003-pilot-price-300.md), [DR-0008](../decisions/0008-pilot-close-circle.md), [DR-0009](../decisions/0009-pilot-exit-criteria.md)

## Hypothesis
If students do short daily skill-based practice (5-minute minimum, 15–20 min cap), with visible progress, opt-in social features, teacher assignments where the class is enrolled, and student-controlled parent sharing, then D30 retention will be ≥30% and mock MCQ scores will clearly improve within 8 weeks, because accountability creates the daily habit and the skill graph targets weak concepts.

## Setup
- **Cohort:** ~100 students. The wife's classes plus 3–4 close teacher friends' classes, and **at least one teacher or class she doesn't teach and isn't close to** (to counter selection bias). Track the Bio vs Physical Science streams separately.
- **Offer:** 300 LKR / 8 weeks, lock in 600/month for life, money-back if the mock score doesn't improve (proposed: only with ≥20 practice days, [DR-0021](../decisions/0021-usage-tied-guarantee.md)). Everyone pays, friends included.
- **Recruiting:** 5 minutes at the end of class + a printed QR flyer; the parent WhatsApp message ([template](../living/go-to-market.md#parent-message-founding-100-translate-to-sinhala--tamil)); a 20-min parent orientation showing the report.
- **Payment:** bank transfer / eZ Cash / LankaQR → activation code.
- **Distribution:** Play Store closed testing (check the current tester requirement).
- **Content scope:** 3 units (Mechanics, Current Electricity, Thermal Physics), Sinhala medium only ([DR-0031](../decisions/0031-pilot-scope-3-units-sinhala.md)).
- **Measurement:** mock MCQ paper at week 0 and week 8. A non-user comparison group if a teacher can provide one.
- **Mid-pilot (weeks 4–6):** run [E02](E02-teacher-channel-survey.md).

## Pre-pilot checklist
- [x] DR-0009 exit criteria set to **Accepted** (2026-11-07, D30 ≥ 30%)
- [ ] Pilot start date announced to teachers; 300 LKR collected ([commitment device](../living/founder-playbook.md#commitment-device))
- [ ] Parental consent flow (one-time WhatsApp confirmation for under-18s)
- [ ] Decide D1–D3 open design questions ([UX design](../living/ux-design.md#open-design-questions))
- [ ] Teacher checks Sinhala physics terms against the NIE glossary
- [ ] Week-0 mock paper ready
- [ ] Parent survey questions added: "Which subject is your child most worried about?" / "Would you pay 900/month for help in that subject alone?"

## Metrics & thresholds
| Metric | Success (proceed) | Kill / pivot |
|---|---|---|
| D30 retention | ≥ 30% | < 20% → rethink the core loop |
| Study days / week | ≥ 4 | |
| Mock MCQ score delta | Clear positive gain vs baseline/control | No gain → rethink content/scheduling |
| Refund requests | < 15% | > 25% |
| Teachers using the dashboard | ≥ 3 of 4 | |
| Parent recruitment conversion | ≥ 60% | < 30% after 2 weeks |
| Full-price conversion after the pilot | Track (feeds A9) | |

Also track weekly: D1/D3/D7 retention, % finishing the daily queue, % continuing past the 5-minute minimum, streak-break rate, report link open rate, error-tag distribution, Learn-mode usage, widget adoption, WhatsApp opt-in rate.

Parent and graph metrics ([DR-0018](../decisions/0018-student-is-primary-customer.md), [DR-0022](../decisions/0022-typed-skill-graph.md)): % of students adding a parent and at which sharing level; conversion and retention, parent-linked vs student-only; daily due load per student; readiness vs week-8 mock correlation; accuracy on exam-strength items vs L1–L4 (A29). Also run an "aha moment" analysis: which first-week behaviours predict D30.

## Result
_(Fill in after the pilot. Link the data.)_

## Decisions triggered
_(e.g. DR-00xx: proceed to wave 1 / extend the pilot)_
