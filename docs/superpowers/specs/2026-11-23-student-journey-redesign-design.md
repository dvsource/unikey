# Student journey redesign: design and build brief

_Date: 2026-11-23 · Status: approved by Viraj in a brainstorm · Nothing is built yet._

Decisions: [DR-0052](../../decisions/0052-anki-style-self-grading.md) (answering and grades) · [DR-0053](../../decisions/0053-recall-first-content-mix.md) (recall and MCQ mix) · [DR-0054](../../decisions/0054-one-screen-study-card.md) (study screen) · [DR-0055](../../decisions/0055-onboarding-revised-for-anki-loop.md) (onboarding). Screen spec and copy: [UX design](../../living/ux-design.md#a-onboarding), [study screen](../../living/ux-design.md#study-screen).

Lines marked **(Viraj)** are his answers. Lines marked **(my call)** are Claude's, and he can overrule them.

## 1. Intent and why

Viraj tried `builds/unikey-engine-on.apk` and said the student app is "not what was on my mind". He described the product on 2026-11-02 as "purely Anki based notes and questions (the crown jewel) … except few tweaks to review options". This redesign brings that core back. The engine's adaptivity, skip and effort rules stay.

### Where the app drifted

| # | Viraj's idea | What the docs decided | What the app did | Where it drifted |
|---|---|---|---|---|
| 1 | Anki notes and questions, few tweaks to review options | Claude argued that students can't self-grade physics, so the docs decided to auto-grade everything with no Again/Hard/Good (content spec §1 rule 4, DR-0004) | No grade buttons | A decision left his words |
| 2 | Anki notes and questions | Auto-grading needs options, so every layer became tap-an-option | All 241 items MCQ or true/false, no recall cards | A decision left his words |
| 3 | Onboarding A1–A9 (DR-0026) | Accepted | None. The prototype was a reviewer tool, and onboarding was parked as sub-task S12 | The app, on purpose |
| 4 | Skip = "remind me later" | One "Not now" with an optional reason toast; "I don't know" as a design call | Four buttons: I don't know, Not now, Too hard, End session | The app left the spec ("Too hard" was meant to be a toast reason) |
| 5 | Not discussed | Nothing | The answer replaces the question on a second screen | The app's own call |
| 6 | Not discussed | English interface (DR-0024) | A reviewer's EN toggle at the top | A reviewer tool leaked into the student view |
| 7 | Dawn as the design language only | DR-0025 covers look only | Dawn did not change the flow; 1, 2 and the reviewer-first build did | Mostly not Dawn |

## 2. Goals, non-goals, anti-goals

**Goals**
1. Every card is answered Anki-style: think, Show answer (the answer appears below the question on the same screen), grade. **(Viraj)**
2. Two buttons before the reveal: Skip and Show answer. **(Viraj)**
3. Grades decide what comes next, harder or easier, and when the skill returns. **(Viraj)**
4. Most cards are recall. MCQ is used sometimes. **(Viraj)**
5. An onboarding flow in the app. **(Viraj)**

**Non-goals for this build**
- New recall-only content. Existing items get a recall mode first.
- A typing box for numeric answers. **(Viraj: think or paper, then reveal)**
- The step player (F43).

**Anti-goals**
- A wrong MCQ is retried straight away. **(Viraj: "wrong means wrong")**
- A stray tap on an MCQ option reveals the answer. **(Viraj)**
- Reviewer tools in the student build.
- A weak student gets more work, a session ends on a wrong answer, or a backlog is shown (these stay from the scheduler spec).

## 3. Approaches considered

| Area | Options | Picked |
|---|---|---|
| Grading | auto only (as now) · pure self-grade · **hybrid: self-grade, the app's mark on MCQ, a trust check** | Hybrid **(Viraj)** |
| MCQ reveal | the tap reveals · **the tap selects, Show answer reveals** | Select then reveal **(Viraj)** |
| Content | write new recall cards · **dual-mode items** | Dual-mode **(Viraj)** |
| Mix | 50/50 · **70/30, day 1 about 50/50** · recall only | 70/30 **(Viraj)** |
| Placement | keep the quick check · **merge it into the first session** | Merge **(Viraj)** |
| Teaching the card | a tutorial screen · **coach lines on the first cards** | Coach lines **(Viraj)** |
| Paywall order | before sign-in · **after sign-in** | After **(Viraj)** |
| Parent | separate consent and payment · **one message** | One **(Viraj)** |
| Ending a session | an X button · **the phone's Back** | Back **(Viraj)** |
| Skip reason | one optional chip · **no question** · skip the card only | No question **(Viraj)** |
| Reviewer UI | a switch · **a separate build** | Separate build **(Viraj)** |

## 4. Engine changes (`engine/`)

Read the [scheduler spec](2026-11-12-study-loop-scheduler-design.md) §5, §6 and §8 with these changes:

1. **Answer input.** Replace `Choice = number | "dont-know"` with an answer of `{ mode: "recall" | "mcq", picked?: number, grade: "again" | "hard" | "good" | "easy" }`. On MCQ, a wrong or missing pick forces `again`. "I don't know" is gone; it maps to `again` with no pick.
2. **Grade effects** (DR-0052 table):
   - Again: a review gap of 1 day; the repair path as now.
   - Hard: the gap step does not advance; no step-up credit; counts 0.5 toward the running success rate.
   - Good: as today's "right".
   - Easy: the gap advances two steps; the skill steps up at once, at most once per skill per session, and never to height 3 on a returning section's first two days.
   - Two Hards in a row: the next non-repair card comes from a usually-right height. Three Easys in a row: the push-up of DR-0051 change 5.
3. **Repair timing.** The repair card (DR-0051 change 1) is queued for the end of the session, after the middle and before the closing card, not served straight after the miss. **(Viraj: "in the same session but not after immediately… at the end")** If the budget runs out first, the repair moves to the next session's opening. **(my call)** Change 2 (leave the skill after two misses) stays.
4. **Trust number** (a new profile field, **my call** on the details): start at 1.0. For each MCQ on a skill whose last recall grade was Good or Easy within 7 days, move it toward 0 on a miss and toward 1 on a right answer, as a moving average over about 20 events. Below 0.6, read Easy as Good and Good as Hard when applying recall grades. MCQ marks are never discounted.
5. **Mode choice.** The engine picks recall or MCQ for dual-mode items to keep the session near the target MCQ share: about 0.5 in the first session, about 0.3 after that. Repair cards prefer recall at height 1. **(my call)**
6. **Skip.** Drop `SkipReason` from the student path. Every skip is `later`. Keep the second-skip value message. The "too-hard" card-level branch (DR-0051 change 6) is no longer reachable from the UI. Leave it in place for now, and remove it after the simulator rerun.
7. **Coverage from onboarding.** Units the student marks as not covered are left out of new-skill picks until added. **(my call: this replaces "Not learned yet")**
8. **Simulator and judge.** Simulated students need a grading behaviour (honest, over-confident, under-confident). Add code checks: no same-card retry after Again; the repair card never comes straight after a miss; the trust number falls for an over-confident grader. Rerun the judge pass. DR-0047's acceptance gate still applies.

## 5. Content changes (`content/`)

- Add `recall_ok` and `model_answer` (Sinhala, with English) to items whose form is recall or "either" in the DR-0053 table. Templates (F40, F41, F44) get the model answer per variant from the solver, plus a one-line method.
- Reword stems that only make sense with options ("Which of the following…") when they are marked recall-OK.
- `build-content.mjs` passes the new fields through. The content tests check that every `recall_ok` item has a model answer.
- Teacher reviewers check the model answers only. The reviewer build shows each recall-OK item both ways.

## 6. App changes (`app/`)

- **Study card** (`src/engine/EngineStudy.tsx`): a single screen as specified in the UX doc. Option taps select, Show answer reveals in place, and the grade row or Next follows. Remove the I don't know, Not now, Too hard and End session buttons. Back ends the session (Android hardware Back and the router's back). Hold-to-show EN goes top-left, and a thin effort bar replaces the effort numbers.
- **Coach lines:** a once-only flag per line in the store.
- **Onboarding O1–O9:** a new route group shown on first launch. It saves name, goal, stream, exam year, routine and covered units to the profile. O5 runs a normal engine session with the first-session settings. O7 is a placeholder (Later only) until login exists (T27). O8 in the pilot takes the activation code.
- **Reviewer build:** a build-time flag (an EAS profile) that removes the reviewer UI from the student APK.
- **Tests:** update the Maestro flows (`01-session-feedback` uses `toggle-english` and the feedback screen) and the session tests.

## 7. Left to the builder
- Grade button layout on small screens (four in a row or 2 × 2), within Dawn.
- The exact once-only and coach-line storage.
- Whether the effort bar animates.
- The stem rewording rules for recall mode, agreed with the content session.

## 8. Build order (suggested)
1. Engine: the answer input and grade effects, repair timing, simulator grading behaviours, the rerun.
2. App: the one-screen card, two buttons, Back, hold EN (works with auto-mark only until content has model answers).
3. Content: `recall_ok` and `model_answer` on the three pilot packs, then teacher review.
4. App: onboarding O1–O9 with coach lines.
5. Reviewer and student builds split.
6. Engine: the trust number, once there is recall content to test it on.
