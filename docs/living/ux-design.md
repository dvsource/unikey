# UX Design

_Last updated: 2026-11-07_

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

**A. Onboarding (~4–5 min):** A1–A9, see the screen inventory row 0 and [DR-0026](../decisions/0026-onboarding-flow.md).
- A2 answers drive the experience. Goal (Medicine / Engineering / Another degree / Pass well) sets the motivation copy. Stream sets the default mix (Bio gets more scaffolding). Exam year (2027 / 2028) sets the countdown and pacing.
- A4 quick check: 8–15 adaptive questions, "No marks. Just finding your start.", instant feedback, so it also teaches.
- A6 first session: 10 questions, aimed at ~80% correct, ends with streak 1, readiness up (e.g. 34 → 37) and the first skill started.

**B. Daily loop (day 2 onward)**
- **B1 Home:** today's card (topic + "5 min" + Start), week bars, streak. Nav: Today / Learn / Progress. (The chat had a 4th Friends tab; Dawn and DR-0026 dropped it for the pilot.)
- **B2 Session (10 items):** recall, "which method?" and problems mixed, not grouped by type. A correct answer shows a short why. A wrong answer names the trap, links the 60-second note, shows where the mistake came from, and saves it to the mistake notebook. Problems use the step player with a hint ladder.
- **B3 Session done:** one number that moved, a mastery moment when earned, equal "Done for today" / "5 more", challenge a friend.
- ~~B4 Free limit~~: removed, no free plan ([DR-0029](../decisions/0029-no-free-plan.md)). Its "Ask a parent" path moves to the paywall, which comes after the first session (A6) ([DR-0030](../decisions/0030-paywall-after-first-session.md)).

**C. Learn and progress (student-initiated)**
- Learn tab: unit map → topic → skill detail (needs / opens / past-paper frequency) → micro-note with sim → 2 check questions.
- Progress tab: readiness trend, unit rings, fading skills, before vs now, where marks slip.
- Mistake notebook: error pattern, filters, redo.
- School test mode: pick a date and units, get a 12-day plan with a mock.

**D. Lifecycle states**
| Trigger | Screen / action |
|---|---|
| Missed 1 day | Streak freeze applied automatically. "Welcome back," same 5 minutes, nothing piles up. |
| Missed 2–6 days | "Good to see you." The streak restarts, with a 3-minute refresh of fading skills only. Optional WhatsApp nudge on day 2. |
| Missed 7+ days | Same screen plus a friend-streak restart prompt. If in a class, the teacher sees them flagged. |
| End of week 1 | Week summary: days, mastered skills, readiness change. "Send to Amma" (effort or progress). Friend invite appears here or after a 3-day streak (DR-0026). |
| End of month 1 | Month review: trend, syllabus map, before vs now, where marks slip. |
| 5 days before renewal | Recap before price, then monthly vs until-exam. "Ask a parent on WhatsApp" with a payment link. |
| 2 weeks before a school test | Prompt to start test mode; the teacher gets a WhatsApp with a paper-builder link. |

**E. Payment (student-led):** the student taps "Ask a parent" (paywall, renewal or settings). A pre-written WhatsApp goes to the parent with the student's progress and a payment link. The parent pays (eZ Cash, card, bank, LankaQR). The parent gets a receipt, the app unlocks, and the student sees "Premium active until…". **Pilot:** manual bank transfer / eZ Cash / LankaQR with activation codes ([DR-0014](../decisions/0014-payments.md)).

**F. Teacher entry (outside the student app):** the teacher joins, gets a class code and shares it with students who want it. Nobody is forced. Sunday WhatsApp digest: active students, class readiness, the skill the class is stuck on, quiet students.

**Still open from the flow:** paywall screen design (between A6 and A7, or after A7).

## Screen inventory (canvas rows)
| Row | Scenario | Screens |
|---|---|---|
| 0 | Onboarding + day 1 ([DR-0026](../decisions/0026-onboarding-flow.md); Dawn screens on the direction canvas) | A1 medium + optional class code → A2 optional name, goal, stream, exam year → A3 routine (WhatsApp reminder **off by default**) → A4a covered units (pre-filled) → A4 no-marks quick check with "I haven't learned this yet" → A5 starting map (readiness, strong-in chips, this week's topics) → A6 first session done → A7 save progress (Google / phone, or Later) → A8 parent consent (7-day grace, choose what the parent sees) → A9 day-1 home with widget offer |
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
