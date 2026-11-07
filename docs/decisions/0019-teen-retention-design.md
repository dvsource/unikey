# DR-0019: Teen retention design: 5-minute day, no-guilt comebacks, social and progress hooks

- **Status:** Accepted (Viraj: "most of these ideas are good," except the items in DR-0020)
- **Date:** 2026-11-03 · **Owner:** Viraj
- **Area:** Product

## Context
Main fear: a student installs the app, a parent pays for a month, and the student tries it for 2–3 days, quits, and says "it doesn't work." Reasons students drop on days 2–3: no felt progress, too big an ask, too hard too soon, no trigger, disconnected from class, nobody notices, and guilt after a missed day.

## Options considered
1. Rely on gamification and novelty. Novelty fades in about 2 weeks.
2. **Structural levers, each aimed at a specific drop-off cause, with fun as a sugar layer** ✅

## Decision
Build in this priority order for the pilot:
1. **5-minute minimum day** (10 questions keeps the streak alive; "keep going?" after that; show "5 min", not "20 cards due"), a **streak with freeze tokens**, and a **no-guilt catch-up** ("Good to see you," a short refresh of fading skills only, never a backlog count)
2. **Visible progress**: a readiness score that moves every session, mastery moments ("You mastered Ohm's law"), before-vs-after comparisons, and early sessions calibrated to ~80% correct
3. **Relevance**: the queue follows what the class is doing, a term-test mode ("test in 12 days, here's your plan"), past-paper tags, and the student's goal on screen
4. **Social (opt-in)**: friend streaks, class leagues that reset on Monday, duels, and class-vs-class challenges
5. **Autonomy**: the queue is a recommendation, not an order; students choose learn or practise and the topic order
6. **Fun layer last**: variable rewards and speed rounds
- **First 7 days** follow the plan in [product spec](../living/product-spec.md#first-7-days). Find the "aha moment" from pilot data, then redesign onboarding around it.
- **Re-engagement ladder** with no push notifications ([DR-0020](0020-no-push-notifications.md)): in-app, widget, and opt-in WhatsApp only.
- **Ethics for minors**: no dark patterns (fake urgency, shame, endless loops), a healthy daily cap, and "Done for today" endings.
- **Countering "it doesn't work"**: set expectations at purchase ("results after 3–4 weeks of 5+ days a week"), make effort visible in reports, and tie the guarantee to usage ([DR-0021](0021-usage-tied-guarantee.md)).

## Assumptions
- [A22](../experiments/assumptions.md): a 5-minute minimum day lifts D7 retention
- [A25](../experiments/assumptions.md): an early-behaviour "aha moment" exists and predicts staying

## Revisit triggers
- Pilot D7 < 25% → revisit onboarding and the first-week plan
- Review date: 2027-04-01

## Consequences
+ Effort goes into the causes of drop-off, not polish
− Social features need friends on the app to work; early sessions need difficulty calibration
