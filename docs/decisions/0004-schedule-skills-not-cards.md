# DR-0004: Schedule skills (KCs), not cards

- **Status:** Accepted (Viraj, 2026-11-07); automatic-grading part amended by [DR-0052](0052-anki-style-self-grading.md)
- **Date:** 2026-11-02 · **Owner:** Viraj
- **Area:** Product

## Context
Anki-style spaced repetition is the core of the product, but Physics marks come mostly from problem-solving. Flashcards cover maybe 30–40% of what matters. Repeating a fixed problem tests memory of the answer, students can't self-grade problem-solving, and skills have prerequisites. Combined Maths makes this worse.

## Options considered
1. Plain Anki decks (cards, self-grading): simple, but a poor fit for problems
2. **Skill graph: KCs with prerequisites, L1–L5 item layers, problem templates with generated variants, auto-grading, two scheduling engines (FSRS for recall, Elo/IRT mastery per KC)** ✅
3. No SRS for problems (only past-paper practice): loses the core differentiator

## Decision
Option 2, as specified in [product spec](../living/product-spec.md#skill-graph). The maths in variants is verified by CAS (SymPy), never by the LLM. Distractors map to misconception error tags. Attempts are stored at step level from day one.

## Assumptions
- [A13](../experiments/assumptions.md): template review cuts review effort ~10×
- [A15](../experiments/assumptions.md): wrong-method choice is a main failure cause (L3 matters)
- [A18](../experiments/assumptions.md): students can't reliably self-grade problems

## Revisit triggers
- Pilot data shows L4 problems have much lower completion than L1–L3 and drag down retention
- Elo mastery doesn't predict mock scores (correlation near zero) after the pilot
- Review date: 2027-04-01

## Consequences
+ SRS works for problem subjects; meaningful mastery for reports; carries over to Combined Maths
− More engineering than a deck app; content needs a template format and a solver
