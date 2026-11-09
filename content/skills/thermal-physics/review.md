# Thermal Physics skill graph: teacher review (draft)

_Status: draft, not reviewed. Built 2026-11-08 against content authoring spec v0.5 and [DR-0022](../../../docs/decisions/0022-typed-skill-graph.md) as amended. Same method and checks as the [Mechanics graph](../mechanics/review.md)._

## What this is

This is a map of A/L Physics Unit 4 (Thermal Physics) as small skills. The app uses it to:
- decide what a student should practise next
- find the weak prerequisite when a student keeps failing a skill
- review older skills as part of newer ones
- mix up skills that students often confuse

It was built **from the NIE syllabus first**: competency levels 4.1–4.9, 60 periods. Past papers were mapped onto it afterwards, so a skill exists whether or not papers have tested it.

| | |
|---|---|
| Skills | 46, across 9 competency levels (about 1 per 1.3 periods, as DR-0022 sets) |
| Types | 26 procedural, 18 conceptual, 2 recall. 6 carry the `practical` flag |
| Links | 36 needs · 25 reviews · 22 helps · 4 mixed-up pairs · 29 links to maths skills |
| Past-paper questions mapped | 58 MCQs (2016–2025 real papers only) |
| Skills never tested by past papers | 13 |
| Checks | `requires` has no cycles (longest chain: 3 steps), every skill is linked, and no mixed-up pair is a skill plus its own prerequisite ([`validate.py`](validate.py)) |

## Files

| File | What it holds |
|---|---|
| [skills.md](skills.md) | **Start here.** Every skill, one table per competency level, with its links. Tick ☐ for each skill you agree with. |
| [coverage.md](coverage.md) | How often past papers test each skill, which skills they never test, and notes on the mapping |
| [graph.json](graph.json) | The graph the app reads |
| [question-map.json](question-map.json) | Each past-paper question with its main skill and up to 2 secondary skills |
| `author.py`, `validate.py` | Build and check scripts. Edit `author.py`, then run both. The shared code is in [`../graphkit.py`](../graphkit.py). |

## What to check (about 1 hour)

For each skill in [skills.md](skills.md):
1. **Is it one skill?** Can a student practise it in 1–3 short sessions, and either have it or not? Should it be split or merged?
2. **Needs:** can a student really not do this skill without the listed skills? `requires` is only for hard dependencies; anything softer is `helps`.
3. **Mixed up with:** do students really confuse these two skills, picking the wrong idea or method?
4. **Type and practical flag:** recall, conceptual, procedural or method-selection? Is the practical flag right?

For the mapping, pick any 10 questions from [question-map.json](question-map.json) and check that the main skill is the one the question really tests.

## Decisions to confirm

1. **Thermal radiation belongs to Unit 11.** The question bank files 3 questions on Stefan's and Wien's laws (2017-17, 2022-8, 2023-6) under Unit 4. The syllabus puts radiation laws in 11.1, and 4.9 covers radiation only qualitatively. They map to a Unit 11 stub, `phy.matrad.rad.blackbody`, so they don't count towards Thermal weights.
2. **2016-20 is about heat capacity, not kinetic theory.** The bank files it as kinetic theory, but it asks why a room warms again after cool air is let in. It is mapped to specific heat capacity, with heat transfer as a secondary skill.
3. **2018-41 is the anomalous expansion of water.** The bank files it as thermal expansion.
4. **2020-24 is a flawed question.** All five options were accepted. It is still mapped, to cyclic processes, and logged in [source-issues.md](../../source-issues.md).
5. **Granularity.** 4.8 Thermodynamics has 5 skills for 4 periods, because papers test it heavily (8 questions). DR-0022 allows finer skills where the exam weight is high.
6. **No method-selection skill yet.** A "Which gas law?" skill is a candidate: the sample already has a pool for it, under the ideal gas equation.

## Never tested by 2016–2025 MCQs (13)

They stay in the graph at the floor weight, because they are in the syllabus. Paper II may test some of them. See [coverage.md](coverage.md) for the list. None has 5 or more tested skills built on it, so all are practised directly rather than inferred.

## Weights

Weights use Paper I MCQs only. Paper II is not mapped yet, so they are not final. The top-weighted skills are gas law graphs, linear expansion, temperature profiles along rods, and mixtures that melt or boil.
