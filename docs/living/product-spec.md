# Product Spec

_Last updated: 2026-11-07_

## Core idea
Anki-style spaced repetition is the crown jewel, but **we schedule skills, not cards** ([DR-0004](../decisions/0004-schedule-skills-not-cards.md)). Spaced repetition runs underneath, on a skill graph instead of a flat deck.

Users: **students** (mobile app; the primary customer, [DR-0018](../decisions/0018-student-is-primary-customer.md)), **teachers** (web dashboard; optional, since the app works without a class), **parents** (optional; WhatsApp + web report link, no app). Screens and design: [UX design](ux-design.md).
Choices at onboarding: medium (Sinhala / English / Tamil), subject, topics.

## Why plain Anki breaks on Physics and Combined Maths
| Anki assumption | Reality for problem subjects |
|---|---|
| A card has one fixed answer you can memorise | The answer can be memorised, but solving can't. A repeated card tests memory of the answer, not skill. |
| Self-grading (Again/Hard/Good/Easy) | Students can't judge their own problem-solving. Grading must be automatic. |
| Cards are independent | Skills have prerequisites. Failing circular motion may really mean failing resolving forces. |
| Reviewing = seeing the same item again | Reviewing a skill = a **new instance** of it |

## Skill graph
Decisions: [DR-0004](../decisions/0004-schedule-skills-not-cards.md), [DR-0022](../decisions/0022-typed-skill-graph.md)

A **typed graph, not a tree**: many physics skills have several parents. The hierarchy is only for navigation and display.

```
Hierarchy (navigation & display):
Subject → Unit → Topic (= NIE competency level) → Sub-topic (= NIE content heading) → Skill (KC) → Problem families (templates) → Variants

Graph edges (learning logic):
Skill ──requires──▶ Skill      (hard prerequisite: can't do B without A)
Skill ──helps────▶ Skill       (soft: A makes B easier)
Skill ──encompasses▶ Skill     (doing B exercises A implicitly)
Skill ◀─confusable─▶ Skill     (often mixed up: momentum vs energy)
Skill ──uses-math──▶ MathSkill (vectors, trig, calculus, graphs)
```
| Edge | Used for |
|---|---|
| requires | Diagnosis (failing B → check A), recommended order, soft gating. **Only when B can't be done without A.** **Must be a DAG; validate in CI.** |
| helps | Recommendations ("learn A first to make this easier"). Use for useful-but-skippable prerequisites, and when B can be done by more than one method (no "any-of" edge) |
| encompasses | Implicit review (practising B partly reviews A) |
| confusable | Deliberate interleaving; L3 method-recognition cards. Only where students pick the wrong idea or method; never a skill and its own prerequisite |
| uses-math | Maths remediation (big for Bio students) |

Not every skill needs a prerequisite, but every skill links to at least one other skill (validated). A foundation skill that past papers never test directly, but that many tested skills require, has `mastery: inferred`: it is credited from the skills built on it and is not practised first.

### Skill (node) design
Granularity: one skill is testable by 5–20 variants, masterable in 1–3 short sessions, and a single point of failure. Aim for about 1 skill per 1.3–2 NIE teaching periods, finer where exam weight is high. Mechanics (110 periods) has 83 skills, accepted for the pilot units. The whole-physics budget (around 350) is revisited after the pilot. Use the NIE competency levels as the topic layer and the NIE content headings as sub-topics. Can-do statements per skill come later ([DR-0022](../decisions/0022-typed-skill-graph.md)).
```
Skill {
  id: "phy.mech.circ.vertical-tension"    // stable forever
  unit, topic, subtopic
  syllabus_ref: competency level 2.6       // NIE competency level
  type: recall | conceptual | procedural | method-selection
  practical: true | false                  // tied to a set practical or activity
  mastery: practised | inferred            // inferred = credited from skills built on it
  exam_weight: 0.0–1.0                     // level weight (exam share + period share), split by skill score; Paper I only until Paper II is mapped
  difficulty: est. → calibrated from data
  est_minutes: 20
  math_deps: [trig.resolve, algebra.rearrange]
  names: { si: "...", ta: "...", en: "..." }
}
```

### Mastery states: progress isn't one number
| Dimension | Meaning | Source |
|---|---|---|
| Mastery (θ) | Can they do it? | KC model (Elo/IRT-style) from attempts |
| Retrievability (R) | Can they do it *now*, or has it faded? | FSRS-style decay since the last success |

```
⚪ Not started → 🔵 Learning → 🟡 Practising → 🟢 Mastered
                                                  │ (time passes, R drops)
                                                  ▼
                                            🟠 Fading → review restores 🟢
```
"Fading" is an honest retention hook that doesn't nag: "3 skills are fading, 4 minutes to refresh them."

### Moving evidence through the graph
| Event | Update |
|---|---|
| Success on B | B mastery ↑; encompassed skills get partial review credit (**FIRe-style implicit review**, weights ~0.3–0.7 per edge), so foundations stay fresh and the daily load stays small |
| Failure on B | B mastery ↓; **don't** penalise prerequisites automatically. Schedule a quick check on the most likely weak prerequisite. |
| Prerequisite A confirmed weak | Remediate A first; pause B ("let's fix the foundation") |
| Repeated A/C confusion | More interleaving of the pair; more L3 cards |

**Adaptive placement** (Knowledge Space Theory, as in ALEKS): solving an advanced skill implies its prerequisites are known; failing it probes downward. ~15–25 questions place a student across a unit.

### Ordering: soft gating, never hard locks
```
priority(skill) = in_current_unit (teacher/student selected)   ← strongest
                × prerequisites_ready (soft gate)
                × exam_weight
                × (1 − mastery) or fading urgency
```
Any skill can be opened. If prerequisites are weak, show "Recommended first: Resolving forces (5 min)" instead of a lock.

### Readiness score
```
readiness = Σ exam_weight_i × mastery_i × retrievability_i  /  Σ exam_weight_i
```
- Exam weights come from tagging 10 years of past-paper questions to skills.
- Shown per unit (moves faster, so progress is felt) and overall.
- **Predicted marks (e.g. "~32/50 MCQ") are held back** until they're calibrated against real pilot mocks. A wrong prediction kills trust.

### Showing progress
| View | Verdict |
|---|---|
| Unit rings (tap to drill down) | ✅ Main view |
| Skill chips per topic, coloured by state | ✅ Drill-down |
| Local graph: skill + 2 levels of prerequisites + 1 level of what it unlocks | ✅ Skill detail |
| Full constellation map (~250 nodes) | ⚠️ Optional explorer; good for marketing screenshots |
| Game-style skill tree | ❌ Implies a tree and hard locks |
| Territory / fog-of-war map | 🔮 v2 idea |

Progress moments: "You unlocked 3 new skills by mastering Ohm's law" · "Mechanics: 0 fading skills 💪" · "This week: 4 mastered, 2 rescued from fading" · weekly map-growth snapshot.

### Building and maintaining the graph
```
NIE syllabus + teacher guide (competencies/levels)
   → AI drafts skills + typed edges + math deps
   → automated checks: DAG validity, orphan skills, granularity heuristics
   → teacher reviews per unit (visual graph editor in the admin UI)
   → past-paper questions tagged → exam weights
   → pilot data refines: calibrated difficulty, data-suggested edges
     (failing A strongly predicts failing B → missing edge?), tuned encompassing weights
```
**Skill IDs are permanent.** When the 2031 syllabus arrives, map old skills to new ones so student history carries over.

**Cross-subject reuse:** a shared maths skill layer (vectors, trig, calculus, graphs, rearranging) serves Physics and Chemistry now and becomes the base for Combined Maths. A Bio student failing physics because of trigonometry gets maths remediation inside the physics app.

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

### Grading rules
_Proposed, not yet built or tested._

**L1/L2 cards → FSRS grade**

| Outcome | Grade |
|---|---|
| Wrong, or "I don't know" | Again |
| Correct, but over 2× the item's typical time, or after a hint | Hard |
| Correct on a 2-option card, when the last review was wrong | Hard |
| Correct within normal time | Good |

- **Typical time** starts at the layer's budget and is calibrated from pilot data, per medium, as reading speed may differ.
- **"I don't know"** is an app button on every item, not one of the options. It counts as Again, so retrievability and readiness fall as for any failed review, but it costs no streak or XP.
- **No Easy in the pilot.** A fast tap on a multiple-choice card can be a guess, and Easy pushes the next review far out. Add it only if pilot data supports it.
- **Guessing guard:** a 2-option card answered correctly in its first review is re-checked once the same day, within the daily cap, before its interval grows.

**L3/L4 → skill mastery**
- Skill mastery θ (per student, per skill) and item difficulty b use a guess-corrected logistic model: `p(correct) = c + (1 − c) · σ(θ − b)`, with `c = 1 / number_of_options`.
- After each attempt: `θ ← θ + K · (score − p)`. K starts around 0.4 and decays with attempts.
- Score: 1 = correct, no hint · 0.6 = correct after 1 hint · 0.3 = correct after 2+ hints · 0 = wrong. Step problems score per step; the item score is the mean.
- A small template pool (fewer than 20 variants) is scheduled as L2 cards instead.

**Wrong answers:** the distractor's tag goes into the mistake notebook. Three or more of the same tag within 14 days triggers a remediation set for that tag.

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
Decisions: [DR-0019](../decisions/0019-teen-retention-design.md), [DR-0020](../decisions/0020-no-push-notifications.md)

You can't make an unmotivated teen want to study. You can make the app easier to open than to skip, and rewarding within 5 minutes. The core segment is the **motivated-but-struggling** student (e.g. a Bio student afraid of physics), not the completely uninterested one.

**Not used** ([DR-0020](../decisions/0020-no-push-notifications.md)): push notifications, teacher-voice nudges, and anything that requires the whole class to enrol.

| Cause of day 2–3 drop-off | Lever |
|---|---|
| Too big an ask | **5-minute minimum day**: 10 questions keeps the streak; "keep going?" after; show "5 min", not a count |
| Missed a day → guilt and backlog | **Streak freeze tokens** (earned plus a few free); **no-guilt catch-up** ("Good to see you, let's start small"; a short refresh of fading skills only; never "300 due") |
| No felt progress | **Readiness moves every session**; mastery moments; before vs after ("Week 1 you got this wrong. Today you got 3 like it right."); "You solved one 60% of students get wrong" |
| Too hard too soon | Calibrate early sessions to ~80% correct |
| Disconnected from real life | Queue follows the class topic; **term-test mode** ("test in 12 days, here's your plan"); exam countdown; past-paper tags ("appeared in 2019, 2021, 2023"); the student's goal on screen (Medicine / Engineering / Pass A/L) |
| No trigger | Routine anchor chosen at onboarding (after tuition / on the bus / before bed); **Android home-screen widget** (streak + today's 5 questions); **opt-in WhatsApp reminder, off by default**; friend activity ("Nimal just finished today's practice") |
| Nobody notices | **Opt-in social**: friend streaks, weekly class leagues that reset on Monday (class-scoped, never national), 5-question duels, class-vs-class challenges. If the class is enrolled: teacher sees inactive students and can use results in class. |
| Teens resist control | Autonomy: learn or practise, topic order, duel vs solo; the queue is a recommendation; avatar, nickname, class badge |
| Boredom | Fun layer as sugar only: variable rewards (bonus XP days, surprise badges), speed rounds, mini-challenges |

- Background music and motivational quotes: near-zero retention effect. Later polish.
- **Ethics for minors:** no dark patterns (fake urgency, shame, endless loops); a healthy daily cap; "Done for today 🎉" endings.

### First 7 days
| Day | Goal | Experience |
|---|---|---|
| 0 (install) | First win in < 5 min | Optional class code → goal + routine time → 5-question easy diagnostic → "You're already strong in X!" + first readiness score |
| 1 | Habit trigger works | Widget / chosen routine; 5-minute session; streak 🔥 2 |
| 2 | Social hook | "Add a friend for a friend streak" + first duel |
| 3 | Felt progress (danger day) | Readiness visibly up; "mastered your first concept" moment |
| 4–5 | Class connection | This week's class topic in the queue (teacher assignment if enrolled) |
| 6 | Safety net | Missed a day → freeze auto-used + "welcome back" session |
| 7 | Weekly payoff | League results; week summary ("5 days, +12% in Mechanics"); parent effort update if shared |

**Find the "aha moment"** from pilot data (e.g. "3 sessions in the first 5 days" or "added a friend"), then redesign onboarding to push every student toward it ([A25](../experiments/assumptions.md)).

### Re-engagement ladder (no push)
```
No session 24h  → widget shows today's 5; in-app welcome waiting
No session 48h  → WhatsApp nudge (only if opted in) / friend nudge
No session 4d   → "welcome back" 3-minute session
No session 7d   → inactive flag on teacher dashboard (only if class enrolled)
```

### Countering "it doesn't work"
- Set expectations at purchase: "Results show after 3–4 weeks of 5+ days a week."
- Make effort visible in reports: if the student stopped, the report shows it. That's a usage issue, not a product failure.
- Money-back guarantee tied to usage ([DR-0021](../decisions/0021-usage-tied-guarantee.md)); consider a 7-day free trial.

### Pilot build priority
1. 5-minute minimum day + streak with freeze + no-guilt catch-up
2. Readiness score that moves every session + mastery moments
3. Teacher assignments + inactive-student flag (for enrolled classes)
4. Home-screen widget + opt-in WhatsApp reminder
5. Friend streaks and class leagues
6. Duels and the fun layer

**Retention metrics (weekly):** D1/D3/D7/D30 retention (D7 ≥ 40% would be strong), % finishing the daily queue, average study days/week (target ≥4), streak-break rate, widget adoption, WhatsApp opt-in rate.

## Segment paths
- **One adaptive path for every student** ([DR-0028](../decisions/0028-any-physics-student-adaptive.md), replaces the "Physics for Bio students" path). The algorithm adapts the daily mix (L1–L5 share), difficulty, scaffolding, new-skill pace and review load from: current knowledge (placement + mastery), skill level (Elo/IRT), learning speed (mastery gain, response time, hint use) and usage (frequency, missed days). Stream and exam year only set the starting default.

## Teacher dashboard
Class weak-topic heatmap, assign decks, paper builder (term-test/model papers with answers and marking guides, PDF), one admin report (to be chosen from survey data), class progress reports.

## Parent report
Decisions: [DR-0015](../decisions/0015-parents-via-whatsapp.md), [DR-0018](../decisions/0018-student-is-primary-customer.md)

Parents are optional. The **student chooses the sharing level**:

| Level | Parent sees |
|---|---|
| Effort only (**default**) | Study days, streak |
| Effort + progress | + readiness trend (traffic light) |
| Full detail | + scores, weak topics |

- Delivered as a WhatsApp summary plus a signed, expiring, read-only link to a mobile web report. **Weekly** for engaged parents, **monthly** for others.
- Written for a parent who can't follow physics: one headline number, a traffic light instead of scores, plain language in their medium, an optional 20-second voice note, the teacher's name for authority, and one action. Template in [UX design](ux-design.md#parent-weekly-report-template-to-translate).
- **"Ask parent to pay"** button: a ready-made WhatsApp message with a payment link and the student's progress so far.
- **Parent-sponsored rewards:** e.g. a 30-day streak prompts the parent to give a reward.
- **Under-18 consent:** a one-time parent confirmation via WhatsApp (PDPA). This is the only parent step that's always required.

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
Item forms, schema and automated checks are in the [content authoring spec](content-authoring.md).

1. LLM drafts templates, steps, misconception maps and notes (batch).
2. SymPy verifies each template across ~50 sampled variants.
3. Status `AI-verified` → teacher review in the review UI → `published`.
4. A versioned content pack is exported to the CDN, and the app fetches it on next sync.

Multilingual: a fixed **term glossary per medium** (matching the NIE textbook glossary), and a translate-from-English pipeline that enforces it, rather than free generation in each language. **One medium first.** The other mediums get paid reviewers, recruited from the teacher channel. Estimated effort: ~3–5k cards + 1.5–2k questions ≈ 80–150 review hours per medium (much less with templates).

Past papers: link to the originals; don't embed them. Generate "in the style of" variants ([legal](legal-and-privacy.md)).
