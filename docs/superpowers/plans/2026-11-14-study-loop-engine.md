# Study Loop Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the adaptive study-loop engine as a pure TypeScript package, plus a text simulator where hidden students play 28 days against it and AI judges score the logs.

**Architecture:** A new top-level `engine/` package with no UI, network, clock or random calls: every public call takes `state` and `now` and returns a new state, the events to append, and the next step. Content (built packs + skill graphs) is indexed once into a `Content` object and passed in. A `sim/` folder holds code-only hidden students, a seeded runner, invariant checks and judge packets.

**Tech Stack:** TypeScript 6 (strict), Node 24, vitest for tests, tsx to run the CLI. No runtime dependencies.

**Spec:** [docs/superpowers/specs/2026-11-12-study-loop-scheduler-design.md](../specs/2026-11-12-study-loop-scheduler-design.md). Section numbers below (§4, §5 …) refer to it. Executors read both.

**Out of this plan:** spec build-order step 7 (wiring the engine into the Expo session screen and the "Your path today" trail). That is a separate plan after the agent runs have tuned the numbers. Nothing under `app/` is edited here.

## Global Constraints

- Engine code (`engine/src/**` except `engine/src/node/**`) must not import `fs`, `path`, React, Expo, or call `Date.now()`, `new Date()` with no argument, or `Math.random()`. Task 1 adds a test that greps for these.
- Same `state` + same call + same `now` ⇒ byte-identical JSON output. Randomness comes only from `state.rng` (a seeded counter).
- `State` and every event serialise with `JSON.stringify` and survive `JSON.parse` unchanged (no `Map`, `Set`, `Date`, `undefined`-valued keys that matter).
- The engine never mutates its inputs; it returns new objects.
- Every tuning number lives in `engine/src/config.ts` `defaultConfig`. No numeric literal for a spec value anywhere else in `engine/src`.
- Days are local days in Sri Lanka time: `dayOf(now) = floor((now + 330*60_000) / 86_400_000)`. `now` is always epoch milliseconds.
- A **section** id is `` `${topicId}/${subtopic}` `` from the graph skill.
- A card counts for `item.skills[0]` only.
- Heights: `L1` → 1; `L2` with form `F10` → 1; other `L2` and all `L3` → 2; `L4` → 3.
- Effort: height 1 = 1, height 2 = 1.5, height 3 = 4, wrong answer +1, "I don't know" +0. Default budget 12, minimum day 8, daily cap 40.
- Review gaps after a right answer: 1, 3, 7, 14, 30 days × memory (0.5–2.0). Wrong ⇒ back to 1 day.
- Skip remind times: 3, 5, 8, 13, then 14 days (cap 14).
- No card+variant repeats within 14 days.
- Commit only files under `engine/` and the two decision records. Other sessions have uncommitted work in `app/`; never `git add -A`, stash, reset or switch branch.

## Review Focus

1. **Content runs out.** With 56 skills and the 14-day no-repeat rule, a keen student can exhaust eligible cards. Expected: the session ends normally with end kind `content-exhausted` (keeps the streak if any card was answered), never a crash or a repeat. → Task 5.
2. **Clock goes backwards** (phone date changed, `now` earlier than the last event). Expected: the call is processed as if `now` = last event time; no review date moves earlier, nothing throws. → Task 4.
3. **Answer for a card that is not the current card** (double tap, stale screen). Expected: `answer` returns the unchanged state with the same `next` and no events. → Task 5.
4. **Session left open** (app killed; `startSession` called while a session is open, possibly on a later day). Expected: the open session is closed first as `interrupted` (not counted as "left early" for comfort or stamina), then a new one starts. → Task 5.
5. **State mentions a skill, section or card the content no longer has** (pack updated). Expected: those records are kept but ignored for selection; no throw. → Task 3.

---

## File Structure

```
engine/
  package.json            scripts: test, typecheck, sim, judge
  tsconfig.json
  src/
    config.ts             Config type + defaultConfig (every tuning number)
    types.ts              State, Served, Step, EngineEvent, Moment … (types only)
    time.ts               dayOf, DAY_MS
    rng.ts                seeded random: next(rng) → [value, rng]
    content.ts            buildContent(): index packs+graphs into Content
    state.ts              newState, migrate, effectiveNow
    skill.ts              per-skill rules: step up/down, solid, review gap
    estimate.ts           expectedSuccess, usualMs
    pick.ts               choose the next card (open / middle / close)
    repair.ts             repair path queue
    skip.ts               skip, remind, drip, side door, value message
    profile.ts            comfort, memory, calc-vs-concept, stamina, liking
    moments.ts            the five moments, max 2 per session
    session.ts            startSession, answer, skip, extend, endSession
    index.ts              public exports
    node/load.ts          loadFromRepo(): read built packs + note_refs from disk
  sim/
    student.ts            hidden student model (code, no AI)
    personas.ts           the 16 personas
    run.ts                CLI: play N days, write logs
    checks.ts             the six code invariants
    judge.ts              CLI: write judge packets + collect reports
  judge/
    JUDGING.md            runbook for the session that launches judge agents
    prompts/student-judge.md, blind-comparison.md, truth-check.md, summary.md
  tests/
    fixture.ts            tiny hand-made Content used by all unit tests
    *.test.ts
  runs/                   gitignored output
docs/decisions/0048-…, 0049-…
```

---

### Task 1: Decision records and package scaffold

**Files:**
- Create: `docs/decisions/0048-pilot-engine-simple-skill-schedule.md`, `docs/decisions/0049-effort-based-day-and-skip.md`
- Modify: `docs/decisions/index.md` (add two rows, same format as the DR-0047 row)
- Create: `engine/package.json`, `engine/tsconfig.json`, `engine/.gitignore`, `engine/src/config.ts`, `engine/src/time.ts`, `engine/src/rng.ts`, `engine/src/index.ts`
- Test: `engine/tests/config.test.ts`, `engine/tests/purity.test.ts`

**Interfaces:**
- Produces: `defaultConfig: Config`, `dayOf(now: number): number`, `DAY_MS`, `type Rng = { seed: number; n: number }`, `next(rng: Rng): [number, Rng]` (value in [0,1), mulberry32 over `seed + n`).

- [ ] **Step 1: Write the two decision records.** Follow the heading layout of `docs/decisions/0047-simulator-as-engine-acceptance-test.md` (Status, Date, Owner, Area, Source, Context, Options, Decision, Assumptions, Revisit triggers, Consequences). Status for both: `Accepted (Viraj, 2026-11-14)`. Source: the design spec.
  - **DR-0048**, `Supersedes in part: DR-0022`. Decision text is spec §12 row 1: for the pilot, heights plus review gaps scaled by a memory number replace FSRS per card + Elo per skill, implicit review weights and adaptive placement; graph, edge types, exam weights and soft gating are kept. Add one line: the text simulator in this plan runs before, not instead of, the backend simulator in DR-0047. Revisit trigger: pilot data shows review timing is clearly wrong for a group of students.
  - **DR-0049**, `Amends: DR-0019`. Decision text is spec §12 row 2 with the numbers from Global Constraints (minimum day 8 effort keeps the streak; bad-day early end keeps the streak; daily cap 40; "Not now" skip with remind times 3/5/8/13/14).
  - Note in both: the expert review's *proposed* DR numbers (0048–0059) were never written; those proposals shift up if adopted.

- [ ] **Step 2: Scaffold `engine/`.** `package.json`: `"name": "unikey-engine"`, `"private": true`, `"type": "module"`, devDependencies `typescript ~6.0.3`, `vitest`, `tsx`, `@types/node ^24`; scripts `"test": "vitest run"`, `"typecheck": "tsc --noEmit"`, `"sim": "tsx sim/run.ts"`, `"judge": "tsx sim/judge.ts"`. `tsconfig.json`: `strict`, `module`/`moduleResolution` `nodenext`, `target` `es2022`, `noEmit`, `resolveJsonModule`, include `src`, `sim`, `tests`. `.gitignore`: `node_modules`, `runs`. Run `cd engine && npm install`.

- [ ] **Step 3: Write the failing tests**

```ts
// tests/config.test.ts
import { defaultConfig as c, dayOf, next } from "../src";
test("spec numbers", () => {
  expect(c.effort).toEqual({ h1: 1, h2: 1.5, h3: 4, wrong: 1, dontKnow: 0 });
  expect(c.budget).toEqual({ staminaDefault: 13.34, margin: 0.1, minimumDay: 8, dailyCap: 40, comeback: 8, extendCards: 5 });
  expect(c.reviewGapsDays).toEqual([1, 3, 7, 14, 30]);
  expect(c.memory).toEqual({ default: 1, min: 0.5, max: 2, up: 1.05, down: 0.85 });
  expect(c.skipRemindDays).toEqual([3, 5, 8, 13, 14]);
  expect(c.comfort).toEqual({ default: 0.75, min: 0.65, max: 0.85, upOnQuit: 0.03, downOnStreak: 0.01, streakSessions: 3 });
  expect(c.noRepeatDays).toBe(14);
  expect(c.stepUp).toEqual({ rightInRow: 2, minCardsApart: 5 });
  expect(c.stepDown).toEqual({ wrongs: 2, window: 4 });
  expect(c.badDay).toEqual({ moments: 3, withinCards: 8, slowFactor: 2, slowRun: 3 });
  expect(c.session).toEqual({ openCards: 2, maxSameSkillRun: 3, maxNewSkills: 2, returnAfterCards: 4, winnable: 0.85, dripEverySessions: 2, maxMoments: 2 });
  expect(c.priors).toEqual({ h1: 0.85, h2: 0.7, h3: 0.5 });
  expect(c.calc).toEqual({ h3ShareDefault: 0.4, h3ShareCalcWeak: 0.5, h3ShareConceptWeak: 0.2, gapBaseline: 0.2, band: 0.15, minWeakerShare: 0.2 });
  expect(c.window).toEqual({ cards: 60, sessions: 7 });
  expect(c.moments).toEqual({ thenNowMinDays: 5, avoidedMinSkips: 2, avoidedRight: 4, avoidedOf: 5 });
  expect(c.returning).toEqual({ noFullDays: 2, awayDays: 3 });
  expect(c.tzOffsetMinutes).toBe(330);
});
test("dayOf uses Sri Lanka time", () => {
  expect(dayOf(Date.UTC(2027, 0, 15, 18, 29))).toBe(dayOf(Date.UTC(2027, 0, 15, 0, 0)));
  expect(dayOf(Date.UTC(2027, 0, 15, 18, 30))).toBe(dayOf(Date.UTC(2027, 0, 15, 0, 0)) + 1);
});
test("rng is repeatable", () => {
  const [a, r1] = next({ seed: 7, n: 0 }); const [b] = next({ seed: 7, n: 0 });
  expect(a).toBe(b); expect(r1).toEqual({ seed: 7, n: 1 }); expect(a).toBeGreaterThanOrEqual(0); expect(a).toBeLessThan(1);
});
```

`staminaDefault` 13.34 makes the default budget `13.34 × 0.9 ≈ 12` (spec §8). `returning.awayDays: 3` = "days away" before the comeback session applies (spec gives no number; my call).

```ts
// tests/purity.test.ts — read every file under src/ except src/node/, fail if any matches
// /Date\.now\(|new Date\(\)|Math\.random\(|from ["'](node:)?(fs|path)["']|react|expo/
```

- [ ] **Step 4: Run** `cd engine && npx vitest run` → FAIL (no `src/index`).
- [ ] **Step 5: Implement** `config.ts` (export `type Config = typeof defaultConfig`), `time.ts`, `rng.ts`, `index.ts` re-exporting them.
- [ ] **Step 6: Run** `npx vitest run && npx tsc --noEmit` → PASS.
- [ ] **Step 7: Commit**

```bash
git add engine/package.json engine/package-lock.json engine/tsconfig.json engine/.gitignore engine/src engine/tests docs/decisions/0048-pilot-engine-simple-skill-schedule.md docs/decisions/0049-effort-based-day-and-skip.md docs/decisions/index.md
git commit -m "engine: scaffold, config and decision records DR-0048, DR-0049"
```

---

### Task 2: Content index and test fixture

**Files:**
- Create: `engine/src/types.ts` (content types only for now), `engine/src/content.ts`, `engine/src/node/load.ts`, `engine/tests/fixture.ts`
- Test: `engine/tests/content.test.ts`

**Interfaces:**
- Produces:

```ts
type Height = 1 | 2 | 3;
type CardOption = { correct: boolean; tag?: string };
type Card = { id: string; skill: string; section: string; height: Height; poolId?: string;
              noteRef?: string; variants: CardOption[][] };          // variants[v] = options of variant v
type SkillDef = { id: string; unit: string; topic: string; section: string; weight: number;
                  requires: string[]; helps: string[]; cards: Record<Height, string[]>; name: string };
type SectionDef = { id: string; unit: string; topic: string; name: string; skills: string[]; weight: number };
type Content = { cards: Record<string, Card>; skills: Record<string, SkillDef>; sections: Record<string, SectionDef>;
                 topics: Record<string, { id: string; unit: string; sections: string[] }> };
buildContent(packs: RawPack[], noteRefs?: Record<string, string>): Content
loadFromRepo(repoRoot: string, packIds?: string[]): Content      // node only
fixture(): Content                                               // tests only
```

- `RawPack` is the shape of `app/assets/content/packs/*.json` (see `app/src/content/pack.ts` `Pack` and `app/src/content/graph.ts` `Graph`); declare only the fields used.
- `SkillDef` exists for every graph skill; `cards` lists are empty when a skill has no items. `SkillDef.helps` = both ends of `helps` edges; `requires` = `to` ids of `requires` edges whose `from` is this skill.
- `SectionDef.weight` = sum of its skills' `weight`. Item skills missing from the graph are dropped with no throw (none today).
- `loadFromRepo` reads `app/assets/content/packs/<id>.json` (default: all three pack ids in `app/content-packs.json`) and builds `noteRefs` by reading `note_ref` per item id from each pack's source `items.json` (`dir` in `content-packs.json`; scan `cards`, `pools`, `templates`, `banks` arrays). The built packs drop `note_ref` today; adding it to `build-content.mjs` belongs to the app-wiring plan.

**Fixture (exact):** unit `u`, topic `u.t1`. Section `u.t1/A` has skills `a1` (weight 0.1, no requires) and `a2` (0.3, requires `a1`). Section `u.t1/B` has `b1` (0.2) and `b2` (0.4, helps `a1`). Each skill has cards `<skill>.h1.1..3` (height 1, one variant), `<skill>.h2.1..3` (height 2, one variant), `<skill>.h3` (height 3, 20 variants). Every card has 4 options, option 0 correct, options 1–3 wrong with tag `recall-gap`, except: `a1.h3` option 1 tag `sign-error`; `a1.h1.2` option 1 tag `sign-error`; `a2.h3` and `a2.h2.2` have `noteRef: "n1"`. A second export `fixture({ drop: ["b2.h1.1", …] })` removes cards so tests can build skills with missing heights.

- [ ] **Step 1: Write the failing tests**

```ts
import { loadFromRepo } from "../src/node/load";
import { fixture } from "./fixture";
const real = loadFromRepo("..");
test("real packs index", () => {
  expect(Object.keys(real.skills).length).toBe(175);
  expect(Object.values(real.skills).filter(s => [1,2,3].some(h => s.cards[h as 1].length)).length).toBe(56);
  expect(Object.keys(real.cards).length).toBe(241);
});
test("height mapping", () => {
  expect(real.cards["phy.mech.c001"].height).toBe(1);                        // L1
  for (const c of Object.values(real.cards)) expect([1,2,3]).toContain(c.height);
  expect(Object.values(real.cards).filter(c => c.height === 3).length).toBe(33);   // 11+10+12 L4 items
});
test("note refs come through", () => {
  expect(Object.values(real.cards).some(c => c.noteRef?.startsWith("phy.mech.note."))).toBe(true);
});
test("fixture shape", () => {
  const f = fixture();
  expect(f.sections["u.t1/A"].skills).toEqual(["a1", "a2"]);
  expect(f.sections["u.t1/B"].weight).toBeCloseTo(0.6);
  expect(f.skills.a2.requires).toEqual(["a1"]);
  expect(f.cards["a1.h3"].variants.length).toBe(20);
  expect(f.cards["a1.h3"].variants[0][1].tag).toBe("sign-error");
});
```

- [ ] **Step 2: Run** `npx vitest run tests/content.test.ts` → FAIL.
- [ ] **Step 3: Implement** `buildContent`, `loadFromRepo`, `fixture`.
- [ ] **Step 4: Run** → PASS. If a count differs because content changed since 2026-11-14, confirm with `python3 -c` against the pack JSON and update the number, not the mapping.
- [ ] **Step 5: Commit** `git add engine && git commit -m "engine: content index and test fixture"`

---

### Task 3: State and per-skill rules

**Files:**
- Modify: `engine/src/types.ts`
- Create: `engine/src/state.ts`, `engine/src/skill.ts`
- Test: `engine/tests/skill.test.ts`, `engine/tests/state.test.ts`

**Interfaces:**
- Produces:

```ts
type Attempt = { day: number; seq: number; height: Height; right: boolean; ms: number; card: string };
type SkillRec = { height: Height; attempts: Attempt[];          // last 12 kept
                  gapIndex: number; nextReviewDay: number | null; firstFailedDay: number | null;
                  firstFailedHeight: Height | null; solidDays: number[]; noFullUntilDay: number | null };
type SectionRec = { skipCount: number; remindDay: number | null; lastReason: SkipReason | null;
                    dripStopped: boolean; liking: number; returned: boolean };
type SkipReason = "not-learned" | "too-hard" | "later";
type Profile = { comfort: number; memory: number; h3Share: number; stamina: number;
                 goodStreak: number; msByHeight: Record<Height, number[]> };   // last 20 ms per height
type Seen = { card: string; variant: number; day: number };
type State = { v: 1; student: string; rng: Rng; seq: number; lastNow: number;
               profile: Profile; skills: Record<string, SkillRec>; sections: Record<string, SectionRec>;
               seen: Seen[]; currentTopic: { id: string; source: "class" | "student" } | null;
               day: { day: number; effort: number; streakKept: boolean } | null;
               sessionCount: number; lastSessionDay: number | null; session: SessionState | null };
newState(student: string, seed: number, cfg?: Config): State
migrate(json: unknown): State          // throws Error("unsupported state version") unless v === 1
effectiveNow(state: State, now: number): number     // max(now, state.lastNow)
// skill.ts — all pure, return a new SkillRec
recordAttempt(rec: SkillRec, a: Attempt, memory: number, cfg: Config): { rec: SkillRec; steppedUp: boolean; steppedDown: boolean }
isSolid(rec: SkillRec, def: SkillDef): boolean
isDue(rec: SkillRec, day: number): boolean
startHeight(def: SkillDef, comfortLow: boolean, returning: boolean): Height   // lowest/highest *available* height
```

`SessionState` is declared here as an opaque placeholder and filled in Task 5.

Rules `recordAttempt` implements (spec §4, §5, §8):
- Step up: the last `stepUp.rightInRow` attempts at the current height are right **and** they are on different days or their `seq` differ by ≥ `minCardsApart`; then `height` moves to the next height that has cards. Blocked from 3 while `day < noFullUntilDay`.
- Step down: `stepDown.wrongs` wrong among the last `stepDown.window` attempts at the current height; `height` moves to the next lower height that has cards (stays if none). Wrong attempts counted once: after a step down the window restarts.
- Review gap: right at current height ⇒ `nextReviewDay = day + round(reviewGapsDays[gapIndex] × memory)` (min 1), then `gapIndex = min(gapIndex+1, 4)`. Wrong ⇒ `gapIndex = 0`, `nextReviewDay = day + 1`. Right below current height does not move the gap.
- `firstFailedDay/Height` set on the first wrong ever.
- `solidDays`: push `day` (unique, keep last 2) when right at the skill's top available height. `isSolid` ⇔ top available height is ≥ 2 and `solidDays.length ≥ 2`.

- [ ] **Step 1: Write the failing tests** (`skill.test.ts`, using `fixture()` skill `a1`; helper `att(day, seq, height, right)`):

```ts
test("two right, same day, 5 apart → up", …  heights 2→3, steppedUp true)
test("two right, same day, 2 apart → no step", …)
test("two right on different days → up", …)
test("2 wrong in last 4 at height → down, window restarts", …  3→2, then one more wrong does not drop to 1)
test("no height-3 cards → never steps to 3", …  fixture({drop:["a1.h3"]}))
test("gaps 1,3,7,14,30 then stay 30; ×memory 0.5 → 1,2,4,7,15; wrong resets to 1", …)
test("blocked from height 3 before noFullUntilDay", …)
test("solid after top-height right on two days; skill topping at 2 is solid at 2; topping at 1 never", …)
test("startHeight: default 2; comfortLow → 1; returning → 1; missing height → nearest available", …)
```

`state.test.ts`:

```ts
test("newState defaults", () => { const s = newState("s1", 42);
  expect(s.profile).toMatchObject({ comfort: 0.75, memory: 1, h3Share: 0.4, stamina: 13.34 });
  expect(JSON.parse(JSON.stringify(s))).toEqual(s); });
test("migrate rejects unknown version", () => expect(() => migrate({ v: 9 })).toThrow("unsupported state version"));
test("effectiveNow never goes back", () => { const s = { ...newState("s", 1), lastNow: 5000 };
  expect(effectiveNow(s, 1000)).toBe(5000); expect(effectiveNow(s, 9000)).toBe(9000); });
test("unknown skill in state is tolerated", …  // Review Focus 5: isDue/isSolid helpers are never called with a missing def;
                                              // add `knownSkills(state, content): string[]` in state.ts and assert it filters "ghost.skill")
```

- [ ] **Step 2: Run** → FAIL. **Step 3: Implement.** **Step 4: Run** → PASS.
- [ ] **Step 5: Commit** `git commit -m "engine: state and per-skill height, review and solid rules"`

---

### Task 4: Estimates and next-card selection

**Files:**
- Create: `engine/src/estimate.ts`, `engine/src/pick.ts`
- Test: `engine/tests/pick.test.ts`

**Interfaces:**
- Consumes: Task 2 `Content`, Task 3 `State`, `isDue`, `isSolid`, `startHeight`.
- Produces:

```ts
type Reason = "open:liked" | "close:winnable" | "repair:missing-piece" | "repair:confidence" | "repair:return"
            | "due-review" | "new:class-topic" | "new:exam-weight" | "side-door" | "skipped-drip"
            | "comfort-correction" | "extend:liked" | "comeback:solid";
type Served = { card: string; variant: number; skill: string; section: string; height: Height;
                reason: Reason; effort: number; borrowedFrom?: string };
expectedSuccess(state: State, skill: string, height: Height, cfg: Config): number
usualMs(state: State, height: Height): number | null            // median of profile.msByHeight[height], null if < 5
eligibleCard(state, content, skill, height, day, rng, opts?: { preferTag?: string; preferNote?: string; exclude?: string[] })
    : { card: string; variant: number; rng: Rng } | null
likedSections(state, content): string[]                        // best first
pickOpen / pickMiddle / pickClose (state, content, ctx: PickCtx, cfg): { served: Served; rng: Rng } | null
type PickCtx = { day: number; remaining: number; runningRight: number; runningTotal: number;
                 newSkillsThisSession: number; lastSkills: string[]; blockedSections: string[] }
```

Decisions:
- `expectedSuccess` = `(right + 2·prior) / (n + 2)` over the skill's kept attempts at that height; `prior` = the student's own success rate at that height over the last `window.cards` attempts across all skills when there are ≥ 10, else `cfg.priors`.
- `eligibleCard`: cards of that skill and height whose `(card, variant)` is not in `state.seen` within `noRepeatDays`. Multi-variant cards pick a random unseen variant via `rng`. Order: `preferTag` matches (a card any of whose wrong options carries the tag) → `preferNote` matches → the rest; random within a tier. Returns `null` when nothing is eligible.
- `likedSections`: sections with any attempt, sorted by `liking` desc then success rate desc; when no section has attempts, the section of `currentTopic` (or the first topic in content) with the highest mean `cfg.priors`-based expected success, ties by lowest weight (spec §7 fallback: "easiest section").
- A section is **blocked** when `remindDay > day` (skipped). Blocked sections never appear from `pickOpen/Middle/Close`; Task 6 adds drip and side door.
- `pickMiddle` order (spec §8): (1) due skills, sorted: in `currentTopic` first, then `weight` desc, then most overdue; (2) a new skill if `newSkillsThisSession < maxNewSkills` and running success ≥ `profile.comfort` (or no cards yet): in `currentTopic` first, every `requires` skill started or solid or without content, `weight` desc; reason `new:class-topic` when in `currentTopic`, else `new:exam-weight`; (3) any started, not-due skill with the highest `expectedSuccess` (reason `comfort-correction`).
- Comfort check: if `runningTotal ≥ 3` and `runningRight/runningTotal < profile.comfort`, skip straight to (3) and require `expectedSuccess ≥ profile.comfort`; reason `comfort-correction`.
- Never return a skill that would make more than `maxSameSkillRun` in a row (`ctx.lastSkills`).
- h3 share: among otherwise-equal candidates in (1) and (2), prefer one whose current height is 3 when the session's height-3 effort share is below `profile.h3Share`, and one below 3 when above.
- A candidate whose effort exceeds `ctx.remaining` is skipped unless today's effort is still under `minimumDay`.
- `pickOpen`: first liked section, its started skill with highest `expectedSuccess` at current height, falling back one height lower if `expectedSuccess < comfort`; for a brand-new student, a height-1 card (lowest available) of the highest-weight skill with no `requires` in that section. Reason `open:liked`.
- `pickClose`: over liked sections in order, the first (skill, height ≤ current) with `expectedSuccess ≥ session.winnable`; if none reaches it, the highest available. Reason `close:winnable`.
- Borrowed strength: when a served skill's section has `returned === true` and a `requires`/`helps` neighbour is solid, set `borrowedFrom` to that neighbour.

- [ ] **Step 1: Write the failing tests.** Each builds a state by hand on `fixture()`:

```ts
test("expectedSuccess: no history → priors 0.85/0.7/0.5", …)
test("expectedSuccess: 3 right 1 wrong at h2 → (3 + 1.4) / 6", …)
test("eligibleCard skips anything seen in last 14 days, allows day 15", …)
test("eligibleCard prefers tag, then note, then rest", …   // a1 h1 with preferTag "sign-error" → a1.h1.2 ; a2 h2 preferNote "n1" → a2.h2.2
test("eligibleCard returns null when all seen", …)
test("middle: due beats new; due order = current topic, weight, overdue", …)
test("middle: new skill needs requires started → a2 not offered before a1", …)
test("middle: max 2 new skills per session", …)
test("middle: running rate below comfort → comfort-correction with expectedSuccess ≥ comfort", …)
test("middle: blocked section never returned", …)
test("middle: no 4th card in a row on one skill", …)
test("middle: h3 card not served when it would pass budget, unless under minimum day", …)
test("open: brand-new student gets height-1 card, reason open:liked", …)
test("close: winnable ≥ 0.85 from liked section, reason close:winnable", …)
test("clock backwards: picks made with effectiveNow never return a card seen 'in the future'", …)   // Review Focus 2
test("deterministic: same state twice → same Served", …)
```

- [ ] **Step 2: Run** → FAIL. **Step 3: Implement.** **Step 4: Run** → PASS.
- [ ] **Step 5: Commit** `git commit -m "engine: success estimate and next-card selection"`

---

### Task 5: Session loop, effort budget, repair path, events

**Files:**
- Create: `engine/src/repair.ts`, `engine/src/session.ts`
- Modify: `engine/src/types.ts`, `engine/src/index.ts`
- Test: `engine/tests/session.test.ts`, `engine/tests/repair.test.ts`, `engine/tests/helpers.ts`

**Interfaces:**
- Consumes: Tasks 3–4.
- Produces (the public API):

```ts
type Choice = number | "dont-know";
type EndKind = "budget" | "bad-day" | "extended-done" | "daily-cap" | "content-exhausted" | "left" | "interrupted";
type EndInfo = { kind: EndKind; effort: number; cards: number; right: number; fixed: number; streakKept: boolean };
type Feedback = { right: boolean; correctIndex: number; tag?: string; reveal?: { section: string } };
type Next = { kind: "card"; card: Served } | { kind: "offer-extend" } | { kind: "end"; end: EndInfo }
          | { kind: "confirm-skip"; value: ValueMessage };            // ValueMessage defined in Task 6
type EngineEvent = { id: string; student: string; at: number; session: string | null;
                     type: "session_start" | "card_served" | "answer" | "skip" | "session_end" | "profile" | "moment";
                     data: Record<string, unknown> };                 // id = `${student}:${seq}`
type Step = { state: State; events: EngineEvent[]; feedback?: Feedback; moments: Moment[]; next: Next };
type SessionState = { id: string; startedAt: number; budget: number; spent: number; h3Spent: number;
                      served: Served | null; history: { skill: string; right: boolean | null; ms: number; bad: boolean }[];
                      repair: RepairState | null; returns: { skill: string; afterCard: number }[];
                      newSkills: number; badMoments: number[]; extended: boolean; extendLeft: number;
                      phase: "open" | "middle" | "closing" | "extend"; comeback: boolean; fixed: number;
                      blockedSections: string[]; dripDone: boolean; moments: Moment[]; fadeEffort: number | null };
startSession(state, content, now, cfg?): Step
answer(state, content, input: { card: string; choice: Choice; ms: number }, now, cfg?): Step
extend(state, content, now, cfg?): Step                // accepts "5 more"
endSession(state, content, now, cfg?, opts?: { left?: boolean }): Step   // student closed it, or declines "5 more"
// repair.ts
type RepairState = { skill: string; failedHeight: Height; tag?: string; note?: string; stage: "piece" | "confidence" };
nextRepairCard(state, content, repair, day, cfg): { served: Served; rng: Rng } | null
```

`tests/helpers.ts` produces `play(content, state, now, answers: ("r" | "w" | "dk")[] | ((s: Served) => "r"|"w"|"dk")): { state; steps: Step[] }` which starts a session and answers each served card with the correct option (`"r"`), the first wrong option (`"w"`) or `"dont-know"`, `ms = 8000`, advancing `now` by 10 s per card, until `next.kind` is not `card` or the answers run out; and `nextDay(now)`.

Decisions:
- **Budget** at start = `max(minimumDay, profile.stamina × (1 − margin))`, capped by `dailyCap − day.effort`. Comeback session (`lastSessionDay` exists and `day − lastSessionDay ≥ returning.awayDays`): budget `budget.comeback`; open cards are height-1 cards of solid skills' sections (reason `comeback:solid`), falling back to normal open.
- `startSession` when `day.effort ≥ dailyCap` → `next: end` kind `daily-cap`, no session opened. When `state.session` is already set → first close it as `interrupted` (events emitted, profile not updated for comfort/stamina), then start (Review Focus 4).
- **Phases:** `open` for the first `session.openCards` cards; then `middle`; when `budget − spent` no longer fits the cheapest middle candidate plus one height-1 card (or after any end trigger), `closing`: serve one `pickClose` card, then end. The close card is skipped if the last answer was right and the last card's `expectedSuccess ≥ winnable` (already ended on a win).
- **Effort:** `spent += cost(height) + (wrong ? effort.wrong : 0)`; "dont-know" adds only the card cost. `day.effort` tracks the same. `streakKept` becomes true when `day.effort ≥ minimumDay`, or on a `bad-day` end, or `content-exhausted` with ≥ 1 answer.
- **answer()** with `input.card !== session.served.card`, or with no open session → returns `{ state, events: [], moments: [], next: <same next as before> }` (Review Focus 3).
- **Repair (spec §5):** on a wrong or "dont-know" answer outside a repair: `repair = { stage: "piece", tag: picked option's tag, note: card.noteRef }`. Stage `piece` card: `eligibleCard` at height 1 with `preferTag`, `preferNote`; else height 2 with the same preferences **only if** it matches tag or note; else any height-1 card; else a height-1 card of the `requires` skill with the lowest `expectedSuccess`; reason `repair:missing-piece`. Stage `confidence`: same skill, `failedHeight − 1` (or 1), nearest available height at or below; reason `repair:confidence`. If a stage has no eligible card it is skipped. After `confidence` (right): push `{ skill, afterCard: history.length + returnAfterCards }` to `returns`. A wrong/"dont-know" during a repair: no new repair; force a step down (`height` to next lower available), record a bad moment, clear `repair`, next card from `likedSections` excluding this section (reason `open:liked`).
- **Returns:** a queued return is served from `pickMiddle` position 0 (before due) once `history.length ≥ afterCard` and effort remains, at the skill's current height, new variant, reason `repair:return`. Unserved returns: set that skill's `nextReviewDay = day + 1`. A right answer on a `repair:return` card increments `session.fixed`.
- **Bad day:** `badMoments` holds card indexes; when `badDay.moments` of them fall within the last `badDay.withinCards` cards, **or** the last `badDay.slowRun` answers each took > `slowFactor × usualMs(height)`: set `fadeEffort = spent`, go to `closing` with a forced close card, end kind `bad-day`. A session never ends directly after a wrong answer: if the close card is answered wrong, serve one more close card (max 2 extra), then end regardless only if no eligible card remains.
- **Good day:** at a `budget` end, if `right/total > profile.comfort` and median session ms < `usualMs` for the heights played and not `extended` and `day.effort + extendCards × effort.h1 ≤ dailyCap` → `next: { kind: "offer-extend" }`. `extend()` sets phase `extend`, serves `extendCards` cards from liked sections (reason `extend:liked`), then ends with kind `extended-done`. `endSession()` while an offer is pending ends with kind `budget`.
- **content-exhausted:** any time no pick function returns a card → end kind `content-exhausted` (Review Focus 1).
- **Events:** every call appends events in order with `id` from `state.seq`; `card_served.data` = the `Served`; `answer.data` = `{ card, variant, skill, height, choice, right, ms, tag }`; `session_end.data` = `EndInfo`. `state.lastNow` = `effectiveNow`.
- `endSession(..., { left: true })` ends with kind `left`, sets `fadeEffort = spent`.

- [ ] **Step 1: Write the failing tests**

```ts
// session.test.ts
test("first session: opens open:liked, ends by budget, effort ≤ 12 and ≥ 8, streak kept", …)
test("all right at height 2 → 8 cards for 12 effort; a height-3 skill → fewer cards", …)
test("dont-know costs card effort only; wrong costs +1", …)
test("no session ends on a wrong answer", …  // answer "w" to everything for 5 sessions; last answer before every end is right OR end.kind === 'content-exhausted'
)   // use answers fn: wrong unless reason is close:winnable or repair:confidence
test("three bad moments in 8 cards → one winnable card → end bad-day, streakKept true", …)
test("three slow answers (ms > 2× usual) → bad-day end", …)
test("fast + above comfort at budget → offer-extend; extend → exactly 5 cards → extended-done", …)
test("declining the offer → end budget", …)
test("daily cap: sessions on one day stop at 40 effort; next start → end daily-cap", …)
test("comeback after 3+ days: budget 8, first cards comeback:solid at height 1", …)
test("stale answer (wrong card id) → state unchanged, no events", …)
test("startSession over an open session → session_end interrupted, then session_start", …)
test("content exhausted → end content-exhausted, no throw, no repeat", …  // fixture with 1 skill, play 4 sessions same day-range
test("events: ids unique and increasing; JSON round-trip of state", …)
test("determinism: two identical runs give identical JSON", …)
// repair.test.ts
test("wrong on a1.h3 picking option 1 (sign-error) → next is a1.h1.2 repair:missing-piece → then a1 h2 repair:confidence → then other skill", …)
test("wrong on a2.h3 (note n1, tag recall-gap) → piece is a2.h2.2 (note match)", …)
test("skill with no h1/h2 → piece comes from weakest requires skill", …  // fixture drop a2.h1.*, a2.h2.*
test("original skill returns after ≥ 4 other cards as a different variant, reason repair:return", …)
test("no room to return this session → nextReviewDay = tomorrow", …)
test("wrong inside repair → no second repair; height drops; next card from another, liked section", …)
```

- [ ] **Step 2: Run** → FAIL. **Step 3: Implement** `repair.ts`, `session.ts`. **Step 4: Run** `npx vitest run && npx tsc --noEmit` → PASS.
- [ ] **Step 5: Commit** `git commit -m "engine: session loop with effort budget, repair path and events"`

---

### Task 6: Skip, remind, drip, side door, value message

**Files:**
- Create: `engine/src/skip.ts`
- Modify: `engine/src/session.ts`, `engine/src/pick.ts`, `engine/src/index.ts`
- Test: `engine/tests/skip.test.ts`

**Interfaces:**
- Produces:

```ts
type ValueMessage = { section: string; sharePct: number;                // round(100 × section.weight / unit weight)
                      topSkills: { skill: string; solid: boolean }[] };  // 3 highest-weight skills with content
skip(state, content, input: { card: string; reason?: SkipReason; confirmed?: boolean }, now, cfg?): Step
setCurrentTopic(state, topic: string | null, source: "class" | "student"): State
```

Decisions (spec §6):
- `skip()` on the current card's section. If `sections[s].skipCount ≥ 1` and `confirmed` is not true → returns `next: { kind: "confirm-skip", value }` with no state change other than events; the UI either calls `skip` again with `confirmed: true` or `answer`. First skip applies immediately.
- Applying: `skipCount += 1`; `remindDay = day + skipRemindDays[min(skipCount−1, 4)]`; `lastReason = reason ?? "later"`; `dripStopped = false`; `returned = false`; section added to `session.blockedSections`; liking −1; any repair or queued return for a skill in that section is dropped; card costs 0 effort; `skip` event. Next card from normal selection.
- Skipping a `skipped-drip` card: `dripStopped = true`, no change to `skipCount` or `remindDay`. Skipping a `side-door` card: applies as a normal skip (count +1, next remind time).
- `not-learned`: the section also returns when `currentTopic.source === "class"` and `currentTopic.id` is the section's topic.
- `too-hard`: on return every started skill in the section is set to height 1 (lowest available). Other reasons: also height 1 at return (spec: "rejoins at height 1").
- **Drip:** in `pickMiddle`, once per session, when `sessionCount % dripEverySessions === 0`, after at least 3 cards and before closing: one height-1 card from a blocked section with `dripStopped === false` (earliest `remindDay` first), reason `skipped-drip`. Sections with no eligible height-1 card are passed over. A wrong answer on a drip card shows feedback only: no repair, no bad moment, no step down.
- **Side door:** a section with `remindDay ≤ day` (or class timing: `currentTopic` from class is its topic), still `skipCount > 0` and `returned === false`: one card at the lowest available height with the highest `expectedSuccess`, preferring a skill with a solid `requires`/`helps` neighbour (`borrowedFrom` set), placed in the middle, reason `side-door`, at most one side-door section per session. Answered right → `feedback.reveal = { section }`, `returned = true`, `remindDay = null`, skills set to lowest height, `noFullUntilDay = day + returning.noFullDays` on each. Answered wrong → normal repair; section still rejoins (`returned = true`).
- Any right answer on a section resets `skipCount` to 0 **only after** it has returned (so the remind sequence keeps growing across repeated skips of drips/side doors).
- Blocked sections are never used for open, close, due, new or comfort-correction picks.

- [ ] **Step 1: Write the failing tests**

```ts
test("first skip: applies at once, remindDay = day+3, section gone for the rest of the session", …)
test("second skip: confirm-skip with value; sharePct for fixture section B = 60; topSkills b2,b1", …)
test("confirmed second skip → remindDay = day+5; then 8, 13, 14, 14", …)
test("answering after confirm-skip continues the card with no skip applied", …)
test("skipped section absent from every card on days 1..2; side-door appears on day 3", …)
test("side door right → feedback.reveal, section returned, skills at height 1, no height-3 for 2 days", …)
test("side door skipped → next remind per sequence", …)
test("drip: one skipped-drip height-1 card every second session, not first 3 cards, never last", …)
test("drip skipped → no drips until remind", …)
test("drip wrong → no repair, no bad moment", …)
test("not-learned + class topic set to that topic → side door today", …)
test("too-hard returns at height 1", …)
test("skip drops in-flight repair for that section", …)
test("borrowedFrom set when a solid neighbour exists", …   // a1 solid, section A's a2 returning? use b2 helps a1
test("skip costs no effort", …)
```

- [ ] **Step 2: Run** → FAIL. **Step 3: Implement.** **Step 4: Run** all tests → PASS.
- [ ] **Step 5: Commit** `git commit -m "engine: skip as remind-me-later with drip, side door and value message"`

---

### Task 7: Profile dials

**Files:**
- Create: `engine/src/profile.ts`
- Modify: `engine/src/session.ts` (call the updates), `engine/src/index.ts`
- Test: `engine/tests/profile.test.ts`

**Interfaces:**
- Produces:

```ts
onAnswer(profile, sectionRec, a: { height: Height; right: boolean; ms: number; wasDueReviewFirstCard: boolean }, cfg): { profile: Profile; section: SectionRec }
onSessionEnd(state, end: EndInfo, session: SessionState, cfg): State        // emits one "profile" event via session.ts
```

Decisions (spec §7; formulas are my call, all constants in config):
- **Memory:** on the first card of a `due-review`: right → `memory × memory.up`; wrong → `memory × memory.down`; clamp `[min, max]`.
- **Comfort:** end kind `left` with session success rate below `comfort + 0.05` → `comfort += upOnQuit`. End kind `budget`/`extended-done` with success ≥ comfort → `goodStreak += 1`; at `streakSessions` → `comfort −= downOnStreak`, `goodStreak = 0`. Any other end resets `goodStreak`. Clamp `[0.65, 0.85]`. `interrupted` changes nothing.
- **Calculation vs concept:** over the last `window.cards` attempts across skills, `r3` = success at height 3 (needs ≥ 6), `r12` = success at heights 1–2 (needs ≥ 10); `gap = r12 − r3 − calc.gapBaseline`. `gap > band` → `h3Share = h3ShareCalcWeak` and the session inserts a **ramp**: a height-3 card is preceded by a height-2 card of the same skill when one is eligible (reason unchanged from the pick). `gap < −band` → `h3ShareConceptWeak`. Else default. `h3Share` is never set outside `[minWeakerShare, 1 − minWeakerShare]`.
- **Stamina:** `fadeEffort` set (bad-day, left, slow run) → `stamina = 0.7 × stamina + 0.3 × fadeEffort`. Clean `budget` end → `stamina += 0.5`; `extended-done` → `stamina += 1`. Clamp `[minimumDay / (1 − margin), dailyCap]`.
- **Liking:** per answer: `+0.5` if right and `ms < usualMs(height)`; `−0.5` if `ms > 1.5 × usualMs`; `+2` for every extend card answered in that section; skip `−1` (Task 6). Clamp `[−5, 5]`.
- `msByHeight[h]` keeps the last 20 `ms`.
- `comfortLow` for `startHeight` (Task 3) = `profile.comfort ≥ 0.8`.
- The constants above that are not yet in `defaultConfig` (comfort margin 0.05 and low mark 0.8; stamina blend 0.7/0.3 and steps 0.5/1; liking steps, slow factor 1.5 and clamp 5; calc minimum counts 6 and 10) are added to `config.ts` in this task as groups `comfort.quitMargin`, `comfort.lowMark`, `staminaUpdate`, `liking`, `calc.minH3`, `calc.minH12`, and `tests/config.test.ts` is extended to pin them.

- [ ] **Step 1: Write the failing tests**

```ts
test("memory: due-review first card right ×1.05, wrong ×0.85, clamped 0.5..2", …)
test("comfort: left early at low success → +0.03; three good finishes → −0.01; clamps", …)
test("interrupted session changes no profile number", …)
test("stamina: fade at 6 effort → 0.7×13.34+0.3×6; clean end +0.5; never below 8/0.9", …)
test("calc weak (r12 0.9, r3 0.3) → h3Share 0.5 and a height-2 ramp card before each height-3 card", …)
test("concept weak (r12 0.5, r3 0.8) → h3Share 0.2", …)
test("too little data → h3Share stays 0.4", …)
test("liking: fast right +0.5; slow −0.5; extend +2; clamp", …)
test("weak never asked more: after 5 sessions answering 40% right, budget ≤ budget of a 90%-right student", …)
test("dials differ: 7 sessions each for an all-right and a half-wrong student → their profiles and next session's first 5 Served differ", …)
```

- [ ] **Step 2: Run** → FAIL. **Step 3: Implement.** **Step 4: Run** all → PASS.
- [ ] **Step 5: Commit** `git commit -m "engine: profile numbers and their dials"`

---

### Task 8: Moments

**Files:**
- Create: `engine/src/moments.ts`
- Modify: `engine/src/session.ts`, `engine/src/index.ts`
- Test: `engine/tests/moments.test.ts`

**Interfaces:**
- Produces:

```ts
type Moment =
  | { type: "section-solid"; section: string }
  | { type: "avoided-now-done"; section: string }
  | { type: "then-wrong-now-right"; skill: string; thenDay: number; nowDay: number }
  | { type: "missing-piece-fixed"; skill: string }
  | { type: "height-up"; skill: string; from: Height; to: Height };
detectMoments(before: State, after: State, content, answered: Served, right: boolean, day: number, cfg): Moment[]
```

Decisions (spec §9): priority is the order of the union above. `Step.moments` carries new moments for that answer, strongest first. Moments are emitted as they occur until `session.maxMoments` have been emitted this session; later ones are dropped, except a `section-solid` or `avoided-now-done`, which is held in `state.pendingMoments: Moment[]` (add to `State`) and emitted first in the next session's first `Step`. Each moment fires once per (type, skill/section): keep `state.momentsDone: string[]` keys.
- `then-wrong-now-right`: right at height ≥ `firstFailedHeight`, `day − firstFailedDay ≥ thenNowMinDays`.
- `avoided-now-done`: section whose lifetime skip total ≥ `avoidedMinSkips` (add `skipTotal` to `SectionRec`, never reset) and whose last `avoidedOf` attempts across its skills have ≥ `avoidedRight` right.
- `missing-piece-fixed`: right answer on a `repair:return` card whose repair's confidence card was right.
- `section-solid`: every started skill in the section is solid and at least one is.

- [ ] **Step 1: Write the failing tests**: one test per moment at its exact threshold and one just below it (5 days vs 4; 4/5 vs 3/5; 2 skips vs 1); `max 2 per session, section-solid carried to next session`; `each fires once`.
- [ ] **Step 2: Run** → FAIL. **Step 3: Implement.** **Step 4: Run** all + typecheck → PASS.
- [ ] **Step 5: Commit** `git commit -m "engine: progress moments"`

---

### Task 9: Hidden student model

**Files:**
- Create: `engine/sim/student.ts`, `engine/sim/personas.ts`
- Test: `engine/tests/student.test.ts`

**Interfaces:**
- Consumes: `Content`, `Served`, `Next`, `Rng`.
- Produces:

```ts
type Traits = { prior: number; priorBySection?: Record<string, number>; learn: number; forget: number;
                calc: number; concept: number;                               // added to knowledge at h3 / h1–2, −0.3..+0.3
                misconceptions: Record<string, number>;                      // tag → strength 0..1
                patienceWrongs: number; patienceSessions: number;
                skipBelow: number; fearedSections: string[]; dontKnowBelow: number;
                stamina: number; baseMs: number; guesser: boolean; extendChance: number;
                habit: "daily" | "alternate" | "binge-vanish" | "gap10" | "five-min";
                classPace: number | null };                                  // days per topic, null = no class
type Persona = { id: string; name: string; sheet: string; traits: Traits };  // sheet = plain-words description for the judge
type Hidden = { traits: Traits; k: Record<string, number>; lastDay: Record<string, number>;
                badSessions: number; quitApp: boolean; rng: Rng };
newHidden(p: Persona, content: Content, seed: number): Hidden
decide(h: Hidden, content: Content, card: Served, session: { effort: number; recentWrong: number }, day: number)
   : { action: { kind: "answer"; choice: number | "dont-know"; ms: number } | { kind: "skip"; reason?: SkipReason } | { kind: "quit" }; hidden: Hidden }
learn(h: Hidden, card: Served, right: boolean, day: number): Hidden
decay(h: Hidden, day: number): Hidden                                         // call once per simulated day
playsToday(h: Hidden, day0: number, day: number): number                      // sessions today: 0, 1 or 2
wantsExtend(h: Hidden): [boolean, Hidden]
meanKnowledge(h: Hidden, content: Content): number                            // over skills that have cards
personas: Persona[]                                                           // the 16
```

Model (spec §13, §14; starting formulas, my call):
- `need = { 1: 0.25, 2: 0.5, 3: 0.75 }`; `kEff = k[skill] + (height === 3 ? calc : concept)`; fatigue: if `session.effort > stamina` then `kEff −= 0.2` and `ms × 2.2`.
- `pRight = clamp(0.2, 0.97, 0.5 + 1.5 × (kEff − need[height]))` (0.2 ≈ guessing among 4–5 options).
- Order of decisions for a card: (1) quit if `session.recentWrong ≥ patienceWrongs` or `session.effort > 1.3 × stamina`; (2) skip if the card's section is feared and `k < 0.6`, or with probability 0.5 when `pRight < skipBelow`; never on reasons `repair:*` or `close:winnable`; reason `too-hard` if `k > 0.1`, else `not-learned`; (3) "dont-know" when `pRight < dontKnowBelow` and not `guesser`; (4) a misconception: for each wrong option whose tag is in `misconceptions`, pick it with probability `strength × (1 − k)`; (5) else right with `pRight`, wrong option uniform.
- `ms = baseMs × {1: 1, 2: 1.5, 3: 4}[height] × (0.8 + 0.4·rand)`; `guesser` × 0.4.
- `learn`: `k += learn × (right ? 0.04 : 0.08) × (1 − k)`; a wrong answer on a misconception tag multiplies that tag's strength by 0.8.
- `decay`: per skill, per day since `lastDay`: `k −= forget × 0.008 × (1 − 0.5·k)`, floor at half the starting value.
- App quit: a session quit sets `badSessions += 1`; a completed session resets it; `badSessions ≥ patienceSessions` → `quitApp = true` (plays no more).
- Habits: `daily` 1/day; `alternate` even days; `binge-vanish` 2/day for days 0–5 then none until day 20 then daily; `gap10` daily except days 9–18; `five-min` daily and quits each session after 12 effort without counting as a bad session.

**Personas (exact trait rows; unspecified traits take the "average" row):**

| id | prior | learn | forget | calc | concept | patienceWrongs / Sessions | skipBelow | stamina | habit | other |
|---|---|---|---|---|---|---|---|---|---|---|
| average-noclass | 0.4 | 1 | 1 | 0 | 0 | 4 / 3 | 0.3 | 14 | daily | baseMs 9000, dontKnowBelow 0.3, extendChance 0.3, classPace null |
| average-fastclass | 0.4 | 1 | 1 | 0 | 0 | 4 / 3 | 0.3 | 14 | daily | classPace 4 |
| strong | 0.8 | 1.5 | 0.5 | 0.1 | 0.1 | 6 / 5 | 0.1 | 25 | daily | extendChance 0.7 |
| weak-stubborn | 0.15 | 0.7 | 1.2 | −0.1 | −0.1 | 8 / 8 | 0.15 | 14 | daily | |
| weak-impatient | 0.15 | 0.7 | 1.2 | −0.1 | −0.1 | 2 / 2 | 0.4 | 9 | daily | |
| smart-impatient | 0.7 | 1.5 | 0.7 | 0 | 0 | 2 / 2 | 0.4 | 10 | alternate | |
| memory-good-calc-weak | 0.5 | 1 | 0.3 | −0.3 | 0.2 | 4 / 3 | 0.3 | 14 | daily | |
| calc-strong-memory-poor | 0.5 | 1 | 2.5 | 0.25 | −0.1 | 4 / 3 | 0.3 | 14 | daily | |
| confident-misconceptions | 0.5 | 1 | 1 | 0 | 0 | 5 / 4 | 0.05 | 16 | daily | misconceptions: the 6 most frequent non-generic tags in the loaded content, strength 0.8; dontKnowBelow 0 |
| underconfident-skipper | 0.65 | 1 | 1 | 0 | 0 | 3 / 3 | 0.75 | 12 | daily | dontKnowBelow 0.6 |
| one-feared-section | 0.5 | 1 | 1 | 0 | 0 | 4 / 3 | 0.3 | 14 | daily | fearedSections: the highest-weight section with cards; priorBySection for it 0.1 |
| steady-five-min | 0.4 | 1 | 1 | 0 | 0 | 4 / 4 | 0.3 | 12 | five-min | |
| binge-quit | 0.4 | 1.2 | 1.5 | 0 | 0 | 3 / 2 | 0.3 | 30 | binge-vanish | extendChance 0.9 |
| comeback-10 | 0.45 | 1 | 1.3 | 0 | 0 | 4 / 3 | 0.3 | 14 | gap10 | |
| slow-reader | 0.45 | 1 | 1 | 0 | 0 | 4 / 3 | 0.3 | 10 | daily | baseMs 22000 |
| fast-guesser | 0.3 | 0.5 | 1 | 0 | 0 | 6 / 5 | 0.1 | 18 | daily | guesser true, baseMs 3000 |

Each persona's `sheet` is 3–5 plain sentences a 17-year-old could have written about themself, with no numbers.

- [ ] **Step 1: Write the failing tests**

```ts
test("16 personas, unique ids, each sheet has no digits", …)
test("pRight: k 0.5 at h2 → 0.5; k 1 at h1 → 0.97; k 0 at h3 → 0.2", …)   // export pRight for the test
test("misconception: strength 1, k 0 → always picks the tagged wrong option", …)
test("learning raises k more after a wrong answer than a right one; decay lowers it, floor at half start", …)
test("quit when recentWrong ≥ patienceWrongs; app quit after patienceSessions quits in a row", …)
test("never skips a repair or close card", …)
test("habits: gap10 plays 0 on days 9–18; binge-vanish 2/day on days 0–5", …)
test("same seed → same decisions", …)
```

- [ ] **Step 2: Run** → FAIL. **Step 3: Implement.** **Step 4: Run** → PASS.
- [ ] **Step 5: Commit** `git commit -m "sim: hidden student model and 16 personas"`

---

### Task 10: Runner and code checks

**Files:**
- Create: `engine/sim/run.ts`, `engine/sim/checks.ts`
- Test: `engine/tests/run.test.ts`

**Interfaces:**
- Consumes: the engine API, Task 9.
- Produces:

```ts
runStudent(p: Persona, content: Content, opts: { days: number; seed: number; start: number; cfg: Config }): StudentLog
type StudentLog = { persona: string; seed: number; lines: LogLine[]; profileByDay: (Profile & { day: number })[];
                    knowledge: { day0: number; day14: number; dayEnd: number }; quitAppDay: number | null;
                    traits: Traits; contentExhausted: number };
type LogLine = { day: number; session: number; n: number; kind: "card" | "skip" | "confirm-skip" | "end" | "offer-extend" | "moment" | "quit";
                 served?: Served; choice?: Choice; right?: boolean; ms?: number; end?: EndInfo; moment?: Moment;
                 hiddenFatigued?: boolean };
runChecks(logs: StudentLog[], cfg: Config): { name: string; pass: boolean; detail: string }[]
```

- CLI: `npm run sim -- --days 28 --seed 1 --packs all --out runs/<name> [--persona id] [--config path.json]`. `--config` is a JSON object deep-merged over `defaultConfig`. Writes per persona `runs/<name>/<id>.log.jsonl` (one `LogLine` per line), `<id>.summary.json` (everything in `StudentLog` except `lines`), and `checks.json` + a printed table. Exit code 1 if any check fails. Simulated start = `Date.UTC(2027, 0, 18, 12, 30)` (18:00 Sri Lanka); sessions on a day are 3 hours apart; cards 1 ms-accurate by the hidden student's `ms`.
- Runner behaviour: each day `decay`; `playsToday`; for `classPace` personas call `setCurrentTopic(state, topicOrder[floor(day / classPace)], "class")` (topic order = content order within Mechanics, then Thermal, then Electricity); no-class personas set the first Mechanics topic as `"student"` once. On `confirm-skip` the hidden student confirms. On `offer-extend` use `wantsExtend`. On hidden `quit` call `endSession(..., { left: true })`. `hiddenFatigued` = session effort above the hidden stamina when the card was served.
- The six checks (spec §13), named exactly: `no-end-on-wrong`, `skip-timing` (no card from a skipped section before its remind day except reasons `skipped-drip`; every skipped section gets a `side-door` within 14 days + 1 session-day of its skip while the student still plays), `effort-cap-and-fairness` (no day > 40; mean daily effort **asked** — budget at start — of `weak-stubborn` and `weak-impatient` ≤ that of `strong`), `no-repeat-14d`, `ends-before-fade` (days with any `hiddenFatigued` card ≤ 20% of days played, per student), `knowledge-up` (`dayEnd > day0` for every student with `quitAppDay === null` and ≥ 10 days played).

- [ ] **Step 1: Write the failing tests**

```ts
test("runStudent is repeatable: same seed → identical log", …)       // fixture content, 6 days, 2 personas
test("log has what §13 needs: every card line has served.reason, height, right, ms; ends have kind", …)
test("each check catches a planted violation", …)                    // hand-made logs: end after wrong; repeat on day 5; 45 effort day; side-door on day 1; flat knowledge
test("real content, 3 personas, 10 days: no throw; checks run", …)   // strong, weak-impatient, underconfident-skipper; timeout 60 s
```

- [ ] **Step 2: Run** → FAIL. **Step 3: Implement.** **Step 4: Run** all tests → PASS.
- [ ] **Step 5: Full run.** `cd engine && npm run sim -- --days 28 --seed 1 --packs all --out runs/first`. Expected: 16 logs written and a checks table. Failing checks here are findings, not test failures.
- [ ] **Step 6: Commit** `git commit -m "sim: 28-day runner and code invariants"`

---

### Task 11: First tuning pass

**Files:**
- Modify: `engine/src/config.ts` (numbers only), `engine/tests/config.test.ts` (same numbers)
- Create: `engine/runs-notes/2026-first-tuning.md` (committed; `runs/` itself stays ignored)

- [ ] **Step 1:** Run seeds 1, 2, 3 (`--out runs/t1-s1` …). Record in the notes file, per seed: the checks table; per persona: days played, quit day, mean cards/session, mean effort/session, success rate, knowledge day0 → dayEnd, final profile, `contentExhausted` count.
- [ ] **Step 2:** For each failing check, find the cause in the log. A wrong rule is fixed in engine code with a new failing unit test first. A wrong number is changed in `config.ts`. Hidden-student formulas may be changed only when a persona behaves unlike its sheet (note why).
- [ ] **Step 3:** Stop when all six checks pass on all three seeds, or when a check cannot pass because of content gaps (for example `contentExhausted` on the keenest personas): record that as a finding with numbers. Do not weaken a check.
- [ ] **Step 4:** List in the notes every config value that changed, old → new, with the one-line reason; and the spec's five "design must change" lines (§13) with a yes/no from the data for the two that code can answer (skip returns next day or never; weak persona knowledge flat).
- [ ] **Step 5: Commit** `git add engine/src/config.ts engine/tests/config.test.ts engine/runs-notes && git commit -m "engine: first tuning pass from 28-day runs"`

---

### Task 12: Judge packets, prompts and report

**Files:**
- Create: `engine/sim/judge.ts`, `engine/judge/JUDGING.md`, `engine/judge/prompts/student-judge.md`, `blind-comparison.md`, `truth-check.md`, `summary.md`
- Test: `engine/tests/judge.test.ts`

**Interfaces:**
- Consumes: Task 10 output files.
- Produces: `npm run judge -- packets --run runs/<name>` and `npm run judge -- collect --run runs/<name>`.

Decisions:
- `packets` writes into `runs/<name>/judge/`:
  - `student-<id>.input.md`: the prompt from `student-judge.md`, the persona `sheet`, then the log as readable text, one line per event: `D03 S1 #4  [repair:missing-piece] H1 Circular motion › centripetal force — wrong (dont-know), 14s` using skill and section names from content; session ends as `— end: bad-day, 9.5 effort, 7 cards, fixed 2`; moments and value messages on their own lines. **No hidden traits, no knowledge numbers, no profile numbers.**
  - `blind-<a>-<b>.input.md` for 8 fixed pairs: the two logs labelled Student X / Student Y in an order set by the run seed, no sheets, no persona ids; the answer key goes to `blind-<a>-<b>.key.json`. Pairs: strong / weak-stubborn; weak-stubborn / weak-impatient; smart-impatient / strong; memory-good-calc-weak / calc-strong-memory-poor; underconfident-skipper / confident-misconceptions; average-noclass / average-fastclass; slow-reader / fast-guesser; steady-five-min / binge-quit. Each asks the two trait questions that separate that pair (written in `blind-comparison.md` as a table).
  - `truth-<id>.input.md`: profile by day (`profileByDay`), the hidden `traits`, knowledge day0/14/end, and the prompt from `truth-check.md`.
- `student-judge.md` carries spec §13 "What each judge agent is told" and the 7-line rubric verbatim, and fixes the report format: a fenced `json` block `{ "scores": { "fit": 1-5, "reaction": …, "skips": …, "adjusting": …, "workload": …, "progress": …, "quit": 1-5 }, "quotes": { "<rubric key>": ["<log line>", …] }, "quit_point": "D07 S1 #5" | null, "worst_moment": "…" }` followed by ≤ 200 words in the student's voice. A score with an empty quote list is invalid.
- `blind-comparison.md` report format: `{ "answers": { "<question>": "X" | "Y" | "cannot tell" }, "evidence": { … } }`. `truth-check.md` report format: `{ "wrong": [{ "number": "comfort|memory|h3Share|stamina", "engine": …, "truth": "…", "by_day": n }], "right": [...] }`.
- Reports are written by the judge agents to the same folder as `<input name>.report.md`.
- `collect` reads all reports, validates the JSON blocks (missing quotes ⇒ listed as invalid, not scored), marks blind answers against the keys, and writes `runs/<name>/judge/summary-input.md`: a table of persona × rubric score, quit points, blind accuracy (n correct / n asked, per pair), truth-check misses, the code-check table, and the five "design must change" lines each marked met / not met with the evidence (quit before day 7 from `quit_point` or `quitAppDay`; near-identical sessions from blind pairs with every answer wrong or "cannot tell"; flat weak knowledge; skip timing check; blind failure share > 25% of pairs). `summary.md` is the prompt for one final agent that turns `summary-input.md` into `report.md`: one page per student and one ranked summary page ("where the app failed which kind of student").
- `JUDGING.md` is the runbook for a Claude Code session: run `packets`; dispatch one subagent per `*.input.md` with the instruction "Read this file and write your report to `<same name>.report.md`. Do not read any other file in this folder."; run `collect`; dispatch the summary agent; give Viraj `report.md`. It states that judge agents must be fresh (no access to keys, traits or other students' files) and that launching them needs Viraj's go-ahead because it spends tokens (about 40 agent runs per full pass).

- [ ] **Step 1: Write the failing tests**

```ts
test("student packet contains the sheet and reasons, and none of: traits keys, 'knowledge', 'stamina', 'comfort'", …)
test("blind packet has no persona id or sheet text; key file maps X/Y; order differs across seeds", …)
test("collect: valid report scored; a score without quotes is listed invalid; blind accuracy computed from keys", …)   // fixture reports
test("collect flags 'quit before day 7' when a quit_point is D05", …)
```

- [ ] **Step 2: Run** → FAIL. **Step 3: Implement** `judge.ts` and write the four prompts and the runbook. **Step 4: Run** all tests + `npx tsc --noEmit` → PASS.
- [ ] **Step 5:** `npm run judge -- packets --run runs/t1-s1`; open one student packet and one blind packet and read them as the judge would: the log must be understandable with no other file.
- [ ] **Step 6: Commit** `git add engine/sim/judge.ts engine/judge engine/tests/judge.test.ts && git commit -m "sim: judge packets, prompts and report collector"`
- [ ] **Step 7: Stop and hand over.** Tell Viraj the packets are ready and ask before launching judge agents. After the judged report: design changes go back to the spec first, then a new plan.

---

## Spec coverage

| Spec | Task |
|---|---|
| §4 heights | 2 (mapping), 3 (rules) |
| §5 live loop, repair, "I don't know", step down | 3, 5 |
| §6 skip, remind, drip, side door, value, borrowed strength, class timing | 6 (borrowed strength pick in 4) |
| §7 profile, liking, fallbacks | 4 (liked fallback), 7 |
| §8 effort, budget, plan, due/new choice, three ends, comeback | 4, 5 |
| §9 moments | 8 |
| §10 pure engine, API, state, reasons, events, one config | 1, 3, 5 |
| §11 content gaps | 2 (index tolerates missing heights), 10–11 (`contentExhausted`, findings). The per-template "no matching easy card" content report is **not** in this plan: follow-up for the content pipeline. |
| §12 decision records | 1 |
| §13 hidden students, run, code checks, judges, rubric, extra judges, output, change triggers | 9, 10, 11, 12 |
| §15 step 7 (app wiring) | Separate plan |
