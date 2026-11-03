# DR-0005: Learn mode = micro-notes with embedded checks + reusable sim engines

- **Status:** Accepted
- **Date:** 2026-11-02 · **Owner:** Viraj
- **Area:** Product

## Context
Some students want theory before questions. Viraj wants short notes and interactive animations. Bespoke animations per question are expensive, and passive reading is forgotten.

## Options considered
1. No notes, practice only: cheap, loses theory-first students
2. Long chapter notes + bespoke animations: expensive and passive
3. **Micro-notes (1 concept/screen) with a retrieval question every 1–2 screens; "Learn first" or "Test me first" entry; reusable parametric simulation engines with predict→reveal** ✅

## Decision
Option 3 ([product spec](../living/product-spec.md#learn-mode-notes-and-simulations)). The pilot ships 3 engines (projectile, circular motion, circuits). Bespoke per-question animations are not built.

## Assumptions
- Theory-first students exist in meaningful numbers (track the entry path chosen in the pilot)

## Revisit triggers
- <10% of pilot students ever open Learn mode
- Sim engines take >2 weeks each to build
- Review date: 2027-04-01

## Consequences
+ Serves both learning styles; one engine serves 20+ notes; sims are reusable in class and in questions
− More content per concept (notes + checks)
