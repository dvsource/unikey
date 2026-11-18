# Sinhala A/L Physics sample v2

These three bilingual packs contain 257 authored items covering 56 sampled skills. Start with the teacher worksheets to read the Sinhala alongside the English, inspect the diagrams, and check the marked answers.

| Unit | Worksheet | Items | Revised from v1 | New easy questions |
|---|---|---:|---:|---:|
| Mechanics | [Review questions](mechanics-20/review.md) | 98 | 12 | 7 |
| Thermal Physics | [Review questions](thermal-physics-20/review.md) | 73 | 29 | 5 |
| Current Electricity | [Review questions](current-electricity-20/review.md) | 86 | 11 | 4 |

## What to look at first

- **Mechanics c026** now specifies an oblique launch. At the highest point only the vertical component vanishes. Compare **c045**, which asks about a vertical throw, where the instantaneous speed really does reach zero.
- **Thermal Physics c024 and c026** distinguish the mean squared speed, ⟨c²⟩, from the square of the mean speed. **c003 and b01** describe whether a reading is above or below the true value. **c011** accounts for the energy needed to bring the ice to its melting point before deciding how much melts.
- **Current Electricity c038** asks for the magnitude of induced emf and explains the sign convention separately. **c029** asks which nodes the meter leads reach. **p01-03 and p01-04** give the order of both bridge arms so that a student can establish balance from the question alone.

The added recall questions supply an easy starting point for every sampled skill. Original item IDs and past-paper references carry forward. Revised items have version 2. New cards start at version 1 with fresh IDs. All items retain draft status for Sinhala-medium teacher review.

## Data and checks

Each unit’s `items.json` is its editable source. The accompanying `si.tsv` supplies translation fallbacks. The unit worksheets, example diagrams and `variants.json` can be regenerated from the repository root with the project’s existing per-unit validators:

```sh
python3 content/sample-v2/validate.py
```

The validators read the local ALPhysics question database and glossary from their existing project locations. The [v2 pack manifest](content-packs.json) uses the app builder’s existing format and distinct pack IDs. It was exercised with a temporary copy of the app builder. The live app still selects its packs via its own manifest.

For this edition all three unit validators passed. An independent recalculation checked the 2,649 numerical variants, including the admissible interval in the resultant-force family. A separate comparison matched all 174 generated statement combinations to the marked Sinhala statements. These checks cover answer values and key assembly. The worksheets are the place to assess classroom phrasing and the plausibility of distractors.
