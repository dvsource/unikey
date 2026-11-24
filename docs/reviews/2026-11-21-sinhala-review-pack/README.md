# Sinhala physics review pack

Start with the unit sheets. Each draft shows both languages, every option, the proposed key, feedback and the harder questions it repairs. The appendix gives each harder question once. Review priority measures translation risk, not physics difficulty.

| Unit | v2 items | Draft cards | v2 flags¹ | Draft flags | Drafts with flags |
|---|---:|---:|---:|---:|
| [Mechanics](mechanics.md) | 98 | 89 | 51 | 45 | 25 |
| [Thermal](thermal.md) | 73 | 69 | 27 | 14 | 7 |
| [Electricity](electricity.md) | 86 | 75 | 46 | 29 | 19 |

¹ v2 flags include 56 skill labels. Flags count distinct findings per field. Repeated feedback in two fields counts twice. Term-location counts use distinct records or fields as indicated.

[English → Sinhala terms and locations](terms.md) · [Machine-readable evidence](flags.json) · [Proposed edits](proposed.patch)

## Findings

| Flag | v2 | Drafts | Total |
|---|---:|---:|---:|
| review-wording | 86 | 37 | 123 |
| term-variation | 34 | 48 | 82 |
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
- Only the terminology review establishes a preference. The glossary and scripts cannot decide classroom usage. Standalone abbreviations, full names and synonymous expressions can all be legitimate. Nonpreferred wording in a proposed wrong answer may be intentional.
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
