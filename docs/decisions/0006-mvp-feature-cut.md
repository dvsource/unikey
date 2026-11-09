# DR-0006: MVP feature cut for the physics pilot

- **Status:** Accepted (Viraj, 2026-11-07)
- **Date:** 2026-11-02 · **Owner:** Viraj
- **Area:** Product

## Context
The idea list is long: gamification, leaderboards, paper builder, mini-games, simulations, animations, background music, quotes, reports, teacher/parent tools. Each is a project. Scope creep is the silent killer, and the pilot needs only enough product to test the core loop and the outcome claim.

## Options considered
1. Build the full vision before the pilot: months later, no feedback
2. **Strict v1 / v2 / v3 cut, driven by retention return** ✅
3. Bare flashcards only: too thin to test the differentiation

## Decision
- **v1 (pilot):** KC graph for 2–3 units, L1/L2 cards (FSRS), L3 cards, ~30–50 L4 templates (MCQ answers + misconception distractors), timed MCQ sets, readiness score, weak-topic report, mistake notebook, micro-notes + 3 sim engines, teacher dashboard, parent weekly report (manual send).
- **v2:** gamification (class-scoped), paper builder PDFs, full step player, automated WhatsApp.
- **v3+:** more sims (only for the concepts the data shows students fail), freeform mode, mini-games, music, quotes.
- **One medium first** (likely Sinhala; to confirm), with a glossary-enforced translation pipeline for the others.

Details: [product spec MVP](../living/product-spec.md#mvp-cut-physics-pilot).

## Assumptions
- [A6](../experiments/assumptions.md): accountability and visible progress beat novelty features for retention

## Revisit triggers
- The pilot misses retention criteria *and* exit interviews point to missing features (not habit)
- Review date: 2027-04-01

## Consequences
+ The pilot can start in January; effort goes into what drives retention
− Fun features wait; some students may find v1 plain
