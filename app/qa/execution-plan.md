# UniKey prototype: test execution plan

_Version 1 · 2026-11-07_

How and when the cases in [qa-spec.md](qa-spec.md) are run. Results go in [test-report.md](test-report.md).

## Suites

| Suite | What | Cases | Command | Time |
|---|---|---|---|---|
| **Unit + component** | Jest (`jest-expo`, React Native Testing Library 14) in `__tests__/` | All U and C cases | `npm test` | ~5 s |
| **E2E smoke** | Maestro flows tagged `smoke` | P0 E2E: HOME-01/02, SES-01, FB-01, LANG-01/02, REV-01/02/03, EXP-01, PER-01/02, UNIT-03..06/09 | `npm run test:e2e:smoke` | ~8 min |
| **E2E full** | Every Maestro flow (tags `smoke` + `full`) | All E2E cases | `npm run test:e2e` | ~20 min |
| **Manual** | The M cases and the "Not covered" list | M cases | by hand, checklist below | ~30 min |

## When each suite runs

| Trigger | Runs | Must pass |
|---|---|---|
| Every code or content change (before asking for review) | `npm run content` (if content changed), `npx tsc --noEmit`, `npm test` | All green |
| Before every reviewer build (APK or Expo link sent to teachers) | The above + **E2E smoke** | All P0 green |
| Before a release (a new content pack, a pilot build, a spec version bump) | The above + **E2E full** + **manual** checklist | All P0 and P1 green, or each failure listed in the report with a decision |
| A bug fix | The suite holding the case that found it, plus a new or updated case for the bug | The case passes |

## Environment

| Item | Value |
|---|---|
| Host | macOS, Node 24, JDK 17+ (tested with OpenJDK 21) |
| App | Expo SDK 58, React Native 0.88, Expo Router 58 |
| Emulator | Android Studio AVD "Medium Phone", **API 36**, 1080×2400, 420 dpi (`Medium_Phone_API_36.1`) |
| Expo Go | **58.0.5** (must match SDK 58). Installed by `npx expo start --android`, or cached at `~/.expo/android-apk-cache/Expo-Go-58.0.5.apk`. |
| Maestro | **CLI 2.12.1**, at `~/.maestro/bin` |
| Dev server | `npx expo start --port 8081`, reached by the emulator through `adb reverse tcp:8081 tcp:8081` |
| Small-screen check | Same AVD with `adb shell wm size 720x1280` and `adb shell wm density 320`; reset with `wm size reset` and `wm density reset` |

**Note:** an AVD started with `-no-snapshot-save` forgets apps installed in that run, so reinstall Expo Go 58 each time:

```bash
adb install -r ~/.expo/android-apk-cache/Expo-Go-58.0.5.apk
```

## How to run

### Unit and component

```bash
cd app
npm run content      # only if content changed
npx tsc --noEmit
npm test
```

### E2E (Maestro)

```bash
# 1. Start the emulator (Android Studio → Device Manager, or:)
~/Library/Android/sdk/emulator/emulator -avd Medium_Phone_API_36.1 &
```

```bash
# 2. Dev server, in its own terminal
cd app && npx expo start --port 8081
```

```bash
# 3. Let the emulator reach it and keep the screen on
adb reverse tcp:8081 tcp:8081 && adb shell svc power stayon true
```

```bash
# 4. Run (caffeinate stops the Mac sleeping mid-run, which stalls the emulator and fails every later flow)
cd app && caffeinate -i npm run test:e2e:smoke      # or: caffeinate -i npm run test:e2e
```

- Run one flow with `maestro test .maestro/06-item-types.yaml`.
- Point at another server with `-e APP_URL=exp://<ip>:8081`.
- Results, logs and screenshots go to `.maestro/output/<timestamp>/<flow>/` (git-ignored). Screenshots are under `takeScreenshot/`.
- Every flow starts with `clearState` on Expo Go, so it wipes all app data on that device. Never run the flows on a reviewer's phone.

### Manual checklist

1. **ENV-02 small screen:** set 720×1280 at 320 dpi, then open Today, a session with a bank (`b01`), and the review panel with Bad distractor. Nothing is clipped, and everything is reachable by scrolling.
2. **SI-04 / SI-05:** read the Sinhala in the E2E screenshots: no tofu boxes, conjuncts joined, no overlaps.
3. **DS-03 / DS-04:** compare the screenshots with the V3a-Light mock-ups on the direction canvas.
4. **EXP-07:** on a real phone, Send results → WhatsApp → open the file on the laptop → `node scripts/merge-review.mjs --dry-run <file>`.
5. **ENV-04:** install the EAS preview APK on a real phone, turn on airplane mode, open it and play a session.
6. **HOME-07, DONE-06:** check by eye when they come up.

## Entry and exit criteria

**Entry (before running E2E):**
- `npm test` is green.
- The emulator has booted with Expo Go 58.
- The dev server shows "Waiting on http://localhost:8081".

**Exit:**

| Run | Exit when |
|---|---|
| Smoke | All smoke flows pass. A failure blocks the reviewer build. |
| Full | All P0 pass. Each P1 failure is fixed, or listed in the report as a known issue with a reason and owner. P2 failures are listed. |
| Flaky flow | Re-run it once. If it passes, record it as flaky in the report and open a fix task. Two failures count as a fail. |

## Reporting a failure

Add a row to the **Bugs** table in `test-report.md`:
- **ID:** `BUG-NN`.
- **Severity:**
  - S1: crash, data loss, or a wrong answer key.
  - S2: a feature broken, with a workaround.
  - S3: cosmetic.
- **Case ID** that found it.
- **Steps to reproduce** from a fresh install.
- **Expected vs actual.**
- **Evidence:** a Maestro output path or screenshot, plus the logcat excerpt for crashes.
- **Status:** fixed (with the change), or open with a reason.

Fix it and re-run the failing case plus the smoke suite. If the bug escaped the existing cases, add a case in `qa-spec.md` and a test.

## Adding tests for a new feature

1. **Spec first:** add cases to `qa-spec.md` under the right area, with the next free ID, a priority and a type.
2. **testIDs:** add a `testID` to every control a test must find. Android exposes them as resource-ids, so Maestro selects them with `id:`. Conventions:
   - kebab-case, naming the thing, not its look: `start-today`, `send-results`.
   - Lists use a suffix: `option-N` (0-based display order), `review-distractor-N`, `skill-<skill id>`, `item-<item id>`.
   - Toggles start with `toggle-`; panel controls with `review-`; screens' root views end in `-screen`.
   - Text that tests read gets an id too (`reviewed-count`, `session-counter`, `item-meta`).
   - `Button`, `Chip` and `Txt` all take `testID`.
3. **Unit/component:** pure logic goes in `src/state` or `src/content` with a `*.test.ts`. Screens get a `*.test.tsx` with `render` and `fireEvent` (both async in RNTL 14: `await` them). Mock `expo-router` as in `session.test.tsx`.
4. **E2E:** a new `.maestro/NN-name.yaml` with `tags: [full]` (add `smoke` only for P0). Start with `runFlow: subflows/launch.yaml`. Reuse `subflows/` for Learn navigation (`open-item.yaml`), marking (`mark-ok.yaml`) and relaunching without wiping (`relaunch.yaml`).
5. **Maestro gotchas:**
   - `assertVisible` text is a regex, so escape `?`, `.` and `(`.
   - Close the keyboard with `pressKey: Enter`. Back closes the review panel.
   - Long lists need `scrollUntilVisible`.
   - Anything near the bottom of a tab screen can sit under the floating tab bar, where Maestro's tap hits the bar instead. Use `scrollUntilVisible` with `centerElement: true` first (as the flows do for the Progress switches).
   - `openLink` alone doesn't bring a stopped Expo Go to the front. `subflows/relaunch.yaml` runs `launchApp` first.
   - Expo Go's developer menu appears after `clearState`; the launch subflow closes it.
