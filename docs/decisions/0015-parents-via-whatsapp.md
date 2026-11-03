# DR-0015: No parent app. Parents get WhatsApp reports + signed web links

- **Status:** Accepted
- **Date:** 2026-11-02 · **Owner:** Viraj
- **Area:** Product / Tech

## Context
Parents are the payers, and visibility is what they buy. They won't install another app; WhatsApp is where they already are.

## Options considered
1. Parent app or login: friction, low adoption
2. **Weekly WhatsApp summary + signed, expiring, read-only link to a mobile web report** ✅
3. Email reports: low open rates in SL

## Decision
Option 2. The pilot sends manually; automate via the WhatsApp Business Cloud API (utility template) after the pilot. Parental consent via WhatsApp opt-in at onboarding.

## Assumptions
- [A7](../experiments/assumptions.md): parents value and act on weekly WhatsApp reports

## Revisit triggers
- Report link open rate <30% in the pilot
- Meta pricing makes weekly messages uneconomic
- Review date: 2027-04-01

## Consequences
+ Zero install friction; the report doubles as a sales tool
− Signed-link security must be right; WhatsApp message costs
