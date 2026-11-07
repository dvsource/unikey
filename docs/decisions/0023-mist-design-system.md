# DR-0023: "Mist" design system: calm, minimal, frosted glass with slow gradient blobs

- **Status:** Accepted (Viraj: "much better")
- **Date:** 2026-11-03 · **Owner:** Viraj
- **Area:** Design

## Context
The first UI pass looked like a typical app. Viraj wanted it minimal (but not too much), with calm colours, less distraction, and a modern, abstract feel with a touch of transparency and gradient-blob animation.

## Options considered
1. A typical colourful card-based edtech UI (the first pass)
2. **"Mist": an off-white ground, ink text, sage/lavender/peach accents only in blobs and status tints, frosted glass surfaces, Geist type, slow blob motion** ✅

## Decision
Tokens and rules are in [UX design](../living/ux-design.md#design-system-mist). Low-end Android gets a solid 85% white surface instead of backdrop blur. Motion respects reduced-motion settings.

## Revisit triggers
- Usability tests show students miss the main action → add a soft sage tint on the main card (not a bright colour)
- Blur or motion stutters on 2–3 GB RAM test devices that the fallback can't fix
- Review date: 2027-02-01 (after testing on real phones)

## Consequences
+ Calm, distinctive, fits "no nagging" (DR-0020)
− Near-monochrome hierarchy needs care; blur has a performance cost
