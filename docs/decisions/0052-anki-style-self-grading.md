# DR-0052: Anki-style answers: Show answer, then Again / Hard / Good / Easy

- **Status:** Accepted (Viraj, 2026-11-23)
- **Date:** 2026-11-23 · **Owner:** Viraj
- **Area:** Product
- **Source:** [student journey redesign](../superpowers/specs/2026-11-23-student-journey-redesign-design.md) §3, §4
- **Amends:** [DR-0004](0004-schedule-skills-not-cards.md) (its "automatic grading" part), [DR-0051](0051-study-loop-rules-after-first-judge-pass.md) change 1 (timing of the repair card); replaces rule 4 of the [content authoring spec](../living/content-authoring.md) §1

## Context
Viraj's first description of the product (2026-11-02 chat) was "purely Anki based notes and questions (the crown jewel) … except few tweaks to review options". In the same chat Claude argued that students can't judge their own problem solving, so everything should be auto-graded with no Again/Hard/Good buttons. That became rule 4 of the content spec, and with it every item became tap-an-option. After using the engine APK on his phone (2026-11-23), Viraj said the app is not what he had in mind. He wants Anki's "Show answer" and four grade buttons back.

## Options considered
1. Keep auto-grading only: honest marks / not the product Viraj described, and it forces every item to be an MCQ
2. Pure self-grading: closest to Anki / a student can grade a wrong MCQ as Good
3. **Hybrid: self-grade on recall cards, the app's mark on MCQ, a hidden trust check** ✅ (Viraj, 2026-11-23)

## Decision
- Every card is answered the same way: the student thinks (or works it out on paper), taps **Show answer**, and the answer appears on the same screen.
- **Recall card:** after the reveal the student grades it **Again / Hard / Good / Easy**. Good is the main button.
- **MCQ:** tapping an option only selects it, and the student can change it. Nothing is revealed until Show answer.
  - Right: the four grade buttons, as for recall. Again stays available for a lucky guess.
  - Wrong, or no option picked: the app sets Again. One **Next** button. The same card is never retried straight away.
- **What a grade does** (the engine's heights and review gaps from [DR-0048](0048-pilot-engine-simple-skill-schedule.md) stay):

| Grade | When the skill comes back | Its height | The rest of the session |
|---|---|---|---|
| Again | 1 day. An easier card of the same skill comes later in this session, near the end, not straight after | A second Again at this height lowers it one step | Counts as a miss |
| Hard | Stays on the same gap step | No credit toward stepping up | Counts as half right. Two Hards in a row: the next card comes from a height the student usually gets right |
| Good | Next gap step (1, 3, 7, 14, 30 days × memory) | One of the two rights needed to step up, as now | Right |
| Easy | Skips one gap step | Steps up at once, at most once per skill per session, and never to full on a returning section's first two days | Right. Three Easys in a row: the next card is one height up or a new skill |

- **Trust check:** MCQ marks are always believed. If a student's Good or Easy on recall cards of a skill is often followed by MCQ misses on that skill, the engine quietly reads that student's Easy as Good and Good as Hard. The student never sees it.
- **"I don't know" is removed.** Show answer with nothing picked, or Again, covers it.

## Assumptions
- Most students grade themselves honestly enough once the trust check corrects the worst over-confidence
- Self-grades give a useful extra signal (how sure the student is) that a right/wrong mark can't

## Revisit triggers
- Pilot data shows recall Good/Easy predicts later MCQ success on the same skill poorly for most students, even after the trust check
- Students press Good on almost everything (grades carry no information)
- Review date: 2027-02-01

## Consequences
+ The study loop is the Anki loop Viraj designed the product around
+ Items no longer have to be MCQs, so students recall instead of recognise
− Self-grades can be gamed; the trust check is new and needs simulator tests
− The engine, the simulator's student models and the judge checks all need a grade input
