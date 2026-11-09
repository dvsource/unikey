# UniKey teacher dashboard P0: test report

_Run 2026-11-08 · spec v1 · [qa-spec.md](qa-spec.md) · [execution-plan.md](execution-plan.md)_

## Summary

| Suite | Result | Time |
|---|---|---|
| Build (`next build`, type check, static export) | ✅ pass | ~20 s |
| Unit (Vitest) | ✅ **13 / 13** | < 1 s |
| E2E (Playwright, phone 375×812) | ✅ **86 / 86** | ~33 s |
| Flakiness check (`--repeat-each=3`) | ✅ 258 / 258 | 1.5 min |
| Manual (real phones) | ⏳ not run: needs the deployed link | — |

**Coverage:** the spec has 104 cases: 44 P0, 49 P1 and 11 P2.
- **Automated:** 97 cases (13 unit, 84 E2E). Some cases share one test, and A11Y-01 runs once per page, which is why there are 86 E2E tests.
- **Manual:** 7 cases.
- **Status:** every automated case passes. **No open P0 or P1 failures.**

**Verdict:** ready to deploy and show teachers once M-01 and M-03 pass on a real Android phone after deploy.

## Environment

- macOS, Node 24.14
- Next.js 15.5.19 static export
- Vitest 3.2.4
- @playwright/test 1.57.0 with Chromium headless shell (build 1200)
- @axe-core/playwright 4.10.2
- `serve` 14.2.4 on port 4322

## Bugs found and fixed in this run

| # | Found by | Pri | Bug | Fix |
|---|---|---|---|---|
| 1 | A11Y-01 (`/students/tharushi/`, `/topics/`) | P1 | Progress bars and day bars had `aria-label` on a plain `div`/`span`, which screen readers ignore (axe `aria-prohibited-attr`) | Added `role="img"` to `.bar` and `.days` (`components/ui.tsx`) |
| 2 | A11Y-01 (`/class/`) | P1 | The "Teaching now" dropdown had no accessible name (axe `select-name`) | Added `aria-label="Teaching now"` (`app/class/page.tsx`) |
| 3 | A11Y-01 (`/digest/`) | P1 | The "Open your class →" link in the WhatsApp bubble was below 4.5:1 contrast | Link colour `#1a73c9` → `#0b57a4` (`app/globals.css`) |
| 4 | Manual check while building the suite (now CON-02) | P0 | Skill URLs contained dots (`/skill/phy.mech…/`), so Next's link prefetch requested `….txt` files that don't exist. Every skill link 404'd on prefetch and fell back to a full reload. | Skill URLs use `_` for `.` (`skillHref`); CON-01/02 and NAV-04 guard it |

## Test bugs fixed (the app was right)

| Case | Problem | Fix |
|---|---|---|
| RULE-02 | `/earn/` matched "l**earn**ing" | `\bearn` |
| RULE-05 | `/class set/` matched "**Class set**up" | `\bclass sets?\b` |
| STU-02 | "No % on the student list" also caught the header's class practice readiness % | Scoped to the student rows |
| W1-01 | "Quiet students" matched the empty-state sentence "…and quiet students show up here" | Matched the card kicker only |

## Results by area

| Area | Cases | Result |
|---|---|---|
| DATA | 11 | ✅ The fake class is consistent: 9 stuck on the bottleneck = the 9 students in that state; the root cause is a real `requires` prerequisite with evidence from 7 (≥ 3) students; distributions sum to 24. |
| BLD | 2 | ✅ 83 skill pages and 24 student pages exported, no dotted paths; the skills script is idempotent. |
| NAV | 6 | ✅ All 114 routes return 200; no in-app link 404s. |
| HOME | 8 | ✅ |
| FB, FBL | 8 | ✅ The "Not right?" note is saved. During the build check, a typed note looked lost; that was the click tool, not the app. |
| ASN | 7 | ✅ |
| TOP, SKL | 10 | ✅ |
| STU, PRV | 9 | ✅ Effort-only and awaiting-consent students show no skills or mistake patterns. No phone numbers, parent, payment or marks text on any of the 24 student pages. |
| CLS, W1 | 8 | ✅ |
| SIGN, DIG | 4 | ✅ The digest numbers match the dashboard. |
| PER | 4 | ✅ Survives a reload; corrupt or blocked localStorage doesn't crash. |
| RULE | 6 | ✅ No nudges, earnings, ranking, predicted marks or class sets. At most 3 action cards. |
| LAY | 4 | ✅ No horizontal scroll at 375 or 320 px. 560 px centred column on desktop. Nothing hidden behind the tab bar. |
| SI, DS | 5 | ✅ Noto Sans Sinhala loaded and applied, line height ≥ 1.5, Dawn colours. |
| A11Y | 3 (9 tests) | ✅ after fixes 1–3 |
| CON | 2 | ✅ No console errors and no failed requests, including client-side prefetch. |

## Open items

| Case | Status | Note |
|---|---|---|
| M-01 to M-05, SI-03 | ⏳ Not run | Needs the deployed link on a real Android phone and an iPhone |
| W1-03 | Known gap (P2) | Week-1 preview still lists 24 students. Left as is for P0. |
| — | Observation (not a bug) | Some streaks are longer than the days shown this week (e.g. "9-day streak" with 6 bars). That's possible, since streaks span weeks, but a teacher may ask about it. Consider "streak" wording in P1. |

## How to reproduce

```bash
cd dashboard
npm install && npx playwright install chromium
npm run qa
npx playwright show-report qa/playwright-report
```
