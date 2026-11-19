# First tuning pass (Task 11): 28-day runs, seeds 1–3

_Date: 2026-11-14. Command: `npm run sim -- --days 28 --seed N --packs all --out runs/<name>`. 16 personas, all three content packs._

`runs/` is not committed. Every number below can be reproduced from the commits and the scripts in `engine/sim/tools/`:

| script | what it reports |
|---|---|
| `personas.mjs` | per-persona tables |
| `end-on-wrong.mjs` | classifies the no-end-on-wrong violations and the close loop |
| `heights.mjs` | heights by week, close accuracy, height-up moments |
| `fatigue.mjs` | days past the hidden stamina, by card reason |
| `distraction.mjs` | stamina after sessions with one slow answer |
| `h1-left.ts` | height-1 supply at each height-2 close card |
| `day.mjs` | one day of one log |

The scripts only read run folders. They do not change `run.ts` or `checks.ts`.

**Runs:**
- **Before:** `runs/t0-sN`, engine at `bcfb4de`.
- **First pass, final:** `runs/t3-sN`, at `1b2fdf8`. Its numbers are kept below as history.
- **Fix round 1:** `runs/f2-sN`, at `745a035`. Round 1 of fix round 1 was `runs/f1-sN` (since overwritten).
- **Final review fixes (current):** before `runs/f0-sN` (at `a8726b7`, the same engine as fix round 1), after `runs/f1-sN` (at `d6c93fe`). See "After the final review fixes" at the end.

## Summary (current: fix round 1)

| seed | before: pass / fail | first pass | fix round 1 | still failing |
|---|---|---|---|---|
| 1 | 3 / 4 | 6 / 1 | **6 / 1** | no-end-on-wrong 8 |
| 2 | 2 / 5 | 6 / 1 | **6 / 1** | no-end-on-wrong 12 |
| 3 | 3 / 4 | 6 / 1 | **5 / 2** | no-end-on-wrong 8; ends-before-fade (weak-impatient, 1 of its 2 days) |

- **Every remaining no-end-on-wrong violation is the `maxExtraClose` last resort:** the close card and both extra close cards were wrong. 26 of the 28 are weak-stubborn; fast-guesser has the other 2.
- **On weak-stubborn's late sessions all height-1 cards are used up.** The content has 53 height-1 cards, each with one variant, and none may come back within 14 days. weak-stubborn has served all 53 by then, so its close cards fall back to height 2. Its close cards are right about 55% of the time at h1 and 0–7% at h2.
- **`maxExtraClose` was not changed.** That decision goes to the owner.

**Correction (final review, 2026-11-15): the end-on-wrong cause was half engine-made.** The two points above are not the whole story. In 11 of the 28 violations (seed 1: 4 of 8, seed 2: 4 of 12, seed 3: 3 of 8) the answer just before the close loop was **right**. The engine still served a close card, because "won" needed an estimate ≥ 0.85 and today's effort ≥ 8. Those close cards then went wrong three times, and the loop pushed the session 1.3 to 5.5 effort over its budget (one ended 1.3 under). Fix F1 ends a session on a right answer with no close card, and a budget end keeps the streak under 8. After F1, 0 of 22 violations have a right answer before the close loop (seed 1: 0 of 9, seed 2: 0 of 6, seed 3: 0 of 7). The rest are close loops entered after a wrong answer: the student-made part.

**Effort spent per session (current):**

| | seed 1 | seed 2 | seed 3 |
|---|---|---|---|
| strong | 19.1 | 18.7 | 13.2 |
| weak-stubborn | 10.7 | 11.2 | 11.5 |
| weak-impatient | 5.8 | 7.2 | 8.0 |

The weak personas no longer spend more than strong. In the first pass strong spent 11.1 / 12.1 / 14.9 against weak-stubborn's 12.4 / 12.5 / 13.0.

## Checks per seed

### Seed 1

Before (`runs/t0-s1`):

| check | result | detail |
|---|---|---|
| no-end-on-wrong | FAIL | 32 violations; first: average-noclass day 0 session 1: ended (budget) after a wrong answer on phy.elec.b01 |
| skip-timing | PASS | 64 skips, remind days on schedule, kept away until then and back by the cap |
| effort-cap-and-fairness | PASS | max day effort 34.5 ≤ 40; mean asked/day strong 18.27, weak-stubborn 11.09, weak-impatient 11.29 |
| no-repeat-14d | PASS | 2681 serves, no variant repeated within 14 days |
| ends-before-fade | FAIL | 5 violations; first: average-noclass: 7 of 28 days past hidden stamina (first average-noclass day 0 session 1, phy.elec.b01) |
| knowledge-up | FAIL | 1 violation; first: underconfident-skipper: knowledge 0.650 → 0.643 after 28 days played |
| no-back-to-back-card | FAIL | 395 violations; first: average-noclass day 1 session 2: phy.elec.b01 (close:winnable) again 2 serves after the last |

First pass, final (`runs/t3-s1`):

| check | result | detail |
|---|---|---|
| no-end-on-wrong | FAIL | 10 violations; first: average-noclass day 1 session 2: ended (budget) after a wrong answer on phy.elec.p02-02 |
| skip-timing | PASS | 48 skips, remind days on schedule, kept away until then and back by the cap |
| effort-cap-and-fairness | PASS | max day effort 28.5 ≤ 40; mean asked/day strong 12.40, weak-stubborn 11.58, weak-impatient 8.00 |
| no-repeat-14d | PASS | 2549 serves, no variant repeated within 14 days |
| ends-before-fade | PASS | worst share of days past hidden stamina 18% ≤ 20% |
| knowledge-up | PASS | 15 students kept practising, all ended above their day-0 knowledge |
| no-back-to-back-card | PASS | 2549 serves, no card again within 4 serves in a session |

Fix round 1 (`runs/f2-s1`, current):

| check | result | detail |
|---|---|---|
| no-end-on-wrong | FAIL | 8 violations; first: weak-stubborn day 0 session 1: ended (budget) after a wrong answer on phy.elec.c046 |
| skip-timing | PASS | 32 skips, remind days on schedule, kept away until then and back by the cap |
| effort-cap-and-fairness | PASS | max day effort 29.5 ≤ 40; mean asked/day strong 17.23, weak-stubborn 10.32, weak-impatient 8.00 |
| no-repeat-14d | PASS | 2694 serves, no variant repeated within 14 days |
| ends-before-fade | PASS | worst share of days past hidden stamina 14% ≤ 20% |
| knowledge-up | PASS | 15 students kept practising, all ended above their day-0 knowledge |
| no-back-to-back-card | PASS | 2694 serves, no card again within 4 serves in a session |

### Seed 2

Before (`runs/t0-s2`):

| check | result | detail |
|---|---|---|
| no-end-on-wrong | FAIL | 31 violations; first: average-noclass day 3 session 4: ended (budget) after a wrong answer on phy.mech.t03 |
| skip-timing | FAIL | 6 violations; first: underconfident-skipper day 8 session 9: section phy.elec.8.3/Combination of sources of e.m.f. skipped (phy.elec.c024) and no side door by day 22 |
| effort-cap-and-fairness | PASS | max day effort 30.5 ≤ 40; mean asked/day strong 19.03, weak-stubborn 10.43, weak-impatient 10.81 |
| no-repeat-14d | PASS | 2617 serves, no variant repeated within 14 days |
| ends-before-fade | FAIL | 4 violations; first: smart-impatient: 8 of 14 days past hidden stamina (first smart-impatient day 0 session 1, phy.elec.c039) |
| knowledge-up | FAIL | 1 violation; first: underconfident-skipper: knowledge 0.650 → 0.636 after 28 days played |
| no-back-to-back-card | FAIL | 416 violations; first: average-noclass day 4 session 5: phy.mech.t02 (repair:missing-piece) again 1 serve after the last |

First pass, final (`runs/t3-s2`):

| check | result | detail |
|---|---|---|
| no-end-on-wrong | FAIL | 8 violations; first: weak-stubborn day 0 session 1: ended (budget) after a wrong answer on phy.elec.c041 |
| skip-timing | PASS | 49 skips, remind days on schedule, kept away until then and back by the cap |
| effort-cap-and-fairness | PASS | max day effort 28.5 ≤ 40; mean asked/day strong 13.31, weak-stubborn 11.58, weak-impatient 8.00 |
| no-repeat-14d | PASS | 2536 serves, no variant repeated within 14 days |
| ends-before-fade | PASS | worst share of days past hidden stamina 7% ≤ 20% |
| knowledge-up | PASS | 14 students kept practising, all ended above their day-0 knowledge |
| no-back-to-back-card | PASS | 2536 serves, no card again within 4 serves in a session |

Fix round 1 (`runs/f2-s2`, current):

| check | result | detail |
|---|---|---|
| no-end-on-wrong | FAIL | 12 violations; first: weak-stubborn day 7 session 8: ended (budget) after a wrong answer on phy.therm.c030 |
| skip-timing | PASS | 34 skips, remind days on schedule, kept away until then and back by the cap |
| effort-cap-and-fairness | PASS | max day effort 32.5 ≤ 40; mean asked/day strong 17.56, weak-stubborn 9.64, weak-impatient 8.00 |
| no-repeat-14d | PASS | 2755 serves, no variant repeated within 14 days |
| ends-before-fade | PASS | worst share of days past hidden stamina 14% ≤ 20% |
| knowledge-up | PASS | 15 students kept practising, all ended above their day-0 knowledge |
| no-back-to-back-card | PASS | 2755 serves, no card again within 4 serves in a session |

### Seed 3

Before (`runs/t0-s3`):

| check | result | detail |
|---|---|---|
| no-end-on-wrong | FAIL | 44 violations; first: average-noclass day 5 session 6: ended (budget) after a wrong answer on phy.elec.c045 |
| skip-timing | PASS | 54 skips, remind days on schedule, kept away until then and back by the cap |
| effort-cap-and-fairness | PASS | max day effort 30.5 ≤ 40; mean asked/day strong 19.33, weak-stubborn 11.19, weak-impatient 10.88 |
| no-repeat-14d | PASS | 2737 serves, no variant repeated within 14 days |
| ends-before-fade | FAIL | 5 violations; first: smart-impatient: 8 of 14 days past hidden stamina (first smart-impatient day 10 session 6, phy.elec.p03-05) |
| knowledge-up | PASS | 13 students kept practising, all ended above their day-0 knowledge |
| no-back-to-back-card | FAIL | 413 violations; first: average-noclass day 2 session 3: phy.mech.t02 (close:winnable) again 2 serves after the last |

First pass, final (`runs/t3-s3`):

| check | result | detail |
|---|---|---|
| no-end-on-wrong | FAIL | 10 violations; first: weak-stubborn day 0 session 1: ended (budget) after a wrong answer on phy.elec.c041 |
| skip-timing | PASS | 52 skips, remind days on schedule, kept away until then and back by the cap |
| effort-cap-and-fairness | PASS | max day effort 25.5 ≤ 40; mean asked/day strong 14.84, weak-stubborn 11.58, weak-impatient 8.00 |
| no-repeat-14d | PASS | 2586 serves, no variant repeated within 14 days |
| ends-before-fade | PASS | worst share of days past hidden stamina 14% ≤ 20% |
| knowledge-up | PASS | 15 students kept practising, all ended above their day-0 knowledge |
| no-back-to-back-card | PASS | 2586 serves, no card again within 4 serves in a session |

Fix round 1 (`runs/f2-s3`, current):

| check | result | detail |
|---|---|---|
| no-end-on-wrong | FAIL | 8 violations; first: weak-stubborn day 8 session 9: ended (budget) after a wrong answer on phy.elec.c045 |
| skip-timing | PASS | 16 skips, remind days on schedule, kept away until then and back by the cap |
| effort-cap-and-fairness | PASS | max day effort 27.5 ≤ 40; mean asked/day strong 12.31, weak-stubborn 10.55, weak-impatient 8.00 |
| no-repeat-14d | PASS | 2559 serves, no variant repeated within 14 days |
| ends-before-fade | FAIL | 1 violation; first: weak-impatient: 1 of 2 days past hidden stamina (first weak-impatient day 1 session 2, phy.elec.c039) |
| knowledge-up | PASS | 15 students kept practising, all ended above their day-0 knowledge |
| no-back-to-back-card | PASS | 2559 serves, no card again within 4 serves in a session |

## Per persona (current, fix round 1)

### Seed 1

| persona | days | quit day | sess | cards/s | effort/s | success | k day0→end | final profile (comfort, memory, h3Share, stamina) | hidden stamina | fatigued days | CE | skips |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| average-fastclass | 28 | - | 28 | 6.9 | 10.3 | 79% | 0.400→0.482 | c0.72 m0.66 h3 0.40 st 13.7 | 14 | 0 | 0 | 3 |
| average-noclass | 28 | - | 28 | 6.2 | 10.2 | 82% | 0.400→0.471 | c0.70 m0.57 h3 0.40 st 12.3 | 14 | 1 | 0 | 2 |
| binge-quit | 14 | - | 20 | 7.3 | 11.3 | 80% | 0.400→0.455 | c0.78 m0.57 h3 0.40 st 10.6 | 30 | 0 | 0 | 0 |
| calc-strong-memory-poor | 28 | - | 28 | 6.0 | 9.8 | 77% | 0.500→0.525 | c0.73 m0.50 h3 0.40 st 10.3 | 14 | 0 | 0 | 0 |
| comeback-10 | 18 | - | 18 | 6.3 | 9.6 | 84% | 0.450→0.484 | c0.72 m0.89 h3 0.40 st 10.3 | 14 | 1 | 0 | 1 |
| confident-misconceptions | 28 | - | 28 | 7.2 | 11.6 | 81% | 0.500→0.565 | c0.71 m0.64 h3 0.40 st 15.3 | 16 | 2 | 0 | 0 |
| fast-guesser | 28 | - | 28 | 6.8 | 11.0 | 62% | 0.300→0.343 | c0.75 m0.50 h3 0.40 st 9.9 | 18 | 1 | 0 | 0 |
| memory-good-calc-weak | 28 | - | 28 | 6.2 | 9.8 | 89% | 0.500→0.565 | c0.67 m0.77 h3 0.50 st 13.3 | 14 | 0 | 0 | 8 |
| one-feared-section | 28 | - | 28 | 6.9 | 10.9 | 83% | 0.464→0.527 | c0.71 m0.65 h3 0.40 st 14.3 | 14 | 1 | 0 | 8 |
| slow-reader | 28 | - | 28 | 5.6 | 8.6 | 81% | 0.450→0.507 | c0.70 m0.53 h3 0.40 st 9.3 | 10 | 0 | 0 | 1 |
| smart-impatient | 14 | - | 14 | 6.4 | 9.6 | 99% | 0.700→0.724 | c0.71 m2.00 h3 0.40 st 13.3 | 10 | 1 | 0 | 0 |
| steady-five-min | 28 | - | 28 | 6.2 | 10.1 | 82% | 0.400→0.469 | c0.71 m0.54 h3 0.40 st 10.2 | 12 | 0 | 0 | 3 |
| strong | 28 | - | 28 | 11.0 | 19.1 | 95% | 0.800→0.845 | c0.66 m2.00 h3 0.40 st 23.3 | 25 | 4 | 0 | 0 |
| underconfident-skipper | 28 | - | 28 | 6.4 | 9.6 | 91% | 0.650→0.687 | c0.66 m1.73 h3 0.40 st 10.2 | 12 | 0 | 0 | 8 |
| weak-impatient | 2 | 1 | 2 | 3.5 | 5.8 | 29% | 0.150→0.150 | c0.81 m1.00 h3 0.40 st 9.4 | 9 | 0 | 0 | 0 |
| weak-stubborn | 28 | - | 28 | 6.7 | 10.7 | 28% | 0.150→0.252 | c0.75 m0.52 h3 0.40 st 11.3 | 14 | 0 | 0 | 0 |

### Seed 2

| persona | days | quit day | sess | cards/s | effort/s | success | k day0→end | final profile (comfort, memory, h3Share, stamina) | hidden stamina | fatigued days | CE | skips |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| average-fastclass | 28 | - | 28 | 6.8 | 10.3 | 75% | 0.400→0.487 | c0.77 m0.50 h3 0.40 st 13.6 | 14 | 1 | 0 | 1 |
| average-noclass | 28 | - | 28 | 7.0 | 10.2 | 80% | 0.400→0.482 | c0.75 m1.47 h3 0.40 st 9.9 | 14 | 4 | 0 | 1 |
| binge-quit | 14 | - | 20 | 7.9 | 12.9 | 78% | 0.400→0.464 | c0.76 m0.54 h3 0.40 st 17.3 | 30 | 0 | 0 | 1 |
| calc-strong-memory-poor | 28 | - | 28 | 5.9 | 9.9 | 78% | 0.500→0.534 | c0.71 m0.53 h3 0.40 st 8.9 | 14 | 1 | 0 | 0 |
| comeback-10 | 18 | - | 18 | 6.7 | 9.9 | 83% | 0.450→0.490 | c0.73 m1.07 h3 0.40 st 10.2 | 14 | 0 | 0 | 2 |
| confident-misconceptions | 28 | - | 28 | 6.5 | 9.8 | 74% | 0.500→0.561 | c0.75 m0.61 h3 0.40 st 11.1 | 16 | 0 | 0 | 0 |
| fast-guesser | 28 | - | 28 | 6.1 | 9.7 | 61% | 0.300→0.336 | c0.75 m0.50 h3 0.40 st 11.8 | 18 | 1 | 0 | 0 |
| memory-good-calc-weak | 28 | - | 28 | 7.0 | 10.3 | 94% | 0.500→0.571 | c0.66 m1.67 h3 0.40 st 12.4 | 14 | 4 | 0 | 7 |
| one-feared-section | 28 | - | 28 | 6.6 | 10.2 | 81% | 0.464→0.528 | c0.71 m0.50 h3 0.40 st 13.3 | 14 | 0 | 0 | 7 |
| slow-reader | 28 | - | 28 | 6.2 | 9.4 | 82% | 0.450→0.513 | c0.69 m1.32 h3 0.40 st 8.9 | 10 | 1 | 0 | 4 |
| smart-impatient | 14 | - | 14 | 5.6 | 8.0 | 92% | 0.700→0.724 | c0.74 m1.48 h3 0.40 st 11.6 | 10 | 0 | 0 | 0 |
| steady-five-min | 28 | - | 28 | 6.5 | 10.0 | 74% | 0.400→0.488 | c0.74 m0.50 h3 0.40 st 13.3 | 12 | 0 | 0 | 8 |
| strong | 28 | - | 28 | 11.3 | 18.7 | 96% | 0.800→0.853 | c0.66 m1.78 h3 0.40 st 20.5 | 25 | 2 | 0 | 0 |
| underconfident-skipper | 28 | - | 28 | 6.3 | 9.8 | 89% | 0.650→0.685 | c0.66 m1.49 h3 0.40 st 9.8 | 12 | 0 | 0 | 5 |
| weak-impatient | 3 | 2 | 3 | 5.0 | 7.2 | 47% | 0.150→0.150 | c0.81 m1.00 h3 0.40 st 9.9 | 9 | 0 | 0 | 1 |
| weak-stubborn | 28 | - | 28 | 7.2 | 11.2 | 30% | 0.150→0.263 | c0.75 m0.53 h3 0.40 st 9.8 | 14 | 0 | 0 | 0 |

### Seed 3

| persona | days | quit day | sess | cards/s | effort/s | success | k day0→end | final profile (comfort, memory, h3Share, stamina) | hidden stamina | fatigued days | CE | skips |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| average-fastclass | 28 | - | 28 | 6.6 | 10.3 | 82% | 0.400→0.472 | c0.69 m0.61 h3 0.40 st 9.2 | 14 | 0 | 0 | 0 |
| average-noclass | 28 | - | 28 | 6.3 | 9.7 | 78% | 0.400→0.468 | c0.75 m0.74 h3 0.40 st 9.9 | 14 | 2 | 0 | 0 |
| binge-quit | 14 | - | 20 | 6.3 | 9.8 | 78% | 0.400→0.443 | c0.76 m0.53 h3 0.40 st 13.6 | 30 | 0 | 0 | 0 |
| calc-strong-memory-poor | 28 | - | 28 | 5.6 | 9.1 | 73% | 0.500→0.528 | c0.73 m0.50 h3 0.40 st 12.0 | 14 | 0 | 0 | 0 |
| comeback-10 | 18 | - | 18 | 6.8 | 10.4 | 78% | 0.450→0.495 | c0.73 m0.50 h3 0.40 st 13.3 | 14 | 0 | 0 | 0 |
| confident-misconceptions | 28 | - | 28 | 6.5 | 10.1 | 75% | 0.500→0.563 | c0.74 m0.60 h3 0.40 st 9.4 | 16 | 2 | 0 | 0 |
| fast-guesser | 28 | - | 28 | 7.0 | 11.6 | 58% | 0.300→0.341 | c0.78 m0.50 h3 0.40 st 13.3 | 18 | 0 | 0 | 0 |
| memory-good-calc-weak | 28 | - | 28 | 6.7 | 10.2 | 93% | 0.500→0.566 | c0.66 m1.22 h3 0.40 st 13.1 | 14 | 3 | 0 | 5 |
| one-feared-section | 28 | - | 28 | 6.1 | 9.9 | 81% | 0.464→0.518 | c0.70 m0.50 h3 0.40 st 13.3 | 14 | 0 | 0 | 7 |
| slow-reader | 28 | - | 28 | 6.1 | 9.7 | 83% | 0.450→0.509 | c0.69 m0.70 h3 0.40 st 9.8 | 10 | 3 | 0 | 0 |
| smart-impatient | 14 | - | 14 | 6.0 | 9.3 | 94% | 0.700→0.724 | c0.71 m1.39 h3 0.40 st 9.3 | 10 | 0 | 0 | 0 |
| steady-five-min | 28 | - | 28 | 6.2 | 9.8 | 80% | 0.400→0.469 | c0.72 m0.82 h3 0.40 st 8.9 | 12 | 0 | 0 | 1 |
| strong | 28 | - | 28 | 7.6 | 13.2 | 95% | 0.800→0.834 | c0.66 m2.00 h3 0.40 st 14.3 | 25 | 0 | 0 | 0 |
| underconfident-skipper | 28 | - | 28 | 5.9 | 8.8 | 90% | 0.650→0.681 | c0.67 m1.42 h3 0.40 st 9.3 | 12 | 0 | 0 | 6 |
| weak-impatient | 2 | 1 | 2 | 5.5 | 8.0 | 45% | 0.150→0.150 | c0.81 m1.00 h3 0.40 st 10.8 | 9 | 1 | 0 | 0 |
| weak-stubborn | 28 | - | 28 | 7.5 | 11.5 | 36% | 0.150→0.259 | c0.81 m0.63 h3 0.40 st 11.3 | 14 | 2 | 0 | 0 |

**Columns:**
- cards/s and effort/s are means per engine-opened session; effort/s is effort *spent*.
- success is the share of answered cards that were right.
- k is the hidden knowledge on day 0 and at the end.
- The final profile is the engine's profile after the last day.
- fatigued days is the number of days with a card served past the hidden stamina.
- CE is the number of `content-exhausted` ends.

**Close-card accuracy, right / served:**

| seed | h1 | h2 | h3 |
|---|---|---|---|
| 1 | 235/262 | 6/22 | 0 |
| 2 | 234/256 | 6/36 | 0 |
| 3 | 256/289 | 4/31 | 0 |

On seed 1, the first pass had h1 116/126 and h2 138/202, and before any change h1 was 30/40, h2 115/251 and h3 4/56. Height-2 close cards now appear almost only when height 1 has run out. Of 36 h2 close cards on seed 2, 32 were served with no height-1 card unseen in the last 14 days (`h1-left.ts`).

## Rule, config and simParams changes

### First pass (commits d107c76 … 1b2fdf8)

**Engine rules:**
- **R1:** close cards at the lowest eligible height; height 3 last.
- **R2:** comfort correction and the sweep go lowest height first.
- **R3:** a fresh student's open cards at the lowest height.
- **R4a:** stamina grows only on a good day.
- **R4b:** a fade is recorded from slow answers.
- **R4c:** the first 3 sessions use a budget of 8.
- **Minimum-day top-up:** a session under the minimum day may use its close reserve to reach it.
- **R5:** no card is served again within 4 serves of the same session.
- **Side door at the cap:** a skipped section whose 14-day cap has come may take a second side door in a session.
- **migrate:** old open sessions get the new session fields.

**Config:**
- `budget.firstSessions` 3 (new).
- `fade.slowAnswers` 2 → 1 and `staminaUpdate` keep/take 0.7/0.3 → 0.5/0.5. Fix round 1 reverts both (finding 3).

**simParams (R7):**
- `need` {0.25, 0.5, 0.75} → {0.1, 0.45, 0.75}.
- `learnRight` 0.04 → 0.06, `learnWrong` 0.08 → 0.10.
- `decayPerDay` 0.008 → 0.003.
- Reason: the weakest personas sat at `pFloor` on every card, and forgetting outpaced practice.

### Fix round 1

| finding | change | type | commit |
|---|---|---|---|
| 3a | `fade.slowAnswers` 1 → **2**, `staminaUpdate` keep/take 0.5/0.5 → **0.7/0.3** (back to the ruling). In the first pass, slow and fatigued were the same thing in the sim. | config | 80c9e99 |
| 3b | `simParams.distractChance` **0.05**, `distractFactor` **3**: an answer sometimes takes 3× its time, independent of fatigue. Reason: real students get interrupted. | student model | 47ad347 |
| 4 | "5 more" is offered at a budget end when success ≥ comfort, there was no slow answer, and the session is not already extended and fits the cap ("faster than usual" is dropped). Stamina grows **only** on `extended-done` with no fade (+`extendStep` 1). `staminaUpdate.cleanStep` 0.5 → **0**. A fade still blends down and never raises. | rule + config | 8a1bd5b |
| 1 | A fresh student's open pick is **height first across skills**: all candidates at their lowest eligible height, then the usual open order, then any other unblocked started or ready skill. Height 3 only when no h1/h2 card is eligible anywhere. The new-skill allowance does not apply. | rule | 42fcef4 |
| 2 | The close pick is **height first across skills**: any eligible h1 card outside blocked sections before any h2. Within a height: liked first, then estimate, then liked order, then started before new. A ready not-started skill gets a SkillRec at the served height. Below comfort (any number of answers), middle picks go lowest height first. `estimate.minRunning` is no longer read and is removed. | rule + config | 9cf8308 |
| 5 | A close card the daily cap blocks after a wrong answer ends `daily-cap`, not `budget`. When only the session's R5-recent cards are left, the least recent one is served instead of ending `content-exhausted`. | rule | 3af00f5 |
| round 2 | "5 more" needs a usual time from before the session at every height played; otherwise a slow answer could not have been seen. Evidence: first sessions (no usual times) were extended and credited +1 stamina although the student was past stamina on the extra cards (slow-reader and smart-impatient, day 0, seed 1). | rule | 83dfcbb |
| round 2 | `simParams.extendFeel` **5**: a student declines "5 more" when session effort + 5 would pass their hidden stamina. Reason: slow-reader ("I get tired sooner") and smart-impatient ("if … the session drags on, I am done") took "5 more" at 9 of 10 effort and quit from fatigue two cards later. That quit the app for slow-reader on day 4 and smart-impatient on day 14, on seed 1 of round 1. | student model | 7edcb83 |

**Round 1 (`runs/f1-sN`: findings 1–5, before the two round-2 changes):**
- no-end-on-wrong: 9 / 11 / 8.
- ends-before-fade failed on all seeds, with 3–4 personas over the limit. 80–100% of their fatigued cards were `extend:liked`.
- slow-reader quit the app on day 4 (seed 1), and smart-impatient on day 14.
- Round 2 fixed both causes.

### Tried and rejected

**In the first pass:**
- **Started and not-started skills on equal terms in the close ranking, ordered by estimate.** No-end-on-wrong got worse (15 / 12 / 9). Finding 2's rule is different: it goes height first.
- **The step-4 "final card".** It broke ends-before-fade for 3 personas. Details are in git history, commit fa7b633.

**In fix round 1:** nothing else was tried.

## Step-4 examinations (current runs)

**Personas quitting the app before day 7:** only **weak-impatient**, on day 1 (seeds 1 and 3) or day 2 (seed 2).
- Its open cards are now height 1. In the first pass, the h3 `open:liked` cards it got came from R5 excluding the just-served card, not from missing h1 content as the first-pass notes said.
- Its success rate is 29–47%: its h1 p is 0.425 and its patience is 2 wrongs in 8 cards.
- **Seed 1:**
  - Day 0: h1 wrong, then an h2 missing piece "I don't know" (that skill has no h1 card), h1 right, h1 wrong, then a quit.
  - Day 1: h1 wrong, h1 piece right, h1 wrong, then a quit on an h2 piece.
- The remaining height-2 cards are repair pieces of skills without an h1 card.
- binge-quit, slow-reader and smart-impatient no longer quit early on any seed.

**Is a weak persona's knowledge flat?**
- **No.** weak-stubborn goes 0.150 → 0.252 / 0.263 / 0.259.
- weak-impatient is flat (0.150 → 0.150), but it plays only 2–3 days.

**Weak against strong:**

| | strong | weak-stubborn | weak-impatient | averages |
|---|---|---|---|---|
| cards per session | 7.6–11.3 | 6.7–7.5 | 3.5–5.5 | 5.6–7.0 |
| effort per session | 13.2–19.1 | 10.7–11.5 | 5.8–8.0 | 9.7–10.2 |
| success rate | 95–96% | 28–36% | | |
| extended sessions | 9–13 per run | none | | |
| engine stamina at the end | 14.3–23.3 (hidden 25) | | | |

**Is strong served too-easy sessions?** Partly, in the first two weeks. Its comfort sits at the floor (0.66), and it is right on 95–96%. Cards by week, h1 / h2 / h3:

| seed | week 1 | week 2 | week 3 | week 4 |
|---|---|---|---|---|
| 1 | 13/58/0 | 9/69/3 | 11/64/10 | 9/42/19 |
| 2 | 21/54/0 | 8/70/3 | 18/62/8 | 11/45/16 |
| 3 | 10/45/0 | 13/51/2 | 5/34/8 | 5/28/12 |

- The heights do step up: there are 14–20 height-up moments per run.
- They step up slowly, because a step up needs two right answers at the current height on different days or 5 cards apart. With 56 skills each one is seen rarely.
- New skills start at height 2. 33 h3 cards cover only the skills that have h3.
- Height 3 reaches about a quarter of strong's cards only in week 4. That is below its h3Share target of 0.4 of effort.
- **Recommendation for the owner:** after N right at height 2 with comfort at the floor, start new skills at height 3 or step faster.

**R4c's cost to strong:** its first 3 sessions use the budget of 8, against 12.9–14.7 for the next sessions on seed 1. That is about 15 effort fewer over days 0–2.

**Does a distracted answer shorten later sessions?** No. Sessions with exactly one slow answer and no fatigue, and the engine's stamina at the next start (`distraction.mjs`):

| seed | such sessions | stamina lowered after |
|---|---|---|
| 1 | 91 | 1 |
| 2 | 89 | 2 |
| 3 | 94 | 0 |

- The few drops are sessions ending `left`, where the fade is the walk-out point.
- Sessions with two or more slow answers do lower stamina, by design: 9 / 11 / 17 sessions per seed. Some of those are two distractions, which is the noise cost of `slowAnswers` 2.
- Slow answers when not fatigued are now about 4% of answers (114 of 2,641 on seed 1), so the sim can fail the fade rule.

**The 9-of-12 session** (an all-right height-2 session that stops at 9 effort of a 12 budget): still as in the first pass. The fix was rejected; see above.

## What still fails and why

**no-end-on-wrong:** 8 / 12 / 8, all `maxExtraClose` exhaustion. (Final review correction: 11 of these 28 loops started after a right answer, an engine choice that F1 removed; see the correction in the summary.)

| seed | weak-stubborn | fast-guesser | close-card heights in the violating sessions |
|---|---|---|---|
| 1 | 8 | – | h1+h1+h1 3, h1+h2+h2 2, h2+h2+h2 3 |
| 2 | 11 | 1 | h2+h2+h2 7, h1+h2+h2 2, h1+h1+h2 1, h1+h1+h1 1, h1+h2+h2+h2 1 (in an extended session) |
| 3 | 7 | 1 | h2+h2+h2 6, h1+h2+h2 1, h1+h1+h1 1 |

**Correction to the first-pass notes:** weak-stubborn is right on about 55% of h1 close cards (19/36, 17/31, 21/37), not 42%. The 42% figure was weak-impatient's h1 p.

Why it still fails:
- With h1 available, three wrong in a row is about 9% of entered close loops (0.45³).
- Most remaining violations are h2-only close loops after weak-stubborn has used up all 53 height-1 cards within 14 days (h2 close 0/14, 0/26, 0/19). This is a **content limit**. More height-1 cards, or more variants of the h1 cards, would remove most of it.
- `maxExtraClose` is not changed (owner decision). First-pass measurements: with 3 the violations were 6 / 4 / 11, with 4 they were 3 / 4 / 4.

**ends-before-fade, seed 3: weak-impatient, 1 of 2 days played.**
- On day 1 its budget was 8 (R4c) against a hidden stamina of 9. A wrong comfort-correction card and a wrong close card pushed it to 10.5; it walked out on the extra close card.
- With 2 days played, one day is 50%.
- The engine has no evidence about this student before day 1. The minimum-day budget of 8 plus a two-card close loop goes past 9.

## Spec §13 "design must change" lines (current runs)

| line | from the data |
|---|---|
| any persona would quit before day 7 | **Yes.** weak-impatient (day 1–2, all seeds). No other persona. |
| two different personas get near-identical sessions | **Needs the AI judges** (blind comparison). Code side: strong now gets clearly longer sessions (13–19 effort, 9–13 extensions) than the averages (≈10) and the weak personas (6–11.5). |
| a weak persona's hidden knowledge is flat after 4 weeks | **No.** weak-stubborn +0.10 to +0.11. |
| a skipped section returns the next day, or never | **No.** skip-timing passes on all seeds (32 / 34 / 16 skips). |
| the blind comparison fails for more than a quarter of pairs | **Needs the AI judges.** |

## Concerns

1. **no-end-on-wrong** needs an owner decision (`maxExtraClose`, or more height-1 content) and cannot pass by tuning.
2. **weak-impatient cannot be kept** by this engine with this content: its best p is 0.42 and its patience is 2.
3. **Strong's heights step up slowly.** It gets little height 3 before week 3.
4. **Weak students' stamina is now underestimated** (weak-stubborn 9.8–11.3 against a hidden 14). Distraction fades pull it down, and it can only grow through "5 more", which a weak student is rarely offered. That is safe ("weak never more work"), but their sessions may be shorter than they could take.
5. **The `extendFeel` change** makes extension depend on the hidden stamina. Personas with a hidden stamina of 14 or less rarely accept "5 more" now, so their engine stamina mostly does not grow.

## What the simulation cannot show (final review)

- **`knowledge-up` passes for almost any scheduler.** The hidden student learns from every answer, right or wrong, so any card served raises knowledge. The check proves the run did not break, not that this engine teaches better than another. Its detail now gives the mean gain (+0.053 to +0.054 after the fixes).
- **Strong students are never pushed up.** The strong personas sit far above the comfort target (95–97% right against 0.66–0.75). Nothing in the engine raises difficulty when the running rate is above target: comfort correction only goes down. `h3Share` stays at its default 0.40 for most personas. **Parked for the owner:** it needs a new selection rule with its own tuning rounds.
- **Sim students decline "5 more" using their hidden limit** (`simParams.extendFeel`). A real student does not know their stamina. Stamina growth in the sim is therefore partly read from the hidden trait.
- **The blind comparison can be passed from the student's own behaviour.** Blind packets show right and wrong, times, skips and "I don't know". A judge can tell two students apart without the app adapting at all. Fix F13 asks judges to label each piece of evidence `app` or `student`, and the summary counts only `app` evidence toward "the app adapts".

## After the final review fixes

_Date: 2026-11-15. Engine at `d6c93fe` (fixes F1–F10, F13, F14 of the final whole-branch review). Before: `runs/f0-sN` (engine `a8726b7`). After: `runs/f1-sN`. Same command, seeds 1–3. `simParams` and `maxExtraClose` unchanged._

What changed in the engine, in short: no close card after a right answer, and a budget end keeps the streak (F1); a new skill's record starts at the height served (F3); clock corrections (F4); a session stays on the day it started (F5); memory moves only on height-1/2 reviews (F6); `phy.therm.c043` excluded, 240 cards (F8); `fallback:any` reason (F9). F2 made `no-end-on-wrong` count `daily-cap` ends of real sessions.

### Checks

| check | seed 1 before | seed 1 after | seed 2 before | seed 2 after | seed 3 before | seed 3 after |
|---|---|---|---|---|---|---|
| no-end-on-wrong | FAIL 8 | FAIL 9 | FAIL 12 | FAIL 6 | FAIL 8 | FAIL 7 |
| skip-timing | PASS (32 skips) | PASS (25) | PASS (34) | PASS (21) | PASS (16) | PASS (27) |
| effort-cap-and-fairness | PASS (max 29.5) | PASS (max 32.5) | PASS (32.5) | PASS (34) | PASS (27.5) | PASS (27.5) |
| no-repeat-14d | PASS | PASS | PASS | PASS | PASS | PASS |
| ends-before-fade | PASS (14%) | PASS (14%) | PASS (14%) | PASS (18%) | FAIL (weak-impatient) | FAIL (weak-impatient) |
| knowledge-up | PASS (+0.056) | PASS (+0.054) | PASS (+0.061) | PASS (+0.054) | PASS (+0.054) | PASS (+0.053) |
| no-back-to-back-card | PASS | PASS | PASS | PASS | PASS | PASS |

Pass / fail after: 6 / 1, 6 / 1, 5 / 2 (the same as before). Before-run knowledge gains are computed the same way as the new detail.

Full detail, after:

| seed | check | detail |
|---|---|---|
| 1 | no-end-on-wrong | 9 violations; first: weak-stubborn day 6 session 7: ended (budget) after a wrong answer on phy.therm.c002 |
| 1 | effort-cap-and-fairness | max day effort 32.5 ≤ 40; mean asked/day strong 15.02, weak-stubborn 9.06, weak-impatient 8.00 |
| 2 | no-end-on-wrong | 6 violations; first: weak-stubborn day 11 session 12: ended (budget) after a wrong answer on phy.mech.c025 |
| 2 | effort-cap-and-fairness | max day effort 34 ≤ 40; mean asked/day strong 15.66, weak-stubborn 8.50, weak-impatient 8.00 |
| 3 | no-end-on-wrong | 7 violations; first: weak-stubborn day 2 session 3: ended (budget) after a wrong answer on phy.elec.c009 |
| 3 | effort-cap-and-fairness | max day effort 27.5 ≤ 40; mean asked/day strong 12.73, weak-stubborn 11.22, weak-impatient 8.00 |
| 3 | ends-before-fade | 1 violation; first: weak-impatient: 1 of 2 days past hidden stamina (first weak-impatient day 1 session 2, phy.elec.c039) |

### no-end-on-wrong

| seed | before | after | after, right answer before the close loop | after, by persona | close-card heights in the violating sessions (after) |
|---|---|---|---|---|---|
| 1 | 8 (4 engine-made) | 9 | 0 | weak-stubborn 9 | h1+h1+h1 3, h1+h2+h2 4, h2+h2+h2 2 |
| 2 | 12 (4 engine-made) | 6 | 0 | weak-stubborn 5, fast-guesser 1 | weak-stubborn h2+h2+h2 4, h1+h1+h1 1; fast-guesser h2+h2+h2 1 |
| 3 | 8 (3 engine-made) | 7 | 0 | weak-stubborn 6, confident-misconceptions 1 | weak-stubborn h2+h2+h2 3, h1+h1+h1 2, h1+h2+h2+h2 1 (a skip inside the loop); confident-misconceptions h2+h2+h2 1 |

- Every violation is now the `maxExtraClose` last resort after a wrong answer: three close cards wrong in a row. No violation is a `daily-cap` end (F2 would now count one).
- Sessions with a close card fell from 249 / 249 / 264 to 130 / 120 / 117: about half of all close loops were served after a right answer.
- The total did not halve. The runs are different trajectories (F3 changes which skills get scheduled from day 0), and weak-stubborn's student-made loops went 4 → 9 on seed 1. The owner question stays: accept, raise `maxExtraClose`, add more easy cards, or a non-question ending.

### Effort per session spent / asked per day

| persona | seed 1 before | seed 1 after | seed 2 before | seed 2 after | seed 3 before | seed 3 after |
|---|---|---|---|---|---|---|
| strong | 19.1 / 17.2 | 16.6 / 15.0 | 18.7 / 17.6 | 18.5 / 15.7 | 13.2 / 12.3 | 14.0 / 12.7 |
| weak-stubborn | 10.7 / 10.3 | 10.9 / 9.1 | 11.2 / 9.6 | 9.7 / 8.5 | 11.5 / 10.5 | 11.1 / 11.2 |
| weak-impatient | 5.8 / 8.0 | 5.8 / 8.0 | 7.2 / 8.0 | 7.0 / 8.0 | 8.0 / 8.0 | 8.0 / 8.0 |

Weak personas are still asked less than strong on every seed. strong took "5 more" 11 / 13 / 10 times (offered 15 / 17 / 16); weak-stubborn was offered it once in three runs and declined.

### Personas quitting the app before day 7

Only **weak-impatient**, on day 1 on all three seeds (before: day 1, 2, 1). No other persona.

### Memory (F6)

Engine memory at the end of the run against the hidden `forget` (lower forget = remembers better; higher memory = longer review gaps).

| persona | hidden forget | before s1 | before s2 | before s3 | after s1 | after s2 | after s3 |
|---|---|---|---|---|---|---|---|
| memory-good-calc-weak | 0.3 | 0.77 | 1.67 | 1.22 | 2.00 | 2.00 | 2.00 |
| strong | 0.5 | 2.00 | 1.78 | 2.00 | 2.00 | 2.00 | 2.00 |
| smart-impatient | 0.7 | 2.00 | 1.48 | 1.39 | 1.70 | 2.00 | 1.78 |
| average-fastclass | 1 | 0.66 | 0.50 | 0.61 | 0.79 | 0.60 | 1.50 |
| average-noclass | 1 | 0.57 | 1.47 | 0.74 | 0.88 | 1.06 | 0.50 |
| confident-misconceptions | 1 | 0.64 | 0.61 | 0.60 | 0.76 | 1.05 | 0.78 |
| fast-guesser | 1 | 0.50 | 0.50 | 0.50 | 0.50 | 0.50 | 0.50 |
| one-feared-section | 1 | 0.65 | 0.50 | 0.50 | 1.12 | 2.00 | 1.30 |
| slow-reader | 1 | 0.53 | 1.32 | 0.70 | 0.74 | 1.12 | 1.78 |
| steady-five-min | 1 | 0.54 | 0.50 | 0.82 | 1.05 | 0.81 | 0.94 |
| underconfident-skipper | 1 | 1.73 | 1.49 | 1.42 | 1.70 | 2.00 | 1.65 |
| weak-impatient | 1.2 | 1.00 | 1.00 | 1.00 | 1.00 | 1.00 | 1.00 |
| weak-stubborn | 1.2 | 0.52 | 0.53 | 0.63 | 0.58 | 0.50 | 0.50 |
| comeback-10 | 1.3 | 0.89 | 1.07 | 0.50 | 1.70 | 1.41 | 1.66 |
| binge-quit | 1.5 | 0.57 | 0.54 | 0.53 | 0.78 | 0.84 | 1.12 |
| calc-strong-memory-poor | 2.5 | 0.50 | 0.53 | 0.50 | 0.52 | 0.61 | 0.66 |

- The ends are now right: memory-good-calc-weak (forget 0.3) reads 2.00 on every seed, against 0.77–1.67 before; calc-strong-memory-poor (2.5) stays at 0.52–0.66.
- The middle is noise. The ten forget-1 personas spread from 0.50 to 2.00, and the spread depends on the seed.
- Memory still mixes ability with forgetting at heights 1–2: fast-guesser (forget 1, 58–68% right) is pinned at 0.50, and weak-stubborn at 0.50–0.58.
- comeback-10 (forget 1.3) reads 1.41–1.70, better than average: its reviews after the 10-day gap are few, and its height-1/2 reviews in between go right.
- weak-impatient's 1.00 is the default: it quits before any review is due.

### What got worse

- **Shorter sessions for most personas.** No close card after a right answer saves about one card. Seed 1: average-fastclass 10.3 → 8.3 effort per session, confident-misconceptions 11.6 → 9.6, strong 19.1 → 16.6. strong is asked 15.0 / 15.7 / 12.7 a day against 17.2 / 17.6 / 12.3.
- **Mean knowledge gain slightly lower:** +0.054 / +0.054 / +0.053 against +0.056 / +0.061 / +0.054.
- **no-end-on-wrong on seed 1:** 8 → 9 (all student-made now, against 4 student-made before).
- **ends-before-fade on seed 2:** worst share 14% → 18% (still under 20%).
- **Calculation-weak detection.** memory-good-calc-weak's final `h3Share` is 0.40 on all seeds (0.50 on seed 1 before), so the ramp and the higher height-3 share no longer reach it by day 28. strong ends at 0.20 on seed 1 (marked concept-weak). Not examined further; the parked `h3Share` item covers it.
- **weak-stubborn's engine stamina on seeds 1–2:** 8.9 at the end (11.3 / 9.8 before), against a hidden 14.
- Sim students may skip a closing card labelled `fallback:any` (they never skip `close:winnable`). Only 2 `fallback:any` cards were served in all three runs, so this did not move the numbers.

## After the streak and midnight fixes (2026-11-15)

Two follow-up fixes (commits 6210e1f, cc701bb). Runs: `runs/g0-sN` (before, HEAD 83c2160) and `runs/g1-sN` (after), 28 days, `--packs all`, seeds 1-3. The sim exits non-zero when a check fails, as expected.

### Seed 1 checks (after)

| check | result | detail |
|---|---|---|
| no-end-on-wrong | FAIL | 9 violations; first: weak-stubborn day 6 session 7: ended (budget) after a wrong answer on phy.therm.c002 |
| skip-timing | PASS | 27 skips, remind days on schedule, kept away until then and back by the cap |
| effort-cap-and-fairness | PASS | max day effort 32.5 ≤ 40; mean asked/day strong 15.02, weak-stubborn 9.06, weak-impatient 8.00 |
| no-repeat-14d | PASS | 2650 serves, no variant repeated within 14 days |
| ends-before-fade | PASS | worst share of days past hidden stamina 14% ≤ 20% |
| knowledge-up | PASS | 15 students kept practising, all ended above their day-0 knowledge; mean knowledge gain +0.055 |
| no-back-to-back-card | PASS | 2650 serves, no card again within 4 serves in a session |

### Seed 2 checks (after)

| check | result | detail |
|---|---|---|
| no-end-on-wrong | FAIL | 4 violations; first: weak-stubborn day 10 session 11: ended (budget) after a wrong answer on phy.therm.c016 |
| skip-timing | PASS | 21 skips, remind days on schedule, kept away until then and back by the cap |
| effort-cap-and-fairness | PASS | max day effort 34 ≤ 40; mean asked/day strong 15.66, weak-stubborn 8.67, weak-impatient 8.00 |
| no-repeat-14d | PASS | 2637 serves, no variant repeated within 14 days |
| ends-before-fade | PASS | worst share of days past hidden stamina 18% ≤ 20% |
| knowledge-up | PASS | 15 students kept practising, all ended above their day-0 knowledge; mean knowledge gain +0.054 |
| no-back-to-back-card | PASS | 2637 serves, no card again within 4 serves in a session |

### Seed 3 checks (after)

| check | result | detail |
|---|---|---|
| no-end-on-wrong | FAIL | 6 violations; first: weak-stubborn day 2 session 3: ended (budget) after a wrong answer on phy.elec.c009 |
| skip-timing | PASS | 27 skips, remind days on schedule, kept away until then and back by the cap |
| effort-cap-and-fairness | PASS | max day effort 26.5 ≤ 40; mean asked/day strong 12.73, weak-stubborn 11.22, weak-impatient 8.00 |
| no-repeat-14d | PASS | 2603 serves, no variant repeated within 14 days |
| ends-before-fade | FAIL | 1 violation; first: weak-impatient: 1 of 2 days past hidden stamina (first weak-impatient day 1 session 2, phy.elec.c039) |
| knowledge-up | PASS | 15 students kept practising, all ended above their day-0 knowledge; mean knowledge gain +0.053 |
| no-back-to-back-card | PASS | 2603 serves, no card again within 4 serves in a session |

### Budget ends under 8 effort (session effort), all 16 personas

| seed | budget ends | before: under 8 | before: keep streak | after: under 8 | after: keep streak |
|---|---|---|---|---|---|
| 1 | 382 | 55 | 55 | 45 | 37 |
| 2 | 381 / 382 | 67 | 67 | 52 | 43 |
| 3 | 383 / 381 | 52 | 52 | 44 | 35 |

The streak is kept by an under-8 session when the day's effort reached 8 (an earlier session that day) or the session spent budget - closeReserve.

### Cause of the short sessions (1a)

A repair queues its skill for a return `session.returnAfterCards` cards later, and the strict picker leaves such a skill alone (`excludeSkills`). Below comfort, `pickMiddle` only offers started, not-due skills, so for a student with one or few such skills, the one just repaired was the only candidate. `normal()` then saw strict = nothing, loose = something (the loose context has no exclusion) and took the "something to serve, nothing that fits" path to `closing`; the last answer was right, so `finish(budget)` ended the session. Evidence (fast-guesser day 9, budget 12.0): `W:new:exam-weight/h2, R:repair:missing-piece/h1`, end budget, effort 3.5, 2 cards; instrumented, room was 5.1-6.5 and the loose card (e.g. `phy.elec.c042`, h2, effort 1.5) fit, but belonged to the skill waiting for its return. The repair's confidence stage had no card (the skill's other h1 cards were in the recent window), so the return was queued at once. Fix: in that branch a waiting return that fits the budget is served early (`pickReturn` with the afterCard wait lifted) before going to closing. A unit test reproduces it with a one-skill student.

### What got worse / residual

- Under-8 budget ends that do not keep the streak remain (8, 9, 9 on the three seeds): mostly a first session of the day at 7-7.5 of a 9.8 budget, or 6.5 of 12 after `W W R` where the only card left was a height-3 (cost 4 + reserve 2 does not fit). The rule is as specified (spent >= budget - 2); these are nearly complete sessions that lose the streak when they are the only one of the day.
- no-end-on-wrong improved 9/6/7 to 9/4/6 violations; ends-before-fade on seed 3 fails before and after (1 violation, weak-impatient, unchanged).
- Serves rose a little (2560/2612/2587 to 2650/2637/2603): the sessions no longer end early.

### Streak rule revised (same day)

A budget or extended-done end now keeps the streak when the day's effort reached `budget.minimumDay`, or `spent >= budget - (effort.h3 + closeReserve)` (budget 12: 6; budget 9.8: 3.8), so a student who did all the engine asked is not penalised because the next card would not fit. Runs `runs/g2-s1..3` (same code otherwise, checks identical to the table above, serves unchanged):

| seed | budget ends under 8 effort | keep streak | lose streak |
|---|---|---|---|
| 1 | 45 | 45 | 0 |
| 2 | 52 | 52 | 0 |
| 3 | 44 | 44 | 0 |

No under-8 budget end loses the streak any more. The 3.5-of-12 dead end (unit-tested directly, 2 cards) would still lose it, but is no longer reachable in the simulator.

## After changes 1–7 (2026-11-17)

Task 9 of the plan for changes 1–7 (design changes doc, DR-0051). Runs: `runs/c0-sN` (before: commit b0a1f32, the four new checks added, no engine change yet), `runs/c1-sN` (e218210, changes 1-7 built; "HEAD" below) and `runs/c2-sN` (after the one rule fix below, commit 4a1e616), 28 days, `--packs all`, seeds 1, 2, 3. "After" below means `c2`. Numbers come from `node sim/tools/changes.mjs` (new in this task; modes `table`, `cards`, `week`, `compare`). Probe runs are `runs/x9-*` (not committed).

**Outcome:** no config number changed. One rule fixed (a repair return straight after a miss, change 1; test first). All 11 checks pass on all three seeds, before and after the fix. Two of the four targets are missed: weak-impatient quits on day 1 or 2, and fast-guesser gains about 0.03. The data points to limits of the simulated students and to design options, not to a wrong number.

### Targets

| target | seed 1 | seed 2 | seed 3 |
|---|---|---|---|
| 1. all 11 checks pass | met | met | met |
| 2. no persona quits the app before day 7 | missed (weak-impatient, day 1) | missed (weak-impatient, day 2) | missed (weak-impatient, day 1) |
| 3. no persona with prior ≤ 0.3 that keeps practising gains < 0.05 | missed (fast-guesser +0.027) | missed (fast-guesser +0.032) | missed (fast-guesser +0.029) |
| 4. weak effort per session not above strong's | met (weak-stubborn 8.1, weak-impatient 5.0 vs strong 13.6) | met (7.9, 6.3 vs 17.5) | met (7.3, 6.0 vs 14.3) |

The same at HEAD before the fix (`c1`): targets 1 and 4 met, 2 and 3 missed on every seed (fast-guesser +0.029 / +0.033 / +0.035).

Target 3 covers three personas: weak-stubborn (prior 0.15) meets it on every seed (+0.076 / +0.071 / +0.062; at HEAD +0.075 / +0.073 / +0.082); fast-guesser (prior 0.3) misses it; weak-impatient (prior 0.15) does not keep practising, so it falls under target 2.

### Checks, before and after

Before (`c0`, from the Task 2 report): seed 1 fails 5 (no-end-on-wrong 9, repair-steps-down 118, no-long-zero-session 4, side-door-not-full 9, day-one-fit 11); seed 2 fails 5 (4, 125, 2, 5, 12); seed 3 fails 6 (6, 127, 3, 9, 12, and ends-before-fade 1). At HEAD (`c1`) and after the fix (`c2`): all pass.

Seed 1 (after)

| check | result | detail |
|---|---|---|
| no-end-on-wrong | PASS | 366 engine-ended sessions, none after a wrong answer |
| skip-timing | PASS | 2 skips, remind days on schedule, kept away until then and back by the cap |
| effort-cap-and-fairness | PASS | max day effort 23 ≤ 40; mean asked/day strong 13.33, weak-stubborn 8.11, weak-impatient 8.00 |
| no-repeat-14d | PASS | 2398 serves, no variant repeated within 14 days |
| ends-before-fade | PASS | worst share of days past hidden stamina 14% ≤ 20% |
| knowledge-up | PASS | 15 students kept practising, all ended above their day-0 knowledge; mean knowledge gain +0.051 |
| no-back-to-back-card | PASS | 2398 serves, no card again within 4 serves in a session |
| repair-steps-down | PASS | 86 missing-piece repair cards, each easier than the miss (or level 1 on another card) |
| no-long-zero-session | PASS | 390 sessions, none with 0 right over 5 cards |
| side-door-not-full | PASS | 1 side-door cards, none at level 3 |
| day-one-fit | PASS | 3 first sessions with 5 right in a row, each moved up to level 2 or 3 |

Seed 2 (after)

| check | result | detail |
|---|---|---|
| no-end-on-wrong | PASS | 363 engine-ended sessions, none after a wrong answer |
| skip-timing | PASS | 3 skips, remind days on schedule, kept away until then and back by the cap |
| effort-cap-and-fairness | PASS | max day effort 30 ≤ 40; mean asked/day strong 16.00, weak-stubborn 8.29, weak-impatient 8.00 |
| no-repeat-14d | PASS | 2472 serves, no variant repeated within 14 days |
| ends-before-fade | PASS | worst share of days past hidden stamina 4% ≤ 20% |
| knowledge-up | PASS | 15 students kept practising, all ended above their day-0 knowledge; mean knowledge gain +0.052 |
| no-back-to-back-card | PASS | 2472 serves, no card again within 4 serves in a session |
| repair-steps-down | PASS | 93 missing-piece repair cards, each easier than the miss (or level 1 on another card) |
| no-long-zero-session | PASS | 391 sessions, none with 0 right over 5 cards |
| side-door-not-full | PASS | 2 side-door cards, none at level 3 |
| day-one-fit | PASS | 3 first sessions with 5 right in a row, each moved up to level 2 or 3 |

Seed 3 (after)

| check | result | detail |
|---|---|---|
| no-end-on-wrong | PASS | 371 engine-ended sessions, none after a wrong answer |
| skip-timing | PASS | 3 skips, remind days on schedule, kept away until then and back by the cap |
| effort-cap-and-fairness | PASS | max day effort 26 ≤ 40; mean asked/day strong 13.85, weak-stubborn 8.29, weak-impatient 8.00 |
| no-repeat-14d | PASS | 2384 serves, no variant repeated within 14 days |
| ends-before-fade | PASS | worst share of days past hidden stamina 11% ≤ 20% |
| knowledge-up | PASS | 15 students kept practising, all ended above their day-0 knowledge; mean knowledge gain +0.048 |
| no-back-to-back-card | PASS | 2384 serves, no card again within 4 serves in a session |
| repair-steps-down | PASS | 100 missing-piece repair cards, each easier than the miss (or level 1 on another card) |
| no-long-zero-session | PASS | 390 sessions, none with 0 right over 5 cards |
| side-door-not-full | PASS | 2 side-door cards, none at level 3 |
| day-one-fit | PASS | 5 first sessions with 5 right in a row, each moved up to level 2 or 3 |

skip-timing now sees 2 to 3 section skips per seed (27 / 21 / 27 before): "too hard" became a card-level skip (change 6) and the simulated students nearly always say "too hard".

### Per persona, before → after (seeds 1 / 2 / 3)

| persona | quit day | cards/s | effort/s | success | gain | bad-day ends | zero-right sessions |
|---|---|---|---|---|---|---|---|
| average-fastclass | - / - / - → - / - / - | 5.3 / 6.5 / 6.5 → 5.8 / 5.4 / 5.8 | 8.3 / 9.9 / 10.5 → 8.6 / 8.2 / 9.4 | 76% / 78% / 77% → 81% / 76% / 80% | 0.069 / 0.079 / 0.068 → 0.069 / 0.062 / 0.063 | 0 / 0 / 0 → 0 / 0 / 0 | 0 / 0 / 0 → 0 / 0 / 0 |
| average-noclass | - / - / - → - / - / - | 6.1 / 6.6 / 6.8 → 6.5 / 6.4 / 6.5 | 9.6 / 9.9 / 10.0 → 9.9 / 9.8 / 10.1 | 81% / 81% / 77% → 77% / 78% / 81% | 0.067 / 0.076 / 0.079 → 0.078 / 0.078 / 0.077 | 0 / 0 / 0 → 0 / 0 / 0 | 0 / 0 / 0 → 0 / 0 / 0 |
| binge-quit | - / - / - → - / - / - | 7.0 / 7.8 / 7.6 → 6.5 / 9.6 / 7.9 | 10.7 / 11.6 / 10.8 → 11.2 / 13.9 / 11.2 | 80% / 81% / 80% → 78% / 82% / 80% | 0.048 / 0.057 / 0.042 → 0.048 / 0.071 / 0.054 | 0 / 0 / 0 → 0 / 0 / 0 | 0 / 0 / 1 → 0 / 0 / 0 |
| calc-strong-memory-poor | - / - / - → - / - / - | 6.0 / 7.0 / 6.3 → 6.4 / 6.2 / 5.5 | 9.4 / 10.8 / 10.1 → 9.9 / 9.1 / 8.4 | 73% / 73% / 72% → 75% / 77% / 73% | 0.018 / 0.013 / 0.015 → 0.026 / 0.013 / 0.012 | 0 / 0 / 0 → 0 / 1 / 0 | 1 / 0 / 0 → 0 / 0 / 0 |
| comeback-10 | - / - / - → - / - / - | 7.5 / 7.0 / 6.4 → 5.8 / 5.9 / 6.0 | 10.6 / 9.8 / 9.8 → 9.9 / 8.8 / 8.9 | 84% / 85% / 83% → 80% / 81% / 79% | 0.041 / 0.037 / 0.034 → 0.035 / 0.036 / 0.026 | 0 / 0 / 0 → 0 / 0 / 0 | 0 / 0 / 0 → 0 / 0 / 0 |
| confident-misconceptions | - / - / - → - / - / - | 7.4 / 7.0 / 7.4 → 6.6 / 6.7 / 6.4 | 11.2 / 11.0 / 10.9 → 10.7 / 9.9 / 10.5 | 77% / 72% / 78% → 76% / 76% / 80% | 0.068 / 0.066 / 0.067 → 0.066 / 0.064 / 0.056 | 0 / 0 / 0 → 0 / 1 / 0 | 0 / 0 / 0 → 0 / 1 / 0 |
| fast-guesser | - / - / - → - / - / - | 7.3 / 5.9 / 6.1 → 5.9 / 5.6 / 5.5 | 11.7 / 9.4 / 9.8 → 9.3 / 9.5 / 8.7 | 67% / 65% / 64% → 62% / 63% / 64% | 0.039 / 0.030 / 0.031 → 0.027 / 0.032 / 0.029 | 0 / 0 / 0 → 3 / 0 / 2 | 0 / 0 / 0 → 3 / 0 / 0 |
| memory-good-calc-weak | - / - / - → - / - / - | 7.0 / 6.9 / 6.6 → 6.3 / 6.2 / 6.2 | 10.4 / 10.1 / 9.9 → 9.8 / 9.6 / 10.0 | 92% / 94% / 90% → 90% / 92% / 89% | 0.076 / 0.074 / 0.076 → 0.069 / 0.068 / 0.065 | 1 / 0 / 0 → 0 / 0 / 0 | 0 / 0 / 0 → 0 / 0 / 0 |
| one-feared-section | - / - / - → - / - / - | 5.8 / 6.2 / 5.9 → 6.1 / 5.8 / 6.4 | 9.7 / 9.8 / 9.7 → 9.9 / 9.5 / 9.9 | 83% / 83% / 81% → 84% / 82% / 82% | 0.051 / 0.057 / 0.056 → 0.054 / 0.053 / 0.059 | 0 / 0 / 0 → 0 / 0 / 0 | 0 / 0 / 0 → 0 / 0 / 0 |
| slow-reader | - / - / - → - / - / - | 5.6 / 6.0 / 5.8 → 5.3 / 5.6 / 5.6 | 9.5 / 8.6 / 9.1 → 8.1 / 8.8 / 8.7 | 77% / 80% / 85% → 82% / 79% / 83% | 0.061 / 0.061 / 0.056 → 0.055 / 0.061 / 0.056 | 0 / 0 / 0 → 1 / 2 / 0 | 0 / 0 / 0 → 0 / 0 / 0 |
| smart-impatient | - / - / - → - / - / - | 6.4 / 5.3 / 6.0 → 5.5 / 5.3 / 5.6 | 9.4 / 7.7 / 9.0 → 9.8 / 7.8 / 9.5 | 96% / 91% / 96% → 91% / 93% / 97% | 0.025 / 0.021 / 0.023 → 0.023 / 0.022 / 0.021 | 0 / 0 / 0 → 0 / 0 / 0 | 0 / 0 / 0 → 0 / 0 / 0 |
| steady-five-min | - / - / - → - / - / - | 6.7 / 6.4 / 5.9 → 5.7 / 6.0 / 5.9 | 10.2 / 10.0 / 8.7 → 8.7 / 9.2 / 10.0 | 81% / 81% / 82% → 79% / 75% / 77% | 0.078 / 0.074 / 0.065 → 0.068 / 0.073 / 0.069 | 0 / 0 / 0 → 0 / 0 / 0 | 0 / 0 / 0 → 0 / 0 / 1 |
| strong | - / - / - → - / - / - | 9.5 / 10.0 / 8.0 → 7.1 / 8.4 / 7.0 | 16.6 / 18.5 / 14.0 → 13.6 / 17.5 / 14.3 | 97% / 95% / 96% → 96% / 95% / 92% | 0.042 / 0.045 / 0.037 → 0.034 / 0.040 / 0.037 | 0 / 0 / 0 → 0 / 0 / 0 | 0 / 0 / 0 → 0 / 0 / 0 |
| underconfident-skipper | - / - / - → - / - / - | 6.6 / 5.2 / 6.3 → 6.3 / 6.2 / 5.9 | 9.7 / 8.1 / 9.8 → 10.1 / 9.7 / 9.8 | 90% / 89% / 86% → 89% / 88% / 85% | 0.037 / 0.025 / 0.037 → 0.035 / 0.034 / 0.035 | 0 / 0 / 0 → 0 / 0 / 0 | 0 / 0 / 0 → 0 / 0 / 0 |
| weak-impatient | 1 / 1 / 1 → 1 / 2 / 1 | 3.5 / 5.0 / 5.5 → 3.0 / 4.7 / 4.0 | 5.8 / 7.0 / 8.0 → 5.0 / 6.3 / 6.0 | 29% / 60% / 45% → 33% / 57% / 50% | 0.000 / -0.001 / 0.000 → -0.001 / 0.000 / -0.003 | 0 / 0 / 0 → 0 / 0 / 0 | 0 / 0 / 1 → 0 / 0 / 0 |
| weak-stubborn | - / - / - → - / - / - | 6.8 / 6.3 / 7.2 → 5.3 / 5.0 / 4.8 | 10.9 / 9.9 / 11.1 → 8.1 / 7.9 / 7.3 | 29% / 34% / 34% → 35% / 32% / 43% | 0.103 / 0.093 / 0.105 → 0.076 / 0.071 / 0.062 | 0 / 1 / 1 → 10 / 11 / 6 | 4 / 2 / 3 → 8 / 6 / 2 |

### Per persona, after (full)

`ladder s1/s3`: ladder level at the end of sessions 1 and 3, replayed from the log (533 of 615 ladder-reason cards in sessions 1-3 were served at the replayed level, 82 below it when no card existed at that level, none above). `extended effort`: mean session effort of sessions that ended "extended-done". `left`: sessions the student walked out of.

Seed 1

| persona | days | quit day | sess | cards/s | effort/s | success | k d0 → d14 → end | gain | recap | bad-day | left | zero-right | card skips | section skips | rejoins | stretch served/right | 5 more offered/taken | extended effort | ladder s1/s3 | end profile c / m / h3 / st | hidden st |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| average-fastclass | 28 | - | 28 | 5.8 | 8.6 | 81% | 0.40 → 0.44 → 0.47 | +0.069 | 1 | 0 | 0 | 0 | 5 | 0 | 0 | 3/2 | 15/3 | 14.0 | 1/2 | 0.71 / 0.94 / 0.40 / 12.3 | 14 |
| average-noclass | 28 | - | 28 | 6.5 | 9.9 | 77% | 0.40 → 0.45 → 0.48 | +0.078 | 1 | 0 | 0 | 0 | 1 | 0 | 0 | 6/2 | 10/1 | 13.5 | 2/1 | 0.72 / 1.41 / 0.40 / 14.3 | 14 |
| binge-quit | 14 | - | 20 | 6.5 | 11.2 | 78% | 0.40 → 0.43 → 0.45 | +0.048 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1/1 | 4/4 | 17.6 | 2/2 | 0.73 / 0.55 / 0.40 / 17.3 | 30 |
| calc-strong-memory-poor | 28 | - | 28 | 6.4 | 9.9 | 75% | 0.50 → 0.53 → 0.53 | +0.026 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 2/1 | 11/4 | 15.3 | 2/2 | 0.73 / 0.53 / 0.40 / 11.9 | 14 |
| comeback-10 | 18 | - | 18 | 5.8 | 9.9 | 80% | 0.45 → 0.47 → 0.48 | +0.035 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 2/1 | 4/0 | - | 2/2 | 0.73 / 0.91 / 0.40 / 13.3 | 14 |
| confident-misconceptions | 28 | - | 28 | 6.6 | 10.7 | 76% | 0.50 → 0.54 → 0.57 | +0.066 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 3/3 | 10/3 | 17.3 | 2/1 | 0.74 / 0.63 / 0.50 / 16.3 | 16 |
| fast-guesser | 28 | - | 28 | 5.9 | 9.3 | 62% | 0.30 → 0.32 → 0.33 | +0.027 | 6 | 3 | 0 | 3 | 0 | 0 | 0 | 0/0 | 6/2 | 16.8 | 1/1 | 0.74 / 0.50 / 0.40 / 10.5 | 18 |
| memory-good-calc-weak | 28 | - | 28 | 6.3 | 9.8 | 90% | 0.50 → 0.54 → 0.57 | +0.069 | 0 | 0 | 0 | 0 | 7 | 0 | 0 | 2/2 | 14/0 | - | 3/2 | 0.67 / 1.87 / 0.40 / 13.3 | 14 |
| one-feared-section | 28 | - | 28 | 6.1 | 9.9 | 84% | 0.46 → 0.50 → 0.52 | +0.054 | 0 | 0 | 0 | 0 | 1 | 3 | 0 | 3/2 | 11/4 | 16.9 | 2/2 | 0.70 / 1.05 / 0.40 / 10.1 | 14 |
| slow-reader | 28 | - | 28 | 5.3 | 8.1 | 82% | 0.45 → 0.48 → 0.50 | +0.055 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 5/2 | 11/0 | - | 2/2 | 0.69 / 1.86 / 0.40 / 9.3 | 10 |
| smart-impatient | 14 | - | 14 | 5.5 | 9.8 | 91% | 0.70 → 0.71 → 0.72 | +0.023 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1/1 | 6/0 | - | 2/2 | 0.71 / 2.00 / 0.50 / 13.3 | 10 |
| steady-five-min | 28 | - | 28 | 5.7 | 8.7 | 79% | 0.40 → 0.45 → 0.47 | +0.068 | 2 | 0 | 0 | 0 | 4 | 0 | 0 | 3/2 | 12/0 | - | 2/3 | 0.72 / 0.64 / 0.40 / 10.5 | 12 |
| strong | 28 | - | 28 | 7.1 | 13.6 | 96% | 0.80 → 0.82 → 0.83 | +0.034 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 4/4 | 14/9 | 19.1 | 3/3 | 0.66 / 2.00 / 0.40 / 17.4 | 25 |
| underconfident-skipper | 28 | - | 28 | 6.3 | 10.1 | 89% | 0.65 → 0.67 → 0.68 | +0.035 | 1 | 0 | 0 | 0 | 10 | 0 | 0 | 0/0 | 11/0 | - | 3/3 | 0.67 / 2.00 / 0.40 / 11.1 | 12 |
| weak-impatient | 2 | 1 | 2 | 3.0 | 5.0 | 33% | 0.15 → 0.15 → 0.15 | -0.001 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0/0 | 0/0 | - | 1/- | 0.81 / 1.00 / 0.40 / 9.1 | 9 |
| weak-stubborn | 28 | - | 28 | 5.3 | 8.1 | 35% | 0.15 → 0.20 → 0.23 | +0.076 | 11 | 10 | 0 | 8 | 0 | 0 | 0 | 0/0 | 0/0 | - | 2/1 | 0.75 / 0.50 / 0.40 / 8.9 | 14 |

Seed 2

| persona | days | quit day | sess | cards/s | effort/s | success | k d0 → d14 → end | gain | recap | bad-day | left | zero-right | card skips | section skips | rejoins | stretch served/right | 5 more offered/taken | extended effort | ladder s1/s3 | end profile c / m / h3 / st | hidden st |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| average-fastclass | 28 | - | 28 | 5.4 | 8.2 | 76% | 0.40 → 0.44 → 0.46 | +0.062 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 4/1 | 10/1 | 10.5 | 2/3 | 0.72 / 0.81 / 0.40 / 9.9 | 14 |
| average-noclass | 28 | - | 28 | 6.4 | 9.8 | 78% | 0.40 → 0.45 → 0.48 | +0.078 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 7/5 | 7/0 | - | 2/3 | 0.73 / 0.68 / 0.40 / 10.2 | 14 |
| binge-quit | 14 | - | 20 | 9.6 | 13.9 | 82% | 0.40 → 0.45 → 0.47 | +0.071 | 0 | 0 | 1 | 0 | 2 | 0 | 0 | 8/3 | 9/9 | 18.4 | 2/2 | 0.75 / 0.53 / 0.40 / 18.8 | 30 |
| calc-strong-memory-poor | 28 | - | 28 | 6.2 | 9.1 | 77% | 0.50 → 0.52 → 0.51 | +0.013 | 2 | 1 | 0 | 0 | 0 | 0 | 0 | 4/2 | 13/1 | 15.0 | 1/2 | 0.73 / 0.69 / 0.40 / 12.3 | 14 |
| comeback-10 | 18 | - | 18 | 5.9 | 8.8 | 81% | 0.45 → 0.47 → 0.49 | +0.036 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 5/4 | 9/0 | - | 2/2 | 0.73 / 1.95 / 0.40 / 11.0 | 14 |
| confident-misconceptions | 28 | - | 28 | 6.7 | 9.9 | 76% | 0.50 → 0.54 → 0.56 | +0.064 | 1 | 1 | 0 | 1 | 0 | 0 | 0 | 7/5 | 11/4 | 17.0 | 2/1 | 0.74 / 0.60 / 0.40 / 11.2 | 16 |
| fast-guesser | 28 | - | 28 | 5.6 | 9.5 | 63% | 0.30 → 0.32 → 0.33 | +0.032 | 5 | 0 | 0 | 0 | 0 | 0 | 0 | 0/0 | 3/1 | 17.5 | 1/1 | 0.75 / 0.50 / 0.40 / 10.0 | 18 |
| memory-good-calc-weak | 28 | - | 28 | 6.2 | 9.6 | 92% | 0.50 → 0.54 → 0.57 | +0.068 | 0 | 0 | 0 | 0 | 7 | 0 | 0 | 1/1 | 15/5 | 15.6 | 3/2 | 0.66 / 2.00 / 0.40 / 12.3 | 14 |
| one-feared-section | 28 | - | 28 | 5.8 | 9.5 | 82% | 0.46 → 0.50 → 0.52 | +0.053 | 1 | 0 | 0 | 0 | 0 | 5 | 0 | 6/5 | 9/0 | - | 2/2 | 0.71 / 1.24 / 0.40 / 10.7 | 14 |
| slow-reader | 28 | - | 28 | 5.6 | 8.8 | 79% | 0.45 → 0.49 → 0.51 | +0.061 | 1 | 2 | 0 | 0 | 1 | 0 | 0 | 5/4 | 10/0 | - | 2/2 | 0.72 / 1.16 / 0.40 / 8.9 | 10 |
| smart-impatient | 14 | - | 14 | 5.3 | 7.8 | 93% | 0.70 → 0.71 → 0.72 | +0.022 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 2/2 | 6/0 | - | 1/3 | 0.74 / 2.00 / 0.40 / 11.3 | 10 |
| steady-five-min | 28 | - | 28 | 6.0 | 9.2 | 75% | 0.40 → 0.44 → 0.47 | +0.073 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 5/4 | 9/0 | - | 2/1 | 0.74 / 0.69 / 0.40 / 11.1 | 12 |
| strong | 28 | - | 28 | 8.4 | 17.5 | 95% | 0.80 → 0.82 → 0.84 | +0.040 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 12/10 | 18/13 | 21.9 | 3/2 | 0.67 / 2.00 / 0.40 / 21.6 | 25 |
| underconfident-skipper | 28 | - | 28 | 6.2 | 9.7 | 88% | 0.65 → 0.67 → 0.68 | +0.034 | 0 | 0 | 0 | 0 | 9 | 0 | 0 | 1/1 | 13/0 | - | 3/2 | 0.67 / 1.34 / 0.40 / 10.7 | 12 |
| weak-impatient | 3 | 2 | 3 | 4.7 | 6.3 | 57% | 0.15 → 0.16 → 0.15 | +0.000 | 0 | 0 | 2 | 0 | 1 | 0 | 0 | 0/0 | 0/0 | - | 1/1 | 0.81 / 1.00 / 0.40 / 9.4 | 9 |
| weak-stubborn | 28 | - | 28 | 5.0 | 7.9 | 32% | 0.15 → 0.19 → 0.22 | +0.071 | 14 | 11 | 0 | 6 | 0 | 0 | 0 | 0/0 | 1/1 | 14.5 | 1/1 | 0.75 / 0.72 / 0.40 / 8.9 | 14 |

Seed 3

| persona | days | quit day | sess | cards/s | effort/s | success | k d0 → d14 → end | gain | recap | bad-day | left | zero-right | card skips | section skips | rejoins | stretch served/right | 5 more offered/taken | extended effort | ladder s1/s3 | end profile c / m / h3 / st | hidden st |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| average-fastclass | 28 | - | 28 | 5.8 | 9.4 | 80% | 0.40 → 0.44 → 0.46 | +0.063 | 0 | 0 | 1 | 0 | 3 | 0 | 0 | 3/2 | 11/4 | 16.3 | 2/1 | 0.73 / 2.00 / 0.40 / 8.9 | 14 |
| average-noclass | 28 | - | 28 | 6.5 | 10.1 | 81% | 0.40 → 0.45 → 0.48 | +0.077 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 8/6 | 12/0 | - | 1/1 | 0.71 / 1.24 / 0.40 / 9.8 | 14 |
| binge-quit | 14 | - | 20 | 7.9 | 11.2 | 80% | 0.40 → 0.44 → 0.45 | +0.054 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0/0 | 8/6 | 16.8 | 2/3 | 0.77 / 0.50 / 0.40 / 17.3 | 30 |
| calc-strong-memory-poor | 28 | - | 28 | 5.5 | 8.4 | 73% | 0.50 → 0.52 → 0.51 | +0.012 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 1/0 | 11/1 | - | 2/1 | 0.76 / 0.55 / 0.40 / 9.8 | 14 |
| comeback-10 | 18 | - | 18 | 6.0 | 8.9 | 79% | 0.45 → 0.47 → 0.48 | +0.026 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 3/1 | 4/2 | 13.8 | 2/2 | 0.73 / 0.74 / 0.40 / 11.8 | 14 |
| confident-misconceptions | 28 | - | 28 | 6.4 | 10.5 | 80% | 0.50 → 0.53 → 0.56 | +0.056 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 3/1 | 11/5 | 16.2 | 3/3 | 0.71 / 1.14 / 0.40 / 15.1 | 16 |
| fast-guesser | 28 | - | 28 | 5.5 | 8.7 | 64% | 0.30 → 0.32 → 0.33 | +0.029 | 4 | 2 | 0 | 0 | 0 | 0 | 0 | 2/0 | 3/0 | - | 1/2 | 0.75 / 0.53 / 0.40 / 10.8 | 18 |
| memory-good-calc-weak | 28 | - | 28 | 6.2 | 10.0 | 89% | 0.50 → 0.54 → 0.57 | +0.065 | 0 | 0 | 0 | 0 | 7 | 0 | 0 | 0/0 | 13/0 | - | 3/3 | 0.67 / 1.70 / 0.40 / 13.3 | 14 |
| one-feared-section | 28 | - | 28 | 6.4 | 9.9 | 82% | 0.46 → 0.50 → 0.52 | +0.059 | 0 | 0 | 0 | 0 | 2 | 5 | 0 | 7/6 | 12/2 | 16.8 | 2/1 | 0.70 / 1.98 / 0.40 / 8.9 | 14 |
| slow-reader | 28 | - | 28 | 5.6 | 8.7 | 83% | 0.45 → 0.49 → 0.51 | +0.056 | 0 | 0 | 0 | 0 | 3 | 0 | 0 | 2/2 | 15/0 | - | 2/3 | 0.69 / 0.71 / 0.40 / 8.9 | 10 |
| smart-impatient | 14 | - | 14 | 5.6 | 9.5 | 97% | 0.70 → 0.71 → 0.72 | +0.021 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0/0 | 5/0 | - | 3/3 | 0.71 / 2.00 / 0.40 / 13.3 | 10 |
| steady-five-min | 28 | - | 28 | 5.9 | 10.0 | 77% | 0.40 → 0.44 → 0.47 | +0.069 | 1 | 0 | 0 | 1 | 1 | 0 | 0 | 3/1 | 6/0 | - | 2/3 | 0.72 / 0.55 / 0.40 / 13.3 | 12 |
| strong | 28 | - | 28 | 7.0 | 14.3 | 92% | 0.80 → 0.82 → 0.84 | +0.037 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 4/4 | 10/9 | 19.1 | 3/3 | 0.69 / 2.00 / 0.40 / 17.7 | 25 |
| underconfident-skipper | 28 | - | 28 | 5.9 | 9.8 | 85% | 0.65 → 0.67 → 0.69 | +0.035 | 0 | 0 | 0 | 0 | 3 | 0 | 0 | 4/3 | 15/0 | - | 2/2 | 0.68 / 2.00 / 0.50 / 13.3 | 12 |
| weak-impatient | 2 | 1 | 2 | 4.0 | 6.0 | 50% | 0.15 → 0.15 → 0.15 | -0.003 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0/0 | 0/0 | - | 1/- | 0.81 / 1.00 / 0.40 / 9.7 | 9 |
| weak-stubborn | 28 | - | 28 | 4.8 | 7.3 | 43% | 0.15 → 0.19 → 0.21 | +0.062 | 9 | 6 | 0 | 2 | 0 | 0 | 0 | 0/0 | 0/0 | - | 1/1 | 0.75 / 0.50 / 0.40 / 8.9 | 14 |

### What got better, worse, or did not move

| persona | better | worse | did not move |
|---|---|---|---|
| strong | session 1 reaches guided cards at card 3 (was: 8 easy cards, first guided card in session 2); first full problem on day 1, session 2, card 1 (was day 9 to 12); 2 to 4 full problems in days 0-6 (was 0); stretch cards 4/4, 12/10, 4/4 served/right | effort per session 16.6 → 13.6 on seed 1; sessions 2 and 3 are 3 or 4 cards (a full problem costs 4 of the 8 budget); gain 0.042 / 0.045 / 0.037 → 0.034 / 0.040 / 0.037 | success 92 to 96%; "5 more" taken 9 to 13 times |
| weak-stubborn | zero-right sessions are now at most 4 cards (were 8 to 10) | gain 0.103 / 0.093 / 0.105 → 0.076 / 0.071 / 0.062; cards in 28 days 191 / 177 / 202 → 148 / 139 / 134; effort per session 10.9 / 9.9 / 11.1 → 8.1 / 7.9 / 7.3; recap ends 11 / 14 / 9 of 28 sessions; bad-day ends 10 / 11 / 6 | still meets target 3; success 29-34% → 32-43% |
| weak-impatient | none | none | quits day 1 / 2 / 1 (before 1 / 1 / 1); gain 0 |
| fast-guesser | none | 9 sessions per seed at the minimum budget of 8 (3 to 4 before), 6 to 7 of them after a session with 2 or fewer right (change 3); 0 to 3 bad-day ends; gain 0.039 / 0.030 / 0.031 → 0.027 / 0.032 / 0.029 | far from 0.05 before and after |
| calc-strong-memory-poor | gain 0.018 / 0.013 / 0.015 → 0.026 / 0.013 / 0.012 (noise around 0.015; forget 2.5) | | never quits |
| comeback-10 | | gain 0.041 / 0.037 / 0.034 → 0.035 / 0.036 / 0.026; cards per session 7.0 → 5.9 on average | |
| memory-good-calc-weak, steady-five-min, slow-reader | | gain down 0.000 to 0.007 | |
| underconfident-skipper | gain 0.025 → 0.034 on seed 2 | | |
| average-noclass, average-fastclass, one-feared-section, binge-quit, smart-impatient, confident-misconceptions | | | within seed noise |

Mean knowledge gain over the 15 students who kept practising: +0.055 / +0.054 / +0.053 → +0.051 / +0.052 / +0.048 (at HEAD, before the fix: +0.051 / +0.050 / +0.051). The main cause is fewer cards: closers no longer chain (change 7, `maxExtraClose` 2 → 0), sessions after a near-zero day use the minimum budget (change 3), and in the simulator a wrong answer teaches more than a right one (`learnWrong` 0.10 > `learnRight` 0.06), so volume, not success rate, drives the gain.

### Very short sessions, recap ends, "5 more"

- **Mean cards per session below 4:** only weak-impatient (3.0 / 4.7 / 4.0). Cause: it walks out at its second miss (see below). weak-stubborn is lowest of the rest at 5.3 / 5.0 / 4.8; every other persona is at 5.3 or more.
- **Recap ends per persona** (after; there was no recap before): weak-stubborn 11 / 14 / 9 of 28 sessions (39% / 50% / 32%); fast-guesser 6 / 5 / 4; every other persona 0 to 2. Totals 22 / 24 / 14 of about 390 sessions (HEAD: 22 / 14 / 19). weak-stubborn's closers are all level 1 and right 12 of 23, 13 of 27, 17 of 26: about half, which is its hidden chance on level-1 cards. weak-stubborn gets a recap in half its sessions on seed 2. That is the signal the owner asked about: the closer cannot be more winnable than the student's best level-1 chance.
- **Recaps with nothing fixed:** 19 of 22, 21 of 24 and 10 of 14 recap ends have an empty `fixedSkills` list. The recap "of what was fixed today" then has nothing to name (options, F).
- **"5 more":** offered 129 / 128 / 129 → 139 / 143 / 136 times; taken 31 / 27 / 31 → 30 / 35 / 29; mean effort of an extended session 19.1 / 19.8 / 17.3 → 17.1 / 18.7 / 17.2 (the 7.5 extension allowance). strong: offered 14 / 18 / 10, taken 9 / 13 / 9, extended sessions 19.1 / 21.9 / 19.1 effort. weak-stubborn was offered it 0 or 1 time per seed, weak-impatient never.

### strong, days 0 to 6

Levels per card (x = missed, s = stretch, +5 / -5 = "5 more" taken / declined).

| seed | session 1 | session 2 | session 3 | session 4 | sessions 5-7 |
|---|---|---|---|---|---|
| before, 1 | 1 1 1 1 1 1 1 1 | 1 1 2 1 1 1 1 | 2 2 2 1 1 2 | 2 2 2 2 2 2 -5 | level 2 only; no full problem until day 12 |
| after, 1 | 1 1 2 2 2 2 | 3 2 2 1 | 3 2 2 1 | 2 2 1 2 2 2 2 | one full problem on day 5; "5 more" on day 6 |
| after, 2 | 1 1 2 2 2 2 | 3 2 2 1 | 3 2x 2 | 1 1x 1 3 | stretch cards on days 4 and 6, "5 more" twice |
| after, 3 | 1 1 2 2 2 2 | 3x 2 2 | 1 1 1 1 2 2 1 | 1 2 3x 2x 1 | stretch on day 5, "5 more" once |

The ladder does what change 4 asks. The first sessions are short in cards for this student: a full problem costs 4 of the 8 effort, so sessions 2 and 3 have 3 or 4 cards (known from Task 4).

### weak-impatient, card by card

Hidden traits (read-only): prior 0.15, concept -0.1, patience 2 wrong answers within 8 cards in a session, 2 walked-out sessions in a row and it leaves the app, stamina 9. Its hidden chance on a level-1 card of a new skill is 0.5 + 1.5 × (0.15 - 0.1 - 0.1) = 0.425. Over the three seeds it answered 26 level-1 cards and got 14 right (54%); the mean hidden chance on those cards was 0.45. Its logs are the same at HEAD and after the fix.

Seed 1 (seed 3 session 1 is the same)

| card | level | reason | result | what came next |
|---|---|---|---|---|
| D0 S1 #1 phy.mech.c027 | 1 | open:liked | wrong | no repair card: the skill has 1 level-1 card and its `requires` (suvat, vec.resolve) and `helps` (vertical-throw) have none; next ladder card |
| #2 phy.mech.c005 | 1 | open:liked | right | ladder card |
| #3 phy.mech.c004 | 1 | open:liked | wrong | second miss in the session |
| #4 phy.therm.c001 | 1 | new:exam-weight | walked out | `"quitReason":"frustration"`, end `left, 3 cards, 1 right, effort 5` |
| D1 S2 #1 phy.elec.c012 | 1 | open:easy | right | near-zero-day start (change 3) |
| #2 phy.elec.c039 | 1 | open:easy | wrong | repair |
| #3 phy.elec.c038 | 1 | repair:missing-piece | wrong | a different level-1 card of the same skill (change 1); two misses on the skill, so the skill is left (change 2) |
| #4 phy.elec.c046 | 1 | comfort-correction | walked out | easiest card in another section; quits the app on day 1 |

Seed 2

| card | level | reason | result | what came next |
|---|---|---|---|---|
| D0 S1 #1 phy.mech.c027, #2 phy.mech.c004 | 1, 1 | open:liked | right, right | two right: ladder to level 2 |
| #3 phy.mech.c006 | 2 | open:liked | skipped "too hard" (card) | |
| #4 phy.mech.t09 | 2 | open:liked | I don't know | ladder down to 1 |
| #5 phy.therm.c002, #6 phy.therm.c001 | 1, 1 | new:exam-weight, open:liked | right, right | ladder to level 2 |
| #7 phy.therm.t01 | 2 | open:liked | I don't know | ladder down |
| #8 phy.elec.c001 | 1 | new:exam-weight | right | end `budget, 7 cards, 5 right, effort 8`: the one session it finished ("I don't know" counts half towards its patience) |
| D1 S2 #1 phy.elec.c002 | 1 | open:liked | wrong | repair |
| #2 phy.elec.c009 | 1 | repair:missing-piece | right | level-1 card of the `helps` neighbour |
| #3 phy.mech.c005 | 1 | open:liked | wrong | second miss |
| #4 phy.therm.c044 | 1 | new:exam-weight | walked out | |
| D2 S3 #1 phy.elec.c012 | 1 | open:easy | right | near-zero-day start |
| #2 phy.elec.c021 | 1 | open:easy | wrong | repair |
| #3 phy.elec.c023 | 1 | repair:missing-piece | right | confidence card |
| #4 phy.elec.c022 | 1 | repair:confidence | wrong | second miss |
| #5 phy.therm.c018 | 1 | new:exam-weight | walked out | quits the app on day 2 |

Seed 3 session 2: `c012 right, c038 wrong, c039 (repair) right, c002 right, c001 wrong`, then the repair card `c002` and it walks out (5 cards, 3 right).

**Did the engine do what the accepted design asks?** Yes, as far as the student let it.

| design rule | seen |
|---|---|
| easy first cards via the ladder (change 4) | yes: every session-1 card is level 1 until two right in a row; on seed 2 it went up and came back down after each "I don't know" |
| an easier or different easy repair card (change 1) | yes when one exists (c039 → c038, c021 → c023, c002 → c009); after c027 none exists in the content, so no repair was served (the §3 content gap, not a rule defect) |
| leave the skill after two misses (change 2) | yes (seed 1 D1: c039, c038 wrong → c046 in another section) |
| a short session (change 4, "first 3 sessions stay short") | yes: budget 8, the minimum day |
| near-zero day → next session minimum budget, easy opening (change 3) | yes (`open:easy` openers in sessions 2 and 3) |
| bad-day early end with an easy closer, recap (changes 3, 7) | not reached: the student walks out at its second miss, before a run of 3 misses or 2 bad moments, and before any closing card |

**Why it still leaves.** In the simulator it walks out the moment a card is served after its second miss in a session. The design always serves one more card after a miss (a repair, a closer, or the recap only after a missed closer). So a session survives only if it has at most one miss before its last card. With a chance of 0.43 to 0.55 per level-1 card, a Monte Carlo of that rule gives:

| cards planned per session | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|
| session survives, p = 0.425 | 68% | 40% | 22% | 11% | 6% |
| still in the app on day 7, p = 0.425 | 59% | 15% | 2% | 0% | 0% |
| still in the app on day 7, p = 0.55 | 82% | 41% | 16% | 4% | 1% |

Card order cannot change this in the simulator: every fresh skill has the same hidden prior, so every level-1 card of a new skill has the same 0.425 chance. Only staying on a skill just practised raises it (a miss adds about 0.06 to that skill's knowledge, so +0.09 to the chance).

**Number-level levers tried (probes, not kept):**

Probes were run on HEAD (`c1`); weak-impatient's logs do not change with the fix.

| probe | weak-impatient quit day (s1 / s2 / s3) | weak-stubborn gain | checks | kept? |
|---|---|---|---|---|
| HEAD | 1 / 2 / 1 | 0.075 / 0.073 / 0.082 | all pass | |
| `budget.minimumDay` 8 → 3 | 7 / 5 / 24 | 0.045 / 0.043 / 0.037 | all pass | no: target 2 met on 1 seed only (day 7 counts as not before day 7); weak-stubborn falls below 0.05 (breaks target 3) |
| `budget.minimumDay` 8 → 4 | 1 / 2 / 11 | 0.038 / 0.045 / 0.043 | seed 3: repair-steps-down 1 | no |
| `budget.minimumDay` 8 → 5 | 1 / 3 / 4 | 0.056 / 0.057 / 0.059 | all pass | no: no seed past day 7 |
| `budget.minimumDay` 8 → 6 | 1 / 3 / 1 | 0.065 / 0.066 / 0.063 | day-one-fit fails on every seed | no |
| first-session and near-zero-day budget 3 (temporary code patch, minimum day unchanged) | 3 / 5 / 12 | 0.044 / 0.050 / 0.050 | all pass | no: 1 seed; hurts weak-stubborn; needs a new config number |
| same, budget 4 | 1 / 2 / 11 | 0.042 / 0.045 / 0.044 | seed 3: repair-steps-down 1 | no |
| same, budget 5 | 1 / 3 / 4 | 0.054 / 0.062 / 0.070 | all pass | no: no seed past day 7 |

`minimumDay` is also the streak floor and the stamina floor, so lowering it changes more than session length. Even where weak-impatient stays, it gains nothing (+0.027 at best, 25 days on probe md3 seed 3): sessions of 2 or 3 cards do not move 56 skills.

**Answer.** The engine did everything the accepted design asks; within the design no config number keeps this simulated student past day 7 on 2 of 3 seeds without hurting weak-stubborn. Its patience (2 misses in a session, 2 such sessions) is a property of the simulated student, set in `sim/personas.ts`, and it gets 54% of its level-1 answers right.

### fast-guesser (target 3)

Hidden traits: prior 0.3, learn 0.5 (half the average), stamina 18, never says "I don't know". It plays all 28 days, 155 to 166 cards, 62 to 64% right. The simulator's gain per 100 cards per unit of `learn` is 0.033 for fast-guesser and 0.032 to 0.043 for the forget-1 personas (seed 1), so per card it learns like the others once its low `learn` is taken out. To gain 0.05 it would need about 300 cards in 28 days, 85% more than now.

The engine gives it about 9 effort per session against a hidden stamina of 18: engine stamina 10.5 / 10.0 / 10.8 at the end (seed 1 at HEAD: `D12 budget 8.0 st 12.3; D20 budget 8.0 st 11.9; D24 budget 8.0 st 11.9`), and 9 sessions per seed at the minimum budget of 8, 6 to 7 of them after a session with 2 or fewer right (change 3). Probes `fade.slowAnswers` 2 → 3, `staminaUpdate.extendStep` 1 → 2 and `budget.lowRight` 2 → 1 (on HEAD) moved its gain by 0.004 at most and were not kept. The gap is the simulated student's low learning rate plus the stamina estimate (change 9) and guess handling (change 12), which are not in this plan.

### Config numbers and rules changed

**Config:** none. No number moved a missed target without breaking a check or another target (probe tables above).

**Rule fixed (commit 4a1e616), change 1: a repair return straight after a miss.** Change 1 says a repair card is always easier than the card just failed and never a same-level card of the same skill straight after a miss. At HEAD, when a missed skill had no easier card and no neighbour with one, its repair had no piece and no confidence card and queued the return at once. If nothing else fit, the early-return path (the dead-end fix of 2026-11-15) served that return as the very next card, at the skill's recorded level. Seed 1 at HEAD:

```
average-noclass D10 S11 #1 phy.therm.c020 ideal-gas-equation L2 [open:liked] wrong
average-noclass D10 S11 #2 phy.therm.t04  ideal-gas-equation L3 [repair:return] I don't know
weak-stubborn   D24 S25 #2 phy.therm.c040 thermo.processes   L1 [open:easy]  wrong
weak-stubborn   D24 S25 #3 phy.therm.p01-06 thermo.processes L2 [repair:return] I don't know
```

Same-skill cards at or above the missed level straight after a miss (level-1 cards on another card excepted): 16 / 22 / 28 on seeds 1-3 at HEAD (5 of them a level higher), of which 2 / 3 / 3 are "5 more" cards and the rest `repair:return`. The `repair-steps-down` check looks at `repair:missing-piece` cards only, so it passed. Fix: in `normal()` a queued return whose skill is the one just missed is not served as the next card (both the timed and the early return). After: 0 `repair:return` cases; the 2 / 3 / 3 "5 more" cases remain (change 13, not in this plan).

Test: `tests/session.test.ts` "change 1: a return with no repair card before it is not served straight after the miss, at or above its level" (one started skill with no level-1 card and no neighbour with one; wrong open card). It failed before the fix (the second card was a1 at level 2) and passes after. No existing test changed. Unit tests 287 → 288.

### Options for the owner

| option | kind | evidence | expected effect |
|---|---|---|---|
| A. Accept that weak-impatient leaves in the simulator | decision | a session survives only with ≤ 1 miss before its last card; at 0.43 to 0.55 per card that needs 2-card sessions (59 to 82% on day 7) | no change; record target 2 as a sim-student limit |
| B. A first-session budget of its own (for example 3 for sessions 1-3 and after a near-zero day), separate from the minimum day | design + new config number | probe: weak-impatient stays to day 3 / 5 / 12; weak-stubborn gain 0.044 to 0.050 | target 2 on 1 of 3 seeds; costs weak-stubborn about 0.03 of gain |
| C. End the very first session after its first right answer | design | session 1 survives about 67% of the time (right first, or wrong then right), but session 2 is 8 effort again | alone, keeps it a day longer at most |
| D. Order the first cards by skills with 2 or more level-1 cards (so a miss can be repaired); 11 of 56 skills have them | design | in the simulator every fresh skill has the same chance, so no effect here; for a real student, a miss on c027 (one level-1 card, no easy prerequisite) gets no repair today | small in the sim; content-dependent in the app |
| E. Easy cards for the 16 skills that have none, and second easy cards (29 skills have exactly 1) | content (§3) | c027 had no repair card on seeds 1 and 3 | more repairs after an easy miss; also more winnable closers |
| F. Recap text when nothing was fixed | design / app text | 50 of 60 recap ends have no fixed skill | the recap needs a line for "nothing fixed today" (for example the session's right answers) |
| G. Near-zero-day rule and weak-stubborn | decision | weak-stubborn follows a session with 2 or fewer right in 16 to 20 of 28 sessions and is then at the minimum budget; gain 0.10 → 0.06 to 0.08 | keep (it is change 3 as accepted) or raise `budget.lowRightMinCards` / lower `budget.lowRight`; probe `lowRight` 1: weak-stubborn 0.081 / 0.076 / 0.076, fast-guesser unchanged |
| H. Stamina and guessing (changes 9 and 12) | next plan | fast-guesser engine stamina 10 to 13 against hidden 18 | more cards for fast-guesser; the only route to target 3 that does not change the sim |
| I. A persona that says "later" or "not learned yet" | sim | 2 to 3 section skips per seed | exercises section-skip timing in the simulator again |
| K. "5 more" serving the skill just missed | design (change 13) | 2 / 3 / 3 same-skill same-level "5 more" cards straight after a miss per seed | covered by change 13 in the next plan |
| J. Should a "too hard" skip on a ladder card move the ladder down? | design question | seed 2: ladder stayed at level 2 after the skip of c006, next card t09 (level 2) got "I don't know" | not a defect (row 4 speaks of misses); one card per case |

### What this run cannot show

- One seed family (1, 2, 3) of one simulator; the probes were run on the same three seeds.
- Simulated students. Their patience, learning rates and the "wrong teaches more than right" rule are model choices, and every fresh skill has the same hidden chance, so card order and content difficulty do not matter to them.
- The simulated students nearly always say "too hard", so section-skip timing (remind days, class timing, side doors) is exercised by unit tests only (2 to 3 section skips per seed, 1 to 2 side-door cards).
- No AI judges have seen the new behaviour yet (recaps, the ladder, stretch cards, card-level skips). The second judge pass needs the owner's go-ahead.

## After the final review fixes (2026-11-18)

The fix wave after the final whole-branch review of changes 1–7 (findings F1–F8). Runs: `runs/ff0-sN` (before: commit ecff8f2; byte-identical to `runs/c2-sN`) and `runs/f2-sN` (after F1–F6), 28 days, `--packs all`, seeds 1, 2, 3. A probe `runs/ffA-sN` is F1 alone. Numbers come from `node sim/tools/after-miss.mjs` (new, F8) and `node sim/tools/changes.mjs`.

**Outcome:** all 11 checks pass on all three seeds. No config number, `simParams` or persona changed. Rules changed: F1 (a waiting return comes early only in a true dead end; before that the most winnable card, then the sweep), F2 (`fixedSkills` names only repaired skills that were fixed; `fixed` is its length), F3 (new `EndInfo.rightSkills`, data only), F4 ("5 more" never uses a skill missed this session). Repair returns no longer arrive early on any seed. One thing got worse: binge-quit leaves the app on day 5 on seed 3 (cause below), so target 2 now fails for two personas on that seed.

### Checks (after)

Seed 1

| check | result | detail |
|---|---|---|
| no-end-on-wrong | PASS | 364 engine-ended sessions, none after a wrong answer |
| skip-timing | PASS | 3 skips, remind days on schedule, kept away until then and back by the cap |
| effort-cap-and-fairness | PASS | max day effort 26.5 ≤ 40; mean asked/day strong 13.67, weak-stubborn 8.16, weak-impatient 8.00 |
| no-repeat-14d | PASS | 2472 serves, no variant repeated within 14 days |
| ends-before-fade | PASS | worst share of days past hidden stamina 11% ≤ 20% |
| knowledge-up | PASS | 15 students kept practising, all ended above their day-0 knowledge; mean knowledge gain +0.052 |
| no-back-to-back-card | PASS | 2472 serves, no card again within 4 serves in a session |
| repair-steps-down | PASS | 95 missing-piece repair cards, each easier than the miss (or level 1 on another card) |
| no-long-zero-session | PASS | 390 sessions, none with 0 right over 5 cards |
| side-door-not-full | PASS | 2 side-door cards, none at level 3 |
| day-one-fit | PASS | 3 first sessions with 5 right in a row, each moved up to level 2 or 3 |

Seed 2

| check | result | detail |
|---|---|---|
| no-end-on-wrong | PASS | 375 engine-ended sessions, none after a wrong answer |
| skip-timing | PASS | 3 skips, remind days on schedule, kept away until then and back by the cap |
| effort-cap-and-fairness | PASS | max day effort 28.5 ≤ 40; mean asked/day strong 17.00, weak-stubborn 8.10, weak-impatient 8.00 |
| no-repeat-14d | PASS | 2555 serves, no variant repeated within 14 days |
| ends-before-fade | PASS | worst share of days past hidden stamina 14% ≤ 20% |
| knowledge-up | PASS | 15 students kept practising, all ended above their day-0 knowledge; mean knowledge gain +0.051 |
| no-back-to-back-card | PASS | 2555 serves, no card again within 4 serves in a session |
| repair-steps-down | PASS | 102 missing-piece repair cards, each easier than the miss (or level 1 on another card) |
| no-long-zero-session | PASS | 391 sessions, none with 0 right over 5 cards |
| side-door-not-full | PASS | 2 side-door cards, none at level 3 |
| day-one-fit | PASS | 3 first sessions with 5 right in a row, each moved up to level 2 or 3 |

Seed 3

| check | result | detail |
|---|---|---|
| no-end-on-wrong | PASS | 359 engine-ended sessions, none after a wrong answer |
| skip-timing | PASS | 3 skips, remind days on schedule, kept away until then and back by the cap |
| effort-cap-and-fairness | PASS | max day effort 34.5 ≤ 40; mean asked/day strong 13.41, weak-stubborn 8.22, weak-impatient 8.00 |
| no-repeat-14d | PASS | 2345 serves, no variant repeated within 14 days |
| ends-before-fade | PASS | worst share of days past hidden stamina 7% ≤ 20% |
| knowledge-up | PASS | 14 students kept practising, all ended above their day-0 knowledge; mean knowledge gain +0.047 |
| no-back-to-back-card | PASS | 2345 serves, no card again within 4 serves in a session |
| repair-steps-down | PASS | 100 missing-piece repair cards, each easier than the miss (or level 1 on another card) |
| no-long-zero-session | PASS | 381 sessions, none with 0 right over 5 cards |
| side-door-not-full | PASS | 2 side-door cards, none at level 3 |
| day-one-fit | PASS | 5 first sessions with 5 right in a row, each moved up to level 2 or 3 |

knowledge-up counts 14 students on seed 3 (15 before): binge-quit left the app on day 5.

### What follows a miss (F8), before → after

`sameSkillNext`: misses (wrong or "I don't know") whose next answered card is on the same skill at or above the missed level, any reason. `early returns`: `repair:return` cards with fewer than 4 other cards (answered or skipped) since the last miss on that skill in the session.

| seed | misses | sameSkillNext | of which | early returns |
|---|---|---|---|---|
| 1 | 510 → 524 | 18 → 15 | missing-piece after a level-1 miss 14 → 11; close:winnable after a level-1 miss 2 → 4; "5 more" after a level-2 miss 2 → 0 | 15 → 0 |
| 2 | 529 → 524 | 28 → 26 | missing-piece 18 → 21; close:winnable 5 → 5; "5 more" 5 → 0 | 14 → 0 |
| 3 | 491 → 508 | 17 → 14 | missing-piece 13 → 12; close:winnable 1 → 2; "5 more" 3 → 0 | 7 → 0 |

The missing-piece cards left are level-1 misses repaired with a different level-1 card of the same skill (change 1 allows that). The close:winnable cards left are closing cards on the skill just missed at level 1 (the easiest card that day was on that skill). "5 more" cards on a skill missed earlier in the session: 10 / 10 / 8 → 0 / 0 / 0.

**Recommendation for the owner: widen `repair-steps-down`** (not done here, per the review ruling). Two checks would have caught Task 9 and F1: (a) after a miss, the next answered card is not on the same skill at or above the missed level, except a missing-piece card at level 1 after a level-1 miss; (b) every `repair:return` comes after at least 4 other cards since the miss, unless nothing else could be served (the dead-end case, which never occurs in these runs). (b) passes today; (a) would flag the 2 to 5 closing cards per seed above, which is a design question (is a level-1 closing card on the skill just missed at level 1 acceptable?) before it is a defect.

### Repair returns

| seed | returns before → after | arriving early before → after | right, on time (before) | right, early (before) | right after (all on time) |
|---|---|---|---|---|---|
| 1 | 20 → 15 | 15 (75%) → 0 | 3 / 5 (60%) | 7 / 15 (47%) | 8 / 15 (53%) |
| 2 | 25 → 30 | 14 (56%) → 0 | 8 / 11 (73%) | 5 / 14 (36%) | 23 / 30 (77%) |
| 3 | 16 → 17 | 7 (44%) → 0 | 8 / 9 (89%) | 5 / 7 (71%) | 12 / 17 (71%) |

Over the three seeds: 61 returns, 36 early (59%), right 47% early (17 / 36) against 76% on time (19 / 25), before; 62 returns, none early, right 69%, after. (The review counted 37 of 61, right 49% early; this tool counts a skipped card as one of the other cards.)

### Recap ends with nothing fixed (F2, F3)

| seed | recap ends before → after | empty `fixedSkills` before → after | of those, a skill answered right that session (`rightSkills` not empty) before → after |
|---|---|---|---|
| 1 | 22 → 23 | 19 → 22 | 8 → 18 |
| 2 | 24 → 12 | 21 → 12 | 14 → 8 |
| 3 | 14 → 17 | 10 → 17 | 7 → 14 |

After F2 a recap names a fixed skill only once in 52 recap ends (on seed 1): a closing card is missed mostly in sessions where no repair worked. 40 of the 51 recaps with nothing fixed have at least one skill answered right that day, which `rightSkills` now carries (the "before" column is counted from the log). What the screen says then is an open product decision (README).

### Personas, before → after (seeds 1 / 2 / 3)

| persona | sessions | cards/s | success | gain | recap ends |
|---|---|---|---|---|---|
| weak-stubborn | 28 / 28 / 28 → 28 / 28 / 28 | 5.3 / 5.0 / 4.8 → 5.8 / 5.5 / 5.4 | 35% / 32% / 43% → 35% / 36% / 38% | 0.076 / 0.071 / 0.062 → 0.086 / 0.079 / 0.076 | 11 / 14 / 9 → 14 / 10 / 10 |
| weak-impatient | 2 / 3 / 2 → 2 / 3 / 2 | 3.0 / 4.7 / 4.0 → 3.0 / 4.7 / 4.0 | 33% / 57% / 50% → same | -0.001 / 0.000 / -0.003 → same | 0 / 0 / 0 → 0 / 0 / 0 |
| fast-guesser | 28 / 28 / 28 → 28 / 28 / 28 | 5.9 / 5.6 / 5.5 → 5.9 / 6.3 / 6.1 | 62% / 63% / 64% → 62% / 69% / 63% | 0.027 / 0.032 / 0.029 → 0.027 / 0.032 / 0.032 | 6 / 5 / 4 → 4 / 1 / 3 |
| strong | 28 / 28 / 28 → 28 / 28 / 28 | 7.1 / 8.4 / 7.0 → 7.4 / 9.8 / 7.1 | 96% / 95% / 92% → 95% / 94% / 92% | 0.034 / 0.040 / 0.037 → 0.036 / 0.047 / 0.035 | 0 / 0 / 0 → 0 / 0 / 1 |
| average-noclass | 28 / 28 / 28 → 28 / 28 / 28 | 6.5 / 6.4 / 6.5 → 6.6 / 5.7 / 6.4 | 77% / 78% / 81% → 77% / 81% / 80% | 0.078 / 0.078 / 0.077 → 0.074 / 0.060 / 0.075 | 1 / 0 / 0 → 1 / 0 / 0 |

weak-impatient's logs are unchanged: it walks out before any of the changed paths is reached.

### Targets

| target | seed 1 | seed 2 | seed 3 |
|---|---|---|---|
| 1. all 11 checks pass | met | met | met |
| 2. no persona quits the app before day 7 | missed (weak-impatient, day 1) | missed (weak-impatient, day 2) | missed (weak-impatient day 1; binge-quit day 5, new) |
| 3. no persona with prior ≤ 0.3 that keeps practising gains < 0.05 | missed (fast-guesser +0.027) | missed (fast-guesser +0.032) | missed (fast-guesser +0.032) |
| 4. weak effort per session not above strong's | met (weak-stubborn 8.7, weak-impatient 5.0 vs strong 14.5) | met (8.5, 6.3 vs 19.2) | met (8.2, 6.0 vs 14.3) |

weak-stubborn meets target 3 on every seed (+0.086 / +0.079 / +0.076, up from +0.076 / +0.071 / +0.062).

### What got worse

- **binge-quit, seed 3, leaves the app on day 5** (before: never; gain +0.054 → 0.000, 11 sessions instead of 20). Cause, from the log: on day 4, session 10, a miss on cell combinations (level 2, no repair card, so its return is queued at once) is followed, per F1, by three easy cards of other skills, then a stretch card (missed) and the on-time return (missed): three misses in the session and the student walks out (its hidden patience is 3 misses). On day 5, session 11, a miss on moment balance (level 2, again no repair card) is followed by the most winnable card that fits, per F1; no level-1 card is left unseen for this binger after 5 heavy days, so it is a level-2 card of another skill (missed), then another (missed): three misses, the second walk-out in a row, and the student leaves. In the same state the code before F1 went to the closing card after the first miss (a closing card may repeat a card answered right; normal picks may not). F1 alone (`runs/ffA-s3`) gives the same quit, so it is F1, as ruled, not F2–F4. It is not a defect in the ruling as written: the "most winnable" card here is a level-2 card because the level-1 cards are used up. An owner option: let the F1 pick repeat a card answered right long enough ago (as the closing card may) when nothing at level 1 is left.
- F1 also covers sessions with no waiting return: when the budget left is too small for the next middle card, an easy card that fits now comes before closing (the unit test "all right at height 2" now ends after 7 cards, effort 10, not 6 cards, effort 9). Cards per session rise for most personas (average-fastclass 5.8 / 5.4 / 5.8 → 6.8 / 6.8 / 5.6). A probe that applied F1 only while a return is waiting gave the same binge-quit quit and nearly the same per-persona numbers.
- Gains down by more than 0.005 on some seeds: average-noclass seed 2 (0.078 → 0.060), confident-misconceptions (0.066 / 0.064 / 0.056 → 0.054 / 0.053 / 0.051), calc-strong-memory-poor seed 3 (0.012 → 0.003), steady-five-min seeds 2 and 3, underconfident-skipper seed 3. Up by more than 0.005: average-fastclass seeds 1 and 2, weak-stubborn (all seeds), binge-quit seed 1, strong seed 2, comeback-10 seed 3 (seed 2 down 0.036 → 0.030), steady-five-min seed 1, one-feared-section seed 2. Mean gain over the students who kept practising: +0.051 / +0.052 / +0.048 → +0.052 / +0.051 / +0.047.
- A return on seed 1 is right 53% of the time on time (60% before, on 5 returns); on all seeds together on-time returns are right 69% against 76% before (25 → 62 on-time returns).
- More recaps have nothing fixed (50 of 60 before, 51 of 52 after): F2 counts only repairs that worked, which is the ruling.

## After the after-miss guard (2026-11-18)

Ruling (owner: "add the guard"): in `normal()`'s branch after pickMiddle, while a repair return is waiting (strict pickMiddle empty, loose not), straight after a miss (wrong or "I don't know"), the most winnable card (`comfort-correction`) or the sweep card (`fallback:any`) is served only when it is below the missed card's level; otherwise the session goes to closing (`toClosing`), as before F1. After a right answer, and in the true dead end (early return), nothing changes. Runs: `runs/g4-s1..3` (28 days, all packs) against `runs/f2-s1..3` (section above). All 11 checks pass on seeds 1, 2, 3.

### binge-quit and early quits

binge-quit no longer leaves the app: seed 3 quit day 5 → none (14 days, 20 sessions, gain 0.000 → +0.041; 80% right). Seeds 1 and 2 unchanged (no quit, same persona numbers). The only persona quitting before day 7 is weak-impatient (day 1 / 2 / 1, unchanged). knowledge-up counts 15 students on every seed again; mean gain +0.052 / +0.051 / +0.047 → +0.051 / +0.052 / +0.046.

### Personas, f2 → g4 (seeds 1 / 2 / 3)

| persona | cards/s | success | gain | recap ends |
|---|---|---|---|---|
| weak-stubborn | 5.8 / 5.5 / 5.4 → 5.1 / 5.3 / 4.9 | 35% / 36% / 38% → 37% / 36% / 42% | 0.086 / 0.079 / 0.076 → 0.070 / 0.073 / 0.061 | 14 / 10 / 10 → 9 / 11 / 11 |
| binge-quit | 7.2 / 8.8 / 8.3 → 7.2 / 8.8 / 7.6 | 80% / 80% / 78% → 80% / 80% / 80% | 0.059 / 0.065 / 0.000 → 0.059 / 0.065 / 0.041 | 0 / 0 / 0 → 0 / 0 / 0 |
| strong | 7.4 / 9.8 / 7.1 → same | 95% / 94% / 92% → same | 0.036 / 0.047 / 0.035 → same | 0 / 0 / 1 → 0 / 0 / 1 |

weak-stubborn pays for the guard: sessions after a miss now close instead of serving another level-2 card, so about half a card fewer per session and a lower gain (still above 0.05 on every seed, target 3 met).

### What follows a miss (after-miss.mjs), f2 → g4

| seed | misses | sameSkillNext | of which | early returns | returns (right, on time) |
|---|---|---|---|---|---|
| 1 | 524 → 504 | 15 → 18 | missing-piece after a level-1 miss 11 → 16; close:winnable after a level-1 miss 4 → 2 | 0 → 0 | 15 (8) → 15 (8) |
| 2 | 524 → 526 | 26 → 27 | missing-piece 21 → 24; close:winnable 5 → 3 | 0 → 0 | 30 (23) → 26 (20) |
| 3 | 508 → 501 | 14 → 16 | missing-piece 12 → 13; close:winnable 2 → 3 | 0 → 0 | 17 (12) → 15 (11) |

None of the same-skill-next cards is a comfort-correction or sweep card. Counted from the logs (not by the tool): a `comfort-correction` / `fallback:any` card at or above the missed level as the next card after a miss, on any skill: 88 / 86 / 95 → 64 / 81 / 86. The ones left come from pickMiddle's correcting mode (a not-due started skill at its own level when it has no lower card) and from the branch when no return is waiting; the guard does not touch them, per the ruling.

### Recap ends

| seed | recap ends | empty `fixedSkills` | of those, `rightSkills` not empty |
|---|---|---|---|
| 1 | 23 → 17 | 22 → 16 | 18 → 9 |
| 2 | 12 → 15 | 12 → 15 | 8 → 12 |
| 3 | 17 → 17 | 17 → 17 | 14 → 14 |

Over the three seeds 48 of 49 recap ends have nothing fixed (51 of 52 before); 35 of those 48 have a skill answered right that session.
