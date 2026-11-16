# UniKey test report: how the app did for each kind of student
_Date: 2026-11-16 · Judge pass on simulator run seed 1 (28 days, 16 simulated students), engine at commit 38b8710 · 41 AI agent runs: 16 student judges, 8 blind-comparison judges, 16 truth checks, 1 summary · 0 invalid reports · Written by the summary agent from the collected judge reports; not edited._


16 simulated students, 28 days. Valid reports: 16 student, 8 blind, 16 truth check. Invalid entries: 0.

## The five "design must change" lines (spec §13), as marked

- **met** — any persona would quit before day 7. Evidence: weak-impatient: judge's quit point D02 S1 #4; weak-impatient: stopped using the app on D02 (16 of 16 students judged).
- **not met** — two different personas get near-identical sessions. Evidence: every pair had at least one answer right (8 of 8 pairs judged).
- **met** — a weak persona's hidden knowledge is flat after 4 weeks (weak: prior ≤ 0.3; flat: gain < 0.05). Evidence: weak-stubborn 0.15 → 0.25 (not flat, +0.103); weak-impatient 0.15 → 0.15 (flat, +0.000) (stopped using the app on D02); fast-guesser 0.30 → 0.34 (flat, +0.039).
- **not met** — a skipped section returns the next day, or never. Evidence: code check skip-timing passed: 27 skips, remind days on schedule, kept away until then and back by the cap.
- **not met** — the blind comparison fails for more than a quarter of pairs (a pair fails unless every answer is right). Evidence: 1 of 8 pairs failed (13%): weak-stubborn / weak-impatient (8 of 8 pairs judged).

Two of the five lines are met, so by the spec the design must change.

## Verdict on "done"

Not done. Viraj's test is "it adjusts to the student's level, it keeps adjusting with the student, while improving the student." The app does change what it does from student to student. 15 of 16 blind answers were right, and the tool counts all 15 as backed by evidence of what the app did: heights, "5 more" offers, class-topic cards, comeback cards. But it fails the students who need it most. The weak, impatient student left for good on day 2 with no knowledge gain. The weak, stubborn student stayed but sat through sessions with zero right answers, and the app's longest sessions came on the worst days. On "Kept adjusting", 14 of 16 students scored 3 and two scored 1 or 2. Only comeback-10 scored 4. The truth check found the engine wrong about at least one number for 14 of 16 students: stamina for 9, memory for 6, full-problem share for 4, comfort for 2. Every student who kept practising knows more at the end, but only a little: the mean gain is +0.055. One code check fails: no-end-on-wrong, with 9 violations.

## Where the app failed which kind of student (worst first)

**1. The weak, impatient student (weak-impatient). Left the app on day 2.**
Scores: Fit 1, Reaction 2, Kept adjusting 1, Workload 3, Progress shown 2, Would I quit? 1. Quit point D02 S1 #4, and no sessions from D03 to D28. Hidden knowledge stayed flat: 0.15 → 0.15 → 0.15. The first wrong answer was followed by a harder card: `D01 S1 #1 [open:liked] H1 easy … wrong, 9s` then `D01 S1 #2 [repair:missing-piece] H2 guided … "I don't know", 11s`. On day 2 the app moved to a new skill and then gave a guided card, and the student closed the app: `D02 S1 #4 [repair:missing-piece] H2 guided … closed the app without answering`. In their words: "I never saw a single progress moment." This is the one blind pair that failed: on "who tires sooner" the judge answered "cannot tell" and cited no app evidence. The truth check reports no miss, but the engine had only two days of data.

**2. The weak, stubborn student (weak-stubborn). Stayed, but the app gave them nothing they could do.**
Scores: Fit 2, Reaction 2, Kept adjusting 2, Workload 2, Progress shown 3, Would I quit? 4. Three full sessions had zero right answers, and two of them were the longest of the month: `D07 S1 end — … 16 effort, 9 cards (0 right)`, `D08 S1 end — … 15.5 effort, 8 cards (0 right)`, `D10 S1 end — … 12 effort, 8 cards (0 right)`. The cards meant to steady the student, comfort-correction and the winnable closing card, were guided H2 cards answered "I don't know" (`D10 S1 #2`, `D14 S1 #8 [close:winnable] H2 guided … "I don't know"`). The first no-end-on-wrong violation is this student (day 6). Truth check: stamina fell to 8.889 against a real 14, and comfort stayed at 0.75 when it should have moved towards 0.65. Knowledge rose 0.15 → 0.25, so this student is not flat. Their words: "D10 came close to making me stop."

**3. Good at calculation, poor memory (calc-strong-memory-poor). Lowest gain of anyone who stayed; nearly quit on day 8.**
Scores: Fit 3, Reaction 3, Kept adjusting 3, Workload 3, Progress shown 3, Would I quit? 3. Quit point D08 S1 #5, after four wrong guided cards with no easier step: `D08 S1 end — the student left mid-session, 10 effort, 4 cards (0 right)`. Knowledge went 0.50 → 0.53 → 0.52, falling in the second half. The app never gave this student a full problem, which is their strength. Truth check: h3Share stayed at 0.4 for all 28 days when it should have risen, and stamina ended about 22% under the truth because the engine read frustration as tiredness.

**4. The fast guesser (fast-guesser). Knowledge flat; the app never dealt with the guessing.**
Scores: Fit 3, Reaction 2, Kept adjusting 3, Workload 4, Progress shown 3, Would I quit? 4. Knowledge 0.30 → 0.34 (+0.039), which the spec counts as flat. Answers of 1 to 2 seconds on guided cards drew more guided cards: `D11 S1 #2 [repair:missing-piece] H2 guided … wrong, 2s`, `D11 S1 #3 [comfort-correction] H2 guided … wrong, 2s`. Truth check: memory ended at 0.57 against a true average of 1.0. The student was happy to stay ("quick and easy to keep opening") but learned little.

**5. Strong and quick students (strong, smart-impatient). Treated as fragile in the first week.**
Both scored Fit 2. For both, day 1 was `8 cards (8 right)` of easy cards. The strong student: "The first week felt like the app did not believe me." The smart-impatient student: "Eight right answers in a row on day one is the kind of thing that makes me close a tool." Truth check: strong's h3Share fell to the 0.2 floor when it should have stayed near 0.4. Smart-impatient's comfort drifted down when it should have risen, and its stamina stayed at the 13.34 default against a real 10. Neither quit. Both blind answers in their pair were right, backed by app evidence.

**6. The slow reader (slow-reader). Repairs were not easier, and the engine missed the tiredness.**
Scores: Fit 3, Reaction 2, Kept adjusting 3, Workload 4, Progress shown 3, Would I quit? 4. After two wrong Lenz's law cards the next card was a full problem: `D12 S1 #3 [open:liked] H3 full … wrong, 81s`. Truth check: stamina 12.488 against a real 10, even though median time rose from 22s to over 30s by day 3. Memory swung and ended at 0.739 against a true 1.0.

**7. The binge-then-vanish student (binge-quit). "5 more" pushed them into a repeat failure.**
Scores: 3 on every line that applies. Quit point D24 S1 #9: after a wrong answer the extra cards repeated the same guided card: `D24 S1 #8 [extend:liked] H2 guided … Vertical throw symmetry — wrong, 39s`, then `#9 … closed the app without answering`. Truth check: stamina 11.932 against a real 30, so the engine moved it down instead of up. The comeback on D21 worked (`[comeback:solid] H1 easy … right, 9s`). Knowledge 0.40 → 0.45.

**8. Students who skip hard problems (underconfident-skipper, memory-good-calc-weak, one-feared-section, steady-five-min, comeback-10, average-fastclass). A skipped full problem came back as another full problem.**
Skips scores: 2 for memory-good-calc-weak, steady-five-min, comeback-10 and average-fastclass; 3 for underconfident-skipper and one-feared-section. The timing of returns passed its code check. The problem is what came back: the "side-door" return was often a full H3 card, the exact thing the student had skipped. Examples: `D26 S1 #3 [side-door] H3 full … "I don't know", 37s` (memory-good-calc-weak), `D13 S1 #3 [side-door] H3 full … "I don't know", 34s` (underconfident-skipper), `D26 S1 #3 [side-door] H3 full … skipped` (steady-five-min), `D14 S1 #3 [side-door] H3 full … "I don't know", 36s` (average-fastclass). Truth check: memory-good-calc-weak's h3Share never moved from the default, and underconfident-skipper's memory hit the 2.0 ceiling against a true 1.0. One-feared-section skipped Humidity five times "and nothing changed". None of these students quit.

**9. Confident with misconceptions (confident-misconceptions). The wrong ideas never went away.**
Scores: Fit 3, Reaction 3, Kept adjusting 3, Workload 4, Progress shown 3, Would I quit? 4. The same skills stayed wrong for weeks: Vertical throw on D03, D04, D05 and D19, and Angular momentum again and again. The repair card was often another guided card that was also wrong (`D10 S1 #2 [repair:missing-piece] H2 guided … wrong, 11s`). Truth check: memory ended at the 0.5 floor, so the engine read the misconceptions as forgetting. Their words: "I never really felt the weak ideas were gone."

**10. Average students (average-noclass, average-fastclass, steady-five-min, comeback-10). Mild problems.**
These four have the best scores, mostly 3 to 4. What went wrong was mild. Repair cards that were not easier (average-noclass `D11 S1 #3`, steady-five-min `D03 S1 #2`). The same opener card day after day ("Linear expansion opened nearly every session"). Stamina estimates were too low: average-noclass 11.338 and average-fastclass 9.338, both against a real 14. Average-fastclass's memory also swung and ended at 0.789 against a true 1.0.

**Problems that hit almost everyone**
- Progress moments shown too early or untrue. Students called "section solid" after one card, and "easy cards → full problems" for skills where they never saw a full problem, hollow or fake: average-fastclass, weak-stubborn, calc-strong-memory-poor, confident-misconceptions, binge-quit, comeback-10, slow-reader, fast-guesser, steady-five-min, one-feared-section, smart-impatient. The "wrong on Dxx, right now" moments were praised as true by nearly every student.
- The help after a wrong answer was sometimes another guided card on the same skill, often wrong again. This is the most common "worst moment" (average-noclass, calc-strong-memory-poor, confident-misconceptions, steady-five-min, fast-guesser, slow-reader, binge-quit).
- The same opening card repeated for weeks (Linear expansion, Resistors in series and parallel, Vertical throw).
- Stamina was misjudged for 9 of 16 students, usually too low after one slow or frustrated day.
- Code check no-end-on-wrong: FAIL, 9 violations.

## What worked well

- After a wrong answer, an easy card on the same skill usually led to a quick right answer, and students said so. Reaction scored 4 for strong, smart-impatient, memory-good-calc-weak, underconfident-skipper and one-feared-section.
- "Wrong on Dxx, right now" moments felt true and were the most liked feature.
- Short sessions kept most students going. 13 of 16 had no quit point, and 15 of 16 stayed all 28 days.
- The comeback after time away worked for binge-quit and comeback-10. Comeback-10 scored 4 on Kept adjusting.
- The app followed a fast-moving class (average-fastclass got class-topic cards every four days) and extended sessions for students who wanted more (strong).
- These code checks passed: skip-timing, effort-cap-and-fairness, no-repeat-14d, ends-before-fade (worst 14% ≤ 20%), knowledge-up (15 practising students all ended above day 0) and no-back-to-back-card.
- Blind comparison: 15 of 16 answers right, all 15 backed by app evidence.

---

# average-noclass

**Who:** "I am an ordinary student… I study by myself because I do not go to any tuition class."

**Scores:** Fit 4 · Reaction 3 · Skips n/a · Kept adjusting 3 · Workload 4 · Progress shown 3 · Would I quit? 4

**Quotes that matter**
- `D01 S1 end — end: planned session done, 8 effort, 8 cards (8 right)`: a gentle start.
- `D11 S1 #2 [new:exam-weight] H2 guided … Potential divider — wrong, 15s` then `D11 S1 #3 [repair:missing-piece] H2 guided … Potential divider — wrong, 14s`
- `D09 S1 #3 [due-review] H3 full … wrong, 34s` and `D10 S1 #3 [due-review] H3 full … wrong, 33s`: a full problem right after a shaky day, twice.
- Worst moment: "D11 S1 #3: after getting Potential divider wrong, the 'missing piece' help was another guided problem on the same thing and I got it wrong again."

**Quit point:** none. Did not leave the app. Knowledge 0.40 → 0.44 → 0.47.

**Truth check:** stamina 11.338 against a real 14. It dropped to 9.338 on day 12 with no fading or leaving in the log to support it, and ended about 19% under.

**Blind pair:** blind-6 with average-fastclass. The judge told them apart on both questions (2/2), using app evidence: class-topic announcements for one, topics chosen by exam weight for the other.

**What the app should have done differently:** When a guided card is missed, the repair should step down to an easy card, not repeat the same height. After a bad day, it should wait before serving a full problem on that skill. It should also stop opening every session with Linear expansion.

---

# average-fastclass

**Who:** "I go to a tuition class that rushes through the syllabus… I do not retain it forever."

**Scores:** Fit 3 · Reaction 3 · Skips 2 · Kept adjusting 3 · Workload 4 · Progress shown 3 · Would I quit? 4

**Quotes that matter**
- `D03 S1 #2 [new:class-topic] H2 guided … Vertical throw symmetry — wrong, 14s`, `#3 [repair:missing-piece] H2 guided … wrong, 11s`, `#4 [comfort-correction] H2 guided … wrong, 12s`: three guided cards in a row, all wrong.
- `D04 S1 #1`, `D05 S1 #1`, `D06 S1 #1 [open:liked] H2 guided … Vertical throw symmetry — wrong`: the same failed skill opened four days running.
- `D11 S1 #3 [comfort-correction] H3 full … skipped ("Not now"), reason "too hard"` then `D14 S1 #3 [side-door] H3 full … "I don't know", 36s`
- `D07 S1 after #1 ★ moment shown: "Equations of motion: section solid"`: "A 'section solid' message after one right answer felt fake."
- Worst moment: "D14 S1 #3: I said a full Newton's third-law problem was too hard on D11, and the app brought the same skill back as a full problem and I could only say I don't know."

**Quit point:** none. Did not leave. "I would have been close to quitting around D06, but short sessions kept me in." Knowledge 0.40 → 0.44 → 0.47.

**Truth check:** stamina 9.338 against a real 14. It dropped on day 3 after one slow day and was never corrected. Memory ended at 0.789 against a true 1.0, after swinging between 1.103 and 0.525.

**Blind pair:** blind-6 with average-noclass. Told apart, 2/2, with app evidence: the app served new:class-topic cards every four days.

**What the app should have done differently:** A skill the student has failed several days running should not open the next session. A skipped full problem should come back as an easy or guided card. "Section solid" should need more than one right answer.

---

# strong

**Who:** "I am one of the top students in my school… I like long sessions and I usually want to do some extra questions."

**Scores:** Fit 2 · Reaction 4 · Skips n/a · Kept adjusting 3 · Workload 3 · Progress shown 4 · Would I quit? 4

**Quotes that matter**
- `D01 S1 #3 [comfort-correction] H1 easy … Power, force and speed — right, 8s` and `D01 S1 end — … 8 cards (8 right)`
- `D14 S1 #4 [due-review] H3 full … wrong, 40s` then `#5 [repair:missing-piece] H2 guided … right, 12s`: a good step-down.
- `D28 S1 end — end: the 5 extra cards done, 32.5 effort, 16 cards (15 right)`
- `D13 S1 after #3 ★ moment shown: "Ideal gas equation pV = nRT: wrong on D07, right now"`: "the best one".
- Worst moment: "D01 S1 #3: the app gave me the same easy Power, force and speed card again after I got two right, and kept going with easy cards for the whole first session."

**Quit point:** none. Did not leave. "I came close to being bored in the first week." Knowledge 0.80 → 0.82 → 0.84.

**Truth check:** h3Share dropped to the 0.2 floor by day 23. It should have stayed near 0.4, since calc and concept are equal.

**Blind pairs:** blind-1 with weak-stubborn, told apart 2/2 with app evidence (H3 cards and "5 more" offers for strong, short easy sessions for weak-stubborn). Blind-3 with smart-impatient, told apart 2/2. On Q2 the app evidence was extend:liked H3 cards and longer sessions.

**What the app should have done differently:** After two or three quick right answers on day 1, it should have moved up to guided and then full problems within the first session, not after a week. It should not have cut the full-problem share to the floor for a balanced, strong student.

---

# weak-stubborn

**Who:** "Physics has never come easily to me… I learn slowly and forget fast. But I do not give up."

**Scores:** Fit 2 · Reaction 2 · Skips n/a · Kept adjusting 2 · Workload 2 · Progress shown 3 · Would I quit? 4

**Quotes that matter**
- `D07 S1 end — … 16 effort, 9 cards (0 right)`, `D08 S1 end — … 15.5 effort, 8 cards (0 right)`, `D10 S1 end — … 12 effort, 8 cards (0 right)`
- `D07 S1 #2 [comfort-correction] H1 easy … wrong, 10s` then `#3 [repair:missing-piece] H2 guided … "I don't know", 13s`: the repair went up a height.
- `D14 S1 #8 [close:winnable] H2 guided … "I don't know", 14s`: the "winnable" close was not winnable.
- `D15 S1 after #3 ★ moment shown: "Power, force and speed: easy cards → full problems"`: "felt like a stretch".
- Worst moment: "D10 S1: eight guided cards in a row, every one answered "I don't know", right after two zero-right days, with nothing easy to get me started."

**Quit point:** none. Did not leave. "D10 came close to making me stop." Knowledge 0.15 → 0.22 → 0.25 (+0.103, not flat).

**Truth check:** stamina 8.889 against a real 14. It dropped on days 8 and 22 though the student never left or faded. Comfort stayed at 0.75 when it should have drifted towards 0.65. Code check no-end-on-wrong: the first of its 9 violations is this student, day 6, a session that ended on budget right after a wrong answer.

**Blind pairs:** blind-1 with strong, told apart 2/2 with app evidence. Blind-2 with weak-impatient: 1/2, the only failed pair. Q1 (who gives up sooner) was right. Q2 (who tires sooner) was "cannot tell", with no app evidence.

**What the app should have done differently:** After a session with zero right, the next one should be shorter and start with easy cards the student can get right, not a run of guided cards. Comfort and winnable cards should be H1 for a student at about 30% right. The worst days should never be the longest sessions.

---

# weak-impatient

**Who:** "I am behind in physics and it makes me annoyed… If the app feels like a waste of time I will stop using it."

**Scores:** Fit 1 · Reaction 2 · Skips n/a · Kept adjusting 1 · Workload 3 · Progress shown 2 · Would I quit? 1

**Quotes that matter**
- `D01 S1 #1 [open:liked] H1 easy … wrong, 9s` then `D01 S1 #2 [repair:missing-piece] H2 guided … "I don't know", 11s`
- `D01 S1 end — end: the student left mid-session, 6.5 effort, 4 cards (1 right)`
- `D02 S1 #2 [repair:missing-piece] H1 easy … right, 31s`: the one repair that helped.
- `D02 S1 #4 [repair:missing-piece] H2 guided … closed the app without answering` and `D03–D28 no sessions (26 days)`
- Worst moment: "D01 S1 #2: right after my first wrong answer, the app gave me a harder guided card and I could only say I don't know."

**Quit point:** D02 S1 #4. Left the app on D02. Knowledge 0.15 → 0.15 → 0.15 (flat).

**Truth check:** no miss reported. The engine had only two days of data.

**Blind pair:** blind-2 with weak-stubborn, 1/2, the failed pair. Q1 (gives up sooner) was right, with evidence from both app and student. Q2 (tires sooner) was "cannot tell", based only on student evidence.

**What the app should have done differently:** For a new student who gets the first card wrong, the repair must be easier, never H2, and the first session should be a run of easy wins. The app should also show a progress moment early, because this student "never saw a single progress moment".

---

# smart-impatient

**Who:** "I am quick and I understand things fast, but I get fed up quickly… I only study on some days, usually every other day."

**Scores:** Fit 2 · Reaction 4 · Skips n/a · Kept adjusting 3 · Workload 4 · Progress shown 3 · Would I quit? 4

**Quotes that matter**
- `D01 S1 #3 [comfort-correction] H1 easy … right, 29s` and `D01 S1 end — … 8 cards (8 right)`
- `D09 S1 #5 [new:exam-weight] H2 guided … wrong, 13s` then `#6 [repair:missing-piece] H1 easy … right, 10s`: a good step-down.
- `D21 S1 after #8 the app offers "5 more" — declined`
- `D07 S1 after #1 ★ moment shown: "Equations of motion: section solid"`: "seemed premature".
- Worst moment: "D01 S1 #3: after answering right in seconds, the app answered with a long run of easy cards, eight of them, all right, which felt like a waste of my time on day one."

**Quit point:** none. Did not leave. Knowledge 0.70 → 0.72 → 0.72.

**Truth check:** comfort drifted down to 0.71 when it should have risen above 0.75 for an impatient student. Stamina stayed at the 13.34 default against a real 10, though median time rose from 9s to 13–15s.

**Blind pair:** blind-3 with strong, told apart 2/2. Q1 (studies only some days) is counted as app evidence, but the judge said the app evidence was weak and the answer rested on the student's study days. Q2 rested on app evidence about strong's extended sessions.

**What the app should have done differently:** It should have moved a fast, accurate student off easy cards within the first session. It should have learned the short stamina and the low patience. It should also treat the every-other-day gap as part of the pattern, since the judge saw no comeback card after a day off.

---

# memory-good-calc-weak

**Who:** "I remember definitions and explanations very well… But when it comes to working out numbers I make silly mistakes and get stuck."

**Scores:** Fit 4 · Reaction 4 · Skips 2 · Kept adjusting 3 · Workload 3 · Progress shown 3 · Would I quit? 4

**Quotes that matter**
- `D12 S1 #4 [due-review] H3 full … "I don't know", 32s` then `#5 [repair:missing-piece] H2 guided … right, 11s`
- `D14 S1 #4` and `D15 S1 #4 [due-review] H3 full … Wheatstone bridge — "I don't know", 40s`: the same full problem two days running.
- `D21 S1 #3 [side-door] H3 full … skipped` and `D26 S1 #3 [side-door] H3 full … "I don't know", 37s`
- `D07 S1 after #5 ★ moment shown: "Potential divider: guided problems → full problems"`, then `D10 S1 #3 [due-review] H3 full … Potential divider — skipped ("Not now"), reason "too hard"`
- Worst moment: "D26 S1 #3: after I skipped Average velocity as too hard, the app brought it back as a gentle 'side-door' but gave me a full H3 problem and I could only say I don't know."

**Quit point:** none. Did not leave. "I was close to it around D18 and D24, with several full problems in a row." Knowledge 0.50 → 0.54 → 0.58.

**Truth check:** h3Share stayed at the 0.4 default when it should have risen through guided-to-full ramps. Stamina fell to 9.197 against a real 14, after one slow day was read as tiredness.

**Blind pair:** blind-4 with calc-strong-memory-poor, told apart 2/2 with app evidence (H3 skips and side-door H3 cards, ★ moments on returned skills).

**What the app should have done differently:** A side-door return after a "too hard" skip should be a guided card, and full problems should ramp up from guided ones the student gets right. It should not repeat the same full problem the day after "I don't know".

---

# calc-strong-memory-poor

**Who:** "I am good at working through numerical problems once I know the formula. The trouble is I forget things quickly."

**Scores:** Fit 3 · Reaction 3 · Skips n/a · Kept adjusting 3 · Workload 3 · Progress shown 3 · Would I quit? 3

**Quotes that matter**
- `D08 S1 #1 [open:liked] H2 guided … wrong, 12s`, `#2 [repair:missing-piece] H2 guided … wrong, 13s`, `#4 [comfort-correction] H2 guided … wrong, 11s`, `#5 [close:winnable] H1 easy … closed the app without answering`
- `D23 S1 end — end: the student left mid-session, 18.5 effort, 11 cards (7 right)`: "D23 asked for 12 cards and tired me out."
- `D28 S1 #3 [due-review] H2 guided … wrong` then `#4 [repair:missing-piece] H2 guided … wrong`
- `D15 S1 after #4 ★ moment shown: "Power, force and speed: easy cards → full problems"`: "I never saw a full problem."
- Worst moment: "D08 S1 #4: after three wrong guided problems in a row I got a fourth guided problem instead of an easy card, and I closed the app on the next card."

**Quit point:** D08 S1 #5. Came back and did not leave the app. Knowledge 0.50 → 0.53 → 0.52, falling in the second half.

**Truth check:** h3Share stayed at exactly 0.4 for 28 days when it should have risen, since the student is strong on full problems. Stamina ended at 10.889 against a real 14, about 22% under, because frustration exits were read as tiredness.

**Blind pair:** blind-4 with memory-good-calc-weak, told apart 2/2 with app evidence. The judge noted Y "never received an H3 full card in four weeks".

**What the app should have done differently:** It should have given this student full problems, their strength. Weak theory skills needed repeated easy reviews, not more guided cards. After two misses in a row the next card must step down. Frustration exits should not lower stamina.

---

# confident-misconceptions

**Who:** "I always feel sure about my answers… I have some wrong ideas stuck in my head from the past and I do not notice them."

**Scores:** Fit 3 · Reaction 3 · Skips n/a · Kept adjusting 3 · Workload 4 · Progress shown 3 · Would I quit? 4

**Quotes that matter**
- `D10 S1 #1 [new:exam-weight] H2 guided … wrong, 13s`, `#2 [repair:missing-piece] H2 guided … wrong, 11s`, `#3 [comfort-correction] H2 guided … wrong, 15s`
- `D05 S1 #6 [repair:return] H2 guided … Vertical throw symmetry — wrong, 14s` and `D19 S1 #1 [open:liked] H2 guided … Vertical throw symmetry — wrong, 15s`
- `D19 S1 after #0 ★ moment shown: "Angular momentum: section solid"` then `D19 S1 #7 [due-review] H2 guided … Angular momentum — wrong, 12s`
- Worst moment: "D10 S1 #3: a third guided Potential divider card in a row, after two wrong answers, with no easier step before it."

**Quit point:** none. Did not leave. "I never really felt the weak ideas were gone." Knowledge 0.50 → 0.54 → 0.57.

**Truth check:** memory ended at the 0.5 "forgets fast" floor against a true 1.0. The misses come from misconceptions, not forgetting.

**Blind pair:** blind-5 with underconfident-skipper, told apart 2/2 with app evidence (repair:return and extend cards on the same failed skills).

**What the app should have done differently:** Fast, confident wrong answers on the same skill should be read as a misconception, not as forgetting, and met with a card that targets the wrong idea, not another guided card at the same height. "Section solid" should not appear on a skill the student keeps getting wrong.

---

# underconfident-skipper

**Who:** "I actually know more than I think, but I never trust myself. When a question looks hard I would rather skip it or say I do not know."

**Scores:** Fit 4 · Reaction 4 · Skips 3 · Kept adjusting 3 · Workload 4 · Progress shown 4 · Would I quit? 4

**Quotes that matter**
- `D02 S1 #3 … wrong, 12s` then `#4 [repair:missing-piece] H1 easy … right, 8s`: "I felt helped, not punished."
- `D10 S1 #3 [due-review] H3 full … skipped ("Not now"), reason "too hard"` then `D13 S1 #3 [side-door] H3 full … "I don't know", 34s`
- `D12`, `D17`, `D25 [due-review] H3 full … skipped … "too hard"`, then `D28 S1 #3 [side-door] H3 full … "I don't know", 36s`
- `D24 S1 #3 before the skip the app shows: "Kinematics is about 1% of Mechanics marks…" — the student skips anyway`
- `D17 S1 after #2 ★ moment shown: "Balanced Wheatstone bridge: wrong on D10, right now"`
- Worst moment: "D13 S1 #3: the section I skipped on D10 came back as a full exam-style problem, I said I did not know, and the next card (an easy one I then got wrong) made the whole day feel bad."

**Quit point:** none. Did not leave. Knowledge 0.65 → 0.67 → 0.69.

**Truth check:** memory ended at 1.7 and hit the 2.0 ceiling, against a true 1.0. Stamina dropped to 9.338 on day 25 against a real 12, for no reason visible in the log.

**Blind pair:** blind-5 with confident-misconceptions, told apart 2/2 with app evidence (H3 cards offered, then skipped-drip and side-door cards).

**What the app should have done differently:** The app should have learned that full problems are what this student skips, even though they answer guided cards on the same skill right. It should bring skipped sections back as guided cards and build confidence up to full ones. A "1% of marks" message does not encourage this student.

---

# one-feared-section

**Who:** "I am fine with most of physics. There is one part of the syllabus that scares me… so I avoid it whenever I can."

**Scores:** Fit 4 · Reaction 4 · Skips 3 · Kept adjusting 3 · Workload 4 · Progress shown 3 · Would I quit? 4

**Quotes that matter**
- `D04 S1 #2 … wrong, 11s`, `#3 [repair:missing-piece] H1 easy … right, 9s`, `#4 [repair:confidence] H1 easy … right, 8s`
- `D16 S1 #4 before the skip the app shows: "Humidity is about 13% of Thermal physics marks…" — the student skips anyway`
- `D21 S1 #3 [side-door] H2 guided … Humidity … skipped`: "a guided problem, not an easy one, which felt like pressure."
- `D17 S1 #5 [due-review] H3 full … Kinetic theory … "I don't know", 94s` then `D18 S1 #6 [due-review] H3 full … "I don't know", 31s`
- Worst moment: "D17 S1 #5: a full exam-style problem on Kinetic theory that I could not do, 94 seconds of staring, and it came back as another full problem the next day (D18 S1 #6)."

**Quit point:** none. Did not leave. "The fear stayed, though." Knowledge 0.46 → 0.50 → 0.52.

**Truth check:** h3Share rose to 0.5 on day 19 with no signal behind it, for a balanced student who should stay at 0.4.

**Blind pair:** none. This student was not in a blind pair.

**What the app should have done differently:** The feared section was skipped five times "and nothing changed". The app needed a different approach after repeated skips, such as one tiny easy card inside an otherwise good session, never a guided card. After an "I don't know" on a full problem, the next day's return should be a step lower.

---

# steady-five-min

**Who:** "I only have a few minutes each day… I do it every single day without fail."

**Scores:** Fit 3 · Reaction 3 · Skips 2 · Kept adjusting 3 · Workload 4 · Progress shown 3 · Would I quit? 4

**Quotes that matter**
- `D03 S1 #2 [repair:missing-piece] H2 guided … wrong, 12s` and `D03 S1 end — … 4 cards (1 right)`
- `D08 S1 #1 [open:liked] H2 guided … wrong, 15s` then `#2 [repair:missing-piece] H2 guided … wrong, 11s`
- `D23 S1 #4 [due-review] H3 full … skipped … "too hard"`, `D26 S1 #3 [side-door] H3 full … skipped … "too hard"`, `D28 S1 #3 [due-review] H3 full … "I don't know", 40s`
- `D17 S1 after #7 ★ moment shown: "Range of a resultant force: easy cards → full problems"`: "I had never seen a full problem, so I stopped trusting those."
- Worst moment: "D03 S1 #2: after missing a vertical throw question, the app gave me another guided one on the same skill, I got it wrong again, and I left with 1 right out of 4."

**Quit point:** none. Did not leave. Knowledge 0.40 → 0.45 → 0.48.

**Truth check:** no miss reported.

**Blind pair:** blind-8 with binge-quit, told apart 2/2 with app evidence (one planned session a day and declined "5 more" for this student).

**What the app should have done differently:** In a four-card session, one wrong answer followed by another guided card can ruin the day. The repair should be easy. A skipped full problem should not return as another full problem.

---

# binge-quit

**Who:** "When I start something new I go crazy with it and study for hours at a stretch. Then something else takes over and I vanish for weeks."

**Scores:** Fit 3 · Reaction 3 · Skips n/a · Kept adjusting 3 · Workload 3 · Progress shown 3 · Would I quit? 3

**Quotes that matter**
- `D04 S2 #2 [open:liked] H2 guided … wrong, 13s` then `#3 [repair:missing-piece] H2 guided … wrong, 15s`, and `D04 S2 #6 [close:winnable] H1 easy … closed the app without answering`
- `D21 S1 #1 [comeback:solid] H1 easy … right, 9s`: "The comeback on D21 was kind."
- `D24 S1 #8 [extend:liked] H2 guided … Vertical throw symmetry — wrong, 39s` then `#9 … closed the app without answering`
- `D03 S1 after #1 ★ moment shown: "Equations of motion: section solid"` then `D04 S1 #1 … Vertical throw symmetry — wrong, 16s`
- Worst moment: "D24 S1 #8-#9: right after a wrong answer I was pushed through '5 more' into the same guided Vertical throw card for the third time, got it wrong after 39s, and closed the app."

**Quit point:** D24 S1 #9. Did not leave the app. Knowledge 0.40 → 0.44 → 0.45.

**Truth check:** stamina 11.932 against a real 30. The early exits came from frustration, so stamina should have gone up, not down.

**Blind pair:** blind-8 with steady-five-min, told apart 2/2 with app evidence (comeback recognised on D21, extended sessions).

**What the app should have done differently:** The "5 more" cards should not repeat a skill the student just got wrong. Extra cards after a wrong answer should be winnable. The engine should have learned this student's high stamina from the long bursts.

---

# comeback-10

**Who:** "I study regularly but sometimes life gets in the way… When I come back I have forgotten quite a lot."

**Scores:** Fit 4 · Reaction 3 · Skips 2 · Kept adjusting 4 · Workload 3 · Progress shown 4 · Would I quit? 4

**Quotes that matter**
- `D20 S1 start — the app treats this as a comeback after time away` and `D20 S1 #1 [comeback:solid] H1 easy … right, 9s`
- `D21 S1 after #3 ★ moment shown: "Vertical throw symmetry: wrong on D03, right now"`: "the best part of the four weeks".
- `D08 S1 after #6 the app offers "5 more" — taken`, `D08 S1 #11 [extend:liked] H2 guided … wrong, 100s`, `D08 S1 end — the student left mid-session, 19 effort, 12 cards (8 right)`
- `D24 S1 #3 [due-review] H3 full … skipped … "too hard"` then `D27 S1 #4 [side-door] H3 full … skipped … "too hard"`
- Worst moment: "D08 S1 #11: after taking '5 more', I was wrong on the same Linear expansion card after 100 seconds, then got two more cards I could not finish and closed the app at 19 effort."

**Quit point:** none. Did not leave. Knowledge 0.45 → 0.47 → 0.49.

**Truth check:** memory ended at 1.7 and hit the 2.0 cap, against a true value below 1.0 (forget 1.3). It dipped correctly to 0.85 on day 6, then drifted the wrong way after the comeback.

**Blind pair:** none. This student was not in a blind pair.

**What the app should have done differently:** A 100-second answer inside "5 more" is a sign of fading, so the app should end the session there. A skipped Kinematics full problem should return as an easy or guided card. After the comeback, memory should have moved down, not up.

---

# slow-reader

**Who:** "I read very carefully and slowly because English is not my first language in science… I get tired sooner."

**Scores:** Fit 3 · Reaction 2 · Skips n/a · Kept adjusting 3 · Workload 4 · Progress shown 3 · Would I quit? 4

**Quotes that matter**
- `D07 S1 #4 [comfort-correction] H2 guided … wrong, 34s`
- `D12 S1 #2 [repair:missing-piece] H2 guided … Lenz's law — wrong, 35s` then `D12 S1 #3 [open:liked] H3 full … wrong, 81s`
- `D15 S1 #1 [open:liked] H1 easy … right, 25s`: "I liked the easy days like D15 and D16."
- `D05 S1 after #3 ★ moment shown: "Equations of motion: section solid"`: "felt untrue".
- Worst moment: "D12 S1 #3: after two wrong Lenz's law cards in a row, the app gave me a full 81-second resistor problem, and I got it wrong too."

**Quit point:** none. Did not leave. Knowledge 0.45 → 0.49 → 0.51.

**Truth check:** stamina 12.488 against a real 10, about 25% too high, though median time rose from 22s to over 30s by day 3. Memory ended at 0.739 against a true 1.0, after swinging between 0.5 and 1.18.

**Blind pair:** blind-7 with fast-guesser, told apart 2/2 with app evidence (H3 cards and fewer cards per session for this student).

**What the app should have done differently:** Long answer times should have lowered the stamina budget early. After two wrong answers, the next card should be easy, never a full problem. Comfort and repair cards should drop to H1 for this student.

---

# fast-guesser

**Who:** "I rush through questions without reading them properly… I never say I do not know, I would rather guess."

**Scores:** Fit 3 · Reaction 2 · Skips n/a · Kept adjusting 3 · Workload 4 · Progress shown 3 · Would I quit? 4

**Quotes that matter**
- `D03 S1 #2 [new:class-topic] H2 guided … wrong, 2s` then `#3 [repair:missing-piece] H2 guided … wrong, 2s`
- `D11 S1 #2 [repair:missing-piece] H2 guided … wrong, 2s`, `#3 [comfort-correction] H2 guided … wrong, 2s`, `#4 [comfort-correction] H1 easy … wrong, 1s`; `D11 S1 end — … 5 cards (1 right)`
- `D21 S1 #2 [open:liked] H2 guided … Vertical throw symmetry — wrong, 1s`
- `D17 S1 after #0 ★ moment shown: "Angular momentum: section solid"` then `D17 S1 #2 … Angular momentum — wrong, 2s`
- Worst moment: "D11 S1 #3: after two wrong guesses on the potential divider, the app gave me a third guided problem on it instead of something easy, and the day ended with one right out of five."

**Quit point:** none. Did not leave. Knowledge 0.30 → 0.33 → 0.34 (+0.039), which the spec counts as flat for a weak student.

**Truth check:** memory ended at 0.57 against a true 1.0, after swinging to 1.34 and down to the 0.5 floor.

**Blind pair:** blind-7 with slow-reader, told apart 2/2 with app evidence. The app's response, repair and comfort cards after fast wrong answers, was seen as a response to rushed errors.

**What the app should have done differently:** One- and two-second wrong answers on guided cards are guesses, not gaps in knowledge, and the app treated them as gaps. It should have noticed the answer speed and slowed the student down, for example with a card that asks for one step at a time. This is the one student who stayed all four weeks and still learned almost nothing.
