# DR-0045: A "simulated" flag on every user; simulated and real data never mix

- **Status:** Accepted (2026-11-09)
- **Date:** 2026-11-09 · **Owner:** Viraj
- **Area:** Tech / Privacy
- **Source:** [simulation and admin plan](../living/simulation-and-admin.md) §3

## Context
Synthetic students, teachers and parents go through the real backend. If their data leaks into real reports, digests, PostHog funnels, payment totals or a real teacher's class, the pilot numbers are wrong and teachers lose trust. Test accounts used by the wife and reviewers have the same risk.

## Options considered
1. A separate database for the sim only: clean / the sim no longer tests the real deployment, and test accounts still mix
2. A `simulated` boolean on every user (student, teacher, parent), set at creation and never changed; everything derived inherits it ✅
3. Name prefixes like "SIM-": quick / easy to forget in one query

## Decision
- Every user row has `simulated` (not null, set at creation, immutable). Classes, events, payments and insights inherit it from their users. A class can't mix simulated and real users.
- Real reports, digests, WhatsApp sends, PostHog events and payment reports exclude simulated data by default. Simulated users never reach WhatsApp or real PayHere.
- `/admin` shows real by default, with a real / simulated / both switch.
- The ground truth (`sim_truth`) lives in its own table that only `/admin` and the go/no-go report read.
- The simulator mostly runs in staging. The flag still guards staging test accounts, and allows optional canary students in production later.

## Revisit triggers
- Any simulated row appears in a real report, digest or payment total
- Review date: 2027-02-01

## Consequences
+ Sim and test data can run next to real data safely; one check in the go/no-go
− Every query and job must respect the flag; needs tests on the critical paths
