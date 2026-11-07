# DR-0024: Sinhala medium: learning content and subject/topic/skill names in Sinhala; app interface in English

- **Status:** Accepted
- **Date:** 2026-11-03 · **Owner:** Viraj
- **Area:** Design / Content

## Context
The first Sinhala design translated everything. Sinhala-medium students know subject and topic names in Sinhala, but they already read some English. A fully Sinhala UI also means a lot more translation and maintenance.

## Options considered
1. Fully localised UI per medium. Heavy translation and QA load.
2. **Learning content (notes, questions, options, solution steps, feedback, explanations) and subject/topic/skill names in the medium. All interface text (buttons, labels, nav, settings, streaks, league, pricing, error categories) in English.** ✅

## Decision
Option 2 for students and teachers. Sinhala text uses Noto Sans Sinhala; numbers stay in Geist; taller line heights and slightly smaller headings for Sinhala. The same rule applies to Tamil medium later.

**Open (proposed exception):** send **parent** WhatsApp messages in the parent's chosen language (chosen at the consent step), because many parents of Sinhala-medium students may not read English comfortably. Decide before the pilot.

## Revisit triggers
- Pilot students report confusion with English UI terms
- Review date: 2027-02-01

## Consequences
+ Far less translation; one UI string set
− Mixed-language screens need careful typography; parent messages may need an exception
