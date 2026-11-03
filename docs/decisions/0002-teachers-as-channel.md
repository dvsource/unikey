# DR-0002: Teachers are the main distribution channel (B2B2C)

- **Status:** Accepted
- **Date:** 2026-11-01 · **Owner:** Viraj
- **Area:** GTM

## Context
A/L is tuition-driven, and teachers are the trust gatekeepers to students. The original plan relied mostly on social media marketing. Social builds awareness, but students buy on a recommendation from a teacher or friend. Ads plus Play Store discovery are slow and expensive, and CAC ≈ 0 is required to hit the profit target.

## Options considered
1. Social media + ads + app store organic: cheap reach, poor paid conversion, CAC grows
2. **Teachers as the channel, with social as support** ✅: warm trust, bulk reach, near-zero CAC
3. Partner with telcos / white-label agencies: big reach, slow, we lose control

## Decision
Teachers are the primary channel. They get a free class workspace (assign decks, class weak spots, paper builder). The teacher dashboard is a **v1 feature**, not a side feature. Social media (with the wife as the face) supports awareness. How teachers earn and what they sell is decided separately in [DR-0011](0011-teachers-never-sell.md). The channel sequence is in [DR-0007](0007-500-channel-before-big-players.md) → [DR-0008](0008-pilot-close-circle.md).

## Assumptions
- [A10](../experiments/assumptions.md): teachers adopt a free tool without needing revenue share
- [A17](../experiments/assumptions.md): CAC ≈ 0 through the teacher channel

## Revisit triggers
- <5 teachers actively using the dashboard 2 months after wave 1
- Social/organic paid signups exceed teacher-sourced paid signups for 2 consecutive months
- Review date: 2027-06-01

## Consequences
+ Low CAC, trust transfer, class-level data
− The teacher dashboard must ship in v1 (more scope); dependence on relationships
