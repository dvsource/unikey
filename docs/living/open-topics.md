# Open Topics (pre-development backlog)

_Last updated: 2026-11-07. Source: [business-plan chat](../sources/2026-11-07-business-plan-chat.md), "what topics we should discuss more"._

This is what's still undecided, in priority order. When a topic is settled, link its decision record and mark it done. Don't delete rows.

**Already settled:** business model, pilot audience, teacher channel, retention approach, tech stack ([DR-0013](../decisions/0013-tech-stack.md)), visual design ([DR-0025](../decisions/0025-dawn-design-system.md)), Sinhala language rule ([DR-0024](../decisions/0024-sinhala-medium-ui-language.md)), onboarding ([DR-0026](../decisions/0026-onboarding-flow.md)).

## Business and product

### Must settle before building
| # | Topic | Key questions | Status |
|---|---|---|---|
| B1 | Value proposition and ideal customer | Is the first customer a Bio-stream student weak in physics, or any A/L physics student? What one result do they get ("+X marks", "no more forgetting")? What's the one-sentence Play Store line? | Done: any physics student, adaptive ([DR-0028](../decisions/0028-any-physics-student-adaptive.md)). Promise: "nothing forgotten" ([strategy](strategy.md#positioning)) |
| B2 | MVP scope from the user's side | What jobs must the pilot do: practice and progress only, or notes too? Which canvas screens are in, later or cut? | Open ([MVP cut](product-spec.md#mvp-cut-physics-pilot), [DR-0006](../decisions/0006-mvp-feature-cut.md) proposed) |
| B3 | Free vs paid line | What a student sees before paying? Does a teacher-code student get anything free? | Done: no free plan ([DR-0029](../decisions/0029-no-free-plan.md)); paywall after the first session, class-code students pay ([DR-0030](../decisions/0030-paywall-after-first-session.md)) |
| B4 | Final pricing and plans | Monthly 900, the until-exam price, founding price, bulk and teacher pricing, sibling discount, refund rule | Partly done: until-exam price from months left ([DR-0032](../decisions/0032-until-exam-price-by-months-left.md)), guarantee needs ≥ 20 practice days ([DR-0021](../decisions/0021-usage-tied-guarantee.md)). Formula: 25% off, 1,500 floor. Sibling discount: decide after the pilot |
| B5 | Pilot plan, business side | Which 3–4 teachers and classes? Start date? What counts as success? What happens if it fails? | Partly done: start mid-January 2027, exit criteria accepted ([DR-0009](../decisions/0009-pilot-exit-criteria.md)), manual payment ([DR-0014](../decisions/0014-payments.md)). Teachers and classes still to pick |
| B6 | Teacher offer and agreement | What a teacher gets free, the earning model (affiliate, reviewer, or none), simple written terms, government-teacher rules | Partly done: free dashboard + insights, affiliate share, tools later ([DR-0034](../decisions/0034-teacher-offer-free-tool-plus-affiliate.md)). Share: 100 LKR/month per paying student. Payout, terms, L2 still open |

### Settle during the pilot
| # | Topic | Key questions | Status |
|---|---|---|---|
| B7 | Brand and name | Is "UniKey" right? Trademark and domain check, tone of voice, logo | Open |
| B8 | Business setup | Sole proprietorship now, Pvt Ltd later ([DR-0033](../decisions/0033-sole-proprietorship-first.md)). Still to do: Bank account, PayHere merchant account (needs a registered business), terms and privacy policy for minors, tax | Registration type decided; rest open ([legal](legal-and-privacy.md)) |
| B9 | Content ownership and quality promise | Who owns content the wife creates or reviews (company or personal)? Reviewer pay? A public promise such as "every question reviewed by a teacher"? | Open |
| B10 | Parent proposition | What a parent sees, how often, in which language, and what makes them pay | Partly done ([DR-0018](../decisions/0018-student-is-primary-customer.md), D3 in [UX design](ux-design.md#open-design-questions)) |
| B11 | Launch and marketing plan | Social content plan, WhatsApp channel waves, launch timing against the exam calendar, the first 3 months of posts | Open ([GTM](go-to-market.md)) |
| B12 | Support and operations | Who answers parents and students on WhatsApp? Refund handling, payment problems, content error reports | Open |

### After pilot data
| # | Topic | Key questions |
|---|---|---|
| B13 | Roadmap order | Chemistry next? When Tamil? When the teacher dashboard and paper builder? |
| B14 | Unit economics | Acquisition cost per channel, months a student stays, revenue per student over that time |
| B15 | Team and roles | When to hire reviewers, a part-time marketer, support. The advisor friend's role and terms ([DR-0017](../decisions/0017-friend-as-advisor.md)) |
| B16 | Goals and money | 6- and 12-month targets, how much to invest, when to stop or double down ([DR-0016](../decisions/0016-stop-only-by-decision.md)) |
| B17 | Competitive response | What we do if AP.LK, BrainUs or a telco copies us ([strategy](strategy.md#moats-build-deliberately-in-priority-order)) |

**Suggested order:** B1 + B2 in one session (positioning, then cut the MVP to match it), then B3 + B4, then B5 + B6. After that, approach the 3–4 teachers.

## Technical

### Must settle before coding
| # | Topic | What to decide | Status |
|---|---|---|---|
| T1 | Physics skill graph and content scope | Pilot units; skill list per unit; edges; past-paper tagging; items per unit | Units chosen: Mechanics, Current Electricity, Thermal Physics ([DR-0031](../decisions/0031-pilot-scope-3-units-sinhala.md)). Mechanics graph built (~80 skills); the other two still to build |
| T2 | Content pipeline and review workflow | Prompting, SymPy checks, review UI, content statuses, the wife's weekly hours | Spec at v0.5 ([content authoring](content-authoring.md)); final fix pass ([DR-0027](../decisions/0027-content-plan-stop-point.md)). Her weekly hours still unknown |
| T3 | Scheduler and mastery spec | FSRS settings, Elo mastery updates, credit to underlying skills, readiness formula, daily mix, missed days | Mostly done ([product spec](product-spec.md#scheduling-two-engines), grading rules) |
| T4 | MVP scope freeze | Exact screens and features for the pilot (keep, defer or cut each canvas screen) | Open (same as B2) |
| T5 | Pilot design | Exit criteria, mocks, control group, analytics event list, consent flow, timeline vs the school calendar | Partly done ([E01](../experiments/E01-founding-100-pilot.md)). Event list missing |
| T6 | Data model and offline sync | Step-level event schema, permanent skill IDs, versioned content packs, who can see which data | Item format stable; rest open ([tech](tech-architecture.md)) |

### Decide in parallel
| # | Topic | Notes |
|---|---|---|
| T7 | Legal and business setup | Same as B8, plus data-protection duties for under-18s |
| T8 | Final pricing and packaging | Same as B3 + B4 |
| T9 | Roles and time budget | **Wife: under 5 h/week until January (2026-11-07)**, so 1–2 paid teacher reviewers take Electricity and Thermal ([DR-0035](../decisions/0035-paid-teacher-reviewers-pilot.md)). Viraj's hours alongside job hunting; paid Tamil and English reviewers; who handles teachers and support |
| T10 | Student device and usage reality | Quick survey in pilot classes: phone models, data plans, app habits, study times. Checks the offline-first and low-end Android assumptions |
| T11 | Teacher dashboard and paper builder (dashboard planned: [teacher dashboard](teacher-dashboard.md); paper builder still open) | Not needed on pilot day 1, but it's the hook in the teacher pitch. Design it before the WhatsApp rollout |
| T12 | Medium order | Done for the pilot: Sinhala only ([DR-0031](../decisions/0031-pilot-scope-3-units-sinhala.md)). When Tamil comes, and who reviews it, still open |
