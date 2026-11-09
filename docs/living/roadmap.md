# Roadmap

_Last updated: 2026-11-09 (simulation step added). Verify the 2027 A/L dates when they're announced and shift accordingly._

## Timeline
| Period | Phase | Exit / milestone |
|---|---|---|
| **Nov–Dec 2026** | Build the MVP for 3 units (Mechanics, Current Electricity, Thermal Physics; Sinhala). Recruit 3–4 pilot teachers and 1–2 paid content reviewers ([DR-0035](../decisions/0035-paid-teacher-reviewers-pilot.md)). Talk to the advisor friend. Write the pilot exit criteria. | Pilot start date told to teachers, 300 LKR collected ([commitment device](founder-playbook.md#commitment-device)) |
| **Mid-Jan–Mar 2027** | Founding 100 pilot (starts mid-January) ([E01](../experiments/E01-founding-100-pilot.md)). Opt-in survey in the WhatsApp channel at weeks 4–6 ([E02](../experiments/E02-teacher-channel-survey.md)). Content pipeline runs in parallel. Start social content. | Exit criteria checked ([DR-0009](../decisions/0009-pilot-exit-criteria.md)) |
| **Mar–Apr 2027** | Fix, expand content to most of the syllabus in one medium, onboard waves 1–2 ([DR-0010](../decisions/0010-rollout-waves.md)) | Wave 1 stable |
| **Apr–Jul 2027** | Pre-exam crunch: highest willingness to pay. Public launch, annual / exam-year plans, affiliate with mid-size tuition teachers. | First real revenue |
| +6–12 months | Big tuition players, with outcome data | |

December holidays are a weak time to start a pilot; a January start gives cleaner data.

## Before development
- Content plan: one final fix pass, then stop reviewing ([DR-0027](../decisions/0027-content-plan-stop-point.md)). Content runs in parallel; the teacher's sign-offs are listed there.
- Settle the "must settle before building" items in [open topics](open-topics.md) (B1–B6, T1–T6).

## Build order (pilot MVP)
1. Monorepo, auth, data model, content pack format. Include the controllable backend clock ([DR-0044](../decisions/0044-controllable-backend-clock.md)) and the `simulated` flag on every user ([DR-0045](../decisions/0045-simulated-flag-on-every-user.md)) from the start.
2. **Prototype student app with a reviewer mode** (changed 2026-11-07; was "Review UI + publish pipeline")
   - Expo app in the "Dawn" design, with the content sample bundled as a static, offline content pack. No backend and no scheduler: items play in a fixed order.
   - Reviewers (the wife, paid reviewers) see each item exactly as a student will, on a real phone and in Sinhala. Each item gets "OK / wrong physics / bad Sinhala / bad distractor" plus a note.
   - Results are exported as a file or a WhatsApp share and merged back into the content files. This replaces the tick boxes in `review.md`.
   - Also checks Sinhala rendering and Dawn on cheap Android phones ([A28](../experiments/assumptions.md)).
   - Content statuses (draft → reviewed → published) are tracked from the merged review results until a real publish pipeline exists.
3. Student app: turn the prototype into the study loop (L1–L3 + MCQ problems), local scheduler, event sync
4. Teacher dashboard: class view + assignments. Plan: [teacher dashboard](teacher-dashboard.md#6-build-plan), starting with a fake-data prototype ([DR-0043](../decisions/0043-dashboard-fake-data-prototype-first.md))
5. Parent weekly report: signed link + manual WhatsApp send (automate after the pilot)
6. PayHere links + activation codes. Defer RevenueCat / Play Billing until public launch.
7. **Simulation + `/admin` mission control, then go/no-go** (late Dec 2026 – first week of Jan 2027, 1.5–2 weeks). Synthetic students run 8 pilot weeks through the real backend in about an hour; results go into the ["safe to launch" report](simulation-and-admin.md#7-safe-to-launch-the-pilot-gono-go). It's a soft gate: it informs the mid-January start but doesn't block it ([DR-0047](../decisions/0047-simulator-as-engine-acceptance-test.md)). Plan: [simulation and admin](simulation-and-admin.md).

Feature scope: see the [MVP cut](product-spec.md#mvp-cut-physics-pilot).

## Feature versions
- **v1 (pilot):** SRS cards and questions, L3, L4 MCQ templates, timed MCQ, readiness score, weak-topic report, mistake notebook, micro-notes + 3 sim engines, teacher dashboard, parent report, 5-minute day + streak freeze + no-guilt catch-up, home-screen widget, opt-in WhatsApp reminder, term-test mode.
- **v2:** gamification (XP, class leagues, badges, friend streaks, duels), paper builder PDFs, full step player, one admin report, automated WhatsApp, Play Billing, Tamil UI pass.
- **v3+:** more sim engines, freeform mode, simulations for the most-failed concepts, runtime AI explanations (capped). Music and quotes are optional polish.

## Subject order
Decision: [DR-0001](../decisions/0001-physics-first.md)

| # | Subject | Why |
|---|---|---|
| 1 | Physics | The wife's expertise; feared by Bio students |
| 2 | Chemistry | Taken by both science streams, feared by Combined Maths students, recall-heavy |
| 3 | Biology | The most SRS-friendly subject; big market |
| 4 | Combined Maths | Hardest to build (CAS, proofs, step player) |

After Chemistry, Physics + Chemistry covers both science streams, and the stream bundle becomes a strong offer. O/L Science is a bigger market but has lower willingness to pay.

## Medium order
Pilot: **Sinhala only**, 3 units ([DR-0031](../decisions/0031-pilot-scope-3-units-sinhala.md)). The other mediums follow with paid reviewers from the teacher channel.
