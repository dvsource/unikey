# UniKey prototype: test report

_Run date: 2026-11-07 to 2026-11-09 · final regression run 2026-11-09 07:34 IST · spec [qa-spec.md](qa-spec.md) v1 · plan [execution-plan.md](execution-plan.md)_

## Addendum 2026-11-09: three units

Thermal Physics (68 items) and Current Electricity (82) were added next to Mechanics (91), with a unit picker, per-unit Today cursors and per-unit review counts.

| Suite | Result |
|---|---|
| Jest | **102 / 102 passed**, 11 suites (new: `units.test.tsx`; `content.test.ts` now checks every pack) |
| Maestro smoke (`npm run test:e2e:smoke`, run 2026-11-09_091422) | **5 / 5 passed** in 7 min 48 s, including the new `18-unit-switch` |
| Flow 12 (count now 241), flow 18 after the chip-wrap change | Passed |

Found and fixed while doing it:
- **BUG-04 (S3, UNIT-12):** the third unit chip was cut off at the screen edge (a horizontal scroll a reviewer could miss). The chips now wrap.
- **Content:** 27 Thermal and Electricity tags are only in `content/tags/*-proposed.md`, so they had no student message. The build now reads those files as proposed tags, and reviewer mode labels them.

The full 18-flow suite was not re-run for this change. Flows 01–17 still run against Mechanics, the default unit.

## Summary

| Suite | Result | Time |
|---|---|---|
| Typecheck (`npx tsc --noEmit`) | Clean | ~10 s |
| Jest unit + component (`npm test`) | **75 / 75 passed**, 10 suites | ~3 s |
| Maestro E2E full (`npm run test:e2e`) | **17 / 17 flows passed** | 12 min 54 s |
| Maestro E2E smoke (`npm run test:e2e:smoke`) | **4 / 4 passed** (after the last subflow change) | 6 min 2 s |
| Small screen (ENV-02): flows 01, 02, 06 at 720×1280, 320 dpi | **3 / 3 passed** | ~4 min |
| Spec cases | **103 / 112 passed, 9 not run (manual), 0 failed.** All 33 P0 cases passed. | — |

**Verdict:** the exit criteria are met for a reviewer build. All P0 and P1 automated cases pass. The open item is the 1 P1 manual case (ENV-04: APK on a real phone).

## Environment

| Item | Value |
|---|---|
| Host | macOS (Apple Silicon), Node 24.14, OpenJDK 21 |
| App | Expo SDK 58.0.23, React Native 0.88.1, Expo Router 58 |
| Device | Android emulator, AVD `Medium_Phone_API_36.1` (API 36, 1080×2400, 420 dpi) |
| Runtime | Expo Go 58.0.5, dev server `npx expo start --port 8081` through `adb reverse` |
| Tools | Maestro CLI 2.12.1 · Jest 30 with jest-expo 58 · React Native Testing Library 14.1 |
| Content | `mechanics-20` pack, spec 0.5, 91 items, 18 skills, 1217 variants |

## Maestro flows (final run, 2026-11-09_073428)

| Flow | Tags | Cases | Result | Time |
|---|---|---|---|---|
| 01-session-feedback | smoke | HOME-01, SES-01, FB-01, LANG-01, LANG-02 | Pass | 14 s |
| 02-review-mark | smoke | HOME-02, REV-01, REV-02, REV-03 | Pass | 58 s |
| 03-send-results | smoke | EXP-01 | Pass | 34 s |
| 04-persistence | smoke | PER-01, PER-02 | Pass | 1 min 9 s |
| 05-session-complete | full | SES-02, FB-04, DONE-01/02/03, HOME-04 | Pass | 1 min 26 s |
| 06-item-types | full | LRN-01/02, SES-03/04/08/09/11, SI-04 | Pass | 1 min 16 s |
| 07-template-variants | full | SES-05/06, LRN-03, REV-12 | Pass | 50 s |
| 08-reviewer-mode-off | full | PRG-02/03, HOME-05 | Pass | 33 s |
| 09-english-toggle | full | LANG-03/04 | Pass | 28 s |
| 10-review-edit-clear | full | REV-10/11, LRN-04, EDGE-07 | Pass | 57 s |
| 11-review-validation | full | REV-06/07/08/09 | Pass | 37 s |
| 12-export-guards | full | HOME-08, PRG-01, EXP-04/05, EDGE-01 | Pass | 29 s |
| 13-send-as-text | full | EXP-03, PRG-04 | Pass | 38 s |
| 14-offline | full | ENV-01 | Pass | 40 s |
| 15-resume-after-kill | full | EDGE-02, SES-12 | Pass | 58 s |
| 16-last-item | full | LRN-06, EDGE-05 | Pass | 38 s |
| 17-review-next-skips | full | REV-13 | Pass | 29 s |

Small-screen runs: `.maestro/output/2026-11-08_084002/` (flows 01 and 02) and `.maestro/output/2026-11-08_084723/` (flow 06).

## Screenshots

From the final run, under `app/.maestro/output/2026-11-09_073428/<flow>/takeScreenshot/` (git-ignored; re-create them with `npm run test:e2e`):

| Screen | File |
|---|---|
| Today (Sinhala skill, review card) | `Session: wrong answer feedback and EN/…/home.png` |
| Session, Sinhala stem and options (SI-04) | `…/session-sinhala.png` |
| Wrong-answer feedback with mistake message | `…/session-feedback.png` |
| EN toggle on | `…/session-english.png` |
| Learn list and skill items | `Item types…/…/learn.png`, `skill-items.png` |
| Picture options (F15) | `…/picture-options.png` |
| F44 template with figure and constants | `…/template-figure.png` |
| Statement bank (F42) | `…/statement-bank.png` |
| L3 scenario feedback | `…/scenario-l3.png` |
| Template example 2 of 3 | `Template…/…/template-example-2.png` |
| Review panel, Bad distractor + note | `Review: bad distractor…/…/review-panel.png` |
| Review validation | `Review: Save needs…/…/review-validation.png` |
| Learn badge after a mark | `Review: change verdict…/…/skill-with-badge.png` |
| Session done (sunrise) | `Session: play 10…/…/session-done.png` |
| Today after a session (streak, bars) | `…/home-after-session.png` |
| Student mode (reviewer off) | `Settings: reviewer mode…/…/home-student-mode.png`, `session-student-mode.png` |
| English skill names | `Settings: Show English…/…/learn-english.png` |
| Progress | `Export guards…/…/progress.png` |
| Share sheet (file / text / offline) | `share-sheet.png`, `share-text.png`, `offline-share.png` |

**SI-04 check by eye:** the session, bank, Learn and feedback screenshots show Sinhala in Noto Sans Sinhala. Conjuncts are joined (ප්‍ර, ක්‍රි, ත්‍ය, ත්ව), there are no tofu boxes, and numbers and Latin are in Geist.

## Bugs found

| ID | Sev | Found by | Summary | Steps to reproduce (fresh install) | Status |
|---|---|---|---|---|---|
| BUG-01 | S2 | EDGE-02 | Killing the app mid-session replayed the same 10 Today items, because the cursor only moved at the end of the session | Today → Start → answer 3 → kill the app → reopen → Start: it began at item 1 again (expected item 4) | **Fixed:** in `src/app/session.tsx`, Today's cursor advances with each answer. Covered by `session-player.test.tsx` and flow 15. |
| BUG-02 | S3 | EXP-06 | A Sinhala reviewer name (no Latin letters) made the export file `unikey-review--<date>.json` | Set the name to "නිමාලි" → Send results | **Fixed:** in `src/state/exportReviews.ts`, the slug falls back to "reviewer" (the real name is still inside the file). Covered by `export.test.ts`. |
| BUG-03 | S2 | SES-11 | On picture-option cards (`c006`, `c018`, `c028`, `c032`) tapping the drawing did nothing; only the caption text responded, because the SVG took the touch | Learn → Graph skill → `c006` → tap the middle of a graph | **Fixed:** in `src/components/ui.tsx`, `Figure` has `pointerEvents: "none"`. Covered by flows 05 and 06, which tap the middle of the option. See the note below. |

**Note on BUG-03:** after the fix, flows 05 and 06 passed in 3 of 4 runs. The one failure (2026-11-08_215942) came in a run where the host had stalled: later flows in that run took 15–46 min each. Both flows passed in the clean final run. Re-check on a real phone (ENV-04) before the pilot build.

## Test-infrastructure issues (fixed, not app bugs)

| Issue | Fix |
|---|---|
| Expo Go's developer menu covers the app after `clearState` and hides its elements | `subflows/launch.yaml` waits for it and presses Back. Detection uses "Go home", which is on screen at every size; "Fast Refresh" was below the fold on small screens. |
| `openLink` after `stopApp` left the launcher in front | `subflows/relaunch.yaml` runs `launchApp` first |
| The Progress switches sat under the floating tab bar, so taps hit the bar | `scrollUntilVisible` with `centerElement` before tapping |
| The skill screen's Back button scrolls off-screen on long lists | Subflows press hardware Back whenever the tab bar isn't visible |
| On small screens, the review panel's note and Save, and the 5th option, are below the fold | `scrollUntilVisible` before those steps (the content is reachable by scrolling, so it's not an app bug) |
| Back closes the review panel while the keyboard is open | Enter closes the keyboard (`submitBehavior="blurAndSubmit"` on the note field); flows use `pressKey: Enter` |
| YAML quoting error in flow 17's name | Fixed |
| Maestro 2.x writes screenshots under `--test-output-dir`, not the working folder | `test:e2e` scripts write to `.maestro/output/` (git-ignored) |
| The host sleeping mid-run stalled the emulator; a stale Metro left Expo Go on its splash screen | Run under `caffeinate -i` and restart Metro if Expo Go hangs on its splash screen (added to the execution plan) |

## Not fixed / open

- **ENV-04 (P1, manual):** EAS preview APK on a real low-end phone, offline from first launch. Not run; needs a device and an EAS build. This also covers cheap-phone performance and the BUG-03 re-check.
- **Manual P2 cases not run:** HOME-07, SES-14, DONE-06, EXP-07 (WhatsApp delivery), SI-05, DS-03, DS-04, ENV-03 (web). See "Not covered" in the spec.
- **Known gap, not a bug:** the tag student messages (spec §7) have no Sinhala yet, so they show in English. Reviewer mode notes this (FB-05).
- **Design note:** "5 more" after a Learn (skill) session starts Today's queue, not more of that skill. That's acceptable for the prototype; revisit with the scheduler.

## Results by case

Generated from each flow's `# Cases:` header, the spec's "Automated by" column and the final run. U/C cases pass with the green Jest run.

| Case | Pri | Type | Result | Evidence |
|---|---|---|---|---|
| HOME-01 | P0 | E | Pass | `01-session-feedback` (14s) |
| HOME-02 | P0 | E | Pass | `02-review-mark` (58s) |
| HOME-03 | P1 | C | Pass | screens.test.tsx |
| HOME-04 | P1 | E | Pass | `05-session-complete` (1m 26s) |
| HOME-05 | P1 | C | Pass | screens.test.tsx |
| HOME-06 | P1 | U | Pass | session-logic.test.ts |
| HOME-07 | P2 | M | Not run | manual |
| HOME-08 | P1 | E | Pass | `12-export-guards` (29s) |
| SES-01 | P0 | E | Pass | `01-session-feedback` (14s) |
| SES-02 | P0 | E | Pass | `05-session-complete` (1m 26s) |
| SES-03 | P1 | E | Pass | `06-item-types` (1m 16s) |
| SES-04 | P0 | E | Pass | `06-item-types` (1m 16s) |
| SES-05 | P0 | E | Pass | `07-template-variants` (50s) |
| SES-06 | P1 | E | Pass | `07-template-variants` (50s) |
| SES-07 | P1 | C | Pass | session-player.test.tsx |
| SES-08 | P0 | E | Pass | `06-item-types` (1m 16s) |
| SES-09 | P0 | E | Pass | `06-item-types` (1m 16s) |
| SES-10 | P1 | U | Pass | content.test.ts |
| SES-11 | P0 | E | Pass | `06-item-types` (1m 16s) |
| SES-12 | P1 | E | Pass | `15-resume-after-kill` (58s) |
| SES-13 | P1 | C | Pass | session-player.test.tsx |
| SES-14 | P2 | M | Not run | manual |
| FB-01 | P0 | E/C | Pass | session.test.tsx, `01-session-feedback` (14s) |
| FB-02 | P0 | C | Pass | session.test.tsx |
| FB-03 | P0 | C | Pass | session-logic.test.ts |
| FB-04 | P0 | E/C | Pass | session-player.test.tsx, `05-session-complete` (1m 26s) |
| FB-05 | P1 | C | Pass | session-player.test.tsx |
| FB-06 | P1 | C | Pass | session-player.test.tsx |
| FB-07 | P1 | U | Pass | session-logic.test.ts |
| LANG-01 | P0 | E | Pass | `01-session-feedback` (14s) |
| LANG-02 | P1 | E | Pass | `01-session-feedback` (14s) |
| LANG-03 | P1 | E | Pass | `09-english-toggle` (28s) |
| LANG-04 | P1 | E | Pass | `09-english-toggle` (28s) |
| LANG-05 | P1 | U | Pass | content.test.ts |
| DONE-01 | P0 | E | Pass | `05-session-complete` (1m 26s) |
| DONE-02 | P1 | E | Pass | `05-session-complete` (1m 26s) |
| DONE-03 | P1 | E | Pass | `05-session-complete` (1m 26s) |
| DONE-04 | P1 | C | Pass | screens.test.tsx |
| DONE-05 | P1 | C | Pass | screens.test.tsx |
| DONE-06 | P2 | M | Not run | manual |
| LRN-01 | P0 | E | Pass | `06-item-types` (1m 16s) |
| LRN-02 | P0 | E | Pass | `06-item-types` (1m 16s) |
| LRN-03 | P0 | E | Pass | `07-template-variants` (50s) |
| LRN-04 | P1 | E | Pass | `10-review-edit-clear` (57s) |
| LRN-05 | P1 | C | Pass | screens.test.tsx |
| LRN-06 | P1 | E | Pass | `16-last-item` (38s) |
| PRG-01 | P1 | E | Pass | `12-export-guards` (29s) |
| PRG-02 | P0 | E | Pass | `08-reviewer-mode-off` (33s) |
| PRG-03 | P1 | E | Pass | `08-reviewer-mode-off` (33s) |
| PRG-04 | P1 | E | Pass | `13-send-as-text` (38s) |
| PRG-05 | P2 | C | Pass | screens.test.tsx |
| REV-01 | P0 | E | Pass | `02-review-mark` (58s) |
| REV-02 | P0 | E/C | Pass | session.test.tsx, `02-review-mark` (58s) |
| REV-03 | P0 | E | Pass | `02-review-mark` (58s) |
| REV-04 | P1 | C | Pass | review-panel.test.tsx |
| REV-05 | P1 | C | Pass | review-panel.test.tsx |
| REV-06 | P0 | E/C | Pass | review-panel.test.tsx, `11-review-validation` (37s) |
| REV-07 | P1 | E/C | Pass | review-panel.test.tsx, `11-review-validation` (37s) |
| REV-08 | P1 | C | Pass | review-panel.test.tsx |
| REV-09 | P1 | E | Pass | `11-review-validation` (37s) |
| REV-10 | P1 | E | Pass | `10-review-edit-clear` (57s) |
| REV-11 | P1 | E | Pass | `10-review-edit-clear` (57s) |
| REV-12 | P1 | E | Pass | `07-template-variants` (50s) |
| REV-13 | P1 | E | Pass | `17-review-next-skips` (29s) |
| REV-14 | P2 | C | Pass | review-panel.test.tsx |
| REV-15 | P1 | C | Pass | review-panel.test.tsx |
| EXP-01 | P0 | E | Pass | `03-send-results` (34s) |
| EXP-02 | P0 | U | Pass | export.test.ts |
| EXP-03 | P1 | E | Pass | `13-send-as-text` (38s) |
| EXP-04 | P1 | E | Pass | `12-export-guards` (29s) |
| EXP-05 | P1 | E | Pass | `12-export-guards` (29s) |
| EXP-06 | P1 | U | Pass | export.test.ts |
| EXP-07 | P2 | M | Not run | manual |
| PER-01 | P0 | E | Pass | `04-persistence` (1m 9s) |
| PER-02 | P1 | E | Pass | `04-persistence` (1m 9s) |
| PER-03 | P1 | C | Pass | store.test.tsx |
| PER-04 | P2 | C | Pass | store.test.tsx |
| BLD-01 | P0 | U | Pass | content.test.ts |
| BLD-02 | P0 | U | Pass | scripts.test.ts |
| BLD-03 | P1 | U | Pass | scripts.test.ts |
| BLD-04 | P1 | U | Pass | content.test.ts |
| BLD-05 | P1 | U | Pass | scripts.test.ts |
| BLD-06 | P1 | U | Pass | content.test.ts |
| BLD-07 | P2 | U | Pass | scripts.test.ts |
| MRG-01 | P0 | U | Pass | scripts.test.ts |
| MRG-02 | P0 | U | Pass | scripts.test.ts |
| MRG-03 | P1 | U | Pass | scripts.test.ts |
| MRG-04 | P1 | U | Pass | scripts.test.ts |
| MRG-05 | P1 | U | Pass | scripts.test.ts |
| MRG-06 | P1 | U | Pass | scripts.test.ts |
| MRG-07 | P1 | U | Pass | scripts.test.ts |
| SI-01 | P0 | C | Pass | txt.test.tsx |
| SI-02 | P1 | C | Pass | txt.test.tsx |
| SI-03 | P1 | C | Pass | txt.test.tsx |
| SI-04 | P0 | E/M | Pass | `06-item-types` (1m 16s), + screenshots checked by eye |
| SI-05 | P2 | M | Not run | manual |
| DS-01 | P1 | C | Pass | session-player.test.tsx |
| DS-02 | P1 | C | Pass | screens.test.tsx |
| DS-03 | P2 | M | Not run | manual |
| DS-04 | P2 | M | Not run | manual |
| EDGE-01 | P1 | E | Pass | `12-export-guards` (29s) |
| EDGE-02 | P1 | E | Pass | `15-resume-after-kill` (58s) |
| EDGE-03 | P1 | U | Pass | session-logic.test.ts |
| EDGE-04 | P1 | U | Pass | session-logic.test.ts |
| EDGE-05 | P1 | E | Pass | `16-last-item` (38s) |
| EDGE-06 | P2 | C | Pass | session-player.test.tsx |
| EDGE-07 | P1 | E | Pass | `10-review-edit-clear` (57s) |
| EDGE-08 | P2 | U | Pass | session-logic.test.ts |
| ENV-01 | P0 | E | Pass | `14-offline` (40s) |
| ENV-02 | P1 | M | Pass | flows 01, 02, 06 at 720×1280 / 320 dpi |
| ENV-03 | P2 | M | Not run | manual |
| ENV-04 | P1 | M | Not run | manual |
