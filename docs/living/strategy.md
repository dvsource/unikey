# Strategy

_Last updated: 2026-11-07_

## Vision
Daily, mastery-based revision for Sri Lankan A/L students. It starts with Physics, then covers every A/L subject (and later other exams) on one engine.

## Goal
**1,000 paying students → ~8–8.5 lakh LKR/month gross, ~5–6 lakh/month net.**
This is realistic in 18–30 months *if teachers are the channel*. It's unlikely through ads and the app store alone. See [pricing](pricing.md#revenue-math).

## The problem
- A/L is high-stakes, and families already spend heavily on tuition (bought per subject, monthly).
- Students don't revise between classes. Teachers can't see who is falling behind. Parents can't see anything at all.
- Spaced repetition works, but Anki isn't popular in Sri Lanka: teens don't build the daily habit alone, missing days creates review debt, and plain flashcards don't fit problem-solving subjects ([DR-0004](../decisions/0004-schedule-skills-not-cards.md)).

## Positioning
**The revision and retention layer that plugs into any teacher's class**, not another content platform.

- One line (chosen 2026-11-07 as the lead for the Play Store and teacher pitch; "15" changed to "5" to match the 5-minute day, [DR-0019](../decisions/0019-teen-retention-design.md)): *"5 minutes a day of the right Physics questions, so nothing you learn in class is forgotten before the exam."*
- Marketing message for Bio-stream students and parents (a message, not a separate product path): *"Physics is the subject that decides medicine. 15 minutes a day to stop it pulling your Z-score down."* ([DR-0028](../decisions/0028-any-physics-student-adaptive.md))
- Our price anchor is **tuition, not other apps**. The pitch is "measurably better marks," not "nicer Anki."
- Teacher-neutral: star-teacher platforms structurally can't be this, because rival teachers won't send students to them.

## Customers: three roles, never mix messages
At A/L the **student decides**; parent involvement is optional and student-controlled ([DR-0018](../decisions/0018-student-is-primary-customer.md)). The core segment is the **motivated-but-struggling** student, not the uninterested one.


| Role | Who | What they care about |
|---|---|---|
| User **and primary customer** | Student | Easy, not boring, a feeling of progress, autonomy |
| Payer (wallet, optional motivator) | Parent | Effort, direction, the university dream, value for money |
| Channel | Teacher | Class results, less work, (optional) extra income |

**Audience:** any A/L physics student, Bio or Physical Science ([DR-0028](../decisions/0028-any-physics-student-adaptive.md)). One path that adapts to each student: current knowledge, skill level, learning speed and how often they practise. Track the streams separately in the pilot ([A8](../experiments/assumptions.md)) to tune messaging.

## Market size
- 2025 A/L: 340,525 candidates (246,521 school + 94,004 private).
- Physics is taken by both the Bio and Physical Science streams: roughly 60–90k physics candidates a year, plus Grade 12s and repeaters.
- 1,000 payers ≈ 1–2% of one cohort. Market size isn't the constraint; **conversion and churn are**.
- The syllabus has a good shelf life: the new A/L syllabus is slated for 2031, which gives content ~4–5 years. Watch for exam calendar shifts (the 2026 A/L moved to August).

## Our edge
- An engineer plus a practising A/L Physics teacher in the same house, so we can iterate fast with real classes.
- A teacher network (the wife's close circle, then a 500-teacher WhatsApp channel).

## Biggest risks
| Risk | Mitigation |
|---|---|
| **Distribution**: ads and the app store are slow and expensive | Teachers as the channel ([DR-0002](../decisions/0002-teachers-as-channel.md)) |
| **Daily-use retention**: the habit problem that keeps Anki unpopular | Teacher assignments, parent reports, capped daily load ([product spec](product-spec.md#retention-levers)) |
| **Sinhala/Tamil content accuracy**: one wrong term destroys teacher trust | A glossary-enforced pipeline, one medium first, paid reviewers ([DR-0006](../decisions/0006-mvp-feature-cut.md)) |
| **Seasonal churn**: Grade 13 leaves the week after the exam | Annual / exam-year plans ([pricing](pricing.md)) |
| **Scope creep**: simulations, games and music each become a separate project | MVP cut ([DR-0006](../decisions/0006-mvp-feature-cut.md)) |
| **Founder drift**: abandoning once the fun part is done | [Founder playbook](founder-playbook.md), [DR-0016](../decisions/0016-stop-only-by-decision.md) |

## Moats (build deliberately, in priority order)
1. **Distribution**: teacher relationships, annual agreements, possibly exclusivity with the top 3–5 teachers later.
2. **Data**: step-level attempts → calibrated difficulty and misconception data. Copiers start at zero.
3. **Outcome proof**: published pilot results with real numbers.
4. **Switching costs**: mastery history, class setups, parent report history.
5. **Content depth**: best-in-class in Physics before going wide.
6. **Speed**: ship weekly and talk to users weekly. Big players move quarterly.

If a big player copies us and goes free: don't compete on price. Compete on quality, teacher neutrality and parent reporting, or license the engine and content to them. Acquisition is a valid exit.

Don't overcorrect with secrecy. Share the idea freely; protect the code, the content bank and the data.
