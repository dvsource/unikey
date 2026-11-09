# DR-0013: Tech stack: TypeScript monorepo, Expo app, local-first, modular monolith on Postgres

- **Status:** Accepted (Viraj, 2026-11-07)
- **Date:** 2026-11-02 · **Owner:** Viraj
- **Area:** Tech

## Context
A small team, ~90% AI-written code with careful human review of critical parts. Students expect seamless, fast apps on cheap Android phones with patchy data. Parents and teachers shouldn't need an app. Don't over-build for 1,000+ on day one, but don't cut corners on UX.

## Options considered
1. Flutter + Firebase: fast start, weaker shared types with a web dashboard, vendor lock-in
2. **TS everywhere: Expo/RN + SQLite local-first, Fastify API, Supabase Postgres, pg-boss, Next.js web, R2 CDN; Python/SymPy for content** ✅
3. Microservices: unnecessary operational load at this scale

## Decision
Option 2, detailed in [tech architecture](../living/tech-architecture.md). Android first. Append-only event sync (no sync engine). Singapore/Mumbai region. Human line-by-line review for: data model, scheduler, sync, auth/RLS/signed links, payments.

## Revisit triggers
- Open-to-first-card >2 s on a 2–3 GB RAM test device that can't be fixed within the stack
- Need for offline teacher-edited content → consider PowerSync
- ~5–10k students → partitioning / read replicas (planned, not a rewrite)
- Review date: 2027-04-01

## Consequences
+ One language, shared types, cheap (~$10–60/month for the pilot), grows to ~10k without a rewrite
− React Native performance needs care on low-end devices; we run more pieces ourselves than with an all-in-one BaaS
