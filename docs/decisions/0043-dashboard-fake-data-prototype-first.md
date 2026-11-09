# DR-0043: Build a fake-data dashboard prototype first

- **Status:** Accepted (Viraj, 2026-11-07)
- **Date:** 2026-11-07 · **Owner:** Viraj
- **Area:** Process / Product
- **Source:** [teacher dashboard plan](../living/teacher-dashboard.md) (phase P0)

## Context
The student app started as a prototype with bundled content and no backend (roadmap step 2). The same approach lets teachers react to the dashboard before any backend work.

## Decision
- A throwaway Next.js prototype in `dashboard/`, static and with no backend: one hard-coded class ("Grade 13 · 2027 batch", 24 fake students with realistic patterns), real Sinhala Mechanics skill names, Dawn tokens, opened on phones from a WhatsApp link.
- The wife and 1–2 pilot teachers try it; their reactions are written into the plan before the real build on the shared backend starts.

## Revisit triggers
- Teachers can't judge it without real data from their own students
- Review date: 2026-12-01

## Consequences
+ Cheap early feedback; the screen list can be frozen before backend work
− About a week of throwaway code
