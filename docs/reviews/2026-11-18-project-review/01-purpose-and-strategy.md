# Purpose and strategy

_18 November 2026_

## Verdict

Continue with Sinhala-medium A/L Physics. UniKey has a clear use case in the days between tuition classes. A student opens the app, gets a short set of questions matched to what they have learned, and gets help after a mistake. Scheduling at the skill level is a sensible design for Physics because remembering a particular answer and applying the underlying principle to a fresh problem are different achievements. The student app, question bank and teacher relationships all serve this same use case. [Strategy](../../living/strategy.md) · [Product specification](../../living/product-spec.md)

The initial audience should stay open to both streams. For recruitment, start with students who attend class and want to improve but struggle to decide what to revise. Track the streams separately as planned. A student who has never been taught a section needs a different next action from one who learned it and forgot. The engine's skip reasons and teacher's “teaching now” signal give UniKey a way to handle that distinction. [DR-0028](../../decisions/0028-any-physics-student-adaptive.md) · [DR-0041](../../decisions/0041-teacher-sets-teaching-now.md) · [DR-0049](../../decisions/0049-effort-based-day-and-skip.md)

## What I would change

- **Make the student promise demonstrable in the first session.** Try “Spend five minutes revising the Physics you’ve already learned.” A helpful response to a wrong answer and another chance to use the same idea make the promise tangible. The current “nothing … forgotten” line asks families to trust an outcome the pilot is designed to investigate. Keep progress labels tied to observed practice. [Positioning](../../living/strategy.md#positioning) · [Readiness](../../living/product-spec.md#readiness-score)
- **Test teacher usefulness through an action.** Ask each teacher to set a current topic and return the next week to explain one decision they made from the dashboard. Record the time it took, whether they acted, and whether they would keep using it. The first teachers can introduce the product and help refine it. An independent class is important for learning whether the offer travels without a personal relationship. [Dashboard plan](../../living/teacher-dashboard.md) · [E01](../../experiments/E01-founding-100-pilot.md)
- **Keep student, teacher and payer measures distinct.** Measure a student's repeated practice, a teacher's recurring workflow, and a family's decision to pay separately. The 300 LKR pilot tests willingness to try a discounted offer. Send a concrete continuation offer at the intended price and count paid renewals, with the founding rate and any standard-rate offer reported separately. [Pricing](../../living/pricing.md) · [Assumptions](../../experiments/assumptions.md)
- **Treat content depth as a product advantage.** Invest first in explanations and alternate questions that help students recover from common misconceptions. Track teacher review time per accepted item and per adequately covered skill. That rate will tell you more about the feasibility of adding a fourth unit or language than the count of draft items. [Authoring specification](../../../content/authoring-spec.md) · [Content plan](../../living/content-authoring.md)

## What would change my view

If students find the first session useful but rarely return, investigate when practice fits into their week and what happens on re-entry after a missed day. If they return but struggle on unseen questions, review question coverage, explanations and transfer before changing incentives. If teachers will introduce it but see no reason to return to the dashboard, keep the teacher referral experiment and revisit the dashboard's scope. Each result points to a different product decision. [E01](../../experiments/E01-founding-100-pilot.md) · [Prior expert review](../2026-11-11-expert-review.md)
