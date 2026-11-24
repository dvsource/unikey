# Engine playground: a page to watch the scheduler react to grades

_Date: 2026-11-24 · Status: agreed with Viraj in a brainstorm · Nothing is built yet._

Lines marked **(Viraj)** are his answers. Lines marked **(my call)** are Claude's, and he can overrule them.

## 1. Intent

Viraj wants to see how the engine works. He grades cards himself and watches what changes: in today's session and in the coming days, up to a week. **(Viraj: "this give us the transparency of the algorithm / engine")** He is the one marking, not a simulated student. It is a tool for understanding and checking the engine, not a student view. **(Viraj)**

## 2. Where it lives

In the project tracker's local web app (`pm serve`, http://localhost:4477). The app is restructured to have several pages: the tracker board becomes one page and the engine playground another. It is not part of the teacher web app or `/admin` for now. **(Viraj)**

The tracker part stays read-only. The playground never writes tracker data. Its state lives in the browser tab, with an optional "save scenario" to a local JSON file. **(my call)**

## 3. When

After the engine takes Again / Hard / Good / Easy (tracker T114, [DR-0052](../../decisions/0052-anki-style-self-grading.md), [DR-0056](../../decisions/0056-student-grade-always-no-trust-check.md)). On the old right/wrong engine the page would show behaviour that is about to change. **(Viraj)**

## 4. One thing to understand first

The engine has no fixed deck. It picks one card at a time from what just happened. So the rest of today's session and the next days are a **forecast**: what the engine would serve if the cards not yet graded got a default grade. Every time Viraj grades a card, the forecast is run again from the new state, and the page shows what moved.

## 5. The page

```
Unit: [Mechanics ▾]   Day 1 (Mon)  [Next day ▶] [Reset]   Ungraded cards get: [Good ▾]   [Save] [Load]

Today  [A  G✓] [B  H✓] [C ·] [D ·] [E ·] …     graded cards fixed; C… forecast; each card has A H G E
Tue    [A] [F] [G] …
Wed    [B] [C] …
…      up to 7 days
Changes from your last grade:  B  Thu → Tue   ·   D  left today   ·   H  new today
```

- **Rows:** today, then each of the next 6 days. Today shows the cards already graded, then the forecast for the rest of the session. Each later row is the forecast session for that day. **(Viraj: up to a week)**
- **A card** shows the skill name (Sinhala, with English), its height (easy / guided / full), recall or MCQ, and a short reason chip. The reason comes from the engine: "due: Good 3 days ago", "repair after Again", "new: top exam weight", "side door: skipped section returns". Click a card to see the question and answer, and the engine's numbers for that skill (height, step-up count, gap step, next due date). **(my call)**
- **Grading:** only today's next card can be graded. It has A / H / G / E buttons plus Skip. Grading it moves the session forward, exactly as in the app. **(my call: grading future cards out of order would not match the engine)**
- **Default grade:** a dropdown for the forecast: Good (default), Hard, Easy, Again, or a simulator persona's behaviour. Changing it reruns the forecast. **(Viraj)**
- **Changes:** after each grade, cards that moved day, left a day or appeared are highlighted (moved yellow, gone struck through, new green), with a one-line list. **(my call on colours, within Dawn)**
- **Next day:** advances the clock one day. Today's ungraded forecast cards are graded with the default, and the next row becomes today. **Reset** starts a fresh student. **(my call)**
- **Session ends** (budget spent, bad day, the "5 more" offer) show in the row where they happen, with the reason.

## 6. How it works (for the builder)

- Use the real engine (`engine/src/index.ts`), not a copy. Node ≥ 23.6 runs the TypeScript directly. The engine can run in the server (a stateless endpoint that takes the state and an action and returns the new state and the forecast) or be bundled for the browser. The builder chooses. **(my call)** If it runs on the server, keep it bound to 127.0.0.1 and leave the tracker endpoints read-only.
- **Forecast:** copy the state, then run `startSession` / `answer` with the default grade until each session ends and `endSession`, day by day for 7 days, with the clock moved forward. The engine is pure and seeded, so the same inputs give the same forecast.
- **Diff:** compare the new forecast with the one before the last grade, by card and skill per day.
- The engine must expose the reason for each pick. If it doesn't yet, add it to the step result as a small `why` field. This is an engine change, so test it.
- Content comes from the built packs (`app/assets/content/packs/*.json`).

## 7. Out of scope
- Real students' data. This page only runs a sandbox student.
- Running many students at once (the simulator and judge already do that).
- Hosting it anywhere but the local machine.
