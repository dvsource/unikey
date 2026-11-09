# DR-0034: Teacher offer: free dashboard and insights, an affiliate share, teacher tools later

- **Status:** Accepted (Viraj: "Dashboard + class insights free + Affiliate share + teacher tool prototypes (decide later)")
- **Date:** 2026-11-07 · **Owner:** Viraj
- **Amended:** 2026-11-07, same day: share amount chosen
- **Area:** GTM / Pricing
- **Supersedes:** [DR-0011](0011-teachers-never-sell.md)

## Context
DR-0011 proposed that teachers never sell, with affiliate income offered only 1:1 for private-tuition students. It also gave class-code students a free basic tier, which no longer holds ([DR-0029](0029-no-free-plan.md), [DR-0030](0030-paywall-after-first-session.md)). Viraj chose a clearer earning model for pilot teachers.

## Options considered
1. Free tool, no money (DR-0011)
2. **Free dashboard and class insights + an affiliate share + teacher tool prototypes** ✅
3. Paid reviewers only

## Decision
- **Free for teachers:** dashboard and class insights (active students, class readiness, bottleneck skill, quiet students, Sunday digest).
- **Affiliate share:** the teacher earns a share of what students who join with their code pay. They can also share the discount code (DR-0030).
- **Teacher tools** (paper builder, term-test papers, materials): prototype them; what's free vs paid is decided later.
- **Share:** fixed **100 LKR per paying student per month** of paid coverage (an until-exam plan counts each month it covers).
- **Still open:** how and when it's paid out, written terms, and the government-teacher question.

**Risk carried over from DR-0011:** MoE circulars may restrict government teachers earning from products sold to their own school students ([L2](../living/legal-and-privacy.md)). Until L2 is answered, offer the affiliate share for private-tuition students only, and let any teacher decline it and use the tool free.

## Assumptions
- [A10](../experiments/assumptions.md) changes: teachers adopt more readily with an affiliate share
- [A17](../experiments/assumptions.md): CAC ≈ 0 now means "only the affiliate share"; track it as a cost per paid student

## Revisit triggers
- L2 legal answer says government teachers can't take it
- Parents see teachers as sales agents (complaints, lower trust in reports)
- The affiliate cost per paid student makes unit economics negative
- Review date: 2027-04-15

## Consequences
+ Aligned incentive for teachers to recommend the app; easier pitch
− Teachers can look like sales agents to parents; written terms and payout admin are needed
− Revenue per student drops by the share
