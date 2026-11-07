# DR-0018: The student is the primary customer; parent involvement is optional and student-controlled

- **Status:** Proposed
- **Date:** 2026-11-03 · **Owner:** Viraj
- **Area:** Product / GTM
- **Refines:** DR-0003 and DR-0015 (parent pitch). Those records stay in force.

## Context
Earlier plans treated parents as the main payer and pitched "a weekly WhatsApp report." In practice:
- Students often won't give parent contacts.
- Many A/L parents care less than they did at Grades 1–11.
- Many parents can't follow the A/L syllabus.
- Teens resist surveillance.

## Options considered
1. Parent-first: collect parent numbers up front and send weekly reports to all. Students refuse, and the reports go to parents who don't engage.
2. **Student-first, with parents optional. The student controls what is shared and invites the parent when it benefits the student.** ✅
3. Ignore parents entirely. This loses the wallet and the accountability that engaged parents provide.

## Decision
- The app works fully without a parent. The only parent touch that's always required is a **one-time WhatsApp consent for under-18s** (PDPA).
- **Sharing levels, chosen by the student:** effort only (study days, streak; the default) → effort + progress (readiness trend) → full detail. Raw scores are never shared by default.
- Pitch sharing as a benefit to the student: "Show your parents you're actually studying, so they stop nagging." Add parent-sponsored rewards, e.g. a 30-day streak prompts the parent to give a reward.
- **Ethical routes to parent contact:** an in-app **"Ask parent to pay"** button (a ready-made WhatsApp message with a payment link and the student's progress), the consent step, teacher-shared opt-in links, pilot class meetings, and the student tapping "Add parent." Never scrape, buy or copy numbers.
- **Parent report for non-expert parents:** one headline number, a traffic light instead of scores, plain language in their medium, an optional voice note, the teacher's name for authority, and one action. Send weekly to engaged parents and monthly to the rest.

## Assumptions
- [A20](../experiments/assumptions.md): parent-linked students retain and convert better
- [A21](../experiments/assumptions.md): effort-only default sharing reduces refusals

## Revisit triggers
- Pilot: parent-linked students retain and convert much better → push the parent feature harder
- Pilot: no difference → keep parents payment-only, focus on students and teachers
- Review date: 2027-04-01

## Consequences
+ Fewer refusals, more student trust, and a consent flow that covers PDPA
− A weaker parent channel for marketing; the payment conversation depends on the student
