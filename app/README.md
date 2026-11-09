# UniKey prototype app

Roadmap build step 2: a prototype student app with a **reviewer mode**, so teacher reviewers see each item exactly as a student will, on a real phone, and mark it. No backend, no scheduler, no algorithm. Everything is stored on the phone.

- **Stack:** Expo SDK 58 (React Native, TypeScript, Expo Router), per [DR-0013](../docs/decisions/0013-tech-stack.md). Works offline: content and fonts are bundled.
- **Design:** "Dawn" ([DR-0025](../docs/decisions/0025-dawn-design-system.md)). Tokens are in `src/theme.ts`.
- **Language:** Sinhala content and skill names, English UI ([DR-0024](../docs/decisions/0024-sinhala-medium-ui-language.md)). The **EN** chip in a session (or *Show English* on Progress) adds the English under each line, for checking translations.

## Run it

```bash
cd app
npm install
npx expo start
```

Then press `a` for an Android emulator, `w` for the browser, or scan the QR code with Expo Go (below). `npm start` does the same but rebuilds the content first.

## Put it on an Android phone

**Option A: Expo Go (quickest, needs the laptop running).**
1. On the phone, install **Expo Go** from the Play Store. It must support SDK 58.
2. Put the phone and the laptop on the same Wi-Fi.
3. Run `npx expo start` in `app/` and scan the QR code with Expo Go.
4. If the Wi-Fi blocks it, use `npx expo start --tunnel`.

**Option B: an installable APK (works with no laptop, good for reviewers).**
Build one in the cloud with EAS (needs a free Expo account):

```bash
npx eas-cli@latest build -p android --profile preview
```

On first run, accept the prompts to create `eas.json` and set its `preview` profile to `"android": { "buildType": "apk" }`. EAS gives a download link. Send it over WhatsApp; the reviewer opens it and allows "install unknown apps" once.

## Screens

| Tab / screen | What it does |
|---|---|
| **Today** | Unit chips (Sinhala names), greeting, streak (sun), today's card (first skill of the unit's next 10 items), week day bars, the unit's Sigiriya. In reviewer mode, a *Teacher review* card with "Reviewed X of N" for the unit and the total for all units. |
| **Session** | L1/L2 cards, L3 scenarios and L4 MCQs (templates and statement banks), with figures. Shows correct / wrong, the mistake's student message (the option's `detail`, else the tag's message from spec §7) and the explanation. |
| **Session done** | Sunrise, streak, skill progress, "Done for today" / "5 more". |
| **Learn** | Unit chips → that unit's skills (in Sinhala) → items. Tap an item to play from there. |
| **Progress** | Placeholder stats, plus the reviewer tools: name, export, reviewer mode and English toggles. |

Items play in a **fixed order**: grouped by skill (in `items.json` order), then by layer, then as authored. Today plays the next 10 and moves on. Card options are shuffled with a fixed seed, so every reviewer sees the same order.

## Reviewer mode

On by default (switch it off on Progress to see the plain student view).

- Every item shows its id, layer, form and source, and a **Review** button (also on the feedback sheet after answering).
- Marks: **OK**, or any of **Wrong physics**, **Bad Sinhala**, **Bad distractor** (then pick which options), **Other**, plus a free-text note. Saved on the phone immediately (AsyncStorage).
- Templates and banks show the same 3–4 examples as `review.md` (‹ › to step through). Each example is marked separately, so the variant id is recorded.
- **Send results** (Progress tab) shares a JSON file through the share sheet, so it can go over WhatsApp. **Send as text** sends the same JSON as a message, for apps that won't take a file.

Each exported result holds: `item_id`, `variant_id` (`v12` = index in `variants.json`, `null` for cards), `variant_values`, `item_version`, `spec_version`, `pack`, `verdict`, `issues`, `distractors` (letter, index, text, tag), `note`, `reviewer`, `timestamp`.

### Merging results back

Save the file from WhatsApp, then:

```bash
cd app
node scripts/merge-review.mjs ~/Downloads/unikey-review-*.json          # or --dry-run first
```

This writes `review-results.json` into each pack's folder, e.g. `content/samples/mechanics-20/review-results.json`. There's one result per (item, variant, reviewer), and the newest wins, so re-sending is safe. A text export pasted into a `.json` file works too.

## Content

The app never hard-codes content. `scripts/build-content.mjs` reads each pack listed in `content-packs.json`:

- `items.json`: cards, pools, templates, banks, skills (`name_si`)
- `variants.json`: generated template and bank variants
- `si.tsv`: English → Sinhala pairs, used only where a text has no `si`
- `figures/*.svg`: drawings for card options
- the error-tag table (student messages) from `docs/living/content-authoring.md` §7

and writes `assets/content/packs/<id>.json`, `assets/content/tags.json` and `assets/content/index.ts`. After changing content:

```bash
npm run content     # then reload the app
```

**Units:** three packs are bundled: `mechanics-20` (91 items), `thermal-physics-20` (68) and `current-electricity-20` (82). One unit pick, made with the chips on Today or Learn, drives Today, Learn and "Review next 10". Each unit keeps its own Today position. Progress shows review counts per unit.

**Adding a unit:** add an entry to `content-packs.json` with its `dir` and unit names, then run `npm run content`. The unit chips, Today, Learn and the counts pick it up. The Sinhala names for Thermal Physics (තාප භෞතිකය) and Current Electricity (ධාරා විද්‍යුතය) are drafts, to confirm against the NIE syllabus.

**Proposed tags:** a unit's Concept tags that aren't yet in spec §7 are read from `content/tags/*-proposed.md` (listed in `proposed_tag_docs`). Their student messages show in the app; reviewer mode notes "Proposed tag (…), not yet approved". When they're approved into §7, the spec wins automatically.

**F44 figures** (graphs, beams) are drawn in the app from each variant's parameters by `src/content/figureEngines.ts`, a port of `draw()` in `validate.py`. A new engine there needs a matching one here.

## Tests

**QA docs:**
- [qa/qa-spec.md](qa/qa-spec.md): every feature and its test cases.
- [qa/execution-plan.md](qa/execution-plan.md): what runs when, the environment, how to add tests.
- [qa/test-report.md](qa/test-report.md): latest results and bugs.

**Quick reference:**
- `npm test` runs the unit and component tests.
- `npm run test:e2e:smoke` runs the P0 Maestro flows (5 flows, about 8 min).
- `npm run test:e2e` runs all 18 flows (about 20–30 min).

### Unit and component tests (Jest)

```bash
cd app
npm test
```

Jest with `jest-expo` and React Native Testing Library v14 (its `render` and `fireEvent` are async). The tests are in `__tests__/`:

| File | Covers |
|---|---|
| `content.test.ts` | The bundled pack matches `items.json`, `variants.json`, `si.tsv` and `figures/`. Every item, variant and skill is there, every text has Sinhala, card figures match their files, and F44 figures match the review doc's SVGs. |
| `scripts.test.ts` | `build-content.mjs` gives the same option order on every build, and the bundled pack agrees. `merge-review.mjs` merges into a results file, adds no duplicates on re-merge, and the newest mark wins. Both scripts run with `--out` into temp folders, so `content/` is never touched. |
| `export.test.ts` | The export JSON has the header and every field listed above. |
| `session.test.tsx` | Tapping a wrong option shows the mistake message and the explanation. A reviewer mark is saved to AsyncStorage. |

If content changes, run `npm run content` before `npm test`. The tests check the bundled pack against the source.

### End-to-end flows (Maestro, Android)

Flows in `.maestro/` drive the app in **Expo Go** on an Android emulator or phone:

| Flow | Checks |
|---|---|
| `01-session-feedback.yaml` | Today → Start → answer a card → feedback shows, then the EN toggle. Takes Sinhala session screenshots. |
| `02-review-mark.yaml` | Marks one item Bad distractor (option A plus a note) and the next one OK. "Reviewed 0 of 91" becomes "Reviewed 2 of 91". |
| `03-send-results.yaml` | Progress → Send results opens the Android share sheet with `unikey-review-….json`. |

Each flow starts with `clearState` on Expo Go, so the app's saved data is wiped first. Don't run the flows on a phone whose review marks you want to keep.

**One-time setup:**
1. Install Java 17+ and the Maestro CLI:

   ```bash
   curl -fsSL "https://get.maestro.mobile.dev" | bash
   ```

   Then restart the terminal and check with `maestro --version`.
2. Start an Android emulator (Android Studio → Device Manager) or plug in a phone with USB debugging on.
3. Install the Expo Go that matches SDK 58. The easiest way: run `npx expo start --android` once and accept "Install the recommended Expo Go version?".

**Each run:**

```bash
cd app
npx expo start --port 8081          # terminal 1, leave running
```

```bash
adb reverse tcp:8081 tcp:8081       # lets the device reach the dev server at 127.0.0.1
```

```bash
npm run test:e2e                    # terminal 2: maestro test .maestro
```

Results and screenshots land in `.maestro/output/` (git-ignored), with one folder per flow; screenshots are under `takeScreenshot/`. To run one flow, use `maestro test .maestro/02-review-mark.yaml`. To use another server address, use `maestro test -e APP_URL=exp://192.168.1.10:8081 .maestro`.

Notes for writing flows:
- The flows find elements by `testID` (Android resource-id): `start-today`, `option-N`, `feedback`, `continue`, `review-open`, `review-open-sheet`, `review-ok`, `review-bad-distractor`, `review-distractor-N`, `review-name`, `review-note`, `review-save`, `close-session`, `tab-progress`, `send-results`, `toggle-english`, `reviewed-count`.
- Close the keyboard with `pressKey: Enter`, not `hideKeyboard`. On Android, Back closes the review panel.
- After `clearState`, Expo Go opens its developer menu over the app, which hides the app's elements. `subflows/launch.yaml` waits for the menu and closes it.
- A full run takes about 4 minutes, because each flow reloads the app from a clean Expo Go.
- `assertVisible` text is a regex, so escape `?` and `.` or match a prefix with `.*`.

## Known gaps

- The tag student messages (spec §7) have no Sinhala yet, so they show in English. Reviewer mode marks this under the message.
- No dark theme ("Dusk"), onboarding, readiness, notes, mistake notebook or scheduler. Those are later build steps.
- Streak and week bars count any day with an answer; mastery here means every item of a skill was last answered correctly.

## Layout

```
app/
  content-packs.json        packs to bundle
  scripts/build-content.mjs content → assets/content
  scripts/merge-review.mjs  review export → content/samples/<pack>/review-results.json
  assets/content/           generated, don't edit
  src/app/                  screens (Expo Router): (tabs)/index, learn, progress; session; done; skill/[id]
  src/components/           Txt (Sinhala/Geist runs), ui (Dawn pieces), ReviewPanel
  src/content/              pack loader, figure engines
  src/state/                store (AsyncStorage), session slicing, export
```
