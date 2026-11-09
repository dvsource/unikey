# Go-to-Market

_Last updated: 2026-11-03_

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

**Model** ([DR-0034](../decisions/0034-teacher-offer-free-tool-plus-affiliate.md), replaces "teachers never sell"): teachers get the dashboard and class insights free, and an affiliate share on students who join with their code. Until the MoE question (L2) is answered, offer the share for private-tuition students only. Teacher tools (paper builder etc.) are prototyped; free vs paid decided later.

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

## Parents (the wallet, not the customer)
At A/L, **the student is the real customer**; parents are at most the wallet and a motivator ([DR-0018](../decisions/0018-student-is-primary-customer.md)). Don't chase parent contacts. Let students bring parents in when it benefits the student.

| Parent segment | Share (guess) | What they get |
|---|---|---|
| Engaged (understands A/L, cares about university) | Minority, highest value | Full weekly report |
| Supportive, not involved (pays, doesn't follow details) | Majority | Payment request + simple monthly update |
| Absent / won't engage | Some | Nothing. The student pays, or the teacher bundles it. |

**Ethical routes to parent contacts** (never scrape, buy or copy numbers from groups):
| Route | How |
|---|---|
| Payment flow (main route) | In-app **"Ask parent to pay"** sends a ready-made Sinhala/Tamil WhatsApp message with a payment link and the student's progress. The parent pays, and we get the contact with consent. |
| Under-18 consent | A one-time WhatsApp confirmation from the parent (covers PDPA) |
| Teachers and classes | The teacher shares our intro and opt-in link in existing parent groups; we never take numbers directly |
| Pilot | Introduced at a class or parent meeting, with a QR code |
| Student invite | The student taps "Add parent" when they choose to share progress |

**Hook for parents who don't understand A/L.** They understand effort ("studied 5 of 7 days"), direction (improving, steady, falling), the dream (university, doctor, engineer), value (less than one tuition class) and authority ("the teacher says…"). Use the university hook, not features: "Physics decides the Z-score for medicine and engineering." The usage-tied money-back guarantee removes risk. Offer easy payment: eZ Cash, mCash, LankaQR, bank transfer.

- No parent app: WhatsApp plus a signed web report link ([DR-0015](../decisions/0015-parents-via-whatsapp.md)). Report design is in [product spec](product-spec.md#parent-report).
- Parent orientation in the pilot (20 min, Zoom or in person) showing the report.

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
> Dear Parent, we're piloting a new A/L Physics revision app, reviewed by [Teacher name], with 100 students. Your child gets a short daily practice plan, and you can get a weekly progress update on WhatsApp if your child shares it. 8 weeks: Rs 300 (refunded if they practise at least 20 days and their mock score doesn't improve). Only 100 places. Reply YES to reserve.

_Updated 2026-11-03: the guarantee is tied to usage ([DR-0021](../decisions/0021-usage-tied-guarantee.md), proposed), and reports are student-controlled ([DR-0018](../decisions/0018-student-is-primary-customer.md))._

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
