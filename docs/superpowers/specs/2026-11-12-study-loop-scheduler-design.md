# Study loop and scheduler: design

_Date: 2026-11-12 · Status: draft for Viraj's review · From a brainstorm between Viraj and Claude · Nothing is built yet._

**Proposed changes after the first judge pass:** [design changes, 2026-11-16](2026-11-16-study-loop-design-changes.md) (draft, not accepted).

Related: [product spec](../../living/product-spec.md) · [content authoring spec](../../living/content-authoring.md) · [DR-0004](../../decisions/0004-schedule-skills-not-cards.md) · [DR-0019](../../decisions/0019-teen-retention-design.md) · [DR-0022](../../decisions/0022-typed-skill-graph.md) · [expert review](../../reviews/2026-11-11-expert-review.md)

Lines marked **(Viraj)** are what Viraj said in the brainstorm. Lines marked **(my call)** are choices Claude made that Viraj has not confirmed one by one; he can overrule any of them.

---

## 1. Intent

Students quit study apps when the questions feel too hard. UniKey's study loop must not let that happen. **(Viraj)**

The app should fit itself to each student and keep fitting as the student changes, while the student gets better. A weak student, a strong one, a lazy one, one with a good memory and weak calculation, and the reverse, should each get a visibly different app. It is not a preloaded list of 10–20 questions a day. **(Viraj)**

Viraj's test for "done": "I feel like the app really works, it adjusts to the student's level, it keeps adjusting with the student, while improving the student."

## 2. Goals, non-goals, anti-goals

**Goals**
1. Each next card is chosen from what the student just did, not from a fixed list.
2. A hard question is followed by help: the missing piece as an easy card, then easier questions on the same topic, so the student leaves thinking "I know this topic; I was missing a few things, and I learned them." **(Viraj)**
3. A student can skip a section at any time. A skip means "remind me later", never "never". **(Viraj)**
4. The app keeps a small, measurable profile of each student and the scheduler reads it. **(Viraj)**
5. The session ends by effort and stamina, not by a card count. Being weak never means more work. **(Viraj)**
6. The student can see that they improved.
7. The whole engine runs as text with no phone, so AI agents can play students against it. **(Viraj: "100% agree")**

**Non-goals for the January pilot (my call)**
- Separate scores for motivation, interests and focus. Comfort level, stamina and skips cover the same ground and can be measured from about day 3. A pilot student gives roughly 300–500 answers, which is enough to learn 3–4 numbers well, not ten.
- Tuning by time of day.
- The screens. This document covers the engine and what it tells the UI to show, not layout.
- Backend sync, the teacher dashboard, payments.
- The full two-engine design in DR-0022 (FSRS per card plus Elo per skill, implicit review weights, adaptive placement). See §12.

**Anti-goals: these make it a failure even if it runs**
- A weak student gets more work than a strong one.
- A session ends on a wrong answer.
- A skipped section comes back the next day, or never comes back.
- Two very different students get nearly the same sessions.
- The app shows a backlog, a "due" count, or anything that reads as debt ([DR-0019](../../decisions/0019-teen-retention-design.md)).

## 3. Words used here

| Word | Meaning |
|---|---|
| **Skill** | One node of the unit skill graphs in `content/skills/<unit>/graph.json` |
| **Section** | A sub-topic: the `subtopic` field on a skill (an NIE content heading). This is the unit a student skips. **(my call)** |
| **Height** | How demanding a card is for a skill. Three heights (§4). |
| **Card** | Anything shown as one question: an L1/L2 card, an L3 scenario, or one variant of an L4 template or statement bank |
| **Effort** | The session's currency (§8). Cards cost effort; the session has an effort budget. |
| **Profile** | Four numbers per student, plus skip memory per section (§7) |

## 4. Three heights per skill

Every skill is practised at one of three heights. Content already has the layers; the heights group them. **(my call on the mapping)**

| Height | Feels like | Content used |
|---|---|---|
| **1 Easy** | "I know this fact" | L1 recall cards and 2-option L2 cards (form F10) |
| **2 Guided** | "I see the idea / I know which method" | Other L2 cards (traps, scaling, graphs, "what's wrong with this thinking") and L3 method scenarios |
| **3 Full** | "I can do the exam question" | L4 templates and statement banks |

Rules:
- Each student has a current height for each skill they've started. A new skill starts at height 2, or height 1 if the student's comfort level is low (§7) or the section is returning from a skip (§6).
- **Step up:** two cards right in a row at the current height, on different days or at least 5 cards apart, moves the skill up one height.
- **Step down:** see §5.
- A skill is **solid** when the student has answered height-3 cards right on two separate days. Skills with no height-3 content are solid at height 2 by the same rule.
- A card that lists two skills counts for its first (primary) skill only. **(my call)**
- Not every skill has all three heights. The engine uses what exists and never shows an empty height. Content gaps are in §11.

## 5. The live loop: what happens after each answer

The engine picks one card at a time. After each answer it decides the next.

**After a right answer**
- Count toward step-up for that skill.
- Move to the next thing in the session plan (§8). Do not stay on one skill for more than 3 cards in a row unless a repair is running.

**After a wrong answer: the repair path** **(Viraj: hint as the next card, then tuned-down questions)**
1. **Show feedback** as now: the mistake's message (from the wrong option's tag or `detail`) and the explanation.
2. **Next card = the missing piece, as a question.** Pick a height-1 or height-2 card from the same skill that teaches the thing the student just got wrong. Selection order:
   1. a card whose own wrong options carry the same error tag as the option the student picked
   2. a card with the same `note_ref`
   3. any height-1 card of the same skill
   4. if the skill has none, a height-1 card from its weakest `requires` prerequisite
3. **Then one easier card** on the same skill, one height below the failed card (or the same height if already at 1), chosen to be answerable. This is the confidence card.
4. **Then leave the skill.** The original card's skill returns later: in the same session if at least 4 other cards have passed and effort remains, otherwise next session. It returns as a new variant, never the same numbers.
5. If the student gets step 2 or step 3 wrong, do not stack a second repair. Lower the skill's height by one, show the explanation, and move to a different, liked section (§7). Two wrong answers in a repair is a "bad moment"; three bad moments close together triggers the early end (§8).

**"I don't know"** is a button on every card. It runs the repair path exactly like a wrong answer but costs no extra effort (§8) and carries no negative message.

**Step down** happens when a skill gets two wrong answers at its current height within its last four cards, or one failed repair.

## 6. Skip: "remind me later" **(Viraj)**

- Every card has **Not now**. It skips the card's **section** (sub-topic), not just the card.
- The first skip of a section in a session asks nothing. It simply moves on to a different section.
- **Optional one-tap reason** on the confirmation toast: *Not learned yet · Too hard · Later*. **(my call)** No answer is treated as *Later*.
  - *Not learned yet*: the section stays away until the student's class reaches it (the "teaching now" topic, where there is one) or until the normal remind time, whichever is first.
  - *Too hard*: when it returns, it returns at height 1.
  - *Later*: normal remind time.
- **Remind times:** 3 days after the first skip, then 5, 8, 13, then every 14 days. The cap is 14 days. **(my call on the numbers; Viraj set the shape: a bit further each time, with a cap)** Any right answer on the section resets the count.
- **While a section is skipped,** the student still gets one very easy theory card from it every second session: a height-1 card, placed in the middle of the session, not labelled as the skipped section. **(Viraj: "we give some hint, theory notes, very easy ones")** If the student skips that too, stop these until the remind time.
- **When the remind time arrives,** the section comes back through a **side door**: one height-1 card mixed into the normal session. If it's answered right, the app says so plainly: "That was circular motion. You got it." Then the section rejoins normal scheduling at height 1.
- **On the second skip and after,** before moving on, show the section's value once: "About 13% of Mechanics marks come from this section. Three skills here give most of them." The numbers come from the skills' `exam_weight`. The student can still skip. No lock, no force. **(Viraj)**
- A skipped section is never shown as red, failed or overdue anywhere.

**Other ways the engine builds confidence on an avoided section** (Viraj asked for ideas and accepted this list):
- **Borrowed strength:** when the section returns, prefer a skill whose `requires` or `helps` neighbour the student is already solid on, and say so: "You're strong in resolving forces. This is the same move, on a circle."
- **Smallest win list:** the value message names the 3 highest-weight skills in the section and shows them ticked as they become solid.
- **Guided before full:** a returning section never jumps to height 3 on its first two days.
- **Class timing:** if the class's "teaching now" topic contains the section, the remind time is brought forward to today, through the side door.
- **Proof of progress:** see §9.

## 7. The student profile

Four numbers, each read from behaviour the app can see, each turning one dial. All start at a default and move slowly (a moving average over about the last 60 cards or 7 sessions). **(my call on the set; Viraj asked for measurable measures that personalise the algorithm)**

| Number | Read from | Default | Turns |
|---|---|---|---|
| **Comfort level**: the success rate at which this student keeps going | Success rate in sessions the student finished or extended, against sessions they left early | Aim for 75% right | The target success rate for the session, between 65% and 85%. The engine picks heights and skills so the expected success rate sits at the target. |
| **Memory**: how quickly things fade for this student | For skills that came back for review: how often the first card back was right, against what the gap predicted | 1.0 | Multiplies every review gap, between 0.5 (forgets fast, review sooner) and 2.0 |
| **Calculation vs concept** | Success at height 3 against success at heights 1–2, on skills the student has started | Balanced | The share of each height in the session. A student strong on ideas and weak on calculation gets more guided-to-full ramps; the reverse gets more concept and method cards. Never less than 20% of effort on the weaker side. |
| **Stamina** | The effort spent before the student slows sharply (answer time more than double their usual), starts missing, or leaves | 12 effort | The session's effort budget (§8) |

Plus, per section:
- **Skip memory:** skip count, next remind date, last reason.
- **Liking:** a simple score that goes up when the student extends a session on that section or answers it faster than usual, and down on skips and slow answers. Used only to choose which sections open and close a session. **(my call)**

Two fallbacks **(my call)**:
- **No liking history yet:** "liked" means the sections with the student's highest success rate; with no answers at all, the easiest section of the current topic.
- **No class:** the "current topic" is the unit and topic the student picked in the app (the unit chips today). When a teacher's "teaching now" exists later, it takes priority.

Starting values for a brand-new student come from onboarding: which units they've covered, and the quick check's success rate sets the first comfort level. Until the placement design exists, a new student starts at the defaults.

The profile is stored on the phone and included in the uploaded events, so a teacher view or an analysis can use it later.

## 8. The session: a budget of effort **(Viraj: stamina, interest, and weak does not mean more work)**

**Effort costs (starting values, my call):**

| Card | Effort |
|---|---|
| Height 1 | 1 |
| Height 2 | 1.5 |
| Height 3 | 4 |
| A wrong answer | +1 on top |
| "I don't know" | +0 |

- **Budget:** the student's stamina number, minus 10%, so the session ends before they fade. Default 12 effort, about 5 minutes.
- **Minimum day:** 8 effort. Reaching it keeps the streak, whatever the card count. An early end on a bad day (below) also keeps the streak. **(my call)** This replaces "10 questions keeps the streak" in DR-0019 with the same idea measured in effort.
- **Hard cap:** 40 effort a day for everyone, about 20 minutes, across all sessions that day.
- Because step-down cards are cheap, a weak student may see more cards than a strong one for the same effort. The effort a weak student is asked for must never be more than a strong student's.

**Session plan.** At the start, the engine sketches the session, then revises it after every answer:

| Part | What goes here |
|---|---|
| **Open** (first 2–3 cards) | A liked section, at a height the student usually gets right |
| **Middle** | In priority order: repairs in flight → skills due for review → new skills from the class's current topic (or the next by exam weight) → one easy theory card from a skipped section, or a side-door return |
| **Close** (last card) | A card the student is very likely to get right, from a liked section |

**Choosing the next skill in the middle (my call):**
1. A skill is **due** when today is on or after its next review date. Review gap after a right answer at the skill's current height: 1 day, then 3, 7, 14, 30, each multiplied by the student's memory number. A wrong answer sets the gap back to 1 day.
2. Among due skills, prefer those in the class's current topic, then higher `exam_weight`, then longest overdue. Never show how many are due.
3. If nothing is due, introduce a new skill: in the current topic first, with `requires` prerequisites solid or at least started, highest `exam_weight` first. At most 2 new skills in a session, and none if the expected success rate is already below the target.
4. Check the pick against the comfort level: if the session's running success rate is below target, the next non-repair card comes from a height or skill the student usually gets right.

**Three ways the day ends:**
1. **Budget spent:** "Done for today." The normal end.
2. **Bad day:** three bad moments (§5) within 8 cards, or answer times more than double the student's usual for 3 cards running. The engine serves one card the student is very likely to get right, then ends early: "Enough for today. You fixed 2 things." It never ends on a wrong answer.
3. **Good day:** success rate above target and answers faster than usual when the budget runs out. Offer "5 more" once, from a liked section. "Done for today" and "5 more" keep equal weight, as in DR-0019.

**Coming back after days away:** the first session back uses a budget of 8 effort, opens with height-1 cards from sections the student was solid on, and never mentions what was missed.

## 9. Showing the student they improved

The engine emits these as **moments** for the UI to show. It decides when; the UI decides how.

| Moment | When the engine emits it |
|---|---|
| **Height up** | A skill moves up: "Circular motion: guided → full problems" |
| **Then wrong, now right** | A skill the student first failed is answered right at the same or higher height, at least 5 days later. Emitted with both dates. |
| **Avoided, now done** | A section skipped at least twice reaches 4 right answers out of its last 5 |
| **Missing piece fixed** | A repair path ends with the confidence card right, and the original skill is answered right when it returns |
| **Section solid** | Every started skill in a section is solid |

At most 2 moments per session, the strongest first, so they stay worth reading.

## 10. The engine as a piece of software

**Shape (my call):**
- A TypeScript package with no UI, no network and no direct clock or random calls. Time and a random seed are passed in. The same input always gives the same output.
- It lives in the repo where both the Expo app and a command-line runner can import it. The folder name and build set-up are the builder's choice.
- It reads the content the app already bundles: the packs built by `app/scripts/build-content.mjs` (items, variants, tags) and the unit skill graphs.

**What it exposes** (names are suggestions):

| Call | Does |
|---|---|
| `startSession(state, now)` | Returns the session plan and the first card |
| `answer(state, event, now)` | Takes one answer event (card, option picked or "I don't know", time taken), returns the updated state, any feedback and moments, and the next card or an end |
| `skip(state, card, reason, now)` | Applies §6, returns the next card |
| `extend(state, now)` | The student took "5 more" |
| `endSession(state, now)` | Closes the session, updates the profile, returns the summary |

**State** is one plain object per student: the profile, per-skill records (height, right/wrong history, next review date, first-failed date), per-section skip memory and liking, recent card ids (so a card or variant isn't repeated within 14 days), and today's effort. It must serialise to JSON so the app can store it and the runner can print it.

**Every decision is explained.** Each card the engine returns carries a short machine-readable reason: `repair:missing-piece`, `repair:confidence`, `due-review`, `new:class-topic`, `side-door`, `skipped-drip`, `open:liked`, `close:winnable`, `comfort-correction`. The app's "Your path today" trail can show these in words, and the AI judges (§13) read them.

**Events.** Every answer, skip, session start and end, and profile change is appended to a local log in the shape the planned sync will upload ([tech architecture](../../living/tech-architecture.md#sync-stays-simple-no-sync-engine-at-first)). The engine never deletes or rewrites events.

**All tuning numbers in one place.** Every number in this document marked as a starting value (effort costs, budgets, gaps, thresholds, remind times) sits in one config object, so the agent runs can try different values without code changes.

## 11. What this needs from content

| Need | State today | Gap |
|---|---|---|
| Three heights per skill | Items exist for 56 of 175 skills across the three units | The other 119 skills have no items. The engine must work with the 56 and treat the rest as not available. |
| A "missing piece" card for each common wrong option on height-3 items | Wrong options carry error tags; L1/L2 cards carry tags on their own wrong options | No guaranteed link. The selection order in §5 falls back gracefully. A content check should report, per template, which wrong options have no matching easy card. |
| Very easy theory cards for skipped sections | Height-1 cards exist for sections that have items | Sections with only height-2/3 items have nothing to drip. Report these. |
| Error tags that name the real mistake | Good in Mechanics; generic tags cover about half of Electricity and three-quarters of Thermal ([review §2](../../reviews/2026-11-11-expert-review.md#2-domain-expert-al-education-learning-science-tuition-culture)) | Where the tag is generic, "missing piece" selection falls to step 2 or 3 of the order, which still works but helps less |
| Cards that stand alone | One known exception: `phy.therm.c043` refers to "the same copper bar" | Any card that depends on another must be fixed or excluded |
| Section value numbers | `exam_weight` per skill exists in all three graphs | None |

## 12. How this sits with accepted decisions

This design keeps [DR-0004](../../decisions/0004-schedule-skills-not-cards.md) (schedule skills, new variants each time, automatic grading) and the spirit of [DR-0019](../../decisions/0019-teen-retention-design.md).

It differs from two accepted records, so each difference needs a new decision record when Viraj approves this design (the old ones are not edited):

| Record | What changes |
|---|---|
| [DR-0022](../../decisions/0022-typed-skill-graph.md) | For the pilot, one simple skill-level schedule (heights plus review gaps scaled by a memory number) replaces FSRS per card plus Elo per skill, implicit review weights and adaptive placement. The graph, its edge types, exam weights and soft gating are kept and used. The fuller model can return when real data shows what it would improve. |
| [DR-0019](../../decisions/0019-teen-retention-design.md) | The minimum day and the session length are measured in effort, not "10 questions". Sessions can end early on a bad day and still count. A skip action is added. |

Readiness ([DR-0022](../../decisions/0022-typed-skill-graph.md)) is not redefined here. Until it is, the app can show progress as skills by height per section, which this engine produces directly.

## 13. Testing with AI agents as students

Viraj will have 10–20 AI agents play students with different levels in every trait, and judge how the app responds, adjusts and improves them. **(Viraj)** The agents run against the engine as text, not the phone. **(Viraj, agreed)**

**The trap, and the fix (my call).** An AI agent knows all the physics. Asked to play a weak student, it fakes mistakes unevenly, and it cannot truly forget or learn, so its own claim of "I improved" means nothing. So each fake student is two parts:

| Part | What it is | Decides |
|---|---|---|
| **Hidden student** (code, no AI) | Numbers the engine never sees: per-skill knowledge, learning speed, forgetting speed, calculation strength, concept strength, patience, confidence, habits | Right or wrong, which wrong option, "I don't know", skip, quit, "5 more", how long each answer takes |
| **Voice and judge** (AI agent) | Given the persona sheet and the full log | How the weeks felt for this student, and a score for the app against the rubric |

**Hidden student traits** (each set separately, so odd mixes exist):

| Trait | Range |
|---|---|
| Prior knowledge | Per skill, from none to solid; can be uneven by section |
| Learning speed | How much one answered card plus its explanation raises knowledge |
| Forgetting speed | How fast knowledge fades between visits |
| Calculation strength, concept strength | Separate modifiers on height 3 and on heights 1–2 |
| Misconceptions | A set of error tags the student falls for, each with a strength; they pick that wrong option when it's offered |
| Patience | How many wrong answers close together before they quit the session; how many bad sessions before they quit the app |
| Confidence | How unsure they must be before they press Not now |
| Stamina | Effort before answers slow and accuracy drops |
| Habits | Daily, every other day, binge then vanish, a 10-day gap in the middle |

Suggested cast of 16 **(my call)**: strong all round; weak all round but stubborn; weak and impatient; smart and impatient; good memory with weak calculation; strong calculation with poor memory; confident but full of misconceptions; under-confident skipper who actually knows the work; one section they fear; steady 5-minute student; binge then quit; comeback after 10 days; slow reader; fast guesser; average student in a class moving quickly through topics; average student with no class.

**The run.** Each hidden student plays 28 simulated days against the engine with the real content packs. The runner writes, per student: every card with its height and the engine's reason, the answer, what came next, skips, session ends and why, moments, the profile numbers day by day, and the hidden knowledge at day 0, 14 and 28. Runs are seeded so a run can be repeated exactly.

**Checks done by code, before any AI reads anything:**
- No session ends on a wrong answer.
- No skipped section returns before its remind time, and every one returns by the cap.
- Daily effort never exceeds the cap; a weak student's average daily effort asked is not above a strong student's.
- No card or variant repeats within 14 days.
- No student reaches their hidden stamina limit before the engine ends the session on more than 1 day in 5.
- Hidden knowledge at day 28 is higher than at day 0 for every student who kept practising.

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

**Two extra judges:**
- **Blind comparison:** an agent gets two students' logs with the persona sheets removed and must say which student is weaker, which is impatient, and so on. If it can't tell them apart, the app isn't adapting.
- **Truth check:** an agent compares the profile numbers the engine learned against the hidden student's real traits, and lists where the engine got the student wrong.

**Output:** one page per student, and one summary page: where the app failed which kind of student, ranked.

**The design changes when the report shows any of these (my call; Viraj did not object):**
- any persona would quit before day 7
- two different personas get near-identical sessions
- a weak persona's hidden knowledge is flat after 4 weeks
- a skipped section returns the next day, or never
- the blind comparison fails for more than a quarter of pairs

**What this does not prove.** It shows the engine adapts sensibly to the students we imagined. It cannot show that a real 17-year-old comes back on day 9. Only the pilot shows that.

## 14. Left to the builder

- Package location, names, file layout and test framework.
- The exact form of the state object and the events, as long as they serialise to JSON and match the planned sync shape.
- How "expected success rate" for a candidate card is estimated from the student's history on that skill and height (a simple running rate is enough to start).
- How the hidden student's numbers turn into right and wrong answers (a simple probability from knowledge against card height is enough to start).
- The runner's command-line options and log format, as long as the logs contain everything in §13.
- How the judge agents are launched and how their reports are collected.
- All tuning numbers, within the shapes set here.

## 15. Build order (suggested)

1. The engine with heights, the repair path, review gaps and the effort budget, on the Mechanics pack, with the code checks.
2. Skip, remind times, side door and the value message.
3. The profile's four numbers and their dials.
4. Moments.
5. The hidden students and the runner; first 28-day runs; tune the numbers.
6. The AI judges and the report.
7. Only then: wire the engine into the app's session screen and the "Your path today" trail.
