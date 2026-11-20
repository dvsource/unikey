# Sample-v2 build and study-loop comparison

Built at `78e7d95` from local main `a4e28e5`. All 11 reported L4-to-L2 changes are deliberate. All six packs passed their build checks. In 28-day simulations, v1 passed 36 of 36 checks and v2 passed 35 of 36.

## Published layers

The unit validators count effective variants after filtering. Variants that merely rescale the same set of answers count once. A template with fewer than 20 effective variants becomes an L2 pool. An ascending template also becomes L2 if it lacks a position exemption and its most frequent correct-answer position exceeds 60%. The validators write the resulting layer to `variants.json`, and the app builder copies it. All 11 templates meet the first condition in both editions. [Authoring spec, V7 and V8](../living/content-authoring.md#6-template-constraints-automated-all-must-pass) · [Validator implementation](../../content/samples/mechanics-20/validate.py)

| Unit | Template and effective variant count, identical in v1 and v2 |
|---|---|
| Mechanics | t02 (5), t06 (1), t09 (2), t10 (16), t14 (7), t15 (5) |
| Thermal Physics | t01 (16), t06 (4) |
| Current Electricity | t04 (11), t06 (11), t07 (10) |

The parity test checks every published form against the authored form. It checks every published layer against the authored layer after applying those two documented rules. It also compares each freshly built pack with the committed pack, apart from its build timestamp. Note references now travel in the built item for cards, pool scenarios, templates and banks. The simulator reads them from the selected edition. A regression test compares the entire v1 engine content index with the previous source-assisted loader. [Build parity test](../../app/__tests__/pack-editions.test.ts) · [Simulator loader tests](../../engine/tests/pack-set.test.ts)

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

Each cell gives v1 / v2 across seeds 1, 2 and 3. Knowledge gain is the mean change in modeled knowledge from day 0 to the end. Success is total correct divided by answered cards, including “I don’t know” as a miss. Served counts include answered, skipped and quit-on cards. A skip confirmation refers to the same card and is counted once. Full right is the number of correct answers to height-3 problems. Repairs include all served reasons beginning with `repair:`. Exhausted counts session endings due to exhausted content. Quit day is the zero-based day the persona quit the app, in seed order.

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

## Checks and reproduction

| 28-day seed | V1 | V2 |
|---:|---:|---:|
| 1 | 12/12 | 12/12 |
| 2 | 12/12 | 12/12 |
| 3 | 12/12 | 11/12 |

The only failure was `knowledge-up` for `calc-strong-memory-poor` on v2 seed 3. Its modeled knowledge started at 0.500000, reached 0.518675 on day 14 and ended at 0.499927 after 28 days played. The check requires a strictly positive individual gain. The same persona finished v1 seed 3 at 0.510679. The check output rounds both v2 endpoints to 0.500. A positive three-seed average for the persona does not resolve this seed’s failure.

All three sample-v2 source validators passed against the local question database and glossary. Regenerating the pack inputs and teacher worksheets in a temporary checkout produced byte-identical output. App tests validated both editions’ actual bundle contents, including generated variant keys, Sinhala text, figures, error tags and play order. The app passed 146 Jest tests and the engine passed 342 Vitest tests. Both TypeScript checks passed.

From the repository root, build with `node app/scripts/build-content.mjs` and `node app/scripts/build-content.mjs --pack-set v2`. The app starts with v1. From the engine directory run the following. Seed 3 on v2 writes its logs and returns exit status 1 for the failed check.

```sh
for edition in v1 v2; do
  for seed in 1 2 3; do
    npm run sim -- --days 28 --seed "$seed" --pack-set "$edition" --packs all --out "runs/build-$edition-s$seed"
  done
done
```

Each run directory contains per-persona logs and summaries plus `checks.json`. The [app README](../../app/README.md#content) and [engine README](../../engine/README.md#running-it) describe the edition switch.
