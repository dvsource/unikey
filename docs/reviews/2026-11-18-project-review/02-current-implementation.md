# Current implementation review

_18 November 2026 · working tree at HEAD e218210 with local app changes_

| Area | Observed state | Implication |
|---|---|---|
| Student app | Expo reviewer prototype with three unit packs, fixed-order Today sessions, local answers, reviewer export and in-progress skill graph screens. | Good surface for teacher review and Android usability testing. Today and Progress still use prototype session and mastery rules. |
| Study engine | Separate TypeScript engine and simulator. Recent commits cover the first seven changes accepted in DR-0051. | Run a second judge pass on the updated engine and prove the wiring on a phone. The first judge report represents the earlier engine. |
| Teacher dashboard | Next.js prototype with seeded data and local browser persistence. | Use it for teacher walkthroughs. Real assignment delivery and class-scoped visibility still need a data path. |
| Pilot operations | The roadmap specifies identity, sync, activation and optional parent sharing. I found no tracked backend implementation for these flows. | Budget and test the smallest complete path before onboarding a paid cohort. |

[App README](../../../app/README.md) · [Engine README](../../../engine/README.md) · [Dashboard README](../../../dashboard/README.md) · [Roadmap](../../living/roadmap.md)

## Findings in priority order

1. **Engine checks depend on the working tree.** The engine's repository loader rejects built packs without a graph. I checked the Mechanics pack stored in HEAD and confirmed it has no graph. The working tree has graph-enabled packs. Bring the graph manifest, builder and packs into the same integration checkpoint, then verify from a clean checkout. Give CI a single documented way to produce or verify the artifacts. [Loader](../../../engine/src/node/load.ts) · [Pack builder](../../../app/scripts/build-content.mjs)
2. **The adaptive loop has yet to reach the student app.** Today builds a fixed slice from the unit cursor, and prototype mastery comes from each item's latest correctness. Integrate the engine through a small app adapter for start, answer, skip, resume and completion. Run one native smoke test covering an easier repair after a miss, an app restart midway through practice and a later return. Agree on how old local answers are displayed or migrated before using them alongside engine state. [Session selection](../../../app/src/state/session.ts) · [App store](../../../app/src/state/store.tsx) · [Engine API](../../../engine/README.md)
3. **Simulator and device content can diverge.** The loader supplements built packs with source note references. The app builder currently omits those references, which affects a repair route. Put the metadata in the shared artifact and check equivalent card, skill, level and note mappings on both sides. Test same-skill easy-card coverage before launch. DR-0051 lists 16 skills without easy cards at decision time, so remeasure on the intended release pack. [Engine loader](../../../engine/src/node/load.ts) · [Accepted engine changes](../../decisions/0051-study-loop-rules-after-first-judge-pass.md)
4. **Dashboard fixture has drifted.** Regenerating the dashboard skill data changed the checked-in artifact. The failing assertion showed additional Thermal Physics and Current Electricity tags in the generated output. Decide whether the Mechanics prototype should include these tags, then align the generator, fixture and test. Test reproducibility against a temporary output when practical. [Dashboard generation test](../../../dashboard/qa/unit/build.test.ts) · [Generator](../../../dashboard/scripts/build-skills.mjs)

## Verification and limits

- App Jest passed 118 tests over 12 suites. App type checking passed.
- Engine Vitest passed 287 tests over 15 files. Engine type checking passed.
- Dashboard Vitest passed 12 of 13 tests. BLD-02 failed on generated fixture parity. The suite rewrote the fixture as part of the test and I restored its original contents. BLD-01 inspected the existing static export.
- These results are from the current working tree. Device behavior, a fresh dashboard export, Playwright and the second simulator judge pass were outside this run. The recorded app QA reports 16 of 19 flows on its full graph run and individual passes on rerun for the other three. [App QA report](../../../app/qa/test-report.md) · [First judge report](../2026-11-16-judge-report-seed1.md)
