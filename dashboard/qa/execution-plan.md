# UniKey teacher dashboard P0: test execution plan

_Version 1 · 2026-11-08_

This plan says how and when the cases in [qa-spec.md](qa-spec.md) are run. Results go in [test-report.md](test-report.md).

## Suites

| Suite | What | Cases | Command | Time |
|---|---|---|---|---|
| **Unit** | Vitest in `qa/unit/` | DATA, BLD | `npm test` | ~2 s |
| **E2E** | Playwright in `qa/e2e/`, Chromium at phone size (375×812, touch), against the static export in `out/` served on port 4322 | All E cases | `npm run test:e2e` | ~1–2 min |
| **All** | Build, then unit, then E2E | All automated cases | `npm run qa` | ~2–3 min |
| **Manual** | The M cases on real phones | M-01 to M-05, SI-03, W1-03 | by hand | ~15 min |

E2E runs on the **built static export**, not `next dev`. That's what teachers get, and it catches export-only bugs, such as the dotted skill URLs that broke prefetch.

## When each suite runs

| Trigger | Runs | Must pass |
|---|---|---|
| Any change to `dashboard/` | `npm run qa` | All P0 and P1 green |
| Before sending a link to a teacher (each deploy) | `npm run qa` + manual M-01 and M-03 on one Android phone | All P0 green; P1 failures listed in the report with a decision |
| After teacher feedback changes (P1 revise) | Update the spec cases first, then `npm run qa` | Same |
| A bug fix | The case that found it, plus a new case if none covered it | The case passes |

## Environment

| Item | Value |
|---|---|
| Host | macOS, Node 24 |
| App | Next.js 15.5.19 static export (`output: "export"`), React 19.1 |
| Unit | Vitest 3.2.4 |
| E2E | @playwright/test 1.57.0, Chromium headless shell (build 1200), @axe-core/playwright 4.10.2 |
| Server | `serve@14.2.4` on `out/`, port 4322, started by Playwright's `webServer` |
| Viewports | 375×812 touch (default), 320×640 (LAY-02), 1280×800 (LAY-03) |

## How to run

```bash
cd dashboard
npm install
npx playwright install chromium     # first time only
npm run qa                          # build + unit + e2e
```

Or one suite at a time:

```bash
npm run build && npm test
npm run test:e2e                    # needs out/ (npm run build)
npx playwright test qa/e2e/home.spec.ts      # one file
npx playwright show-report qa/playwright-report
```

Failed E2E tests keep a trace and a screenshot in `qa/test-results/`.

## Order and isolation

- **Unit before E2E.** If the data story is inconsistent (DATA-05, DATA-07), the E2E failures are noise.
- **Fresh state.** Each E2E test gets a new browser context, so localStorage starts empty. Tests that need state (PER) set it up themselves.
- **Workers.** E2E runs in parallel, because tests share no state.

## Exit criteria for showing it to a teacher

1. `npm run qa` is green, or every failing P1/P2 case is listed in the report with a decision.
2. No P0 failure.
3. M-01 and M-03 have been checked on one real Android phone after deploy.

## Manual checklist

- [ ] M-01: open the deployed link from WhatsApp on a cheap Android phone. Time the first load and check the fonts.
- [ ] M-02: iPhone Safari. Check the tab bar against the home indicator.
- [ ] M-03: Share on WhatsApp opens WhatsApp with the share text.
- [ ] M-04: Feedback → Send on WhatsApp carries the JSON.
- [ ] M-05: gradient banding on a cheap screen.
- [ ] SI-03: Sinhala conjuncts render correctly.
- [ ] W1-03: known gap, confirm it's still only the student list.
