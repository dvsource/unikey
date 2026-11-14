# Truth check: did the app learn the right things about this student?

You are a judge in a test of UniKey, a physics practice app for school students preparing for their exams.

**What the app is trying to do.** Students quit study apps when the questions feel too hard, and UniKey's study loop must not let that happen. To fit itself to each student, the app keeps four numbers about the student, read only from what it can see (right and wrong answers, answer times, skips, leaving early, taking "5 more"), and uses them to choose cards and session lengths. In this test the student is a simulated "hidden student" whose real traits are set in code and never shown to the app. You can see both sides. Your job is to say where the app's four numbers got this student wrong.

**What you are given.** Everything is in this file. Below these instructions:
1. The hidden student's real traits (JSON).
2. Their hidden knowledge (mean over all skills, 0 to 1) on day 0, day 14 and at the end.
3. The app's four numbers at the end of every simulated day (days are counted from 0).
4. What the student did each day: sessions, cards, right answers, "I don't know", skips, sessions left early, answers given while past their real stamina, median answer time.

**The app's four numbers (from the design):**

| Number | What it is meant to capture | Range | What it turns |
|---|---|---|---|
| comfort | The success rate at which this student keeps going | 0.65 to 0.85, starts at 0.75 | The target share of right answers in a session. Should go up for a student who leaves when things go wrong (impatient), and can go down for a stubborn one who copes with more misses. |
| memory | How quickly things fade for this student | 0.5 (forgets fast) to 2.0 (remembers well), starts at 1.0 | Multiplies every review gap. A student who forgets fast should end low; one who remembers well should end high. |
| h3Share | Calculation against concept: the share of session effort on full problems (height 3) | starts at 0.4; never less than 0.2 on the weaker side | A student weak at calculation but strong on ideas gets more guided-to-full ramps (a higher share); a student weak on ideas gets more concept and method cards (a lower share). |
| stamina | The effort the student can spend before they slow sharply, start missing, or leave | starts at 13.34 effort | The session's effort budget (it aims about 10% under it). Should move towards the student's real stamina trait. |

**The hidden traits that matter most:** `stamina` (real effort before fading), `patienceWrongs` and `patienceSessions` (how many wrongs close together before leaving a session, how many bad sessions before leaving the app), `forget` (1 is average, higher forgets faster), `learn`, `calc` and `concept` (modifiers on full problems and on easy/guided cards; negative is weaker), `prior` (starting knowledge), `skipBelow` and `dontKnowBelow` (how unsure before skipping or saying "I don't know"), `baseMs` (usual answer time), `habit` and `classPace`.

**Your task.** For each of the four numbers, decide whether the app's value, and the direction it moved over the four weeks, fits this student's real traits. A number is wrong if it ends on the wrong side of its default, moves the wrong way, never moves when the traits say it should, or is far from the truth (for stamina, compare with the `stamina` trait directly). Remember the app can only learn from what it saw: if the student never played enough, say so instead of calling the number wrong. For each wrong number give the app's value, what the truth is in words, and the first day by which the app should have known better.

## What to produce

Write your report as a Markdown file: the name of this file with `.input.md` replaced by `.report.md`, in the same folder (the instructions you were launched with name it). It must contain one fenced `json` block exactly in this shape:

```json
{
  "wrong": [
    { "number": "<one of the four>", "engine": 0.0, "truth": "<the real trait value and what it means, in words>", "by_day": 0 }
  ],
  "right": [
    { "number": "<one of the four>", "why": "<one sentence: why the value fits the real traits>" }
  ]
}
```

`number` is exactly one of `comfort`, `memory`, `h3Share`, `stamina`. Every one of the four numbers goes in either `wrong` or `right`. `engine` is the app's value at the end (or at the day you name). `by_day` is a day number as in the table (0-based). After the JSON block you may add up to 150 words on what the app most needs to learn better about students like this one.

## What not to do

- Do not judge the physics content or the student's experience; only whether the numbers fit the truth.
- Do not read any other file. Use only this file.
- Do not invent values: every value you give must be in the tables above.
