# DR-0028: Position for any A/L physics student; the app adapts to each one

- **Status:** Accepted (Viraj: "any physics student. we should algorithmically adjust the content")
- **Date:** 2026-11-07 · **Owner:** Viraj
- **Area:** Positioning / Product
- **Supersedes:** [DR-0012](0012-single-subject-bio-first.md)

## Context
DR-0012 proposed Bio-stream students weak in physics as the first segment, with a separate "Physics for Bio students" path. Open topic B1 asked whether the first customer is that segment or any A/L physics student. Viraj chose any physics student, with personalisation done by the algorithm instead of by segment.

## Options considered
1. Bio-stream students first, with a separate path (DR-0012). Sharp message, but a narrower audience and a second path to maintain.
2. **Any A/L physics student; one path that adapts to each student** ✅
3. Physical Science students first. No clear advantage.

## Decision
- **Audience:** any A/L physics student (Bio and Physical Science streams, Grade 12, Grade 13 and repeaters).
- **One path, adapted per student by the algorithm**, not separate paths per segment. Signals:
  - current knowledge: placement check plus per-skill mastery ([DR-0022](0022-typed-skill-graph.md))
  - skill level: Elo/IRT ability, item difficulty
  - learning speed: how fast mastery rises, response times, hint use
  - usage frequency: how often and how long the student practises, missed days
  - stream and exam year (from onboarding): only a starting default, then overridden by data
- It adapts the daily mix (L1–L5 share), difficulty, scaffolding (hints, notes first), new-skill pace, and review load.
- **Kept from DR-0012:** Physics is sold alone. One app, with subjects as add-ons later, never separate apps.
- Bio-specific messaging ("Physics decides medicine") can still be used in marketing to Bio students. It's a message, not a product path.

## Assumptions
- [A8](../experiments/assumptions.md) is still tracked (Bio vs Physical Science), now to tune messaging, not to choose the segment
- [A30](../experiments/assumptions.md): adaptive pacing keeps both weak and strong students engaged on one path

## Revisit triggers
- Pilot shows one stream converts or retains far worse (> 2×), and adaptation doesn't close the gap
- Weak students drop off because the starting content is too hard, or strong students because it's too easy
- Review date: 2027-04-01

## Consequences
+ A bigger market and one product path to build and maintain
+ Personalisation is part of the product promise, and the skill graph already supports it
− A less sharp marketing message; segment messages must be written separately
− More scheduler tuning before and during the pilot
