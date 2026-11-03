# Product Spec

_Last updated: 2026-11-02_

## Core idea
Anki-style spaced repetition is the crown jewel, but **we schedule skills, not cards** ([DR-0004](../decisions/0004-schedule-skills-not-cards.md)). Spaced repetition runs underneath, on a skill graph instead of a flat deck.

Users: **students** (mobile app), **teachers** (web dashboard), **parents** (WhatsApp + web report link, no app).
Choices at onboarding: medium (Sinhala / English / Tamil), subject, topics.

## Why plain Anki breaks on Physics and Combined Maths
| Anki assumption | Reality for problem subjects |
|---|---|
| A card has one fixed answer you can memorise | The answer can be memorised, but solving can't. A repeated card tests memory of the answer, not skill. |
| Self-grading (Again/Hard/Good/Easy) | Students can't judge their own problem-solving. Grading must be automatic. |
| Cards are independent | Skills have prerequisites. Failing circular motion may really mean failing resolving forces. |
| Reviewing = seeing the same item again | Reviewing a skill = a **new instance** of it |

## Skill graph
```
Unit (Mechanics)
 └─ Concept (Circular motion)
     └─ Skill / KC (find tension at top of vertical circle)
         ├─ prerequisites: [resolve forces, centripetal force eqn, energy conservation]
         └─ Problem families (templates)
              └─ Variants (generated instances: different numbers/context)
```
- **KC (knowledge component)** is the unit that gets scheduled and mastered. ~150–300 per subject.
- Every item is tagged with one or more KCs plus a difficulty.
- Mastery is stored per student per KC. It drives the readiness score, teacher heatmaps and the scheduler.

## Five layers of practice
| Layer | Item type | Example | Time | Scheduling |
|---|---|---|---|---|
| L1 Recall | Definitions, formulas, units, dimensions, constants | "Dimensions of Young's modulus?" | 5–10 s | FSRS per card |
| L2 Concept check | Misconception traps, graph shapes, "what if" | "Speed doubles. What happens to the radius in a magnetic field?" | 15–30 s | FSRS per card, auto-graded |
| **L3 Method recognition ⭐** | "Which principle or approach?" Choose, don't solve. | "Block slides down a curved frictionless track. Speed at bottom → energy / momentum / kinematics?" | 10–20 s | Per KC, interleaved |
| L4 Step problems | Multi-step problem, one step at a time | Vertical circle tension, 4 steps | 2–5 min | Per KC mastery, new variant each time |
| L5 Exam sets | Mixed timed MCQ/structured, past-paper style | 10 MCQs in 12 min | 10–30 min | Weekly, from weak KCs |

**L3 is the key bridge.** A/L students mostly fail problems by choosing the wrong approach, not through bad algebra ([A15](../experiments/assumptions.md)). The same idea carries over to Combined Maths (which integration technique, which proof method).

## Problem families (templates) and variants
- **Template**: context, variables with ranges and constraints, a solution function, step definitions, a misconception map.
- **Variant**: generated at runtime (new numbers, sometimes a new context).
- **Maths is verified by CAS (SymPy or our own solver functions), never by the LLM.**
- **Distractors come from known misconceptions** (forgot weight at the top of the circle, used diameter for radius, wrong sign convention). Each wrong option maps to an error tag.
- The review win: the teacher reviews **one template, not 200 questions**. That's roughly an order of magnitude less review effort ([A13](../experiments/assumptions.md)).

## Step player (L4)
```
Problem: Stone (m=0.2kg) whirled in vertical circle r=0.8m, speed at top 4 m/s. Tension at top?
Step 1 — Draw/choose forces at top        [select: T↓, mg↓]  ✅
Step 2 — Choose equation                   [T + mg = mv²/r]   ✅
Step 3 — Compute mv²/r                     [ 4.0 ] N          ✅
Step 4 — Final answer                      [ 2.0 ] N  unit[N] ✅
```
| Feature | Detail |
|---|---|
| Step input types | Pick an option, numeric with tolerance and sig figs, unit picker, equation picker, drag a force arrow onto a diagram, order the steps |
| Hint ladder | Nudge → name the principle → show the worked step. Each level used reduces mastery credit. |
| Auto-grading | From correctness, hints used and time taken. No self-rating buttons. |
| Error tagging | Unit, sign, wrong formula, arithmetic, wrong principle |
| Mistake notebook | Every failed step saved automatically. Shows patterns ("40% of your errors are units") with a "redo similar" button. |
| Freeform mode (later) | Solve on paper, enter only the final answer. If wrong, expand into step mode. |

## Scheduling: two engines
```
Daily queue builder
 ├─ Recall engine: FSRS on L1/L2 cards
 └─ Skill engine: mastery per KC (Elo/IRT-style, later BKT)
       → pick KC due/weak → pick unseen variant at right difficulty
       → result updates KC mastery + prerequisite KCs
```
- **Mastery update**: Elo/IRT-style per KC; item difficulty is estimated from all students' attempts. The pilot data calibrates it.
- **Prerequisite propagation**: repeated failure on a KC lowers confidence in its prerequisites and schedules a quick check. If a prerequisite is weak, remediate that first.
- **Learning sequence per new KC**: worked example (with a self-explanation prompt) → faded example → independent step-by-step → independent final-answer-only. A diagnostic lets strong students skip stages (expertise reversal effect).
- **Daily session mix** (capped at ~20 min, interleaved): 35% L1/L2, 25% L3, 40% L4, plus an L5 timed set once a week.
- **No review debt**: cap the daily load (15–20 min), offer a catch-up mode that spreads the backlog over days, and use FSRS.

## Learn mode: notes and simulations
Decision: [DR-0005](../decisions/0005-learn-mode-notes-and-sims.md)

```
Learn (micro-note 1–3 min) → 2–3 check questions → unlock Practice
            ↑                                       │
            └──── "Review note" link on every wrong answer ◄┘
```
| Feature | Detail |
|---|---|
| Micro-notes | One concept per screen: key idea, formula with variables explained, one diagram, one common trap |
| Embedded retrieval | A quick question every 1–2 screens |
| Two entry paths | "Learn first" or "Test me first" (diagnostic skips known concepts). The default comes from the diagnostic. |
| Notes ↔ questions linking | Every item links to its concept note |
| Formula sheets | Auto-built from the student's mastered and weak concepts |

**Simulations as reusable parametric engines**, not one-off animations. ~10–15 engines cover most of A/L Physics: projectile, circular motion, SHM/pendulum, waves and interference, ray optics, DC circuits, electric and magnetic fields, gas laws, thermal, graphs (s-t, v-t). Sliders are configured by JSON, so one engine serves 20+ notes.
- **Predict → reveal**: "Predict where the ball lands if the angle increases. Now drag the slider."
- Once an engine exists, "predict then check" questions are nearly free.
- Offline-capable.

## Retention levers
In order of retention return. Build the top ones first.

| # | Lever | What to build |
|---|---|---|
| 1 | Visible goal and progress | Exam readiness score / predicted grade per unit + exam countdown |
| 2 | Social accountability | Teacher assigns today's deck, the class sees completion, the parent gets a weekly WhatsApp report. **Strongest lever.** |
| 3 | Kill review debt | Daily cap, catch-up mode, FSRS |
| 4 | Habit mechanics | Streak with freeze tokens, reminder at the chosen study time, <2 s open-to-first-card, offline |
| 5 | Light gamification | XP, weekly **class-scoped** leagues, badges for mastery (not time) |
| 6 | Immediate payoff | "You fixed 3 weak concepts. Electrostatics readiness +4%." |
| 7 | Novelty (last) | Simulations only for the 5 concepts the data shows students fail most |

- Background music and motivational quotes: near-zero retention effect. Later polish.
- Leaderboards: class- or friend-scoped, nickname option, never national.

**Retention metrics (weekly):** D1/D7/D30 retention, % finishing the daily queue, average study days/week (target ≥4), streak-break rate.

## Segment paths
- **"Physics for Bio students"**: same content, but a different default mix and entry diagnostic. More scaffolding, more L1–L3, early wins ([DR-0012](../decisions/0012-single-subject-bio-first.md)).

## Teacher dashboard
Class weak-topic heatmap, assign decks, paper builder (term-test/model papers with answers and marking guides, PDF), one admin report (to be chosen from survey data), class progress reports.

## Parent report
Weekly WhatsApp summary plus a signed, expiring, read-only link to a mobile web report: strong and weak topics, study days, readiness trend.

## Combined Maths extensions (future)
| Need | Feature |
|---|---|
| Algebraic answers | Math keyboard (MathLive) + CAS equivalence (2(x+1) = 2x+2) |
| Proofs | Parsons problems (drag proof lines into order, with distractors), then gap-fill |
| Technique choice | L3 cards (parts vs substitution vs partial fractions) |
| Long structured questions | Step player with CAS-checked intermediate answers |
| Graph sketching | Choose the correct sketch, or mark intercepts and asymptotes |
| Applied maths | Shares KCs and sim engines with physics |

## Data model sketch
```
Concept(id, unit, prereqs[])
KC(id, concept_id, prereqs[])
Note(id, concept_id, blocks[], sim_refs[])
Template(id, kc_ids[], layer, difficulty, vars, constraints, solver_ref, steps[], misconception_map)
Variant(id, template_id, seed, values, answer)        // generated, cacheable
Card(id, kc_ids[], layer: L1|L2|L3, content)          // static recall items
Attempt(id, student_id, item_ref, steps[{input, correct, hints, ms, error_tag}])
KCMastery(student_id, kc_id, theta, last_seen, next_due)
CardState(student_id, card_id, fsrs_params)
```
**Store attempts at step level from day one.** That data powers the mistake notebook, heatmaps, calibration and reporting.

## MVP cut: physics pilot
Decision: [DR-0006](../decisions/0006-mvp-feature-cut.md)

| Build now | Later |
|---|---|
| KC graph for 2–3 units (e.g. Mechanics, Electricity) | All units |
| L1/L2 cards with FSRS | — |
| L3 method-recognition cards | — |
| L4 templates (~30–50), MCQ-only answers + misconception distractors | Full step player, diagram inputs |
| Micro-notes with embedded checks for those units | All units |
| 3 sim engines (projectile, circular motion, circuits) | 10–15 engines |
| Mistake notebook + error tags | Freeform-then-expand mode |
| Elo-style KC mastery + readiness score | BKT/IRT refinement |
| Timed MCQ sets, weak-topic report | — |
| Teacher dashboard (class view, assignments) | Paper builder PDFs (v2), admin report |
| Parent weekly report (signed link, manual WhatsApp send) | Automated WhatsApp sends |
| | Gamification, leagues (v2) |
| | Mini-games, music, quotes, bespoke animations (v3+, data-driven only) |

## Content pipeline
1. LLM drafts templates, steps, misconception maps and notes (batch).
2. SymPy verifies each template across ~50 sampled variants.
3. Status `AI-verified` → teacher review in the review UI → `published`.
4. A versioned content pack is exported to the CDN, and the app fetches it on next sync.

Multilingual: a fixed **term glossary per medium** (matching the NIE textbook glossary), and a translate-from-English pipeline that enforces it, rather than free generation in each language. **One medium first.** The other mediums get paid reviewers, recruited from the teacher channel. Estimated effort: ~3–5k cards + 1.5–2k questions ≈ 80–150 review hours per medium (much less with templates).

Past papers: link to the originals; don't embed them. Generate "in the style of" variants ([legal](legal-and-privacy.md)).
