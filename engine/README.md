# UniKey study-loop engine

The adaptive study loop of UniKey (spec: `docs/superpowers/specs/2026-11-12-study-loop-scheduler-design.md`). It picks the next card, decides when a session ends, keeps the student profile, and emits events. It is plain TypeScript with no UI. This file is for the developer who wires it into the Expo app.

## The public calls

Every call is pure: it takes the state (and `now`, epoch ms) and returns a new state. It never changes its inputs. Import from `engine/src/index.ts`.

| call | what it does |
|---|---|
| `newState(student, seed)` | a new student's state |
| `migrate(json)` | a stored state, with any newer fields defaulted. Call it on every load. |
| `buildContent(packs, noteRefs?)` | the engine's content from the built packs (`app/assets/content/packs/*.json`) |
| `setCurrentTopic(state, topic, "class" \| "student")` | the "teaching now" topic; `null` clears it |
| `startSession(state, content, now)` | opens a session and returns the first card |
| `answer(state, content, { card, choice, ms }, now)` | the student answered; `choice` is the option index or `"dont-know"` |
| `skip(state, content, { card, reason?, confirmed? }, now)` | "Not now" on the current card |
| `setSkipReason(state, content, section, reason, now)` | the one-tap reason, given on the toast after a skip |
| `extend(state, content, now)` | the student took "5 more" |
| `endSession(state, content, now, cfg?, { left? })` | closes the open session |
| `valueMessage(state, content, section)` | the value message for a section (also returned by `skip`) |

Order: `migrate` on load, `setCurrentTopic` when the topic changes, `startSession` when the student opens study, then `answer` / `skip` / `extend` as `next` says, until `next.kind` is `end`.

`startSession`, `answer`, `skip`, `extend` and `endSession` return a `Step`: `{ state, events, next, moments, feedback? }`. `setSkipReason` returns `{ state, events }`.

## What the app must persist

- **The state object**, after every call. It is plain JSON and survives a JSON round trip.
- **The events** of every call, appended in order. Their ids (`<student>:<seq>`) go up by one.
- Write the new state and its events **together** (one transaction). A state saved without its events, or the other way round, breaks the event log.
- A stale call (a card that is no longer open, an `answer` with no session) returns the same state and no events. Nothing needs writing.

## Sessions

- **On app open, call `startSession`.** If a session was left open (the app was killed), it is closed as `interrupted` first, with no profile change.
- **`endSession(state, content, now)`** means the student left (back button, "stop"): the session ends `left`, and the effort so far counts as a fade.
- **`endSession(..., cfg, { left: false })`** means the app was killed or the session was cut off without the student's choice: `interrupted`.
- A session belongs to the local day it **started** on (Sri Lanka time), even past midnight: the minimum day, the streak and the daily cap all use that day.
- If the phone's clock goes back more than 2 days (a corrected date), the engine accepts the new time and appends a `clock_corrected` event. Smaller backward steps are ignored (the time never goes back).

## `next` and what the UI does

| `next.kind` | the UI |
|---|---|
| `card` | show `next.card` (card id, variant, height). Call `answer` or `skip`. |
| `confirm-skip` | a second skip of the section (never for `reason: "too-hard"`): show `next.value` (its share of the unit, its top skills). Then call `skip` again with `confirmed: true`, or `answer` the card. Nothing has changed yet. |
| `offer-extend` | offer "5 more". Call `extend`, or `endSession` to decline (the session ends `budget`). "5 more" is at most 5 cards and at most 7.5 effort (five guided cards' worth), so it may be fewer cards when they are full problems. |
| `end` | the session is over. `next.end` has the kind, effort, cards, right answers, `fixed`, `streakKept`, `recap` and `fixedSkills`. `fixedSkills` lists the skills whose repair worked this session: the repair ended with its confidence card right, or the skill was answered right when it came back (`repair:return`); a later miss on the skill in the same session takes it off the list. `fixed` is the number of skills in `fixedSkills`. `rightSkills` lists the skills answered right this session (each once, in the order of the first right answer); it is filled on every end. When `recap` is true the session ended on a missed closing card (or the daily cap blocked one after a miss): show a short "what you fixed today" screen that lists the skill names in `fixedSkills` and asks no question. A session never ends on a wrong answer. When `recap` is false, end as before. |

**Open product decision (Viraj): the recap when `fixedSkills` is empty.** Most recap ends have nothing fixed (in the simulator about 4 in 5). What the recap screen says then is not decided. One option, from the reviewer: show "You got X and Y right today" from `rightSkills`; when that is empty too, a neutral close such as "Tomorrow starts easy"; in both cases no "fixed" heading. The engine only provides the data; it does not choose the text.

End kinds: `budget`, `extended-done`, `bad-day`, `daily-cap`, `content-exhausted`, `left`, `interrupted`. A `daily-cap` end with 0 cards means the day's cap was reached before the session could start.

**First sessions (change 4).** In a student's first 3 sessions the level of the opening and middle cards follows a ladder: start easy, go up one level after two right answers in a row, go down one level after a miss. At most one full problem per session comes from the ladder. These sessions use the minimum day.

**One closing card (change 7).** A session has at most one closing card. Skipping the closing card ends the session (a recap when the last answered card was a miss). Two bad moments within 8 cards (a failed repair, a skill left after two misses on it, or three misses in a row anywhere) or three slow answers in a row make a bad day: one easy closing card, then the end `bad-day`. Three misses in a row before any right answer in the session make a bad day at once. After a session of 3 or more cards with 2 or fewer right, the next session is short (the minimum day) and opens with easy cards (`open:easy`); when the first of them is missed, a repair takes over and only that one card is `open:easy`.

## Feedback and moments

- **`feedback`** (on `answer`): right or wrong, the correct option's index, and the wrong option's error `tag` if any. Show the explanation. "I don't know" gets the explanation with no negative message.
- **`feedback.reveal`**: set when a skipped section's "side door" card was answered right. Tell the student which section that was (the card was not labelled as it).
- **`moments`**: progress moments to show, at most 2 a session: `section-solid`, `avoided-now-done`, `then-wrong-now-right`, `missing-piece-fixed`, `height-up`. A session that is already full keeps the two strongest kinds (`section-solid`, `avoided-now-done`) for the next session: they come back in `startSession`'s `moments` ("held" moments). Show them at the start.

## Reasons

Every card has a `reason`. The app can log it; the student never sees it.

| reason | in words |
|---|---|
| `open:liked` | an opening card from a section the student does well in or likes |
| `close:winnable` | a closing card, the easiest eligible, after a wrong answer or on a bad day; it may be a card the student answered right 3 or more days ago |
| `repair:missing-piece` | after a wrong answer, an easier card on the probably missing piece |
| `repair:confidence` | an easy card on the same skill to rebuild confidence |
| `repair:return` | the skill that went wrong comes back, to check it is fixed |
| `due-review` | something learned before, brought back before it fades |
| `new:class-topic` | a new skill from the "teaching now" topic |
| `new:exam-weight` | a new skill chosen for its exam weight |
| `side-door` | a skipped section coming back gently |
| `skipped-drip` | one very easy card from a skipped section, not labelled as that section |
| `comfort-correction` | an easier card because recent answers went worse than planned |
| `extend:liked` | one of the "5 more" cards |
| `comeback:solid` | after 3 or more days away, a skill the student was solid on |
| `fallback:any` | nothing the plan wanted was left, so any card still eligible |
| `stretch:up` | a card one level above the student's usual one, because today is going well |
| `open:easy` | an opening card, the easiest eligible, after a session with very few right answers |

## Skip and its reason

- `skip` with no `reason`, `"later"` or `"not-learned"` is a **section skip**: the section is put away until its remind day (a second skip of it asks first with `confirm-skip`). The `skip` event has `scope: "section"`. The section remembers the level of the skipped card (`skippedLevel`).
- `skip` with `reason: "too-hard"` is a **card skip** (change 6): the section stays. The card's skill goes down one level that has cards and is not served again this session; at its lowest level it rests for `skip.tooHardRestDays` days instead. No confirm step, no value message, no effort. Its repair and queued return are dropped. The `skip` event has `scope: "card"`, `skill`, `fromLevel`, `toLevel` (equal when the skill rests). A drip or side-door card skipped as too hard leaves its section's skipped state as it was.
- The spec shows the one-tap reason on the toast after the skip: call `setSkipReason(state, content, section, "not-learned" | "too-hard" | "later", now)` when the student taps one. It changes only the reason of that section's last skip; the remind day never changes.
- Exception: `"too-hard"` for the session's last section skip (same section, session still open) turns it into a card skip. The section's record goes back to exactly what it was before the skip, the section can be served again this session, and the card skip rule applies to the skipped card's skill. The `skip_reason` event then has `scope: "card"`, `skill`, `fromLevel`, `toLevel`. A repair or queued returns the section skip dropped for other skills of that section are not restored. Passing the reason to `skip` itself avoids this.
- A skipped section comes back through a side door card below the level that was skipped, never a full problem (level 1 when a level-1 card was skipped). When it has no such card left, it comes back without one: one `section_rejoined` event (`{ section }`), its skills at their lowest level. Then it is served like any other section.
- A "not-learned" skip can come back early when the class teaches that topic (`setCurrentTopic(..., "class")`).

## Known gaps

- **`note_ref` is not in the built packs.** The repair step "a card on the same note" needs `card.noteRef`. The built packs drop `note_ref`, so in the app this step is inactive until the build script passes it through (`buildContent`'s `noteRefs` argument takes a card id → note map). The simulator reads it from the source `items.json` files.
- **The packs' `graph` field must be committed.** The engine needs the skill graph in each built pack. On a clean checkout it is missing until the `app/` build-script changes that add it are committed; until then `loadFromRepo` and `buildContent` throw "pack <id> has no skill graph", and the engine tests and the simulator cannot run.
- **Import specifiers end in `.js`** (`./session.js`) though the files are `.ts`. Check that Metro resolves them (or add a resolver rule).
- `engine/src` uses no Node APIs except `src/node/` (the file loader for tests and the simulator). Do not import `src/node` in the app.
- Every tuning number is in `src/config.ts` (`defaultConfig`). Each call takes an optional `cfg`.

## Running it

From `engine/`:

| command | what it does |
|---|---|
| `npm install` | once |
| `npx vitest run` | the unit tests |
| `npx tsc --noEmit` | the type check |
| `npm run sim -- --days 28 --seed 1 --packs all --out runs/<name>` | the 28-day simulator: 16 hidden students, the seven code checks (exit 1 if one fails) |
| `npm run judge -- packets --run runs/<name>` | builds the AI judge packets (`judge/JUDGING.md` is the runbook) |
| `npm run judge -- collect --run runs/<name>` | collects the judge reports into the summary input |

`runs/` is not committed. Analysis scripts for run folders are in `sim/tools/`. Tuning history is in `runs-notes/2026-first-tuning.md`.
