# Go-to-Market

_Last updated: 2026-11-02_

## Channel sequence ([DR-0002](../decisions/0002-teachers-as-channel.md), [DR-0008](../decisions/0008-pilot-close-circle.md), [DR-0010](../decisions/0010-rollout-waves.md))

```
Pilot: ~100 students, close circle (3–4 teacher friends + wife's students), paid 300, money-back
   │  week 4–6: opt-in survey in the 500-teacher WhatsApp channel (with admin permission)
   ▼
Exit criteria met? ── no ──► extend + fix (don't scale)
   │ yes
   ▼
Waves: 15 → 30 → rest of opted-in teachers (matching content medium first)
   ▼
Mid-size tuition teachers (100–500 students) → big tuition players (with outcome proof)
```

| Phase | Channel | Goal |
|---|---|---|
| Pilot (Jan–Mar 2027) | Close circle | Data, testimonials, outcome proof |
| After pilot | Wife's 500-teacher channel (opt-in only) | Teacher adoption, reviewers, waitlist |
| +3–6 months | Mid-size tuition teachers | First real revenue (affiliate / bundle) |
| +6–12 months | Big tuition players | Scale with outcome data. Pitch results, not an idea. |

The 500-teacher channel is a **one-shot first impression**. Don't spend it on a buggy v1.

## Teachers

**Model: teachers never sell** ([DR-0011](../decisions/0011-teachers-never-sell.md)). Teachers get the tool free. We sell premium to parents directly. At most, the teacher says "there's a premium if you want it."

### Selling points, in order
1. 🥇 **Paper builder + model papers with answers and marking guides.** This is the hook: painful, frequent (every term test), and useful on day one without any students.
2. 🥈 **Teaching materials**: short notes and simulations to show in class (projector/smartboard is the wow moment).
3. 🥉 **Less admin**: name *one* concrete report (e.g. term-test mark analysis). Build only the one the survey shows is most painful.
4. **Class dashboard**: weak-topic heatmap, assign today's deck. A reason to *stay*, not to sign up.
5. ⚠️ **Revenue share: never in the first message.** Mention it only in 1:1 calls, as an opt-in partner program:
   - Paid content reviewer (cleanest; no conflict)
   - Affiliate share only for their *private tuition* students, and only where the rules allow it

**Only promise what exists at rollout.** Broken promises spread fast in that group.

### Teacher pains to talk about
- Students don't revise between classes; the teacher can't see who is falling behind.
- Setting papers and marking MCQs eats weekends.
- Results are their marketing ("my students got 85 A's").
- Students drift to rival teachers.

### Beating skepticism and laziness
| Barrier | Fix |
|---|---|
| Skeptical | Comes from a fellow teacher, not a company. Content is teacher-reviewed. Free, no commitment. |
| Lazy | Value in 2 minutes with no setup (paper builder works on day one). Joining a class is one QR code. |
| "What's in it for me?" | Saves hours before term tests. |
| FOMO | Limited "Founding Teachers" group |

**Founding Teacher perks:** free premium forever, feature requests prioritised, credited as a founding reviewer, first chance at paid reviewer work.

### "They already have their own app"
Don't compete with it. Their app does video, fees and attendance; ours drives daily practice. Later, offer a deep link or embed.

### Government teacher rules ⚠️
MoE circulars restrict government teachers from charging their own school students for extra classes. "Teachers never sell" removes the issue instead of arguing about it. See [legal](legal-and-privacy.md).

### Outreach rules
- **Don't cold-call the 500 numbers.** It feels like spam, hurts the wife's reputation, and raises PDPA concerns. Get admin permission → personal post → opt-in form → call only the people who opt in.
- Funnel estimate: 500 → 10–20% opt in (50–100) → 15-min calls → 10–20 best fits (mix of medium, region, school type).

### Sales process (zero experience needed)
1. List teachers (close circle first).
2. Warm intro through the wife. Teacher-to-teacher trust beats any pitch.
3. 15-minute demo on a phone: the student flow plus the class dashboard.
4. Close with a free trial for one batch.
5. Follow up weekly with that class's data ("your batch did 4,200 reviews, weak in Electromagnetism"). The data closes the deal.

## Parents (the payers)
- Pitch "**weekly progress report on WhatsApp**," not "gamified app."
- No parent app. A weekly WhatsApp summary plus a signed web report link ([DR-0015](../decisions/0015-parents-via-whatsapp.md)).
- Parent orientation (20 min, Zoom or in person) showing the report. Parents who see the dashboard convert.

## Social media: necessary, not sufficient
Social produces free users; teachers and referrals produce paid ones. Hold off on broadcasting until the pilot is running ([DR-0017](../decisions/0017-friend-as-advisor.md)).

| Channel | Role |
|---|---|
| TikTok / Reels / Shorts | Awareness, cheap reach to teens |
| Facebook | Parents: "see your child's progress weekly" |
| WhatsApp groups / channels | Highest-converting channel in SL |
| SEO / AI-SEO | Public topic pages, syllabus map, `llms.txt` (BrainUs gets 41%+ of students via AI-tool recommendations) |

**Content formula** (wife as the face, in Sinhala), 3–5 posts/week for 6 months:
- "MCQ of the day" with a 10-second trap explanation
- "The mistake 80% of students make in this question"
- Unit-wise 60-second concept recaps
- Each ends with: "Practise 20 more like this free → link"

## Funnel (AARRR)
| Stage | Lever |
|---|---|
| Acquisition | Teachers, WhatsApp, social |
| Activation | Diagnostic test → personal plan in 5 minutes |
| Retention | [Product retention levers](product-spec.md#retention-levers) |
| Revenue | Parent report + founding offer |
| Referral | "Invite 3 classmates, get 1 month free"; class leagues need friends |

**Track weekly:** signups, activation rate, D7 retention, paid conversion, referral rate.

## Timing
Sell into exam pressure. **Apr–Jul** (pre-exam crunch) brings the highest motivation and willingness to pay. December holidays are a weak time to start anything. Verify the 2027 A/L dates when they're announced.

---

## Message templates

### Parent message: Founding 100 (translate to Sinhala / Tamil)
> Dear Parent, we're piloting a new A/L Physics revision app, reviewed by [Teacher name], with 100 students. Your child gets a 15-minute daily practice plan, and you get a weekly progress report on WhatsApp showing strong and weak topics. 8 weeks: Rs 300 (refunded if their mock score doesn't improve). Only 100 places. Reply YES to reserve.

### WhatsApp teacher channel: first message (wife's voice; translate to Sinhala; no price, no revenue share)
> Hi everyone 👋
>
> My husband (a software engineer) and I have been building a free A/L Physics tool for teachers, and we're looking for a small group of teachers to try it early.
>
> What you get, free:
> 📝 Paper builder. Create term-test and model papers in minutes, with answers and marking guides. No more hunting for questions.
> 📚 Ready teaching materials. Short notes and interactive simulations you can show in class.
> 📊 Class progress at a glance. See which topics each student is weak in, with one-click reports.
>
> Content is reviewed by physics teachers and aligned to the A/L syllabus.
>
> We're opening it to 20 founding teachers first, who also get a say in what we build next.
>
> Interested? Fill this 1-minute form 👉 [link]
>
> Happy to answer any questions here or personally 🙏

Only list features that exist at the time of posting. Edit the bullets to match.

### Teacher opt-in form (5 questions)
1. Name, school, district
2. Medium (Sinhala / Tamil / English)
3. Classes taught (Grade 12 / 13, roughly how many students)
4. "What's the most time-consuming part of your work before term tests?" (open; Mom Test data)
5. Interested in paid content reviewing? (Yes / Maybe / No)

### TODO
- [ ] 1:1 call script for teachers who fill the form (including how to introduce the partner program)
- [ ] Sinhala parent flyer copy + QR code
- [ ] Monthly waitlist update template
