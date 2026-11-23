# DR-0053: Recall first: about 70% recall and 30% MCQ, with dual-mode items

- **Status:** Accepted (Viraj, 2026-11-23)
- **Date:** 2026-11-23 · **Owner:** Viraj
- **Area:** Content / Product
- **Source:** [student journey redesign](../superpowers/specs/2026-11-23-student-journey-redesign-design.md) §5
- **Follows:** [DR-0052](0052-anki-style-self-grading.md)

## Context
Because everything had to be auto-graded, all 241 sample items are tap-an-option (true/false, 4 or 5 options). Viraj does not want most questions to be multiple choice: students should recall, not guess. MCQ is fine sometimes, since the A/L Paper I is MCQ, but not always.

## Options considered
1. 50/50 recall and MCQ: smaller change / still mostly recognising
2. **About 70% recall, 30% MCQ** ✅ (Viraj, 2026-11-23)
3. Recall only, MCQ only in weekly exam sets: purest / no honest marks for the trust check
4. Write a new set of recall cards and keep the MCQs as they are: cleanest cards / far more authoring and review before January
5. **Dual-mode items: one item can be shown as recall (options hidden) or as MCQ** ✅ (Viraj, 2026-11-23)

## Decision
- **Session mix:** about 70% recall and 30% MCQ by card count. **The first session (day 1) is about half MCQ**, so the engine gets honest marks and a first trust number. From day 2 the normal mix applies.
- **Dual-mode items:** an item whose stem stands on its own gets `recall_ok: true` and a short `model_answer` (the answer plus the one line that matters). The engine chooses the mode to hit the mix.
- **By form:**

| Forms | Shown as |
|---|---|
| F01–F05 (facts, formulas, units) | Recall |
| F30, F31, F33 (which principle, what stays constant, where to take moments) | Recall. The answer gives the principle and why |
| F40, F41, F44 (numeric, symbolic, figure templates) | Recall: work it out on paper, then reveal |
| F12–F14, F16, F18, F19 (what-if, traps, fix the thinking, graph meaning, which force, ratios) | Either |
| F10, F11, F15, F17, F23, F32, F42 (true/false, confusable pair, pick the graph, possible or not, pick the diagram, same method, statement grid) | MCQ only: the options are the question |

- Recall cards are answered by thinking or on paper. There is no typing box.
- Teacher reviewers check only the new model answers on existing items. New recall-only cards can be written later.

## Assumptions
- Most existing stems read well without their options, or need only a small rewording
- A day-1 MCQ share of about half is enough to set a starting trust number

## Revisit triggers
- More than a third of recall-OK stems need rewording to stand alone
- Pilot MCQ accuracy (mocks) drops against students who saw more MCQs
- Review date: 2027-02-01

## Consequences
+ No content is thrown away; the pilot units keep their reviewed items
+ Wrong-option error tags still feed the mistake notebook on MCQ cards
− Recall cards carry no error tag, so a recall Again says less about why the student missed
− Every pack needs a pass to add `recall_ok` and `model_answer`, plus teacher review of those answers
