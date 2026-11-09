# Simulation and Admin Dashboard

_Last updated: 2026-11-09. Source: plan pasted by Viraj ("let's start from here"), written up in a side session. Status: plan only, nothing built. DR-0044 to 0047 accepted 2026-11-09; the go/no-go is a soft gate. Decisions: [DR-0044](../decisions/0044-controllable-backend-clock.md) (clock), [DR-0045](../decisions/0045-simulated-flag-on-every-user.md) (simulated flag), [DR-0046](../decisions/0046-narrow-admin-page-reuse-tools.md) (narrow `/admin`), [DR-0047](../decisions/0047-simulator-as-engine-acceptance-test.md) (acceptance test)._

Related: [tech architecture](tech-architecture.md) · [roadmap](roadmap.md#build-order-pilot-mvp) · [product spec](product-spec.md) · [teacher dashboard](teacher-dashboard.md) · [content authoring §7 error tags](content-authoring.md#7-error-tag-taxonomy) · [DR-0022](../decisions/0022-typed-skill-graph.md) (skill graph) · [E01 pilot](../experiments/E01-founding-100-pilot.md)

**One line:** before 100 real students arrive, run 8 pilot weeks of synthetic students through the real backend in about an hour, check the learning engine and the teacher insights against students whose true mastery we know, and watch it all on one small `/admin` page.

Items marked _(my call)_ were not in the pasted plan. The builder can settle them, or Viraj can override them.

## 1. Why

The pilot has one shot at first impressions with 3–4 teachers and ~100 students. Real students can't tell us whether the engine is right, because nobody knows their true mastery. Synthetic students can. Their "true" mastery is set by us, so we can check what the engine and the dashboard say against it.

| Question | Who answers it |
|---|---|
| Does the mastery estimate track true mastery? | Simulator (§2) |
| Does the dashboard find the real bottleneck, without crying wolf? | Simulator with planted patterns (§4) |
| Do sync, offline, payments, consent and digests survive 8 weeks of mess? | Simulator with fault injection (§3) |
| Is it safe to start the pilot? | Go/no-go table (§7) |
| Do teens actually come back? | **Not the simulator.** Only the pilot ([§8](#8-caveats)) |

## 2. The simulator as a test of the learning engine

A synthetic student is a small model with hidden state. The engine never sees that state. It only sees the attempt events the student sends, exactly like a real student.

### 2.1 Hidden state per student

| Part | What it is | Default range |
|---|---|---|
| **True mastery** | `m[k]` in 0–1 for each of the 83 Mechanics skills in `content/skills/mechanics/graph.json` | Set by persona (§5) |
| **Prerequisites** | `m[k]` can't sit more than 0.2 above the weakest `requires` prerequisite. Learning a skill is slowed while its prerequisites are weak. | Uses the real 236 graph edges |
| **Learning rate** | After each attempt on skill `k`: `m[k] += λ · (1 − m[k]) · p`, where `p` (0–1) is how far the prerequisites are met. A wrong answer followed by the explanation counts as half an attempt. | λ = 0.08–0.30 |
| **Forgetting** | Retrievability `R = exp(−t / S)`, `t` = days since last practice. Stability `S` starts at `S0` and grows ×1.5–2.5 after each successful review. Effective ability on a skill = `m[k] · R`. | S0 = 2–8 days |
| **Misconceptions** | A set of [§7 error tags](content-authoring.md#7-error-tag-taxonomy), each with a strength 0–1 (e.g. `centrifugal` 0.7, `pair-cancels` 0.5). Seeing the explanation after falling for one lowers its strength by 0.1–0.2. | 0–6 tags |
| **Routine** | Sessions per week, minutes per session, time of day, gaps, quit date | Set by persona |
| **Device faults** | Offline share, sync delay, clock skew, app killed mid-session, duplicate uploads, reinstall | Set by persona |

### 2.2 Answering model

For an item with difficulty `b` (from `difficulty_est`, or 0.5 until calibrated) on skill `k`:

```
P(correct) = g + (1 − g) · σ(a · (ability − b))
ability    = m[k] · R
g          = guess rate × 1/(number of options)   (MCQ); 0 for numeric entry
a          = 8  (slope; how sharply ability beats difficulty)  (my call)
```

- **Multi-skill items** (L3/L4) use the weakest skill they test.
- **Wrong answers are not random.** If the student holds a misconception that matches a distractor's error tag, they pick that distractor with probability = the tag's strength. Otherwise they pick the distractor whose tag is closest to their weak skills (`no-resolve` when resolving is weak), else a random one.
- **"I don't know"** is pressed when `ability < 0.2`, with a persona-set probability.
- **Response time** is drawn from a log-normal around 20–60 s, slower for weak skills and on low-end devices.

### 2.3 What the engine is checked against

The truth lives in its own `sim_truth` table, written by the simulator and never read by the scheduler, the API or the dashboard. Only the `/admin` Learning engine panel and the go/no-go report join it to the engine's estimates.

## 3. How it runs

| Part | How |
|---|---|
| **Same door as the app** | Each synthetic student is a client of the real sync API: sign-up, onboarding, pull content packs, push append-only attempt events in batches, get the next queue. No back door into the database. The scheduler runs from the shared package, as on the phone. |
| **Simulated teachers** | 4 teachers, 6 classes, ~100 students _(my call; matches the pilot)_. They sign in, set "teaching now" by a syllabus schedule, assign practice, open the dashboard twice a week, and press **Useful / Not right?** using the truth (an oracle). |
| **Simulated parents** | Get the digest and report links in a WhatsApp sink (logged, never sent), open some of them, and give or withhold consent on a schedule. |
| **Sandbox payments** | PayHere sandbox and test activation codes. Some students pay after the first session, some don't, some pay late, one refund. |
| **Time compression** | The backend runs on a controllable clock ([DR-0044](../decisions/0044-controllable-backend-clock.md)). 8 pilot weeks (56 days) in about 1 hour, so about 1 sim day per minute. Nightly jobs (insights, mastery recompute, digests) fire when the sim clock passes their time. |
| **Fault injection** | Switchable during a run: offline for N sim days, duplicate batches, out-of-order events, clock skew on the device, app killed mid-session, API 500s and timeouts, slow DB, a bad content pack, a reinstall that loses local state. |
| **Load** | One run at 10× (1,000 students, 60 classes) to check the API, sync and nightly jobs. |
| **A few real-UI runs** | 2–3 personas driven through the real Expo app on a low-end Android device or emulator with Maestro, over 2–3 sim days each, and the dashboard with Playwright _(my call: tools)_. They catch what the API-level sim can't: rendering, the 2 s first card, the paywall screen. |
| **Where** | A staging Supabase project. Production keeps a real-time clock and the sim controls are off ([DR-0044](../decisions/0044-controllable-backend-clock.md)). |
| **Separation** | Every user row carries `simulated` ([DR-0045](../decisions/0045-simulated-flag-on-every-user.md)). Analytics, digests, payments reports and real dashboards filter it out. |

Each run has a seed, so a failing run can be replayed exactly.

## 4. Planted patterns

Every simulated class gets a few known patterns, so we can check the dashboard finds them.

| Pattern | Planted as | The dashboard should show |
|---|---|---|
| **Bottleneck with a root cause** | 40% of the class has weak resolving forces (`m` ≤ 0.3), so circular motion fails | "Reteach the root cause" chain `බල විභේදනය → වෘත්ත චලිතය → N students` ([dashboard rules](teacher-dashboard.md)) |
| **Shared misconception** | 30% of the class holds `centrifugal` at strength ≥ 0.6 | "Clear up a misconception" card with the right count (± 2) |
| **Quiet students** | 3 students stop after week 2 | Named in "Quiet students" within 3 sim days |
| **Fading topic** | The class practised kinematics in weeks 1–2, then stopped | Kinematics in the "Fading" line by week 5 |
| **Control class** | One class with no planted bottleneck | No bottleneck card (any card is a false alarm) |

## 5. Personas

Each class is a mix of these. Values are starting points; the simulator adds noise (±20%) per student. "Prior" is mean true mastery at the start, before prerequisites cap it.

| Persona | Share | Prior | λ | S0 | Misconceptions (strength) | Routine | Guess | Faults |
|---|---|---|---|---|---|---|---|---|
| **Strong Bio** | 15% | 0.60 | 0.25 | 6 d | `centrifugal` 0.3, `pair-cancels` 0.3 | 6 sessions/week, 6 min, evenings | 0.2 | Offline 10% |
| **Struggling Bio** | 20% | 0.25; resolving forces 0.15 | 0.10 | 2 d | `v-zero-at-top` 0.7, `force-along-motion` 0.7, `pair-cancels` 0.6, `centrifugal` 0.6, `friction-direction` 0.5, `forgot-mu` 0.5 | 4/week, 5 min, often "I don't know" (30%) | 0.4 | Offline 20%, low-end phone |
| **Physical Science** | 20% | 0.65; vectors and resolving 0.85 | 0.30 | 8 d | `ke-conserved-inelastic` 0.4 | 5/week, 5 min, mornings | 0.15 | Offline 10% |
| **Binge-then-quit** | 10% | 0.40 | 0.18 | 3 d | `motion-vs-accel` 0.5, `mean-of-speeds` 0.5 | Week 1: 2 sessions/day, 25 min (hits the daily cap). Week 2: 2 sessions. Gone after day 14. | 0.3 | Offline 10% |
| **Steady 5-minute** | 15% | 0.45 | 0.15 | 4 d | `up-down-time` 0.5, `sign` 0.4 | 7/week, exactly 5 min, same time each day | 0.25 | Offline 5% |
| **Comeback kid** | 10% | 0.40 | 0.15 | 3 d | `accel-zero-at-top` 0.6, `normal-vertical` 0.5 | 5/week in weeks 1–2, a 10-day gap in weeks 3–4 (term test), back at 6/week in weeks 5–8 | 0.3 | Offline 10% |
| **Mostly offline** | 10% | 0.45 | 0.15 | 4 d | `force-on-wrong-body` 0.5, `no-resolve` 0.5 | 5/week, 5 min | 0.25 | Offline 80%, syncs every 3–5 days on school Wi-Fi, clock skew ± 10 min, app killed mid-session 10%, one reinstall |

What each persona tests:

- **Strong Bio / Physical Science:** the engine moves fast and doesn't make them grind skills they know. Physical Science also tests the "any physics student" path ([DR-0028](../decisions/0028-any-physics-student-adaptive.md)).
- **Struggling Bio:** soft gating sends them back to prerequisites; misconceptions show up in their error tags.
- **Binge-then-quit:** the daily cap holds; the student shows as quiet; the guarantee rules ([DR-0021](../decisions/0021-usage-tied-guarantee.md)) count days correctly.
- **Steady 5-minute:** the ideal user. Mastery should rise steadily and reviews should come due on time.
- **Comeback kid:** no-guilt catch-up ([DR-0019](../decisions/0019-teen-retention-design.md)): no flood of overdue reviews on return, and the queue still fits 5 minutes.
- **Mostly offline:** event sync is idempotent and ordered; nothing is lost or counted twice; mastery on the phone and the server agree after sync.

## 6. The `/admin` "mission control" page

A narrow page in the teacher web app (`apps/web`), for Viraj only. It shows what UniKey alone knows and holds the few controls that must be instant. Everything generic is borrowed ([DR-0046](../decisions/0046-narrow-admin-page-reuse-tools.md)).

### 6.1 Mock-up

```
┌─ UniKey /admin ──────────────────────────── env: STAGING · clock: SIM day 23 (Tue 09:40) ─┐
│ SIM  [▶ Start] [⏸ Pause] speed [1× | 60× | 1440×]  seed 4711   faults: [offline ▾] [+]   │
│ Show: (•) real  ( ) simulated  ( ) both                                                  │
├──────────────────────────┬──────────────────────────┬────────────────────────────────────┤
│ PULSE                    │ LEARNING ENGINE          │ CONTENT HEALTH                     │
│ active today   61 / 100  │ est. vs true  r = 0.78 ✓ │ items live        412              │
│ sessions       74        │ within cap    97% ✓      │ wrong > 85%       3  [view]        │
│ median minutes 5.2       │ overdue > 3d  4 students │ distractor never  11 [view]        │
│ sync lag p95   41 s      │ past-due bug  0 ✓        │ "Not right" flags 2  [view]        │
│ errors (Sentry) 2 [open] │ [scatter] [per skill]    │ disabled          1  [undo]        │
│ payments pending 3       │                          │ pack: mech v14 [publish] [rollback]│
├──────────────────────────┼──────────────────────────┼────────────────────────────────────┤
│ INSIGHT CHECK            │ FLOWS                    │ TOOLS                              │
│ bottleneck found  6/6 ✓  │ install → 1st session 92%│ student lookup [ id / phone ]      │
│ false alarms   0.3/cl/wk │ 1st session → paid   48% │ grant premium  [ id ] [days]       │
│ misconception ±2  5/6    │ joined class         81% │ repair streak  [ id ] [date]       │
│ Useful / Not right 14/2  │ parent consent       63% │ teacher digest [ class ▾ ] [make]  │
│ [per class]              │ [open in PostHog]        │ flags [open in PostHog]            │
└──────────────────────────┴──────────────────────────┴────────────────────────────────────┘
```

### 6.2 Panels

| Panel | Shows | Source |
|---|---|---|
| **Pulse** | Active students today and this week, sessions, median minutes, sync lag, open errors, pending payments | Own DB + Sentry count |
| **Learning engine** | Estimated vs true mastery (simulated only: correlation and scatter), share of student-days within the daily cap, overdue backlog, invariant breaks (scheduled in the past, mastery outside 0–1) | Own DB + `sim_truth` |
| **Content health** | Items by wrong rate, distractors never chosen, items whose observed difficulty is far from `difficulty_est`, reviewer and "Not right?" flags, disabled items, current pack version per unit | Own DB (attempt events) |
| **Insight check** | Simulated: planted bottleneck found or missed, false alarms per class per week, misconception counts vs truth. Real: Useful / Not right rates per card type | `class_insights` + `insight_feedback` + `sim_truth` |
| **Flows** | Install → first session → paywall → paid; class join; parent consent; digest opened | Headline numbers here, detail in PostHog |

Every panel has the **real / simulated / both** switch. The default is real.

### 6.3 Controls

| Control | What it does | Notes |
|---|---|---|
| **Sim start / pause / speed** | Runs the simulator, sets the clock speed, sets the seed | Staging only. Hidden in production. |
| **Fault injection** | Turns faults from §3 on or off during a run | Staging only |
| **Feature flags** | Turn features on or off per cohort | PostHog flags; the page links there |
| **Disable an item or template now** | Adds it to a small kill list sent with every sync pull, so phones stop showing it on their next sync without a new pack | Logged; undo in one click |
| **Content publish / rollback** | Publish a reviewed pack, or point a unit back to the previous pack version | Logged |
| **Student lookup (read-only)** | Events, mastery, queue, sync state and entitlements for one student. No editing. | Every lookup of a real student is logged (minors' data, [legal & privacy](legal-and-privacy.md#privacy-minors-data)) |
| **Grant premium** | Gives a student N days of premium (support, refunds, teacher deals) | Written as an `admin_action` event |
| **Repair streak** | Restores a streak lost to a bug, e.g. a sync failure | Written as an `admin_action` event |
| **Generate a teacher digest** | Makes the digest text for one class now, for a manual WhatsApp send | Same generator as the nightly job |

Every write is an append-only `admin_action` event with who, what, why (a short required note) and when. No control edits student events.

### 6.4 Borrowed, not built

| Need | Tool |
|---|---|
| Funnels, retention curves, cohorts, session replay | PostHog |
| Feature flags and gradual rollouts | PostHog |
| Crashes, errors, slow requests | Sentry |
| Raw tables, SQL, one-off data fixes | Supabase Studio (with care; prefer `admin_action` events) |
| Job queue state | pg-boss tables in Supabase Studio |

## 7. "Safe to launch the pilot": go/no-go

Run the full 8-week sim (100 students), the 10× load run and the real-UI runs about a week before the pilot. This is a **soft gate** ([DR-0047](../decisions/0047-simulator-as-engine-acceptance-test.md)): the results go into a report, and they don't block the mid-January start on their own. Every failed row gets a note (fixed, fix planned in pilot week N, or accepted risk), and Viraj decides.

| Area | Check | Pass |
|---|---|---|
| **Data integrity** | Events lost, duplicated or reordered after offline, duplicate batches, reinstall | 0 lost, 0 double-counted; phone and server mastery agree after sync |
| **Data integrity** | Simulated rows in real reports, digests, PostHog or payments | 0 |
| **Privacy** | Teacher sees students outside their class; skill data before parent consent; signed link opened by the wrong person | 0 leaks; RLS tests pass ([DR-0039](../decisions/0039-teacher-default-visibility.md)) |
| **Privacy** | Real-student lookups and admin writes logged | 100% |
| **Learning engine** | Correlation of estimated vs true mastery, over student × skill pairs with ≥ 3 attempts | **r ≥ 0.7 by sim week 2** |
| **Learning engine** | Student-days within the daily cap | **≥ 95%** of students stay within the cap |
| **Learning engine** | Invariants: never scheduled in the past, mastery within 0–1 | 0 breaks |
| **Learning engine** | Comeback kid's first day back | Fits the daily cap; no overdue flood |
| **Teacher insights** | Planted bottleneck found with the right root cause | **≥ 90% of classes** |
| **Teacher insights** | False alarms (a card the truth doesn't support) | **≤ 1 per class per week** |
| **Teacher insights** | Quiet students named | Within 3 sim days of going quiet |
| **Flows** | Onboarding, first session, paywall, sandbox payment, activation code, class join, parent consent, digest | All complete end to end in real-UI runs |
| **Performance** | Open → first card on a low-end Android phone | **< 2 s** |
| **Performance** | 10× load (1,000 students) | Sync p95 < 2 s, nightly jobs finish before 06:00, no errors _(my call: numbers)_ |
| **Content** | Items in the 3 pilot units | All reviewed and published; none with a wrong rate > 85% in the sim unless intended |
| **Operations** | Disable an item, roll back a pack, grant premium, repair a streak, make a digest | Each done once in staging, takes < 1 min |
| **Operations** | Sentry alerts and backups | Alerts reach Viraj's phone; one restore tested |
| **Humans** | Pilot teachers onboarded, wife and reviewers signed off, support WhatsApp number ready | Done |

## 8. Caveats

- **It proves plumbing and engine consistency, not teen retention.** Synthetic students behave the way we wrote them. They can't tell us whether a 17-year-old comes back on day 9. Only the pilot ([E01](../experiments/E01-founding-100-pilot.md), [DR-0009](../decisions/0009-pilot-exit-criteria.md)) answers that.
- **The engine and the simulator share our assumptions.** If both believe the same wrong thing about learning (for example, that prerequisites are as strict as the graph says), the sim will pass anyway. Mixing in personas with different rules and noise helps a little; real data is the real test.
- **Thresholds will be retuned on real data.** The sim sets sane starting values for the dashboard rules; the "Useful / Not right?" feedback tunes them in the pilot.
- **Don't over-build.** The `/admin` page stays narrow. If a need is generic, use the borrowed tool.

## 9. Build plan

**Budget: 1.5–2 weeks**, after the student study loop and dashboard plumbing work against the shared backend.

| Part | Effort | When |
|---|---|---|
| Controllable clock + `simulated` flag | ~1 day | Roadmap step 1 (monorepo, data model). Cheap now, expensive later. |
| Simulator core: personas, hidden state, answering model, `sim_truth` | 3–4 days | Late Dec 2026 |
| Drivers: sync API client, teacher and parent bots, sandbox payments, fault injection | 2–3 days | Late Dec 2026 |
| `/admin` page: panels and controls | 2–3 days | Late Dec 2026 – early Jan 2027 |
| Real-UI runs, 10× load run, go/no-go report | 1–2 days | First week of Jan 2027, about a week before the pilot |

## 10. Open questions

- Clock speed vs nightly job length: does a full insights recompute fit in a sim minute at 10×, or does the 10× run go slower?
- Should a small set of simulated "canary" students run in production at real speed during the pilot, to catch regressions early? The `simulated` flag allows it; the default is no _(my call)_.
- Which low-end Android phone is the reference device for the 2 s target ([A28](../experiments/assumptions.md))?
