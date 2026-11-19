# Guesses and Full Problems Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A fast wrong answer is treated as a guess (not evidence about the skill), a missed full problem rests for 2 days, and a calculation-weak student is noticed sooner.

**Architecture:** Small rule changes in the existing pure engine (`engine/src/session.ts`, `skill.ts`, `profile.ts`, `config.ts`), one new simulator check, the runner and judge packets showing guesses, then a three-seed rerun.

**Tech Stack:** TypeScript 6 strict, Node 24, vitest, tsx.

**Spec:** [docs/superpowers/specs/2026-11-19-guesses-and-full-problems-design.md](../specs/2026-11-19-guesses-and-full-problems-design.md) (accepted by Viraj 2026-11-19, with its three numbers as first versions).

## Global Constraints

- Engine rules as before: `engine/src/**` (except `src/node/**`) pure, deterministic, inputs never mutated, state survives a JSON round trip, new fields defaulted in `newState`/`startSession` AND `migrate`, every tuning number in `config.ts` and pinned in `tests/config.test.ts`.
- Failing unit test first for each behaviour change; no test deleted to get green; changed expectations listed.
- Existing simulator checks not weakened; `simParams` and personas not tuned.
- Work on `main`; commit locally; do not push (Viraj approves each push).
- Implementers: Claude subagents. Reviewers: OpenAI Codex (`codex exec -s read-only … < /dev/null`), per the saved preference.

## Ruling on the spec (controller)

- **Guess line = the larger of the floor and a third of the usual time.** The spec says the floor applies only "while the usual time is not known". That would never catch the fast-guesser persona, whose usual time IS its guessing speed (about 1.2 s easy, 1.8 s guided, 4.8 s full). Using `max(floor, usual / 3)` keeps the spec's intent. Cost if wrong: a genuinely fast student's wrong answer under 4 / 6 / 10 seconds is called a guess (only wrong answers; a right answer is never a guess).
- **The spec's second check (`guess-not-evidence`) is covered by unit tests**, not a simulator check: the simulator log does not show step-downs or gap resets. Cost: none for behaviour.

## Review Focus

1. **Every answer a guess** (a student who always taps fast). Expected: repair cards still come, the session still ends on a recap, the skill's level never changes from guesses, the nudge shows once.
2. **Usual time unknown on day 1.** Expected: the floors apply.
3. **A guess on a closing card.** Expected: recap end as for any miss.
4. **A full-problem miss as the last card of the day.** Expected: the rest starts from that day; `noFullUntilDay` is never moved earlier.
5. **Old saved state.** Expected: `migrate` defaults the new session fields.

---

### Task 1: Guess detection and its effects (rule 1)

**Files:** `engine/src/config.ts`, `engine/src/session.ts`, `engine/src/types.ts`, `engine/src/state.ts`, `engine/src/profile.ts` if needed; tests `engine/tests/session.test.ts`, `engine/tests/config.test.ts`.

**Interfaces:**
- Config `guess: { fraction: 1/3, floorMs: { 1: 4000, 2: 6000, 3: 10000 }, nudgeAfter: 3 }` (pinned).
- `isGuess(state, height, right, choice, ms, cfg): boolean` (exported from a small module or `session.ts`): wrong (not "I don't know") and `ms < max(floorMs[height], (usualMs(state, height) ?? 0) * fraction)`.
- `answer` event data gains `guess: boolean`.
- `SessionState.guesses: number` (default 0, migrated).

**Rules** (spec §2 rule 1): a guess does not step the skill down, reset its review gap, set `firstFailedDay`, count toward "two misses leave the skill" or the miss run, move the ladder, move memory / calc-vs-concept / comfort. It still costs effort (cost of a wrong answer), still starts the normal repair, still counts as a miss for "the session never ends on a wrong answer" (recap), and is still recorded in `seen`. Implement by recording the attempt in a way `recordAttempt` cannot read as a miss (e.g. skip `recordAttempt` for a guess but still update `seen`, `answered`, effort, history with a `guess: true` mark) — choose the simplest form that keeps every other path working, and say what you chose.

- [ ] Step 1: failing tests: a 1-second wrong answer on a level-2 card (usual unknown) is a guess: skill height, `gapIndex`, `nextReviewDay`, `firstFailedDay`, ladder level, `profile.memory` unchanged; repair card served and easier; effort charged; `answer` event `guess: true`. A 9-second wrong answer at level 2 with usual 12 s is not a guess (floor 6 s, third of usual 4 s → line 6 s). "I don't know" in 0.5 s is not a guess. Two guesses on one skill do not leave the skill; three guesses do not record a bad moment. A guess on the closing card ends on a recap.
- [ ] Step 2: run → FAIL. Step 3: implement. Step 4: `cd engine && npx vitest run && npx tsc --noEmit` → PASS.
- [ ] Step 5: commit `engine: a fast wrong answer is a guess, not evidence about the skill (rule 1)`.

### Task 2: Fast right answers are weak evidence; the nudge (rule 1)

**Files:** `engine/src/session.ts`, `engine/src/skill.ts` or `ladder.ts` / `pick.ts` as needed, `engine/src/types.ts`; tests `engine/tests/session.test.ts`, `engine/tests/ladder.test.ts`, `engine/tests/pick.test.ts`.

**Rules:**
- A right answer under the same guess line does not count toward stepping up, the ladder's run, the stretch guard (most recent attempt at the level right), and does not produce a `height-up` moment. Its review gap still moves as normal (it was right).
- `Step.hint?: "guess-nudge"`: set on the step that follows the `guess.nudgeAfter`-th guess of the session, once per session.

- [ ] Step 1: failing tests: two right answers in 1 s each at level 2 do not step up (two right in 8 s each do); a fast right answer does not move the ladder run; a skill whose most recent attempt at its level was a fast right answer is not a stretch candidate; no `height-up` moment from a fast right answer; the third guess's step carries `hint: "guess-nudge"`, the fourth does not.
- [ ] Step 2–4 as Task 1. Step 5: commit `engine: fast right answers do not move a student up; guess nudge after three guesses`.

### Task 3: A missed full problem rests; calc weakness noticed sooner (rules 2, 3)

**Files:** `engine/src/session.ts` (or `skill.ts`), `engine/src/config.ts`; tests `engine/tests/session.test.ts`, `engine/tests/profile.test.ts`, `engine/tests/config.test.ts`.

**Interfaces:** config `full: { restDays: 2 }` (pinned); `calc.minH3` 6 → 3 (pinned group updated).

**Rules:**
- A non-guess miss on a level-3 card: the skill's `noFullUntilDay = max(existing ?? 0, day + full.restDays)`.
- Two non-guess misses on level-3 cards of the same skill in a row (its last two level-3 attempts, across sessions): if its recorded level is 3, drop it to 2 (step window restarted).
- `calc.minH3: 3`.

- [ ] Step 1: failing tests: wrong at level 3 on day D → no level-3 card of that skill on D, D+1; allowed on D+2; an existing later `noFullUntilDay` is kept; two level-3 misses in a row → record level 2; a guess at level 3 does not rest it; the calc-vs-concept number is computed from 3 level-3 attempts.
- [ ] Step 2–4. Step 5: commit `engine: a missed full problem rests 2 days; calc weakness from 3 full problems (rules 2, 3)`.

### Task 4: Runner, check, packets, README

**Files:** `engine/sim/run.ts`, `engine/sim/checks.ts`, `engine/sim/judge.ts`, `engine/README.md`; tests `engine/tests/run.test.ts`, `engine/tests/judge.test.ts`.

- Runner: card `LogLine` gains `guess?: boolean` from the engine's `answer` event; a `hint` LogLine kind for the nudge.
- New check `no-full-after-full-miss` (12th check): no served level-3 card on a skill within `full.restDays` days after a non-guess miss on a level-3 card of that skill. Planted test with isolation, clean log test.
- Judge packet: a guess shown as `wrong (guessed, 1s)`; the nudge line `the app suggests: "Not sure? Tap I don't know. It costs nothing."`; legend lines for both. Leak rules unchanged.
- README: guesses (what they do and do not do), `Step.hint`, the full-problem rest, the new config groups.

- [ ] Step 1: failing tests. Step 2–4. Step 5: commit `sim: guesses and the guess nudge in logs, checks and packets; README`.

### Task 5: Rerun, measure, write up

- [ ] Run seeds 1, 2, 3 (`npm run sim -- --days 28 --seed N --packs all --out runs/gf-sN`). All 12 checks pass.
- [ ] Measure per persona (fast-guesser, memory-good-calc-weak, weak-stubborn, weak-impatient, strong, slow-reader): guesses detected, nudges, knowledge gain, success rate, full problems served and right, quit day.
- [ ] Targets: fast-guesser gains ≥ 0.05 on 2 of 3 seeds; memory-good-calc-weak serves fewer full problems and gets more of them right; no persona worse on the four plan targets. If fast-guesser still misses, say why with numbers. Note: the simulated guesser does not respond to the nudge, and learns at half the average rate; the engine can only stop mislabelling it and keep it on cards it can learn from. Do not tune `simParams`.
- [ ] Append a dated section to `engine/runs-notes/2026-first-tuning.md`; commit `engine: notes after guesses and full-problem rest`.
- [ ] Hand over: Codex final review of the whole range, then ask Viraj about pushing and a third judge pass.
