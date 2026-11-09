# DR-0025: "Dawn" design system: sunrise sky, indigo ink, yellow for today; "Dusk" as the later dark theme

- **Status:** Accepted (Viraj's wife picked V3a; Viraj confirmed: "let's go with that")
- **Date:** 2026-11-07 · **Owner:** Viraj
- **Area:** Design
- **Supersedes:** [DR-0023](0023-mist-design-system.md)

## Context
After "mist" (DR-0023) we combined styles 1–3 into one direction and mocked up 10 themes on the design canvas: Base, V1, V2, V3a and V3b, each with a light or dark twin. V3a was "same layout, different style": the Base layout drawn as a sky at a time of day. Its dark form is "Dusk" and its light form is "Dawn".

## Options considered
1. Base / Base dark: cream paper, flat
2. V1 / V1 dark: more glass and glowing blobs (closer to mist)
3. V2 / V2 dark: one-scene layout on cream paper
4. **V3a: Base layout, Dawn sky (light) and Dusk sky (dark)** ✅
5. V3b / V3b dark: bold yellow blocks, riso feel

## Decision
- **Main theme: Dawn (light).** Tokens and rules are in [UX design](../living/ux-design.md#design-system-dawn).
- **Dark theme: Dusk, with less blue than the V3a mock-up.** Not designed yet. Design only the light theme for now.
- Kept from the combined direction: colour by meaning, the sun motif, Sigiriya line art drawn as skills are mastered, the monthly letter, day bars, equal "Done for today" / "5 more", and 3 tabs (Today / Learn / Progress) for the pilot.
- Mist's frosted glass and drifting blobs are dropped. Surfaces are solid white, so low-end phones need no blur fallback.

## Revisit triggers
- Usability tests show students miss the yellow main action or misread the colour meanings
- The sky gradient bands or looks muddy on cheap LCD phones
- Review date: 2027-02-01 (after testing on real phones)

## Consequences
+ Warm and distinctive, still calm (fits DR-0020); no blur cost
+ One layout serves both themes, so Dusk later is a token swap
− Yellow on white needs care for contrast: yellow is a fill behind indigo text, never text on white
