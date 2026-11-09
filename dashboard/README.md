# UniKey teacher dashboard: P0 prototype

Throwaway, fake-data prototype of the teacher dashboard ([plan](../docs/living/teacher-dashboard.md), phase P0, DR-0043). It's for showing Viraj's wife and 1–2 pilot teachers on their phones, from a WhatsApp link, and writing down what they say. There's no backend: it's a static site, and everything a teacher taps (feedback, assignments, teaching now) is kept in their own browser only.

- **Stack:** Next.js 15 (App Router) as a static export, TypeScript, plain CSS with the Dawn tokens ([DR-0025](../docs/decisions/0025-dawn-design-system.md)), and Geist + Noto Sans Sinhala from Google Fonts.
- **Language:** English UI, Sinhala skill names where the skill graph has them ([DR-0024](../docs/decisions/0024-sinhala-medium-ui-language.md)).

## Run it

```bash
cd dashboard
npm install
npm run dev          # http://localhost:3000
```

To build the static site (into `out/`) and serve it:

```bash
npm run build
npm run serve
```

## Tests

```bash
npx playwright install chromium   # first time only
npm run qa                        # build + Vitest unit + Playwright E2E (phone size)
```

Spec, plan and latest results: [qa/qa-spec.md](qa/qa-spec.md), [qa/execution-plan.md](qa/execution-plan.md), [qa/test-report.md](qa/test-report.md).

## Put it on a phone

`out/` is plain files, so any static host works.

- Vercel: `npx vercel deploy out`
- Netlify: drag-and-drop `out/`
- Cloudflare Pages: upload `out/`

Then send the link on WhatsApp. Teachers open it in their phone browser, with no install and no sign-in.

## What's in it

| Screen | Path | Plan ref |
|---|---|---|
| This week (home): root cause chain, misconception, quiet students, fading; each insight with **Useful / Not right?** | `/` | S1 |
| Topics: one bar per topic, worst first; tap for skills + top mistakes | `/topics/` | S2 |
| Skill detail: class bar, mistakes with what to say, needs first / opens up | `/skill/<id with _ for .>/` | (from "Open the skill") |
| Students: quiet first, practice-day bars, sharing level | `/students/` | S3 |
| Student detail: effort; skills only if shared and parent consent is in | `/students/<name>/` | S4 |
| Class setup: code + QR, WhatsApp share, Teaching now, roster | `/class/` | S5 |
| Assign: bottom sheet from any card, topic or skill | (sheet) | S6 |
| Sunday digest as a WhatsApp message | `/digest/` | S8 |
| Sign-in flow (fake OTP: any 6 digits) | `/signin/` | S9 |
| Feedback log + "Send on WhatsApp" | `/feedback/` | prototype only |

**Prototype controls** are at the bottom of Class setup:
- **Preview week 1** shows the empty states, with only 3 students practised.
- **Reset** clears everything stored on the phone.

## The fake class

`lib/data.ts` sets up the class "Grade 13 · 2027 batch", with 24 students and the week of Mon 1 Feb 2027 (pilot week 3). It's seeded, so every phone sees the same class.

| What | Which students or skills |
|---|---|
| Quiet (7+ days) | Kasun, Dilan, Ishara |
| Effort only | 4 students |
| Waiting for parent consent | Nimal |
| Bottleneck | වෘත්ත චලිතයේ ඝර්ෂණ සීමාව, 9 students stuck |
| Root cause | "Which force provides the centripetal force" |
| Misconception | the `centrifugal` error tag ("There's an outward force"), 11 students |
| Teaching now | 2.6 Rotational and circular motion |

Skills, topics and `requires` edges are real, from `content/skills/mechanics/graph.json`. Error-tag wording is real, from `app/assets/content/tags.json`. `npm run skills` regenerates `data/skills.json` from both.

## Known gaps (fine for P0)

- **Sinhala names:** only 18 of 83 skills have Sinhala names in the graph; the rest show in English. Two draft names in `scripts/build-skills.mjs` (බල විභේදනය, කේන්ද්‍රාභිසාරී බලය සපයන බලය) are not checked against the NIE glossary. Topic names are English only.
- **Misconception wording:** the misconception quote and the error-tag messages are English. Tags have no Sinhala yet.
- **Week 1 preview:** it only changes This week, Topics and the header. The student list still shows 24.
- **Feedback stays on the phone:** to collect it, ask teachers to tap "Send on WhatsApp" on the feedback page.
