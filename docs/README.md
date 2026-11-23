# UniKey — Docs

UniKey (working name) is a mobile revision app for Sri Lankan A/L students. It runs daily spaced-repetition practice on a skill graph, and it gives teachers and parents visibility into each student's progress. It launches with A/L Physics.

**Owner:** Viraj · **Content lead:** Viraj's wife (A/L Physics teacher) · **Docs started:** 2026-11-02

## How these docs work

There are three layers, modelled on ADRs:

| Layer | Folder | Holds | How it changes |
|---|---|---|---|
| Living docs | [`living/`](living/) | Current truth: strategy, pricing, GTM, product, tech, roadmap | Edited freely. Always reflects *now*. |
| Decision records | [`decisions/`](decisions/) | *Why* we chose X over Y, at a point in time | Append-only. Never edited; a new record supersedes the old one. |
| Assumptions & experiments | [`experiments/`](experiments/) | What we believe but haven't proven, and the test for it | Each assumption moves untested → validated / invalidated, with data. |

In short: living docs say what we're doing, decision records say why, and experiments say how we know. Living docs link to the decisions behind them.

Other folders:
- [`meetings/`](meetings/): raw notes from teacher calls, user interviews and advisor chats.
- [`templates/`](templates/): copy these to start a new decision, experiment or meeting note.
- [`sources/`](sources/): original material these docs were built from: the business-plan chat with Claude, snapshotted [2026-11-02](sources/2026-11-02-business-plan-chat.md) [2026-11-03](sources/2026-11-03-business-plan-chat.md) and [2026-11-07](sources/2026-11-07-business-plan-chat.md) (each later snapshot is a superset).

### Rules

1. **One decision per record**, written on the day you decide. Five minutes, not an essay.
2. **Never rewrite an accepted record.** To change course, write a new one that says `Supersedes DR-00xx`, then set the old one's status to `Superseded by DR-00yy`. Only the status line of an old record may change.
3. **Record the rejected options.** "Why didn't we just make it free?" will come up later.
4. **Every decision gets revisit triggers**: conditions, set in advance, under which it gets reopened. They protect against both impulse changes and sunk-cost clinging.
5. **Link everything**: living doc → decision → assumption → experiment result.
6. **Stopping is a decision too.** Pausing or killing anything gets a decision record. Nothing quietly drifts. (See [DR-0016](decisions/0016-stop-only-by-decision.md).)
7. **Monthly review** (first weekend of each month): scan [`decisions/index.md`](decisions/index.md) for passed review dates and fired triggers, update the statuses in [`experiments/assumptions.md`](experiments/assumptions.md), and refresh the living docs.

### Statuses

- Decisions: `Proposed` → `Accepted` → (`Superseded by DR-xxxx` | `Deprecated`)
- Experiments: `Planned` → `Running` → `Done`
- Assumptions: `Untested` → `Testing` → `Validated` | `Invalidated`

> Records marked **Proposed** came from Claude's recommendations and haven't been confirmed yet. Read each one; then set it to `Accepted` or rewrite it before the pilot starts.

## Map

**Living docs**
- [Strategy](living/strategy.md): vision, problem, positioning, customers, risks, moats
- [Pricing](living/pricing.md): plans, pilot offer, revenue math
- [Go-to-market](living/go-to-market.md): channels, teacher pitch, message templates, funnel
- [Competitors](living/competitors.md): landscape and white space
- [Product spec](living/product-spec.md): skill graph, L1–L5, step player, Learn mode, retention, parent report, MVP cut
- [Content authoring spec](living/content-authoring.md): item forms, schema, automated checks, error tags (proposed)
- [Open topics](living/open-topics.md): what's still undecided before development (business, product, technical)
- [UX design](living/ux-design.md): "Dawn" design system, language rule, user flow, screen inventory, WhatsApp messages, [design canvas](https://claude.ai/code/artifact/8663e5e8-8080-4e38-a1bc-a487744ad18f)
- [Teacher dashboard](living/teacher-dashboard.md): jobs, principles, screens, pilot scope, build plan (DR-0037 to 0043 accepted)
- [Simulation and admin](living/simulation-and-admin.md): synthetic students as the learning-engine test, personas, `/admin` mission control, "safe to launch the pilot" go/no-go (DR-0044 to 0047 proposed)
- [Tech architecture](living/tech-architecture.md): stack, architecture, costs, AI-code review rules
- [Legal & privacy](living/legal-and-privacy.md): company, IP, PDPA, teacher rules, open legal questions
- [Roadmap](living/roadmap.md): timeline, build order, subject order
- [Founder playbook](living/founder-playbook.md): weekly habits, the anti-abandonment rules, reading list

**Decisions:** [index](decisions/index.md)

**Project tracker:** [pm](../pm/README.md): live status of every task, bug and milestone (`pm/bin/pm serve`, then http://localhost:4477)

**Experiments:** [assumptions](experiments/assumptions.md) · [E01 Founding 100 pilot](experiments/E01-founding-100-pilot.md) · [E02 Teacher channel opt-in survey](experiments/E02-teacher-channel-survey.md)

## One-line positioning

> "5 minutes a day of the right Physics questions, so nothing you learn in class is forgotten before the exam."
