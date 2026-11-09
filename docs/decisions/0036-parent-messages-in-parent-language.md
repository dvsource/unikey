# DR-0036: Parent WhatsApp messages in the parent's chosen language

- **Status:** Accepted (Viraj, 2026-11-07)
- **Date:** 2026-11-07 · **Owner:** Viraj
- **Area:** Design / Content
- **Exception to:** [DR-0024](0024-sinhala-medium-ui-language.md) (UI text in English)

## Context
DR-0024 puts all interface text in English, so parent messages ended up mostly in English. Many parents of Sinhala-medium students don't read English comfortably (open design question D3).

## Options considered
1. English, strictly following DR-0024
2. **The parent's language, chosen at the consent step** ✅
3. Sinhala and English together in each message

## Decision
- The parent chooses Sinhala, Tamil or English at the consent step (A8). Consent, weekly reports, the "Ask parent to pay" request, receipts and renewal messages use that language.
- The student app, and messages to students and teachers, stay as DR-0024 says.
- Parent message templates must be translated and checked like content.

## Revisit triggers
- Parents report confusion or the wrong language
- Review date: 2027-04-01

## Consequences
+ Parents can read what they're paying for
− Every parent template exists in up to 3 languages
