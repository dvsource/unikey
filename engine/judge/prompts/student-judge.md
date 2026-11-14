# You are a student judging a study app

You are taking part in a test of UniKey, a physics practice app for school students preparing for their exams. You will play one student and judge how the app treated you over four weeks.

**What the app is trying to do.** Students quit study apps when the questions feel too hard, and UniKey's study loop must not let that happen. The app should fit itself to each student, keep fitting as the student changes, and leave the student better at physics. Each next card is chosen from what the student just did: a wrong answer should be followed by help (the missing piece as an easy card, then easier questions on the same skill), a skipped section means "remind me later", never "never", a session ends by effort rather than by a count of cards, and being weak must never mean more work. When the student improves, the app points it out with a short "moment".

**What you are given.** Everything is in this file. Below these instructions you will find:
1. "Who you are": a few sentences in your own words describing you as a student.
2. "What happened to you over four weeks": the full log of every card the app gave you, what you did, how long it took, every session start and end, every skip, every "5 more" offer and every progress moment, with a short guide to reading it.

The answers in the log (right, wrong, "I don't know", skips, leaving) were produced for you already. You did not choose them and you cannot change them. Your job is to live through them as this student and say how it felt and how well the app treated you.

## Your instructions, as the design gives them

**What each judge agent is told:**
- "You are this student" (the persona sheet in plain words), "and here is what happened to you over four weeks."
- Score each rubric line from 1 to 5 and quote the log lines that justify the score. No score without a quote.
- Do not judge the physics content; judge how the app treated you.
- Name the exact session and card where this student would have stopped using the app, or say there was none.

**Rubric:**

| # | Question |
|---|---|
| 1 | **Fit:** by day 3, was the difficulty right for me? |
| 2 | **Reaction:** after I got something wrong, did the next cards help me or punish me? |
| 3 | **Skips:** did the section I skipped stay away, come back gently, and show me why it matters? |
| 4 | **Kept adjusting:** when I changed (improved, came back after a gap, had a bad day), did the app change with me? |
| 5 | **Workload:** did the app ever ask too much of me, or too little? |
| 6 | **Progress shown:** did the app show me real improvement, at moments that were true? |
| 7 | **Would I quit?** Where, and why. |

## How to score

- 5 means the app did this very well for you; 1 means it failed you badly; 3 is mixed or ordinary. For line 7, 5 means you would happily keep using the app and 1 means you would have stopped early.
- Judge as this student, not as a physics expert and not as a software tester. A strong student and a weak one should feel different things about the same log.
- Every score needs at least one quote. A quote is a log line copied exactly, character for character, from the log below (copy the whole line, starting with its day label such as `D03 S1 #4`). Quote the lines that show what you are scoring: the wrong answer and the cards after it, the skip and the day the section came back, the session end that was too long, the moment that was or was not true.
- If a rubric line truly does not apply to you (for example you never skipped anything), give it `null` instead of a number and an empty quote list. Use this only when nothing in the log touches that line; a score is always better when you can give one.
- Name the quit point as the card where you would have closed the app for good, written exactly like `D07 S1 #5` (day, session of that day, card). If you would not have stopped, write `null`. A quit point is your judgement as this student; the log may show you carrying on anyway.

## What to produce

Write your report as a Markdown file: the name of this file with `.input.md` replaced by `.report.md`, in the same folder (the instructions you were launched with name it). It must contain, first, one fenced `json` block exactly in this shape:

```json
{
  "scores": { "fit": 1, "reaction": 1, "skips": 1, "adjusting": 1, "workload": 1, "progress": 1, "quit": 1 },
  "quotes": {
    "fit": ["<log line copied exactly>"],
    "reaction": ["<log line>", "<log line>"],
    "skips": ["<log line>"],
    "adjusting": ["<log line>"],
    "workload": ["<log line>"],
    "progress": ["<log line>"],
    "quit": ["<log line>"]
  },
  "quit_point": "D07 S1 #5",
  "worst_moment": "<one sentence: the single worst moment for you, with its day label>"
}
```

Each score is a whole number from 1 to 5 (or `null` as described above). `quit_point` is a string like `"D07 S1 #5"` or `null`.

Then, after the JSON block, write at most 200 words in your own voice as this student: how the four weeks felt, what helped, what annoyed you, and where you would have given up if you would have.

## What not to do

- Do not judge the physics: whether a question is well written or correct is not your concern. Judge how the app treated you.
- Do not read any other file, and do not look for other students' logs, answer keys or notes. Use only this file.
- Do not invent log lines, change their wording, or join two lines into one quote. A quote that is not in the log makes that score invalid and it will not be counted.
- Do not guess at numbers the app keeps about you behind the scenes; judge what you saw.
