# Judging a simulator run (runbook)

How a Claude Code session turns one 28-day simulator run into the judged report of spec §13 ("What each judge agent is told", "Two extra judges", "Output"). The code side (`engine/sim/judge.ts`) builds self-contained packets and collects the reports; AI judge agents do the judging in between.

**Launching judge agents needs Viraj's go-ahead.** A full pass is about 40 agent runs (16 student judges, 8 blind judges, 16 truth checks) plus one summary agent, and it spends tokens. Do steps 1 and 2, then stop and ask him before step 3.

All commands run from `engine/`. Replace `<name>` with the run's folder name, for example `t1-s1`.

## 1. Run the simulator

```sh
npm run sim -- --days 28 --seed 1 --packs all --out runs/<name>
```

It writes, per persona, `runs/<name>/<id>.log.jsonl` and `<id>.summary.json`, plus `checks.json`, and prints the seven code checks. It exits 1 when a code check fails; the files are still written and judging can go ahead (the checks appear in the report). `runs/` is git-ignored.

## 2. Build the packets

```sh
npm run judge -- packets --run runs/<name>
```

This writes into `runs/<name>/judge/`:

| File | Count | For | Contains |
|---|---|---|---|
| `student-<id>.input.md` | 16 | one student judge each | the student-judge prompt, the persona sheet, the four-week log as readable lines |
| `blind-<a>-<b>.input.md` | 8 | one blind judge each | the blind prompt, two questions, two logs labelled Student X and Student Y (no sheets, no persona ids) |
| `blind-<a>-<b>.key.json` | 8 | `collect` only | which persona is X and which is Y, and the right answer to each question. **Never give a key to an agent.** |
| `truth-<id>.input.md` | 16 | one truth-check judge each | the truth-check prompt, the hidden traits, hidden knowledge at day 0 / 14 / end, the engine's four profile numbers by day |

Student and blind packets contain no hidden traits, no knowledge numbers, no profile numbers and no check results; `tests/judge.test.ts` checks this on real packets. The same run folder always gives byte-identical packets. Before asking for the go-ahead, open one student packet and one blind packet and read them as a judge would.

**Stop here and ask Viraj** whether to launch the judges (about 40 agent runs).

## 3. Dispatch the judges

Dispatch **one fresh subagent per `*.input.md` file** (40 of them; they are independent and can run in parallel batches). Each one gets exactly this instruction and nothing else, with the file's path filled in:

> Read `runs/<name>/judge/<file>.input.md` and write your report to `runs/<name>/judge/<file>.report.md`. Do not read any other file in this folder.

Rules for the judge agents:
- **Fresh:** a new agent with no context from this session. Do not fork this conversation, do not summarise the run, the personas, the traits or the design for them, and do not answer their questions about other students. Everything a judge needs is in its packet.
- **No access to keys, traits or other students' files:** a student or blind judge must never see a `*.key.json`, a `truth-*` packet, `*.summary.json`, `*.log.jsonl`, `checks.json`, `engine/sim/personas.ts` or another student's packet or report. A truth-check judge sees only its own `truth-<id>.input.md` (which does hold that student's traits, by design).
- One packet per agent. Do not reuse an agent for a second packet.
- The blind packets' file names name the two personas of the pair (the brief's naming); the X/Y order inside is set from the run seed and is only in the key file, which the agent never sees.

## 4. Collect the reports

```sh
npm run judge -- collect --run runs/<name>
```

This reads every `*.report.md`, validates its JSON block, marks blind answers against the keys and writes `runs/<name>/judge/summary-input.md`. It prints the invalid entries: a missing report, a report without a fenced `json` block, invalid JSON, a score outside 1–5, a score with no quote, a quote that is not a line of that student's packet log, a malformed quit point or blind answer. Invalid entries are listed in the summary input and not scored; the rest of the same report still counts.

If a report is invalid, you may delete it and dispatch one more fresh agent for that packet (same instruction), then run `collect` again. Say in your hand-over which ones were re-run.

## 5. Dispatch the summary agent

One more fresh subagent, with exactly this instruction:

> Read `runs/<name>/judge/summary-input.md` and write your report to `runs/<name>/judge/report.md`. Do not read any other file in this folder.

`summary-input.md` starts with the summary prompt (`engine/judge/prompts/summary.md`), then the data: the five "design must change" lines marked met / not met with evidence, the persona × rubric score table, quit points, blind accuracy per pair, truth-check misses, the seven code checks, hidden knowledge, the invalid entries and every student's quotes and words.

## 6. Hand over

Give Viraj `runs/<name>/judge/report.md` (the final report: one ranked summary page, "where the app failed which kind of student", then one page per student). It is under the git-ignored `runs/` folder; copying it into the docs is his call. If any "design must change" line is met, the change goes back to the design spec first, then to a new plan, not straight into code.

## Prompts

`engine/judge/prompts/` holds the four prompts: `student-judge.md` (spec §13 "What each judge agent is told" and the rubric, verbatim), `blind-comparison.md` (below its builder marker, the table of the two questions per pair and their answers, which the packet builder reads), `truth-check.md` and `summary.md`. Edit a prompt, then rebuild the packets (step 2).
