# UniKey teacher dashboard P0: QA spec

_Version 1 · 2026-11-07 · covers the fake-data prototype in `dashboard/` ([plan](../../docs/living/teacher-dashboard.md), phase P0)._

This spec lists every screen and function of the prototype, and the test cases for each. How and when the suites run is in [execution-plan.md](execution-plan.md). The latest results are in [test-report.md](test-report.md).

The prototype's job is to get honest reactions from teachers on their phones. So the bar is:
- nothing broken or confusing on a phone;
- the fake class tells one consistent story;
- the screens obey the decisions the dashboard is built on (DR-0037 to DR-0043).

## Conventions

- **ID:** `AREA-NN`. IDs are permanent. A removed case keeps its number, marked _retired_.
- **Priority:**
  - **P0:** blocks showing it to a teacher (a crash, a dead link, a broken screen on a phone, a privacy rule broken, numbers that contradict each other).
  - **P1:** a feature works wrongly, but there's a workaround.
  - **P2:** polish.
- **Type:**
  - **U:** Vitest unit test (`qa/unit/*.test.ts`).
  - **E:** Playwright end-to-end test on the static export (`qa/e2e/*.spec.ts`), at phone size (375×812, touch) unless stated.
  - **M:** manual check on a real phone.
- **Fresh:** the browser's localStorage is empty. Every E2E test starts fresh unless it says otherwise.
- **Test data:** the seeded fake class in `lib/data.ts`:
  - 24 students
  - quiet (7+ days): Kasun, Dilan, Ishara
  - effort only: Hasini, Yasiru, Oshadi, Ashen
  - waiting for parent consent: Nimal
  - teaching now: 2.6
  - bottleneck: `phy.mech.circ.friction-limit`, 9 stuck
  - root cause: `phy.mech.circ.centripetal-force`
  - misconception tag: `centrifugal`, 11 students

  It also uses the real Mechanics graph in `data/skills.json` (83 skills, 8 topics).

| Area | Covers |
|---|---|
| DATA | Fake class and graph data, insight logic |
| BLD | Build, static export, skills script |
| NAV | Tabs, links, every route loads |
| HOME | This week (S1): header, cards, fading, assigned banner |
| FB | "Useful / Not right?" feedback on insight cards |
| ASN | Assign sheet (S6) |
| TOP | Topics (S2) |
| SKL | Skill detail |
| STU | Students list (S3) and detail (S4) |
| PRV | Privacy and sharing rules (DR-0039) |
| CLS | Class setup (S5) |
| W1 | Week-1 preview / empty states |
| SIGN | Sign-in flow (S9) |
| DIG | Sunday digest (S8) |
| FBL | Feedback log page |
| PER | Persistence and reset |
| RULE | Product rules from the DRs |
| LAY | Layout on phones and desktop |
| SI | Sinhala rendering |
| DS | Dawn design |
| A11Y | Accessibility |
| CON | Console and network health |

## Feature inventory

| Screen / function | Path | Cases |
|---|---|---|
| This week | `/` | HOME, FB, RULE |
| Topics | `/topics/` | TOP |
| Skill detail | `/skill/<id, "." → "_">/` | SKL |
| Students, student detail | `/students/`, `/students/<id>/` | STU, PRV |
| Class setup + prototype controls | `/class/` | CLS, W1, PER |
| Assign sheet | from cards, topics, skills | ASN |
| Sign-in | `/signin/` | SIGN |
| Digest | `/digest/` | DIG |
| Feedback log | `/feedback/` | FBL |
| Data + insight logic | `lib/data.ts` | DATA |
| Skills extract | `scripts/build-skills.mjs` | BLD |

## Test cases

### DATA: fake class and graph

| ID | Pri | Type | Steps | Expected | Automated by |
|---|---|---|---|---|---|
| DATA-01 | P0 | U | Load the graph | 83 skills, 8 topics; every skill's topic exists | `unit/data.test.ts` |
| DATA-02 | P0 | U | Check skill ids and links | Ids unique; every `requires` source is a Mechanics skill; `skillHref` has no "." and round-trips through `skillIdFromSlug` | `unit/data.test.ts` |
| DATA-03 | P0 | U | Load the class | 24 students, unique ids and names; sharing counts 19 / 4 / 1 | `unit/data.test.ts` |
| DATA-04 | P0 | U | Quiet list | Exactly Kasun, Dilan, Ishara; each has 0 practice days this week and lastSeen ≥ 7 | `unit/data.test.ts` |
| DATA-05 | P0 | U | Root-cause card vs data | `stuck` equals the students whose bottleneck state is "learning"; the root is a `requires` prerequisite of the bottleneck; evidence ≥ 3 students (DR-0037) | `unit/data.test.ts` |
| DATA-06 | P0 | U | Misconception card | The tag exists in `tags`; students ≥ 3; window 14 days | `unit/data.test.ts` |
| DATA-07 | P0 | U | Class totals | Every `skillDist` sums to 24, every `topicDist` sums to 24 × skills in topic | `unit/data.test.ts` |
| DATA-08 | P1 | U | Header numbers | `activeThisWeek` = students with ≥ 1 day this week = 18; class readiness is 0–100 | `unit/data.test.ts` |
| DATA-09 | P1 | U | Determinism | Re-importing the module gives identical students and states | `unit/data.test.ts` |
| DATA-10 | P1 | U | `badness` ordering | A distribution with more stuck/fading ranks worse than one with more mastered | `unit/data.test.ts` |
| DATA-11 | P1 | U | Fading list | Topics exist; each has at least one fading skill in the class | `unit/data.test.ts` |

### BLD: build

| ID | Pri | Type | Steps | Expected | Automated by |
|---|---|---|---|---|---|
| BLD-01 | P0 | U | `npm run build` | Type check passes; `out/` holds `index.html`, 83 skill pages, 24 student pages | `unit/build.test.ts` (checks `out/`) |
| BLD-02 | P1 | U | `node scripts/build-skills.mjs` | Writes the same `data/skills.json` (idempotent) | `unit/build.test.ts` |

### NAV: navigation

| ID | Pri | Type | Steps | Expected | Automated by |
|---|---|---|---|---|---|
| NAV-01 | P0 | E | Open `/` | Tabs "This week", "Topics", "Students"; "This week" marked current | `e2e/nav.spec.ts` |
| NAV-02 | P0 | E | Tap each tab | Each page's heading shows; current tab moves | `e2e/nav.spec.ts` |
| NAV-03 | P0 | E | Request every route (6 pages, 83 skills, 24 students) | HTTP 200 and an `h1` | `e2e/nav.spec.ts` |
| NAV-04 | P0 | E | Collect every in-app link from every page and follow it | No link leads to a 404 | `e2e/nav.spec.ts` |
| NAV-05 | P1 | E | Tap the class name in the header | Opens Class setup | `e2e/nav.spec.ts` |
| NAV-06 | P1 | E | "‹ Students" / "‹ This week" back links | Return to the list / home | `e2e/nav.spec.ts` |

### HOME: This week

| ID | Pri | Type | Steps | Expected | Automated by |
|---|---|---|---|---|---|
| HOME-01 | P0 | E | Open `/` | Header: class name, "24 joined · 18 active this week", a % and the label "practice readiness" | `e2e/home.spec.ts` |
| HOME-02 | P0 | E | Read card 1 | "Reteach the root cause", chain root → bottleneck → "9 students", "Based on prerequisite checks from 7 students" | `e2e/home.spec.ts` |
| HOME-03 | P0 | E | Read card 2 | Quote "There's an outward force pushing it out", "11 students", the tag's fix message | `e2e/home.spec.ts` |
| HOME-04 | P0 | E | Read card 3 | "3 haven't practised…", chips Kasun, Dilan, Ishara with days; each opens that student | `e2e/home.spec.ts` |
| HOME-05 | P1 | E | Fading list | 2 rows, each opens Topics with that topic expanded | `e2e/home.spec.ts` |
| HOME-06 | P1 | E | "Teaching now" link | Shows the current topic; opens Class setup | `e2e/home.spec.ts` |
| HOME-07 | P1 | E | "Open the skill" on card 1 | Opens the root skill page | `e2e/home.spec.ts` |
| HOME-08 | P2 | E | Digest link at the bottom | Opens `/digest/` | `e2e/home.spec.ts` |

### FB: insight feedback

| ID | Pri | Type | Steps | Expected | Automated by |
|---|---|---|---|---|---|
| FB-01 | P0 | E | Count feedback rows on `/` | Each of the 3 insight cards has "Useful" and "Not right?" | `e2e/feedback.spec.ts` |
| FB-02 | P0 | E | Tap "Useful" on card 1 | Toast "Thanks. Marked useful."; button shows selected; 1 entry in the log with `cardId` of card 1 | `e2e/feedback.spec.ts` |
| FB-03 | P0 | E | "Not right?" → type a note → Send | Toast; the note is saved with verdict `not-right` | `e2e/feedback.spec.ts` |
| FB-04 | P1 | E | "Not right?" → Cancel | Nothing saved; box closes | `e2e/feedback.spec.ts` |
| FB-05 | P1 | E | Useful, then Not right on the same card | Both logged; the latest verdict shows as selected | `e2e/feedback.spec.ts` |
| FB-06 | P1 | E | Week-1 placement card | Has feedback buttons too | `e2e/week1.spec.ts` |

### ASN: assign

| ID | Pri | Type | Steps | Expected | Automated by |
|---|---|---|---|---|---|
| ASN-01 | P0 | E | Card 1 → "Assign as practice" | Sheet opens; root + bottleneck pre-ticked and listed first; "no notification… can skip it" text | `e2e/assign.spec.ts` |
| ASN-02 | P0 | E | Tap "Assign to 24 students" | Toast "Assigned to 24 students…"; sheet closes; home shows "Assigned for the week of Mon 1 Feb" with both skills | `e2e/assign.spec.ts` |
| ASN-03 | P1 | E | Untick all | Assign button disabled | `e2e/assign.spec.ts` |
| ASN-04 | P1 | E | Cancel, or tap the dimmed backdrop | Sheet closes; nothing assigned | `e2e/assign.spec.ts` |
| ASN-05 | P1 | E | Remove a student, then assign | Count says 23 | `e2e/assign.spec.ts` |
| ASN-06 | P1 | E | Topics → expand a topic → "Assign from this topic" | Lists only that topic's practised skills; none pre-ticked | `e2e/assign.spec.ts` |
| ASN-07 | P1 | E | Skill page → Assign | That skill pre-ticked | `e2e/assign.spec.ts` |

### TOP: topics

| ID | Pri | Type | Steps | Expected | Automated by |
|---|---|---|---|---|---|
| TOP-01 | P0 | E | Open `/topics/` | 8 topic rows, each with a bar; legend with 5 states | `e2e/topics.spec.ts` |
| TOP-02 | P0 | E | Order | Rows sorted worst first (same order as `badness`) | `e2e/topics.spec.ts` |
| TOP-03 | P1 | E | Default open | The teaching-now topic is expanded and tagged "teaching now" | `e2e/topics.spec.ts` |
| TOP-04 | P1 | E | Tap another topic | It expands; tap again collapses | `e2e/topics.spec.ts` |
| TOP-05 | P1 | E | Skill rows | Practised skills only; tapping one opens its skill page | `e2e/topics.spec.ts` |
| TOP-06 | P2 | E | Note under list | Says bars count every student (anonymous class totals) | `e2e/topics.spec.ts` |

### SKL: skill detail

| ID | Pri | Type | Steps | Expected | Automated by |
|---|---|---|---|---|---|
| SKL-01 | P0 | E | Open the bottleneck skill | Sinhala name in `h1`, English name + topic under it; state counts sum to 24 | `e2e/skill.spec.ts` |
| SKL-02 | P1 | E | Mistakes | "Adds an outward force in circular motion" with "Say: …" and a student count | `e2e/skill.spec.ts` |
| SKL-03 | P1 | E | Needs first / Opens up | Lists match the graph's `requires` edges; links work | `e2e/skill.spec.ts` |
| SKL-04 | P2 | E | Unknown slug (`/skill/nope/`) | Not exported: 404 page, no crash | `e2e/skill.spec.ts` |

### STU: students

| ID | Pri | Type | Steps | Expected | Automated by |
|---|---|---|---|---|---|
| STU-01 | P0 | E | Open `/students/` | "Quiet" group first with Kasun, Dilan, Ishara; then everyone else A–Z | `e2e/students.spec.ts` |
| STU-02 | P0 | E | Rows | 24 rows; each has 7 day bars; no score or rank shown | `e2e/students.spec.ts` |
| STU-03 | P1 | E | Sharing chips | "shares effort only" on 4 rows; "waiting for parent consent" on Nimal | `e2e/students.spec.ts` |
| STU-04 | P0 | E | Open a sharing student (Tharushi) | Effort block; 8 topic bars; mistake pattern | `e2e/students.spec.ts` |

### PRV: privacy (DR-0039)

| ID | Pri | Type | Steps | Expected | Automated by |
|---|---|---|---|---|---|
| PRV-01 | P0 | E | Open an effort-only student (Hasini) | Effort shown; **no** topic bars, stuck list, fading or mistake pattern; "shares practice days only" | `e2e/privacy.spec.ts` |
| PRV-02 | P0 | E | Open Nimal (waiting for consent) | Effort only; "once a parent confirms consent" | `e2e/privacy.spec.ts` |
| PRV-03 | P0 | E | Any student page | No marks, phone numbers, parent details or payment info | `e2e/privacy.spec.ts` |
| PRV-04 | P1 | E | Class totals | Topics note says effort-only students count in anonymous totals | `e2e/topics.spec.ts` (TOP-06) |
| PRV-05 | P1 | E | Remove a student | Gone from the roster and the Students list (covered with CLS-04) | `e2e/class.spec.ts` |

### CLS: class setup

| ID | Pri | Type | Steps | Expected | Automated by |
|---|---|---|---|---|---|
| CLS-01 | P0 | E | Open `/class/` | Code "ANU-7K3Q", a QR code (SVG), "Share on WhatsApp" | `e2e/class.spec.ts` |
| CLS-02 | P1 | E | Share link | `https://wa.me/?text=` containing the code and join URL, opens in a new tab | `e2e/class.spec.ts` |
| CLS-03 | P0 | E | Change Teaching now to 2.3 | Toast; home "Teaching now" shows 2.3; Topics expands 2.3 | `e2e/class.spec.ts` |
| CLS-04 | P1 | E | Remove Kasun (confirm) | Roster 23; header "23 joined"; gone from Students | `e2e/class.spec.ts` |
| CLS-05 | P2 | E | Remove, then dismiss the confirm | Nothing removed | `e2e/class.spec.ts` |
| CLS-06 | P2 | E | Copy text | Button reads "Copied" | `e2e/class.spec.ts` |

### W1: week-1 preview

| ID | Pri | Type | Steps | Expected | Automated by |
|---|---|---|---|---|---|
| W1-01 | P0 | E | Tick "Preview week 1", open `/` | Header "11 joined · 3 active", readiness "—"; placement card; "Patterns appear once 5 students have practised"; no root cause / misconception / quiet cards | `e2e/week1.spec.ts` |
| W1-02 | P1 | E | Topics in week 1 | Empty state, no bars | `e2e/week1.spec.ts` |
| W1-03 | P2 | M | Students in week 1 | _Known gap:_ still lists 24 | — |

### SIGN, DIG, FBL

| ID | Pri | Type | Steps | Expected | Automated by |
|---|---|---|---|---|---|
| SIGN-01 | P0 | E | Phone (≥ 9 digits) → Send code → 6 digits → details → Create class | Ends on "Your class code" with the code and two buttons | `e2e/flows.spec.ts` |
| SIGN-02 | P1 | E | Phone shorter than 9 digits | "Send code by SMS" disabled | `e2e/flows.spec.ts` |
| DIG-01 | P0 | E | Open `/digest/` | WhatsApp bubble with the 3 actions, readiness, quiet names, "Open your class →" link, check-in question | `e2e/flows.spec.ts` |
| DIG-02 | P1 | E | Digest numbers | Match the home screen (18 of 24, 9, 11, 3 names) | `e2e/flows.spec.ts` |
| FBL-01 | P1 | E | Open `/feedback/` fresh | "Nothing yet." | `e2e/feedback.spec.ts` |
| FBL-02 | P1 | E | After FB-03 | Entry shows "Not right", card id, the note; WhatsApp link holds the JSON | `e2e/feedback.spec.ts` |

### PER: persistence

| ID | Pri | Type | Steps | Expected | Automated by |
|---|---|---|---|---|---|
| PER-01 | P0 | E | Assign, give feedback, change topic, remove a student; reload | All four kept | `e2e/persistence.spec.ts` |
| PER-02 | P1 | E | Reset | Back to defaults; toast "Prototype reset" | `e2e/persistence.spec.ts` |
| PER-03 | P1 | E | Corrupt the localStorage value | Page still loads with defaults | `e2e/persistence.spec.ts` |
| PER-04 | P2 | E | localStorage throws (blocked storage) | Page still loads | `e2e/persistence.spec.ts` |

### RULE: product rules (DR-0037 to 0043)

| ID | Pri | Type | Steps | Expected | Automated by |
|---|---|---|---|---|---|
| RULE-01 | P0 | E | Scan every page | No nudge / message-student / remind / notify buttons (DR-0038) | `e2e/rules.spec.ts` |
| RULE-02 | P0 | E | Scan every page | No earnings, affiliate, LKR or payout content (DR-0040 rev 2) | `e2e/rules.spec.ts` |
| RULE-03 | P0 | E | Scan every page | No rank, leaderboard, "top student" or "worst" student wording | `e2e/rules.spec.ts` |
| RULE-04 | P0 | E | Scan every page | No predicted marks ("/50", "predicted", "expected mark"); readiness always labelled "practice readiness" | `e2e/rules.spec.ts` |
| RULE-05 | P1 | E | Scan every page | No class sets / projector / "Show 3 questions" (DR-0042) | `e2e/rules.spec.ts` |
| RULE-06 | P1 | E | Home | At most 3 action cards (principle: 5 minutes or less) | `e2e/rules.spec.ts` |

### LAY, SI, DS, A11Y, CON

| ID | Pri | Type | Steps | Expected | Automated by |
|---|---|---|---|---|---|
| LAY-01 | P0 | E | Every page at 375×812 | No horizontal scroll | `e2e/layout.spec.ts` |
| LAY-02 | P1 | E | Every page at 320×640 (small Android) | No horizontal scroll | `e2e/layout.spec.ts` |
| LAY-03 | P1 | E | Home at 1280×800 | Content column ≤ 560 px wide, centred | `e2e/layout.spec.ts` |
| LAY-04 | P1 | E | Last element on long pages | Not hidden behind the tab bar (bottom padding) | `e2e/layout.spec.ts` |
| SI-01 | P0 | E | Sinhala skill names | Rendered with Noto Sans Sinhala (computed font), not tofu (glyph width > 0) | `e2e/sinhala.spec.ts` |
| SI-02 | P1 | E | Sinhala text | Not clipped vertically (line height ≥ 1.5) | `e2e/sinhala.spec.ts` |
| SI-03 | P2 | M | Real cheap Android | Sinhala conjuncts (්‍ර, ්‍ය) join correctly | — |
| DS-01 | P1 | E | Main buttons | Yellow `#F6C453` background; only one primary per card | `e2e/design.spec.ts` |
| DS-02 | P1 | E | Body background | Dawn sky gradient | `e2e/design.spec.ts` |
| DS-03 | P2 | E | Bar colours | Mastered green, fading terracotta | `e2e/design.spec.ts` |
| A11Y-01 | P1 | E | axe on 7 main pages | No critical or serious violations | `e2e/a11y.spec.ts` |
| A11Y-02 | P1 | E | `html lang`, page title | `lang="en"`, title "UniKey Teacher" | `e2e/a11y.spec.ts` |
| A11Y-03 | P2 | E | Day bars | Have an aria-label like "3 of 7 days" | `e2e/a11y.spec.ts` |
| CON-01 | P0 | E | Visit every route | No console errors, no failed requests (404/500) | `e2e/console.spec.ts` |
| CON-02 | P1 | E | Client-side tab navigation | No failed prefetch requests | `e2e/console.spec.ts` |

### Manual (real phone)

| ID | Pri | Type | Steps | Expected |
|---|---|---|---|---|
| M-01 | P0 | M | Open the deployed link from WhatsApp on a cheap Android (Chrome) | Loads in < 3 s on 4G; fonts load |
| M-02 | P1 | M | Same on an iPhone (Safari) | Works; tab bar clears the home indicator |
| M-03 | P1 | M | Share on WhatsApp button | Opens WhatsApp with the share text |
| M-04 | P1 | M | Feedback log → Send on WhatsApp | Opens WhatsApp with the JSON |
| M-05 | P2 | M | Gradient on a cheap LCD | No ugly banding |

## Not covered (by design)

- Real auth, backend, sync, RLS, or payment. None exist in P0.
- Content correctness of the Sinhala skill names. That belongs to the content review (DR-0027).
- Visual regression screenshots. The design will change after teacher feedback in P1.
