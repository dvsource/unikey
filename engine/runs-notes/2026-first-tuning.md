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
