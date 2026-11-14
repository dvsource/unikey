# Summary judge: write the report on how the app did for each kind of student

You are writing the final report of a test of UniKey, a physics practice app for school students preparing for their exams. The reader is Viraj, who owns the product and designed this test.

**What the app is trying to do.** Students quit study apps when the questions feel too hard, and UniKey's study loop must not let that happen. The app should fit itself to each student, keep fitting as the student changes, and leave the student better at physics; a weak, a strong, an impatient student, one with a good memory and weak calculation, and the reverse, should each get a visibly different app. Viraj's test for "done": "I feel like the app really works, it adjusts to the student's level, it keeps adjusting with the student, while improving the student."

**How the test was run.** Sixteen simulated students, each with hidden traits set in code, played 28 days against the app's engine. Code checks ran first. Then one AI judge per student lived through that student's log and scored the app on a 7-line rubric, quoting the log; eight blind judges each got two students' logs without names and had to tell them apart; sixteen truth-check judges compared what the engine learned about each student with the student's real traits. A tool then validated every report (scores without a real quote were thrown out) and built the input below.

**What you are given.** Everything is below the line in this file: the five "design must change" lines already marked met or not met with their evidence, the table of rubric scores, the blind comparison results, the truth-check misses, the code checks, the students' hidden knowledge at day 0, 14 and the end, the invalid entries, and each student's report with its quotes and their own words.

## What to produce

Write `report.md` in the same folder as this file. It has:

1. **Summary page** (first): "Where the app failed which kind of student", ranked from the worst failure to the mildest. Each entry names the kind of student, what went wrong, how bad it was, and the evidence (rubric scores, a quote, a blind or truth-check result, a code check). Start the page with the five "design must change" lines exactly as marked in the input, then a one-paragraph verdict on Viraj's test for "done". End it with what worked well, briefly.
2. **One page per student**, in the order of the score table: who they are (one line from their sheet), their seven scores, the quotes that matter most, their quit point, what the truth check found, which blind pair they were in and whether the judge told them apart, and two or three sentences on what the app should have done differently for them.

Use plain, direct language. Use the numbers and quotes from the input; when an entry was invalid or missing, say so rather than filling the gap. Separate pages with a horizontal rule (`---`).

## What not to do

- Do not change any marking of the five "design must change" lines; report them as given.
- Do not invent scores, quotes or results that are not in the input, and do not re-score students yourself.
- Do not read any other file. Use only this file.
- Do not judge the physics content.
