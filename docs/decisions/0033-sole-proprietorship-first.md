# DR-0033: Register a sole proprietorship now; convert to Pvt Ltd later

- **Status:** Accepted (Viraj, 2026-11-07, picked from options)
- **Date:** 2026-11-07 · **Owner:** Viraj
- **Area:** Company

## Context
The legal doc said to register a Pvt Ltd early. A registered business is needed for a PayHere merchant account after the pilot; the pilot itself uses manual payments ([DR-0014](0014-payments.md)).

## Options considered
1. Pvt Ltd now: separates IP and liability, slower and costlier
2. **Sole proprietorship now; convert to Pvt Ltd later** ✅
3. Register after the pilot: risks PayHere delays at launch

## Decision
- Register a sole proprietorship now, so the PayHere merchant account and a business bank account can be set up before the public launch.
- Convert to Pvt Ltd later.
- IP assignment from everyone who creates content or code still applies; it will move to the company at conversion.

## Revisit triggers (convert to Pvt Ltd when any fires)
- Bringing in a partner, investor or equity for the advisor friend
- Signing agreements with teachers or tuition institutes that need a company
- Revenue or liability large enough that personal liability matters
- Review date: 2027-04-01

## Consequences
+ Fast and cheap; unblocks PayHere
− No liability separation; IP sits with Viraj personally until conversion
