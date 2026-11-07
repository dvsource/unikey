# UniKey Content Authoring Spec — v0.5

_Status: Proposed. Last updated: 2026-11-07._

Applies to every item generated for UniKey (any subject, any medium). Generators (AI or human) must follow it; the validation pipeline enforces it. Anything marked **TBC** needs teacher confirmation before v1.0. Numbers quoted as evidence come from the 500 real MCQs (2016–2025) in the ALPhysics database.

---

## 1. Principles

1. **Decompose, don't convert.** One source question becomes many small items, each testing **one** thing: a fact, a concept, a trap, a method choice, or a skill.
2. **One item → one primary skill.** Max 2 skill IDs per item; the first is primary.
3. **L1/L2 are cards** (scheduled by FSRS). **L3/L4 vary every time** (scheduled by skill mastery). A fixed L3/L4 item gets memorised, not learned.
4. **Everything is auto-graded.** No self-rating (Again/Hard/Good buttons). Grading rules are in the [product spec](product-spec.md#grading-rules).
5. **Every wrong option is a real mistake** with a tag from §7. No filler distractors. At L1, a wrong option may simply be `recall-gap`.
6. **New wording only.** Past papers inspire items; they are never copied (§11).
7. **Exam-faithful.** Calculator-free numbers, A/L notation, A/L option formats, and figures as often as the exam uses them.

---

## 2. Layers

| Layer | Purpose | Time | Options | Scheduling | Varies? |
|---|---|---|---|---|---|
| **L1 Recall** | Facts, definitions, units, formula parts | 5–10 s | 4 | FSRS | No (options shuffled) |
| **L2 Concept** | Misconceptions, traps, scaling, graphs | 15–30 s | 2 (T/F) or 4 | FSRS | Spare wrong options rotate where the card has them |
| **L3 Method** | Choose the approach, don't solve | 10–20 s | 4 (F32: 2) | Skill mastery | Yes: scenario pool per skill |
| **L4 Skill** | Full MCQ, exam-like | 30–120 s | 5 | Skill mastery | Yes: template or statement bank |
| **L5 Exam set** | Timed mixed set | 10–30 min | 5 | Weekly, built from weak skills | Built from L4. Figure share matches the unit's share in real papers |

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
| F17 | Possible or not | Forces 4 N and 10 N: which can be the resultant? Asks for the valid value, so the answer isn't always at one end |
| F18 | Which force acts | What pushes a walking person forward? |
| F19 | Ratio reasoning | Pendulums of length L and 4L: ratio of periods? |
| F22 | Practical / experimental | Error source · choose apparatus. Instrument readings use F44 |
| F23 | Pick the diagram | Correct free-body / ray / circuit diagram (SVG options) |

**Optional, low priority:** F20 Limiting case ("As R → ∞, current → ?") and F21 Order of magnitude. Limiting-case wording matched only 2 of 500 real stems, and no real order-of-magnitude question has been confirmed. No coverage target applies to them.

### L3 Method
| ID | Form | Example |
|---|---|---|
| F30 | Which principle? | Wagons couple: momentum / KE / suvat / F = ma |
| F31 | What stays constant? | Projectile: which quantity is constant through the flight? |
| F32 | Same method? | Two scenarios: same or different method? 2 options |
| F33 | Where to take moments / which system | Beam on two supports: moments about which point? |

### L4 Skill
| ID | Form | Notes |
|---|---|---|
| F40 | Numeric template | Parameters → number answer |
| F41 | Symbolic template | Parameters → expression answer (K cos²θ) |
| F42 | Statement grid | Built from a statement bank (§4.4), fixed 5-option set (§5.6) |
| F43 | Step problem | Multi-step, graded per step. Needs the full step player, so not in the pilot |
| F44 | Figure template | Parameters → drawn figure + number or expression answer (§4.5) |
| F45 | Exam-strength item | Combines at least 2 skills at real paper difficulty. One per source question, used in L5 sets and mocks |

**Rules for specific forms**
- **F14** distractors must be real wrong beliefs students hold, not absurd ones ("mass changes").
- **F30/F31/F33** must have exactly one defensible answer. If a strong student could argue for a second option, rephrase ("most direct", "stays constant").
- **F10**: across a unit's cards, 40–60% must be "True". **F32**: across a pool, 40–60% must be "Different".
- **F45** exists because small items alone won't prepare students for the exam: 351 of 500 real questions are rated difficulty 3+, and 123 are multi-step. Accuracy on F45 is tracked separately from L1–L4.
- **F15/F23/F44** figures must be drawn (SVG), not described. A word description is allowed only in review drafts.

---

## 4. Item schema

Skill IDs start with the subject: `phy.mech.circ.vertical-tension`. They are permanent.

### 4.1 Card (L1/L2)
```json
{
  "id": "phy.mech.c013",
  "version": 1,
  "status": "draft",
  "layer": "L2",
  "form": "F18",
  "skills": ["phy.mech.newton.n3-pairs"],
  "difficulty_est": 2,
  "source_ref": "2024-4",
  "text": { "en": "...", "si": "...", "ta": "..." },
  "options": [
    { "text": {"en": "...", "si": "...", "ta": "..."}, "correct": true },
    { "text": {"en": "..."}, "correct": false, "tag": "balance-vs-pair" }
  ],
  "spare_options": [
    { "text": {"en": "..."}, "correct": false, "tag": "force-on-wrong-body" }
  ],
  "option_order": "shuffle",
  "explanation": { "en": "...", "si": "..." },
  "note_ref": "phy.mech.note.n3-pairs",
  "assets": [],
  "reviewer": null,
  "review_notes": null
}
```
`spare_options` is optional. A card shows 4 options in total, drawn from `options` and `spare_options`, always including the correct one. An option in F15 or F23 also has `"asset"`, the path of its drawing.

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
  "text": { "en": "A block sliding at {v} m s⁻¹ on a rough level floor comes to rest. μ = {mu}. Distance moved?" },
  "params": {
    "v":  { "set": [2, 3, 4, 5, 6, 8, 10, 12, 14, 15, 16, 18, 20], "unit": "m s^-1" },
    "mu": { "set": [0.1, 0.2, 0.25, 0.4, 0.5], "unit": "1" }
  },
  "derived": {},
  "constraints": ["answer <= 100"],
  "exclude": [],
  "answer":  { "expr": "v**2 / (2*mu*g)", "unit": "m", "dim": "m" },
  "verify": ["mu*m*g*answer == m*v**2/2"],
  "verify_given": { "m": 3 },
  "distractors": [
    { "tag": "forgot-half",   "expr": "v**2 / (mu*g)" },
    { "tag": "forgot-mu",     "expr": "v**2 / (2*g)" },
    { "tag": "forgot-square", "expr": "v / (2*mu*g)" },
    { "tag": "inverted",      "expr": "mu*v**2 / (2*g)" },
    { "tag": "forgot-g",      "expr": "v**2 / (2*mu)" },
    { "tag": "wrong-law",     "expr": "2*v**2 / (mu*g)", "detail": "½mv² = μmgs puts the 2 below the line, not above it." }
  ],
  "constants": { "g": 10 },
  "option_order": "ascending",
  "format": { "sig_figs": 3 },
  "explanation": { "en": "Work done by friction = loss of KE: μmgs = ½mv², so s = v²/(2μg)." }
}
```
- Every distractor is a **function**, not a typed number. Its tag must describe that function.
- List **at least 5 distractors** for F40 and F44, and 6+ where real mistakes exist. Each variant uses 4 with different tags. This moves the answer between positions (V8). F41 needs at least 4. In a range template (F17-style), the out-of-range options may share `boundary`.
- A distractor with a general tag (§7) must add `detail`, the specific message the student sees.
- `derived` holds named steps used by later expressions. `exclude` removes parameter sets, including the source's exact numbers (V13). `verify_given` supplies values that only the check needs, such as a mass that cancels.
- `answer.dim` gives the SI dimensions when the display unit differs (cm, kW). F41 options add `display`, such as `"{h0} × ({k}){sup(2*n)} m"`. Option text comes from `display` when it's present.
- `verify` holds at least one relation that is **independent of `answer.expr`**, such as a balance equation or a simulation (V1).
- `constants` are shown by the app (§5.1), so they don't appear in `text`.

### 4.3 Scenario pool (L3)
Same as a card, but grouped by `pool_id`. The scheduler picks an unseen scenario each time. When all have been seen, it reuses the one seen longest ago. **Minimum 6 scenarios per pool.**

### 4.4 Statement bank (F42)
```json
{
  "id": "phy.mech.b03",
  "version": 1,
  "status": "draft",
  "layer": "L4",
  "form": "F42",
  "skills": ["phy.mech.newton.n3-pairs"],
  "source_ref": "2024-4",
  "statements": [
    { "text": {"en": "The two forces of a pair act on different bodies."}, "true": true },
    { "text": {"en": "The two forces of a pair cancel each other."}, "true": false, "tag": "pair-cancels" }
  ],
  "conflicts": [[0, 1]],
  "explanation": { "en": "..." }
}
```
- At least 8 statements, with at least 3 true and 3 false. Each variant draws 3 and assigns A/B/C at random.
- A wrong option takes the tag of a false statement it includes. If it includes none, it takes `missed-true-statement`.
- Each statement must make sense alone, so it never starts with "It".
- `conflicts` lists statement pairs that contradict each other or give each other away. They never appear in one variant.

### 4.5 Figure template (F44)
Same as §4.2, plus a figure whose values come from the parameters:
```json
"figure": { "engine": "force-time-graph", "params": { "peak": "F", "rise": "t1", "hold": "t2" } }
```
Figure engines are shared and reviewed once. A word description never replaces the figure in a published item.

---

## 5. Writing rules

### 5.1 Stems
- One idea per stem. ≤ 40 words (L1–L3), ≤ 70 words (L4).
- State every condition the answer depends on: smooth/rough, ignore air resistance, sign convention, at rest, uniform.
- **g:** the app shows it from the `constants` field beside every numeric item. No real stem states it, because the paper gives it on its cover, and keeping it in one field avoids text and value drifting apart.
- **π:** write "(Take π = 3)" in the stem when the answer needs it, as 4 real stems do.
- Negative stems ("Which is **not**…") are allowed for F17 and at L4, for about 5% of a skill's items. That matches the papers (24 of 500). Bold the **not**.

### 5.2 Notation (A/L paper style)
- Units with negative exponents and spaces: **m s⁻¹, m s⁻², N s, kg m², J kg⁻¹**. Never "m/s".
- Decimal mark: **TBC**. Real stems use both 0·5 (50 stems) and 0.5 (11 stems). Up to 3 significant figures.
- Symbols as in the NIE textbook (**TBC**: list per unit).

### 5.3 Options
- L1–L3: 4 options. L4/L5: 5 options. T/F and F32: 2.
- Never "all of the above" / "none of the above".
- **Length:** the correct option must not be clearly the longest: at most 1.3 × the longest wrong option, or 6 characters longer. Put working in the explanation, never in the correct option.
- Same grammatical form and same unit across all options.
- **Order** (`option_order`):
  - `ascending`: all-numeric options, as in 74 of 83 real numeric questions. New numbers already stop position memory.
  - `shuffle`: text and expression options, on every review.
  - `fixed`: T/F, F32 and statement grids, in one standard order.
- Never write "option (3) above".

### 5.4 Distractors
- Each one comes from a mistake in §7, recorded with its tag.
- One tag per distractor. No two distractors in an item share a tag. **Exceptions:** L1, where a miss just means not knowing it; F42, where tags come from statements; and range templates (§4.2).
- Must be plausible: a real student makes this mistake. If you can't name who would pick it, replace it.

### 5.5 Explanations
- ≤ 2 sentences. Say why the right answer is right, then name the trap.
- Link to a note (`note_ref`) for the skill.

### 5.6 Statement grid (F42)
- 3 statements, A/B/C, as in all 47 real grid questions. Each one tests one idea.
- Fixed option set, same order every time. **TBC with teacher**, default:
  `(1) A only · (2) A and B only · (3) A and C only · (4) B and C only · (5) All A, B and C`
- This is the second commonest set (11 questions), one behind A / B / AB / BC / ABC (12), and it can express "A and C".
- Across a bank's variants, no single option is correct in more than 30%. Variants that break this are dropped.

### 5.7 Language (Sinhala / Tamil medium)
- **Content only** is translated: stem, options, explanation, notes, skill/topic names. App UI stays English.
- Teachers review the medium students will see. Sinhala is what's checked for a Sinhala-medium pilot, even though generation starts in English.
- Translate from the English master. Physics terms must come from the **glossary file** (NIE textbook terms). Never coin a term.
- Units and symbols stay in Latin script (m s⁻¹, F, μ).
- A translated template adds `param_text` for word-valued parameters and `detail_si` beside `detail`. Sentence order can change, so stems are translated with their placeholders.
- The glossary is not safe to apply blindly. Some terms have the wrong sense for mechanics (`beam`, `lift`, `slope`, `projectile`) and some have two spellings (`torque`, `conservation`). The teacher must settle these against the NIE textbook.

---

## 6. Automated checks

Variants that fail are dropped. A template that ends below V7 is downgraded or fixed.

| # | Check | Rule |
|---|---|---|
| V1 | **Independent solver** | Run every `verify` relation on every variant. Check dimensions from the declared units. Recomputing `answer.expr` alone proves nothing. |
| V2 | **Distinct** | Every pair of numeric options differs by ≥ 5% relative. No option equals the answer. 18 of 85 real numeric questions have a gap under 10%, so a larger minimum would be stricter than the exam. |
| V3 | **Calculator-free** | Every option (correct **and** wrong) is exam-computable: exact in ≤ 3 sig figs, or a simple fraction or surd in an expression answer. Prefer ≤ 2 sig figs. Params come from whitelists (angles: 30, 45, 60, 90; nice masses and speeds). |
| V4 | **No format cue** | Reject if the correct option is the only whole number, or the only non-whole number. |
| V5 | **Unique variants** | Two variants count as one only if they share the same answer, the same scenario and the same option set. |
| V6 | **Never-correct values** | Across a template's variants, a value that is never the answer appears in ≤ 20% of variants. Values that are correct elsewhere are exempt, so ordinary small numbers aren't removed. |
| V7 | **Variant count** | ≥ 20 effective variants after V2–V8. Variants that only rescale another one (same options ÷ answer) count once. If fewer, widen params or downgrade to an L2 card pool scheduled by FSRS. |
| V8 | **Answer position** | With options sorted, the correct answer is in any single position in ≤ 60% of variants. If that can't be met, add distractors or make it an L2 card pool. |
| V9 | **Plausibility** | Values are physically sensible: μ ≤ 1.2, everyday speeds, masses and heights. Declare limits in `constraints`. Numeric options stay within 10× of the answer either way, which fits 89 of 95 real numeric questions. |
| V10 | **Tag registered and fits** | Every tag exists in §7. A value keeps one tag across variants. Code checks tags it can test from the formula: `forgot-g` and `forgot-mu` must drop that variable, and `forgot-half` must give 2× or ½× the answer. General tags need `detail`. A teacher checks the rest. |
| V11 | **Units** | All options share a unit. The answer unit is stated in the stem or the options. |
| V12 | **Length** | Text options pass the rule in §5.3. |
| V13 | **No copying** | No run of 6 words shared with the source stem, and no variant using the source's exact numbers. |
| V15 | **Translation** | Every text has the medium's version with real script, the same numbers and placeholders, and the glossary term for each English term found. Exceptions where the glossary has the wrong sense are listed with the teacher's approval. |
| V14 | **Balance** | F10 meets the 40–60% rule per unit, and F32 per pool. F42 meets the 30% rule per bank. |

Cards run V2, V10, V11, V12, V13, V14 and V15. Statement banks run V10, V13, V14 and V15.

---

## 7. Error-tag taxonomy

Generators must only use registered tags. Each tag has a **student message** shown in feedback and in the mistake notebook.

**General tags** (`ignored-condition`, `wrong-quantity`, `stopped-early`, `wrong-law`, `misread-interval`) are too broad to help alone, so each use needs a `detail` that names the actual mistake, and the student sees that instead of the default message. `recall-gap` is allowed on L1, where a miss simply means not knowing the fact.

**The list is frozen.** Generators can't add tags. **Method, Execution and Reading are closed lists shared by every unit.** **Concept tags are organised by unit**, because misconceptions are specific to the physics. Reports and the notebook roll up to the 4 groups, so the longer Concept list doesn't make them harder to read. A unit's Concept tags are reviewed and approved together before its content is generated (§12).

### Method (M)
| Tag | Meaning | Student message |
|---|---|---|
| `wrong-law` | Chose a principle that doesn't fit | "This law doesn't link what's given to what's asked." |
| `wrong-conservation-law` | Conserved the wrong quantity | "Check which quantity is conserved here." |
| `suvat-nonuniform` | Used equations of motion with non-constant a | "suvat needs constant acceleration." |
| `unknown-not-eliminated` | Chose an equation that keeps an unknown | "Choose an equation that removes the unknown force." |
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
| `stopped-early` | Gave a middle step as the answer | "That's a middle step. Carry on to what's asked." |

### Reading (R)
| Tag | Meaning | Student message |
|---|---|---|
| `wrong-quantity` | Found a different quantity than asked | "Reread what the question asks for." |
| `ignored-condition` | Missed a condition (smooth, at rest, equal mass) | "Underline the conditions in the question." |
| `missed-true-statement` | Rejected a true statement in a grid | "Check each statement separately." |

### Concept (C): general
| Tag | Meaning | Student message |
|---|---|---|
| `recall-gap` | Didn't know a fact (L1 only) | "This one needs learning. It will come back soon." |
| `slope-area-swap` | Confused gradient and area of a graph | "Gradient = rate. Area = accumulation." |
| `boundary` | Wrong about whether limits are included | "Check the end values of the range." |

### Concept (C): Mechanics
| Tag | Meaning | Student message |
|---|---|---|
| `v-zero-at-top` | Thinks the whole velocity is 0 at max height | "Only the vertical part is zero at the top." |
| `accel-zero-at-top` | Thinks a = 0 when v = 0 | "Gravity never switches off: a = g the whole time." |
| `force-along-motion` | Thinks motion needs a forward force | "Motion doesn't need a forward force." |
| `motion-vs-accel` | Confuses direction of motion with direction of acceleration | "Acceleration follows the change in velocity, not the motion." |
| `up-down-time` | Thinks up and down times differ, without air resistance | "Without air resistance, up and down times match." |
| `mean-of-speeds` | Averages speeds over unequal times | "Use total displacement ÷ total time." |
| `pair-cancels` | Thinks third-law pairs cancel | "Action and reaction act on different bodies." |
| `balance-vs-pair` | Confuses balanced forces with a third-law pair | "A pair acts between the same two bodies." |
| `force-on-wrong-body` | Picks the force acting on the other body | "Ask: which force acts **on** this body?" |
| `internal-force` | Thinks an internal force accelerates the system | "Only external forces change the motion." |
| `friction-direction` | Has friction acting the wrong way | "Friction opposes the sliding that would happen." |
| `normal-vertical` | Draws the normal reaction as always vertical | "N is perpendicular to the surface." |
| `forgot-mu` | Used the full weight as the friction force | "Friction depends on μ. Include it." |
| `centrifugal` | Adds an outward force in circular motion | "Circular motion needs a net inward force." |
| `ke-conserved-inelastic` | Conserves KE in an inelastic collision or explosion | "Momentum is conserved; KE is not." |
| `momentum-external-force` | Conserves momentum while an external force acts | "An external force acts, so momentum changes." |
| `mass-matters` | Keeps mass where it cancels | "Check if mass cancels out." |
| `linear-vs-angular` | Mixes linear and angular quantities | "Rotating? Use the angular version." |
| `ke-conserved-rotation` | Conserves KE when I changes | "Angular momentum is conserved here, not KE." |
| `moi-depends-on-omega` | Thinks I depends on spin rate | "I depends on where the mass is, not on the speed." |
| `moi-shape-swap` | Swaps which shape has the larger I | "More mass far from the axis gives a larger I." |
| `moi-mass-only` | Thinks equal mass means equal I | "Where the mass sits matters too." |
| `moi-axis-free` | Thinks I doesn't depend on the axis | "I depends on the axis." |
| `pair-unequal` | Thinks the forces of a pair differ in size | "The two forces of a pair are always equal." |
| `pair-delay` | Thinks the reaction comes after the action | "The two forces exist at the same time." |
| `pair-contact-only` | Thinks pairs need contact | "Gravity forms pairs without contact." |
| `pair-wrong-bodies` | Picks a force between other bodies | "A pair involves the same two bodies." |
| `free-fall-reading` | Expects a zero reading without free fall | "The reading is zero only in free fall." |
| `force-wrong-source` | Names a force that can't act that way here | "Ask what force actually points that way." |
| `omitted-friction` | Leaves friction off a block at rest on a slope | "Without friction the block would slide." |
| `ke-half-at-top` | Thinks KE halves at the top for any angle | "KE at the top depends on the angle." |
| `ke-pe-confusion` | Ties KE to PE instead of speed | "KE depends on speed." |
| `gravity-off-in-flight` | Leaves gravity out during flight | "Gravity still acts in flight." |
| `speed-constant` | Thinks speed stays constant in flight | "Only the horizontal velocity stays constant." |
| `graph-shape` | Picks the wrong curve shape | "A straight s–t line means constant velocity." |
| `swapped-support` | Swaps which support takes more load | "Moving towards Q puts more load on Q." |

### Concept (C): Electricity (seed, **TBC with teacher**)
| Tag | Meaning | Student message |
|---|---|---|
| `current-used-up` | Thinks current falls along a series circuit | "Current is the same all the way round a series circuit." |
| `series-parallel-swap` | Uses the series rule for parallel, or the reverse | "Check how the components are connected." |
| `meter-placement` | Places an ammeter in parallel or a voltmeter in series | "Ammeters go in series. Voltmeters go in parallel." |
| `emf-vs-terminal-pd` | Ignores the drop across internal resistance | "Terminal pd = E − Ir when current flows." |
| `capacitor-rule-swap` | Uses the resistor combination rule for capacitors | "Capacitors combine the opposite way to resistors." |
| `field-vs-potential` | Confuses electric field with potential | "Field is a vector. Potential is a scalar." |
| `negative-charge-direction` | Forgets a negative charge feels the opposite force | "A negative charge feels the opposite force." |
| `hand-rule-direction` | Misapplies the magnetic force or field rule | "Set out the directions, then apply the rule." |
| `closed-loop-swap` | Confuses electric and magnetic field line shapes | "Only magnetic field lines form closed loops." |

Other units add their Concept tags before their content is generated. Other subjects use a prefix: `chem.mole-ratio`.

---

## 8. Grading

Grading and skill mastery are app behaviour, so they live in the [product spec](product-spec.md#grading-rules). Authors only need these rules:
- Every item must work with automatic grading.
- Each wrong option's tag feeds the mistake notebook, so the tag must name the actual mistake.
- A small template pool (below V7) is scheduled as L2 cards.

---

## 9. Coverage targets per skill

Coverage depends on the skill's `type`.

| Skill type | L1 | L2 | L3 | L4 |
|---|---|---|---|---|
| **recall** | 2–4 cards | Optional | None | None |
| **conceptual** | 2–4 cards | 3–6 cards, at least 1 F14 or F13 | Optional | Optional statement bank |
| **procedural** | 1–3 cards | 3–6 cards, at least 1 F14 or F13 | 1 pool, ≥ 6 scenarios | 1–2 templates, each ≥ 20 unique variants |
| **method-selection** | Optional | 1–3 cards | 1 pool, ≥ 6 scenarios | Optional |

Every skill has 1 micro-note (`note_ref`).

**Pilot:** the [MVP cut](product-spec.md#mvp-cut-physics-pilot) allows about 30–50 L4 templates across 2–3 units. Give them to the procedural skills with the highest `exam_weight`, and include F44 for skills whose real questions usually have figures. The other procedural skills start with L1–L3 only.

---

## 10. Workflow and statuses

```
draft → auto-checked → teacher-reviewed → published → retired
```
- **draft**: generated.
- **auto-checked**: passed §6.
- **teacher-reviewed**: a teacher signed off physics, wording, skill mapping and distractor realism.
- **published**: in content packs. Edits make a new `version`. Student history stays tied to the item ID.
- **retired**: removed from scheduling, history kept.

**At scale:** the teacher fully reviews templates, statement banks and tags, and spot-checks about 30% of fixed cards.

### Teacher review doc (per item)
- Item ID · layer · form · **skill ID + name** · difficulty 1–5 (teacher estimate)
- Stem and options, correct answer in bold, tag beside each distractor
- **Per mistake:** ☐ real mistake ☐ not real, once per template mistake, not per example
- Templates: 3 sample variants, chosen to cover the parameter range and each case (e.g. acceleration up and down)
- ☐ OK · ☐ Fix: ______
- Sinhala/Tamil text beside the English (once translated)

---

## 11. Sources and copyright

- Past papers are **inspiration only**. Never copy wording, numbers or diagrams from a source question.
- `source_ref` (e.g. `2023-17`) is internal metadata, used for exam-weight tagging. It is never shown as "this is the 2023 question".
- Errors found in source data are logged in `source-issues.md` with the paper, the question and the evidence.
- Whether past papers can be used commercially at all is still [open legal question L1](legal-and-privacy.md#open-legal-questions).

---

## 12. Changes to this spec

- New form, rule, or closed-list tag → write a change note (what, why, an example) → teacher + owner approve → bump the spec version.
- New unit's Concept tags → the teacher and owner approve the whole set once, before that unit's content is generated. A later addition needs a one-line note.
- Generators must state the spec version they used in each batch's header.

---

## 13. TBC with teacher

1. Statement-grid option set and order (§5.6)
2. Decimal mark: 0·5 or 0.5 (§5.2)
3. Symbol list per unit from the NIE textbook (§5.2)
4. Sinhala/Tamil glossary file: who owns it, where it lives (§5.7)
5. Parameter whitelists per unit (V3)
6. Electricity Concept tags (§7)
7. Sinhala glossary corrections, listed at the top of the sample's review document (§5.7)

---

## 14. Changes

### v0.5: from translating the Mechanics sample
- **V15** checks translations. **§5.7** records glossary traps and how templates translate.

### v0.4: from review of the rebuilt sample
- **§7** freezes the tag list and requires `detail` on general tags. 15 Mechanics tags are added; 7 others from the sample are merged away.
- **V7** counts effective variants. **V9** caps options at 10× the answer. **V10** keeps one tag per value and tests tags it can.
- **F17** now asks for the valid value. V8 has no exemption.
- **F45** adds exam-strength items.
- **§10** lists each template mistake once, and adds a spot-check rule at scale.

### v0.3: from building the Mechanics sample
- **§3** F10 balance is per unit, as one or two cards per skill can't meet a percentage. F32 balance is per pool.
- **§4.2** adds `derived`, `exclude`, `verify_given`, `answer.dim` and `display`, which real templates needed. Range templates may share tags and use fewer distractors.
- **§4.4** adds `conflicts`, as a contradictory pair in a grid gives the answer away.

### v0.2

- **V1** now needs an independent check. Recomputing the same formula proved nothing.
- **V8** limits every answer position, not only max and min. Templates list at least 5 distractors, so the answer moves.
- **F44** and §4.5 add figure templates, since 293 of 500 real questions have a figure.
- **§4.2** example rebuilt, and it passes the checks.
- **V5** keeps different scenarios. **V6** applies only to never-correct values.
- **§7** is reorganised: closed Method, Execution and Reading lists, with Concept tags per unit. `recall-gap`, Electricity seed tags and missing Mechanics tags are added.
- **§4.1, §4.4** add spare options and statement banks.
- **V2** is 5%, not 10–15%. **V3** drops 37° and 53°, which matched no real paper text.
- **§5.3** sorts numeric options, and the length rule now targets a too-long correct option.
- **§5.1** allows about 5% negative stems, moves g to `constants`, and settles π.
- **§5.6** default option set changes to one that real papers use.
- **§8** grading moves to the product spec. **§9** coverage now depends on skill type.
- **F20/F21** are optional. **V13** now covers copying, and V14 is new.
