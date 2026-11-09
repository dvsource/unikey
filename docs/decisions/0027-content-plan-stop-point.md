# DR-0027: Stop reviewing the content plan: one final fix pass, then app development

- **Status:** Proposed
- **Date:** 2026-11-07 · **Owner:** Viraj · **Consulted:** Claude (business-plan chat), the content-generation session
- **Area:** Process / Content

## Context
Over several rounds, two AI sessions reviewed the content-authoring spec, the Mechanics sample (mechanics-20: 17 templates, 1,030 variants) and the syllabus-built Mechanics skill graph (83 skills). Each round found fewer problems. Viraj needed a point to stop and move on to other work ("we went back and forth few times").

Findings that were critical in earlier rounds and are now addressed:
- **C1, English only:** the sample is now translated to Sinhala, with a glossary check (spec v0.5, V15).
- **C2, easier than the exam:** exam-strength items are added (F45).
- **C3, mistake tags:** the tag list is frozen and catch-all tags are restricted (spec v0.4, §7, V10).
- **C4, skills shaped by past papers:** the graph is now built from the syllabus first ([DR-0022](0022-typed-skill-graph.md)).

## Options considered
1. Keep reviewing until both sessions find nothing. Never ends, and it blocks app development.
2. Start app development now and ignore the open points. Wrong diagnoses and give-away items would reach the pilot.
3. **One final fix pass with no further review round, then move on** ✅

## Decision
**Settled, don't re-review:** the content spec (forms, automated checks, tag approach, grading rules), the sample pipeline, the overall skill-graph structure, and the app's item data model. App development can start on the data model now.

**Final fix pass.** Hand it to the content session. Accept the result without another review unless the validator fails.

| # | Fix | Why |
|---|---|---|
| 1 | Turn the over-strict hard prerequisites into `helps` links | Otherwise the app diagnoses students wrongly and recommends skills in the wrong order |
| 2 | Two-level exam weights (competency level, then within the level) | Readiness stays stable and can track the mock (A24) |
| 3 | Freeze the tag list, ban catch-all tags, check each tag matches the mistake that produced it | The mistake notebook gives the right feedback |
| 4 | Fix sample items t01, t02, t08, t09, t10, t12 | Removes answer give-aways and implausible numbers |
| 5 | Amend DR-0022: granularity, sub-topic layer, skill types, prerequisite rule | Docs match the graph |

The chat suggested an "any-of" prerequisite edge. The DR-0022 amendment chose `helps` for multi-method skills instead, with no "any-of" type.

**Deferred on purpose:**
- Merging and splitting skills. Decide using pilot data.
- Mapping Paper II. Do it before final weights, not before the pilot.
- Writing exam-strength items at scale. Do it when building the L5 sets.
- Content for units beyond the pilot.

**Needs the teacher (the wife), not more AI review:**
- Sinhala terms and the glossary
- Sign-off on the skill list and prerequisites, plus a spot-check of the 10-question mapping
- For each sample distractor: is it a mistake students really make?
- TBC items: the statement-grid format, the π convention, the vertical-circle scope ([spec §13](../living/content-authoring.md#13-tbc-with-teacher))

**Budget:** about 80 skills for Mechanics, which implies 400+ for all of physics. This applies to the pilot units only, and the overall budget is revisited after the pilot (DR-0022).

## Assumptions
- [A29](../experiments/assumptions.md): decomposed L1–L4 practice plus exam-strength items transfers to mock-paper gains

## Revisit triggers
- The validator fails on the fix-pass output
- The teacher's review finds systematic problems (wrong physics, wrong tags or bad distractors in more than ~10% of items)
- Pilot students do well on L1–L4 but not on exam-strength items or the mock
- Review date: 2027-01-15 (before the pilot starts)

## Consequences
+ Content work runs in parallel without Viraj; he moves to app development and pilot setup
+ The teacher reviews a stable sample, not tags that will change again
− Some known imperfections (skill granularity, Paper I-only weights) go into the pilot
− The teacher's review load is real: roughly 2–3 hours per 20 source questions. At scale she fully reviews templates and tags, and spot-checks about 30% of fixed cards
