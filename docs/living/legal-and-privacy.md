# Legal & Privacy

_Last updated: 2026-11-02. Not legal advice; verify each item with a lawyer or the relevant authority._

## Company and IP hygiene (do early)
- [ ] Register a **Pvt Ltd**.
- [ ] **Trademark** the name and logo with the National Intellectual Property Office (NIPO). Cheap insurance.
- [ ] **IP assignment** to the company from everyone who creates content or code, including the wife and paid reviewers. Keep it clean and friendly.
- [ ] Simple written agreements with teachers (revenue share terms; content IP stays with the company).
- Skip NDAs with tuition teachers (they look amateur). Skip software patents (slow, expensive, weak in SL).

## What is and isn't protectable
| Asset | Protectable? | Action |
|---|---|---|
| Idea / features | ❌ | Don't spend on it |
| Software patents | ❌ practically | Skip |
| Brand name and logo | ✅ Trademark | Register early |
| Code | ✅ Copyright (automatic) | Private repo; don't open-source the core engine |
| Content | ✅ Partly | Pure AI output has murky copyright. Human review and editing strengthens ownership. Keep version history as evidence. |
| Bulk content theft | ✅ ToS + evidence | Anti-scraping terms, rate limits, **canary items** (unique fake variants that prove copying) |

## Open legal questions
| # | Question | Why it matters | Status |
|---|---|---|---|
| L1 | Can past DoE papers be used commercially in a paid product? | Copyright grey area | Open. Default: link the originals, generate "in the style of" variants. |
| L2 | What do current MoE circulars say about government teachers and paid products for their own students? | Teacher onboarding model | Open. Mitigated by [DR-0011](../decisions/0011-teachers-never-sell.md). |
| L3 | Google Play payments policy for SL: must digital subscriptions use Play Billing? | Payment design | Open. Check before public launch. |
| L4 | Play Console closed-testing requirement for new personal developer accounts | Pilot distribution | Open. The pilot likely satisfies it. Check the current rule. |
| L5 | PDPA obligations for minors' data and parental consent | Onboarding flow | Open |

## Privacy (minors' data)
SL's Personal Data Protection Act applies.
- Collect the minimum: name, class, medium. No national ID numbers, no precise location.
- Parental consent at onboarding for under-18s: a one-time WhatsApp confirmation ([DR-0018](../decisions/0018-student-is-primary-customer.md)). After that, what parents see is the student's choice (effort only by default).
- Leaderboards are class-scoped, with a nickname option, and never show public full names.
- Parent links: unguessable token, expiring, read-only, scoped to one student.
- Encrypted backups; export and delete data on request.
- Never cold-contact numbers scraped from groups. Use opt-in only ([go-to-market](go-to-market.md#outreach-rules)).
