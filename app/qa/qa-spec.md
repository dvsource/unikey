# UniKey prototype: QA spec

_Version 1 · 2026-11-07 · covers the prototype app in `app/` (roadmap build step 2) and its two scripts._

This spec lists every screen and function of the prototype and the test cases for each. How and when the suites run is in [execution-plan.md](execution-plan.md). The latest results are in [test-report.md](test-report.md).

## Conventions

- **ID:** `AREA-NN`. The areas are listed below. IDs are permanent, so a removed case keeps its number, marked _retired_.
- **Priority:**
  - **P0:** the prototype is useless for review without it (a crash, a wrong answer key, lost marks, an export that fails). Blocks a reviewer build.
  - **P1:** a feature works wrongly or is missing, but there's a workaround.
  - **P2:** polish or rare edge cases.
- **Type:**
  - **U:** Jest unit test (`__tests__/*.test.ts`).
  - **C:** Jest component test with React Native Testing Library (`__tests__/*.test.tsx`).
  - **E:** Maestro end-to-end flow on Android in Expo Go (`.maestro/*.yaml`).
  - **M:** manual check.
- **Automated by:** the test file or flow that checks the case. Several cases share one flow when they run in one pass.
- **Test data:** the bundled `mechanics-20` pack (spec 0.5): 91 items, 18 skills.
- **Preconditions:** "Fresh" means Expo Go's data is cleared, so no progress, no marks, reviewer mode on, English off and no reviewer name. Unless a case says otherwise, Today's first 10 items are:
  1. `c001` (L1)
  2. `c002` (L2 true/false, 2 options)
  3. `t01` (L4 template)
  4. `c003`
  5. `t02`
  6. `c004`
  7. `c005`
  8. `c006` (picture options)
  9. `c007`
  10. `t03` (F44 figure)

  For `c001`, option A ("0") is wrong and option B is correct.

| Area | Covers |
|---|---|
| HOME | Today tab |
| SES | Session player, all item types |
| FB | Answer feedback, mistake message, explanation |
| LANG | Sinhala / English display |
| DONE | Session done screen |
| LRN | Learn tab, skill screen, play from an item |
| PRG | Progress tab and settings |
| REV | Reviewer mode and review marks |
| EXP | Export |
| PER | Persistence |
| BLD | Content build script |
| MRG | Merge script |
| SI | Sinhala rendering |
| DS | Dawn design rules |
| EDGE | Edge cases |
| ENV | Offline, small screens, platforms |

## Feature inventory

| Screen / function | What it does | Cases |
|---|---|---|
| Today tab | Greeting, streak (sun), Today card (first skill of the next 10 items, Start), Teacher review card (Reviewed X of N, Review next 10, Send results), week bars, unit Sigiriya | HOME |
| Session player | Plays a queue: L1/L2 cards, true/false cards, L3 scenarios, L4 templates (numeric, F41 expressions), statement banks (F42), F44 engine figures, picture options (F15/F23), constants chip, progress bar, counter, close | SES |
| Feedback sheet | Correct / mistake group label, mistake message (option `detail`, else the tag's student message), explanation, Continue / Finish, Review | FB |
| EN toggle | English under the Sinhala, in sessions (chip) and app-wide (Progress) | LANG |
| Session done | Sunrise and streak, skill progress, score, review progress, Sigiriya, "Done for today" and "5 more" | DONE |
| Learn | Units → skills (Sinhala names, counts, status rings) → items (layer, form, stem preview, id, review badge) → play from an item to the end of the skill | LRN |
| Progress | Answer stats, review stats, reviewer name, Send results / Send as text, Reviewer mode and Show English switches, Reset student progress | PRG, EXP |
| Reviewer mode | Item meta line, option letters and tags, Review button (header and sheet), example stepping for templates and banks, review panel | REV |
| Review panel | Name (first time), OK / Wrong physics / Bad Sinhala / Bad distractor (option picks) / Other, note, Save / Cancel / Clear mark | REV |
| Export | JSON file through the share sheet, or the same JSON as text | EXP |
| Persistence | Settings, progress and marks in AsyncStorage | PER |
| `scripts/build-content.mjs` | Content packs → `assets/content` | BLD |
| `scripts/merge-review.mjs` | Exports → `content/samples/<pack>/review-results.json` | MRG |

## Test cases

### HOME: Today tab

| ID | Pri | Type | Preconditions | Steps | Expected | Automated by |
|---|---|---|---|---|---|---|
| HOME-01 | P0 | E | Fresh | Open the app | Today tab shows "Good morning/afternoon/evening", the Today card with a Sinhala skill name, "Start", the tab bar Today / Learn / Progress | `01-session-feedback` |
| HOME-02 | P0 | E | Fresh | Look at the Teacher review card | "Reviewed 0 of 91" | `02-review-mark` |
| HOME-03 | P1 | C | Store with 2 marked items | Render Today | "Reviewed 2 of 91" | `screens.test.tsx` |
| HOME-04 | P1 | E | Fresh | Finish a Today session, return home | Streak shows 1, "1 of 7 days", today's bar outlined in yellow | `05-session-complete` |
| HOME-05 | P1 | C | Reviewer mode off | Render Today | No Teacher review card | `screens.test.tsx` |
| HOME-06 | P1 | U | Cursor at 0 | Build the Today queue | Items 1–10 in play order; the card names the first item's skill | `session-logic.test.ts` |
| HOME-07 | P2 | M | Some mastered skills | Look at the Sigiriya | Indigo line drawn over the dashed outline in proportion to mastered skills | — |
| HOME-08 | P1 | E | Fresh | Tap "Send results" on the Today card | Opens the Progress tab | `12-export-guards` |

### SES: Session player

| ID | Pri | Type | Preconditions | Steps | Expected | Automated by |
|---|---|---|---|---|---|---|
| SES-01 | P0 | E | Fresh | Today → Start | Session opens on `c001`, counter "1 / 10", layer "Recall", Sinhala stem, 4 options | `01-session-feedback` |
| SES-02 | P0 | E | In a session | Answer and tap Continue through all 10 | Counter advances; the last button reads "Finish" and opens Session done | `05-session-complete` |
| SES-03 | P1 | E | Fresh | Learn → `c002` (true/false) | Exactly 2 options (සත්‍ය / අසත්‍ය) | `06-item-types` |
| SES-04 | P0 | E | Fresh | Learn → `p01-01` (L3 scenario) | Layer label "Which method?", 4 options, answerable | `06-item-types` |
| SES-05 | P0 | E | Fresh | Learn → `t01` (L4 template) | Layer "Problem", 5 numeric options, item meta shows "Example 1 of 3 (v1)" | `07-template-variants` |
| SES-06 | P1 | E | On `t01`, reviewer mode | Tap › then ‹ | Meta reads "Example 2 of 3 (v56)", then back to 1; options change; any answer is cleared | `07-template-variants` |
| SES-07 | P1 | C | On a template | Step to another example | Stem changes to that variant's prompt | `session-player.test.tsx` |
| SES-08 | P0 | E | Fresh | Learn → `b01` (statement bank) | Stem shows lines A:, B:, C:, then the question; 5 Sinhala options (e.g. "A පමණි") | `06-item-types` |
| SES-09 | P0 | E | Fresh | Learn → `t03` (F44) | Figure card with the v–t graph; constants chip "g = 10 m s⁻²" | `06-item-types` |
| SES-10 | P1 | U | — | Draw every F44 variant | Every variant draws an SVG; the review doc's examples match `validate.py` byte for byte | `content.test.ts` |
| SES-11 | P0 | E | Fresh | Learn → `c006` (F15) | 4 picture options in a 2-column grid, each with a graph and a Sinhala caption | `06-item-types` |
| SES-12 | P1 | E | In a session | Tap ✕ | Back to the previous screen; answers given so far are kept | `15-resume-after-kill` |
| SES-13 | P1 | C | Answered | Tap another option | Nothing changes (the answer is locked) | `session-player.test.tsx` |
| SES-14 | P2 | M | Long stems (banks, F41) | Scroll | Whole stem and all options reachable above the feedback sheet | — |

### FB: Feedback

| ID | Pri | Type | Preconditions | Steps | Expected | Automated by |
|---|---|---|---|---|---|---|
| FB-01 | P0 | E/C | On `c001` | Tap option A (wrong) | Option A terracotta, option B green with ✓, sheet titled "Concept trap" (group of `recall-gap`) | `01-session-feedback`, `session.test.tsx` |
| FB-02 | P0 | C | On `c001` | Tap a wrong option | Tag's student message shown, plus the Sinhala explanation | `session.test.tsx` |
| FB-03 | P0 | C | Item with an option `detail` | Tap that option | The `detail` text is shown instead of the tag message | `session-logic.test.ts` (`mistakeMessage`) |
| FB-04 | P0 | E/C | On `c001` | Tap option B (correct) | Sheet titled "Correct" in green, explanation shown, no mistake message | `05-session-complete`, `session-player.test.tsx` |
| FB-05 | P1 | C | Reviewer mode on, tag with no Sinhala | Answer wrongly | Small note "Tag message has no Sinhala yet" | `session-player.test.tsx` |
| FB-06 | P1 | C | Reviewer mode on, answered | Look at options | Each wrong option shows its tag under the text | `session-player.test.tsx` |
| FB-07 | P1 | U | — | `mistakeMessage` for an unknown tag or a correct option | Returns null; the sheet falls back to "Not quite" | `session-logic.test.ts` |

### LANG: Sinhala and English

| ID | Pri | Type | Preconditions | Steps | Expected | Automated by |
|---|---|---|---|---|---|---|
| LANG-01 | P0 | E | Fresh | Open a session | Stem, options, explanation and skill names in Sinhala; UI words (Start, Continue, Review, Recall) in English | `01-session-feedback` |
| LANG-02 | P1 | E | In a session | Tap EN | The English stem appears under the Sinhala; the chip turns indigo | `01-session-feedback` |
| LANG-03 | P1 | E | Fresh | Progress → Show English on → Learn | English skill names under the Sinhala ones | `09-english-toggle` |
| LANG-04 | P1 | E | English on | Tap EN again in a session | English hidden; the setting persists across screens | `09-english-toggle` |
| LANG-05 | P1 | U | — | Check the pack | Every stem, option and explanation has `si`, and it equals the `si.tsv` entry when one exists | `content.test.ts` |

### DONE: Session done

| ID | Pri | Type | Preconditions | Steps | Expected | Automated by |
|---|---|---|---|---|---|---|
| DONE-01 | P0 | E | Finish 10 items | — | Done screen: streak number in the sun, the first skill's Sinhala name, "N of 10 right" | `05-session-complete` |
| DONE-02 | P1 | E | On Done | Tap "5 more" | A new session of 5 items starting at item 11 (counter "1 / 5", `c008`) | `05-session-complete` |
| DONE-03 | P1 | E | On Done | Tap "Done for today" | Back on Today | `05-session-complete` |
| DONE-04 | P1 | C | Reviewer mode on | On Done | "Review progress · Reviewed X of 91" card | `screens.test.tsx` |
| DONE-05 | P1 | C | — | Render Done | "Done for today" and "5 more" are both secondary (outlined) buttons of equal size | `screens.test.tsx` |
| DONE-06 | P2 | M | Reduced motion on | Reach Done | The sun does not animate | — |

### LRN: Learn

| ID | Pri | Type | Preconditions | Steps | Expected | Automated by |
|---|---|---|---|---|---|---|
| LRN-01 | P0 | E | Fresh | Tap Learn | "යාන්ත්‍ර විද්‍යාව", 18 skills in Sinhala with "N items · reviewed 0" | `06-item-types` |
| LRN-02 | P0 | E | Fresh | Tap a skill | Skill screen lists its items with layer, form and stem preview; Back returns | `06-item-types` |
| LRN-03 | P0 | E | On a skill | Tap an item | The session starts at that item and plays to the end of the skill (e.g. `t01` → "1 / 1") | `07-template-variants` |
| LRN-04 | P1 | E | `c001` marked | Learn → first skill | "reviewed 1"; the item shows the terracotta "!" (issues) or green ✓ (OK) badge | `10-review-edit-clear` |
| LRN-05 | P1 | C | Reviewer mode off | Learn | Rows show "N questions · M right" instead of review counts | `screens.test.tsx` |
| LRN-06 | P1 | E | Fresh | Learn → last skill → last item `b02` | Counter "1 / 1", button "Finish", Done opens | `16-last-item` |

### PRG: Progress and settings

| ID | Pri | Type | Preconditions | Steps | Expected | Automated by |
|---|---|---|---|---|---|---|
| PRG-01 | P1 | E | Fresh | Tap Progress | "0 questions answered · 0 right", "Reviewed 0 of 91", "0 with issues", pack line "mechanics-20 · spec 0.5 · draft…" | `12-export-guards` |
| PRG-02 | P0 | E | Fresh | Switch Reviewer mode off | Today hides the review card; sessions hide item ids, letters and Review | `08-reviewer-mode-off` |
| PRG-03 | P1 | E | Reviewer mode off | Switch it on | Review controls come back | `08-reviewer-mode-off` |
| PRG-04 | P1 | E | — | Edit "Your name" | The name is used by the next mark and the export file name | `13-send-as-text` |
| PRG-05 | P2 | C | Answers given | Tap "Reset student progress" | Answers, streak and cursor reset; review marks kept | `screens.test.tsx` |

### REV: Reviewer mode and marks

| ID | Pri | Type | Preconditions | Steps | Expected | Automated by |
|---|---|---|---|---|---|---|
| REV-01 | P0 | E | Fresh, in a session | Tap Review (header) before answering | Review panel opens with id, layer, form and version, a name field, verdict chips and a note | `02-review-mark` |
| REV-02 | P0 | E/C | Panel open | Name, Bad distractor, option A, note, Save | Panel closes; header "Reviewed · issues"; stored with `issues: ["bad-distractor"]`, the distractor's letter, index, text and tag, and the note | `02-review-mark`, `session.test.tsx` |
| REV-03 | P0 | E | Answered next item | Review (sheet) → OK → Save | Header "Reviewed · OK"; Today "Reviewed 2 of 91" | `02-review-mark` |
| REV-04 | P1 | C | Panel open | Wrong physics + Bad Sinhala + Other together | All three saved in `issues` | `review-panel.test.tsx` |
| REV-05 | P1 | C | Panel open | Tap OK, then an issue | OK turns off; tapping OK again clears the issues | `review-panel.test.tsx` |
| REV-06 | P0 | E/C | Panel open, no verdict | Tap Save | Nothing saved; the panel stays open | `11-review-validation`, `review-panel.test.tsx` |
| REV-07 | P1 | E/C | Bad distractor, no option picked | Tap Save | Not saved | `11-review-validation`, `review-panel.test.tsx` |
| REV-08 | P1 | C | Bad distractor | Look at the options | The correct option is disabled ("correct answer"); several wrong ones can be picked | `review-panel.test.tsx` |
| REV-09 | P1 | E | Fresh, panel open | Leave the name empty, pick OK | Save stays disabled until a name is typed | `11-review-validation` |
| REV-10 | P1 | E | Item marked OK | Edit review → Bad Sinhala + note → Save | Header turns "Reviewed · issues"; the count stays 1 | `10-review-edit-clear` |
| REV-11 | P1 | E | Item marked | Edit review → Clear mark | Header back to "Review"; count back to 0 | `10-review-edit-clear` |
| REV-12 | P1 | E | Template | Mark example 1, step to example 2 | Example 2 shows "Review" (unmarked); marks are per variant; the item counts once | `07-template-variants` |
| REV-13 | P1 | E | `c001` marked | Today → Review next 10 | The session skips reviewed items (starts at `c002`) | `17-review-next-skips` |
| REV-14 | P2 | C | Name already set | Open panel | No name field | `review-panel.test.tsx` |
| REV-15 | P1 | C | Panel open | Cancel | Nothing saved | `review-panel.test.tsx` |

### EXP: Export

| ID | Pri | Type | Preconditions | Steps | Expected | Automated by |
|---|---|---|---|---|---|---|
| EXP-01 | P0 | E | 1+ marks, name set | Progress → Send results | Android share sheet "Sharing 1 file" with `unikey-review-<name>-<date>.json` | `03-send-results` |
| EXP-02 | P0 | U | — | Build the export | `format`, `exported_at`, `reviewer`, `app_version`, `packs[]`, and `results[]` with every README field | `export.test.ts` |
| EXP-03 | P1 | E | Marks, name | Send as text | Share sheet opens with the JSON as a message | `13-send-as-text` |
| EXP-04 | P1 | E | Fresh (no name) | Send results | Alert "Add your name first" | `12-export-guards` |
| EXP-05 | P1 | E | Name, no marks | Send results | Alert "Nothing to send yet" | `12-export-guards` |
| EXP-06 | P1 | U | — | Export file name | Lower-case, dashes, timestamp, `.json` | `export.test.ts` |
| EXP-07 | P2 | M | Real phone with WhatsApp | Send results → WhatsApp | File arrives as a document and opens as JSON | — |

### PER: Persistence

| ID | Pri | Type | Preconditions | Steps | Expected | Automated by |
|---|---|---|---|---|---|---|
| PER-01 | P0 | E | Mark 1 item, set a name | Kill the app, reopen | "Reviewed 1 of 91", name kept, the mark visible on the item | `04-persistence` |
| PER-02 | P1 | E | English on, reviewer mode on | Restart | Settings kept | `04-persistence` |
| PER-03 | P1 | C | AsyncStorage holds a saved state | Mount the store | The state is loaded, with missing keys defaulted | `store.test.tsx` |
| PER-04 | P2 | C | AsyncStorage holds bad JSON | Mount the store | App starts with defaults, no crash | `store.test.tsx` |

### BLD: Content build script

| ID | Pri | Type | Preconditions | Steps | Expected | Automated by |
|---|---|---|---|---|---|---|
| BLD-01 | P0 | U | — | Build | Every card, scenario, template, bank and skill present; counts match `items.json` / `variants.json` | `content.test.ts` |
| BLD-02 | P0 | U | — | Build twice | Same option order (fixed seed); the bundled pack matches | `scripts.test.ts` |
| BLD-03 | P1 | U | — | Build | The correct answer is in at least 3 different positions across cards | `scripts.test.ts` |
| BLD-04 | P1 | U | — | Build | Card figures equal their SVG files | `content.test.ts` |
| BLD-05 | P1 | U | — | Build | 70 error tags parsed from spec §7, each with group and message | `scripts.test.ts` |
| BLD-06 | P1 | U | — | Build | Items grouped by skill in `items.json` order, then by layer | `content.test.ts` |
| BLD-07 | P2 | U | — | `--out <dir>` | Writes there, not to `assets/content` | `scripts.test.ts` |

### MRG: Merge script

| ID | Pri | Type | Preconditions | Steps | Expected | Automated by |
|---|---|---|---|---|---|---|
| MRG-01 | P0 | U | — | Merge an export twice | No duplicates | `scripts.test.ts` |
| MRG-02 | P0 | U | — | Merge a newer mark for the same item, variant and reviewer | Replaces the old one; another reviewer adds a row | `scripts.test.ts` |
| MRG-03 | P1 | U | — | Merge an older export again | Nothing changes | `scripts.test.ts` |
| MRG-04 | P1 | U | — | A non-export file | Exits with an error | `scripts.test.ts` |
| MRG-05 | P1 | U | — | `--dry-run` | Nothing written | `scripts.test.ts` |
| MRG-06 | P1 | U | — | A result with an unknown pack or missing fields | Skipped with a warning; the others are merged | `scripts.test.ts` |
| MRG-07 | P1 | U | — | Summary | `reviewers`, `items_reviewed`, `items_with_issues` correct | `scripts.test.ts` |

### SI: Sinhala rendering

| ID | Pri | Type | Preconditions | Steps | Expected | Automated by |
|---|---|---|---|---|---|---|
| SI-01 | P0 | C | — | Render mixed text "6 N සහ 2 N" | Sinhala runs use Noto Sans Sinhala; digits and Latin stay in Geist | `txt.test.tsx` |
| SI-02 | P1 | C | — | Render a Sinhala line | Line height 1.6× (vs 1.3× Latin); headings ≥ 20 px shrink to 92% | `txt.test.tsx` |
| SI-03 | P1 | C | — | Text with ZWJ conjuncts (ශ්‍ය, ප්‍ර) | ZWJ stays inside the Sinhala run, not split into Geist | `txt.test.tsx` |
| SI-04 | P0 | E/M | Android | Screenshots of the session, Today, Learn and bank | No tofu boxes, no broken conjuncts (ප්‍ර, ක්‍රි, ත්‍ය); checked by eye | `01`, `06`, screenshots |
| SI-05 | P2 | M | Low-end phone | Long Sinhala stems | No clipped descenders or overlapping lines | — |

### DS: Dawn design rules

| ID | Pri | Type | Preconditions | Steps | Expected | Automated by |
|---|---|---|---|---|---|---|
| DS-01 | P1 | C | Answered | Check styles | Correct = green `#23694D` family, wrong = terracotta `#C4693F` family, progress = lavender, main action = yellow `#F6C453` with indigo text | `session-player.test.tsx` |
| DS-02 | P1 | C | Done | Buttons | "Done for today" and "5 more" equal weight (DONE-05) | `screens.test.tsx` |
| DS-03 | P2 | M | — | Compare with the V3a-Light mock-ups | Sky gradient, white cards with hairline borders, pill tab bar, sun motif | screenshots |
| DS-04 | P2 | M | — | Yellow use | Yellow only as fills behind indigo text, never as text on white | screenshots |

### UNIT: Several units (added 2026-11-09)

Three packs are bundled: `mechanics-20` (91), `thermal-physics-20` (68) and `current-electricity-20` (82), 241 items in all. One unit pick drives Today, Learn and the review queue.

| ID | Pri | Type | Preconditions | Steps | Expected | Automated by |
|---|---|---|---|---|---|---|
| UNIT-01 | P0 | U | — | Build a Today queue for a unit | Only that unit's items, from that unit's cursor | `units.test.tsx` |
| UNIT-02 | P1 | U | First Electricity item reviewed | Build the review queue for Electricity | Skips it; no items from other units | `units.test.tsx` |
| UNIT-03 | P0 | E/C | Fresh | Today shows three unit chips (Sinhala); tap Thermal Physics | Chip selected; Today card shows a Thermal skill; review count "Reviewed 0 of 68" | `18-unit-switch`, `units.test.tsx` |
| UNIT-04 | P0 | E/C | 1 Mechanics mark | Look at the Teacher review card | Unit count plus "all units: 1 of 241"; Review next 10 opens the picked unit | `18-unit-switch`, `units.test.tsx` |
| UNIT-05 | P0 | E/C | — | Learn → tap a unit chip | Only that unit's skills are listed; the pick is shared with Today | `18-unit-switch`, `units.test.tsx` |
| UNIT-06 | P0 | E/C | Thermal picked | Start Today | Plays `phy.therm.c001` onwards; the Mechanics cursor is untouched | `18-unit-switch`, `units.test.tsx` |
| UNIT-07 | P1 | C | — | Answer in two units | Separate Today cursors per unit | `units.test.tsx` |
| UNIT-08 | P1 | C | Reviewer mode | Answer wrongly with a proposed Thermal/Electricity tag | Its message shows, with the note "Proposed tag (…), not yet approved" | `units.test.tsx` |
| UNIT-09 | P1 | E/C | Marks in two units | Progress | Total "Reviewed X of 241" and one row per unit | `18-unit-switch`, `screens.test.tsx` |
| UNIT-10 | P1 | U | — | Content tests | Each pack matches its source (items, variants, Sinhala, figures, skill order); every used tag has a message | `content.test.ts` |
| UNIT-11 | P1 | C | Saved state from before units (`progress.cursor`) | Mount the store | The cursor moves to Mechanics (PER-05) | `store.test.tsx` |
| UNIT-12 | P2 | M | 720×1280 | Today with three chips | Chips wrap onto a second line; none clipped | screenshot |

### GRF: Skill-graph screens (added 2026-11-11)

Designs from the skill-graph canvas: D (Today trail), A (Progress rings then chips), C (skill detail) with R ("stands on") and T (best lever) as single lines.

| ID | Pri | Type | Preconditions | Steps | Expected | Automated by |
|---|---|---|---|---|---|---|
| GRF-01 | P0 | U | — | Build content | Each pack bundles its unit graph: same skills and topics as `graph.json`, exam weights sum to 1, sample skills keep Sinhala names | `graph.test.tsx` |
| GRF-02 | P1 | U | — | Graph queries | requires edges walk both ways; "stands on" is the transitive set without duplicates; confusable works from either end; names fall back to English | `graph.test.tsx` |
| GRF-03 | P0 | U | — | Answer items of a skill | State goes new → practising → mastered; a wrong last answer makes it refresh; readiness is exam-weighted | `graph.test.tsx` |
| GRF-04 | P0 | U | — | Build today's trail | Stops follow the queue's skills; refresh tags; a missing prerequisite with questions is suggested first; the lever is the skill most others stand on | `graph.test.tsx` |
| GRF-05 | P0 | E/C | Fresh | Today | "Your path today" with stops and reasons; Start pinned above the tab bar and reachable with English on; tapping a stop opens skill detail | `19-skill-graph`, `04-persistence`, `graph.test.tsx` |
| GRF-06 | P0 | E/C | — | Skill detail | NEEDS, this skill, OPENS, stands-on count, past-paper count; Start plays the skill; a skill with no questions says so | `19-skill-graph`, `graph.test.tsx` |
| GRF-07 | P1 | E/C | Reviewer mode off | Progress | Readiness, a ring per topic; tapping a ring lists its chips by subtopic; a chip opens skill detail | `19-skill-graph`, `graph.test.tsx` |
| GRF-08 | P2 | M | — | Compare with the canvas (D, A, C, R, T) | Layout and colour meaning match; judged by eye | screenshots |

### EDGE: Edge cases

| ID | Pri | Type | Preconditions | Steps | Expected | Automated by |
|---|---|---|---|---|---|---|
| EDGE-01 | P1 | E | Fresh | Progress with no marks, no name | Counts 0; Send shows a guard alert, no crash | `12-export-guards` |
| EDGE-02 | P1 | E | Answered 3 Today items | Kill the app, reopen, Start | Today resumes at item 4 (`c003`), not item 1 | `15-resume-after-kill` |
| EDGE-03 | P1 | U | Cursor near the end (88) | Build Today | Wraps around to item 1 after item 91 | `session-logic.test.ts` |
| EDGE-04 | P1 | U | All items reviewed | Build the review queue | Empty; the Today button says "All reviewed" and is disabled | `session-logic.test.ts` |
| EDGE-05 | P1 | E | — | Last item of a skill | "Finish" → Done (LRN-06) | `16-last-item` |
| EDGE-06 | P2 | C | — | Session with an empty queue | "Nothing left to play here." and Back | `session-player.test.tsx` |
| EDGE-07 | P1 | E | — | Re-mark and change verdict (REV-10, REV-11) | Count never double-counts | `10-review-edit-clear` |
| EDGE-08 | P2 | U | — | Streak with a gap day | Streak counts only consecutive days; today without answers keeps yesterday's streak | `session-logic.test.ts` |

### ENV: Offline, screens, platforms

| ID | Pri | Type | Preconditions | Steps | Expected | Automated by |
|---|---|---|---|---|---|---|
| ENV-01 | P0 | E | App loaded | Airplane mode on; play, mark and export | Everything works (content, fonts and figures are bundled; no network calls) | `14-offline` |
| ENV-02 | P1 | M | Emulator at 720×1280, 320 dpi | Today, session, review panel | No clipped buttons; review panel scrolls; tab bar doesn't cover content | manual (report) |
| ENV-03 | P2 | M | Web (`npx expo start --web`) | Smoke through Today → session → mark | Works (export downloads a file) | — |
| ENV-04 | P1 | M | EAS preview APK on a real phone | Install, open with no laptop | Works offline from first launch | — |

## Not covered / manual only

These can't be judged by automation, or need hardware or accounts we don't have in CI:

- **Real cheap-phone performance:** start time, scroll smoothness and memory on a 2–3 GB Android phone (DR-0013 revisit trigger: open-to-first-card over 2 s). Needs a real device and a release (APK) build. Expo Go debug builds are slower.
- **Judging how it looks:** whether the Dawn design reads well, whether the Sinhala reads naturally, gradient banding on LCDs, and yellow contrast in sunlight (DS-03, DS-04, SI-05). Screenshots are captured for a person to judge.
- **Share sheet target apps:** that WhatsApp, Gmail or Drive accept the file and the recipient can open it (EXP-07). Automation stops at the system share sheet.
- **Physics and translation correctness:** the content itself is what the teachers review. These tests only check that the app shows the content faithfully.
- **iOS:** not targeted for the pilot (Android first).
- **Accessibility with TalkBack:** labels exist on icon buttons, but no screen-reader pass has been done.
- **Reduced motion** (DONE-06) and **system font scaling** above 130%.
