# Study Loop Changes 1–7 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Change the study-loop engine so the two failed "design must change" lines stop failing: no simulated student quits before day 7, and no weak student stays flat.

**Architecture:** Seven rule changes inside the existing pure engine (`engine/src`), each test-first, plus four new simulator checks that fail on today's engine and pass after. No new packages. The simulator, runner and judge tooling are updated only where the new rules add log lines, reasons or end states.

**Tech Stack:** TypeScript 6 strict, Node 24, vitest, tsx. No runtime dependencies.

**Spec:** [docs/superpowers/specs/2026-11-16-study-loop-design-changes.md](../specs/2026-11-16-study-loop-design-changes.md), changes 1 to 7 only (accepted by Viraj 2026-11-16, with decisions 1, 2 and 6). It amends [the study loop design](../specs/2026-11-12-study-loop-scheduler-design.md). Changes 8 to 15 are out of this plan. Evidence: [judge report](../../reviews/2026-11-16-judge-report-seed1.md).

## Global Constraints

- All rules of the first plan still hold: `engine/src/**` (except `src/node/**`) has no fs/path/React/Expo imports and no `Date.now()`, argument-less `new Date()`, `Math.random()`; never mutate inputs; same input ⇒ identical JSON; state survives a JSON round trip; new state fields defaulted in `newState` AND `migrate`; every tuning number in `engine/src/config.ts`, pinned in `engine/tests/config.test.ts`.
- Each behaviour change: failing unit test first. An existing test whose expectation changes because of this plan is updated and listed with the change number. No test is deleted to get green.
- Existing simulator checks are not weakened, except the two amendments this plan names (Task 2: `no-end-on-wrong` accepts a recap end; `no-repeat-14d` accepts a closing card that was right 3 or more days ago; `skip-timing` accepts a silent rejoin). Each amendment follows an accepted design decision.
- `simParams` (hidden student numbers) are not tuned in this plan.
- Work on `main` in `/Users/v4k8mac/Work/UniKey` (Viraj's earlier consent for engine work). Stage only files this plan names under `engine/` and `docs/`; never `git add -A`; other sessions have uncommitted work under `app/`.
- Levels: 1 easy, 2 guided, 3 full. "Miss" = wrong answer or "I don't know".
- Engine tests need the content packs' skill graphs, which exist in the working tree (uncommitted `app/` work by another session). Do not edit `app/`.

## Review Focus

1. **A skill with only one level.** Repair "always easier" has nothing easier. Expected: a different card of the same level only when the failed level is 1; otherwise a prerequisite's easy card; otherwise no repair card, and the skill is left. → Task 3.
2. **Too hard on a skill already at its lowest level.** Expected: the skill rests for `skip.tooHardRestDays` and leaves the session; the section stays. → Task 6.
3. **A reason sent late.** `setSkipReason(…, "too-hard")` after the section skip was already applied. Expected: the section skip is undone exactly (count, remind day, liking) and the card-level rule applied; only for the most recent skip in the open session. → Task 6.
4. **The ladder with thin content.** No eligible card at the ladder's level. Expected: nearest lower level, then nearest higher; never a stall. → Task 4.
5. **State saved before this plan.** Old state lacks the new fields, possibly with an open session. Expected: `migrate` defaults them; the open session continues. → every task that adds a field.

---

## File Structure

| File | Change |
|---|---|
| `engine/src/config.ts`, `tests/config.test.ts` | New numbers (each task) |
| `engine/src/types.ts` | New fields and reasons |
| `engine/src/repair.ts` | Change 1 |
| `engine/src/session.ts`, `engine/src/budget.ts` | Changes 2, 3, 7; wiring for 4, 5, 6 |
| `engine/src/ladder.ts` (new) | Change 4 |
| `engine/src/pick.ts` | Changes 4, 5, 7 |
| `engine/src/skip.ts` | Change 6 |
| `engine/src/state.ts` | Defaults and migrate |
| `engine/sim/checks.ts`, `sim/run.ts`, `sim/judge.ts`, `sim/student.ts` (reason protection list only) | Task 2 and follow-ups |
| `engine/README.md`, `docs/decisions/0051-…md`, `docs/decisions/index.md`, the changes doc status line | Task 1, Task 9 |

---

### Task 1: Decision record and status

**Files:**
- Create: `docs/decisions/0051-study-loop-rules-after-first-judge-pass.md`
- Modify: `docs/decisions/index.md` (one row), `docs/superpowers/specs/2026-11-16-study-loop-design-changes.md` (status line only)

- [ ] **Step 1:** Write DR-0051 in the layout of `docs/decisions/0047-…md`. Status `Accepted (Viraj, 2026-11-16)`. Extends DR-0048, DR-0049. Context: the judge pass (two of five lines met; cite the report). Decision: the seven changes as worded in the changes doc §2 rows 1–7, plus decisions 1 ("Too hard" is a card signal), 2 (a closing card may repeat after 3 days; a missed closing card ends in a recap with no question) and 6 (changes 1–7 first, then a second judge pass). Say plainly that DR-0050 stays Proposed and that changes 8–15 are not decided. Revisit trigger: the second judge pass still meets a "design must change" line.
- [ ] **Step 2:** Add the index row. Change the changes doc's status line to: `Status: changes 1–7 accepted (Viraj, 2026-11-16), see DR-0051; changes 8–15 draft · Nothing here is built.`
- [ ] **Step 3: Commit** `git add docs/decisions/0051-study-loop-rules-after-first-judge-pass.md docs/decisions/index.md docs/superpowers/specs/2026-11-16-study-loop-design-changes.md docs/superpowers/plans/2026-11-16-study-loop-changes-1-7.md && git commit -m "docs: DR-0051, study loop changes 1-7 accepted; plan"`

---

### Task 2: New simulator checks (they fail first)

**Files:**
- Modify: `engine/sim/checks.ts`, `engine/sim/run.ts`, `engine/tests/run.test.ts`

**Interfaces:**
- Consumes: `StudentLog`, `LogLine` from `sim/run.ts`.
- Produces: four checks added to `runChecks` after the existing seven, named exactly `repair-steps-down`, `no-long-zero-session`, `side-door-not-full`, `day-one-fit`. `LogLine` gains optional fields used later: `recap?: boolean` on `end` lines, `scope?: "card" | "section"` on `skip` lines, and a new kind `"rejoin"` with `section`. The runner fills them from engine output once Tasks 6 and 7 exist; until then they are absent.

Rules:
- `repair-steps-down`: for every `card` line with reason `repair:missing-piece`, find the nearest earlier answered `card` line in the same session that was a miss and not itself a repair card. Violation when the repair card's level ≥ that card's level, unless both are level 1 and the card ids differ.
- `no-long-zero-session`: violation when a session's `end` line has `right === 0` and `cards > 5`.
- `side-door-not-full`: violation for any served line with reason `side-door` and level 3.
- `day-one-fit`: for each student, session 1 only. Violation when the session contains 5 right answers in a row and no served card of level 2 or 3 at or after the fifth.
- Amendments to existing checks (same task, each with a planted test): `no-end-on-wrong` ignores an end whose `recap` is true; `no-repeat-14d` ignores a repeat when the later serve has reason `close:winnable` and the earlier answer on that card+variant was right at least `cfg.closing.repeatRightAfterDays` (3) days before; `skip-timing` treats a `rejoin` line as the section's return and ignores `skip` lines with `scope: "card"`.

- [ ] **Step 1: Write the failing tests** in `run.test.ts`, in the style of the existing planted-violation test (`onlyFails`): one planted violation per new check with isolation (its check fails, all others pass); one clean log per new check; one planted case per amendment showing the amended check now passes and, without the marker (`recap`, reason, `rejoin`), still fails.
- [ ] **Step 2: Run** `cd engine && npx vitest run tests/run.test.ts` → FAIL.
- [ ] **Step 3: Implement** the four checks and three amendments; add `closing: { repeatRightAfterDays: 3 }` to config (pinned).
- [ ] **Step 4: Run** all tests + `npx tsc --noEmit` → PASS.
- [ ] **Step 5: Baseline.** `npm run sim -- --days 28 --seed 1 --packs all --out runs/c0-s1` (also seeds 2, 3). Record the 11-row table per seed in the report. Expected today: the four new checks fail or partly fail; that is the starting point.
- [ ] **Step 6: Commit** `git add engine/sim/checks.ts engine/sim/run.ts engine/tests/run.test.ts engine/src/config.ts engine/tests/config.test.ts && git commit -m "sim: four checks for repair level, zero sessions, side door, day one"`

---

### Task 3: Repair always steps down; two misses leave the skill (changes 1, 2)

**Files:**
- Modify: `engine/src/repair.ts`, `engine/src/session.ts`, `engine/src/types.ts`, `engine/src/state.ts`
- Test: `engine/tests/repair.test.ts`, `engine/tests/session.test.ts`

**Interfaces:**
- Produces: `SessionState.leftSkills: string[]` (skills not served again this session; merged into every `PickCtx.excludeSkills`). `nextRepairCard` keeps its signature.

Rules:
- Missing-piece card (`stage: "piece"`), failed level F: allowed levels are those below F; when F is 1, level 1 (a different card: the recent-cards rule already excludes the failed one). Among allowed cards of the same skill: tag match first, then note match, then the rest; within a tier the lowest level first. If the skill has no allowed eligible card: a level-1 card of its `requires` skill with the lowest `expectedSuccess` (as today), then of a `helps` neighbour. If none: no repair card (stage skipped).
- The level-2 "only if it matches tag or note" exception is removed: a level-2 card is a valid piece for a level-3 failure, never for a level-2 failure.
- Confidence card: unchanged, but never at or above F unless F is 1.
- Two misses in a row on the same skill within a session (any reasons, "I don't know" included): push the skill to `leftSkills`, drop its repair and queued return, set its `nextReviewDay` to tomorrow, record a bad moment, and serve next the easiest eligible card from a different section (`pickClose` order with that section excluded; reason `comfort-correction`). This replaces the current "failed repair" branch and also covers two misses outside a repair.

- [ ] **Step 1: Write the failing tests**

```ts
// repair.test.ts
test("failed at level 2 → piece is level 1, never level 2, even with a tag match at level 2", …)
test("failed at level 3 → piece prefers a tag match at level 2 or 1, lowest level within the tier", …)
test("failed at level 1 → a different level-1 card of the same skill", …)
test("skill with only level-2 cards, failed at 2 → piece is a requires skill's level-1 card; none → no piece", …)   // Review Focus 1
test("confidence card is below the failed level (or level 1 when failed at 1)", …)
// session.test.ts
test("two misses in a row on a skill → skill in leftSkills, not served again this session, next card from another section at its easiest", …)
test("'I don't know' twice on a skill counts the same", …)
test("migrate defaults leftSkills on an open session", …)
```

- [ ] **Step 2: Run** → FAIL. **Step 3: Implement.** **Step 4: Run** all + tsc → PASS.
- [ ] **Step 5: Commit** `git commit -m "engine: repair cards step down; two misses leave the skill (changes 1, 2)"` (stage the files above)

---

### Task 4: First-session ladder (change 4)

**Files:**
- Create: `engine/src/ladder.ts`
- Modify: `engine/src/pick.ts` (remove fresh mode: `pickOpenFresh` and its `estimate.minOwnPrior` gate in `pickOpen`), `engine/src/session.ts`, `engine/src/types.ts`, `engine/src/state.ts`, `engine/src/config.ts`
- Test: `engine/tests/ladder.test.ts`, `engine/tests/session.test.ts`, `engine/tests/pick.test.ts`

**Interfaces:**
- Produces:

```ts
// state
State.ladder: { level: Height; rightRun: number } | null     // null once sessionCount > budget.firstSessions
// config
ladder: { upAfterRight: 2 }
// ladder.ts
ladderAfterAnswer(l: { level: Height; rightRun: number }, right: boolean, cfg: Config): { level: Height; rightRun: number }
pickLadder(state: State, content: Content, ctx: PickCtx, cfg: Config): Picked | null     // reason "open:liked" for the first session.openCards cards, else "new:class-topic" / "new:exam-weight" / "due-review" as the skill warrants
```

Rules:
- `newState` sets `ladder = { level: 1, rightRun: 0 }`. It is used while `sessionCount <= budget.firstSessions`; `startSession` sets it to `null` after that. `migrate`: a state with `answered > 0` and no `ladder` gets `null`; a fresh one gets the default.
- `ladderAfterAnswer`: right → `rightRun + 1`; at `upAfterRight` the level goes up one (max 3) and `rightRun` resets. Miss → level down one (min 1), `rightRun = 0`. Repair, confidence, closing and drip cards do not move the ladder.
- While the ladder is active, open and middle picks (not repair, return, side door, drip, close) come from `pickLadder`: candidates are unblocked skills that are started or ready, each at the ladder level if it has an eligible card there; order: liked sections, then due skills, then current topic, then weight, then id. If no skill has an eligible card at the level: nearest lower level, then nearest higher (Review Focus 4). A new skill served this way gets its record at the served level.
- A right answer at a level above a skill's recorded level sets the record to that level (the ladder is the step-up rule in these sessions). A miss follows the normal repair path (Task 3).
- The first `budget.firstSessions` sessions keep the minimum-day budget (unchanged).

- [ ] **Step 1: Write the failing tests**

```ts
// ladder.test.ts
test("starts at 1; two right → 2; two more → 3; stays 3", …)
test("a miss drops one level and resets the run; never below 1", …)
test("no card at the level → nearest lower, then nearest higher", …)
test("repair and closing cards do not move the ladder", …)
// session.test.ts
test("session 1, all right: cards 1–2 easy, card 3 guided, a full card by card 5 when one fits the budget", …)
test("session 1, all wrong: every non-repair card is easy", …)
test("session 4 does not use the ladder; ladder is null", …)
test("ladder level carries from session 1 to session 2", …)
test("migrate: old state with answers gets ladder null; an open session continues", …)
// pick.test.ts
update or remove the fresh-mode tests (list each with "change 4")
```

- [ ] **Step 2: Run** → FAIL. **Step 3: Implement.** **Step 4: Run** all + tsc → PASS.
- [ ] **Step 5: Commit** `git commit -m "engine: first sessions use a ladder instead of easy-only (change 4)"`

---

### Task 5: Push difficulty up (change 5)

**Files:**
- Modify: `engine/src/pick.ts`, `engine/src/session.ts`, `engine/src/types.ts`, `engine/src/config.ts`
- Test: `engine/tests/pick.test.ts`, `engine/tests/session.test.ts`

**Interfaces:**
- Produces: reason `"stretch:up"` added to `Reason`; config `comfort: { …, pushUpBand: 0.1 }` and `estimate: { …, minRunning: 3 }`.

Rules:
- In `pickMiddle`, when the ladder is not active, `runningTotal ≥ estimate.minRunning` and `runningRight / runningTotal ≥ profile.comfort + comfort.pushUpBand`: before the usual order, try (a) a started, unblocked skill not in a repair, with an eligible card one level above its recorded level, highest `expectedSuccess` at its current level first; serve that card with reason `stretch:up`; (b) else a new ready skill even when `maxNewSkills` is used up (one extra per session). If neither exists, the usual order.
- A right answer on a `stretch:up` card sets the skill's recorded level to the card's level. A miss changes nothing on the record and starts the normal repair (which steps down from the stretch level).
- Not during the first `session.openCards` cards, a repair, closing, or "5 more".
- The sim student's protected-reason list (`sim/student.ts`: reasons never skipped) is not changed: a stretch card may be skipped.

- [ ] **Step 1: Write the failing tests**

```ts
test("4 of 4 right, comfort 0.75 → next middle card is stretch:up one level above the skill's level", …)
test("3 of 4 right (0.75 < 0.85) → no stretch", …)
test("fewer than 3 answers → no stretch", …)
test("right on a stretch card → record moves to that level; miss → record unchanged and repair card is below the stretch level", …)
test("no skill can go up → one extra new skill beyond maxNewSkills", …)
test("never during repair, closing or '5 more'", …)
test("stretch is off while the ladder is active", …)
```

- [ ] **Step 2: Run** → FAIL. **Step 3: Implement.** **Step 4: Run** all + tsc → PASS.
- [ ] **Step 5: Commit** `git commit -m "engine: stretch cards when a student is well above target (change 5)"`

---

### Task 6: "Too hard" is about the card; side door is never a full problem (change 6)

**Files:**
- Modify: `engine/src/skip.ts`, `engine/src/session.ts`, `engine/src/types.ts`, `engine/src/state.ts`, `engine/src/config.ts`, `engine/sim/run.ts` (pass the reason at skip time; log `scope` and `rejoin`)
- Test: `engine/tests/skip.test.ts`, `engine/tests/run.test.ts`

**Interfaces:**
- Produces:

```ts
// config
skip: { …, tooHardRestDays: 3 }
// types
SectionRec.skippedLevel: Height | null                    // level of the card whose skip put the section away
SessionState.lastSkip: { section: string; skill: string; level: Height; before: SectionRec | null; card: string } | null
EngineEvent.type: … | "section_rejoined"
// skip event data gains scope: "card" | "section"
```

Rules:
- `skip(…, { reason: "too-hard" })`: card-level. The section is not put away: no count, no remind day, no liking change, no value message, no confirm step. The skill's record goes down one level that has cards (`stepDownOnce`); the skill joins `leftSkills`; its repair and queued return are dropped. If it is already at its lowest level (Review Focus 2): `nextReviewDay = day + skip.tooHardRestDays`, and it joins `leftSkills`. Costs no effort. Event `skip` with `scope: "card"`.
- `skip` with reason `not-learned`, `later` or none: section-level as today, with `scope: "section"`, and `skippedLevel` = the card's level. `lastSkip` remembers the section's record before the skip.
- `setSkipReason(…, "too-hard")` (Review Focus 3): when `lastSkip` is this section and the session is still open, restore the section record from `lastSkip.before` (delete the record when `before` is null), remove the section from the session's blocked list, then apply the card-level rule to `lastSkip.skill`. Otherwise it only sets `lastReason`, as today.
- Too hard on a drip or side-door card: card-level as above; the section's skipped state is unchanged.
- Side door: candidate levels are below `skippedLevel`, never 3; when `skippedLevel` is 1 or null, level 1. No eligible card under that rule on or after the remind day: the section rejoins silently (`returned = true`, `remindDay = null`, skills at their lowest level, `noFullUntilDay` set, event `section_rejoined`). The existing "higher level so the section never fails to come back" fallback is removed.
- Runner: passes the hidden student's reason in the `skip` call; writes `scope` on skip lines and a `rejoin` line for each `section_rejoined` event.

- [ ] **Step 1: Write the failing tests**

```ts
test("too-hard: section record untouched, skill one level down, skill not served again this session, no effort", …)
test("too-hard at the lowest level: skill rests 3 days, section stays", …)
test("too-hard never returns confirm-skip, even on a section skipped before", …)
test("later / not-learned / no reason: section skip as before, skippedLevel recorded, scope section", …)
test("setSkipReason too-hard after a section skip: section record restored exactly, section unblocked, skill stepped down", …)
test("setSkipReason too-hard for an older skip or a closed session: only lastReason changes", …)
test("side door after skipping a level-3 card is level 2 or 1; after a level-2 card is level 1; never level 3", …)
test("no card below the skipped level: section rejoins with a section_rejoined event and no side-door card", …)
test("migrate defaults skippedLevel and lastSkip", …)
// run.test.ts
test("runner logs scope on skips and a rejoin line", …)
```

- [ ] **Step 2: Run** → FAIL. **Step 3: Implement.** Update existing skip tests that assumed too-hard is a section skip or the higher-level side-door fallback (list each with "change 6"). **Step 4: Run** all + tsc → PASS.
- [ ] **Step 5: Commit** `git commit -m "engine: too hard is a card signal; side door below the skipped level (change 6)"`

---

### Task 7: Bad moments, short sessions after a near-zero day, closers that can be won, recap ending (changes 3, 7)

**Files:**
- Modify: `engine/src/session.ts`, `engine/src/budget.ts`, `engine/src/pick.ts`, `engine/src/types.ts`, `engine/src/state.ts`, `engine/src/config.ts`, `engine/sim/run.ts` (log `recap`)
- Test: `engine/tests/session.test.ts`, `engine/tests/pick.test.ts`

**Interfaces:**
- Produces:

```ts
// config
badDay: { moments: 2, withinCards: 8, slowFactor: 2, slowRun: 3, missRun: 3 }     // moments 3 → 2
budget: { …, lowRight: 2, lowRightMinCards: 3 }
sessionEnd: { maxExtraClose: 0 }                                                  // 2 → 0
closing: { repeatRightAfterDays: 3 }                                              // added in Task 2
// types
Seen.right?: boolean                              // set when the card is answered
EndInfo.recap: boolean                            // true when the session ended on a recap, not a question
EndInfo.fixedSkills: string[]                     // skills fixed today, for the recap text
State.lastSession: { cards: number; right: number } | null
Reason: … | "open:easy"
```

Rules:
- Change 3a: `missRun` misses in a row anywhere in a session (any skills) record one bad moment at the last of them (once per run: the run counter restarts after it). The two-misses-on-a-skill bad moment from Task 3 stays. `badDay.moments` is 2.
- Change 3b: when the last session had `cards ≥ lowRightMinCards` and `right ≤ lowRight`, the next session's budget is `budget.minimumDay` and its first `session.openCards` cards come from the closing order (easiest eligible anywhere) with reason `open:easy`.
- Change 7a: a closing card may repeat inside `noRepeatDays` when it was last answered right at least `closing.repeatRightAfterDays` days ago; only `pickClose` and the closing sweep get this; such candidates rank after never-seen cards of the same level and before any higher level.
- Change 7b: one closing card. If it is missed, the session ends with the pending kind, `recap: true`, and `fixedSkills` = skills with a right answer on a `repair:missing-piece`, `repair:confidence` or `repair:return` card this session (may be empty). No extra closing cards (`maxExtraClose` 0). A session ending this way keeps the streak under the existing rules. Every other end has `recap: false`.
- Runner: copies `recap` to the end line.

- [ ] **Step 1: Write the failing tests**

```ts
test("three misses in a row on three skills → one bad moment; a fourth miss does not add another until a new run of three", …)
test("two bad moments within 8 cards → one easy closing card → end bad-day", …)
test("after a session with 4 cards and 1 right: next budget is 8 and the first two cards are open:easy at the easiest level", …)
test("after a 2-card session with 0 right: no low-right treatment", …)
test("closing card may be a card answered right 3 days ago; not one answered right 2 days ago; not one answered wrong", …)
test("a repeat closer ranks after an unseen card of the same level and before any higher level", …)
test("missed closing card → end with recap true and fixedSkills listing today's fixed skills; no second closing card", …)
test("right closing card → recap false", …)
test("migrate defaults lastSession; Seen without `right` is treated as not right", …)
```

- [ ] **Step 2: Run** → FAIL. **Step 3: Implement.** Update existing tests that assert extra closing cards or three bad moments (list each with "change 3" or "change 7"). **Step 4: Run** all + tsc → PASS.
- [ ] **Step 5: Commit** `git commit -m "engine: miss runs, short session after a near-zero day, winnable closers, recap ending (changes 3, 7)"`

---

### Task 8: Judge packets and README follow the new rules

**Files:**
- Modify: `engine/sim/judge.ts`, `engine/tests/judge.test.ts`, `engine/README.md`

- [ ] **Step 1: Write the failing tests:** the readable log shows a recap end as its own line (`— end: recap of what was fixed today (no question), …`), a card-level skip as `skipped this card ("Too hard")` distinct from a section skip, a `rejoin` line (`<section> is back in normal practice`), and the legend lists `stretch:up`, `open:easy` and what a recap is; the leak test still passes on a 28-day run.
- [ ] **Step 2: Run** → FAIL. **Step 3: Implement**; update README: the `skip` reasons and scopes, `setSkipReason("too-hard")` conversion, `EndInfo.recap` / `fixedSkills` and what the UI shows, new reasons, `section_rejoined`. **Step 4: Run** all + tsc → PASS.
- [ ] **Step 5: Commit** `git commit -m "sim: judge packets and README follow changes 1-7"`

---

### Task 9: Rerun, tune numbers, write up

**Files:**
- Modify: `engine/src/config.ts` + `engine/tests/config.test.ts` (numbers only), `engine/runs-notes/2026-first-tuning.md` (new dated section)

- [ ] **Step 1:** Run seeds 1, 2, 3 (`--out runs/c1-s1` …). Record the 11-row checks table per seed next to the Task 2 baseline.
- [ ] **Step 2:** Targets: all eleven checks pass on all three seeds; no persona quits the app before day 7; no persona with starting knowledge ≤ 0.3 that keeps practising gains less than 0.05; weak personas' effort per session not above strong's. For each miss: find the cause in the logs. A wrong rule is fixed with a failing unit test first; a wrong number is changed in `config.ts`. At most 3 rounds of change → 3 seeds. Do not weaken a check; do not tune `simParams`.
- [ ] **Step 3:** Write "After changes 1–7" in the notes: tables before and after; per persona: days played, quit day, sessions, cards and effort per session, success rate, knowledge day 0 → end, recap ends, card-level skips, rejoins, stretch cards, ladder level at the end of session 1 and 3; every number changed old → new with reason; what still misses a target and why; anything that got worse.
- [ ] **Step 4: Commit** `git add engine/src/config.ts engine/tests/config.test.ts engine/runs-notes/2026-first-tuning.md && git commit -m "engine: tuning after changes 1-7"`
- [ ] **Step 5: Stop and hand over.** Report the tables to Viraj and ask before the second judge pass (about 41 agent runs).

---

## Spec coverage

| Changes doc | Task |
|---|---|
| Change 1 repair always easier | 3 |
| Change 2 two misses leave the skill | 3 |
| Change 3 miss runs, near-zero day | 7 |
| Change 4 ladder | 4 |
| Change 5 push up | 5 |
| Change 6 too hard, side door | 6 |
| Change 7 closers, recap | 7 |
| §5 checks: repair-steps-down, no-long-zero-session, side-door-not-full, day-one-fit | 2 |
| §5 check moments-true | Not in this plan (belongs to change 8) |
| §3 content needs | Not in this plan: content work. The engine falls back as each task states. |
| Decisions 1, 2, 6 | 1 (DR-0051) |
| Changes 8–15, decisions 3–5 | Not in this plan |
