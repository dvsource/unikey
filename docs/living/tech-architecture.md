# Tech Architecture

_Last updated: 2026-11-09 (clock and simulated flag) · Decision: [DR-0013](../decisions/0013-tech-stack.md)_

TypeScript end to end, a **local-first** mobile app, and a **modular monolith** on managed Postgres. Fast for users, cheap at the start, and it grows to ~10k students without a rewrite. ~90% of the code is AI-written; Viraj reviews the critical parts line by line.

## Guiding decisions
| Decision | Choice | Why |
|---|---|---|
| Language | TypeScript everywhere; Python only for the maths/content pipeline | AI writes mainstream stacks best; shared types across app, API and dashboard |
| Architecture | Modular monolith (one API, one DB, one worker) | Far less to operate at this scale. Resist microservices. |
| UX model | Local-first: studying never waits on the network | Feels instant on cheap Android with patchy data |
| Platforms | Android first; iOS later from the same codebase | Most SL students use Android |
| Scale | Build for the pilot, don't over-build for 1,000+. Never cheap out on UX. | |

## Stack
| Layer | Choice | Notes |
|---|---|---|
| Mobile app | React Native + Expo (Hermes) | EAS Update pushes JS fixes without store review |
| Local DB | SQLite (op-sqlite or expo-sqlite) | Content packs + review state + event queue |
| Scheduler | ts-fsrs (L1/L2) + own KC mastery model with retrievability and FIRe-style implicit review (TS, shared package) | Runs on device; server recomputes as the source of truth ([DR-0022](../decisions/0022-typed-skill-graph.md)) |
| API | Node + Fastify (or Hono), Zod schemas shared via the monorepo | |
| Database | Postgres on Supabase (or Neon) | Auth, storage, RLS; plain Postgres, no lock-in |
| Jobs | pg-boss | No Redis. Weekly reports, PDFs, calibration, WhatsApp sends. |
| Web | Next.js | Teacher dashboard, admin/review UI, parent report pages, public topic pages |
| CDN | Cloudflare R2 + CDN | No egress fees; versioned content packs and sims |
| Simulations | Canvas/p5.js web components, bundled offline, WebView in the app | Same sim in app, dashboard (projector) and parent links |
| Maths rendering | KaTeX, pre-rendered to SVG/HTML at publish | No runtime layout on device |
| Content pipeline | Python + SymPy, LLM batch generation | Offline / CI, never in the request path |
| PDF / paper builder | HTML → PDF via headless Chromium (Gotenberg); test Typst | Chromium is safe for Sinhala/Tamil shaping. Test Typst first. |
| Auth | Google sign-in + phone OTP via a **local** SMS gateway + class join codes | International SMS is expensive for SL numbers |
| Payments | PayHere (web/bulk/codes) + RevenueCat over Play Billing (later) | See [DR-0014](../decisions/0014-payments.md) |
| Parent / student WhatsApp | WhatsApp Business Cloud API, utility template + signed link | Parents only with student-chosen sharing ([DR-0018](../decisions/0018-student-is-primary-customer.md)); students only if opted in. Check Meta's per-message SL pricing. |
| Reminders | **No push notifications** ([DR-0020](../decisions/0020-no-push-notifications.md)). Android home-screen widget (streak + today's 5 questions) + opt-in WhatsApp reminder (off by default) | Widget: e.g. react-native-android-widget or Expo native module |
| Analytics | PostHog | Funnels, retention, flags, session replay |
| Errors | Sentry | |
| Region | Singapore or Mumbai | Lowest latency to SL |
| Fonts | Geist (UI, numbers), Noto Sans Sinhala, Noto Sans Tamil (bundled) | Test on low-end Android. Design: [UX design](ux-design.md) |
| UI effects | Sky gradient ground, solid white surfaces, no blur ("Dawn", [DR-0025](../decisions/0025-dawn-design-system.md)) | Dark theme "Dusk" later as a token swap; respect reduced motion |

## Architecture
```
┌──────────── Student app (Expo/RN, Android) ───────────┐
│  SQLite: content packs + review state + event queue   │
│  Scheduler (ts-fsrs + KC mastery) runs locally         │
│  Sims in WebView (bundled offline)                     │
└───────────┬───────────────────────────┬───────────────┘
   sync: push attempt events      pull: versioned content packs
            ▼                           ▼
     ┌──────────────┐           ┌────────────────┐
     │ API (Fastify)│           │ Cloudflare R2  │◄── publish pipeline
     │ auth, sync,  │           │ + CDN          │    (Python/SymPy,
     │ classes, pay │           └────────────────┘     review UI)
     └──────┬───────┘
            ▼
     ┌──────────────┐     ┌───────────────────────────────┐
     │  Postgres    │◄───►│ Worker (pg-boss): weekly       │
     │  (Supabase)  │     │ reports, PDFs, calibration,    │
     └──────┬───────┘     │ WhatsApp sends                 │
            ▼             └───────────────────────────────┘
     ┌──────────────────────────────┐
     │ Next.js: teacher dashboard,  │
     │ admin/review UI, parent      │
     │ report pages (signed links)  │
     └──────────────────────────────┘
```

### Sync stays simple (no sync engine at first)
| Data | Shape | Strategy |
|---|---|---|
| Content | Read-only, versioned | Per-unit packs with version numbers; fetch changed packs only |
| Student activity | Append-only events | Queue locally, upload in batches, idempotent on event ID |
| Derived state (mastery, due dates) | Computed | On device for instant use; on the server for truth and teacher views |

Append-only events never conflict. They are also the source for analytics, calibration and reports.

### Built for simulation from day one
| Rule | Why |
|---|---|
| All server code reads time through one `Clock` (`now()`); no direct `Date.now()`. Real time in production; pausable and up to 1440× in staging ([DR-0044](../decisions/0044-controllable-backend-clock.md)) | The simulator runs 8 pilot weeks in about an hour; time bugs can be replayed |
| Every user has an immutable `simulated` flag; classes, events, payments and insights inherit it. Real reports, digests, WhatsApp, PostHog and payments exclude it ([DR-0045](../decisions/0045-simulated-flag-on-every-user.md)) | Simulated and test data never mix with real data |
| The simulator uses the same sync API as the app, no back door | It tests the real deployment |
| Admin writes are append-only `admin_action` events; a narrow `/admin` page in `apps/web` ([DR-0046](../decisions/0046-narrow-admin-page-reuse-tools.md)) | Support actions are traceable; generic needs stay in PostHog, Sentry, Supabase Studio |

Plan and go/no-go criteria: [simulation and admin](simulation-and-admin.md).

## Content workflow
`draft → AI-verified (SymPy, 50 variants/template) → reviewed (review UI) → published → content pack → R2`

Build the review UI early. It's where the content reviewer spends her time: fast, mobile-friendly, rendered exactly as students see it.

## Repo
Monorepo (pnpm + Turborepo):
```
apps/mobile     Expo app
apps/web        Next.js (dashboard, admin, parent pages)
apps/api        Fastify
packages/shared Zod schemas, types, scheduler
tools/content   Python content pipeline
docs/           these docs (decision records in-repo so AI agents follow them)
```
Strict TypeScript, shared Zod schemas, and a CLAUDE.md that points to these docs.

## Review rules for AI-written code
**Review line by line:**
| Area | Why |
|---|---|
| Data model + migrations | Expensive to undo |
| Scheduler + mastery model | Core product logic. Property-based tests (never scheduled in the past; mastery bounded). Acceptance test: the [simulator](simulation-and-admin.md) ([DR-0047](../decisions/0047-simulator-as-engine-acceptance-test.md)). |
| Sync + event ingestion | Idempotency and ordering bugs silently corrupt data |
| Auth, RLS, signed links | No leaks between classes or to the wrong parents |
| Payments + entitlements | Real money; the main source of complaints |

**AI owns (light review):** UI screens, CRUD endpoints, admin UI, PDF layout, sim implementations.

## Experience targets
| Target | How |
|---|---|
| Open → first card < 2 s | Local SQLite, precomputed queue, no network on startup |
| Instant feedback on every answer | Grading and scheduling on device |
| Runs on 2–3 GB RAM Android | Test on a cheap device from week 1 |
| Low data use | Unit packs, WebP, delta updates, bundled sims |
| Download < 30–40 MB | Content per unit on demand |
| Same-day bug fixes | EAS Update |

## Cost estimates (USD/month, rough; verify pricing)
| Item | Pilot (~100) | ~1,000 | ~10,000 |
|---|---|---|---|
| Supabase | 0–25 | 25–50 | 100–250 |
| API + worker hosting | 5–20 | 20–50 | 100–200 |
| Next.js hosting | 0–20 | ~20 | 20–50 |
| R2 / CDN | ~0 | 1–5 | 10–30 |
| PostHog / Sentry | free | 0–30 | 50–150 |
| WhatsApp reports | small | ~4 msgs/parent/month | linear |
| Play ($25 once) / Apple ($99/yr) | 25 | — | — |
| **Infra total (excl. messaging)** | **~10–60** | **~70–150** | **~350–700** |

- AI content generation is a **one-time batch cost** (use batch APIs).
- Runtime AI (e.g. "explain my mistake") is the only cost that grows with usage. Leave it out of v1, or cap it per user per day.
- At 1,000 payers, infra ≈ 3–5% of revenue. Store fees and marketing matter far more.

## Growth path (no rewrite)
| When | Change |
|---|---|
| ~5–10k students | Partition attempts by month; read replica for dashboards |
| Heavy calibration | Export events to DuckDB/ClickHouse |
| Complex sync (teacher-edited decks offline) | Consider PowerSync or similar |
| More subjects / exams | Same engine: more KC graphs and content packs |
| iOS | Same Expo codebase; RevenueCat billing |
| Runtime AI tutoring | Separate service with per-user quotas and caching |

## Privacy (minors)
See [legal & privacy](legal-and-privacy.md#privacy-minors-data).
