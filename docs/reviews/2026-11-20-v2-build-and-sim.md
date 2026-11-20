# Sample-v2 build and study-loop comparison

The comparison uses the three original v1 pack files from `a4e28e5` and the three built sample-v2 packs. The original v1 files have no embedded `note_ref`. The simulator reads only metadata present in each bundle. All 11 reported L4-to-L2 changes are deliberate. All six packs passed their build checks. In 28-day simulations, v1 passed 36 of 36 checks and v2 passed 35 of 36.

## Published layers

The unit validators count effective variants after filtering. For numeric templates, variants with the same rounded ratios of options to the answer count once. For non-fraction F41 symbolic templates, each surviving variant counts. A template with fewer than 20 effective variants becomes an L2 pool. An ascending template also becomes L2 if its most frequent correct-answer position exceeds 60%. The validators write the resulting layer to `variants.json`, and the app builder copies it. All 11 templates meet the first condition in both editions. [Authoring spec, V7 and V8](../living/content-authoring.md#6-template-constraints-automated-all-must-pass) · [Validator implementation](../../content/samples/mechanics-20/validate.py)

| Unit | Template and effective variant count, identical in v1 and v2 |
|---|---|
| Mechanics | t02 (5), t06 (1), t09 (2), t10 (16), t14 (7), t15 (5) |
| Thermal Physics | t01 (16), t06 (4) |
| Current Electricity | t04 (11), t06 (11), t07 (10) |

The parity test computes the effective count from each variant’s values and checks the published form against the source. It rejects a false L4 for Mechanics t09 even when the bank claims 28 effective variants. It also rejects a false L2 for t13 when the bank claims one. The position test covers an ascending template marked exempt during filtering. All three committed baseline v1 packs match the Git blobs at `a4e28e5` byte for byte. A fresh build matches those bytes after replacing only the timestamp. [Build parity test](../../app/__tests__/pack-editions.test.ts) · [Simulator loader tests](../../engine/tests/pack-set.test.ts)

## Engine input

The simulator reads the built layer. L1 and L2 true/false cards map to height 1, other L2 and L3 cards map to height 2, and L4 maps to height 3. The counts below are from the shipped JSON after applying the engine exclusion list.

| Unit | V2 built items | Height 1 | Height 2 | Height 3 | Eligible items |
|---|---:|---:|---:|---:|---:|
| Mechanics | 98 | 23 | 64 | 11 | 98 |
| Thermal Physics | 73 | 22 | 40 | 10 | 72 |
| Current Electricity | 86 | 24 | 50 | 12 | 86 |
| **Total** | **257** | **69** | **154** | **33** | **256** |

All 257 items have a resolvable primary skill, note reference, supported layer, form and variants. Every variant has exactly one correct option and every wrong option has an error tag. All eligible heights are in 1–3. The engine indexes the primary skill for each card. The three graphs also describe 119 skills outside the 56 sampled skills, which have no cards in this edition. Text, explanations and figures are displayed by the app. The simulated student uses the option keys, error tags and engine metadata.

The engine excludes `phy.therm.c043` by ID in both editions. The v2 stem now states its own conditions for an unlagged copper bar, but the existing exclusion still applies. The repair-coverage tool was absent from the requested main revision, so there is no built-level repair audit in this comparison. [Engine content mapping](../../engine/src/content.ts) · [Exclusion](../../engine/src/config.ts)

## Persona results

Each cell gives base v1 / sample-v2 across seeds 1, 2 and 3. Knowledge gain is the mean change in modeled knowledge from day 0 to the end. Success is total correct divided by answered cards, including “I don’t know” as a miss. Served counts include answered, skipped and quit-on cards. A skip confirmation refers to the same card and is counted once. Full right is the number of correct answers to height-3 problems. Repairs include all served reasons beginning with `repair:`. Exhausted counts session endings due to exhausted content. Quit day is the zero-based day the persona quit the app, in seed order.

| Persona | Knowledge gain | Success | Easy served | Guided served | Full served | Full right | Repairs served | Exhausted | Quit day |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|
| average-fastclass | +0.0712 / +0.0701 | 80.8% / 79.4% | 209 / 218 | 320 / 289 | 19 / 16 | 6 / 4 | 28 / 36 | 0 / 0 | none |
| average-noclass | +0.0682 / +0.0716 | 79.4% / 78.8% | 203 / 230 | 299 / 287 | 14 / 15 | 3 / 4 | 28 / 41 | 0 / 0 | none |
| binge-quit | +0.0517 / +0.0597 | 78.8% / 81.8% | 205 / 238 | 240 / 243 | 9 / 13 | 4 / 5 | 31 / 46 | 0 / 0 | none |
| calc-strong-memory-poor | +0.0181 / +0.0127 | 76.3% / 79.2% | 221 / 230 | 303 / 249 | 4 / 27 | 1 / 24 | 24 / 34 | 0 / 0 | none |
| comeback-10 | +0.0367 / +0.0411 | 79.4% / 80.1% | 141 / 156 | 192 / 189 | 10 / 15 | 1 / 5 | 24 / 32 | 0 / 0 | none |
| confident-misconceptions | +0.0597 / +0.0576 | 79.2% / 78.6% | 225 / 262 | 310 / 263 | 12 / 18 | 2 / 5 | 20 / 43 | 0 / 0 | none |
| fast-guesser | +0.0296 / +0.0344 | 65.5% / 72.0% | 336 / 399 | 189 / 255 | 0 / 0 | 0 / 0 | 25 / 60 | 0 / 0 | none |
| memory-good-calc-weak | +0.0686 / +0.0667 | 89.4% / 92.1% | 110 / 92 | 386 / 431 | 46 / 41 | 0 / 0 | 25 / 26 | 0 / 0 | none |
| one-feared-section | +0.0579 / +0.0547 | 80.3% / 81.2% | 175 / 179 | 325 / 323 | 27 / 27 | 10 / 8 | 28 / 48 | 0 / 0 | none |
| slow-reader | +0.0554 / +0.0565 | 81.2% / 80.3% | 165 / 194 | 284 / 259 | 19 / 23 | 2 / 13 | 17 / 37 | 0 / 0 | none |
| smart-impatient | +0.0221 / +0.0235 | 94.3% / 92.4% | 52 / 62 | 157 / 160 | 20 / 16 | 14 / 9 | 3 / 10 | 0 / 0 | none |
| steady-five-min | +0.0694 / +0.0745 | 77.7% / 79.4% | 200 / 221 | 287 / 309 | 28 / 6 | 12 / 0 | 30 / 46 | 0 / 0 | none |
| strong | +0.0394 / +0.0360 | 94.5% / 94.1% | 75 / 84 | 468 / 431 | 132 / 116 | 108 / 93 | 18 / 18 | 0 / 0 | none |
| underconfident-skipper | +0.0315 / +0.0317 | 88.4% / 88.3% | 99 / 112 | 354 / 359 | 35 / 38 | 0 / 0 | 25 / 45 | 0 / 0 | none |
| weak-impatient | -0.0010 / -0.0025 | 50.0% / 50.0% | 32 / 32 | 3 / 3 | 0 / 0 | 0 / 0 | 6 / 4 | 0 / 0 | 1, 2, 1 / 1, 2, 1 |
| weak-stubborn | +0.0682 / +0.0687 | 38.3% / 41.1% | 326 / 415 | 100 / 60 | 2 / 0 | 0 / 0 | 35 / 54 | 0 / 0 | none |
| **All personas** | +0.0467 / +0.0473 | 78.9% / 79.6% | 2774 / 3124 | 4217 / 4110 | 377 / 371 | 163 / 170 | 367 / 580 | 0 / 0 | see above |

V2 served 213 more repair cards and 350 more easy cards. The fast-guesser’s success rose from 65.5% to 72.0%. Full problems shifted between personas. The calculation-strong, memory-poor persona answered 24 full problems correctly in v2 versus one in v1, while the steady five-minute persona answered zero versus twelve. These are modeled outcomes across three seeds.

## Template share and skill gain

Each fraction is serves of the most-served template divided by all answered cards across the three seeds. Serves include skip and quit events. Each template ID includes all its variants and published levels. Tied IDs share the displayed numerator. The skill counts compare final hidden knowledge with the starting value for each of 56 skills in each seed. Each row totals 168 skill observations per edition. Every zero delta in these runs belonged to a skill with no answered card.

| Persona | Base v1 top template (serves/answers, share) | V2 top template (serves/answers, share) | Base v1 up / down / untouched | V2 up / down / untouched |
|---|---|---|---:|---:|
| average-fastclass | phy.therm.t01 (40/542, 7.4%) | phy.elec.t06 (51/519, 9.8%) | 91 / 19 / 58 | 89 / 8 / 71 |
| average-noclass | phy.mech.t02 (33/514, 6.4%) | phy.therm.t01 (44/529, 8.3%) | 95 / 11 / 62 | 106 / 10 / 52 |
| binge-quit | phy.mech.t02 (30/449, 6.7%) | phy.therm.t01 (35/488, 7.2%) | 73 / 39 / 56 | 82 / 24 / 62 |
| calc-strong-memory-poor | phy.therm.t01 (53/528, 10.0%) | phy.elec.t06 (33/506, 6.5%) | 55 / 55 / 58 | 59 / 53 / 56 |
| comeback-10 | phy.mech.t02 (28/340, 8.2%) | phy.therm.t01 (28/357, 7.8%) | 56 / 10 / 102 | 62 / 4 / 102 |
| confident-misconceptions | phy.mech.t09 (38/547, 6.9%) | phy.elec.t06 (24/543, 4.4%) | 102 / 13 / 53 | 113 / 17 / 38 |
| fast-guesser | phy.mech.t02 (36/525, 6.9%) | phy.mech.t14 (44/654, 6.7%) | 94 / 53 / 21 | 95 / 70 / 3 |
| memory-good-calc-weak | phy.therm.t01 (32/520, 6.2%) | phy.therm.t01 (49/543, 9.0%) | 87 / 0 / 81 | 90 / 0 / 78 |
| one-feared-section | phy.mech.t02 (27/512, 5.3%) | phy.therm.t01 (44/504, 8.7%) | 88 / 12 / 68 | 75 / 7 / 86 |
| slow-reader | phy.mech.t02 (30/464, 6.5%) | phy.elec.t06 (49/473, 10.4%) | 80 / 11 / 77 | 77 / 26 / 65 |
| smart-impatient | phy.elec.t06, phy.mech.t03 (11/228, 4.8%) | phy.therm.t01 (18/237, 7.6%) | 54 / 0 / 114 | 48 / 0 / 120 |
| steady-five-min | phy.mech.t02 (36/512, 7.0%) | phy.elec.t06 (40/534, 7.5%) | 101 / 14 / 53 | 100 / 8 / 60 |
| strong | phy.elec.t06 (77/675, 11.4%) | phy.elec.t06 (44/631, 7.0%) | 108 / 0 / 60 | 90 / 0 / 78 |
| underconfident-skipper | phy.elec.t06 (63/473, 13.3%) | phy.mech.t09 (70/488, 14.3%) | 70 / 3 / 95 | 75 / 2 / 91 |
| weak-impatient | phy.mech.t09, phy.therm.t01 (1/28, 3.6%) | none (0/28, 0%) | 9 / 8 / 151 | 7 / 13 / 148 |
| weak-stubborn | phy.mech.t02 (20/428, 4.7%) | phy.therm.t06 (3/475, 0.6%) | 122 / 2 / 44 | 167 / 1 / 0 |

## For the engine owner

On v2 seed 3, `calc-strong-memory-poor` answered `phy.therm.t04` 19 times in 143 answers (13.3%). All 19 were correct. The reasons were 16 `open:liked`, two `due-review` and one `extend:liked`. Across its 56 skills, 17 improved, 19 declined and 20 went untouched. Of 100 paired 28-day seeds (1 through 100), this persona finished at or below its starting mean on 8/100 with base v1 and 13/100 with v2.

Should an opening card chosen because the student likes it keep returning to one successful template while other practiced skills lose ground? The seed-3 log and the wider sweep leave that question open. [Simulator selection and logging](../../engine/sim/run.ts) · [Knowledge check](../../engine/sim/checks.ts)

## Checks and reproduction

| 28-day seed | V1 | V2 |
|---:|---:|---:|
| 1 | 12/12 | 12/12 |
| 2 | 12/12 | 12/12 |
| 3 | 12/12 | 11/12 |

The only failure was `knowledge-up` for `calc-strong-memory-poor` on v2 seed 3. Its modeled knowledge started at 0.500000, reached 0.518675 on day 14 and ended at 0.499927 after 28 days played. The check requires a strictly positive individual gain. The same persona finished v1 seed 3 at 0.510679. The check output rounds both v2 endpoints to 0.500. A positive three-seed average for the persona does not resolve this seed’s failure.

All three unit validators passed for both source editions against the local question database and glossary. Regenerating the pack inputs and teacher worksheets in a temporary checkout produced byte-identical output. App tests validated both editions’ actual bundle contents, including generated variant keys, Sinhala text, figures, error tags and play order. The app passed 149 Jest tests and the engine passed 343 Vitest tests. Both TypeScript checks passed.

Use comparison revision `2747fd6` in a separate checkout to reproduce the main tables with the original v1 files. From the repository root, build with `node app/scripts/build-content.mjs` and `node app/scripts/build-content.mjs --pack-set v2`. The app starts with v1. From the engine directory run the following. Seed 3 on v2 writes its logs and returns exit status 1 for the failed check.

```sh
for edition in v1 v2; do
  for seed in 1 2 3; do
    label="$edition"
    if [ "$edition" = v1 ]; then label=base-v1; fi
    npm run sim -- --days 28 --seed "$seed" --pack-set "$edition" --packs all --out "runs/fix-$label-s$seed"
  done
done
```

Each run directory contains per-persona logs and summaries plus `checks.json`. The [app README](../../app/README.md#content) and [engine README](../../engine/README.md#running-it) describe the edition switch.

## V1 packs gain `note_ref`

Comparison revision `2747fd6` preserves all three original v1 Git blobs from `a4e28e5`, including their timestamps. The final commit embeds the source note reference in 91 Mechanics items, 68 Thermal items and 82 Electricity items. Removing exactly those 241 fields and normalizing only `built_at` reproduces the base bytes. The bundled v1 engine index now equals the original loader’s index, which read the same references from source.

I reran all 16 personas for 28 days with the same three seeds at both revisions. All 48 pairs of event logs, all 48 pairs of summaries and all three pairs of check files were byte-identical. The mean knowledge gain across personas and seeds was +0.0466713060 in both runs.

| Seed | Repairs without notes | Repairs with notes | Checks without notes | Checks with notes |
|---:|---:|---:|---:|---:|
| 1 | 121 | 121 | 12/12 | 12/12 |
| 2 | 127 | 127 | 12/12 | 12/12 |
| 3 | 119 | 119 | 12/12 | 12/12 |
| **Total** | **367** | **367** | **36/36** | **36/36** |

Knowledge gains are listed in seed order 1, 2, 3. The last column gives the change in the three-seed mean.

| Persona | V1 without notes | V1 with notes | Mean change |
|---|---|---|---:|
| average-fastclass | +0.07477, +0.07820, +0.06060 | +0.07477, +0.07820, +0.06060 | +0.00000 |
| average-noclass | +0.06499, +0.06343, +0.07613 | +0.06499, +0.06343, +0.07613 | +0.00000 |
| binge-quit | +0.04660, +0.06463, +0.04402 | +0.04660, +0.06463, +0.04402 | +0.00000 |
| calc-strong-memory-poor | +0.02288, +0.02088, +0.01068 | +0.02288, +0.02088, +0.01068 | +0.00000 |
| comeback-10 | +0.03865, +0.03690, +0.03460 | +0.03865, +0.03690, +0.03460 | +0.00000 |
| confident-misconceptions | +0.05415, +0.06460, +0.06023 | +0.05415, +0.06460, +0.06023 | +0.00000 |
| fast-guesser | +0.03249, +0.02556, +0.03061 | +0.03249, +0.02556, +0.03061 | +0.00000 |
| memory-good-calc-weak | +0.06453, +0.07212, +0.06903 | +0.06453, +0.07212, +0.06903 | +0.00000 |
| one-feared-section | +0.05605, +0.05582, +0.06181 | +0.05605, +0.05582, +0.06181 | +0.00000 |
| slow-reader | +0.05546, +0.05762, +0.05327 | +0.05546, +0.05762, +0.05327 | +0.00000 |
| smart-impatient | +0.02403, +0.02209, +0.02025 | +0.02403, +0.02209, +0.02025 | +0.00000 |
| steady-five-min | +0.07143, +0.07088, +0.06595 | +0.07143, +0.07088, +0.06595 | +0.00000 |
| strong | +0.03469, +0.04124, +0.04221 | +0.03469, +0.04124, +0.04221 | +0.00000 |
| underconfident-skipper | +0.02837, +0.03435, +0.03178 | +0.02837, +0.03435, +0.03178 | +0.00000 |
| weak-impatient | -0.00078, +0.00041, -0.00258 | -0.00078, +0.00041, -0.00258 | +0.00000 |
| weak-stubborn | +0.07048, +0.07346, +0.06066 | +0.07048, +0.07346, +0.06066 | +0.00000 |

To reproduce the with-notes runs, execute this command block from `engine/` at the final commit. Use the comparison revision above for the without-notes runs.

```sh
for seed in 1 2 3; do
  npm run sim -- --days 28 --seed "$seed" --pack-set v1 --packs all --out "runs/fix-noted-v1-s$seed"
done
```
