# DR-0044: A controllable backend clock, designed in from day one

- **Status:** Accepted (2026-11-09)
- **Date:** 2026-11-09 · **Owner:** Viraj
- **Area:** Tech
- **Source:** [simulation and admin plan](../living/simulation-and-admin.md) §3

## Context
The simulator must run 8 pilot weeks in about an hour, and the scheduler, streaks, nightly insights and digests all depend on "now". If code calls the system time directly, time can't be sped up later without hunting down every call. Adding a clock on day one costs about an hour; adding it after the backend is built costs days and leaves bugs.

## Options considered
1. System time everywhere; fake time with OS tricks in tests: no upfront work / can't speed up jobs, brittle, misses time zones
2. One `Clock` interface used by all server code and jobs; real time in production, controllable in staging ✅
3. Only test the engine offline with a fake clock, never the whole backend: simple / misses sync, jobs and dashboard bugs

## Decision
- All server code (API, scheduler recompute, pg-boss jobs, streaks, entitlements, digests) reads time only through a shared `Clock` (`now()`). A lint rule bans direct `Date.now()` / `new Date()` outside it.
- **Production:** real time, always. The clock controls don't exist there.
- **Staging:** the clock can be paused, set and sped up (1×, 60×, 1440×) from `/admin`. Due jobs fire when the clock passes their time.
- Event timestamps keep both the device time and the server's clock time, so clock skew can be tested.

## Revisit triggers
- Clock code causes a production time bug
- Review date: 2027-02-01

## Consequences
+ 8-week runs in an hour; time bugs (streaks, due dates, time zones) can be replayed
− Small discipline cost: every developer and AI agent must use `Clock`
