# DR-0046: Build only a narrow /admin page; reuse PostHog, Sentry and Supabase Studio

- **Status:** Accepted (2026-11-09)
- **Date:** 2026-11-09 · **Owner:** Viraj
- **Area:** Tech / Product
- **Source:** [simulation and admin plan](../living/simulation-and-admin.md) §6

## Context
Viraj needs one place to watch the sim and the pilot and to act fast (disable a bad item, grant premium, repair a streak). A full admin product would eat weeks before the pilot. Most needs (funnels, retention, flags, crashes, raw data) are generic and already solved by tools in the stack ([DR-0013](0013-tech-stack.md)).

## Options considered
1. A full custom admin: everything in one place / weeks of work, duplicates mature tools
2. Tools only (PostHog, Sentry, Supabase Studio): no build / can't show engine vs truth or insight checks, and raw SQL for support actions is risky
3. A narrow `/admin` page for what only UniKey knows plus instant controls; links out for the rest ✅

## Decision
- `/admin` in the teacher web app (`apps/web`), for Viraj only. Panels: Pulse, Learning engine, Content health, Insight check, Flows.
- Controls: sim start/pause/speed and fault injection (staging only), feature flags (via PostHog), disable an item or template instantly, content publish/rollback, read-only student lookup, grant premium, repair streak, generate a teacher digest.
- Every write is an append-only `admin_action` event with a required note. Lookups of real students are logged.
- Borrowed: PostHog (funnels, retention, flags, replay), Sentry (crashes, errors), Supabase Studio (raw data, job queue).

## Revisit triggers
- A support or content action takes raw SQL more than twice in a week
- More than one person needs admin access
- Review date: 2027-04-01

## Consequences
+ 2–3 days of work; nothing generic rebuilt
− Viraj switches between tools; the page is plain and Viraj-only
