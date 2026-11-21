# Adaptive study in the Expo app

The app can now run the same deterministic scheduler as the simulator. The runtime switch is off by default. The app loads v1. Both built editions passed the adapter mapping tests.

## Try it

Start Metro from this worktree using its local dependencies.

```sh
cd app
EXPO_PUBLIC_STUDY_ENGINE=1 npx expo start --offline
```

Open **Today → Start study session**. Choose an answer or **I don't know**, read the explanation, then tap **Continue**. **Not now** skips the section, and **Too hard** skips the card. The engine decides whether to repair, review, rest a skill, close, or offer five more. A closing recap uses the wording from the engine README and asks no question. Restart Metro with the variable unset to return to the default prototype. This command uses the committed packs directly.

**Study this topic** on a skill page supplies that skill's syllabus topic to the scheduler. The Today unit picker supplies the unit's first topic. The engine can draw from the whole edition. Teacher review and opening a named question retain their fixed item order and variant controls. [Session route](../../app/src/app/session.tsx) · [Switch](../../app/src/engine/enabled.ts)

## What reaches the phone

| Area | Behavior |
|---|---|
| Content | The adapter gives the public engine builder the bundled graphs, options and item-to-note map. The app displays the exact served variant, including figures, option images, Sinhala text, optional English and explanations. The engine excludes `phy.therm.c043` in both editions. |
| Answer and feedback | The timer counts visible question time on the focused route while the app is active. Feedback, skip confirmation and time away are excluded. Cancelling a skip resumes the same timer. IDK sends `dont-know`. Recognized moments, side-door reveals and the optional guess hint use student-facing text. Scheduling reason codes stay internal. |
| Session and day | Start, answer, skip, confirm, extend and end use public engine calls. A fresh entry after a killed process records the previous open session as interrupted. The engine accounts for effort against the Sri Lankan day the session started. A stale screen cannot close its replacement session. |
| Storage | AsyncStorage key `unikey/study/v1` holds state and the cumulative ordered event log. An answer commits both in one serialized write. Progress reads the committed journal on startup and subscribes to subsequent commits. The normal storage-error path offers Retry. Reset student progress also clears adaptive state when the switch is on. |

[Storage and transitions](../../app/src/engine/study.ts) · [Step renderer](../../app/src/engine/EngineStudy.tsx)

## Fix-round results

| Case | Verified behavior |
|---|---|
| One hour in the background | Nine seconds on the question before leaving and one second after returning produced an engine answer of 10,000 ms. It was a real miss. |
| Quick answer across a blip | 500 ms before leaving and 250 ms after returning produced 750 ms and the engine marked the wrong answer as a guess. In both timing cases 40 seconds on feedback contributed zero to the next answer of 650 ms. The approved guess hint is unchanged. |
| Cancel a section skip | The adapter restores the same card, variant and presentation token. 8,500 ms before confirmation plus 250 ms after cancellation produced 8,750 ms. The minute on the dialog was excluded. A stale action was rejected even after a reset produced the same session ID, card and variant. |
| Damaged local save | On blank or malformed JSON, an unsupported version, or an invalid migrated state or journal, the adapter saves the exact original string at `unikey/study/v1.corrupt-<timestamp>` before replacing the primary key. Native AsyncStorage 2.2.0 collapses an empty string to null on a single-key read. The adapter uses its batch read to preserve the distinction. A suffix protects an existing backup. Concurrent loads share the recovered state. A cold restart serves a card. A missing key starts fresh without a backup. An actual storage I/O failure still needs a successful retry. |
| Kill during an answer | The route performed exactly one storage write, to `unikey/study/v1`. A cold reader after a simulated kill immediately before that write saw zero engine answers and zero dashboard attempts. Immediately after it, the reader saw one of each and the same card outcome. The live dashboard also updated from the journal. |
| Closing and leaving | Explicit End must persist before navigation. A failed End leaves Retry available. Correct and incorrect closing answers each produced feedback, an answer event and the same durable state and journal as a direct engine run. Continue follows the engine’s end flag. The correct closing answer showed the ordinary end screen, and the missed closing answer showed the recap. An earned extension still goes to the engine's offer screen. |

The prototype continues recording its own attempts. For an upgrade from the previous adaptive build, the adapter marks the old journal boundary. For each day Progress uses the larger of the old dashboard count and the old journal count, then adds new adaptive attempts. The old dashboard stored daily totals and the latest outcome per item. On a historical day mixing both modes, a lost mirror write cannot always be distinguished from an overlapping prototype attempt. New adaptive answers have a single durable record. [Journal projection](../../app/src/state/answerProgress.ts) · [Save recovery](../../app/src/engine/savedStudy.ts)

Three temporary mutations were run against the regression tests and then removed.

| Mutation | Test result |
|---|---|
| Navigate back without calling End | The route test observed zero calls where it expected one. |
| Make the adapter's explicit End reject every time | The scripted leave case failed at the awaited call. |
| Call endSession in place of answering a closing card | Both scripted cases failed. Feedback was missing for the expected right and wrong answers. |

[Scripted cases and kill tests](../../app/__tests__/study-adapter.test.ts) · [Route timing and End tests](../../app/__tests__/adaptive-session.test.tsx)

## Engine API gaps

| Gap | Public code and app handling |
|---|---|
| Resume | `engine/src/step.ts:52` defines `currentNext`. The barrel at `engine/src/index.ts:12` omits it. Starting at `engine/src/session.ts:397` closes the old session as interrupted. The adapter can reload its state. Entering study starts a fresh session. |
| Targeting | `engine/src/skip.ts:43` accepts a topic. The start call at `engine/src/session.ts:394` takes no skill or card target. A skill visit supplies its topic. A named item uses the prototype player. |
| Note references | `engine/src/content.ts:30` takes a separate note map and line 63 looks up the card ID in it. The adapter builds that map from bundled items. |
| Save validation | `engine/src/state.ts:18` checks the version and supplies migration defaults. It accepts a partial v1 object. The adapter validates the migrated structures and journal before using them. |
| Skip confirmation and effort | `engine/src/session.ts:607` emits a confirmation containing section information. The served card, ownership, spent effort and budget live on the session at `engine/src/types.ts:75`. The adapter exposes a screen view and restores the presentation on cancel. |
| Stale actions | `engine/src/types.ts:210` defines a served card without a per-presentation token. Answer checks the current card ID and option at `engine/src/session.ts:430`. The adapter checks the presentation token inside its serialized transition, including when a card ID repeats. |
| Source-layout coupling | The public API is imported from the sibling source tree at `app/src/engine/study.ts:6`. Its TypeScript entry uses relative `.js` specifiers at `engine/src/index.ts:1`. Metro and Jest map these to source files at `app/metro.config.js:11` and `app/jest.engine-resolver.cjs:7`. |

## Verification

The engine passed all **343 Vitest tests**. The app passed all **186 Jest tests**. Both TypeScript projects passed `tsc --noEmit`. Content mapping covers all 241 v1 and 257 v2 items, including the excluded item.

The previous round exported Android and iOS bundles offline. Lifecycle and interrupted-write results in this round are automated simulations. Physical-device timing and process eviction were not measured. The device smoke flow is available with the enabled server running via `maestro test .maestro/engine/study.yaml` from `app/`. The growing device-local journal and cross-device sync remain outside this integration. [Maestro flow](../../app/.maestro/engine/study.yaml)
