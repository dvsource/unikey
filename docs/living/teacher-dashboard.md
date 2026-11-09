# Teacher Dashboard

_Last updated: 2026-11-07 (rev 2, after review). Source: brainstorm with Viraj (side session), building on the business-plan chat's dashboard draft. Status: P0 prototype built (`dashboard/`), not yet deployed or shown to teachers._

Related: [product spec](product-spec.md#teacher-dashboard) · [go-to-market](go-to-market.md#teachers) · [UX design](ux-design.md) · [tech architecture](tech-architecture.md) · [open topics](open-topics.md) T11, B6 · [DR-0002](../decisions/0002-teachers-as-channel.md), [DR-0020](../decisions/0020-no-push-notifications.md), [DR-0018](../decisions/0018-student-is-primary-customer.md), [DR-0034](../decisions/0034-teacher-offer-free-tool-plus-affiliate.md) · [simulation and admin](simulation-and-admin.md) (insights checked against planted patterns)

**One line:** the dashboard doesn't ask teachers to analyse anything. It tells them what to do in class this week, in sentences, and every card ends in one action that takes under a minute.

Items marked _(my call)_ were not discussed with Viraj. The builder can settle them, or Viraj can override them.

**Rev 2 changes** (after the review, with Viraj's answers):
- No affiliate share in the pilot or for government teachers. DR-0034 stays as it is, and the Earnings screen is out of the pilot.
- Every insight card gets a "Useful / Not right?" feedback button.
- A root-cause chain needs prerequisite-check data from at least 3 students.
- No skill data reaches a teacher before parent consent.
- Students give the name their teacher knows them by when they join.
- Readiness is labelled "practice readiness".
- The pilot measures changed.
- "Show 3 questions" stays cut (Viraj).

## 1. Who it's for and the jobs

| Teacher | When | What they need |
|---|---|---|
| **Pilot teachers** (3–4, mostly **government school**, 1–2 classes each) | Jan–Mar 2027 | Live class insights they act on: what to reteach, who's slipping, how ready the class is. In return for trying it: free premium, a Founding Teacher credit, and optional paid reviewing. **No affiliate share.** |
| **500-channel teachers** (wave 1+, mixed government and tuition) | Pitch at pilot weeks 4–6, onboard Mar–Apr | A reason to sign up (the paper builder, prototyped separately) plus a reason to stay (insights) |
| **Mid-size tuition teachers** (100–500 students, several batches) | +3–6 months | The same insights across batches, plus earnings: the affiliate share for private-tuition students, once L2 is answered ([DR-0034](../decisions/0034-teacher-offer-free-tool-plus-affiliate.md)) |

**Jobs the teacher hires it for** (pilot):
1. **"Tell me what to reteach this week, and why."** This means the root cause, not the symptom ("circular motion is failing because of resolving forces"), and the misconceptions the class shares ("14 students think v = 0 at the top"). Only UniKey has this data, through the prerequisite edges and distractor error tags.
2. **"Who's slipping quietly?"** Students who stopped practising, or whose mastery is falling, flagged before the term test.
3. **"Is my class ready for the test?"** Class practice readiness for the unit being taught, and which topics are fading.
4. **"Point their practice at what I'm teaching."** Set the current topic and assign this week's practice.

Earnings ("What do I earn?") is a later job, for private-tuition teachers only.

The paper builder (selling point #1 in GTM) is **out of scope here**. Viraj wants it discussed in its own conversation. See [§8](#8-open-questions).

## 2. Principles

1. **Actions, not charts.** Each card is one sentence, one number or name, and one button. No heatmap to interpret.
2. **Sentences first, numbers second.** "9 students are stuck on resolving forces" comes before any percentage.
3. **WhatsApp is the front door.** The Sunday digest links straight into the dashboard. It's a weekly habit, not a tool the teacher has to remember.
4. **Five minutes or less** per visit. If it takes longer, the design has failed.
5. **No new app.** It's a mobile-first web app, opened from WhatsApp on a phone and signed in by phone number. Laptops work, but the design targets phones.
6. **Supportive, not surveillance.** Students are "quiet" or "needs a hand", never ranked by failure. There's no teacher-side leaderboard.
7. **UniKey never messages students for the teacher.** There are no nudge buttons ([DR-0020](../decisions/0020-no-push-notifications.md)). The teacher sees names and handles it in person.
8. **The student knows what the teacher sees** and can lower it ([DR-0018](../decisions/0018-student-is-primary-customer.md)).
9. **Honest numbers.**
   - Class patterns appear only with at least 5 active students.
   - A root-cause chain appears only when the prerequisite check has data from at least 3 students.
   - Readiness is labelled **"practice readiness"**, never a predicted mark. Assumption [A24](../experiments/assumptions.md), that readiness tracks mock results, is still untested.
10. **Every insight can be wrong, and the teacher can say so.** Each insight card has **"Useful" / "Not right?"**, logged as an event. This is the main input for tuning thresholds and fixing graph edges. A wrong insight in week 2 costs a teacher's trust.
11. **Dawn design, with more restraint.** It uses the same tokens as the student app ([DR-0025](../decisions/0025-dawn-design-system.md)), with fewer illustrations and denser lists. The UI is in English, with skill and topic names in Sinhala ([DR-0024](../decisions/0024-sinhala-medium-ui-language.md)).

## 3. Screen inventory

Navigation is 3 tabs: **This week · Topics · Students**. Class setup sits behind the class name in the header _(my call)_.

| # | Screen | What's on it | Ends in | Pilot |
|---|---|---|---|---|
| S1 | **This week** (home) | **Header:** class name · joined · active this week · **practice readiness** for the "teaching now" unit. **Up to 3 action cards:** ① **Reteach the root cause**, shown as a chain, e.g. `බල විභේදනය → වෘත්ත චලිතය → 9 students` ② **Clear up a misconception**, a quote of the trap plus a count ③ **Quiet students**, names only. Each insight card has **Useful / Not right?**. **Then** a "Fading" line: topics whose class retrievability has dropped. | Open the skill · assign it as practice · open the student list | **Live** |
| S2 | **Topics** | The "teaching now" unit's topics as rows, each with **one bar** (mastered / practising / fading / not started), sorted worst first. Tap a row for its skills: the same bars, plus the top error tags. | Assign a skill or topic | **Live** |
| S3 | **Students** (list) | Joined students, by the name they gave at join: practice days this week, streak, trend arrow. "Quiet" ones are grouped at the top, never sorted by score. Each row shows what that student shares: effort only, effort + skills, or "waiting for parent consent". | Open a student | **Live** |
| S4 | **Student detail** | Practice days (last 4 weeks), streak, unit rings, skill states, mistake patterns ("40% of errors are units"). Only what the student shares. At effort-only, or before parent consent, the skill sections show "Kasun shares practice days only." | (read only) | **Live** |
| S5 | **Class setup** | Class/batch name, **class code + QR**, a WhatsApp share text, roster with join dates and sharing levels, a **"Teaching now"** topic picker (one tap, per class), and a way to remove a student. | Share code · change topic | **Live** |
| S6 | **Assign** (sheet, opened from S1/S2) | Pick skills or a topic for "this week's practice", with a due week. It shows how many students it will reach. Students see it as a recommendation and can skip it. | Assign | **Live** |
| S8 | **Digest** (WhatsApp message, not a screen) | Sunday evening: the same 3 actions as S1, practice readiness, and quiet-student count, each with a deep link. Every few weeks it ends with a 2-question check-in: "Did you use anything this week? What was missing?" | Opens S1 | **Live, manual send** |
| S9 | **Sign-in / onboarding** | Phone OTP → name, school, medium → create first class → code + QR. | Share code | **Live** (pilot accounts can be set up by hand) |
| S7 | **Earnings** | Paying private-tuition students who joined with the teacher's code, months covered, amount (100 LKR × paying student-months), payout status, and a "No share for me" switch. | (read only) | **Later**, after L2, private tuition only |
| — | Paper builder | Separate conversation | | Prototype by weeks 4–6 (separate plan) |
| — | Class sets / projector mode / "Show 3 questions" / board explanations | | | **Not in pilot** (Viraj). Revisit if P0 teachers ask "what do I do with this in class?" ([TD11](#8-open-questions)) |

**Empty and early states matter more than full ones.** In week 1, S1 uses the onboarding quick-check (A4) results: "Your class starts strongest in X, weakest in Y." Until at least 5 students are active, S1 and S2 show "Patterns appear once 5 students have practised" instead of percentages.

**Thresholds** _(my call; tune in the pilot from the Useful / Not right? feedback)_:
- **Quiet:** no session for 7+ days. This matches the DR-0020 ladder; the first draft said 4. Falling mastery means unit readiness down at least 5 points over 2 weeks.
- **Bottleneck skill:** a skill in the "teaching now" unit where at least 30% of active students (minimum 3) have failed it after 3 or more attempts.
- **Root cause (hard rule):** the bottleneck's `requires` prerequisite with the weakest class mastery. It's shown **only when the scheduler's prerequisite quick-checks have data from at least 3 students** and confirm that prerequisite is weak. Otherwise the card shows the skill alone, without a chain. The prerequisite edges are known to be partly too strict, so this rule protects trust.
- **Shared misconception:** the same error tag from at least 3 students within 14 days. It's shown as the tag's student message, quoted.
- **Fading:** class-average retrievability for a topic below 0.7 _(placeholder)_.

## 4. Pilot vs later

| Pilot day 1 (mid-Jan 2027) | Pilot weeks 2–6 | After pilot |
|---|---|---|
| S9 sign-in, S5 class setup + roster + teaching-now | S1/S2 insights fill in as data arrives; thresholds tuned from feedback | Automated digest (WhatsApp Cloud API template) |
| S3/S4 students (effort first, skills as data and consent arrive) | S8 digest every Sunday (manual send) | S7 earnings + affiliate ledger + payout, for private-tuition students, after L2 |
| S6 assign | "Did it help?" loop: "practice readiness on X went 41% → 63% after you assigned it" | Multi-batch views and comparisons for tuition teachers |
| S1/S2 with quick-check placement, empty states, feedback buttons | Paper-builder prototype for the 500-channel pitch (separate plan) | Class sets, projector mode, teaching materials (notes + sims on a projector) |
| | | One admin report (from survey data), exports; paper builder for real, free vs paid decided ([DR-0034](../decisions/0034-teacher-offer-free-tool-plus-affiliate.md)) |

**Pilot-live list, and nothing else:** S9, S5, S3, S4, S1, S2, S6, feedback buttons, and the manual digest. Viraj is building alone, alongside the student app.

**Don't build for the pilot:** earnings, ledger or payment attribution; teacher-side leaderboards or rankings; complex filters and date ranges; desktop-only layouts; messaging students; class sets.

## 5. Data it needs

### From the student app (all already planned as append-only events, [tech](tech-architecture.md#sync-stays-simple-no-sync-engine-at-first))
| Event / data | Used for | Status |
|---|---|---|
| `class_joined` / `class_left` (class code, display name "the name your teacher knows you by", timestamp) | Roster | **New:** A1 already has an optional class-code field; the name is asked only at join |
| `sharing_level_set` for the teacher (effort / effort+skills) | What S3/S4 show | **New:** a student-app setting plus the "Your teacher sees…" screen at join |
| Parent consent status (from A8) | Skills hidden from the teacher until consent | Planned (A8); dashboard reads it |
| Placement (A4 quick check) results per skill | Week-1 class map | Planned |
| `attempt` at step level: item, skill ids, layer, correct, hints, ms, error_tag, "I don't know" | Mastery, bottlenecks, misconceptions | Planned ([product spec data model](product-spec.md#data-model-sketch)) |
| `session_completed` (date, minutes, items) | Active/quiet, practice days, streak | Planned |

### From the dashboard itself
| Event | Used for |
|---|---|
| `insight_feedback` (teacher, class, card type, skill/tag ids, useful / not right, optional note) | Threshold tuning (TD9), graph-edge fixes, trust tracking |
| `dashboard_action` (open skill, assign, open student list) and `digest_opened` | Pilot measures |

### Computed on the server (source of truth, not the device)
- **Per student:** KC mastery θ, retrievability R, skill state, unit readiness. These are recomputed from events as the tech doc already says.
- **Per class** (nightly pg-boss job, plus on demand when opened) _(my call)_: active count, practice readiness, bottleneck + root cause (with the ≥ 3-student evidence check), shared misconceptions, fading topics, quiet list, assignment uptake.
- These are stored as a small `class_insights` snapshot per class per day, so the digest and the "did it help?" loop can compare weeks.

### Teacher-side data (new tables)
- `teacher` (phone, name, school, medium)
- `class` (teacher_id, name, code, teaching_now_topic_id)
- `class_member` (class_id, student_id, display_name, joined_at, left_at, sharing_level)
- `assignment` (class_id, skill_ids[], week, created_at)
- `insight_feedback` (see above)
- Later: `affiliate_ledger`, and an activation code → class code link.

### Back into the student app
- **Teaching now** → the student queue's `in_current_unit` factor (the strongest one).
- **Assignments** → a recommendation in the queue, labelled e.g. "This week in class: වෘත්ත චලිතය". There's no notification, and the student can skip it. _This needs a small student-app change; flag it to the app session._

### Privacy and consent (under-18s)
- Teachers see **only students who joined their code**. They never see parent contacts, payment details, or students outside their class.
- **Default visibility: effort + skill map** (Viraj). At join the student sees: "Your teacher sees your practice days, topic progress and mistake patterns. Your results also count in anonymous class totals." The student can lower it to effort only at any time in settings. Raw scores and individual answers are never shown.
- **Before parent consent (rule):** the teacher sees the student's name and effort only. Skills and mistake patterns appear once consent arrives (A8, 7-day grace). Check this against [L5](legal-and-privacy.md).
- **Class totals:** class-level numbers count every member, effort-only students included, as the join screen says. They're shown only once at least 5 are active, so no single student can be picked out.
- **Leaving a class:** removes that student from the teacher's view straight away. Their history stays with the student.
- **RLS:** teacher reads go through class membership only. This is on the "review line by line" list ([tech](tech-architecture.md#review-rules-for-ai-written-code)).

## 6. Build plan

| Phase | When | What | Done when |
|---|---|---|---|
| **P0 Fake-data prototype** | Week of 2026-11-09 (~1 week) | Next.js app in `dashboard/`, throwaway like the student prototype, static with no backend. **Data:** one hard-coded class, "Grade 13 · 2027 batch", with 24 fake students and realistic patterns: a resolving-forces bottleneck, a v = 0 misconception, 3 quiet students, mixed sharing levels, one student waiting for consent. Real Sinhala Mechanics skill names from `content/skills/mechanics`. **Screens:** S1–S6 and S9 (fake sign-in), a sample digest text, working feedback buttons (stored locally). Dawn tokens. Deploy to a phone-openable URL. | Viraj's wife and 1–2 pilot teachers have opened it on their phones from a WhatsApp link, and their reactions are written down here. **Built 2026-11-07** (see [`dashboard/README.md`](../../dashboard/README.md)). The fake class uses a circular-motion bottleneck and the `centrifugal` misconception, which have real graph edges and tags. Not deployed yet. |
| **P1 Revise** | +2–3 days | Fold in teacher feedback: card wording, thresholds, what's missing or unused, and whether TD11 (an in-class action) needs revisiting | The screen list is frozen for the pilot |
| **P2 Data plumbing** | Late Nov–Dec, alongside student-app step 3 | `apps/web` in the monorepo, teacher auth (phone OTP), the tables in §5, class join + name + sharing level in the student app, server-side mastery recompute, the `class_insights` job | A test student joining a test class shows up in the roster with correct mastery |
| **P3 Live pilot dashboard** | Ready by ~2027-01-10 | S9, S5, S3, S4, S6 live; S1/S2 with empty and placement states and feedback buttons; RLS reviewed line by line | All pilot teachers have classes and codes before day 1 |
| **P4 Digest + insights live** | Pilot weeks 1–3 | Digest text generator (copy-paste for a manual WhatsApp send), S1/S2 thresholds tuned on real data and feedback | ≥ 3 of 4 teachers open the digest link in week 2 |
| **P5 Mid-pilot** | Pilot weeks 4–6 | "Did it help?" loop; paper-builder prototype (its own plan) for the 500-channel pitch | The pitch demo is ready |

**Pilot measures:**

| Measure | Target |
|---|---|
| Teachers opening the digest weekly | ≥ 3 of 4 |
| Teachers acting on a card at least once a week (Assign, open skill, or feedback) | ≥ 3 of 4 |
| "Useful" share of insight feedback | Track; investigate any card type mostly marked "Not right?" |
| Weekly WhatsApp check-in: "Did you use anything? What was missing?" | Answers logged here every week |
| Mastery gain on assigned or reteached skills vs others | Measurably higher |
| Quiet students back within 7 days of being flagged | Track (no target yet) |
| End-of-pilot quote: "I changed what I taught because of it" | Best marketing line |

## 7. Proposed decision records

These are numbered [DR-0037](../decisions/0037-teacher-dashboard-principles.md) to [DR-0043](../decisions/0043-dashboard-fake-data-prototype-first.md) (all Accepted 2026-11-07), in the order below. Rev 2 changes DR 4 (0040) completely, and adjusts 3 (0039) and 6 (0042); the DR files match rev 2.

1. **DR-0037: Teacher dashboard principles.** Actions, not charts. Mobile-first web opened from WhatsApp. Five minutes or less per visit. Supportive, not surveillance. Honest numbers: practice readiness, never a predicted mark; root cause only with evidence from at least 3 students; feedback on every insight card. Dawn design. English UI with Sinhala skill names (extends [DR-0024](../decisions/0024-sinhala-medium-ui-language.md) to teachers).
2. **DR-0038: Quiet students are shown by name only.** UniKey sends no nudges for the teacher, by WhatsApp or in the app. The teacher handles it in person. This confirms [DR-0020](../decisions/0020-no-push-notifications.md) on the teacher side.
3. **DR-0039: What a teacher sees by default is effort + skill map.**
   - That means practice days, streak, skill mastery and mistake patterns.
   - The student gives the name their teacher knows them by, is told at join what the teacher sees and that their results count in anonymous class totals, and can lower it to effort only.
   - **No skill data before parent consent.**
   - Class patterns need at least 5 active students.
   - This extends [DR-0018](../decisions/0018-student-is-primary-customer.md) to teachers.
4. **DR-0040 (rewritten): No affiliate share in the pilot or for government teachers.**
   - [DR-0034](../decisions/0034-teacher-offer-free-tool-plus-affiliate.md) stands: the share applies to private-tuition students only, and only once L2 is answered.
   - Pilot teachers get free premium, a Founding Teacher credit, and optional paid reviewing.
   - The Earnings screen, ledger and payout are out of the pilot.
   - Why:
     - A government teacher earning from a paid app they recommend to the school students they also grade is the conflict MoE circulars target. One complaint could hurt the wife's standing and the brand in the 500-teacher channel before launch.
     - One pilot teacher is the wife, and paying a family business share adds nothing.
     - 200 of the 300 LKR pilot price is a large cost for no learning.
   - _This replaces the earlier draft, "share for every teacher", which Viraj reversed after review._
5. **DR-0041: The teacher sets "Teaching now" per class.** One tap picks the topic. It drives the student queue's `in_current_unit` factor and the dashboard's "fading" signal.
6. **DR-0042: Pilot dashboard scope.**
   - **Live:** This week, Topics, Students + student detail, Class join + roster, Assign, and Useful / Not right? feedback on insight cards.
   - **Not in the pilot:** earnings; class sets, projector mode, "Show 3 questions" or board explanations.
   - **Digest:** a manual WhatsApp send in the pilot, with a weekly 2-question check-in, automated later (as with parent reports, [DR-0015](../decisions/0015-parents-via-whatsapp.md)).
   - **Paper builder:** planned separately, and should be ready by pilot weeks 4–6.
7. **DR-0043: Fake-data prototype first.** A throwaway Next.js prototype with one hard-coded class, shown to the wife and pilot teachers before the real build on the shared backend.

## 8. Open questions

| # | Question | Lean / note |
|---|---|---|
| TD1 | **Paper builder**: how real the prototype is, free vs paid, how it uses class data | Viraj: discuss in its own conversation. Must be ready for the weeks 4–6 pitch. |
| TD2 | **L2**: can government teachers ever take an affiliate share? | No longer blocks the pilot (no share). Still needed before the affiliate share launches for tuition teachers. |
| TD3 | What the teacher sees before parent consent | **Decided (rev 2):** name + effort only until consent. Still check against [L5](legal-and-privacy.md). |
| TD4 | How a teacher recognises a student | **Decided (rev 2):** ask "the name your teacher knows you by" at class join. |
| TD5 | One student, two classes (school + tuition) | Lean: allow several classes. Affiliate attribution is only relevant later. |
| TD6 | Is the class code also the affiliate code later? | Deferred with the affiliate share. _(my call)_: one code per class would be simplest. |
| TD7 | Payout: how and when, and written terms | Deferred with the affiliate share (DR-0034). |
| TD8 | How assignments show in the student app without feeling like a teacher nudge | Lean: a queue label only ("This week in class: …"). Needs the app session. |
| TD9 | Thresholds (quiet days, bottleneck %, fading R) | Placeholders in §3; tune on pilot data and the Useful / Not right? feedback. |
| TD10 | Where the prototype is hosted so teachers can open it on a phone | Builder's call (any static host). |
| TD11 | Cards end in "open skill / assign", which doesn't give the teacher something to do in class | The review suggested "Show 3 questions" (3 existing items, full screen, castable; ~1–2 days). Viraj kept it cut. Revisit after P0 teacher reactions. |
