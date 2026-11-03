# Roadmap

_Last updated: 2026-11-02. Verify the 2027 A/L dates when they're announced and shift accordingly._

## Timeline
| Period | Phase | Exit / milestone |
|---|---|---|
| **Nov–Dec 2026** | Build the MVP for 2–3 units. Recruit 3–4 pilot teachers. Talk to the advisor friend. Write the pilot exit criteria. | Pilot start date told to teachers, 300 LKR collected ([commitment device](founder-playbook.md#commitment-device)) |
| **Jan–Mar 2027** | Founding 100 pilot ([E01](../experiments/E01-founding-100-pilot.md)). Opt-in survey in the WhatsApp channel at weeks 4–6 ([E02](../experiments/E02-teacher-channel-survey.md)). Content pipeline runs in parallel. Start social content. | Exit criteria checked ([DR-0009](../decisions/0009-pilot-exit-criteria.md)) |
| **Mar–Apr 2027** | Fix, expand content to most of the syllabus in one medium, onboard waves 1–2 ([DR-0010](../decisions/0010-rollout-waves.md)) | Wave 1 stable |
| **Apr–Jul 2027** | Pre-exam crunch: highest willingness to pay. Public launch, annual / exam-year plans, affiliate with mid-size tuition teachers. | First real revenue |
| +6–12 months | Big tuition players, with outcome data | |

December holidays are a weak time to start a pilot; a January start gives cleaner data.

## Build order (pilot MVP)
1. Monorepo, auth, data model, content pack format
2. Review UI + publish pipeline (the content reviewer can start early)
3. Student app: study loop (L1–L3 + MCQ problems), local scheduler, event sync
4. Teacher dashboard: class view + assignments
5. Parent weekly report: signed link + manual WhatsApp send (automate after the pilot)
6. PayHere links + activation codes. Defer RevenueCat / Play Billing until public launch.

Feature scope: see the [MVP cut](product-spec.md#mvp-cut-physics-pilot).

## Feature versions
- **v1 (pilot):** SRS cards and questions, L3, L4 MCQ templates, timed MCQ, readiness score, weak-topic report, mistake notebook, micro-notes + 3 sim engines, teacher dashboard, parent report.
- **v2:** gamification (XP, class leagues, badges), paper builder PDFs, full step player, one admin report, automated WhatsApp, Play Billing.
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
One medium first, chosen by what the content reviewer can review properly (likely Sinhala; **to confirm**, [DR-0006](../decisions/0006-mvp-feature-cut.md)). The other mediums follow with paid reviewers from the teacher channel.
