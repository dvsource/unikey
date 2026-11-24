# Sinhala physics review pack

[පද තේරීම් · decisions.csv](decisions.csv) · [කාඩ්පත් · cards.csv](cards.csv)

දුරකථනයෙන් Google Sheets වෙත ගොනුව විවෘත කර පෙළ එතීම සක්‍රිය කරන්න. මුල් පේළි දෙක උපදෙස් සඳහාය. තීරු නාම තුන්වැනි පේළියේ ඇත.

## Bilingual reading

Read judgments cover 464 records marked same and 26 marked differs. 0 await a new reading. The 29 field findings below include changes in a condition, a comparison or a cue to the answer. A difference need not change the keyed answer.

The word checks and the bilingual read are separate. For example, “does not change” can mean “stays the same”. The four word checks compare negation cues, fractions and multipliers, directions, and comparisons. They cannot reliably attach a word to the right quantity, infer a missing assumption, or judge a diagram. A zero count is only a count of matches.

Of 72 word-check alerts, 13 identify a wording difference, 53 are false alarms, and 6 concern terminology alone. 0 await review. Each alert in the JSON gives the reason.

- **phy.elec.b01**. English says electrons drift faster in the thin section than in the thick section. Sinhala just says they drift fast. Even the faster drift speed can be very small. The false statement says electrons drift more slowly in the thin section. Sinhala says they drift slowly, which can be true in both sections. The explanation repeats the missing comparison. It describes fast drift at small area without saying faster than at large area.
- **phy.mech.c078**. English specifies downward acceleration. Sinhala describes downward travel with acceleration a. A descending lift that is slowing down has upward acceleration and a different scale reading.
- **phy.mech.c061**. Sinhala specifies a vertical launch. English says upward, which also allows an oblique launch. The keyed u²/(2g) needs u to be the vertical component.
- **phy.elec.c086**. English names the conductance of the cell combination, measured in siemens. Sinhala uses සන්නායකතාව, also the textbook term for material conductivity, measured in siemens per metre. Specify the reciprocal of the combination’s resistance.
- **phy.mech.c009**. Sinhala names the driven tyres and tells the student the friction points forward. English asks the student to infer this from road friction on the tyres.
- **phy.elec.c008**. English gives the real meter a similar resistance. Sinhala can be read as equal resistance. That is a narrower loading condition, although the reading falls in either case.
- **phy.elec.c013**. English says drift must be faster through the smaller area. Sinhala says fast drift is necessary. The requirement is relative, not an absolute speed.
- **phy.elec.c033**. English claims a faster reading than the alternative instrument. Sinhala says the reading is quick. Neither wording is the keyed advantage.
- **phy.elec.c044**. English says back e.m.f. grows as the coil turns faster. Sinhala says it grows when the coil turns fast. A constant high speed gives constant back e.m.f.
- **phy.elec.c064**. English calls the connection a tap. Sinhala calls it the midpoint. This is a junction of unequal resistors, so it need not be halfway in potential.
- **phy.elec.c097**. English leaves “across it” ambiguous between the meter and resistor. Sinhala names the resistor. Both versions still describe the wrong function for an ammeter.
- **phy.elec.p01-06**. English gives another, different cell. Sinhala specifies that its e.m.f. differs. Two distinct cells could have the same e.m.f. in the English setup.
- **phy.mech.b02**. English tests whether increasing spin speed increases inertia. Sinhala asks about spinning fast, without saying the spin speed increased.
- **phy.mech.c003**. The wrong choice claims the ball is slower on the way up in English but only that it moves slowly on the way up in Sinhala. The stated comparison is lost.
- **phy.mech.c008**. The Sinhala keyed choice explicitly says forward friction. The English choice names ground friction on the foot and leaves its direction to the student.
- **phy.mech.c062**. English explicitly assumes still air as well as negligible drag. Sinhala asks the reader to ignore air resistance and leaves air motion unspecified. Both give the same flight-time result.
- **phy.mech.c063**. English launches the ball from the ground. Sinhala gives the angle and speed but leaves the starting height open. The requested speed is unaffected.
- **phy.mech.c067**. English makes the claim for every ball. Sinhala extends it to every object. Both claims are false in the projectile model.
- **phy.mech.c090**. English asks how much truck acceleration the friction can give the box. Sinhala asks only for the maximum box acceleration. The values coincide at the no-slip limit.
- **phy.mech.c118**. English changes the speed of the same disc. Sinhala says it is spun fast. An absolute speed replaces the comparison in the false claim.
- **phy.mech.p05-01**. The diver spins faster after tucking in English. Sinhala says the diver spins fast and leaves the change from the earlier speed unstated.
- **phy.therm.c023**. English compares lighter molecules with heavier ones. Sinhala says lighter molecules move fast without saying faster than the heavier ones.
- **phy.therm.c029**. English says cooling slows as the body approaches room temperature. Sinhala describes slow cooling near room temperature without explicitly comparing the rates. The distractor says cooling is faster at lower temperatures. Sinhala says it is fast there, losing the comparison.
- **phy.therm.c090**. Sinhala explicitly puts the two phases in equilibrium. English only says they coexist. Equilibrium makes the constant melting-temperature argument explicit.
- **phy.therm.c097**. English mixes two samples of air. Sinhala says gas samples without specifying air. The vapour-mass calculation still uses the stated total volume.
- **phy.therm.c104**. English fixes the air temperature. Sinhala fixes the gas temperature without identifying the gas as air. The humidity relation is otherwise the same.

## Printed terminology evidence

Counts are matched roots, including inflections. The evidence covers one Sinhala syllabus, the text layers of four of seven NIE resource books and 37 readable mirror exam parts. Seven Department of Examinations files and three books have no usable Sinhala text layer for this search. Missing text and unrecognised legacy glyphs can hide occurrences. The counts are lower bounds. Papers can favour a different spelling from books, particularly for zero. The p.d. and voltage totals include different contexts.

To repeat the count, run `python3 content/tools/sinhala_resources.py /path/to/resources`. Compare its JSON with the saved evidence. The files with no usable text layer are listed there too.

[Per-PDF counts and first matching PDF pages](../../../content/tools/sinhala-resource-evidence.json) · [Offline recount script](../../../content/tools/sinhala_resources.py)

## Unit sheets

For full feedback and repair links, use the unit sheets. Each draft shows both languages, every option, the proposed key, feedback and the harder questions it repairs. The appendix gives each harder question once. Review priority measures translation risk, not physics difficulty.

| Unit | v2 items | Draft cards | v2 flags¹ | Draft flags | Drafts with flags |
|---|---:|---:|---:|---:|
| [Mechanics](mechanics.md) | 98 | 89 | 64 | 62 | 34 |
| [Thermal](thermal.md) | 73 | 69 | 51 | 24 | 15 |
| [Electricity](electricity.md) | 86 | 75 | 74 | 38 | 24 |

¹ v2 flags include 56 skill labels. Flags count distinct findings per field. Repeated feedback in two fields counts twice. Term-location counts use distinct records or fields as indicated.

[English → Sinhala terms and locations](terms.md) · [Machine-readable evidence](flags.json) · [Proposed edits](proposed.patch)

## Findings

| Flag | v2 | Drafts | Total |
|---|---:|---:|---:|
| review-wording | 86 | 37 | 123 |
| term-variation | 34 | 48 | 82 |
| comparison-check | 25 | 7 | 32 |
| meaning-read | 16 | 13 | 29 |
| negation-check | 12 | 13 | 25 |
| number-word-check | 8 | 0 | 8 |
| direction-check | 4 | 3 | 7 |
| untranslated-prose | 4 | 0 | 4 |
| condition-check | 0 | 3 | 3 |
| decimal-style | 0 | 0 | 0 |
| join-control | 0 | 0 | 0 |
| look-alike | 0 | 0 | 0 |
| missing-translation | 0 | 0 | 0 |
| non-nfc | 0 | 0 | 0 |
| number-mismatch | 0 | 0 | 0 |
| option-meaning | 0 | 0 | 0 |
| placeholder-mismatch | 0 | 0 | 0 |
| stray-latin | 0 | 0 | 0 |
| symbol-mismatch | 0 | 0 | 0 |
| unit-mismatch | 0 | 0 | 0 |
| unit-style | 0 | 0 | 0 |

The term index opens with the ten highest-volume decisions. The review recommends ඝූර්ණ for moments. Keep ව්‍යාවර්ත for torque. A prevalent spelling does not establish a preferred term.

In phy.elec.c091 the English feedback names the matched resistor. The Sinhala points back to “that resistor”. Both feedback locations are flagged. In phy.therm.c073 a teacher should check whether the wording makes the container’s initial temperature clear enough. The four untranslated “so” connectors are in worked explanations.

## Scope and reading the results

- Inputs are authored v2 cards, pools, templates, statement banks, skill names and the draft branch’s cards and repair links. Numerical variants are represented by their source templates. Shared formulae, diagram assets and app UI are separate from translated prose.
- The term catalog combines the independent review, observed bilingual expressions and candidate pairs identified using the local glossary cited by the review. A dictionary entry alone does not establish usage. The concordance records exact Sinhala surfaces in the inputs, including inflections. Some short roots use English context to distinguish senses. Review-only spellings are identified separately.
- The teacher can confirm the review recommendations and the proposals backed by print counts. Standalone abbreviations, full names and synonymous expressions can all be legitimate. Nonpreferred wording in a proposed wrong answer may be intentional.
- P3 covers possible changes to a question, option, number or placeholder. P2 covers conditions, symbols, language leakage and specific editorial recommendations. P1 covers notation and unresolved variations. A teacher should read the bilingual text even for cards with zero flags.
- Numeric checks compare literals, signed values, unit bindings, common multipliers and explicit assignments. Condition and option checks use bilingual cues, option collisions, formula order and polarity. These checks cannot prove semantic equivalence, identify every paraphrase or interpret a diagram. All bilingual fields remain in the JSON for those judgments.
- Sinhala conjuncts with a virama and ZWJ are valid. Suspect join-control positions are reported with character offsets. Symbols, variables, units and figure labels are allowed in Sinhala. The §5.7 language rules distinguish content words from notation. The authoring spec calls for a decimal point. The living §5.2 leaves point versus middle dot open. A comma between digits needs context.

[Authoring spec §§5.2 and 5.7](../../../content/authoring-spec.md) · [Living authoring guide](../../living/content-authoring.md)

## Reproduce offline

From the repository root:

```sh
python3 content/tools/sinhala-check.py
python3 -B -m unittest discover -s content/tools
```

The default reads the terminology review from the primary worktree and the drafts via git show. The draft commit for this pack is `13cc6b9ca902a5812981e5af1da27aaa3604740f`. Use `--draft-ref <commit> --review <path> --out <directory>` for a pinned rerun elsewhere. Input digests are in flags.json. The untracked review must be supplied separately on a new clone.

The patch contains selected proposals across both source trees. It needs the v2 files and draft files at their recorded versions. The test runs `git apply --check` against those blobs in a temporary directory. No proposal is applied.
