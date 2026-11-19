# UniKey test report, second judge pass (after changes 1–7)

_Date: 2026-11-19 · Simulator run seed 1, 28 days, 16 simulated students, engine at commit 5a0cba0 · 41 AI runs, all with OpenAI Codex (gpt-6.2-sol): 16 student judges, 8 blind-comparison judges, 16 truth checks, 1 summary · 1 invalid score (a misquoted log line, re-run once, still misquoted; the rest of that report counts) · The summary below is the Codex summary agent's text, unedited · First pass: [2026-11-16-judge-report-seed1.md](2026-11-16-judge-report-seed1.md)._

## Compared with the first pass

Read with care: the first pass used Claude judges, this one OpenAI Codex judges, so a score change can come from the judge as well as from the app. The five "design must change" lines are computed from the run and the reports, and compare more fairly.

| | First pass (2026-11-16) | Second pass (2026-11-19) |
|---|---|---|
| "Design must change" lines met | 2 of 5 | 2 of 5 (the same two) |
| A student quits before day 7 | weak-impatient, D02 | weak-impatient, D02 |
| Weak student flat after 4 weeks | weak-impatient, fast-guesser | weak-impatient, fast-guesser |
| Blind comparison | 15 of 16 right, 1 of 8 pairs failed | 15 of 16 right, 1 of 8 pairs failed |
| Judge quit points | weak-impatient, calc-strong-memory-poor, binge-quit | weak-impatient, fast-guesser, memory-good-calc-weak |
| Code checks | 6 of 7 old checks passed | 11 of 11 pass |

Mean rubric scores, first → second (1 to 5): Fit 3.00 → 3.50, Reaction 3.06 → 2.88, Skips 2.67 → 3.33, Kept adjusting 2.88 → 3.06, Workload 3.50 → 4.06, Progress shown 3.12 → 3.25, Would I quit? 3.69 → 3.88.

Notes from the controller (not from the judges):
- The one-feared-section complaint about Humidity "coming back early" is the skipped-section drip: one very easy card from a skipped section every second session, which the design asks for (§6). The judge read the skip line ("comes back from D16") as a promise that nothing from the section would appear before then. The packet wording, or the drip itself, may need a look.
- New in this pass: fast-guesser and memory-good-calc-weak now have quit points. Both point at full problems served too soon (a "level up" message on thin evidence; full calculation problems after repeated failures).

---

- **met** — any persona would quit before day 7. Evidence: weak-impatient: judge's quit point D02 S1 #4; weak-impatient: stopped using the app on D02 (16 of 16 students judged).
- **not met** — two different personas get near-identical sessions. Evidence: every pair had at least one answer right (8 of 8 pairs judged).
- **met** — a weak persona's hidden knowledge is flat after 4 weeks (weak: prior ≤ 0.3; flat: gain < 0.05). Evidence: weak-stubborn 0.15 → 0.22 (not flat, +0.070); weak-impatient 0.15 → 0.15 (flat, −0.001) (stopped using the app on D02); fast-guesser 0.30 → 0.33 (flat, +0.028).
- **not met** — a skipped section returns the next day, or never. Evidence: code check skip-timing passed: 3 skips, remind days on schedule, kept away until then and back by the cap.
- **not met** — the blind comparison fails for more than a quarter of pairs (a pair fails unless every answer is right). Evidence: 1 of 8 pairs failed (13%): weak-stubborn / weak-impatient (8 of 8 pairs judged).

UniKey falls short of Viraj’s test for “done.” It changed the level, length, and content of sessions across students, and all 15 who kept practising ended above their starting knowledge. The blind judges got 15 of 16 answers right, all 15 backed by app evidence under the test’s rule. Most also cited student behaviour, so that count shows visible differences in what the app served and gives limited evidence about whether it learned the underlying traits. The weak, impatient student left on day two, the fast guesser’s gain was below the flatness threshold, and the student who remembered theory well still faced full calculations after repeated failures.

# Where the app failed which kind of student

1. **Weak and impatient (`weak-impatient`).** The only student to leave the app did so on D02. Fit, Reaction, Kept adjusting, and Workload all scored 2, and Would I quit? scored 1. “I’d just got Faraday’s law wrong twice and another question popped up when I was already done.” Blind pair 2 identified who gave up sooner but could not tell who tired sooner. Hidden knowledge changed by −0.001.
2. **Fast guesser (`fast-guesser`).** The app promoted the student from easy cards to full problems on weak evidence. The D11 message “Power, force and speed: easy cards → full problems” was followed by a five-second wrong answer on the full problem. Progress shown and Would I quit? both scored 2. The judge marked D12 S1 #3 as the quit point, and the student continued in the simulation. Knowledge gained only +0.028, below the flatness threshold.
3. **Good memory, weak calculation (`memory-good-calc-weak`).** Fit scored 5, but Kept adjusting and Would I quit? both scored 2. The student got 121 of 131 guided cards right and zero of 17 full cards right. Another full Wheatstone bridge problem followed a 104-second struggle the day before. The judge marked D28 S1 #3 as the quit point, with no simulated departure.
4. **One feared section (`one-feared-section`).** Humidity came back on D14 as `skipped-drip` after the D13 skip said it would return from D16. The same pattern occurred on D27–D28 with D35 shown as the return day. Skips scored 3 and the student stayed. The `skip-timing` code check passed its three test skips, as reflected in the marking above. The student log documents premature returns in this run.
5. **Weak but persistent (`weak-stubborn`).** Fit, Reaction, and Kept adjusting all scored 2. The student described “two days in a row without a right answer,” and the truth check found that the engine underestimated stamina and expected a higher success rate than this student needed. The student kept practising and gained +0.070.
6. **Strong calculation, poor memory (`calc-strong-memory-poor`).** Reaction scored 2. In blind pair 4, the student got a guided ideal-gas review right on D11 and missed it on D12. The truth check found the wrong practice mix and an underestimated stamina. Knowledge went from 0.50 to 0.53 at D14 and ended at 0.52. Progress shown was invalid.
7. **Confident with misconceptions (`confident-misconceptions`).** Reaction scored 2. Guided beam questions went wrong on D14, D16, and D21. After the last miss the app closed with an easy Faraday’s law card, leaving the student without a chance to retry the beam skill that session.
8. **Average, with a fast-moving class (`average-fastclass`).** Fit scored 2. The student got an easy resistor card right on D02, could not answer the full version on D03, then missed the guided version after an easy repair. Blind pair 6 confirmed that the app followed class topics. The level of those problems was a separate weakness.
9. **Slow reader (`slow-reader`).** The app repeated a full potential divider problem the day after a 98-second “I don't know.” Kept adjusting scored 3. Blind pair 7 also showed a useful adjustment later, when the app ended a four-card session after four correct answers.
10. **Underconfident skipper (`underconfident-skipper`).** The app stepped down effectively after some skips, earning Skips 4. The truth check found a review-gap multiplier of 2 for a student with average forgetting. Skips made the high accuracy on attempted cards a weak basis for extending reviews.
11. **Quick learner with little patience (`smart-impatient`).** Reaction and Kept adjusting scored 3. After a 36-second miss, an easy card on another topic felt like wasted time. By D04 the truth check found that the engine’s success target was too low for a student who tolerated only two clustered misses or two bad sessions.
12. **Average, studying alone (`average-noclass`).** Fit and Reaction scored 3. On D10 the app switched to an easy card on another topic, then returned to Lenz’s law at the same guided level and the student missed again. The student still scored Would I quit? 5 and finished at 0.46, up from 0.40.
13. **Studies in bursts (`binge-quit`).** The student left during the D06 extra set after two misses. Workload scored 4 and Would I quit? 5. The easy D21 comeback worked, although the truth check found that the engine had set longer review gaps for a student who forgets faster than average.
14. **A few minutes every day (`steady-five-min`).** Workload and Would I quit? both scored 5. The main lapse was another full latent heat card the day after an “I don't know” on the same skill. Reaction and Kept adjusting scored 3.
15. **Returning after ten days (`comeback-10`).** The comeback session earned a strong response, with Workload and Would I quit? both scoring 5. The app called resistors “solid” on D25 and the student missed a full resistor problem the next day. The truth check also found that review gaps were slightly above default for a student who forgets faster than average.
16. **Strong and keen for more (`strong`).** The app provided stretches and lengthy extra sets, and Would I quit? scored 5. The student’s main complaint was a third guided resistor card in a row during extras. Workload scored 3, and the truth check found stamina underestimated at 18.238 versus 25 effort.

**What worked well.** Easier same-skill repairs gave students an immediate way back in, easy comeback openers helped after long gaps, and optional extras let students choose when to stop. All 11 code checks passed, including 370 engine-ended sessions with none ending after a wrong answer. The 15 students who kept practising all gained knowledge, and the code check reported a mean gain of +0.051.

---

## average-noclass

> I study by myself because I do not go to any tuition class.

**Scores** — Fit 3 · Reaction 3 · Skips n/a · Kept adjusting 4 · Workload 4 · Progress shown 3 · Would I quit? 5

**Key quotes.** “At D10 S1 #6 I got Lenz’s law wrong again after a run of easy cards on other topics, and I still felt stuck on the same thing.” The D17 message “Resistors in series and parallel: wrong on D03, right now” showed a gain the student could recognise.

**Quit point.** None. Stayed through the run.

**Truth check.** The review-gap multiplier fell to 0.67 by D12 despite average forgetting, which fits 1. Stamina fell to 8.889 by D10 against a true 14 effort, after a slower session the student completed.

**Blind pair 6 with average-fastclass.** Both identifications were right and both had app evidence. The fast-class answer used app evidence only. The self-study answer used the student’s topic choice and the app’s follow-up selections from that topic and from exam-weighted material.

Give an easier Lenz’s law card before returning to the guided problem. Use evidence from guided work before announcing a jump from easy cards to full problems.

---

## average-fastclass

> I am an ordinary student and I go to a tuition class that rushes through the syllabus.

**Scores** — Fit 2 · Reaction 3 · Skips n/a · Kept adjusting 3 · Workload 4 · Progress shown 3 · Would I quit? 4

**Key quotes.** “D03 S1 #3 felt especially discouraging because the app had just said I was ready for guided resistor problems and I immediately got one wrong.” The opening full resistor problem at D03 S1 #1 drew “I don't know” after 37 seconds.

**Quit point.** None. Stayed through the run.

**Truth check.** The review-gap multiplier fell to 0.57 by D14. The student forgets at an average rate, which fits a multiplier around 1.

**Blind pair 6 with average-noclass.** Both identifications were right and both had app evidence. The fast-class answer used only app evidence, including class-topic changes and cards selected from those topics. The self-study answer used both the student’s topic choice and the app’s card selections.

Open fresh class material at an accessible level and check whether the student can use the method before serving full problems. Give a simpler potential divider step after repeated guided misses.

---

## strong

> I like long sessions and I usually want to do some extra questions after I finish.

**Scores** — Fit 3 · Reaction 4 · Skips n/a · Kept adjusting 4 · Workload 3 · Progress shown 4 · Would I quit? 5

**Key quotes.** “At D07 S1 #11, getting a third guided resistor card in a row when I'd asked for extra practice made me wish I'd stopped the session at the offer.” On D19 the app recorded “the 5 extra cards done, 25.5 effort, 13 cards (10 right), fixed 1, streak kept.”

**Quit point.** None. Stayed through the run.

**Truth check.** Stamina was 18.238 by D19 versus a true 25 effort. The student completed a 13-card session and a seven-card session that day without leaving early.

**Blind pairs.** Pair 1 with weak-stubborn was 2/2 with app evidence on both answers. The judge used both student performance and the app’s easier repairs, early endings, full stretches, and extra sets. Pair 3 with smart-impatient was also 2/2 with app evidence on both answers. The attendance answer relied on student attendance and cited an easy app-selected close after a gap. The extras answer used both student choices and how the app extended or ended sessions.

Vary the extra set and use full problems where the student has shown readiness. Give completed long sessions more weight before lowering the stamina estimate.

---

## weak-stubborn

> But I do not give up, I keep coming back even when I get many wrong in a row.

**Scores** — Fit 2 · Reaction 2 · Skips n/a · Kept adjusting 2 · Workload 4 · Progress shown 3 · Would I quit? 4

**Key quotes.** “Missing the last easy card at D10 S1 #4 made me feel like nothing was sticking after two days in a row without a right answer.” On D12 the log said “the app ended the session early, 5.5 effort, 4 cards (1 right), fixed 0, streak kept.”

**Quit point.** None. Stayed through the run.

**Truth check.** By D02 the comfort estimate was 0.75 despite tolerance for eight wrong answers and eight bad sessions. The stamina estimate fell to 8.889, away from the true 14 effort and the closer starting estimate of 13.34.

**Blind pairs.** Pair 1 with strong was 2/2, both with mixed student and app evidence, including easier repairs and shorter sessions for this student. Pair 2 with weak-impatient was 1/2. The judge correctly identified who gave up sooner using exits and the app’s response to misses, but could not tell who tired sooner using the available student and app evidence.

After repeated misses, give a worked first step and one short attempt on the same skill. Use this student’s willingness to continue to make room for that repair when they still have energy.

---

## weak-impatient

> When I get a couple of questions wrong I want to throw my phone down.

**Scores** — Fit 2 · Reaction 2 · Skips n/a · Kept adjusting 2 · Workload 2 · Progress shown 3 · Would I quit? 1

**Key quotes.** “By then I wanted one question I could actually get right on the thing I’d just missed.” At D02 S1 #4 the app served an easy Back e.m.f. comfort correction, and the student “closed the app without answering.”

**Quit point.** D02 S1 #4. Left on D02 and had no sessions on D03–D28.

**Truth check.** No trait miss was listed.

**Blind pair 2 with weak-stubborn.** The judge identified this student as the one who gave up sooner, citing both student exits and app behaviour, including the comfort card after two misses. The judge answered “cannot tell” on who tired sooner. That answer also cited both evidence types and did not count. Result 1/2, with one right answer backed by app evidence.

Use the D01 exit to make the next session shorter. After a second miss, offer one worked step on the same skill with an option to finish there.

---

## smart-impatient

> If a few questions go wrong or the session drags on, I am done.

**Scores** — Fit 4 · Reaction 3 · Skips n/a · Kept adjusting 3 · Workload 4 · Progress shown 3 · Would I quit? 4

**Key quotes.** “At D05 S1 #4, getting an easy card on a different topic after spending 36 seconds on a problem I got wrong felt like a waste of my time.” The log records a declined “5 more” offer after seven cards on D11. The student declined all seven offers.

**Quit point.** None. Stayed through the run.

**Truth check.** Comfort was 0.71 by D04, too low a success target for a student who tolerates two clustered misses or two bad sessions. By D22 `h3Share` reached 0.5 with equal calculation and concept modifiers, which fit the default 0.4.

**Blind pair 3 with strong.** Both answers were right and both cited app and student evidence. Attendance identified this student’s alternating study days, with an easy closing card after a gap as the app evidence. The other answer used the students’ choices about extras and how the app extended or ended their sessions.

After a slow miss, offer a brief same-skill repair or a clean finish. Reduce repeated extra-set offers after consistent declines and base the full-problem mix on performance.

---

## memory-good-calc-weak

> I remember definitions and explanations very well, even weeks later. The ideas make sense to me. But when it comes to working out numbers I make silly mistakes and get stuck. Calculations are the part I dread.

**Scores** — Fit 5 · Reaction 4 · Skips n/a · Kept adjusting 2 · Workload 4 · Progress shown 3 · Would I quit? 2

**Key quotes.** “At D28 S1 #3, seeing another full Wheatstone bridge problem the morning after I spent 104 seconds stuck on one made me want to close the app for good.” On D08 the full resistor review drew “I don't know” after 34 seconds, then the guided repair on the same skill was right in 15 seconds.

**Quit point.** D28 S1 #3 in the judge’s assessment. No simulated departure.

**Truth check.** `h3Share` was 0.4 by D14. With calculation at −0.3 and concepts at +0.2, the truth check called for a higher setting to provide more guided practice leading into full problems.

**Blind pair 4 with calc-strong-memory-poor.** Both identifications were right and both used app and student evidence. The app’s immediate guided step-down showed how it handled this student’s full-problem miss. Student answers supplied the broader contrast in full calculation and short-gap recall.

Break calculations into guided steps and check that the student can combine them before serving a full problem. Use a guided Wheatstone bridge review after the long struggle and hold the promotion message until the student shows readiness.

---

## calc-strong-memory-poor

> I am good at working through numerical problems once I know the formula. The trouble is I forget things quickly, so last week's lesson is often gone. I need to see things again and again. Theory questions are where I lose marks.

**Scores** — Fit 4 · Reaction 2 · Skips n/a · Kept adjusting 3 · Workload 4 · Progress shown — · Would I quit? 4

**Key quotes.** “On D07 S1 #5, I was already stuck on average velocity, and getting another unfamiliar guided problem wrong straight away made me feel like I was falling behind.” The guided ideal-gas review went from “right, 11s” on D11 to “wrong, 12s” on D12.

**Quit point.** None. Stayed through the run.

**Truth check.** `h3Share` was 0.4 by D14. The check called for a lower full-problem share and more concept and method cards given calculation +0.25 and concepts −0.1. Stamina fell to 10.889 by D12 against a true 14 effort, with no early exits or answers past that threshold.

**Blind pair 4 with memory-good-calc-weak.** Both identifications were right and both used app and student evidence. The recall answer mainly drew on correct reviews followed by short-gap misses. Its app evidence was an easy missing-piece card following a guided review miss.

**Invalid entry.** Progress shown was unscored because the cited D28 S1 #4 potential divider success was absent from the packet log.

Bring back formulas and methods at short intervals and check recall before asking the student to use them in a calculation. After a review miss, repair the missing piece on that skill before introducing another unfamiliar problem.

---

## confident-misconceptions

> The thing is, I have some wrong ideas stuck in my head from the past and I do not notice them.

**Scores** — Fit 3 · Reaction 2 · Skips n/a · Kept adjusting 3 · Workload 4 · Progress shown 3 · Would I quit? 4

**Key quotes.** “At D21 S1 #6 I was sure of my beam answer again, got it wrong again, and the next card moved on before I could try what the explanation had just shown me.” The next card was an easy Faraday’s law `close:winnable`.

**Quit point.** None. Stayed through the run.

**Truth check.** The review-gap multiplier was 1.386 by D17 despite average forgetting. Stamina was 9.402 by D06 versus a true 16 effort.

**Blind pair 5 with underconfident-skipper.** Both identifications were right and both used app and student evidence. The judge cited repeated quick misses alongside the app’s easy repairs and its switch to a different skill after the D21 beam miss. The other student’s guided step-downs and skip follow-ups were also visible.

When a wrong answer recurs, give a short explanation of the specific mistake and an immediate same-skill check. Review it again soon to see whether the correction stuck.

---

## underconfident-skipper

> When a question looks hard I would rather skip it or say I do not know.

**Scores** — Fit 4 · Reaction 3 · Skips 4 · Kept adjusting 3 · Workload 4 · Progress shown 3 · Would I quit? 4

**Key quotes.** “At D15 S1 #8, getting the easy graphs card wrong right after another miss made me feel like I'd lost my grip on something I'd been getting right.” After skipping the full potential divider card as “Too hard” on D11, the student got the guided review right in 12 seconds on D12.

**Quit point.** None. Stayed through the run.

**Truth check.** Comfort was 0.67 by D14, with little evidence about tolerance for clustered misses because the student often skipped uncertain cards. The review-gap multiplier reached 2 by D07 despite average forgetting. Stamina fell to 9.788 by D26, overshooting the true 12 effort.

**Blind pair 5 with confident-misconceptions.** Both identifications were right and both used app and student evidence. This student’s answer was backed by skips and “I don't know” responses, plus the app’s immediate easier repairs and guided return after a full-card skip.

Use guided attempts to build confidence on intimidating skills and show where the student has already succeeded. Account for skipped cards before stretching review gaps or lowering the success target.

---

## one-feared-section

> There is one part of the syllabus that scares me and I always have been weak at it, so I avoid it whenever I can.

**Scores** — Fit 4 · Reaction 3 · Skips 3 · Kept adjusting 3 · Workload 5 · Progress shown 3 · Would I quit? 4

**Key quotes.** On D13 the Humidity skip said “section comes back from D16.” On D14 the student reported, “Humidity came back the very next day after I’d asked for a break, and I felt like I had to ask all over again.”

**Quit point.** None. Stayed through the run.

**Truth check.** The review-gap multiplier was 0.548 by D10 despite average forgetting. `h3Share` was 0.5 by D26 despite equal calculation and concept modifiers. Initial Humidity knowledge was 0.1, a local weakness.

**Blind comparison.** This student was outside the eight blind pairs, so there is no blind identification result. The `skip-timing` code check passed, while the student log records the next-day `skipped-drip` returns.

Keep Humidity out of every selection path until the date shown after a section skip. At the scheduled return, offer a short introductory step and use the result to adjust Humidity practice specifically.

---

## steady-five-min

> I only have a few minutes each day because of school and other classes.

**Scores** — Fit 4 · Reaction 3 · Skips 3 · Kept adjusting 3 · Workload 5 · Progress shown 4 · Would I quit? 5

**Key quotes.** “On D20 S1 #5, I spent another half minute stuck on a full latent heat problem after saying ‘I don't know’ on the same skill the day before.” The student also said, “I always declined ‘5 more.’ One round was enough, and I could leave with my streak.”

**Quit point.** None. Stayed through the run.

**Truth check.** The review-gap multiplier was 0.608 by D08 despite average forgetting, which fits a multiplier near 1.

**Blind pair 8 with binge-quit.** Both identifications were right and both used app and student evidence. The student’s daily attendance and declined extras supported the steady pattern. The app’s planned short endings and same-skill repair were visible, as were the binge student’s comeback opener and extended set.

Step latent heat down to a guided attempt the day after a full problem leaves the student stuck. Keep the short daily finish and make extra cards available on request after repeated declines.

---

## binge-quit

> When I start something new I go crazy with it and study for hours at a stretch. Then something else takes over and I vanish for weeks.

**Scores** — Fit 4 · Reaction 3 · Skips n/a · Kept adjusting 4 · Workload 4 · Progress shown 4 · Would I quit? 5

**Key quotes.** “On D06 S2 #11 I closed the app after missing two of the extra questions and feeling like I’d pushed myself past the point where I wanted to study.” On D21 S1 #1 the app opened with an easy `comeback:solid` projectile card, answered “right, 10s.”

**Quit point.** None. Left the D06 session early and returned to the app on D21 after 14 days away.

**Truth check.** The review-gap multiplier was 1.63 by D21, even though the student forgets faster than average and needs a multiplier below 1. Stamina rose to 16.34 by D21 against a true 30 effort.

**Blind pair 8 with steady-five-min.** Both identifications were right and both used app and student evidence. This student’s second sessions, exit and 14-day absence showed the burst. The app provided an easy comeback opener and later ran an extra set out to 13 cards.

Offer a clean stopping point when misses begin to cluster in a second session. Keep the easy comeback opener and follow it with short-gap checks on skills likely to have faded.

---

## comeback-10

> I can disappear for a long stretch and then return. When I come back I have forgotten quite a lot.

**Scores** — Fit 4 · Reaction 3 · Skips n/a · Kept adjusting 4 · Workload 5 · Progress shown 4 · Would I quit? 5

**Key quotes.** “Getting the first few cards right on day 20 made it easier to start again.” On D25 the app showed “Combination of resistors: section solid.” The student missed the D26 full review in 40 seconds.

**Quit point.** None. Returned on D20 after ten days away and stayed through the run.

**Truth check.** The review-gap multiplier was 1.017 by D24. The true forgetting trait of 1.3 calls for a multiplier below 1.

**Blind comparison.** This student was outside the eight blind pairs, so there is no blind identification result.

Keep the easy return session and use the next few sessions to check which skills survived the break. Require another successful review before calling a section solid, and follow misses with a simpler attempt on the same skill.

---

## slow-reader

> I read very carefully and slowly because English is not my first language in science.

**Scores** — Fit 4 · Reaction 3 · Skips 3 · Kept adjusting 3 · Workload 4 · Progress shown 3 · Would I quit? 4

**Key quotes.** “On D15 S1 #4, seeing another full potential divider problem after spending 98 seconds on one the day before left me tired before I even started reading.” The student later got the full problem right in 99 seconds on D27, and the app ended the four-card session as planned.

**Quit point.** None. Stayed through the run.

**Truth check.** The review-gap multiplier fell to 0.747 by D04 despite average forgetting, which fits the default of 1.

**Blind pair 7 with fast-guesser.** Both identifications were right and both used app and student evidence. The students’ response times distinguished their pace. The app evidence included a lower-height card and a four-card finish for this student, and an easy repair and an early finish for the fast guesser.

Use the student’s usual reading time when budgeting the session. After a long unanswered full problem, bring the skill back as a shorter guided review and reserve the full version for when the student has shown readiness.

---

## fast-guesser

> I rush through questions without reading them properly.

**Scores** — Fit 4 · Reaction 3 · Skips n/a · Kept adjusting 3 · Workload 5 · Progress shown 2 · Would I quit? 2

**Key quotes.** On D11 the app showed “Power, force and speed: easy cards → full problems.” On D12 S1 #3 the full problem was “wrong, 5s.” The student said, “The jumps to full problems felt like the app was reading too much into my taps.”

**Quit point.** D12 S1 #3 in the judge’s assessment. No simulated departure.

**Truth check.** Comfort was 0.75 by D08 despite tolerance for six wrong answers and five bad sessions, which permits a lower success target. The review-gap multiplier was 0.893 by D09 against a default of 1 for average forgetting. Stamina was 9.202 by D12 versus a true 18 effort.

**Blind pair 7 with slow-reader.** Both identifications were right and both used app and student evidence. The quick taps identified the guessing pattern. The app’s easy repairs and early ending showed how it responded to misses, with no evidence in that comparison that the engine recognised a lucky correct tap.

Treat a very fast correct tap as tentative and verify it using a short guided step or a later review before promoting the skill. Keep sessions short and use progress messages for gains the student has demonstrated more than once.