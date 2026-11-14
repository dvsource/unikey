# First tuning pass (Task 11): 28-day runs, seeds 1–3

_Date: 2026-11-14. Command: `npm run sim -- --days 28 --seed N --packs all --out runs/<name>`. 16 personas, all three content packs. The `runs/` folders are not committed; every number below can be reproduced from the commits listed here._

- **Before:** `runs/t0-sN`, engine at `bcfb4de`.
- **After R1–R5 and R7:** `runs/t1-sN`.
- **After the side-door cap fix:** `runs/t2-sN`.
- **After the fade numbers (final):** `runs/t3-sN`, engine at `1b2fdf8`.

## Summary

| seed | before: pass / fail | after: pass / fail | still failing |
|---|---|---|---|
| 1 | 3 / 4 | 6 / 1 | no-end-on-wrong (10) |
| 2 | 2 / 5 | 6 / 1 | no-end-on-wrong (8) |
| 3 | 3 / 4 | 6 / 1 | no-end-on-wrong (10) |

Every remaining no-end-on-wrong violation is one documented last resort: the close card and both extra close cards (`sessionEnd.maxExtraClose` 2) were all answered wrong. weak-stubborn accounts for 20 of the 28. See "What still fails" below.

## The checks table per seed

### Seed 1

Before (`runs/t0-s1`, engine at bcfb4de):

| check | result | detail |
|---|---|---|
| no-end-on-wrong | FAIL | 32 violations; first: average-noclass day 0 session 1: ended (budget) after a wrong answer on phy.elec.b01 |
| skip-timing | PASS | 64 skips, remind days on schedule, kept away until then and back by the cap |
| effort-cap-and-fairness | PASS | max day effort 34.5 ≤ 40; mean asked/day strong 18.27, weak-stubborn 11.09, weak-impatient 11.29 |
| no-repeat-14d | PASS | 2681 serves, no variant repeated within 14 days |
| ends-before-fade | FAIL | 5 violations; first: average-noclass: 7 of 28 days past hidden stamina (first average-noclass day 0 session 1, phy.elec.b01) |
| knowledge-up | FAIL | 1 violation; first: underconfident-skipper: knowledge 0.650 → 0.643 after 28 days played |
| no-back-to-back-card | FAIL | 395 violations; first: average-noclass day 1 session 2: phy.elec.b01 (close:winnable) again 2 serves after the last |

After (`runs/t3-s1`, final engine):

| check | result | detail |
|---|---|---|
| no-end-on-wrong | FAIL | 10 violations; first: average-noclass day 1 session 2: ended (budget) after a wrong answer on phy.elec.p02-02 |
| skip-timing | PASS | 48 skips, remind days on schedule, kept away until then and back by the cap |
| effort-cap-and-fairness | PASS | max day effort 28.5 ≤ 40; mean asked/day strong 12.40, weak-stubborn 11.58, weak-impatient 8.00 |
| no-repeat-14d | PASS | 2549 serves, no variant repeated within 14 days |
| ends-before-fade | PASS | worst share of days past hidden stamina 18% ≤ 20% |
| knowledge-up | PASS | 15 students kept practising, all ended above their day-0 knowledge |
| no-back-to-back-card | PASS | 2549 serves, no card again within 4 serves in a session |

### Seed 2

Before (`runs/t0-s2`, engine at bcfb4de):

| check | result | detail |
|---|---|---|
| no-end-on-wrong | FAIL | 31 violations; first: average-noclass day 3 session 4: ended (budget) after a wrong answer on phy.mech.t03 |
| skip-timing | FAIL | 6 violations; first: underconfident-skipper day 8 session 9: section phy.elec.8.3/Combination of sources of e.m.f. skipped (phy.elec.c024) and no side door by day 22 |
| effort-cap-and-fairness | PASS | max day effort 30.5 ≤ 40; mean asked/day strong 19.03, weak-stubborn 10.43, weak-impatient 10.81 |
| no-repeat-14d | PASS | 2617 serves, no variant repeated within 14 days |
| ends-before-fade | FAIL | 4 violations; first: smart-impatient: 8 of 14 days past hidden stamina (first smart-impatient day 0 session 1, phy.elec.c039) |
| knowledge-up | FAIL | 1 violation; first: underconfident-skipper: knowledge 0.650 → 0.636 after 28 days played |
| no-back-to-back-card | FAIL | 416 violations; first: average-noclass day 4 session 5: phy.mech.t02 (repair:missing-piece) again 1 serve after the last |

After (`runs/t3-s2`, final engine):

| check | result | detail |
|---|---|---|
| no-end-on-wrong | FAIL | 8 violations; first: weak-stubborn day 0 session 1: ended (budget) after a wrong answer on phy.elec.c041 |
| skip-timing | PASS | 49 skips, remind days on schedule, kept away until then and back by the cap |
| effort-cap-and-fairness | PASS | max day effort 28.5 ≤ 40; mean asked/day strong 13.31, weak-stubborn 11.58, weak-impatient 8.00 |
| no-repeat-14d | PASS | 2536 serves, no variant repeated within 14 days |
| ends-before-fade | PASS | worst share of days past hidden stamina 7% ≤ 20% |
| knowledge-up | PASS | 14 students kept practising, all ended above their day-0 knowledge |
| no-back-to-back-card | PASS | 2536 serves, no card again within 4 serves in a session |

### Seed 3

Before (`runs/t0-s3`, engine at bcfb4de):

| check | result | detail |
|---|---|---|
| no-end-on-wrong | FAIL | 44 violations; first: average-noclass day 5 session 6: ended (budget) after a wrong answer on phy.elec.c045 |
| skip-timing | PASS | 54 skips, remind days on schedule, kept away until then and back by the cap |
| effort-cap-and-fairness | PASS | max day effort 30.5 ≤ 40; mean asked/day strong 19.33, weak-stubborn 11.19, weak-impatient 10.88 |
| no-repeat-14d | PASS | 2737 serves, no variant repeated within 14 days |
| ends-before-fade | FAIL | 5 violations; first: smart-impatient: 8 of 14 days past hidden stamina (first smart-impatient day 10 session 6, phy.elec.p03-05) |
| knowledge-up | PASS | 13 students kept practising, all ended above their day-0 knowledge |
| no-back-to-back-card | FAIL | 413 violations; first: average-noclass day 2 session 3: phy.mech.t02 (close:winnable) again 2 serves after the last |

After (`runs/t3-s3`, final engine):

| check | result | detail |
|---|---|---|
| no-end-on-wrong | FAIL | 10 violations; first: weak-stubborn day 0 session 1: ended (budget) after a wrong answer on phy.elec.c041 |
| skip-timing | PASS | 52 skips, remind days on schedule, kept away until then and back by the cap |
| effort-cap-and-fairness | PASS | max day effort 25.5 ≤ 40; mean asked/day strong 14.84, weak-stubborn 11.58, weak-impatient 8.00 |
| no-repeat-14d | PASS | 2586 serves, no variant repeated within 14 days |
| ends-before-fade | PASS | worst share of days past hidden stamina 14% ≤ 20% |
| knowledge-up | PASS | 15 students kept practising, all ended above their day-0 knowledge |
| no-back-to-back-card | PASS | 2586 serves, no card again within 4 serves in a session |

## Per persona (after)

### Seed 1 (after)

| persona | days | quit day | sess | cards/s | effort/s | success | k day0→end | final profile (comfort, memory, h3Share, stamina) | hidden stamina | fatigued days | CE | skips |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| average-fastclass | 28 | - | 28 | 6.3 | 10.5 | 70% | 0.400→0.489 | c0.75 m0.60 h3 0.40 st 13.8 | 14 | 0 | 0 | 5 |
| average-noclass | 28 | - | 28 | 6.8 | 11.8 | 77% | 0.400→0.479 | c0.71 m0.77 h3 0.40 st 15.3 | 14 | 1 | 0 | 1 |
| binge-quit | 14 | - | 20 | 6.3 | 10.4 | 75% | 0.400→0.461 | c0.76 m0.50 h3 0.40 st 13.4 | 30 | 0 | 0 | 0 |
| calc-strong-memory-poor | 28 | - | 28 | 6.4 | 11.2 | 73% | 0.500→0.549 | c0.76 m0.55 h3 0.40 st 13.3 | 14 | 2 | 0 | 0 |
| comeback-10 | 18 | - | 18 | 6.4 | 10.6 | 77% | 0.450→0.497 | c0.73 m0.68 h3 0.40 st 14.3 | 14 | 0 | 0 | 0 |
| confident-misconceptions | 28 | - | 28 | 5.9 | 10.9 | 74% | 0.500→0.558 | c0.72 m0.50 h3 0.50 st 15.3 | 16 | 0 | 0 | 0 |
| fast-guesser | 28 | - | 28 | 6.5 | 11.9 | 57% | 0.300→0.355 | c0.75 m0.50 h3 0.40 st 13.3 | 18 | 0 | 0 | 0 |
| memory-good-calc-weak | 28 | - | 28 | 7.4 | 12.3 | 86% | 0.500→0.579 | c0.69 m1.34 h3 0.40 st 15.8 | 14 | 4 | 0 | 8 |
| one-feared-section | 28 | - | 28 | 6.3 | 11.1 | 82% | 0.464→0.522 | c0.72 m1.48 h3 0.20 st 14.3 | 14 | 0 | 0 | 9 |
| slow-reader | 28 | - | 28 | 5.8 | 9.8 | 72% | 0.450→0.518 | c0.76 m0.50 h3 0.40 st 12.1 | 10 | 5 | 0 | 4 |
| smart-impatient | 14 | - | 14 | 4.9 | 8.6 | 93% | 0.700→0.719 | c0.76 m1.50 h3 0.50 st 11.4 | 10 | 0 | 0 | 0 |
| steady-five-min | 28 | - | 28 | 6.0 | 10.6 | 72% | 0.400→0.476 | c0.80 m0.50 h3 0.40 st 12.3 | 12 | 1 | 0 | 2 |
| strong | 28 | - | 28 | 6.1 | 11.1 | 94% | 0.800→0.831 | c0.66 m2.00 h3 0.40 st 15.8 | 25 | 0 | 0 | 0 |
| underconfident-skipper | 28 | - | 28 | 6.6 | 10.7 | 88% | 0.650→0.690 | c0.67 m1.00 h3 0.50 st 14.3 | 12 | 2 | 0 | 18 |
| weak-impatient | 2 | 1 | 2 | 3.5 | 5.8 | 14% | 0.150→0.151 | c0.81 m1.00 h3 0.40 st 8.9 | 9 | 0 | 0 | 2 |
| weak-stubborn | 28 | - | 28 | 7.4 | 12.4 | 36% | 0.150→0.259 | c0.75 m0.50 h3 0.40 st 13.3 | 14 | 1 | 0 | 0 |

### Seed 2 (after)

| persona | days | quit day | sess | cards/s | effort/s | success | k day0→end | final profile (comfort, memory, h3Share, stamina) | hidden stamina | fatigued days | CE | skips |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| average-fastclass | 28 | - | 28 | 6.4 | 11.2 | 72% | 0.400→0.483 | c0.76 m0.51 h3 0.40 st 14.7 | 14 | 0 | 0 | 6 |
| average-noclass | 28 | - | 28 | 6.4 | 10.7 | 77% | 0.400→0.478 | c0.72 m0.71 h3 0.40 st 14.3 | 14 | 0 | 0 | 3 |
| binge-quit | 5 | 4 | 10 | 5.9 | 10.3 | 68% | 0.400→0.426 | c0.81 m0.76 h3 0.40 st 11.1 | 30 | 0 | 0 | 1 |
| calc-strong-memory-poor | 28 | - | 28 | 6.1 | 10.7 | 75% | 0.500→0.535 | c0.82 m0.82 h3 0.40 st 12.9 | 14 | 1 | 0 | 0 |
| comeback-10 | 18 | - | 18 | 6.3 | 10.2 | 73% | 0.450→0.497 | c0.78 m0.91 h3 0.40 st 13.7 | 14 | 0 | 0 | 4 |
| confident-misconceptions | 28 | - | 28 | 6.6 | 11.4 | 77% | 0.500→0.562 | c0.72 m0.61 h3 0.40 st 14.3 | 16 | 1 | 0 | 0 |
| fast-guesser | 28 | - | 28 | 6.6 | 11.9 | 60% | 0.300→0.355 | c0.75 m0.50 h3 0.40 st 13.3 | 18 | 0 | 0 | 0 |
| memory-good-calc-weak | 28 | - | 28 | 6.8 | 11.0 | 88% | 0.500→0.573 | c0.68 m1.43 h3 0.40 st 15.3 | 14 | 1 | 0 | 10 |
| one-feared-section | 28 | - | 28 | 6.6 | 11.1 | 81% | 0.464→0.527 | c0.71 m0.85 h3 0.40 st 14.8 | 14 | 0 | 0 | 9 |
| slow-reader | 28 | - | 28 | 5.5 | 9.5 | 74% | 0.450→0.511 | c0.74 m0.70 h3 0.40 st 13.2 | 10 | 1 | 0 | 3 |
| smart-impatient | 14 | - | 14 | 5.4 | 8.9 | 88% | 0.700→0.721 | c0.83 m1.09 h3 0.40 st 10.2 | 10 | 1 | 0 | 0 |
| steady-five-min | 28 | - | 28 | 6.3 | 10.6 | 77% | 0.400→0.476 | c0.78 m1.00 h3 0.40 st 14.6 | 12 | 1 | 0 | 1 |
| strong | 28 | - | 28 | 7.1 | 12.1 | 98% | 0.800→0.835 | c0.66 m1.70 h3 0.20 st 17.3 | 25 | 0 | 0 | 0 |
| underconfident-skipper | 28 | - | 28 | 6.9 | 11.0 | 86% | 0.650→0.693 | c0.73 m0.85 h3 0.40 st 15.1 | 12 | 2 | 0 | 10 |
| weak-impatient | 2 | 1 | 2 | 3.5 | 5.8 | 14% | 0.150→0.152 | c0.81 m1.00 h3 0.40 st 8.9 | 9 | 0 | 0 | 3 |
| weak-stubborn | 28 | - | 28 | 7.7 | 12.5 | 40% | 0.150→0.266 | c0.75 m0.50 h3 0.40 st 13.3 | 14 | 0 | 0 | 0 |

### Seed 3 (after)

| persona | days | quit day | sess | cards/s | effort/s | success | k day0→end | final profile (comfort, memory, h3Share, stamina) | hidden stamina | fatigued days | CE | skips |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| average-fastclass | 28 | - | 28 | 5.7 | 10.1 | 70% | 0.400→0.478 | c0.75 m0.63 h3 0.40 st 12.2 | 14 | 0 | 0 | 3 |
| average-noclass | 28 | - | 28 | 5.8 | 9.6 | 74% | 0.400→0.477 | c0.76 m0.50 h3 0.40 st 12.2 | 14 | 1 | 0 | 6 |
| binge-quit | 14 | - | 20 | 6.7 | 10.7 | 80% | 0.400→0.455 | c0.75 m0.50 h3 0.40 st 13.9 | 30 | 0 | 0 | 4 |
| calc-strong-memory-poor | 28 | - | 28 | 5.1 | 9.7 | 71% | 0.500→0.536 | c0.76 m0.73 h3 0.20 st 12.2 | 14 | 0 | 0 | 0 |
| comeback-10 | 18 | - | 18 | 6.8 | 11.0 | 77% | 0.450→0.499 | c0.76 m1.07 h3 0.40 st 14.4 | 14 | 0 | 0 | 2 |
| confident-misconceptions | 28 | - | 28 | 6.5 | 11.0 | 73% | 0.500→0.568 | c0.74 m0.50 h3 0.40 st 13.8 | 16 | 0 | 0 | 0 |
| fast-guesser | 28 | - | 28 | 6.6 | 12.4 | 52% | 0.300→0.358 | c0.75 m0.50 h3 0.40 st 13.3 | 18 | 0 | 0 | 0 |
| memory-good-calc-weak | 28 | - | 28 | 6.9 | 11.3 | 88% | 0.500→0.574 | c0.67 m1.46 h3 0.40 st 16.3 | 14 | 0 | 0 | 14 |
| one-feared-section | 28 | - | 28 | 6.4 | 11.1 | 77% | 0.464→0.529 | c0.75 m0.70 h3 0.40 st 13.4 | 14 | 1 | 0 | 7 |
| slow-reader | 28 | - | 28 | 5.4 | 9.6 | 77% | 0.450→0.511 | c0.72 m0.58 h3 0.40 st 12.2 | 10 | 4 | 0 | 4 |
| smart-impatient | 14 | - | 14 | 5.2 | 9.4 | 86% | 0.700→0.722 | c0.71 m0.84 h3 0.50 st 12.9 | 10 | 1 | 0 | 0 |
| steady-five-min | 28 | - | 28 | 6.4 | 10.5 | 76% | 0.400→0.480 | c0.76 m0.55 h3 0.40 st 13.7 | 12 | 1 | 0 | 5 |
| strong | 28 | - | 28 | 8.3 | 14.9 | 95% | 0.800→0.841 | c0.66 m1.45 h3 0.50 st 20.8 | 25 | 0 | 0 | 0 |
| underconfident-skipper | 28 | - | 28 | 7.3 | 11.4 | 86% | 0.650→0.692 | c0.69 m0.89 h3 0.40 st 15.0 | 12 | 4 | 0 | 7 |
| weak-impatient | 2 | 1 | 2 | 3.0 | 6.3 | 0% | 0.150→0.152 | c0.81 m1.00 h3 0.40 st 8.9 | 9 | 0 | 0 | 1 |
| weak-stubborn | 28 | - | 28 | 7.7 | 13.0 | 38% | 0.150→0.262 | c0.75 m0.50 h3 0.40 st 13.3 | 14 | 4 | 0 | 0 |

**Columns:**
- cards/s and effort/s are the mean per engine-opened session.
- success is the share of answered cards that were right.
- k is the mean hidden knowledge on day 0 and at the end.
- The final profile is the engine's profile after the last day.
- fatigued days is the number of days with any card served past the hidden stamina.
- CE is the count of `content-exhausted` ends.

**Close-card accuracy by height** (before → after, as right / served):

| | h1 | h2 | h3 |
|---|---|---|---|
| seed 1, before | 30/40 | 115/251 | 4/56 |
| seed 1, after | 116/126 | 138/202 | 0/0 |
| seed 2, after | 92/97 | 123/180 | 0/0 |
| seed 3, after | 115/122 | 133/208 | 0/0 |

**Weak against strong:**
- Asked per day (the budgets): strong 12.40 / 13.31 / 14.84, against weak-stubborn 11.58 and weak-impatient 8.00. Before, strong was asked 18.3–19.3.
- Spent per session: strong 11.1 / 12.1 / 14.9, against weak-stubborn 12.4 / 12.5 / 13.0. On seeds 1 and 2 the weak student spends more than the strong one. The extra comes from the +1 for each wrong answer and from the close loop. See Concerns.

## Engine rules changed (each with a failing unit test first)

| # | Rule | Why (log evidence) | Commit |
|---|---|---|---|
| R1 | Close cards: each skill at its **lowest** height with an eligible card. Height 3 only when no height-1/2 card is eligible outside blocked sections. Order: started skills that reach `session.winnable` (liked order, then estimate); then the other started skills (by estimate); then ready, not-started skills; then the same three groups at height 3. | Close cards were right 31/37 at h1, 113/241 at h2 and 4/52 at h3 (Task 10 report). The engine served h3 cards as close cards, even to weak students. | d107c76 |
| R2 | Comfort correction (running rate below comfort): every height up to the current one that reaches comfort, **lowest height first**, then estimate. The fallback comfort-correction pick puts height 3 last, and goes lowest-first whenever the running rate is below comfort (even before `minRunning` answers). `pickAny` puts height 3 after every lower height; below comfort it orders by height, then estimate. | An h3 `comfort-correction` card was served right after two "I don't know" answers (Task 10, finding 4). | af593b4 |
| R3 | Open cards go at the chosen skill's lowest eligible height until the student has `estimate.minOwnPrior` (10) answers. | Day-0 `open:liked` cards were at height 2 for the weakest personas. | 0ca9e1b |
| R4a | A clean `budget` end raises stamina only on a good day (`isGoodDay`: above comfort and faster than usual, the "5 more" condition). | Engine stamina went 13.34 → 22.75 for memory-good-calc-weak, whose hidden stamina is 14. | 96f6682 |
| R4b | Fade from slow answers: `fade.slowAnswers` slow answers in a session (not necessarily in a row) set `fadeEffort` to the effort before the first of them. This does not end the session. `badDay` is now its own session flag (it was read from `fadeEffort`). A later bad-day or `left` end keeps an earlier fade. | The bad-day rule needs 3 slow answers in a row, but the hidden student is fatigued for only 1–2 cards. | 96f6682 |
| R4c | The first `budget.firstSessions` (3) sessions use the `minimumDay` budget. | Students with hidden stamina near 10 were over their limit from day 0. | 96f6682 |
| R4c (my addition) | While today's effort is below `minimumDay`, the session may spend its close reserve to reach it. Without this, a budget-8 session (first sessions, comeback) ends at about 6 effort and does not keep the streak (spec §8 "Minimum day"). | The `first session` unit test ended at 6 effort with `streakKept` false once R4c was in. | 96f6682 |
| R5 | No card id (any variant) is served again within `session.returnAfterCards` (4) serves of the same session. This holds in every picker (`PickCtx.recentCards` via `tryServe`/`firstOf`, and `lowestEligible`), in the repair cards (`nextRepairCard(…, recent)`) and in the ramp card. The failed card is always among the recent serves, so the missing piece is a different card. With nothing left, the existing fallbacks apply, and only then `content-exhausted`. | 395 back-to-back serves on seed 1. Examples: comfort-correction 3 times in a row, and repair:missing-piece re-serving the failed card. | d8330e7 |
| R6 | Every remaining wrong-answer end is the `maxExtraClose` last resort (all 28 over three seeds). No other path ends on a wrong answer. | `eow.mjs` classification of every violation: "budget, 3 close cards, last close wrong". | – |
| new | A skipped section whose cap has come (skip day + 14 ≤ today) may take a side door even when the session already had one. | Seed 2 comeback-10 and seed 3 binge-quit: after a gap, two sections were due at once. Only one side door is allowed per session, so Kinematics came back one day past the cap (skip-timing failed). | f8019fd |
| new | `migrate` gives open sessions from before this pass `badDay`, `slowBefore` and `servedCards`. | State robustness. | 1b2fdf8 |

**Tried and rejected** (not committed; numbers from 3-seed runs):
- **Close: let not-started skills compete with started ones on the estimate.** No-end-on-wrong got worse: 15 / 12 / 9, against 9 / 7 / 10. Close h1 accuracy fell from 94% to 87% and h2 from 70% to 52%. A not-started skill's estimate is the student's own prior, which overstates it, because the hidden student has not practised that skill yet.
- **Step 4 "final card"** (after a right answer, spend the reserve on one more middle card and end without a close card if it is right). Strong's mean unused budget at a budget end fell from 1.63 to 0.56, but ends-before-fade then failed for:
  - slow-reader: 7/28 days (seed 1), 9/28 (seed 2);
  - underconfident-skipper: 7/28 (seed 3);
  - steady-five-min: 6/28 (seed 2).

  That held even when limited to students whose stamina had grown past the default. The reserve is what keeps the 10–12-stamina personas under their limit, so I did not apply the fix. Strong students still leave about 1–1.6 effort of the budget unused per session.

## Config values changed (old → new), pinned in `tests/config.test.ts`

| value | old → new | reason |
|---|---|---|
| `budget.firstSessions` | new → 3 | R4c |
| `fade.slowAnswers` | new (R4b ruling: 2) → **1** | See the fade evidence below. |
| `staminaUpdate.keep / take` | 0.7 / 0.3 → **0.5 / 0.5** | A fade moves stamina halfway to the fade point, so a student whose real limit is far below the default is found within a few sessions. |

**Fade evidence** (seed 2, after R1–R5, R7 and the side-door fix):
- slow-reader (hidden stamina 10) was past stamina on 12/28 days. The engine kept stamina at 13.3–14.6, so the budget was 12.
- In 10 of 12 fatigued sessions only **one** card was past the stamina, so `slowAnswers` 2 could never fire.
- Across all personas, 0 of about 2,500 non-fatigued answers were slower than 2× usual.
- Results of the variants:
  - `slowAnswers` 1 alone: 6/28, still failing.
  - `take` 0.5 alone: 11/28.
  - Both: 1/28 on seed 2, and the check passes on all seeds.
- Other personas were barely affected: strong and the averages have identical rows.

**Concern:** in a real app one slow answer may be noise (a phone call). The sim has no such noise.

## Hidden-student (`simParams`) changes (old → new)

| param | old → new | reason |
|---|---|---|
| `need` | {1: 0.25, 2: 0.5, 3: 0.75} → {1: 0.1, 2: 0.45, 3: 0.75} | R7. A weak student still gets some easy recall right. weak-stubborn's h1 p was 0.2 (the floor); it is now 0.425. |
| `learnRight` | 0.04 → 0.06 | R7. |
| `learnWrong` | 0.08 → 0.10 | R7. |
| `decayPerDay` | 0.008 → 0.003 | R7. With the old numbers forgetting outpaced any practice: strong gained 0.013 in 28 days. strong now gains 0.031–0.041, and weak-stubborn 0.11. |

No further student-model change was made.

## Existing unit tests whose expectations changed

1. **pick "middle: running rate below comfort"** (R2): a1 is served at height 1 instead of 2, because the lowest height comes first.
2. **pick "pickAny …"** (R2): when a started skill has only height 3 left, a ready unstarted skill's height-1 card wins (before, the started skill's h3 won). A new case adds a1 h3 for when only height 3 is left anywhere.
3. **pick "open: brand-new student"** (R3): the started-student part sets `answered: 1000`, so the student has history.
4. **helpers `startedState`** (R4c): starts at `sessionCount` 4, past the small first sessions, with the same drip parity as 0. As a result, **skip "drip"** checks `sessionCount` 4 + n.
5. **profile "stamina …"**:
   - R4a: a clean budget end with no good-day evidence leaves stamina at 13.34 (was 13.84).
   - The config change: the fade blend uses 0.5 / 0.5.
6. **profile "profile event"** (R4a): stamina no longer moves on that session, so the test uses `goodStreak` 2 to make comfort move.
7. **profile "weak never asked more" and "dials differ"** (R4a): the strong/good student answers a little faster each card (`lived(…, fast)`), so its stamina grows on good days.
8. **session "comeback"** (R4c and the minimum-day top-up): effort ≤ 8 + reserve (was ≤ 8), and the streak is kept.
9. **session "budget comes from cfg"** (R4c): `sessionCount` 4.
10. **session "all right at height 2 … height-3 skill"** (R5): the h3 card is served once. The old "fewer cards" relied on the h3 card coming back with new variants card after card.
11. **run "runner: quit reasons"** (R4c + R5 on the tiny fixture): seed 1 instead of 5. Seed 5 now runs the fixture dry before a time-up quit. This is a one-line change in `tests/run.test.ts`; the file had no uncommitted edits.
12. **student "pRight" and "learning"** (R7): the new `need` and learn numbers. The R7 values are pinned in "small fixes".

## Step 4 examinations

**Personas quitting the app before day 7:**

- **weak-impatient: quits the app on day 1 on every seed.**
  - Seed 1, day 0:
    - The first card is `phy.mech.c007`, an h2 `open:liked` card. Its skill has no height-1 card, so R3's "lowest height of the chosen skill" is still h2.
    - The student says "I don't know" (h2 p = 0.2).
    - Next, h1 `comfort-correction`: wrong.
    - Then an h2 `repair:missing-piece` (that skill has no h1 either): "I don't know".
    - The student quits from frustration on the next card (recentWrong 2 = patience 2).
  - Day 1:
    - The student skips two h3 `open:liked` cards.
    - Then h2 dk, h1 wrong, h1 right, h1 wrong, and quits.
  - With hidden k 0.05, this persona's best case is h1 at 42%. Its patience (2 wrongs) runs out within 4–5 cards even on all-h1 sessions.
  - The engine makes it worse by opening with skills that have no h1 card, and by repair pieces at h2.
  - **Suggested next rule:** for a student under `minOwnPrior` answers, open (and look for repair pieces) in skills that have a height-1 card.
- **binge-quit, seed 2 only: quits the app on day 4.**
  - Day 4, session 9: due-review h2 wrong, repair piece h2 wrong, side door h2 wrong, then a quit on an h2 repair piece. Those skills (`phy.elec.p03`/`p02`) have no h1 cards.
  - Session 10: comfort-correction h2 wrong, close h2 wrong, then a quit on an h2 close card.
  - On seeds 1 and 3 this persona plays through its vanish and does not quit.

**Is a weak persona's knowledge flat?**
- **No.** weak-stubborn goes 0.150 → 0.259 / 0.266 / 0.262. Its success rate is 36–40%, against 21% before.
- weak-impatient is flat (0.150 → 0.152), but it stops after 2 days.

**Do weak and strong students get visibly different sessions?**

| | strong | weak-stubborn | weak-impatient |
|---|---|---|---|
| cards per session | 6.1 / 7.1 / 8.3 | 7.4–7.7 | 3.0–3.5 |
| effort per session | 11.1 / 12.1 / 14.9 | 12.4–13.0 | 5.8–6.3 |
| success rate | 94–98% | | |
| heights served | mostly h2/h3, extended 1–7 times | mostly h1/h2, never extended | |

- Differences between the two students: the session size is similar, and the content and heights differ.
- Against the other personas: the averages sit at 5.7–6.8 cards and 9.6–11.8 effort, close to strong on seeds 1 and 2.
- So the strong student's sessions are no longer longer than average ones. See Concerns.

**The all-right height-2 session that stopped at 9 of 12:**
- It still happens. The unit test shows 6 cards, effort 9 of a 12.006 budget.
- In the runs, strong leaves 1.63 effort unused per budget end (seed 1).
- The ruled fix was tried and rejected (see above).

**`maxExtraClose` exhaustion (R6 question):**

| seed | engine-ended sessions | with a close card | first close wrong | all 3 close cards wrong |
|---|---|---|---|---|
| 1 | 379 | 262 | 42 | 10 (weak-stubborn 7) |
| 2 | 361 | 222 | 36 | 8 (weak-stubborn 6) |
| 3 | 377 | 256 | 45 | 10 (weak-stubborn 7) |

- That is more than a handful.
- With `maxExtraClose` 3 the violations are 6 / 4 / 11, and ends-before-fade fails for weak-stubborn on seed 3 (11/28 days).
- With `maxExtraClose` 4 they are 3 / 4 / 4.
- Raising the constant does not remove the failure and costs fatigue. weak-stubborn is right on about 42% of the easiest cards, so no fixed number of extra close cards guarantees a right last answer.
- **Question for the controller:** accept this last resort for students below ~50% on height 1 (and change the spec line), or design a different ending for them? One option: after a wrong close card, show an explanation card, a "worked example" that is not a question, and count it as the end. That needs a design decision.

**Content limits seen:**
- 56 of 175 skills have cards.
- 53 height-1 cards, each with one variant. 16 skills with cards have no height-1 card.
- h1 is not exhausted at close time: a median of about 35 h1 cards were unseen in the last 14 days whenever an h2 close card was served. The h2 close cards come from the ranking (started skills first), not from a shortage.
- No `content-exhausted` end in any run.

## What still fails and why

- **no-end-on-wrong** (10 / 8 / 10): only the `maxExtraClose` last resort, mostly weak-stubborn. It cannot pass by tuning without a design decision; see the R6 question above.

## Spec §13 "design must change" lines

| line | from the data |
|---|---|
| any persona would quit before day 7 | **Yes.** weak-impatient (day 1, all seeds) and binge-quit (day 4, seed 2). |
| two different personas get near-identical sessions | **Needs the AI judges** (blind comparison). Code-side note: session sizes are close across personas (strong 6.1–8.3 cards against averages 5.7–6.8), and the content and heights differ. |
| a weak persona's hidden knowledge is flat after 4 weeks | **No.** weak-stubborn +0.11 on all seeds. weak-impatient is flat but quit on day 1. |
| a skipped section returns the next day, or never | **No.** skip-timing passes on all seeds (48 / 49 / 52 skips, every one on schedule and back by the cap). |
| the blind comparison fails for more than a quarter of pairs | **Needs the AI judges.** |

## Concerns

1. **Strong students are now under-asked.**
   - R4a lets stamina grow only on days faster than the student's own usual. A steady strong student is rarely faster than their own median.
   - strong's engine stamina ends at 15.8 / 17.3 / 20.8 (hidden 25). Its sessions are about as long as the averages', and on seeds 1 and 2 shorter in effort spent than weak-stubborn's (11.1 against 12.4; 12.1 against 12.5).
   - The fairness check passes on budgets asked, but spec §2 and §8 ("being weak never means more work") are only just met.
   - A growth signal that is not about speed (for example a session finished at or above comfort with no slow answer) would fix this, but it reopens R4a.
2. **`fade.slowAnswers` 1** relies on the sim having no slow-answer noise.
3. **weak-impatient cannot be kept.** The engine could start it on skills with h1 cards, but its patience is 2 wrongs and its best p is 0.42.
