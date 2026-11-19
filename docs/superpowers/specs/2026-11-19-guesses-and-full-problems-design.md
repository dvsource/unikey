# Study loop: guesses and full problems (design)

_Date: 2026-11-19 · Status: accepted (Viraj, 2026-11-19), three numbers as first versions · Plan: [2026-11-19-guesses-and-full-problems.md](../plans/2026-11-19-guesses-and-full-problems.md) · Nothing here is built._

Next step after the [second judge pass](../../reviews/2026-11-19-judge-report-seed1-pass2.md). It takes changes 11 and 12 from the [design changes doc](2026-11-16-study-loop-design-changes.md) and adds one new rule. All lines are **(my call)** until Viraj accepts them.

## 1. Why

Three findings from the second judge pass:

| # | Finding | Evidence |
|---|---|---|
| A | Fast guesser stays flat (+0.028 in 28 days). Wrong answers in 1 to 5 seconds are treated as gaps in knowledge, and fast right answers move the student up. A "level up" message was followed by a 5-second wrong answer on a full problem. | fast-guesser page; "design must change" line 3 |
| B | Full problems keep coming for a student who fails them. memory-good-calc-weak: 121 of 131 guided cards right, 0 of 17 full problems right. The calculation-versus-concept number never moves (it needs 6 full problems in the last 60 answers). | memory-good-calc-weak page; truth check |
| C | A full problem on the same skill the day after "I don't know" on it. | memory-good-calc-weak, slow-reader, steady-five-min |

## 2. Rules

### Rule 1: a fast wrong answer is a guess (change 12)

- **What counts as a guess.** A wrong answer faster than a third of the student's usual time at that level. While the usual time is not known yet (fewer than 5 answers at that level), the line is a fixed floor: 4 seconds for easy, 6 for guided, 10 for full. "I don't know" is never a guess.
- **A guess is not evidence about the skill.** It does not:
  - step the skill down;
  - reset its review gap;
  - count toward "two misses leave the skill" or the miss run;
  - move the ladder, the memory number, the calculation-versus-concept number or the comfort level.
- **A guess still counts as a wrong answer for the session.** It costs the same effort, and the session still never ends on it: a recap follows as for any miss. The repair path still runs, because an easier card on the same skill helps a student who did not read.
- **A fast right answer is weak evidence.** A right answer under the same line does not count toward stepping up, the ladder or a stretch card, and does not trigger a "level up" message.
- **The nudge.** After 3 guesses in one session, the engine returns a one-line hint with the next card: "Not sure? Tap I don't know. It costs nothing." At most once per session. The engine provides the flag; the app shows the line.

### Rule 2: a full problem missed is rested (new)

- A miss (wrong or "I don't know", guesses excluded) on a full problem of a skill: no full problem on that skill for the next 2 days. The existing "no full problem until day N" field is used, never moved earlier.
- Two misses on full problems of the same skill in a row, across sessions: the skill also drops to guided (if it is above).

### Rule 3: notice a calculation-weak student sooner (change 11)

- The calculation-versus-concept number needs 3 full problems (not 6) in the last 60 answers.
- A calculation-weak student already gets a guided card before each full problem (the existing ramp). With rules 2 and 3 that student also sees fewer full problems on skills where they keep failing.

## 3. What this does not change

The levels, the repair path, the closing card and recap, skips, the effort budget, the daily cap, "5 more", stretch cards (apart from fast right answers not counting).

## 4. Checks and targets

- New simulator check `no-full-after-full-miss`: no full problem on a skill within 2 days of a non-guess miss on a full problem of that skill.
- New simulator check `guess-not-evidence`: no step-down, gap reset or ladder move caused by a guess (from the engine's events).
- All existing checks pass on seeds 1, 2, 3.
- Targets: fast-guesser gains at least 0.05 in 28 days on 2 of 3 seeds; memory-good-calc-weak's full-problem share falls and its success on full problems rises; no student gets worse on the four plan targets.
- Then a third judge pass with Codex.

## 5. Decisions for Viraj

1. The guess line: a third of the usual time, with fixed floors of 4 / 6 / 10 seconds. Fine as a first version?
2. The nudge wording "Not sure? Tap I don't know. It costs nothing." Fine?
3. Rest a missed full problem for 2 days. Fine?
