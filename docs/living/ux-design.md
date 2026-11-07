# UX Design

_Last updated: 2026-11-03_

**Design canvas:** https://claude.ai/code/artifact/8663e5e8-8080-4e38-a1bc-a487744ad18f. It has two pages: English and සිංහල, 27 screens each plus WhatsApp threads, and Play mode links the screens together.

Scope: student app screens and WhatsApp messages only. Teacher and parent dashboards come later.

## Principles
- **Calm, never nagging.** No push notifications, no teacher-voice nudges ([DR-0020](../decisions/0020-no-push-notifications.md)).
- **Works without a class.** Nothing depends on the teacher enrolling the class.
- **Small asks.** "5 min", never "20 cards due." "Done for today" is a real ending.
- **No guilt.** Comebacks say "Good to see you," show progress kept, and never show a backlog count.
- **Student controls parent sharing** ([DR-0018](../decisions/0018-student-is-primary-customer.md)).
- **Autonomy.** The queue is a recommendation. "Done for today" and "5 more" carry equal weight.

## Design system: "mist"
Decision: [DR-0023](../decisions/0023-mist-design-system.md)

| Token | Value |
|---|---|
| Ground | Off-white mist `#F3F4F1` |
| Ink | `#1C2321`; muted text `#5E6763` |
| Accents | Sage, lavender, peach. Used **only** in background blobs, progress gradients and status tints, never as loud fills. |
| Surfaces | Frosted glass: 50% white, 18–24px blur, hairline white border, large radii (20–32px). **Low-end Android: solid 85% white, no blur.** |
| Buttons | Ink pill for the main action; outlined pill for secondary |
| Type | Geist. Headings at weight 400 with tight tracking; big numbers (readiness, streak, 5/7) at weight 300. Sinhala: Noto Sans Sinhala, taller line height, slightly smaller headings; numbers stay in Geist. |
| Motion | 2–3 blurred gradient blobs per screen drift over 18–26s; the orb behind the streak number morphs on the session-done screen. Off when reduced motion is on. |
| Layout | Fewer elements per screen; plain text rows with thin dividers instead of coloured cards; segmented pills for choices; a floating glass pill bottom nav; large light numbers instead of stat tiles |

Inspiration: restraint from the Linear and Notion entries and soft organic gradients from the Clay entry in [awesome-claude-design](https://github.com/VoltAgent/awesome-claude-design).

**Check on real phones:** blur performance; whether students find the single dark main-action pill (fix: a soft sage tint on the main card, not a bright colour).

## Language rule (Sinhala / Tamil medium)
Decision: [DR-0024](../decisions/0024-sinhala-medium-ui-language.md)

- **In the medium:** learning content (notes, questions, options, solution steps, feedback, explanations) and subject, topic and skill names (e.g. "යාන්ත්‍ර විද්‍යාව 34 → 37", "Continue: වෘත්ත චලිතය").
- **In English:** all interface text: buttons, labels, nav, settings, streaks, league, pricing, error categories ("Units", "Wrong method").
- **Open:** parent WhatsApp messages in the parent's chosen language.
- Physics terms must be checked against the NIE textbook glossary before anything reaches students (e.g. කේන්ද්‍රාභිසාරී බලය, බල විභේදනය, සූර්ණ, ආනත මාර්ග, රේඛීය චලිතය).

## Screen inventory (canvas rows)
| Row | Scenario | Screens |
|---|---|---|
| 0 | Onboarding + day 1 | Medium choice + optional class code → goal, stream, routine time (WhatsApp reminder **off by default**) → no-marks quick check with an "I haven't learned this yet" button → starting map (e.g. readiness 34%, what you're already strong in) → day-1 home with done state + home-screen widget offer |
| 1 | Daily loop | Day-2 home (5-min card shows the recall/method/problem mix; friend-streak invite) → "which method?" question with diagram + 60-second note link → session done (number moved, skill mastered and what it unlocks, equal "Done for today" / "5 more") |
| 2 | Missed days | 1 day: freeze auto-applied, normal 5 min today. A few days: "Good to see you", 3-minute refresh of fading skills only, progress kept, no backlog count. |
| 3 | Milestones | Week 1: effort first, then progress, then send the week to a parent (student chooses what they see). Month 1: weekly readiness trend, unit rings, before vs now, where your marks leak (from error tags). Renewal: recap before price, monthly vs until-exam (`[EXAM PRICE]` placeholder), "Ask a parent on WhatsApp". |
| 4 | WhatsApp | See [messages](#whatsapp-messages) |
| 5 | Learning | Micro-note with live circular-motion sim (speed slider, predict-first question); wrong-answer feedback naming the trap (radius vs diameter) and linking the prerequisite; step-by-step problem with hint ladder; mistake notebook with error pattern + redo |
| 6 | Progress | Mechanics unit map (topics as rows, skills as dots in 4 states); skill detail (only what it needs and what it opens, plus past-paper frequency) |
| 7 | Social | Friend streaks; class league (resets Monday); calm duel result |
| 8 | Exam + account | School test mode (12-day plan, mock on day 10); free-limit screen where "See you tomorrow" is a real option; settings (parent sharing level, WhatsApp, nickname, data export/delete) |

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
| D3 | Parent messages: English or parent's language? | Parent's language, chosen at consent ([DR-0024](../decisions/0024-sinhala-medium-ui-language.md)) |
