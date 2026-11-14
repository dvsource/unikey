# Blind comparison: tell two students apart from their logs

You are a judge in a test of UniKey, a physics practice app for school students preparing for their exams.

**What the app is trying to do.** Students quit study apps when the questions feel too hard, and UniKey's study loop must not let that happen. The app should fit itself to each student and keep fitting as the student changes, so different kinds of students should each get a visibly different app. The test you are part of asks: are the differences between students visible in what the app did? If two different students got near-identical sessions, the app is not adapting.

**What you are given.** Everything is in this file. Below these instructions you will find two questions, a short guide to reading the logs, and the full four-week logs of two students, called Student X and Student Y. You are not told who they are. Each log shows every card the app gave, why it chose it, what the student did and how long it took, every session start and end, every skip, every "5 more" offer and every progress moment.

**Your task.** Answer each of the two questions with "X", "Y" or "cannot tell", and give the evidence: the log lines that decided it. Look at both what the students did (accuracy, time per answer, "I don't know", skips, leaving early, which days they studied, whether they took "5 more") and how the app responded (heights of cards, its reasons, session lengths, how sessions ended). Say "cannot tell" when the logs do not give you a real reason to choose; do not toss a coin.

## What to produce

Write your report as a Markdown file: the name of this file with `.input.md` replaced by `.report.md`, in the same folder (the instructions you were launched with name it). It must contain one fenced `json` block exactly in this shape, using the question ids Q1 and Q2 as keys:

```json
{
  "answers": { "Q1": "X", "Q2": "cannot tell" },
  "evidence": {
    "Q1": ["<log line copied exactly, with the student it belongs to, e.g. X: D03 S1 #4 ...>", "<one sentence on what it shows>"],
    "Q2": ["<why the logs do not separate them>"]
  }
}
```

Each answer is exactly `"X"`, `"Y"` or `"cannot tell"`. After the JSON block you may add up to 150 words on how different the two students' experiences of the app were overall.

## What not to do

- Do not judge the physics content.
- Do not read any other file in this folder or anywhere else: no other logs, keys or notes. Use only this file.
- Do not invent log lines or change their wording.

<!-- builder: everything below this line is for the packet builder (engine/sim/judge.ts) and is never copied into a packet. -->

## Pair questions (source of truth for the packets and the answer keys)

Each pair gets two questions that the hidden students' traits separate. The last column is the persona that is the right answer; the builder turns it into X or Y for the key file. Keep exactly two rows (Q1, Q2) per pair.

| Pair | Id | Question | Answer |
|---|---|---|---|
| strong / weak-stubborn | Q1 | Which student is weaker at physics, getting more wrong and needing more help? | `weak-stubborn` |
| strong / weak-stubborn | Q2 | Which student can keep working longer in one sitting and wants extra cards at the end? | `strong` |
| weak-stubborn / weak-impatient | Q1 | Which student gives up sooner after a few wrong answers, leaving sessions or the app? | `weak-impatient` |
| weak-stubborn / weak-impatient | Q2 | Which student tires sooner within a session? | `weak-impatient` |
| smart-impatient / strong | Q1 | Which student studies only on some days rather than every day? | `smart-impatient` |
| smart-impatient / strong | Q2 | Which student is more willing to take on extra cards and long sessions? | `strong` |
| memory-good-calc-weak / calc-strong-memory-poor | Q1 | Which student is weaker at full calculation problems than at theory and guided cards? | `memory-good-calc-weak` |
| memory-good-calc-weak / calc-strong-memory-poor | Q2 | Which student forgets faster, getting things wrong when they come back for review? | `calc-strong-memory-poor` |
| underconfident-skipper / confident-misconceptions | Q1 | Which student holds back (skips or says "I don't know") even though they mostly get answers right when they try? | `underconfident-skipper` |
| underconfident-skipper / confident-misconceptions | Q2 | Which student answers with confidence but keeps falling for the same kinds of wrong answer? | `confident-misconceptions` |
| average-noclass / average-fastclass | Q1 | Which student has a class that moves quickly from topic to topic? | `average-fastclass` |
| average-noclass / average-fastclass | Q2 | Which student studies on their own, in an order they picked? | `average-noclass` |
| slow-reader / fast-guesser | Q1 | Which student reads slowly and takes a long time on every card? | `slow-reader` |
| slow-reader / fast-guesser | Q2 | Which student rushes and guesses without reading properly? | `fast-guesser` |
| steady-five-min / binge-quit | Q1 | Which student studies a little every single day? | `steady-five-min` |
| steady-five-min / binge-quit | Q2 | Which student studies in long bursts and then disappears for days? | `binge-quit` |
