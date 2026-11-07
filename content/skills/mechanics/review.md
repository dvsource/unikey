# Mechanics skill graph: teacher review (draft)

_Status: draft, not reviewed. Built 2026-11-07 against content authoring spec v0.5, [DR-0022](../../../docs/decisions/0022-typed-skill-graph.md) and the [product spec skill graph](../../../docs/living/product-spec.md#skill-graph)._

## What this is

This is a map of A/L Physics Unit 2 (Mechanics) as small skills. The app uses it to:
- decide what a student should learn next
- find the weak prerequisite when a student fails a skill
- review older skills as part of newer ones
- mix up skills that students often confuse

It was built **from the NIE syllabus and resource book first**: competency levels 2.1–2.8, about 110 periods. Past papers were mapped onto it afterwards, so a skill exists whether or not papers have tested it.

| | |
|---|---|
| Skills | 83, across 8 competency levels |
| Edges | 102 needs · 39 reviews · 29 helps · 9 mixed-up pairs · 57 links to maths skills |
| Past-paper questions mapped | 116 MCQs (2016–2025 real papers only) |
| Skills never tested by past papers | 13 |
| Checks | `requires` has no cycles (longest chain: 6 steps), every skill is linked to at least one other, and no mixed-up pair is a skill plus its own prerequisite ([`validate.py`](validate.py)) |

## Files

| File | What it holds |
|---|---|
| [skills.md](skills.md) | **Start here.** Every skill, one table per competency level, with its links. Tick ☐ for each skill you agree with. |
| [coverage.md](coverage.md) | How often past papers test each skill, which skills they never test, and notes on the mapping |
| [graph.json](graph.json) | The graph the app reads |
| [question-map.json](question-map.json) | Each past-paper question with its main skill and up to 2 secondary skills |
| [sample-crosswalk.json](sample-crosswalk.json) | How the 18 skills in the earlier 20-question sample fit into this graph |
| `author.py`, `validate.py` | Build and check scripts. Edit `author.py`, then run both. |

## What to check

For each skill in [skills.md](skills.md):
1. **Is it one skill?** Can it be practised in 1–3 short sessions, and does a student either have it or not? If not, should it be split or merged?
2. **Needs:** can a student really not do this skill without the listed skills? Is a hard prerequisite missing?
3. **Mixed up with:** do students really confuse these two skills?
4. **Type:** is the type right (recall, conceptual, procedural or method-selection)? Is the practical flag right?

For the mapping, pick any 10 questions from [question-map.json](question-map.json) and check that the main skill is the one the question really tests.

## Decisions for you and Viraj

Settled in the [DR-0022 amendment](../../../docs/decisions/0022-typed-skill-graph.md) (2026-11-07):
- **Skill count.** About 1 skill per 1.3–2 periods. 83 skills are accepted for Mechanics in the pilot. Skills are grouped under NIE content headings as sub-topics. Merges and splits are deferred.
- **Exam weights.** Each level's weight blends its exam share with its share of teaching periods. That weight is then split across the level's skills by score, with a 0.1 floor. The weights use Paper I MCQs only, so they are not final until Paper II is mapped. See [coverage.md](coverage.md).
- **Prerequisites.** `requires` is used only when a skill can't be done without the other skill. Otherwise the link is `helps`. Seven edges were moved to `helps`, which shortened the longest chain from 7 steps to 6.
- **Foundations.** Four skills are `mastery: inferred`: their mastery comes from the skills built on them, and they are not practised first. They are displacement/velocity/acceleration, moment of a force, KE and PE, and streamline flow.
- **Types.** `mom.momentum-vs-energy` is now method-selection, and `mom.elastic-inelastic` is now procedural. Five skills carry the new `practical` flag.

Still open:

1. **Vertical circles.** The syllabus covers circular motion "in a horizontal plane", but 2022-25 asks about the top of a vertical loop. `circ.vertical-tension` is kept for that question. Is it in scope?
2. **Fluids.** The question bank files hydrostatics and Bernoulli questions under Unit 10. The syllabus puts them in Unit 2 (2.7, 2.8), so 26 such questions are mapped here. Viscosity, Stokes' law and surface tension stay in Unit 10. One question the bank tags "Stokes' law", 2020-42 (a parachutist's v–t graph), is mapped to Newton's second law.
3. **Vectors.** Scalars, vectors and vector addition are at syllabus level 1.5 (Unit 1). They appear here only as two stub prerequisites, `phy.meas.vec.*`. Question 2022-1 (which pair is a vector and a scalar) maps to Unit 1, not Mechanics.

## What past papers never test

Thirteen syllabus skills have no real question from 2016–2025. See the [coverage report](coverage.md#skills-past-papers-never-test-13) for the full table.

Some of them are foundations that tested skills depend on, so their mastery is inferred:
- Displacement, velocity and acceleration: 32 tested skills depend on it.
- KE and PE: 11.
- Moment of a force: 6.
- Streamline flow: 5.

Newton's first law is now only a `helps` link to free-body diagrams, so no tested skill requires it.

Others are never reached at all:
- motion down a smooth incline
- time of flight, maximum height and range
- moment of a couple
- force through or away from the centre of mass
- stable, unstable and neutral equilibrium
- hydrometer

Twelve more skills appear only as a secondary skill. Two examples: `kin.suvat` is the main skill in no question, and `energy.mech-conservation` is only ever secondary.

**Question for you:** do schools teach these skills anyway, because Paper II or the practical exam tests them? For example, the hydrometer and angled-projectile range.

## The 18 sample skills

All 18 skills from `content/samples/mechanics-20` keep a place in the graph.
- **16 keep their ID and scope.**
- **1 is renamed:** `phy.mech.n3-pairs` → `phy.mech.newton.n3-pairs`, so it has a topic segment like every other ID. Done in the sample on 2026-11-07.
- **1 is narrowed:** `proj.components` no longer covers KE at the top. That is now `proj.ke-at-top`.

| Sample skill | Graph skill | Change |
|---|---|---|
| `phy.mech.vec.resultant-range` | same | kept |
| `phy.mech.kin.vertical-throw` | same | kept |
| `phy.mech.kin.graph-slope-area` | same | kept. Graph-to-graph conversion is now its own skill, `kin.graph-convert` |
| `phy.mech.kin.average-velocity` | same | kept |
| `phy.mech.newton.n3-pairs` (was `phy.mech.n3-pairs`) | same | renamed in the sample, 2026-11-07 |
| `phy.mech.newton.apparent-weight` | same | kept |
| `phy.mech.fric.stopping-distance` | same | kept |
| `phy.mech.fric.traction-limit` | same | kept |
| `phy.mech.mom.momentum-vs-energy` | same | kept; type is now method-selection |
| `phy.mech.imp.graph-area` | same | kept |
| `phy.mech.proj.components` | same | **narrowed**. KE-at-top items move to `proj.ke-at-top` |
| `phy.mech.circ.friction-limit` | same | kept |
| `phy.mech.eq.moment-balance` | same | kept |
| `phy.mech.pow.force-speed` | same | kept |
| `phy.mech.energy.bounce-height` | same | kept |
| `phy.mech.rot.angular-momentum` | same | kept |
| `phy.mech.rot.rolling-energy` | same | kept |
| `phy.mech.rot.moi-factors` | same | kept |

The rename is done in the sample. The KE-at-top items in `content/samples/mechanics-20/items.json` still need moving to `proj.ke-at-top`.

## Not done yet

- **Sinhala and Tamil skill names.** Only the 18 sample skills have Sinhala names, copied from the sample. The other 65 need names from the NIE glossary, not new coinages (spec §5.7).
- **Difficulty.** `difficulty_est` is the average DB difficulty of a skill's main-skill questions. It is empty for untested skills.
- **`est_minutes`.** These are author guesses.
- **Paper II and model papers.** Paper II (structured and essay) is not mapped, and the weights stay draft until it is. Model papers and `predict-2026` are excluded on purpose.
- **Can-do statements.** One per skill, required later by DR-0022.

## Sign-off

- [ ] Skill list OK, or changes listed below
- [ ] `requires` edges OK
- [ ] Mapping spot-check of 10 questions OK
- [ ] Open questions 1–3 answered

Reviewer: ________ Date: ________ Notes:
