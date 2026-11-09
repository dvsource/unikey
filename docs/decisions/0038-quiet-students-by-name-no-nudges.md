# DR-0038: Quiet students shown by name; UniKey never nudges students for the teacher

- **Status:** Accepted (Viraj, 2026-11-07)
- **Date:** 2026-11-07 · **Owner:** Viraj
- **Area:** Product
- **Source:** [teacher dashboard plan](../living/teacher-dashboard.md)

## Context
A teacher wants to know who has stopped practising. A "nudge" button would send messages in the teacher's voice, which [DR-0020](0020-no-push-notifications.md) rejects.

## Options considered
1. A nudge button (WhatsApp or in-app) from the dashboard
2. **Show quiet students by name only; the teacher follows up in person** ✅

## Decision
- The dashboard lists quiet students by name. UniKey sends no message to the student on the teacher's behalf, by WhatsApp or in the app.
- This confirms DR-0020 on the teacher side.

## Revisit triggers
- Teachers say in-person follow-up doesn't happen and quiet students stay quiet
- Review date: 2027-04-01

## Consequences
+ Students never feel watched or nagged by the app
− Re-engagement depends on the teacher acting
