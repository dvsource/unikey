# UniKey Content Authoring Spec — v0.1

Applies to every item generated for UniKey (any subject, any medium). Generators (AI or human) must follow it; the validation pipeline enforces it. Anything marked **TBC** needs teacher confirmation before v1.0.

---

## 1. Principles

1. **Decompose, don't convert.** One source question becomes many small items, each testing **one** thing: a fact, a concept, a trap, a method choice, or a skill.
2. **One item → one primary skill.** Max 2 skill IDs per item; the first is primary.
3. **L1/L2 are fixed cards** (scheduled by FSRS). **L3/L4 vary every time** (scheduled by skill mastery). A fixed L3/L4 item gets memorised, not learned.
4. **Everything is auto-graded.** No self-rating (Again/Hard/Good buttons).
5. **Every wrong option is a real mistake** with a tag from §7. No filler distractors.
6. **New wording only.** Past papers inspire items; they are never copied (§11).
7. **Exam-faithful.** Calculator-free numbers, A/L notation, A/L option formats.

---

## 2. Layers

| Layer | Purpose | Time | Options | Scheduling | Varies? |
|---|---|---|---|---|---|
| **L1 Recall** | Facts, definitions, units, formula parts | 5–10 s | 4 | FSRS | No (options shuffled) |
| **L2 Concept** | Misconceptions, traps, scaling, graphs | 15–30 s | 2 (T/F) or 4 | FSRS | No (options shuffled, distractor pool rotated) |
| **L3 Method** | Choose the approach, don't solve | 10–20 s | 4 | Skill mastery | Yes: scenario pool per skill |
| **L4 Skill** | Full MCQ, exam-like | 30–120 s | 5 | Skill mastery | Yes: template with parameters |
| **L5 Exam set** | Timed mixed set | 10–30 min | 5 | Weekly, built from weak skills | Built from L4 |

---

## 3. Form catalogue

Every item declares one `form` ID.

### L1 Recall
| ID | Form | Example |
|---|---|---|
| F01 | Pick the fact | 1 eV = ? |
| F02 | Fill the formula gap | U = −GMm / ▢ |
| F03 | Name the expression | −GM/r is the gravitational…? |
| F04 | Unit / dimensions | SI unit of moment of inertia? · Dimensions of h/λ? |
| F05 | Unit conversion | 54 km h⁻¹ in m s⁻¹? |

### L2 Concept
| ID | Form | Example |
|---|---|---|
| F10 | True or false | Electrostatic field lines form closed loops. |
| F11 | Confusable pair | Which forms closed loops: electric / magnetic / both / neither? |
| F12 | What-if scaling | T × 3 → power per area × ? |
| F13 | Trap | Lift moving up, slowing: scale reading vs mg? |
| F14 | Fix the wrong thinking | "v = 0 at the top, so KE = 0." What's wrong? |
| F15 | Pick the graph | Pick the v–t graph (SVG options) |
| F16 | Graph meaning | Area under an F–t graph means? Gradient of s–t? |
| F17 | Possible or not | Forces 4 N and 10 N: which resultant is impossible? |
| F18 | Which force acts | What pushes a walking person forward? |
| F19 | Ratio reasoning | Pendulums of length L and 4L: ratio of periods? |
| F20 | Limiting case | As R → ∞, current → ? |
| F21 | Order of magnitude | Approximate mass of air in a classroom? |
| F22 | Practical / experimental | Vernier reading · error source · choose apparatus |
| F23 | Pick the diagram | Correct free-body / ray / circuit diagram (SVG options) |

### L3 Method
| ID | Form | Example |
|---|---|---|
| F30 | Which principle? | Wagons couple: momentum / KE / suvat / F = ma |
| F31 | What stays constant? | Projectile: which quantity is constant through the flight? |
| F32 | Same method? | Two scenarios: same or different method? **50% must be "different".** |
| F33 | Where to take moments / which system | Beam on two supports: moments about which point? |

### L4 Skill
| ID | Form | Notes |
|---|---|---|
| F40 | Numeric template | Parameters → number answer |
| F41 | Symbolic template | Parameters → expression answer (K cos²θ) |
| F42 | Statement grid | A/B/C statements, fixed 5-option set (§5.6) |
| F43 | Step problem | Multi-step, graded per step (step player) |

**Rules for specific forms**
- **F14** distractors must be real wrong beliefs students hold, not absurd ones ("mass changes").
- **F30/F31/F33** must have exactly one defensible answer. If a strong student could argue for a second option, rephrase ("most direct", "stays constant").
- **F32**: across a skill's pool, 40–60% of pairs must be "different".
- **F15/F23** options must be drawn (SVG), not described. A word description is allowed only in review drafts.

---

## 4. Item schema

### 4.1 Fixed card (L1/L2)
```json
{
  "id": "phy.mech.c013",
  "version": 1,
  "status": "draft",
  "layer": "L2",
  "form": "F18",
  "skills": ["phy.mech.n3-pairs"],
  "difficulty_est": 2,
  "source_ref": "2024-4",
  "text": { "en": "...", "si": "...", "ta": "..." },
  "options": [
    { "text": {"en": "...", "si": "...", "ta": "..."}, "correct": true },
    { "text": {"en": "..."}, "correct": false, "tag": "balance-vs-pair" }
  ],
  "explanation": { "en": "...", "si": "..." },
  "note_ref": "phy.mech.note.n3-pairs",
  "assets": [],
  "reviewer": null,
  "review_notes": null
}
```

### 4.2 Template (L4)
```json
{
  "id": "phy.mech.t05",
  "version": 1,
  "status": "draft",
  "layer": "L4",
  "form": "F40",
  "skills": ["phy.mech.friction-stopping", "phy.mech.work-energy"],
  "source_ref": "2018-14",
  "text": { "en": "A block sliding at {v} m s⁻¹ on a rough level floor comes to rest. μ = {mu}. Distance moved? (Take g = 10 m s⁻²)" },
  "params": {
    "v":  { "set": [2, 4, 5, 6, 8, 10, 12, 20] },
    "mu": { "set": [0.1, 0.2, 0.25, 0.4, 0.5] }
  },
  "constraints": ["answer <= 100"],
  "answer":  { "expr": "v**2 / (2*mu*g)", "unit": "m" },
  "distractors": [
    { "tag": "forgot-half",   "expr": "v**2 / (mu*g)" },
    { "tag": "forgot-mu",     "expr": "v**2 / (2*g)" },
    { "tag": "forgot-square", "expr": "v / (2*mu*g)" },
    { "tag": "inverted",      "expr": "2*mu*g / v**2" }
  ],
  "constants": { "g": 10 },
  "format": { "sig_figs": 3 },
  "explanation": { "en": "Work done by friction = loss of KE: μmgs = ½mv², so s = v²/(2μg)." }
}
```
Every distractor is a **function**, not a typed number. Its tag must describe that function.

### 4.3 Scenario pool (L3)
Same as a fixed card, but grouped by `pool_id`. The scheduler picks an unseen scenario each time. **Minimum 6 scenarios per pool.**

---

## 5. Writing rules

### 5.1 Stems
- One idea per stem. ≤ 40 words (L1–L3), ≤ 70 words (L4).
- State every condition the answer depends on: smooth/rough, ignore air resistance, sign convention, at rest, uniform.
- **Always state constants:** "(Take g = 10 m s⁻²)". π convention: **TBC** (π = 3 or values that cancel π).
- No negative stems ("Which is NOT…") unless the form needs it (F17). Bold the **not**.

### 5.2 Notation (A/L paper style)
- Units with negative exponents and spaces: **m s⁻¹, m s⁻², N s, kg m², J kg⁻¹**. Never "m/s".
- Decimal point, not comma. Up to 3 significant figures.
- Symbols as in the NIE textbook (**TBC**: list per unit).

### 5.3 Options
- L1–L3: 4 options. L4/L5: 5 options. T/F: 2.
- Never "all of the above" / "none of the above".
- **Similar length:** longest option ≤ 1.8 × shortest (characters). Put working in the explanation, never in the correct option.
- Same grammatical form and same unit across all options.
- Options are shuffled at runtime. Never write "option (3) above".

### 5.4 Distractors
- Each one comes from a mistake in §7, recorded with its tag.
- One tag per distractor. **No two distractors in an item share a tag.**
- Must be plausible: a real student makes this mistake. If you can't name who would pick it, replace it.

### 5.5 Explanations
- ≤ 2 sentences. Say why the right answer is right, then name the trap.
- Link to a note (`note_ref`) for the skill.

### 5.6 Statement grid (F42)
- 3 statements, A/B/C. Each one tests one idea.
- Fixed option set, same order every time. **TBC with teacher**, default:
  `(1) A only · (2) B only · (3) A and B only · (4) A and C only · (5) All A, B and C`
- Across a skill's grids, spread which option is correct. No single option is correct in more than 30% of them.

### 5.7 Language (Sinhala / Tamil medium)
- **Content only** is translated: stem, options, explanation, notes, skill/topic names. App UI stays English.
- Translate from the English master. Physics terms must come from the **glossary file** (NIE textbook terms). Never coin a term.
- Units and symbols stay in Latin script (m s⁻¹, F, μ).

---

## 6. Template constraints (automated, all must pass)

| # | Check | Rule |
|---|---|---|
| V1 | **Solver** | Answer recomputed with SymPy from `answer.expr`. Every distractor recomputed from its `expr`. |
| V2 | **Distinct** | Every pair of options differs by ≥ 10% relative (≥ 15% for values < 1). Otherwise reject the variant. |
| V3 | **Calculator-free** | Every option (correct **and** wrong) is exam-computable: an integer, a terminating decimal of ≤ 3 sig figs, or a simple fraction/surd that appears in A/L papers. Params come from whitelists (angles: 30, 37, 45, 53, 60, 90; nice masses/speeds). |
| V4 | **No clean-answer cue** | Reject if the correct option is the **only** "clean" option (integer or simple fraction) while the others are messy. |
| V5 | **Unique variants** | Dedupe by option set: two variants with the same set of option values (any order) count as one. |
| V6 | **Distractor repetition** | Across a template's variants, no single distractor value appears in > 20% of variants. |
| V7 | **Variant count** | ≥ 20 unique variants after V2–V6. If fewer, widen params or downgrade to L2 fixed cards. |
| V8 | **Answer position** | The correct answer is the max or the min option in ≤ 60% of variants. |
| V9 | **Plausibility** | Values are physically sensible: μ ≤ 1.2, everyday speeds, masses and heights, angles inside the whitelist. Declare limits in `constraints`. |
| V10 | **Tag–function match** | Every distractor's tag exists in §7 and its function is registered for that tag. |
| V11 | **Units** | All options share a unit. The answer unit is stated in the stem or the options. |
| V12 | **Length** | Text options pass the 1.8× length rule. |
| V13 | **Coincidence** | No distractor equals the answer for any allowed parameter set (catches the sin/cos at 45° case). |

Fixed cards run V2, V10, V11 and V12.

---

## 7. Error-tag taxonomy (fixed list)

Generators must only use these tags. New tags need a change request (§12). Each tag has a **student message** shown in feedback and in the mistake notebook.

### Concept (C)
| Tag | Meaning | Student message |
|---|---|---|
| `v-zero-at-top` | Thinks the whole velocity is 0 at max height | "Only the vertical part is zero at the top." |
| `accel-zero-at-top` | Thinks a = 0 when v = 0 | "Gravity never switches off: a = g the whole time." |
| `motion-vs-accel` | Confuses direction of motion with direction of acceleration | "Acceleration follows the change in velocity, not the motion." |
| `pair-cancels` | Thinks third-law pairs cancel | "Action and reaction act on different bodies." |
| `balance-vs-pair` | Confuses balanced forces with a third-law pair | "A pair acts between the same two bodies." |
| `force-on-wrong-body` | Picks the force acting on the other body | "Ask: which force acts **on** this body?" |
| `internal-force` | Thinks an internal force accelerates the system | "Only external forces change the motion." |
| `centrifugal` | Adds an outward force in circular motion | "Circular motion needs a net inward force." |
| `ke-conserved-inelastic` | Conserves KE in an inelastic collision or explosion | "Momentum is conserved; KE is not." |
| `mass-matters` | Keeps mass where it cancels | "Check if mass cancels out." |
| `linear-vs-angular` | Mixes linear and angular quantities | "Rotating? Use the angular version." |
| `moi-misconception` | Thinks I depends on ω, or swaps which shape has the larger I | "I depends on where the mass is, not on the speed." |

### Method (M)
| Tag | Meaning | Student message |
|---|---|---|
| `wrong-law` | Chose the wrong principle or conservation law | "Check which quantity is conserved here." |
| `suvat-nonuniform` | Used equations of motion with non-constant a | "suvat needs constant acceleration." |
| `unknown-not-eliminated` | Took moments about a point that keeps an unknown | "Take moments where an unknown force acts." |
| `assumed-symmetry` | Split equally or assumed symmetry that isn't there | "Don't assume an equal share. Calculate it." |
| `misread-interval` | Used the wrong time or distance interval | "Which interval does the question give?" |
| `no-resolve` | Didn't resolve into components | "Resolve into components first." |

### Execution (E)
| Tag | Meaning | Student message |
|---|---|---|
| `sign` | Sign or direction error | "Pick a positive direction and stick to it." |
| `unit-conversion` | Wrong or missing unit conversion | "Convert to SI units before calculating." |
| `forgot-square` | Missed a square | "Check the power: v², ω², r²." |
| `wrong-power` | Wrong power (other than a missed square) | "Check how the quantity scales." |
| `inverted` | Ratio or formula upside down | "Check which goes on top." |
| `sin-cos-swap` | Swapped sin and cos | "Adjacent → cos, opposite → sin." |
| `radius-diameter` | Used diameter for radius | "r is the radius." |
| `forgot-g` | Used mass instead of weight, or dropped g | "Weight = mg." |
| `forgot-mass` | Dropped or used the wrong mass | "Which mass is moving?" |
| `forgot-half` | Dropped a ½ (KE, area of a triangle) | "Check the ½." |
| `area-shape` | Wrong area under a graph | "Split the area into simple shapes." |
| `arithmetic` | Calculation slip (use sparingly) | "Recheck the arithmetic." |

### Reading (R)
| Tag | Meaning | Student message |
|---|---|---|
| `wrong-quantity` | Found a different quantity than asked | "Reread what the question asks for." |
| `ignored-condition` | Missed a condition (smooth, at rest, equal mass) | "Underline the conditions in the question." |
| `slope-area-swap` | Confused gradient and area of a graph | "Gradient = rate. Area = accumulation." |
| `boundary` | Wrong about whether limits are included | "Check the end values of the range." |

Tags are subject-wide. Subject-specific tags (e.g. chemistry) get a prefix: `chem.mole-ratio`.

---

## 8. Grading rules

### 8.1 L1/L2 → FSRS grade
| Outcome | Grade |
|---|---|
| Wrong, or "I don't know" | Again |
| Correct, but time > 2 × the item's median time, or after a hint | Hard |
| Correct within normal time | Good |
| Correct within 0.5 × median, on a card already reviewed ≥ 3 times | Easy |

- Median time starts at the layer's default (§2) and is calibrated from pilot data.
- Every card offers **"I don't know"** (= Again, no penalty in readiness).
- **Guessing guard:** a card answered correctly in its first 2 reviews is re-checked within the same day with shuffled options and a rotated distractor before its interval grows.

### 8.2 L3/L4 → skill mastery
- Skill mastery θ (per student, per skill) and item difficulty b use a guess-corrected logistic model:
  `p(correct) = c + (1 − c) · σ(θ − b)` with `c = 1 / number_of_options`
- Update after each attempt: `θ ← θ + K · (score − p)`. K starts high (≈ 0.4) and decays with attempts.
- Score: 1 = correct, no hint · 0.6 = correct after 1 hint · 0.3 = correct after 2+ hints · 0 = wrong.
- Step problems (F43): score per step, item score = mean of steps.
- **Implicit credit:** a correct L4 gives partial review credit (weight 0.3–0.7, set per graph edge) to the skills it encompasses.
- **Wrong answers:** the distractor's tag goes into the mistake notebook. Three or more of the same tag within 14 days triggers a remediation set for that tag.

---

## 9. Coverage targets per skill

| Layer | Per skill |
|---|---|
| L1 | 2–4 cards |
| L2 | 3–6 cards, including at least 1 F14 or F13 |
| L3 | 1 pool, ≥ 6 scenarios |
| L4 | 1–2 templates, each ≥ 20 unique variants |
| Note | 1 micro-note (`note_ref`) |

---

## 10. Workflow and statuses

```
draft → auto-checked → teacher-reviewed → published → retired
```
- **draft**: generated.
- **auto-checked**: passed §6 (templates) or the fixed-card checks.
- **teacher-reviewed**: a teacher signed off physics, wording, skill mapping and distractor realism.
- **published**: in content packs. Edits make a new `version`. Student history stays tied to the item ID.
- **retired**: removed from scheduling, history kept.

### Teacher review doc (per item)
- Item ID · layer · form · **skill ID + name** · difficulty 1–5 (teacher estimate)
- Stem and options, correct answer in bold, tag beside each distractor
- **Per distractor:** ☐ real mistake ☐ not real
- Templates: 3 sample variants, chosen to cover the parameter range and each case (e.g. acceleration up and down)
- ☐ OK · ☐ Fix: ______
- Sinhala/Tamil text beside the English (once translated)

---

## 11. Sources and copyright

- Past papers are **inspiration only**. Never copy wording, numbers or diagrams from a source question.
- `source_ref` (e.g. `2023-17`) is internal metadata, used for exam-weight tagging. It is never shown as "this is the 2023 question".
- Errors found in source data are logged in `source-issues.md` with the paper, the question and the evidence.

---

## 12. Changes to this spec

- New form, tag or rule → write a change note (what, why, an example) → teacher + owner approve → bump the spec version.
- Generators must state the spec version they used in each batch's header.

---

## 13. TBC with teacher

1. Statement-grid option set and order (§5.6)
2. π convention (§5.1)
3. Symbol list per unit from the NIE textbook (§5.2)
4. Sinhala/Tamil glossary file: who owns it, where it lives (§5.7)
5. Parameter whitelists per unit (§6, V3)
6. Default median times per layer after the pilot (§8.1)
