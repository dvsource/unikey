# DR-0022: Typed skill graph with mastery × retrievability, implicit review and soft gating

- **Status:** Accepted (Viraj, 2026-11-07)
- **Date:** 2026-11-03 · **Owner:** Viraj
- **Amended:** 2026-11-07, while still Proposed, after the first syllabus-built graph ([Mechanics](../../content/skills/mechanics/review.md))
- **Area:** Product
- **Extends:** DR-0004

## Context
Skills are the small units of the syllabus. Some depend on others, some are sequential, and some stand alone. A strict tree misrepresents physics, because many skills have several parents. With ~250 skills, reviewing each one separately creates the Anki backlog that kills retention.

Building Mechanics from the NIE syllabus gave 83 skills. Under the original "2–6 skills per competency level" rule, six of its eight levels were over the limit. The same build also showed two problems that could not be seen in advance:
- Too many hard prerequisites: chains up to 7 deep, and some edges a student can in fact skip.
- Some foundation skills, such as displacement and velocity, that past papers never test directly, even though dozens of tested skills are built on them.

## Options considered
1. A strict tree / game-style skill tree with hard locks. Familiar, but wrong for physics, and teens resist being blocked.
2. **A typed graph (hierarchy for navigation plus typed edges for logic), two-dimensional mastery, implicit review, soft gating** ✅

## Decision
- **Hierarchy:** Subject → Unit → Topic (= NIE competency level) → **Sub-topic (= the NIE content heading, such as "Frictional forces")** → Skill (KC). The sub-topic is for navigation and display only.
- **Granularity:** about 1 skill per 1.3–2 teaching periods, finer where exam weight is high.
  - About 80 skills is accepted for Mechanics (110 periods), for the pilot units only.
  - Revisit the whole-physics budget (around 350) after the pilot.
  - This replaces the earlier "2–6 skills per competency level" rule.
- **Edges:**
  - `requires`: hard prerequisite, used **only when the skill can't be done without the other**. Must be a DAG, validated in CI.
  - `helps`: soft. Use it when a skill is useful first but can be skipped, and when a skill can be done by more than one method. There is no "any-of" edge type.
  - `encompasses`: practising B partly reviews A.
  - `confusable`: interleave these; L3 cards. Use it **only where students pick the wrong idea or method**, never for a skill and its own prerequisite (direct or further down).
  - `uses-math`: links to the shared maths skill layer.
- **Skill types:** recall, conceptual, procedural, method-selection, plus a separate `practical` flag for skills tied to a set practical or activity.
- **Can-do statements:** each skill will need one ("I can find the stopping distance of a block sliding on a rough floor"). Required later, not for the first draft graphs.
- **Two dimensions per skill:** mastery θ (Elo/IRT) and retrievability R (FSRS-style decay). States: Not started → Learning → Practising → Mastered → **Fading** → (review) → Mastered.
- **Foundation skills:** if past papers never test a skill directly but many tested skills require it, its mastery is **inferred** (`mastery: inferred`) from the skills built on it. It is not practised first.
  - Draft threshold: at least 5 tested skills.
  - It still gets a note and is used to diagnose failures.
- **Implicit review (FIRe-style):** success on B gives partial review credit (weights ~0.3–0.7) to the skills it encompasses, so the daily load stays small.
- **Failure on B:** don't penalise prerequisites automatically. Run a quick check on the most likely weak prerequisite, then remediate it first.
- **Adaptive placement** (Knowledge Space Theory, as in ALEKS): ~15–25 questions place a student across a whole unit.
- **Ordering:** priority = in current unit × prerequisites ready × exam weight × (1 − mastery or fading urgency). **Soft gating, never hard locks** ("Recommended first: Resolving forces (5 min)").
- **Exam weight**, in two levels:
  1. **Level weight** = 0.5 × the competency level's share of past-paper hits + 0.5 × its share of NIE teaching periods.
  2. **Within a level:** each skill gets max(0.1, score ÷ the level's top score), normalised within the level and multiplied by the level weight. Here score = primary hits + 0.5 × secondary hits.
  - `exam_weight` = that share ÷ the largest share in the unit, so it runs 0–1.
  - The 0.1 floor keeps syllabus skills that past papers skip in the readiness score.
  - Weights are **not final until Paper II is mapped**. The first pass uses Paper I MCQs only.
- **Readiness** = Σ(exam_weight × mastery × retrievability) / Σ exam_weight, shown per unit and overall. **Predicted marks are held back** until calibrated against pilot mocks.
- **Display:** unit rings (main view) → skill chips (drill-down) → local graph (skill detail). A full constellation map is optional; game-style trees are rejected.
- **Skill IDs are permanent.** Map old skills to new ones when the 2031 syllabus arrives.

Details: [product spec](../living/product-spec.md#skill-graph).

## Assumptions
- [A23](../experiments/assumptions.md): implicit review keeps daily load ≤ the 5–20 minute cap as mastered skills grow
- [A24](../experiments/assumptions.md): the readiness score tracks mock results

## Revisit triggers
- Daily review load exceeds the cap for >20% of students after 6 weeks
- Readiness correlates poorly with the week-8 mock
- Paper II mapping shifts any competency level's weight by more than 5 points
- Review date: 2027-04-01

## Consequences
+ Honest progress (fading), a small review load, teacher bottleneck insights, and syllabus alignment for free
+ Fewer hard prerequisites, so soft gating rarely blocks a student
+ Untested foundations don't add practice load
− More complex scheduler and content model; the graph needs a review UI (visual editor)
− About 80 skills per pilot unit means more notes and items to author than the old 2–6 rule implied
