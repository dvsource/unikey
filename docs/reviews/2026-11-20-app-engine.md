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
| Answer and feedback | The app measures elapsed milliseconds from displaying the question to the tap. The next question's timer starts after Continue. IDK sends `dont-know`. Recognized moments, side-door reveals and the optional guess hint use student-facing text. Scheduling reason codes stay internal. |
| Session and day | Start, answer, skip, confirm, extend and end use public engine calls. A fresh entry after a killed process records the previous open session as interrupted. The engine accounts for effort against the Sri Lankan day the session started. A stale screen cannot close its replacement session. |
| Storage | AsyncStorage key `unikey/study/v1` holds state and the cumulative ordered event log. Each transition writes both in one serialized operation. A failed write keeps the last successful snapshot and the UI offers retry. Reload calls `migrate`. Reset student progress also clears adaptive state when the switch is on. |

[Storage and transitions](../../app/src/engine/study.ts) · [Step renderer](../../app/src/engine/EngineStudy.tsx)

## Engine API gaps

| Gap | Evidence at base a1b62f3 | App handling |
|---|---|---|
| Reopening an existing session | `engine/src/session.ts:397` closes an open session as interrupted on start. `engine/src/step.ts:52` defines `currentNext`, but `engine/src/index.ts:12` exports the transition calls only. | The adapter can reload a mid-session snapshot and answer its open card. A fresh visit to study starts a new session as specified. A transient feedback sheet or skip dialog is not restored after process death. |
| Exact skill or item targeting | `engine/src/skip.ts:43` accepts a current topic. `engine/src/session.ts:394` starts study without a skill or card argument. | A skill's study action supplies its topic. Tapping a specific item opens the item preview. |
| Built pack note references | `engine/src/content.ts:30` accepts a separate note map. Line 63 reads that map to populate each card. | The app collects `note_ref` from the bundled items, just as the simulator does. No source JSON or Node loader enters the mobile bundle. |
| First load and migration | `engine/src/state.ts:18` accepts a versioned state and rejects an unsupported version at line 20. | Missing and empty saves initialize through `newState` and `migrate`. Unsupported versions surface a load error and the stored data is preserved. |
| Presentation and stale actions | `engine/src/session.ts:607` returns a confirmation without a served card. At line 430 answer validation identifies the open card by ID. | Confirmation uses the saved open card. Session ownership and an in-flight action lock guard the screen. The adapter binds question text and variant options from the app's content index. |
| Mobile module resolution | `engine/src/index.ts:1` and its sibling imports use relative `.js` specifiers for TypeScript sources. | The Metro and Jest resolvers map those imports within the engine source directory. Both native bundle exports succeeded. |

## Boundaries and verification

The progress dashboard still uses its existing local answer projections. It does not show the engine's full mastery profile. The event journal is device-local and currently grows in one storage value. Large-history storage, sync, class-topic input and subtracting time spent in the background from an open question's timer remain future work.

- The engine passed **343 Vitest tests** and `tsc --noEmit`.
- The app passed **161 Jest tests** and `tsc --noEmit`. The mapping assertions cover all 241 v1 and 257 v2 items, including the excluded item. The scripted day compares complete steps and events with direct engine calls.
- Device lifecycle tests cover migration, mid-session reload, a new day, a failed write, stale navigation, confirmed skips and extension decisions. Route tests cover switch-off behavior, IDK feedback and a question-free recap.
- Metro exported enabled **Android and iOS** bundles offline. The device smoke flow was added and has not been run. With the enabled server running, execute `maestro test .maestro/engine/study.yaml` from `app/`. [Maestro flow](../../app/.maestro/engine/study.yaml)
