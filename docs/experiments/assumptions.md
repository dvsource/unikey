# Assumptions

Things we believe but haven't proven. Update statuses at the monthly review.

Status: `Untested` → `Testing` → `Validated` | `Invalidated` (add the date and a data link)

## Market & revenue
| ID | Assumption | Test | Status | Used by |
|---|---|---|---|---|
| A1 | 1,000 paying students (~1–2% of one physics cohort of 60–90k) is reachable in 18–30 months via teachers | Track paid growth after the rollout | Untested | [strategy](../living/strategy.md) |
| A2 | Free→paid conversion is 2–5%, so 1,000 payers need 20–50k active free users | Post-launch funnel data | Dropped: no free plan (DR-0029) | [pricing](../living/pricing.md) |
| A9 | Parents will pay 900/month for a single subject (Physics) | Pilot parent survey: "Would you pay 900/month for help in that subject alone?" + post-pilot full-price conversion | Untested | DR-0001, DR-0028 |
| A16 | Infra stays ~3–5% of revenue at 1,000 payers | Monthly cost tracking | Untested | [tech](../living/tech-architecture.md) |
| A17 | CAC ≈ 0 through the teacher channel | Cost per paid student by source | Untested | DR-0002 |

## Pilot / pricing
| ID | Assumption | Test | Status | Used by |
|---|---|---|---|---|
| A3 | ≥60% of approached parents will pay 300 LKR for the pilot | E01 recruitment conversion | Untested | DR-0003 |
| A4 | Refund requests stay <15% | E01 | Untested | DR-0003, DR-0009 |

## Outcomes & retention
| ID | Assumption | Test | Status | Used by |
|---|---|---|---|---|
| A5 | Daily practice + parent reports → clear mock MCQ score gain (target +10%) in 8 weeks | E01 mock at week 0 vs week 8, vs a non-user group | Untested | DR-0009 |
| A6 | Accountability (teacher assignments, parent visibility) and visible progress drive the daily habit more than gamification/novelty | E01 retention by teacher engagement level; exit interviews | Untested | DR-0006 |
| A7 | Parents value and act on weekly WhatsApp reports (open the link, respond) | E01 link open rate, parent replies | Untested | DR-0015 |
| A20 | Students who link a parent retain and convert better than student-only users | E01: retention and conversion, parent-linked vs not | Untested | DR-0018 |
| A21 | Effort-only default sharing reduces students refusing to add a parent | E01: % adding a parent, and at which sharing level | Untested | DR-0018 |
| A22 | A 5-minute minimum day (vs a 15–20 minute ask) lifts D7 retention | E01: D3/D7 retention; % continuing past the minimum ("keep going?") | Untested | DR-0019 |
| A25 | An early behaviour (e.g. 3 sessions in 5 days, or adding a friend) predicts staying, and onboarding can push students toward it | E01: correlate first-week behaviours with D30 | Untested | DR-0019 |
| A26 | Without push notifications, the widget + opt-in WhatsApp + friends provide enough triggers | E01: widget adoption, WhatsApp opt-in rate, exit interviews ("forgot" vs "bored") | Untested | DR-0020 |

## Segments
| ID | Assumption | Test | Status | Used by |
|---|---|---|---|---|
| A8 | Bio-stream students/parents convert and retain better than Physical Science | E01: track the streams separately; survey "which subject is your child most worried about?" | Untested | DR-0028 (messaging) |

## Teachers
| ID | Assumption | Test | Status | Used by |
|---|---|---|---|---|
| A10 | Teachers adopt a free tool without needing revenue share | E02 opt-in rate; wave 1 activity | Untested | DR-0002, DR-0011 |
| A11 | Building term-test/model papers is the most painful teacher task | E02 open question: "most time-consuming part before term tests?" | Untested | DR-0011 |
| A12 | ~10–20% of the 500-teacher channel will opt in | E02 | Untested | DR-0007 |

## Product & content
| ID | Assumption | Test | Status | Used by |
|---|---|---|---|---|
| A13 | Reviewing templates instead of individual questions cuts review effort ~10× | Track reviewer hours per published item during content build | Untested | DR-0004 |
| A14 | LLMs are weak at Sinhala/Tamil technical terms; a glossary-enforced translate-from-English pipeline fixes it | Reviewer error rate per 100 items: free generation vs pipeline | Untested | [product spec](../living/product-spec.md#content-pipeline) |
| A15 | Choosing the wrong method is a main cause of failed problems (L3 matters) | E01 error-tag distribution ("wrong principle" share) | Untested | DR-0004 |
| A18 | Students can't reliably self-grade problem-solving | (Design assumption; spot-check with a small self-grade vs auto-grade comparison) | Untested | DR-0004 |
| A19 | Theory-first students are a meaningful share (Learn mode is worth it) | E01: share choosing "Learn first"; Learn-mode opens | Untested | DR-0005 |
| A23 | Implicit review (FIRe-style) keeps the daily load within the cap as mastered skills grow | E01: daily due load per student over 8 weeks | Untested | DR-0022 |
| A24 | The readiness score tracks real mock results (enough to later show predicted marks) | E01: readiness vs week-8 mock correlation | Untested | DR-0022 |
| A27 | Sinhala-medium students are comfortable with an English interface around Sinhala content | E01: usability feedback, confusion reports | Untested | DR-0024 |
| A28 | The "Dawn" UI keeps the yellow main action findable, colour meanings are understood, and the sky gradient looks clean on cheap LCD phones | Usability test + low-end device test before the pilot | Untested | DR-0025 |
| A29 | Decomposed L1–L4 practice transfers to exam-level MCQs, provided exam-strength items (F45) are in the L5 sets | E01: accuracy on exam-strength items vs L1–L4, tracked separately; week-8 mock | Untested | DR-0027 |
| A30 | One adaptive path keeps both weak and strong students engaged (no separate Bio path needed) | E01: retention and mastery gain by starting placement band and stream | Untested | DR-0028 |
| A31 | Paid-only (no free plan) gives higher commitment and retention, and enough students still start | E01 + post-pilot: sign-up → paid rate, D30 vs benchmarks | Untested | DR-0029 |
