# UX Design

_Last updated: 2026-11-24 (student journey redesign: [DR-0052](../decisions/0052-anki-style-self-grading.md) to [DR-0057](../decisions/0057-onboarding-v1-short-flow.md))_

**Design canvas:** https://claude.ai/code/artifact/8663e5e8-8080-4e38-a1bc-a487744ad18f. It has two pages: English and සිංහල, 27 screens each plus WhatsApp threads, and Play mode links the screens together.

**Direction canvas:** https://claude.ai/artifact/Mx5aKCgCPibgzR24HZ7Woi. It holds the 10 style variations; the chosen one is V3a light ("Dawn"). New screens are designed in Dawn.

Scope: student app screens and WhatsApp messages only. Teacher and parent dashboards come later.

## Principles
- **Calm, never nagging.** No push notifications, no teacher-voice nudges ([DR-0020](../decisions/0020-no-push-notifications.md)).
- **Works without a class.** Nothing depends on the teacher enrolling the class.
- **Small asks.** "5 min", never "20 cards due." "Done for today" is a real ending.
- **No guilt.** Comebacks say "Good to see you," show progress kept, and never show a backlog count.
- **Student controls parent sharing** ([DR-0018](../decisions/0018-student-is-primary-customer.md)).
- **Autonomy.** The queue is a recommendation. "Done for today" and "5 more" carry equal weight.
- **Recall, not recognition.** The study card is Anki-style: think, Show answer, grade. MCQ is used sometimes, not always ([DR-0052](../decisions/0052-anki-style-self-grading.md), [DR-0053](../decisions/0053-recall-first-content-mix.md)).
- **Dawn sets the look, not the flow.** The design canvases set colours, type and motifs. The flow follows this document and the decision records.

## Design system: "Dawn"
Decision: [DR-0025](../decisions/0025-dawn-design-system.md) (replaces "mist", [DR-0023](../decisions/0023-mist-design-system.md)). Light theme only for now; the dark theme "Dusk" (less blue than the V3a mock-up) comes later.

| Token | Value |
|---|---|
| Ground | Sky gradient, top to bottom: `#E3ECFB` → `#F4F2F2` → `#FDEAD6` |
| Ink | Indigo `#1B1F4B`; muted text `#555A80`; faint lines and unfilled art `#B4BAD3` |
| Surfaces | Solid white `#FFFFFF`, hairline border `#D8DFEF`, large radii (22–30px). No blur. |
| Tracks | Empty bars and rings `#D8DFEF` / `#E3E8F6` |
| Colour by meaning | **Yellow `#F6C453`** = today / you (main button, today's bar, sun; soft glow). **Lavender `#7569D6`** = progress (bars, rings, day bars). **Green `#23694D`** = correct / mastered. **Terracotta `#C4693F`** = fading skills / where marks slip. Each colour means one thing only. |
| Buttons | Yellow pill with indigo text for the main action; outlined indigo pill for secondary. "Done for today" and "5 more" are equal. |
| Type | Geist. Big numbers (readiness, streak) at weight 300; headings 500. Sinhala: Noto Sans Sinhala, taller line height, slightly smaller headings; numbers stay in Geist. |
| Motifs | Sun (yellow disc with glow). Sigiriya line art, drawn in indigo as skills are mastered over a faint dashed outline. Session done is a sunrise sky (`#BFD5F5` → `#FBDDBD` → `#F8BE93`). |
| Layout | Base layout: greeting + streak, today's card, week day bars, unit Sigiriya; 3-tab bottom nav (Today / Learn / Progress). Fewer elements per screen, plain rows with thin dividers. |
| Motion | Minimal: the Sigiriya line draws in, the sun rises on session done. Off when reduced motion is on. |

**Check on real phones:** gradient banding on cheap LCDs; yellow-pill findability and contrast; Sinhala line heights.

## Language rule (Sinhala / Tamil medium)
Decision: [DR-0024](../decisions/0024-sinhala-medium-ui-language.md)

- **In the medium:** learning content (notes, questions, options, solution steps, feedback, explanations) and subject, topic and skill names (e.g. "යාන්ත්‍ර විද්‍යාව 34 → 37", "Continue: වෘත්ත චලිතය").
- **In English:** all interface text: buttons, labels, nav, settings, streaks, league, pricing, error categories ("Units", "Wrong method").
- **Exception:** parent WhatsApp messages use the parent's language, chosen at consent ([DR-0036](../decisions/0036-parent-messages-in-parent-language.md)).
- Physics terms must be checked against the NIE textbook glossary before anything reaches students (e.g. කේන්ද්‍රාභිසාරී බලය, බල විභේදනය, සූර්ණ, ආනත මාර්ග, රේඛීය චලිතය).

## User flow (text)
Source: [business-plan chat, 2026-11-07](../sources/2026-11-07-business-plan-chat.md). Where DR-0025/DR-0026 changed the original text, the newer decision wins; those spots are marked.

**Guiding rules:** first win within 5 minutes, before any account, payment or consent. Ask only what changes the experience. No push ([DR-0020](../decisions/0020-no-push-notifications.md)). Class code optional; the app works fully solo.

### A. Onboarding

Decisions: [DR-0057](../decisions/0057-onboarding-v1-short-flow.md) sets the order **for this version**. [DR-0055](../decisions/0055-onboarding-revised-for-anki-loop.md) holds the fuller nine-screen flow, kept below for later versions. Both replace the A1–A9 order and the separate quick check of [DR-0026](../decisions/0026-onboarding-flow.md). DR-0026's other rules stand: a hidden anonymous account from the first screen, an optional name, the 7-day consent grace, and the friend invite after week 1 or a 3-day streak. Onboarding runs on first launch, before the Today tab. Everyone sees the same screens, with or without a class code. Interface text is English ([DR-0024](../decisions/0024-sinhala-medium-ui-language.md)); the copy below is a draft until its Sinhala-medium check.

**This version: Welcome → Placement test → About you + save → Home**

| # | Screen | What it says and asks |
|---|---|---|
| O1 | Welcome | "A/L Physics. 5 minutes a day." Study in: සිංහල (English and தமிழ் shown as "coming soon" in the pilot). "Class code? (optional)". [Continue] |
| O2 | Placement test | Header: "Let's find your level. Starts easy. No marks." **8 questions.** Starts easy and climbs with the first-session ladder ([DR-0051](../decisions/0051-study-loop-rules-after-first-judge-pass.md) change 4). About half the cards are MCQ ([DR-0053](../decisions/0053-recall-first-content-mix.md)). Same study screen and coach lines as any session. This is the first session. |
| O3 | About you + save progress | "What should we call you?" (optional). "What are you aiming for?" Medicine / Engineering / Another degree / Pass well (sets the motivation copy). Stream: Bio / Maths / Other (sets the default mix). Exam: 2027 / 2028 (sets the countdown and pacing). Then "Keep your progress safe": Google / Phone / Later ("Later keeps it on this phone only"). |
| O4 | Home, first time | The normal Today screen with a **"Day 1 done" banner** the first time only: sunrise, streak 1, "Strong in: …" (chips), "Started: වෘත්ත චලිතය". Then the widget offer: "Add UniKey to your home screen? Today's 5 minutes at a glance." [Add] [Not now] |

**Not in this version** (backlog; the order will be revised in a later version): routine, units covered, and the paywall with its parent message. Until units covered returns, new skills follow the current unit and exam weight. Parent consent collection also comes in a later version (Viraj, 2026-11-24; tracker T124).

**Later versions (DR-0055, for reference):**

| Screen | What it says and asks |
|---|---|
| Routine | "When do you usually study?" Morning / After school / Night / It changes. WhatsApp reminder, off by default. "No notifications. Ever." |
| Units covered | "Which units has your class covered?" Chips pre-filled from the exam year and month. "We guessed from your exam year. Tap to fix." "Not covered yet? We'll keep it for later." Units not covered stay out of study until added. |
| Keep going (paywall, after sign-in) | "Today: 12 cards, 3 skills started." Monthly 900 / Until exam ([DR-0032](../decisions/0032-until-exam-price-by-months-left.md)). [Ask a parent on WhatsApp] [I have a code]. "Money back if you practise 20 days and it doesn't help." Pilot: takes the Founding 100 activation code ([DR-0003](../decisions/0003-pilot-price-300.md)). |

**Coach lines** in the placement test. There is no tutorial screen. Each line shows once, on the first card where it applies, and then never again:
- First recall card: "Think first. Then tap Show answer."
- First reveal: "Be honest. Your grade picks what comes next."
- First MCQ: "Pick one. You can change it. Then tap Show answer."
- First card with Sinhala text: "Hold EN for English."
- First skip: "Skipped. It comes back in a few days."

**Parent message (consent and payment in one; later versions, with the paywall).** The student sends one pre-written WhatsApp to the parent, in the parent's language ([DR-0036](../decisions/0036-parent-messages-in-parent-language.md)): "Kasun is using UniKey for A/L Physics (teacher-reviewed practice). Open this link to say yes and pay: [link]". The link page asks for consent first and shows what the parent will see (the student's chosen sharing level), then offers payment. Until the parent says yes, the 7-day grace rules of DR-0026 apply. This needs the same legal check (L5).

### B. Daily loop (day 2 onward)
- **B1 Home:** today's card (topic + "5 min" + Start), week bars, streak. Nav: Today / Learn / Progress. (The chat had a 4th Friends tab; Dawn and DR-0026 dropped it for the pilot.)
- **B2 Session:** a budget of effort, about 5 minutes ([DR-0049](../decisions/0049-effort-based-day-and-skip.md)). About 70% recall cards and 30% MCQ, mixed, not grouped by type. Each card follows the [study screen](#study-screen) below. A wrong MCQ names the trap and saves it to the mistake notebook. The step player with a hint ladder is not in the pilot.
- **B3 Session done:** one number that moved, a mastery moment when earned, equal "Done for today" / "5 more", challenge a friend.
- ~~B4 Free limit~~: removed, no free plan ([DR-0029](../decisions/0029-no-free-plan.md)). Its "Ask a parent" path moves to the paywall, which comes after the first session (A6) ([DR-0030](../decisions/0030-paywall-after-first-session.md)).

### C. Learn and progress (student-initiated)
- Learn tab: unit map → topic → skill detail (needs / opens / past-paper frequency) → micro-note with sim → 2 check questions.
- Progress tab: readiness trend, unit rings, fading skills, before vs now, where marks slip.
- Mistake notebook: error pattern, filters, redo.
- School test mode: pick a date and units, get a 12-day plan with a mock.

### D. Lifecycle states
| Trigger | Screen / action |
|---|---|
| Missed 1 day | Streak freeze applied automatically. "Welcome back," same 5 minutes, nothing piles up. |
| Missed 2–6 days | "Good to see you." The streak restarts, with a 3-minute refresh of fading skills only. Optional WhatsApp nudge on day 2. |
| Missed 7+ days | Same screen plus a friend-streak restart prompt. If in a class, the teacher sees them flagged. |
| End of week 1 | Week summary: days, mastered skills, readiness change. "Send to Amma" (effort or progress). Friend invite appears here or after a 3-day streak (DR-0026). |
| End of month 1 | Month review: trend, syllabus map, before vs now, where marks slip. |
| 5 days before renewal | Recap before price, then monthly vs until-exam. "Ask a parent on WhatsApp" with a payment link. |
| 2 weeks before a school test | Prompt to start test mode; the teacher gets a WhatsApp with a paper-builder link. |

### E. Payment (student-led)

The student taps "Ask a parent" (paywall, renewal or settings). A pre-written WhatsApp goes to the parent with one link: consent first, then payment ([DR-0055](../decisions/0055-onboarding-revised-for-anki-loop.md)). The parent pays (eZ Cash, card, bank, LankaQR). The parent gets a receipt, the app unlocks, and the student sees "Premium active until…". **Pilot:** manual bank transfer / eZ Cash / LankaQR with activation codes ([DR-0014](../decisions/0014-payments.md)).

### F. Teacher entry (outside the student app)

The teacher joins, gets a class code and shares it with students who want it. Nobody is forced. Sunday WhatsApp digest: active students, class readiness, the skill the class is stuck on, quiet students.

**Settled:** when the paywall returns, it comes after sign-in ([DR-0055](../decisions/0055-onboarding-revised-for-anki-loop.md)). It is not in this version ([DR-0057](../decisions/0057-onboarding-v1-short-flow.md)).

## Study screen
Decisions: [DR-0052](../decisions/0052-anki-style-self-grading.md) and [DR-0056](../decisions/0056-student-grade-always-no-trust-check.md) (answering and grades), [DR-0053](../decisions/0053-recall-first-content-mix.md) (recall and MCQ), [DR-0054](../decisions/0054-one-screen-study-card.md) (layout and buttons).

```
[EN]                          ▬▬▬▬▬▬░░░░    hold EN = English under each line; thin effort bar, no numbers
──────────────────────────────────────
  Question (Sinhala) + figure + constants

  MCQ only:  ○ A   ○ B   ○ C   ○ D           a tap selects; the student can change it

  ── after Show answer, same screen, scrolls ──
  Recall: the model answer
  MCQ: the correct option green, a wrong pick red, the mistake line
  Explanation
──────────────────────────────────────
 before:  [ Skip ]              [ Show answer ]
 after:   [Again] [Hard] [ Good ] [Easy]        on every card, MCQ wrong or empty too
```

**One screen per card.** The question never leaves the screen. Show answer adds the answer and the explanation below it.

**Recall card** (options hidden): the student thinks or works on paper, with no typing box. They tap Show answer, see the model answer and explanation, and grade.

**MCQ card:** a tap only selects an option, and nothing is revealed until Show answer, so a slip of the finger costs nothing. After the reveal:
- The screen marks the correct option green and a wrong pick red, with the mistake line and the explanation.
- **The four grade buttons always show**, whether the pick was right, wrong or empty. The student's grade is what the engine uses ([DR-0056](../decisions/0056-student-grade-always-no-trust-check.md)); the right/wrong result is saved in the event log for later analysis.
- The same card is not retried now. After Again, an easier card of the same skill comes later in the session, near the end, before the closing card.

**Grade buttons:** Again / Hard / Good / Easy. Good is the main button (yellow pill); the others are outlined. What each grade does to timing and difficulty is in [DR-0052](../decisions/0052-anki-style-self-grading.md); these are starting values, to be tested against pilot data. There is no trust check in this version. In short:
- Again: an easier card later today, and the skill comes back tomorrow.
- Hard: same difficulty, and it comes back soon.
- Good: normal. Two Goods make the skill harder.
- Easy: harder now, and it comes back later.

**Skip:** one tap, no question. (To revisit: Viraj wants Skip handled more like Again.) It skips the card's section, which comes back after 3, 5, 8, 13, then every 14 days ([DR-0049](../decisions/0049-effort-based-day-and-skip.md)). The first skip shows the coach line. From the second skip of a section, the value message shows once ("About 13% of Mechanics marks come from this section…"), with Skip and Keep studying.

**Ending:** the phone's Back ends the session, with no confirmation. Progress is saved, and the streak counts if the minimum day is reached. The normal ends (Done for today, bad-day early end, the "5 more" offer) are unchanged.

**English:** hold EN, top-left, to show the English under every line. Let go to hide it.

**Not on this screen:** "I don't know", "Not now", "Too hard", "End session", item ids, the Review button. Reviewer tools live only in the separate reviewer build.

## Screen inventory (canvas rows)
| Row | Scenario | Screens |
|---|---|---|
| 0 | Onboarding + day 1. **Out of date:** the canvas shows the DR-0026 order; the current flow is O1–O9 above ([DR-0055](../decisions/0055-onboarding-revised-for-anki-loop.md)) | A1 medium + optional class code → A2 optional name, goal, stream, exam year → A3 routine (WhatsApp reminder **off by default**) → A4a covered units (pre-filled) → A4 no-marks quick check with "I haven't learned this yet" → A5 starting map (readiness, strong-in chips, this week's topics) → A6 first session done → A7 save progress (Google / phone, or Later) → A8 parent consent (7-day grace, choose what the parent sees) → A9 day-1 home with widget offer |
| 1 | Daily loop | Day-2 home (5-min card shows the recall/method/problem mix; friend-streak invite) → "which method?" question with diagram + 60-second note link → session done (number moved, skill mastered and what it unlocks, equal "Done for today" / "5 more") |
| 2 | Missed days | 1 day: freeze auto-applied, normal 5 min today. A few days: "Good to see you", 3-minute refresh of fading skills only, progress kept, no backlog count. |
| 3 | Milestones | Week 1: effort first, then progress, then send the week to a parent (student chooses what they see). Month 1: weekly readiness trend, unit rings, before vs now, where your marks leak (from error tags). Renewal: recap before price, monthly vs until-exam (25% off monthly for the months left, 1,500 floor, [DR-0032](../decisions/0032-until-exam-price-by-months-left.md)), "Ask a parent on WhatsApp". |
| 4 | WhatsApp | See [messages](#whatsapp-messages) |
| 5 | Learning | Micro-note with live circular-motion sim (speed slider, predict-first question); wrong-answer feedback naming the trap (radius vs diameter) and linking the prerequisite; step-by-step problem with hint ladder; mistake notebook with error pattern + redo |
| 6 | Progress | Mechanics unit map (topics as rows, skills as dots in 4 states); skill detail (only what it needs and what it opens, plus past-paper frequency) |
| 7 | Social | Friend streaks; class league (resets Monday); calm duel result |
| 8 | Exam + account | School test mode (12-day plan, mock on day 10); ~~free-limit screen~~ (removed, DR-0029, replace with a paywall); settings (parent sharing level, WhatsApp, nickname, data export/delete) |

Sample student in mockups: Kasun.

### Gaps (next design pass)
- [ ] Tamil page
- [ ] Comeback after 2+ weeks away (currently reuses the few-days screen)
- [ ] Offline / no-data state
- [ ] In-app payment success screen
- [ ] Teacher dashboard and parent web report (later)

## WhatsApp messages
| To | Messages |
|---|---|
| Student (opt-in) | Welcome; 2-day-skip nudge; friend invite; weekly summary; term-test plan |
| Parent | Consent (under-18); weekly report in green and in amber variants; the renewal request the student sends; payment receipt |
| Teacher | Welcome with class code; Sunday digest with the bottleneck skill; quiet students; term-test paper builder |

The mockups use coloured dots in place of emoji; real messages can use emoji.

### Parent weekly report (template to translate)
> 🟢 Kasun studied 5 of 7 days this week
> Practised 140 questions · Improving in Electricity
> Exam in 9 months. Keep encouraging him! 🙏
> — [Teacher name]'s A/L Physics class
> 📊 Details: [link]

Rules: one headline number, a traffic light (🟢 on track · 🟡 needs more practice · 🔴 falling behind) instead of scores, plain language with no "KC" or "mastery", an optional 20-second voice note, the teacher's name, and one action.

### "Ask parent to pay" (student → parent)
> Teacher-reviewed physics practice app, 900 rupees a month, less than one tuition class. Here's my progress so far: [link]

## Open design questions
| # | Question | Current lean |
|---|---|---|
| D1 | The amber "quieter week" parent message may feel like reporting on the student | Send it only at the "effort + progress" sharing level, never at "effort only" |
| D2 | Equal weight for "Done for today" vs "5 more" | Keep equal; A/B test making "5 more" primary in the pilot |
| D3 | Parent messages: English or parent's language? | **Decided:** parent's language, chosen at consent ([DR-0036](../decisions/0036-parent-messages-in-parent-language.md)) |
