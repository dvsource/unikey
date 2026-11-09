# Current Electricity skill graph: teacher review (draft)

_Status: draft, not reviewed. Built 2026-11-08 against content authoring spec v0.5 and [DR-0022](../../../docs/decisions/0022-typed-skill-graph.md) as amended. Same method and checks as the [Mechanics graph](../mechanics/review.md)._

## What this is

This is a map of A/L Physics Unit 8 (Current Electricity) as small skills. The app uses it to:
- decide what a student should practise next
- find the weak prerequisite when a student keeps failing a skill
- review older skills as part of newer ones
- mix up skills that students often confuse

It was built **from the NIE syllabus first**: competency levels 8.1–8.6, 70 periods. Past papers were mapped onto it afterwards, so a skill exists whether or not papers have tested it.

| | |
|---|---|
| Skills | 46, across 6 competency levels (about 1 per 1.5 periods, as DR-0022 sets) |
| Types | 31 procedural, 13 conceptual, 2 recall. 6 carry the `practical` flag |
| Links | 51 needs · 20 reviews · 17 helps · 4 mixed-up pairs · 27 links to maths skills |
| Past-paper questions mapped | 68 MCQs (2016–2025 real papers only) |
| Skills never tested by past papers | 11, 3 of them foundations whose mastery is inferred |
| Checks | `requires` has no cycles (longest chain: 6 steps), every skill is linked, and no mixed-up pair is a skill plus its own prerequisite ([`validate.py`](validate.py)) |

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

1. **Electromagnetic induction is part of this unit.** The syllabus puts it in 8.6 (20 of the 70 periods), but the question bank files 20 induction, transformer and eddy-current questions under Unit 7. They are mapped here.
2. **Capacitors in d.c. circuits.** 3 questions (2018-21, 2020-14, 2022-30) are steady-state circuits with a capacitor. They map to `kir.capacitor-dc`, which needs the Unit 6 stub `phy.estat.cap.capacitance`.
3. **Two networks skills.** Resistor networks are the most tested topic (14 questions), so they are split: plain series and parallel combinations, and networks that need symmetry, a balanced bridge or an infinite ladder.
4. **Inferred foundations.** Current as rate of flow of charge, Ohm's law and I–V curves, and e.m.f. versus pd are never tested alone, but 7 or more tested skills need them. Their mastery comes from those skills; they are not practised first.
5. **Longest chain.** Potentiometer internal resistance sits 6 steps above "current as rate of flow of charge". Each step is a real dependency, and the bottom two are inferred, so a student is never blocked by them.
6. **No method-selection skill yet.** "Series and parallel, balanced bridge, or Kirchhoff's laws?" is a candidate: the sample already has a pool for it, under the Wheatstone bridge.
7. **Mixed-up pairs.** Only 4 are listed. Should "right-hand rule (induction)" and "left-hand rule (force)" stay paired, given the force rule sits in Unit 7?

## Never tested by 2016–2025 MCQs (11)

They stay in the graph at the floor weight, because they are in the syllabus. Paper II and the practical exam probably test several (the metre bridge, the E and r graph). See [coverage.md](coverage.md).

## Weights

Weights use Paper I MCQs only. Paper II is not mapped yet, so they are not final. The top-weighted skills are series and parallel resistors, internal resistance, network reduction and the potential divider.
