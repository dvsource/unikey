Title: Claude
URL: https://claude.ai/share/bc695477-94b5-41b0-9bca-6f80f03c7093
Source element: <div>
---
Claude

Shared by Viraj. This is a copy of a chat between Claude and Viraj. Content may include unverified or unsafe content that does not represent the views of Anthropic. Shared snapshot may contain attachments and data not displayed here.
Report
You said: as an idea?

as an idea? what do you think about building a mobile app for AL students to study and practice for there AL exams. mainly anki style notes.

the contents will be created and reviewed by ai. based on syllabus, teacher guide, and past 10 years past papers.
students can choose, language (medium - sinhala, english, tamil), subjects (physics, chemistry, biology, ...), and topics under each subject.
my wife is a physics teacher, so i am thinking to release the app in physics first. and let her manually review the content.
why not just use anki? - i am planning to enhance the user experience of the app. and how we review. specially i am thinking add more features. like time block, gamification, leader-board, paper builders (download), mini games / simulations (for some questions). (interactive) animations, some (optional) background music. motivational quotes, also reporting and self review, and more.
also teachers and parents can manage and see there students progress. assign stuff and more.
how students study is purely anki bases notes and questions (and it's the crown jewel). there no new to it. except few tweaks to review options. also anki is not popular in sri lanka atm - how effective it is.
first i am planning to give the product for 100 students. and play with the data, and optimize specially reporting & self review part.
then have a free version and paid version (900 / month, 800/ month if refferal or bulk subscription)
i am also planning to give rewards for students who are with more than year - based on there progress.
and have many more ideas. - i want you do a reallity check on this business idea.
my goal is to get at least 1000 students into this subscription so i'll have at least 800,000 LKR in sales. in profit like 5 - 6 laks per month. that's more than okay.
if things go best. i am planning to expand the app to all the other subject and exams too.
Message collapsed
Show more
2 days ago

Claude responded: Verdict: viable as a niche business, and 1,000 paid users is a realistic target.
Searched the web

Searched the web

Verdict: viable as a niche business, and 1,000 paid users is a realistic target. The features won't decide whether you get there. Distribution, habit retention, and content quality in all three mediums will. As written, the plan over-invests in features and under-invests in go-to-market.

1. Market size: not the problem
The 2025 A/L had 340,525 candidates, including 246,521 school candidates and 94,004 private candidates. 
adaderana

Physics is taken in both the Bio and Physical Science streams. Rough estimate: 60–90k physics candidates per year, plus a Grade 12 cohort behind them and repeaters.
1,000 paid users is about 1–2% of a single cohort. The total market is large enough. Your real constraints are conversion and churn.
Syllabus shelf-life is good. The new A/L syllabus is slated for 2031, so content you build now has roughly 4–5 years of life before a rewrite. Calendar volatility is still a risk: the 2026 A/L was scheduled to start on 10 August, which differs from the traditional Nov/Dec slot. 
sundayobserver

themorning

2. Revenue math: the realistic version
Item	Estimate
Gross (1,000 × ~850 avg)	850k LKR
App store fee (15% small-business tier) or gateway (~3%)	−25k to −130k
Infra + AI (content pre-generated, so inference is cheap)	−30–60k
Content review and support labour (paid or not, it's real)	−50–100k
Marketing / CAC	−0 to −200k (depends on channel, see §4)
Net	~4–6.5 lakh, but only if CAC ≈ 0

Two things the 5–6 lakh target hides:

Freemium funnel. Typical free-to-paid conversion is 2–5%. Getting 1,000 payers means 20–50k active free users. That is the real goal.
Seasonal churn. Grade 13 students churn the week after the exam, so a typical subscriber's lifetime is 6–18 months. Push annual or "until exam" plans, such as a one-off 6,000–7,000 for the whole year, to lock in revenue before the August cliff.
3. Competition and pricing anchors
Past papers are free and abundant. Sites already offer every A/L and O/L paper from 2000 to 2025 in all three mediums, free and with no registration. A past-paper bank is not a product. 
epapers

Existing apps are cheap. Examiner charges $5.99/year for premium. ExamHub already pitches gamified past-paper practice for O/L and A/L. Nenasa (Dialog) is in the space too. 
similarweb

mwm

AI-generated A/L notes are already being built. At least one other team is developing an AI platform for A/L science with syllabus-aligned AI short notes. 
linkedin

Your price anchor is tuition, not other apps. At 900/month you're cheaper than one tuition class, but expensive next to a 2,000 LKR/year app. Your pitch has to be "measurably better marks," not "nicer Anki." Reporting and self-review is exactly where you can prove that.
4. The #1 risk: distribution

A/L is tuition-driven, and star tuition teachers are the gatekeepers to thousands of students. Ads plus organic Play Store discovery will be slow and expensive.

Make teachers the channel (B2B2C):

Give tuition teachers a free, teacher-branded workspace: assign decks, see class weak spots, run paper builders.
Charge per seat in bulk, so one teacher with 400 students gives you 400 seats.
Your wife's network and her own classes are the first channel. The teacher and parent dashboard you listed as a side feature is actually your growth engine. Build it in v1.
5. Product reality checks

a) Plain Anki doesn't fit A/L Physics well. Physics marks come mostly from problem-solving (MCQ, structured, and essay papers), not recall. Flashcards cover definitions, formulas, units, conceptual traps, and graph shapes, maybe 30–40% of what matters. To make spaced repetition the crown jewel for physics:

Schedule question items, not just cards: problems tagged by concept and by error type (unit error, sign error, wrong model).
Resurface variants of failed problems with new numbers and the same concept, so students can't memorise the answer.
Use per-concept mastery as the scheduling unit. That also gives your reporting something meaningful to show.

b) The habit problem is why Anki isn't popular. Spaced repetition only works with daily use, and teens don't build that habit alone. Streaks help a bit. Teacher-assigned daily reviews and parent visibility are the stronger forcing functions. This is your real differentiation; music and quotes are not.

c) AI content in Sinhala and Tamil is the quality risk. LLMs are noticeably weaker in Sinhala and Tamil technical language, and the terminology must match the NIE textbook glossary exactly. A single wrong term destroys teacher trust.

Build a fixed term glossary per medium and run a translate-from-English pipeline that enforces it, rather than generating freely in each language.
Your wife can probably review one medium properly. Physics at roughly 3–5k cards plus 1.5–2k questions is 80–150 hours of review per medium. Launch in one medium and add the others with paid reviewers.

d) Past paper copyright. DoE papers are widely redistributed, but commercial use in a paid product is a grey area. Get a lawyer's view. A safer default is AI-generated variants "in the style of" past papers, with the originals linked rather than embedded.

e) Scope creep is the silent killer. Simulations, mini-games, and interactive animations are each a separate project. For a 100-student pilot:

v1: spaced-repetition cards and questions, timed MCQ papers, weak-topic report, teacher dashboard.
v2: gamification, leaderboards, paper builder PDFs.
v3+: simulations and animations, only for the topics where the data shows students repeatedly fail, such as circular motion or electromagnetic induction.

f) Payments. Many students have no card, and parents pay. You'll need PayHere or bank transfer and possibly carrier billing. Carrier billing reaches the most students but takes a large cut.

6. Making the 100-student pilot actually informative
Charge something, even 300 LKR. Free pilots tell you nothing about willingness to pay.
Avoid selection bias. Your wife's own students will over-engage because their teacher is watching. Include students from at least one or two other teachers.
Kill or continue metrics:
D30 retention above 40%
At least 4 study days per week
Students converting at the full price after the pilot
Score delta on two mock MCQ papers (weeks 0 and 8) compared with a non-user group. This last number is your whole marketing story.
7. Smaller notes
Loyalty rewards: fine, but tie them to measurable progress or referrals, not tenure. Tenure ends at the exam anyway.
Leaderboards: default to class- or friend-scoped boards, not national ones. A/L pressure is already intense, and a national board demotivates the 90% who aren't at the top.
Expansion order: Chemistry, then Biology (the most recall-heavy, so the best spaced-repetition fit), then Combined Maths (problem-heavy, same caveat as physics). The O/L science market is bigger, but willingness to pay there is lower.
Bottom line
	Assessment
Problem / need	✅ Real. A/L is high-stakes and families already spend on tuition.
Your edge	✅ Strong: an engineer plus a physics teacher, and a teacher network.
Differentiation	⚠️ Needs to be outcomes and teacher tooling, not features.
Biggest risks	Distribution, daily-use retention, Sinhala/Tamil content accuracy, seasonal churn.
1,000 paid / 5–6 lakh	Achievable in 18–30 months if teachers are the channel; unlikely through ads and the app store alone.

A useful next step would be a one-page pilot plan: the v1 feature cut, metrics, cohort design, and a simple data model for concept-level spaced repetition.


2 days ago
You said: how to market the app with tuition teachers.

how to market the app with tuition teachers. they are already charging from students. and sometimes they already have their own apps? i am also afraid they might steel the idea

and i forgot to mentioned before my plan is to get the more marketting done with sociel media marketing. but you it's not enough??
App store fee (15% small-business tier) or gateway (~3%) - also what is this gateway vs small-business. i am not familier?
what do you think is to best retention ideas. i was thinking to use gamification, interactive notes, mini-games as in some problems... what are your recommendations? - i am on a wrong path
also how do i charge 300 lkr from my test group? tell me how to market that.
my marketing & sales knowledge is 0. help me on that
and who are my competiters? do more research on this through internet. find out any sort/shape of competiters for me? (like: that ai al notes thing)
Message collapsed
Show more
2 days ago

Claude responded: I'll research the competitive landscape and payment details first, then answer each point.

I'll research the competitive landscape and payment details first, then answer each point.

Searched the web

Searched the web

The short answers: tuition teachers should be your channel, not your competitor, and social media alone is not enough. Your retention plan is about 50% right, but it puts the effort in the wrong order. The details are below.

1. Competitors (research results)

Sri Lankan A/L edtech is more crowded than it looks. It falls into five groups.

A. AI tutors and AI-notes apps (the closest to your idea)
Player	What it is	Threat
BrainUs LK	AI tutor built on SL textbooks, syllabuses and past papers. Close to 2,000 students through word of mouth, plus a free tier. It is preparing to pilot BrainUs Learn, a gamified platform built around the SL curriculum.	🔴 High. Same timing and the same gamification angle.
Apilage AI	AI-generated short notes aligned to the A/L syllabus (the "AI notes thing" you mentioned). Aims to build the strongest student AI ecosystem in South Asia.	🟠 Medium
GradiBee	AI tutors with syllabus-grounded lessons, papers and progress tracking in English, Sinhala and Tamil for grades 5–13, with a parent-guidance layer.	🟠 Medium. Has a parent angle like yours.
SriAI	Claude-based chat aimed at the NIE syllabus and past papers, paid by local bank transfer in LKR.	🟡 Low. Generic chat, no study system.
Nenasa AI (government)	Free AI assistant on e-thaksalawa in Sinhala, Tamil and English.	🟡 Low quality, but free and official.
B. Teacher-led platforms (the most important group)
Player	Notes
AP.LK / LearniX AI	An A/L Physics platform blending traditional teaching with technology. Claims to be the first AI-based LMS, with 70,000+ students. 🔴 Your most direct physics competitor. Study it closely.
DM Education	A/L Biology, claims 100,000+ students. Shows how a single teacher's brand can scale.
EDUS	Online tuition plus an app, founded 2021, 7,000+ students.
A/L Kuppiya (SLT-Mobitel)	Video-on-demand, live classes and a store. Backed by a telco.
Charith Sir app	An example of a teacher with their own app (A/L ICT).
C. White-label tools for tutors (why teachers "already have apps")
Edumix gives each institute its own branded LMS and dedicated mobile app.
Others in this group: LimeCodeLabs, Tuto.
These apps do video, live classes, fee collection and attendance. They are not spaced-repetition or mastery engines. That gap is your opening.
D. Past paper and quiz apps
QuizUp Sri Lanka reportedly reached #1 in Education on both stores within 24 hours. That's evidence of demand for gamified quizzes.
Also: ExamHub, Examiner, AlevelApi, Nova Learn, epapers.lk (free).
E. Global and free
ChatGPT, Gemini, Anki, Quizlet, YouTube.
One interesting finding: 41%+ of BrainUs students surveyed found it through AI tools like ChatGPT recommending it. More on that in §3.
Where the white space is

Nobody in this list is doing spaced-repetition, mastery-based daily practice that is teacher-neutral and comes with class analytics. Everyone else does content delivery (videos, LMS) or Q&A chat.

Position yourself as the revision and retention layer that plugs into any teacher's class. Don't position as another content platform.

2. Selling to tuition teachers
Their pains (what to talk about)
Students don't revise between classes, and the teacher can't see who is falling behind.
Setting papers and marking MCQs eats their weekends.
Results are their marketing. "My students got 85 A's" is how they recruit next year's batch.
Students drift to rival teachers.
Your offer: you make them money, not cost them money
Model	How it works	Best for
Affiliate (start here)	Teacher gets a code. Students get 100 LKR off, and the teacher earns 20–25% of every subscription, recurring.	Teachers who don't want to change their fee
Bundle	Teacher adds about 300 LKR to the class fee and pays you bulk (e.g., 500/student). Students see "premium included".	Big batches (200+)
Teacher-branded	"Mr X's Physics Revision", powered by you, with their logo on the class dashboard.	Star teachers who care about brand

The teacher gets the dashboard free: weak-topic heatmap for the class, assign today's deck, an auto-generated weekly paper, and parent reports. A free tool plus recurring income is an easy yes.

"They already have their own app"

Don't compete with it. Their app holds videos and fees; yours drives daily practice. Later, offer a deep link or embed so their app can open your practice module.

"They might steal the idea"
The idea is not the asset. To copy you, a teacher needs a spaced-repetition engine, a three-medium reviewed content bank, analytics, and product iteration. That is 12+ months of engineering they won't do.
The real copy risk is the white-label agencies (Edumix and similar) and AP.LK adding flashcards. You beat them on speed, content depth and data, not secrecy.
Practical protections:
Keep content and student data on your platform; teachers get dashboards, not exports.
Use simple written agreements (revenue share, content IP stays with you).
Don't share your internal analytics logic.
An NDA with a tuition teacher is pointless and makes you look amateur. Skip it.
Sales process (zero experience needed)
List 30 physics teachers. Start with your wife's network, then teachers with 100–500 students. Mega-teachers with 5,000+ students come later.
Warm intros through your wife. Teacher-to-teacher trust beats any pitch.
A 15-minute demo on your phone showing the student flow and the class dashboard.
Close with a free trial for one batch for six weeks, plus revenue share after.
Follow up weekly with that class's data ("your batch did 4,200 reviews, weak in Electromagnetism"). The data is what closes the deal.

The target is 5 teachers × 200 students = 1,000 users.

3. Social media: necessary, not sufficient
Channel	Role	Verdict
TikTok, Reels, YouTube Shorts	Awareness, cheap reach to teens	✅ Do it, but it won't convert to paid alone
Facebook	Parents (who are the payers)	✅ Ads aimed at parents: "see your child's progress weekly"
WhatsApp groups and channels	A/L study groups, tuition class groups	✅ The highest-converting channel in SL
Teacher channel	Trust plus distribution	✅✅ The main engine
SEO / "AI SEO"	Free inbound	✅ Cheap. Publish public topic pages, a syllabus map, and an llms.txt so ChatGPT recommends you (BrainUs proved this works).

Content formula (your wife as the face, in Sinhala):

"MCQ of the day" with a 10-second trap explanation
"The mistake 80% of students make in this question"
Unit-wise 60-second concept recaps
Each post ends with: "Practise 20 more like this free → link"

Post 3–5 times a week, consistently, for six months.

Why social alone fails: it builds awareness, but A/L students buy on trust (a teacher or friend recommends it). Social produces free users; teachers and referrals produce paid ones.

4. Payment gateway vs app store fee

There are two different ways to collect money.

① App store billing (Google Play Billing or Apple in-app purchase). The student pays inside the app and Google or Apple handles it.

Fee: 15% on subscriptions. Apple applies 15% to small developers in its Small Business Program; Google applies 15% to subscriptions.
Pros: one tap, auto-renew, and students without cards may be able to pay through carrier billing or Play gift cards.
Cons: higher fee, and Google's policy generally requires Play Billing for digital content bought inside the app. You can't put a "pay on our website" button in the app. Check the current Play payments policy for Sri Lanka.

② Payment gateway (e.g., PayHere). You take payment on your own website or payment link, then activate the account.

One older fee structure was Rs 30 + 3.3% per transaction. A newer listing shows 3.4% + LKR 50 for local cards. Confirm current rates with PayHere.
Supports LankaQR, Frimi, Genie, mCash, eZ Cash, cards and bank transfer.
The trap: a fixed fee of about 50 LKR on a 900 LKR payment adds roughly 5.5%, so monthly payments are expensive. Annual or exam-year plans dilute it.

Recommended setup:

Teacher bulk and affiliate sales: gateway or bank transfer on your website, then activation codes. The app is login-only.
Individual in-app purchases: Play Billing at 15%. Accept it as the cost of conversion.
Pilot: manual bank transfer or eZ Cash plus activation codes. Don't build billing yet.
5. Retention: what to change

Gamification isn't wrong. Mini-games and interactive notes are the wrong first investment. They cost a lot of content work, the novelty fades in about two weeks, and they don't create a daily habit. Build in this order, highest retention return first:

#	Lever	What to build
1	A visible goal and progress	An "Exam readiness score" or predicted grade per unit, plus a countdown to the exam. Students come back to watch the number move.
2	Social accountability	Teacher assigns today's deck, class sees completion, parent gets a weekly WhatsApp report. The strongest lever by far.
3	Kill review debt	This is the reason people quit Anki: miss three days and face 400 due cards. Cap daily load (15–20 minutes), offer a catch-up mode that spreads the backlog over days, and use FSRS scheduling.
4	Habit mechanics	Streak with "freeze" tokens, a reminder at the student's chosen study time, and a two-second open-to-first-card time with offline support.
5	Light gamification	XP, weekly class-scoped leagues (Duolingo-style), badges for mastery rather than time spent.
6	Immediate payoff	After a session, show "You fixed 3 weak concepts. Electrostatics readiness +4%."
7	Novelty (last)	Simulations and animations only for the five concepts the data shows students fail most.

Background music and quotes are nice-to-have polish with near-zero retention effect. Leave them for later.

Retention metrics to watch weekly:

D1, D7 and D30 retention
Percentage of students who finish the daily queue
Average study days per week (target 4 or more)
Streak-break rate
6. Charging 300 LKR to the pilot group
The offer: "Founding 100"
300 LKR for an 8-week pilot (anchor it as "normally 1,800").
Founding members lock in 600/month for life (versus 900).
A money-back guarantee: if their mock MCQ score doesn't improve, they get the 300 back. This removes the risk and gives you clean outcome data.
Name on a "founding students" wall and early access to new features.
Scarcity: "only 100 places". This is true, so it's honest.
Who pays and how
Parents pay. Pitch to parents with "weekly progress report on WhatsApp", not to students with "gamified app".
Payment by bank transfer, eZ Cash or a LankaQR or PayHere link. You then send an activation code.
App distribution: Play closed testing. New personal developer accounts must run a closed test with a minimum number of testers before going public, and the pilot conveniently satisfies that. Check the current requirement.
How to recruit them
Your wife's classes, about 40–50 students. Five minutes at the end of class, plus a printed QR code flyer.
Two other teachers' batches, about 50 students. Offer the teacher free use and a revenue share later. This also fixes the selection bias from the last plan.
A parent WhatsApp message (template below).
A parent orientation: a 20-minute Zoom or in-person session showing the parent report. Parents who see the dashboard convert.

Parent message (translate to Sinhala or Tamil):

Dear Parent, we're piloting a new A/L Physics revision app, reviewed by [Teacher name], with 100 students. Your child gets a 15-minute daily practice plan, and you get a weekly progress report on WhatsApp showing strong and weak topics. 8 weeks: Rs 300 (refunded if their mock score doesn't improve). Only 100 places. Reply YES to reserve.

7. Marketing and sales 101 (from zero)

Know your three customers:

Role	Who	What they care about
User	Student	Easy, not boring, a feeling of progress
Payer	Parent	Results, visibility, value for money
Influencer / channel	Teacher	Class results, less work, extra income

Every message must speak to one of these. Don't mix them.

One-line positioning: "15 minutes a day of the right Physics questions, so nothing you learn in class is forgotten before the exam."

The funnel (AARRR):

Stage	Question	Your lever
Acquisition	How do they find you?	Teachers, WhatsApp, social media
Activation	Do they get value in the first session?	Diagnostic test leading to a personal plan in 5 minutes
Retention	Do they come back?	§5
Revenue	Do they pay?	Parent report plus founding offer
Referral	Do they bring friends?	"Invite 3 classmates, get 1 month free"; class leagues need friends

Weekly habit:

Post content 3–5 times a week.
Talk to 5 users or parents each week.
Run one experiment a week (a pricing page, a message, a feature).
Track 5 numbers: signups, activation rate, D7 retention, paid conversion, referral rate.

Books, cheapest high-impact first:

The Mom Test: how to talk to users without fooling yourself.
Traction: choosing a channel.
$100M Offers: structuring offers like "Founding 100".
Revised priorities
Weeks 1–8: v1 core (spaced repetition, MCQ, readiness score, teacher dashboard, parent report). Recruit the Founding 100 from three teachers' batches.
During the pilot: start social content with your wife; begin sales conversations with 30 teachers.
After the pilot: affiliate program with 5 teachers, public launch, annual plans.
Watch closely: AP.LK and BrainUs's gamified launch.

I can also draft the teacher pitch deck, the Sinhala parent flyer copy, or the readiness-score model for the scheduling engine.


2 days ago
You said: i like the sound of "money-back guarantee", "parent WhatsApp message" - good good.

i like the sound of "money-back guarantee", "parent WhatsApp message" - good good.
you mentioned before the physics is not fully suitable for the anki algorithm. how do fit it into the app. what features should i introduce to the app that will support in problem solving subject. (this issue will become huge when we get to the combined mathematics). also some students do not like to go direct into the question. they like to learn some theory. i am planning to place some short notes and (interactive) animations (as you said interactive animations in questions can be expensive but i think i can put them in notes).

yesterday

Claude responded: The fix is to schedule skills, not cards, and to break problem-solving into pieces small enough to retrieve.

The fix is to schedule skills, not cards, and to break problem-solving into pieces small enough to retrieve. Anki-style spaced repetition still runs underneath, but it operates on a skill graph rather than a flat deck.

1. Why plain Anki breaks on physics and Combined Maths
Anki assumption	Reality for problem subjects
A card has one fixed answer you can memorise	The answer to a problem can be memorised, but solving can't be. A repeated card tests memory of the answer, not skill.
Self-grading (Again / Hard / Good / Easy)	Students can't judge their own problem-solving accurately. Grading needs to be automatic.
Cards are independent	Skills have prerequisites. Failing circular motion may really mean failing resolving forces.
Reviewing means seeing the same item again	Reviewing a skill should mean a new instance of it.
2. Core model: a skill graph

Unit (Mechanics)
 └─ Concept (Circular motion)
     └─ Skill / KC (find tension at top of vertical circle)
         ├─ prerequisites: [resolve forces, centripetal force eqn, energy conservation]
         └─ Problem families (templates)
              └─ Variants (generated instances: different numbers/context)
KC (knowledge component) is the unit that gets scheduled and mastered. Plan for roughly 150–300 per subject.
Every item is tagged with one or more KCs plus a difficulty level.
Mastery is stored per student per KC. That is what drives the readiness score, teacher heatmaps and the scheduler.
3. Five layers of practice items

Each layer feeds the next. Spaced repetition applies to all of them, but scheduling and grading differ by layer.

Layer	Item type	Example	Time	Scheduling
L1 Recall	Definitions, formulas, units, dimensions, constants	"Dimensions of Young's modulus?"	5–10 s	Classic FSRS per card
L2 Concept check	Misconception traps, graph shapes, "what if" questions	"Speed doubles. What happens to the radius in a magnetic field?"	15–30 s	FSRS per card, auto-graded
L3 Method recognition ⭐	"Which principle or approach?" Don't solve, just choose.	"Block slides down a curved frictionless track. Find speed at bottom → energy / momentum / kinematics?"	10–20 s	Per KC, interleaved
L4 Step problems	Multi-step problem solved one step at a time	Vertical circle tension, 4 steps	2–5 min	Per KC mastery, new variant each time
L5 Exam sets	Mixed timed MCQ or structured questions from past-paper style	10 MCQs in 12 minutes	10–30 min	Weekly, generated from weak KCs

L3 is the key bridge. The main reason A/L students fail problems is choosing the wrong approach, not bad algebra. Method-recognition cards are fast, so you can do 20 a day. They interleave well and they work naturally with spaced repetition. This carries straight over to Combined Maths: which integration technique, which proof method, which substitution.

4. Problem families with generated variants

This is the feature that makes spaced repetition work for problems.

A template has a context, variables with valid ranges and constraints, a solution function, and step definitions.
A variant is generated at runtime from that template: new numbers, sometimes a new context (car on a banked road vs a bucket swung in a circle).
Verify the maths with a computer algebra system, not the LLM. Use SymPy (or your own solver functions) to compute answers and step values, so you never ship a variant with an AI arithmetic mistake.
Generate distractors from known misconceptions:
Forgot to add weight at the top of the circle
Used diameter instead of radius
Wrong sign convention
Each wrong option maps to an error tag, so a wrong MCQ answer still tells you why the student was wrong.

There is a large content-review win here. Your wife reviews one template, not 200 questions. Review effort drops by an order of magnitude, which solves the bottleneck from the first discussion.

5. The step player for L4 problems

The main new interaction for problem-solving subjects:


Problem: Stone (m=0.2kg) whirled in vertical circle r=0.8m, speed at top 4 m/s. Tension at top?

Step 1 — Draw/choose forces at top        [select: T↓, mg↓]  ✅
Step 2 — Choose equation                   [T + mg = mv²/r]   ✅
Step 3 — Compute mv²/r                     [ 4.0 ] N          ✅
Step 4 — Final answer                      [ 2.0 ] N  unit[N] ✅
Feature	Detail
Step input types	Pick an option, numeric with tolerance and significant figures, unit picker, equation picker, drag a force arrow onto a diagram, order the steps
Hint ladder	Nudge → name the principle → show that step worked out. Each level used reduces the mastery credit.
Auto-grading	Grade from correctness, hints used and time taken. No self-rating buttons.
Error tagging	Unit error, sign error, wrong formula, arithmetic error, wrong principle
Mistake notebook	Every failed step is saved automatically. Shows patterns like "40% of your errors are units", with a "redo similar" button.
Freeform mode (later)	Student solves on paper and enters only the final answer. If wrong, the app expands into step mode to find where it went wrong. This is the best of both.
6. Scheduling: two engines

Daily queue builder
 ├─ Recall engine: FSRS on L1/L2 cards
 └─ Skill engine: mastery per KC (Elo/IRT-style or BKT)
       → pick KC due/weak → pick unseen variant at right difficulty
       → result updates KC mastery + prerequisite KCs

Mastery update: use an Elo or IRT-style model per KC, and estimate item difficulty from all students' attempts. This is cheap and well-proven at scale, and your 100-student pilot data calibrates it.

Prerequisite propagation: repeated failure on a KC lowers confidence in its prerequisites and schedules a quick check on them. If the prerequisite is weak, the student gets remediation on it, not more of the hard skill.

Learning sequence for each new KC (worked example → faded → independent):

Worked example: fully solved, with a self-explanation prompt ("why is weight added here?").
Faded example: the last one or two steps are blank.
Independent variant, step by step.
Independent variant, final answer only.

Strong students skip the stages they don't need. Full scaffolding actually slows experts down (the expertise reversal effect), so a quick diagnostic decides the entry point.

Daily session mix (capped at about 20 minutes, interleaved rather than blocked by topic):

35% L1/L2 recall
25% L3 method recognition
40% L4 problems

Plus an L5 timed set once a week.

7. Notes and animations: the "Learn" mode

Your instinct is right. Students who want theory first should get it, as long as reading stays active rather than passive.

Flow for each concept:


Learn (micro-note 1–3 min) → 2–3 check questions immediately → unlock Practice
            ↑                                       │
            └──── "Review note" link on every wrong answer ◄┘
Feature	Detail
Micro-notes	One concept per screen: key idea, formula with variables explained, one diagram, one common trap. No long chapters.
Embedded retrieval	Every 1–2 screens, a quick question. This is what makes notes stick instead of being re-read and forgotten.
Two entry paths	"Learn first" for theory-first students, or "Test me first": a diagnostic that skips notes for concepts the student already knows. Let students choose; the default comes from diagnostic results.
Notes ↔ questions linking	Every item links back to its concept note, so a wrong answer leads to the exact 60-second explanation.
Formula sheets	Auto-built from the student's mastered and weak concepts.

Interactive animations, done cheaply:

Build reusable parametric simulation components, not one-off animations. Roughly 10–15 engines cover most of A/L physics:
Projectile
Circular motion
SHM / pendulum
Waves and interference
Ray optics
DC circuits
Electric and magnetic fields
Gas laws
Thermal
Graphs (s-t, v-t)
Each engine has sliders such as mass, angle and speed. One engine serves 20+ notes through configuration (JSON).
Predict → reveal: "Predict where the ball lands if the angle increases. Now drag the slider." Prediction prompts make simulations noticeably more effective than passive watching.
Reuse in questions later: once an engine exists, "predict then check" questions become nearly free. The cost concern I raised earlier applies to bespoke animations per question, not reusable engines.
Tech options:
Canvas or p5.js inside a WebView: fastest to build, and your web skills transfer directly.
React Native Skia or Flutter CustomPainter: native performance.
Rive or Lottie: for non-interactive explanatory animations.
Keep everything offline-capable.
8. Combined Maths extensions
Need	Feature
Algebraic answers	Math input keyboard (MathLive) plus CAS equivalence checking, so 2(x+1) and 2x+2 both pass
Proofs and derivations	Parsons problems (drag proof lines into the correct order, with distractor lines), then gap-fill steps
Technique choice	L3 cards: integration by parts vs substitution vs partial fractions
Long structured questions	Step player with intermediate answers checked by CAS
Graph sketching	Choose the correct sketch, or mark intercepts and asymptotes on a canvas
Applied maths (mechanics)	Shares KCs and simulation engines with physics
9. Data model sketch

Concept(id, unit, prereqs[])
KC(id, concept_id, prereqs[])
Note(id, concept_id, blocks[], sim_refs[])
Template(id, kc_ids[], layer, difficulty, vars, constraints, solver_ref, steps[], misconception_map)
Variant(id, template_id, seed, values, answer)        // generated, cacheable
Card(id, kc_ids[], layer: L1|L2|L3, content)          // static recall items
Attempt(id, student_id, item_ref, steps[{input, correct, hints, ms, error_tag}])
KCMastery(student_id, kc_id, theta, last_seen, next_due)
CardState(student_id, card_id, fsrs_params)

Store attempts at step level from day one. That data powers the error notebook, teacher heatmaps, difficulty calibration and the "reporting & self review" part you wanted to optimise.

10. MVP cut for the physics pilot
Build now	Later
KC graph for 2–3 units (e.g., Mechanics, Electricity)	All units
L1/L2 cards with FSRS	—
L3 method-recognition cards	—
L4 templates (~30–50) with MCQ-only answers plus misconception distractors	Full step player, diagram inputs
Micro-notes with embedded checks for those units	Notes for all units
3 simulation engines (projectile, circular motion, circuits)	10–15 engines
Mistake notebook plus error tags	Freeform-then-expand mode
Elo-style KC mastery and readiness score	BKT/IRT refinement once the data exists

Content pipeline:

The LLM drafts templates, steps, misconception maps and notes.
SymPy verifies every template's solution across sampled variants.
Your wife reviews the template and the misconception map once.
The template is published, and variants generate automatically.

I can go deeper on any piece next: a template JSON schema, the KC mastery and scheduler algorithm, or the step-player UI.


yesterday
You said: /btw what is the best way to document this plans, decisions, there might be changes to these decisions in the future.

/btw what is the best way to document this plans, decisions, there might be changes to these decisions in the future. what is the effective way to document them. (like adr for software architecture kinda)

yesterday

Claude responded: Use the same idea as ADRs, with two layers: living documents that you overwrite, and decision records that you never edit, only supersede.

Use the same idea as ADRs, with two layers: living documents that you overwrite, and decision records that you never edit, only supersede. A startup also needs a third layer that ADRs lack: an assumptions and experiments log, because most of your decisions rest on bets the pilot will confirm or kill.

The three layers
Layer	What it holds	How it changes
1. Living docs	Current truth: vision, positioning, pricing, roadmap, product spec, pilot plan	Edited freely. Always reflects now.
2. Decision records	Why you chose X over Y at a point in time	Append-only. Never edited; a new record supersedes the old one.
3. Assumptions & experiments	What you believe but haven't proven, and the test for it	Each entry moves from untested → validated or invalidated, with data.

Living docs say what. Decision records say why. Experiments say how you know. Living docs link to the decisions behind them.

Folder layout

al-app/
├── README.md                  # 1-page overview + links
├── living/
│   ├── strategy.md            # vision, positioning, target users
│   ├── pricing.md
│   ├── go-to-market.md        # teacher channel, social, parents
│   ├── product-spec.md        # skill graph, L1–L5 layers, step player
│   └── roadmap.md
├── decisions/
│   ├── 0001-physics-first.md
│   ├── 0002-teachers-as-channel.md
│   ├── 0003-pilot-price-300.md
│   ├── 0004-schedule-skills-not-cards.md
│   └── index.md               # table: id, title, status, date
├── experiments/
│   ├── E01-founding-100-pilot.md
│   └── assumptions.md         # running list of untested assumptions
└── meetings/                  # teacher calls, user interviews (raw notes)
Decision record template (a business-adapted ADR)

markdown
# DR-0003: Pilot price = 300 LKR for 8 weeks
- Status: Accepted | Proposed | Superseded by DR-00xx | Deprecated
- Date: 2026-11-02 · Owner: Viraj · Consulted: [teacher]
- Area: Pricing / GTM

## Context
Free pilots don't reveal willingness to pay; parents are the payers.

## Options considered
1. Free pilot — max signups, zero WTP signal
2. 300 LKR + money-back guarantee — low friction, real signal  ✅
3. Full 900 — strong signal, too few signups for data

## Decision
Option 2, framed as "Founding 100", lock-in 600/month for life.

## Assumptions (link to assumptions.md)
- A3: ≥60% of approached parents will pay 300
- A4: Refund requests < 15%

## Revisit triggers
- Conversion < 30% after 2 weeks of recruiting
- Refund rate > 25%
- Review date: 2027-01-15

## Consequences
+ Real payment data, committed users
− Manual payment/activation overhead

The revisit triggers section is the most important addition over a classic ADR. Each decision records in advance the condition under which you'll change it. That stops you from abandoning decisions on impulse or clinging to them out of sunk cost.

Experiment entry template

markdown
# E01: Founding 100 pilot
- Hypothesis: Daily SRS + parent reports → +10% mock MCQ score in 8 weeks
- Metric / threshold: D30 retention ≥ 40%, ≥4 study days/wk, score delta vs control
- Kill / pivot criteria: D30 < 20% → rethink core loop
- Status: Planned | Running | Done
- Result: (filled after) + data link
- Decisions triggered: DR-00xx
Rules that keep it useful
One decision per record, written on the day you decide. Five minutes, not an essay.
Never rewrite an accepted record. To change course, write a new one that says "Supersedes DR-0003" and mark the old one superseded. That history is the value.
Record the rejected options. Six months later, "why didn't we just make it free?" is the question you'll need answered.
Link everything: living doc → decision → assumption → experiment result.
Hold a monthly review. Scan for revisit dates that have passed and triggers that have fired, and update the assumption statuses.
Keep a decision index table, so you can see the current state at a glance.
Tooling
Option	When
Git + Markdown, with Obsidian as the editor	Best fit for you as an engineer: versioned, diffable, backlinks and graph view, with the code nearby
Notion (databases for decisions and experiments, with status and date properties)	If your wife and teachers will read or comment, since it's easier for non-developers
Hybrid	Decisions and specs in git; a shared Notion page or Doc for collaborators

Whichever you choose, keep the decision records append-only.

I can set this up as a doc now, pre-filled with the decisions we've already made: physics first, teachers as the channel, the Founding 100 pricing, schedule-skills-not-cards, notes with embedded checks, and the MVP cut.


yesterday
You said: what books i should read, to get more context on starting a business like this.

what books i should read, to get more context on starting a business like this. specilly have zero knowledge in sales and marketting

yesterday

Claude responded: Read in this order.

Read in this order. The first five cover about 80% of what you need for this business; the rest are for when you hit the specific problem they solve.

Core 5 (start here)
#	Book	Why for you	Apply it to
1	The Mom Test (Rob Fitzpatrick)	How to talk to teachers, parents and students without getting polite lies. Short, about 3 hours.	Your next 10 teacher and parent conversations, before you build much more
2	$100M Offers (Alex Hormozi)	Offer design: value stacking, guarantees, scarcity, pricing. Your "Founding 100" and money-back guarantee come from this kind of thinking.	Pilot offer, paid tiers, annual plans
3	Obviously Awesome (April Dunford)	Positioning: how to stand out against AP.LK, BrainUs and free past papers.	Your one-line pitch and app store description
4	Traction (Weinberg & Mares)	The "Bullseye" method for picking 1–2 acquisition channels out of 19 and testing them cheaply.	Teachers vs social vs WhatsApp vs parents
5	$100M Leads (Alex Hormozi)	Getting leads: warm outreach, content, ads, affiliates. Its affiliate section maps directly to the teacher revenue-share model.	Teacher affiliate program, content plan
Sales (for teacher meetings)
Book	Why
SPIN Selling (Neil Rackham)	Consultative selling: ask about the teacher's problems before pitching. Built on research into large sales, and the method fits B2B-style deals like these.
Never Split the Difference (Chris Voss)	Negotiation. Useful for revenue-share terms and bulk pricing with big teachers.
Influence (Robert Cialdini)	Social proof, authority, scarcity, reciprocity. Understand them, and use them ethically, since your users are teenagers.
Marketing mindset and messaging
Book	Why
This Is Marketing (Seth Godin)	The "smallest viable audience" idea: win 100 students deeply before chasing 10,000.
Building a StoryBrand (Donald Miller)	Messaging framework where the customer is the hero. Useful for writing the parent WhatsApp copy, landing page and flyers.
Startup method (bootstrapped)
Book	Why
Running Lean (Ash Maurya)	Lean Canvas plus experiment-driven building. Pairs with the experiment log from your decision docs. More practical than The Lean Startup.
The Minimalist Entrepreneur (Sahil Lavingia)	Bootstrapped, profitable, community-first. Matches your 5–6 lakh/month goal better than VC-style books.
The Cold Start Problem (Andrew Chen)	Network effects. Relevant once classes, teachers and leaderboards create one.
Retention and learning science (product side)
Book	Why
Hooked (Nir Eyal)	Habit loop: trigger, action, variable reward, investment. Your daily-queue design.
Make It Stick (Brown, Roediger, McDaniel)	Retrieval, spacing, interleaving, worked examples. The science behind the L1–L5 design; good for marketing claims too.
Why Don't Students Like School? (Daniel Willingham)	How students actually think. Helps with designing notes and explanations.
How to read them efficiently
Hormozi's books are cheap or free in some formats, and he covers the same material in long-form YouTube videos.
Read one, then apply it the same week. For example, after The Mom Test, do 5 interviews; after $100M Offers, rewrite the pilot offer. Marketing books retained without action are worthless.
Use your own method: make Anki cards of the key frameworks (Mom Test rules, the Bullseye steps, SPIN question types).
Skip for now: Zero to One, The Hard Thing About Hard Things, Blitzscaling. These are VC and scale books that aren't relevant at your stage.

Minimum viable reading list: The Mom Test → $100M Offers → Obviously Awesome. That's about 15 hours, and enough to run the pilot well.


yesterday
You said: what if someone entirely copies my idea.

what if someone entirely copies my idea. and put on there own existing education app?

yesterday

Claude responded: If the app succeeds, assume someone will copy it.

If the app succeeds, assume someone will copy it. Copying is a sign you've validated the market. You can't stop it legally, but you can make a copy much worse than the original.

1. What the law can and can't protect
Asset	Protectable?	Action
The idea or features (spaced repetition, streaks, step player, teacher dashboard)	❌ No. Ideas and features aren't protectable.	Don't waste money trying.
Software patents	❌ Practically no. Slow, expensive, weak for software in SL.	Skip.
Brand name and logo	✅ Trademark	Register with the National Intellectual Property Office (NIPO) early. Cheap insurance.
Your code	✅ Copyright, automatic	Keep the repo private; don't open-source the core engine.
Content (notes, templates, explanations)	✅ Copyright, partly	Purely AI-generated content has a murky copyright status. Human review and editing by your wife strengthens ownership. Keep version history as evidence.
Bulk content theft	✅ Terms of service plus evidence	Add anti-scraping terms, rate limits, and canary items: unique fake variants that prove copying if they show up elsewhere.

Do now (legal hygiene): register a Pvt Ltd, trademark the name, and sign an IP assignment to the company from everyone who creates content or code. That includes your wife, kept clean and friendly. It matters for future investors, partners or acquirers.

2. Who could actually copy you
Copier	Realistic?	Their weakness
Star-teacher platforms (AP.LK, DM Education)	Medium	Their app serves their students only. Rival teachers will never send students to a competitor's app. You're teacher-neutral; they structurally can't be.
White-label agencies (Edumix and similar)	Medium-high	They build generic LMS shells. Flashcards are easy for them; a verified skill graph and template bank are not.
Telcos (Nenasa, Kuppiya)	Low-medium	Slow, committee-driven, content quality is mediocre. Big reach, weak product.
AI startups (BrainUs and others)	High	Same speed as you. You win on content depth, teacher distribution and outcomes.
3. What a copier gets, and what they don't
Easy to copy (weeks)	Hard to copy (months to years)
UI, streaks, leaderboards, flashcards	Teacher network and revenue-share relationships
"Anki-style" positioning	Skill graph plus verified templates in 3 mediums
Pricing	Calibrated difficulty and misconception data from thousands of attempts
Marketing copy	Outcome proof ("students improved X% on mocks")
	Student switching costs: mastery history, streaks, class setups, parent reports
	Your iteration speed with a teacher in the house

A copier gets the shell, not the engine and not the trust.

4. Moats to build deliberately, in priority order
Distribution: annual agreements with teachers, and possibly exclusivity for the top 3–5 teachers in exchange for a better revenue share. Teachers who earn recurring income from you won't switch for a clone.
Data: step-level attempts lead to better difficulty calibration, smarter scheduling and better outcomes, which leads to more users. Copiers start at zero.
Outcome proof: publish pilot results with real numbers. "Our students improved" beats any feature list.
Switching costs: months of mastery history, a teacher's class analytics, parent report history. Make leaving painful in a good way.
Content depth and quality: best-in-class in one subject beats average in five. Go deep in physics before going wide.
Speed: ship weekly, talk to users weekly. Big players move quarterly.
5. If a big player copies and goes free
Don't compete on price. Compete on quality, teacher neutrality and parent reporting.
Offer to become their supplier. License your engine and content bank to a white-label agency or telco. A copier becomes a B2B customer, which is a valid business on its own.
Acquisition is an exit. A telco or large platform buying a proven product with traction is a realistic outcome.
6. Don't overcorrect with secrecy

Building in stealth costs you more (no feedback, no teacher relationships, no social proof) than copying ever will. Share the idea freely with teachers and users; protect the code, content bank and data.

The question that matters is not whether someone copies you, but whether you're further ahead and harder to leave when they do. The teacher network plus the data gets you there.


yesterday
You said: what is better?

what is better?
my wife is on a what's app channel witch is filled with over 500 physics goverment teachers. (most (if not all) of them are not big players) - i already their what's app no.s i can call them individually
vs
like you suggested go to big tution players

yesterday

Claude responded: Start with the 500-teacher channel.

Start with the 500-teacher channel. For the stage you're at, it's clearly better. Big tuition players come later, once you have proof.

Comparison
Factor	500 government teachers	Big tuition players
Access	✅ Warm, through your wife's trust network	❌ Cold, hard to reach, gatekept by staff
Students per teacher	30–150 (school classes plus small tuition batches)	500–5,000+
Total reach	500 × ~60 ≈ 30,000 students	Huge, but a few gatekeepers
Bargaining power	✅ Balanced; they gain a free tool	❌ They demand a large revenue share or exclusivity, and dictate terms
Copy risk	✅ Low; no tech teams	⚠️ Higher; some have their own apps and developers
Feedback quality	✅ Honest, varied (schools, regions, mediums)	⚠️ Filtered, biased to their method
Proof needed first	Low; they'll try a free tool	High; they need results and other teachers using it
Speed	Days	Months

The big players are a multiplier. A multiplier needs something to multiply: pilot results, testimonials, a working product. The 500 teachers produce exactly that.

Hidden bonus: your content reviewer pool

This channel solves your three-medium content problem:

Recruit paid reviewers for Tamil and English medium, and extra Sinhala reviewers, from it.
Teachers from different regions catch syllabus-interpretation and terminology issues.
Contributing reviewers become invested in the product and become your champions.
⚠️ Two cautions

1. Government teacher conduct rules. Ministry of Education circulars restrict government teachers from charging their own school students for extra classes. A teacher earning revenue share by selling a paid app to their own school students may be in a grey area or against the rules. Before designing the commercial model for this group, check the current circulars.

Safer structure:

For teachers: the app is a free tool (class dashboard, assignments, reports).
Students and parents buy premium directly. The teacher only recommends.
Revenue share or affiliate only for students in a teacher's own private tuition, if they run one, and only where the rules allow it.

2. Don't cold-call all 500 numbers.

Calling numbers taken from a group for a commercial pitch can feel like spam, damage your wife's reputation in that community, and raise personal-data concerns under SL's Personal Data Protection Act.
Use opt-in instead:
Ask the channel admin for permission.
Your wife posts a genuine, personal invite: "My husband and I are building a free Physics revision tool for teachers. Looking for 20 teachers to try it with their classes and give feedback. Interested? Fill this 1-minute form."
Call only the people who opt in. Those are warm conversations, not cold calls.
Funnel estimate

500 teachers in channel
 → ~10–20% opt in        = 50–100 teachers
 → 15-min calls           = pick 10–20 best fits (mix of medium/region/school type)
 → each brings 1 class    = 300–1,000 students
 → Founding 100 paid pilot from 3–5 of those teachers' classes
 → rest: free teacher-tool beta + waitlist

That's more than enough for the pilot. You'll likely have to turn people away, which is a good problem.

Sequence
Phase	Channel	Goal
Now to pilot	Wife's 500-teacher channel (opt-in)	Pilot classes, reviewers, feedback, testimonials
After pilot (3–6 months)	Mid-size tuition teachers (100–500 students)	First real revenue through affiliate or bundle
With proof (6–12 months)	Big tuition players	Scale through a branded revision tool, armed with outcome data

Approaching big players today means pitching an idea. Approaching them in a year means pitching results.


yesterday
You said: i was thinking not to involve 500 wa group for the pilot.

i was thinking not to involve 500 wa group for the pilot. only very closed friends of her (like 3/4 teacher + her students) ~ 100 (2 - 3 months max)
then, once the pilot is done. and i have a good algorithm, review system, dashboard an all. then i go to what's app group. like you said in the middle of the pilot i can share the survay message. and on-board interested teachers. (let's say ~ 75)
and continue... what do you think?

yesterday

Claude responded: This is a better plan than mine.

This is a better plan than mine. The 500-teacher channel is a one-shot first impression, and you shouldn't spend it on a buggy v1.

Why it works
Forgiving users: close friends tolerate bugs and give fast, direct feedback.
Fast iteration: 3–4 teachers you can call any evening means you can change things weekly.
Reputation protected: your wife's standing in the channel stays intact until the product is solid.
Mid-pilot survey: builds a waitlist and anticipation without exposing the product.
Enough data: about 100 students × 30 items/day × 60 days is roughly 150–180k attempts. That's enough to calibrate difficulty for a few hundred items and tune the scheduler.
Six adjustments

1. Counter friendly bias.
Friends and her own students over-engage and sugarcoat feedback.

Include at least one teacher, or class, she doesn't teach and isn't close to.
Judge on behaviour, not opinions: retention, study days, payment, mock score delta.
Still charge the 300 LKR, friends included. Payment is the most honest signal you'll get.

2. Set exit criteria before the pilot starts.
Write them down now, in your decision log, so you can't move the goalposts later:

Metric	Proceed to WhatsApp rollout if
D30 retention	≥ 40%
Study days per week	≥ 4
Mock MCQ score delta vs baseline	Clear positive gain
Refund requests	< 15%
Teachers actively using the dashboard	≥ 3 of 4

If you miss them, extend and fix. Don't scale.

3. Don't onboard 75 teachers at once.
75 teachers × ~50 students is roughly 3,000–4,000 students: a 30–40× jump in support, bugs and content demand. Roll out in waves:


Wave 1: 15 teachers  →  2–3 weeks, fix issues
Wave 2: 30 teachers  →  2–3 weeks
Wave 3: rest

Prioritize the medium your content covers. If only Sinhala medium is ready, onboard Sinhala-medium teachers first and waitlist the others.

4. Keep the waitlist warm.
A survey filled in mid-pilot that then goes silent for 2 months goes cold.

Send a short monthly update: a sneak-peek screenshot, a pilot stat, an early-access date.
Use the survey for more than interest: ask a few Mom Test-style questions about how they handle revision now, and recruit paid content reviewers for the other mediums.

5. Time it to the exam calendar.
The best months to sell are when students feel exam pressure. Rough shape (verify the 2027 A/L dates when announced):

Period	Phase
Nov–Dec 2026	Build MVP for 2–3 units, recruit the 3–4 teachers
Jan–Mar 2027	Pilot, with the survey in the WhatsApp channel around week 4–6
Mar–Apr 2027	Fix, expand content, wave 1 and 2 onboarding
Apr–Jul 2027	Pre-exam crunch: highest motivation and willingness to pay

The December school holidays are a weak time to start a pilot. A January start gives cleaner data.

6. Content scope must keep up.
The pilot can run on 2–3 units. The WhatsApp rollout needs most of the syllabus in at least one medium, or teachers can't assign it to their classes. Plan the content pipeline to run in parallel with the pilot, not after it.

Revised flow

Pilot (100, close circle, paid 300, money-back)
   │  week 4–6: opt-in survey in WhatsApp channel (with admin permission)
   ▼
Exit criteria met? ── no ──► extend + fix
   │ yes
   ▼
Waves: 15 → 30 → rest of opted-in teachers (matching medium first)
   ▼
Mid-size tuition teachers → big players (with outcome proof)

Write this down as your first two or three decision records: pilot scope, exit criteria, and rollout waves.


yesterday
You said: what are my main selling points for teachers.

what are my main selling points for teachers. i need to sweeten the first what's app group message. including these. (tell me your opinion):
"""
What teachers get:

obvious student\s stat plus

A revenue share (50 LKR per student or more)
teaching materials. (short notes, simulations/(interactive) animations)
paper builder / models papers (building / finding model papers for school exams are one of the painful thing they have - specially for my wife) + answers with reviews
less work (tools to help with some teacher's documentation work & reporting works at school)

"""
these are some of the extra work. but i not sure teacher will easyily get on-board. specilly the problem with charging their own students. as far as i know, there is know obligation in the law. but you know. they will be skepticle also lazy

Message collapsed
Show more
yesterday

Claude responded: Your list is good, but it's in the wrong order, and one item (revenue share) shouldn't be in the first message at all.

Your list is good, but it's in the wrong order, and one item (revenue share) shouldn't be in the first message at all.

Rating each selling point
Selling point	Verdict	Why
Paper builder + model papers with answers	🥇 Lead with this	Painful, frequent (every term test), immediately useful, and works without students paying anything. This is your hook.
Teaching materials (notes, simulations for class/projector)	🥈 Strong	Free, tangible, and makes teachers look good in class. Simulations on a smartboard or phone are a wow moment.
Less admin work	🥉 Strong but vague	"Documentation help" sounds like an empty promise. Name one concrete thing (e.g., term test mark analysis, or a class progress report in one click). Only promise what you'll actually ship.
Student stats / dashboard	Good, but second-order	Only valuable after students join. A reason to stay, not to sign up.
Revenue share (50 LKR/student)	⚠️ Not in the first message	For government teachers it makes them sound like a sales agent, raises the "selling to my own students" concern, triggers skepticism ("what's the catch?"), and 50 LKR looks small in a public message. Mention it in 1:1 calls, as an optional partner program.
The bigger fix: separate teacher value from student payment

Your onboarding fear ("charging their own students") goes away if teachers never have to sell anything:

Teachers: free forever. Paper builder, materials, admin tools, dashboard.
Students in a teacher's class: a free basic tier (daily practice, limited).
Premium: you sell to parents directly (parent reports, full question bank, exam sets). The teacher at most says, "there's a premium if you want it."
Earning options for teachers (opt-in, 1:1 only):
Paid content reviewer (cleanest; no conflict at all)
Affiliate share only for their private tuition students

Teachers can then adopt it with zero ethical friction. You handle the selling.

Beating skepticism and laziness
Barrier	Fix
Skeptical	It comes from your wife, a fellow teacher, not a company. Say content is teacher-reviewed. Free, no commitment.
Lazy	Value in 2 minutes with no setup: the paper builder works on day one without adding students. Joining a class is one QR code.
"What's in it for me?"	Saves hours before term tests, which every teacher feels.
FOMO	A limited "founding teachers" group with early access and a say in features.

"Founding Teacher" perks (cheap for you, valuable to them):

Free premium forever
Their feature requests prioritized
Name credited as a founding reviewer
First chance at paid reviewer work
The WhatsApp message

Written in your wife's voice: short, benefit-first, one call to action, no price, no revenue share. Translate to Sinhala; teachers respond far better to their own language.

Hi everyone 👋

My husband (a software engineer) and I have been building a free A/L Physics tool for teachers, and we're looking for a small group of teachers to try it early.

What you get, free:
📝 Paper builder. Create term-test and model papers in minutes, with answers and marking guides. No more hunting for questions.
📚 Ready teaching materials. Short notes and interactive simulations you can show in class.
📊 Class progress at a glance. See which topics each student is weak in, with one-click reports.

Content is reviewed by physics teachers and aligned to the A/L syllabus.

We're opening it to 20 founding teachers first, who also get a say in what we build next.

Interested? Fill this 1-minute form 👉 [link]

Happy to answer any questions here or personally 🙏

Short opt-in form (5 questions)
Name, school, district
Medium (Sinhala / Tamil / English)
Classes taught (Grade 12 / 13, roughly how many students)
"What's the most time-consuming part of your work before term tests?" (open question; this is your Mom Test data)
Interested in paid content reviewing? (Yes / Maybe / No)
Notes
Only promise what will exist at rollout. If the paper builder isn't ready, don't lead with it; broken promises in this group spread fast.
The admin tool is a scope-creep risk. Pick one report that the survey shows is most painful, and build only that.
On the legal question: even if no law forbids it, perception and Ministry circulars matter in government schools. The "teachers never sell" model removes the issue instead of arguing it.

I can draft the follow-up 1:1 call script for teachers who fill the form, including how to introduce the partner program.


yesterday
You said: the app only have physics for now.

the app only have physics for now. will student buy only physics product? (specially biology students are the ones afraid of physics. combine maths students are afraid of chemistry) will parents pay for a product only covers one subject

yesterday

Claude responded: Yes, a physics-only product can sell.

Yes, a physics-only product can sell. Single-subject is actually the normal way education is bought in Sri Lanka. The bigger question is who you aim it at.

1. Single-subject is the norm, not a weakness
Tuition is bought per subject. Parents already pay a separate monthly fee for each subject and teacher. "One subject, one payment" matches how they already think.
Existing single-subject successes:
AP.LK is focused on A/L Physics alone, and its developer claims over 70,000 students.
DM Education claims 100,000+ students on A/L Biology alone.
Nobody expects one app to cover everything. They expect the best help for the subject they're struggling with.
2. Turn the fear into your positioning

Your observation is your best marketing insight.

Segment	Pain	Fit for physics-only
Bio stream students weak in physics	Physics drags down the Z-score; medicine needs top results in all three subjects	🥇 Your best first customer. Fear plus high stakes plus parents who will pay for medicine aspirations.
Physical science stream students	Physics is core, but they're usually more confident	🥈 Good, with less urgency
Combined maths students afraid of chemistry	Not your product yet	Future: chemistry

Position it as a fix for the weak subject, not as an all-in-one app.

To Bio students and parents: "Physics is the subject that decides medicine. 15 minutes a day to stop it pulling your Z-score down."
Parents of Bio students are the most motivated payers in the whole A/L market.
3. Product implications for Bio students

Both streams sit the same physics paper, but Bio students typically:

Struggle more with maths-heavy steps, so they benefit most from scaffolding (worked examples, then faded, then independent).
Gain marks fastest from MCQ and conceptual items (L1–L3).
Need confidence-building: early wins and a visible readiness score rising.

A "Physics for Bio students" path (a different default mix and entry diagnostic, same content) is cheap to build and a strong marketing angle.

4. Pricing for one subject
900/month for one subject is still well below one tuition class, so it's easy to justify if framed against tuition rather than against other apps.
Plan subject bundles from day one, even if only physics exists now:
Plan	Price (example)
1 subject	900
2 subjects	1,500
Stream bundle (3 subjects)	2,000
Founding members lock in their discount for future subjects too. That gives them a reason to stay when chemistry launches.
5. Subject roadmap
Order	Subject	Why
1	Physics	Your wife's expertise; feared by Bio students
2	Chemistry	Taken by both science streams, feared by combined maths students; organic and inorganic are very recall-heavy, which suits spaced repetition well
3	Biology	The most spaced-repetition-friendly subject and a big market; mostly recall
4	Combined Maths	The hardest to build (CAS, proofs, step player); do it last

After chemistry, physics plus chemistry covers both science streams. That's the point where a stream bundle becomes a strong offer.

6. Validate it in the pilot, don't guess

Add these to the pilot and parent surveys:

"Which subject is your child most worried about?" (Physics / Chemistry / Bio / Combined Maths)
"Would you pay 900/month for help in that subject alone?" (Yes / Maybe / No)
Track Bio vs physical science students separately: retention, score gains, conversion.

If Bio students convert noticeably better, you have your ideal customer and your marketing message, backed by data.

Risks
App fatigue: some students won't want separate apps per subject. Keep it one app with subjects as add-ons, never separate apps.
Churn after the exam is the same for single- or multi-subject; annual and exam-year plans still matter most.
"Only physics?" objection from parents: the answer is "we do one subject properly, reviewed by teachers, and chemistry is coming next." Focus reads as quality.

yesterday
You said: as you can see, i am skeptical too.

as you can see, i am skeptical too. a lot. this is the first time i am seriously thinking about building something and selling. so i wanna do this right. but i am afraid too. i have a tendency to abandon ideas once the interesting part (eg: building the algorithm / ui) is done / once i see a some competitor / once i face a problem, i am shy too. and my wife also. specially shy to fail.

yesterday

Claude responded: What you're describing is the most common founder pattern there is, and naming it now is useful.

What you're describing is the most common founder pattern there is, and naming it now is useful. Most people who abandon projects never notice why. You can design around it.

Your skepticism is an asset. It's why you asked for a reality check, researched competitors, and planned exit criteria before writing code. The risk isn't that you're skeptical. It's that skepticism plus fear turns into quietly stopping. So the goal is a structure where stopping is a deliberate decision, never a drift.

The "interesting part is done" problem. Engineers love the algorithm and the UI because progress is visible and fully in their control. Selling is uncertain, so it feels worse. Some countermeasures:

Make users the interesting part. Gate building behind customer milestones. For example: no work on the scheduler v2 until 3 teachers are confirmed for the pilot.
Build less than you want. A crude v1 that 100 students use teaches you more than a beautiful engine nobody sees. The fun technical problems still come later, and they get harder and better once real data arrives.
Keep a visible scoreboard of user numbers, not commits: students active today, teachers onboarded, 300s paid.

The competitor problem. You've already done the hard version of this: you looked at AP.LK, BrainUs and the rest before starting, and the plan still made sense. So write a rule in your decision log: "A new competitor changes the plan only if it hits one of our revisit triggers." When you see one, open the log instead of losing heart. Competitors appearing means the market is real.

The "face a problem" moment. Every project hits a wall around weeks 4–8: a bug, a teacher who says no, a bad metric. Expect it and plan for it.

The pilot already has pre-written exit criteria. A bad week isn't a verdict; only the criteria at the end are.
If you do stop, stop on purpose: write a short decision record saying why. That turns "I gave up again" into "I ran an experiment and learned X", which is a completely different experience.

Shyness and fear of failing, for both of you. Your plan already reduces this a lot. The first circle is 3–4 close friends and her own students, not strangers. A few more things:

Use scripts and text. WhatsApp messages and a survey link are much easier than cold calls, and scripts remove the "what do I say" freeze.
Selling here is helping. You're offering teachers a tool that saves them hours, and students a way to stop failing physics. If it doesn't help, the money-back guarantee means nobody loses.
Lower the stakes of failure. The pilot costs you some evenings and very little money. If it fails, the worst case is that you learned how to build, sell and run a real product, and you're far ahead of where you started. That's not a fail you need to be ashamed of.
Split roles by comfort, then stretch slightly. One of you leads tech and content; the other leads teacher relationships. Neither has to do everything.

One commitment device worth adopting. Tell the 3–4 teacher friends a pilot start date and collect the 300 LKR before you're "ready". Once real people are waiting, the boring and scary parts become obligations, not choices. That's usually what carries people through the dip.

You don't need to feel unafraid to do this right. You need a small, time-boxed experiment, clear criteria, and a few people expecting you to show up. You already have most of that.


yesterday
You said: let's discuss about tech, what will be the most suitable tech stack for this.

let's discuss about tech, what will be the most suitable tech stack for this. including server/cloud stuff also cost, going forward changes. and other related stuff.
i am planning to 90% of the developments to AI. but i'll be carefully review some of parts of the code. because, since this is my product. i need to get to know what's going on
i don't wanna build the app for targeting 1000 students since beginning. i also don't wanna be lot of cheap and give my customers bad experience. students are more families with lots of seamless apps. so i wanna give more seamless, fast, experience. also for parents are teachers. parents will not have seperate app / site. they will be connected via what's app mostly, or i can share some public links to them with more informations

yesterday

Claude responded: For a small team that writes most code with AI help, the right setup is TypeScript end to end, a local-first mobile app, and a modular monolith on managed Post…

For a small team that writes most code with AI help, the right setup is TypeScript end to end, a local-first mobile app, and a modular monolith on managed Postgres. Fast for users, cheap at the start, and it grows to about 10k students without a rewrite.

1. Guiding decisions
Decision	Choice	Why
Language	TypeScript everywhere (Python only for the maths and content pipeline)	AI writes the best code in mainstream stacks; one language means shared types between app, API and dashboard
Architecture	Modular monolith, not microservices	Your distributed-systems background will pull you toward services. Resist it: one API, one database, one worker is far less to operate and debug at this scale.
UX model	Local-first: the app works offline and studying never waits on the network	That's what makes it feel instant on a cheap Android phone with patchy data
Platform order	Android first, iOS from the same codebase later	Most SL students use Android; iOS adds $99/yr plus review overhead
2. Recommended stack
Layer	Choice	Notes
Mobile app	React Native + Expo (Hermes engine)	Uses your React skills; EAS Update lets you push JavaScript fixes without a Play Store review, which matters during the pilot
Local database	SQLite (op-sqlite or expo-sqlite)	Content packs and the student's review state live on the device
Scheduler	ts-fsrs for L1/L2 cards plus your own KC mastery model in TS	Runs on device for instant next-card; the server recomputes from events as the source of truth
Backend API	Node + Fastify (or Hono), Zod schemas shared via a monorepo package	Simple, fast, well known to AI tools
Database	Postgres (Supabase or Neon)	Supabase adds auth, storage and row-level security; it's still plain Postgres, so no lock-in
Background jobs	pg-boss (a job queue inside Postgres)	No Redis needed; handles weekly reports, PDF generation, calibration jobs
Teacher dashboard and parent pages	Next.js web app	Teachers use a laptop or phone browser; parent reports are public signed links
Content and media CDN	Cloudflare R2 + CDN	No egress fees; serves versioned content packs and simulations
Simulations	Canvas/p5.js as web components, bundled offline, shown in a WebView in the app	The same simulation runs in the app, the teacher dashboard (projector in class) and parent links
Maths rendering	KaTeX, pre-rendered to SVG/HTML at publish time	No runtime maths layout on device, so it's fast and offline
Content pipeline	Python + SymPy (template verification), LLM batch generation	Runs offline or in CI, not in the request path
PDF / paper builder	HTML → PDF with headless Chromium (e.g., Gotenberg); test Typst as a faster option	Chromium is the safe bet for Sinhala and Tamil text shaping. Typst is Rust-based and fast, but test Sinhala rendering before relying on it.
Auth	Google sign-in (free, most Android users have it) + phone OTP fallback via a local SMS gateway + class join codes	Avoid international SMS providers; they cost much more for SL numbers
Payments	PayHere (web, teacher bulk, activation codes) + RevenueCat wrapping Play Billing	RevenueCat handles subscription state and receipts across stores; check its free tier
Parent channel	WhatsApp Business Platform (Cloud API): weekly utility template plus a signed report link	No parent app. Utility templates cost less than marketing ones; check Meta's per-message pricing for SL.
Push notifications	Expo Notifications (FCM)	Daily study reminders at the student's chosen time
Analytics	PostHog (events, funnels, feature flags, session replay)	Retention dashboards and A/B tests come almost free
Errors	Sentry	Crash and performance monitoring for app and API
Hosting region	Singapore or Mumbai	Closest to SL; noticeably lower latency than US or EU regions
3. Architecture

┌──────────── Student app (Expo/RN, Android) ───────────┐
│  SQLite: content packs + review state + event queue   │
│  Scheduler (ts-fsrs + KC mastery) runs locally         │
│  Sims in WebView (bundled offline)                     │
└───────────┬───────────────────────────┬───────────────┘
   sync: push attempt events      pull: versioned content packs
            │                           │
            ▼                           ▼
     ┌──────────────┐           ┌────────────────┐
     │ API (Fastify)│           │ Cloudflare R2  │◄── publish pipeline
     │ auth, sync,  │           │ + CDN          │    (Python/SymPy,
     │ classes, pay │           └────────────────┘     review UI)
     └──────┬───────┘
            ▼
     ┌──────────────┐     ┌───────────────────────────────┐
     │  Postgres    │◄───►│ Worker (pg-boss): weekly       │
     │  (Supabase)  │     │ reports, PDFs, calibration,    │
     └──────┬───────┘     │ WhatsApp sends                 │
            │             └───────────────────────────────┘
            ▼
     ┌──────────────────────────────┐
     │ Next.js: teacher dashboard,  │
     │ admin/review UI, parent      │
     │ report pages (signed links)  │
     └──────────────────────────────┘
Why sync can stay simple

You likely don't need a heavyweight sync engine (PowerSync, ElectricSQL and so on) at first, because your data has two easy shapes:

Data	Shape	Sync strategy
Content (notes, cards, templates, sims)	Read-only, versioned	Download content packs per unit with a version number; fetch only changed packs
Student activity	Append-only events (attempts, step results)	Queue locally and upload in batches; idempotent on event ID, so retries are harmless
Derived state (mastery, due dates)	Computed	Recomputed on device for instant use and on the server for truth and teacher views

Append-only events never conflict. That removes the hardest part of offline sync, and it's also the data source for analytics, calibration and reports.

4. Content and review pipeline

LLM batch generation (notes, templates, steps, misconception maps)
   → SymPy verification (sample 50 variants per template, check answers/steps)
   → status: AI-verified
   → Review UI (Next.js admin): your wife approves / edits / comments
   → status: published
   → Export versioned content pack (JSON + pre-rendered math SVG) → R2
   → App fetches new pack on next sync
Store content in Postgres with a status workflow and version history (draft → verified → reviewed → published).
The review UI is worth building early. It's where your wife spends her time, so it should be fast, mobile-friendly, and show the rendered preview exactly as students will see it.
Fonts: bundle Noto Sans Sinhala and Noto Sans Tamil. Test rendering on low-end Android, because Sinhala text shaping problems show up there.
5. Parents and teachers without an app
User	Interface
Parent	Weekly WhatsApp message: a short summary plus a signed, expiring link to a mobile web report (no login). The link shows a preview image when shared in WhatsApp.
Teacher	Next.js dashboard (phone or laptop): class heatmap, assign decks, paper builder, reports. Log in with Google or phone OTP.
Public pages	Topic pages, syllabus map, demo simulations. Useful for SEO and AI-search discovery, and teachers can share them.
6. Cost estimates (rough; verify current pricing)
Item	Pilot (~100 students)	~1,000 students	~10,000 students
Postgres + auth + storage (Supabase)	$0–25	~$25–50	~$100–250
API + worker hosting	$5–20	~$20–50	~$100–200
Next.js hosting	$0–20	~$20	~$20–50
R2 / CDN	~$0	~$1–5	~$10–30
PostHog / Sentry	Free tiers	Free–$30	~$50–150
WhatsApp weekly reports	Small	Check Meta pricing (~4 messages/parent/month)	Same, scales linearly
SMS OTP (local gateway)	Small	Small (Google sign-in reduces it)	Moderate
Play Store (one-time $25) / Apple ($99/yr)	$25	—	—
Infra total, excluding messaging	~$10–60/mo	~$70–150/mo	~$350–700/mo

AI costs:

Content generation is a one-time batch cost, not a running cost. Use batch APIs.
Runtime AI (e.g., an "explain my mistake" chat) is the one cost that grows with usage. Leave it out of v1, or cap it per user per day.

At 1,000 paying students (about 850k LKR/month), infrastructure is roughly 3–5% of revenue. Store fees and marketing will matter far more than servers.

7. Performance and experience targets
Target	How
App opens to first card in under 2 seconds	Local SQLite, a precomputed next queue, Hermes, no network on startup
Every answer gives instant feedback	Grading and scheduling run on device
Works on 2–3 GB RAM Android phones	Test on a cheap device from week 1; avoid heavy animation libraries
Low data use	Unit-sized packs, WebP images, delta updates, sims bundled with the app
Small download	Target under 30–40 MB; download content per unit on demand
Bugs fixed the same day	EAS Update over-the-air for JavaScript changes
8. Working with AI-written code

Repo setup:

Monorepo (pnpm + Turborepo): apps/mobile, apps/web, apps/api, packages/shared (Zod schemas, types, scheduler), tools/content (Python).
Strict TypeScript and shared Zod schemas, so AI-generated code fails fast at the boundaries.
A CLAUDE.md or architecture doc plus your decision records in the repo, so AI agents follow your conventions.

Review these yourself, line by line:

Area	Why
Data model and migrations	Mistakes here are expensive to undo later
Scheduler and mastery model	Your core product logic. Add property-based tests (e.g., an item is never scheduled in the past; mastery stays bounded).
Sync and event ingestion	Idempotency and ordering bugs silently corrupt data
Auth, row-level security, signed links	Student data must not leak between classes or to the wrong parents
Payments and entitlements	Real money, and the source of support complaints

Let AI own (light review): UI screens, CRUD endpoints, the admin UI, the PDF layout, simulation implementations.

9. Privacy and safety (minors' data)
Collect the minimum: name, class and medium. No national ID numbers, no precise location.
Get parental consent at onboarding (a WhatsApp opt-in works). SL's Personal Data Protection Act applies.
Leaderboards: class-scoped, with a nickname option. No public full names.
Parent links: unguessable token, expiring, read-only, scoped to one student.
Encrypted backups, plus a way to export and delete data on request.
10. How it grows without a rewrite
When	Change
Around 5–10k students	Partition the attempts table by month; add a read replica for dashboards
When calibration gets heavy	Export events to DuckDB or ClickHouse for analytics; keep Postgres for the live app
When sync gets complex (e.g., teacher-edited decks offline)	Then consider PowerSync or a similar engine
More subjects and exams	Same engine; subjects are just more KC graphs and content packs
iOS	Same Expo codebase; mainly store setup and billing via RevenueCat
Runtime AI tutoring	Add it as a separate service with per-user quotas and caching
Pilot MVP scope (build order)
Monorepo, auth, data model, content pack format
Review UI and publish pipeline (your wife can start reviewing early)
Student app: study loop (L1–L3 plus MCQ problems), local scheduler, event sync
Teacher dashboard: class view and assignments
Parent weekly report: signed link plus manual WhatsApp send at first (automate after the pilot)
PayHere links plus activation codes. Defer RevenueCat and Play Billing until the public launch.

I can go deeper on any piece next: the database schema, the content pack format, or the scheduler and mastery algorithm.


yesterday
You said: should i talk this idea with friends.

should i talk this idea with friends. i have a friend with a very good business mindset. also working on the tech-industry. but people say don't ginx it. don't say the idea to peoples. then interest will be go along with it?

yesterday

Claude responded: Yes, talk to this friend.

Yes, talk to this friend. The "don't jinx it" advice has a real basis, but it applies to a different kind of telling.

Where the advice comes from

There is research behind it. Peter Gollwitzer's studies (e.g., When Intentions Go Public, 2009) found that announcing an identity goal ("I'm going to be a founder") and getting recognition for it can create a premature sense of accomplishment, so people then put in less effort. The praise substitutes for the progress.

The effect comes from telling for validation ("I'm building an app!" → "Wow, amazing!"), not from telling for critique and accountability.

Two kinds of telling
❌ Drains motivation	✅ Helps
Announcing it broadly or on social media before anything exists	Asking one sharp person to find the holes
Pitching for "wow, great idea"	Presenting the plan, the numbers and the risks for critique
Talking instead of doing	Talking with a commitment: "pilot starts in January, I'll show you results"
Vague idea talk	Specific questions with a decision attached

Given your pattern of abandoning projects, the second column works in your favour. A business-minded friend expecting an update is accountability.

How to use the conversation well

Bring the plan, not just the idea. The positioning, the pilot plan, exit criteria, pricing, the competitors (AP.LK, BrainUs), the teacher channel. That gets you a review instead of compliments.

Ask for criticism explicitly. "Tell me why this fails" or "What would you do differently?" Good business minds love that question.

Ask specific questions:

Is 900 LKR/month the right price? Monthly vs exam-year plan?
Does the teacher channel plus "teachers never sell" model make sense?
What am I missing on payments, legal setup or company registration?
Would you pay for this as a parent? (Watch the reaction, not just the words.)
Who else should I talk to?

End with a commitment. "I'll show you pilot numbers by March." Now someone expects results.

Things to watch
Idea theft risk is low. A friend in tech with their own job won't build a full content bank, scheduler and teacher network. And as we discussed, execution is the moat anyway.
Don't offer equity or partnership in the first conversation, even if they're excited. If they want to be involved, start as an informal advisor. Decide on roles and equity only after the pilot, once you know what you actually need (likely sales and marketing help, which sounds like their strength).
Hold off on broadcasting (social media, a wide circle of friends) until the pilot is running. Then you're showing progress, not announcing intentions.

One sharp critic is worth more than ten encouraging friends. Just make sure you leave that conversation with a list of problems to fix and a date to report back.


yesterday
You said: how do i get the contacts of parents.

how do i get the contacts of parents. sometime students do not like to give there parents contacts. also sometimes parents do not understand / care less. about the work of this age students (al students) - they care much about when they are younger like grade 1-5 / grade - 6-11. some (most) parents are not educated enough get understand the AL. so how do i get a hook on parents

9 hours ago

Claude responded: At A/L you can't build the product around parents.

At A/L you can't build the product around parents. The student is the real customer. Parents are, at most, the wallet and a motivator. So don't chase parent contacts; let students bring parents in when it benefits the student.

1. Rethink the parent's role
Age group	Parent role	Your approach
Grades 1–11	Decision-maker, highly involved	(not your market yet)
A/L	Payer and occasional motivator; the student decides	Student-led, parent optional

Three parent segments, three different treatments:

Segment	Share (guess)	What they get
Engaged (understands A/L, cares about university)	Minority, but highest value	Full weekly report
Supportive, not involved (pays, doesn't follow details)	Majority	A payment request plus a simple monthly update
Absent / won't engage	Some	Nothing. The student pays, or the teacher bundles it.
2. Why students hide parent numbers, and the fix

Teens resist surveillance. "Your parents will see your scores" makes them refuse.

Make parent sharing student-controlled and in the student's interest:

The student chooses what parents see:
Effort only (study days, streak): the default
Effort plus progress (readiness trend)
Full detail (scores, weak topics)
Pitch it as a benefit to the student: "Show your parents you're actually studying, so they stop nagging." For many A/L students that's a real win.
Parent-sponsored rewards: "Hit a 30-day streak and your parent gets a message suggesting a reward." Students want to share then.
Never reveal raw scores by default. Effort is safe to share; scores feel like judgment.
3. Ethical ways to get parent contacts
Route	How
Payment flow (main route)	An in-app "Ask parent to pay" button sends a ready-made Sinhala or Tamil WhatsApp message with a payment link. The parent pays, and you get the contact with consent.
Consent step for under-18s	Grade 12 students are usually 17. A parent confirms via WhatsApp: one tap, one message. This also covers SL's Personal Data Protection Act obligations for minors.
Teachers and classes	Tuition classes often already have parent WhatsApp groups and registration forms. The teacher shares your intro and opt-in link; you never take numbers directly.
Pilot	Your wife and her teacher friends introduce it at a class or parent meeting. Short, in person, with a QR code.
Student invites	The student taps "Add parent" when they decide to share progress.

Don't scrape, buy or copy numbers from groups. One complaint can damage your wife's reputation and the brand.

4. A hook for parents who don't understand A/L

They may not understand the syllabus, but they understand:

Effort: "studied 5 of 7 days this week"
Direction: improving, steady or falling
The dream: university, doctor, engineer
Value for money: less than one tuition class
Authority: "the teacher says..."

Design the parent report for a parent who can't follow physics:

Principle	Example
One headline number	"Studied 5 of 7 days ✅"
Traffic light, not scores	🟢 On track · 🟡 Needs more practice · 🔴 Falling behind
Plain language in their medium	"Your child practised 140 questions this week and improved in electricity." No "KC" or "mastery".
A voice note option	A 20-second WhatsApp audio summary in Sinhala or Tamil. Works for low-literacy parents and feels personal.
The teacher's name	"From [Teacher name]'s Physics class". Borrowed authority.
One action	"Encourage them to keep the streak going 🙏"

Sample weekly message (to translate):

🟢 Kasun studied 5 of 7 days this week
Practised 140 questions · Improving in Electricity
Exam in 9 months. Keep encouraging him! 🙏
— [Teacher name]'s A/L Physics class
📊 Details: [link]

5. Selling to parents who are not engaged
The student sells to the parent; you just give them the tools.
The "Ask parent to pay" message explains it simply: "Teacher-reviewed physics practice app, 900 rupees a month, less than one tuition class. Here's my progress so far: [link]"
Including the student's own progress so far (from the free tier) is the strongest persuasion you have.
Use the university hook, not features:
"Physics decides the Z-score for medicine and engineering."
"15 minutes a day of the right questions."
The money-back guarantee removes risk for cautious parents.
Easy payment: eZ Cash, mCash, LankaQR, bank transfer, and later carrier billing. Many parents don't have cards.
6. Product implications
Decision	Implication
Parent contact is optional, except the one-time consent for under-18s	The app works fully without parent involvement
Default sharing is effort only	Fewer refusals, more trust from students
Parent touchpoints are WhatsApp plus a link	No parent app or login
Report frequency: weekly for engaged parents, monthly for others	Avoids spamming parents who don't care
Track parent opt-in rate as a metric	Pilot data shows how much the parent channel actually matters
7. Validate in the pilot

Track:

Percentage of students who add a parent, and at what sharing level
Conversion rate where a parent was involved vs student-only
Whether parent-linked students retain better (likely, through accountability)

If parent-linked students retain and convert much better, push the parent feature harder. If not, keep parents as payment-only and focus on students and teachers.


9 hours ago
You said: in our app/product.

in our app/product. what will make students to pick up and do 15-20 minitues of work daily? (this is stubborn age). not every student is interested in education. they will install the app. they will ask parent to buy 1 month subscription. willl try the 2-3 days, from the next day they will lose interest and never pickup again. and will tell parents/teachers - it doesn't work. as you said "The student is the real customer." - how do i keep my customers on the product

9 hours ago

Claude responded: You can't make an unmotivated teen want to study.

You can't make an unmotivated teen want to study. You can make the app easier to open than to skip, socially costly to ignore, and rewarding within 5 minutes. Retention for this age comes mostly from structure and people around the student, not from features alone.

1. Why students drop on day 2–3
Cause	What it looks like
No felt progress	"I did 40 questions and nothing changed"
Too big an ask	15–20 minutes feels like homework, so they skip it
Too hard too soon	Gets questions wrong, feels stupid, stops
No trigger	Nothing reminds them; TikTok wins
Disconnected from real life	Not linked to what the teacher taught this week or the next test
Nobody notices	Skipping has zero consequence
Missed a day → guilt	Broken streak plus a backlog, so they avoid the app

Each lever below targets one of these.

2. The levers, strongest first for teens
① Make it part of the class (strongest)

Nobody noticing is the biggest cause of drop-off, so make skipping visible.

Homework lives in the app. The teacher assigns "this week's practice" directly.
The teacher uses the results in class: "70% of you got question 3 wrong, let's go over it." Students see their practice matters.
Weekly shout-out: the teacher names the top streaks or most improved. That's 30 seconds of the teacher's time, and the effect is huge.
Teacher dashboard flags inactive students, so the teacher can say "Kasun, you haven't practised this week" in person.

This is why the teacher channel matters so much: the teacher provides the external structure teens need.

② Social pressure and belonging

Teens care more about peers than marks.

Friend streaks: two friends keep a shared streak; breaking it lets your friend down.
Class leagues: weekly XP league inside the class (not national), with a reset every Monday so everyone gets a fresh chance.
Class vs class challenges: "Your class vs the Saturday batch this week."
Duels: 5-question speed duels with a friend. QuizUp Sri Lanka's quick rise shows how much SL students like competitive quizzing.
③ Shrink the daily ask

Don't ask for 15–20 minutes. Ask for 5.

Minimum day: 10 questions, about 5 minutes, keeps the streak alive.
"Keep going?" after that. Many students continue once they've started; starting is the hard part.
Show "5 min", not "20 cards due". Time feels smaller than a count.
④ Fast, visible progress
Start easy: calibrate early sessions so students get about 80% correct. Early wins build confidence, which matters especially for Bio students who fear physics.
The readiness score moves every session: "Electricity: 42% → 47%."
Mastery moments: "You mastered Ohm's law 🎉", and later "You solved a question that 60% of students get wrong."
Before vs after: "Week 1 you got this wrong. Today you got 3 like it right."
⑤ Make it relevant now
Today's queue follows the class: practise what the teacher taught this week.
Term test mode: "Your school test is in 12 days. Here's your plan."
Exam countdown and past-paper tags: "This question type appeared in 2019, 2021 and 2023."
Their goal on screen: set at onboarding ("Medicine / Engineering / Pass A/L"). "Every session is a step toward Medicine."
⑥ Triggers that actually reach teens
Anchor to an existing routine at onboarding: "When will you practise? After tuition / on the bus / before bed."
Notifications in the teacher's voice at that time: "[Teacher]: 5 questions before bed? Your streak is at 6 🔥"
WhatsApp nudges (opt-in): much more effective than push notifications in SL, which teens ignore.
Friend activity: "Nimal just finished today's practice." Light FOMO.
⑦ Make coming back painless

The day after a missed day is where you lose most students.

Streak freeze tokens (earned, plus a few free).
No backlog guilt: a "welcome back, 5-minute catch-up" session, never "300 cards due".
No shame wording: "Good to see you! Let's start small" instead of "You missed 4 days".
Re-engagement sequence: gentle nudge on day 2; a friend or teacher nudge on day 4; a "your class is ahead" message on day 7; then the teacher flag on their dashboard.
⑧ Autonomy

Teens resist being controlled.

Let them choose: learn or practise, topic order, duels vs solo.
Make the daily queue a recommendation, not an order.
Personal touches: avatar, nickname, class badge.
⑨ The fun layer (keep it as sugar)
Variable rewards (bonus XP days, surprise badges), speed rounds, occasional mini-challenges.
Useful for variety, but it won't carry retention alone. Levers ①–⑦ do the heavy lifting.
3. The first 7 days (where retention is won or lost)
Day	Goal	Experience
Day 0 (install)	First win in under 5 minutes	Join class code, then pick goal and routine time, then a 5-question easy diagnostic, then "You're already strong in X!" and a first readiness score
Day 1	Habit trigger works	Notification at their chosen time; 5-minute session; streak 🔥 2
Day 2	Social hook	Prompt: "Add a friend for a friend streak" plus a first duel
Day 3	Felt progress (the danger day)	Readiness up visibly; a "mastered your first concept" moment
Day 4–5	Class connection	Teacher assigns this week's practice and mentions it in class
Day 6	Recovery safety net	If they missed a day: streak freeze used automatically plus a "welcome back" session
Day 7	Weekly payoff	League results, a week summary ("5 days, +12% in Mechanics"), a parent effort update if shared

Define your "aha moment" from pilot data. Find which early behaviour predicts staying, for example "3 sessions in the first 5 days" or "added a friend". Then redesign onboarding to push every student to that behaviour.

4. Catching drop-off early

No session 24h  → gentle push at routine time
No session 48h  → WhatsApp nudge (if opted in) / friend nudge
No session 4d   → "welcome back" offer: 3-minute session
No session 7d   → teacher dashboard flag → teacher nudges in class

The teacher flag is your last line of defence, and the most powerful one.

5. Countering "it doesn't work"
Set expectations at purchase: "Results show after 3–4 weeks of 5+ days a week."
Make effort visible to parents and teachers: if the student stopped using it, the weekly report shows that. It becomes a usage issue, not a product failure.
Tie the money-back guarantee to usage: "Practise at least 20 days in 8 weeks. If your mock score doesn't improve, full refund." This is fair, it stops the "used it twice, it didn't work" story, and it pushes students to use the app.
Consider a 7-day free trial before the first payment: students who don't engage never pay, so they never feel cheated.
6. Be realistic
Some students won't stick, whatever you build. Your core segment is the motivated-but-struggling student (e.g., a Bio student afraid of physics), not the completely uninterested one.
Benchmarks: education apps commonly lose a large share of new users within the first week. Getting D7 to 40% or more in the pilot would be a strong result. Measure D1, D3, D7 and D30 separately.
Ethics for minors: use streaks and leagues, but no manipulative dark patterns (fake urgency, shame, endless loops). Add a healthy daily cap and "done for today 🎉" endings. Parents and teachers will trust you more for it.
Build priority for the pilot
5-minute minimum day plus streak with freeze plus no-guilt catch-up
Teacher assignments plus inactive-student flag plus results usable in class
Readiness score that moves every session plus mastery moments
Routine-time notifications in the teacher's voice
Friend streaks and class leagues
Duels and the fun layer

Items 1–4 alone will likely carry most of your retention.


9 hours ago
You said: most of these ideas are good.

most of these ideas are good. except:

① Make it part of the class (strongest) - can't do. we can't force every student to enroll to this app.
push notifications - i don't like it. annoying
Notifications in the teacher’s voice - i think it's silly

next i wanna brainstorm about progress. skill graph / tree. skills are the small part of learning of the syllabus. some are connected, dependable, sequential, some are not.

6 hours ago

Claude responded: Noted on all three.

Noted on all three. Without class enrollment or push notifications, retention leans on the opt-in levers: friend streaks, class leagues for students who do join, the 5-minute day, visible progress, and no-guilt comebacks. One quiet option is an Android home-screen widget showing the streak and today's 5 questions. It's passive, so it's not annoying.

That also makes progress the right next topic, because visible progress is the strongest retention lever you have left.

1. The structure: a typed graph, not a tree

A strict tree misrepresents physics, because many skills have multiple parents. A typed graph (with a hierarchy for navigation) fits better:


Hierarchy (for navigation & display):
Subject → Unit → Topic → Skill (KC)

Graph edges (for learning logic):
Skill ──requires──▶ Skill      (hard prerequisite: can't do B without A)
Skill ──helps────▶ Skill       (soft: A makes B easier, not mandatory)
Skill ──encompasses▶ Skill     (doing B exercises A implicitly)
Skill ◀─confusable─▶ Skill     (often mixed up: momentum vs energy)
Skill ──uses-math──▶ MathSkill (cross-domain: vectors, trig, calculus, graphs)
Edge type	Used for
requires	Diagnosis (failing B → check A), recommended order, soft gating
helps	Recommendations ("learn A first to make this easier")
encompasses	Implicit review: practising B counts as partial review of A (see §4)
confusable	Interleaving: deliberately mix these in sessions; method-recognition (L3) cards
uses-math	Maths remediation, which matters a lot for Bio students

Rules:

requires edges must form a DAG (no cycles). Validate this automatically in CI.
Not every skill needs a prerequisite. Isolated skills (e.g., definitions in Matter & Radiation) are fine.
2. Node design: what a skill is

Granularity rule of thumb: one skill should be

testable by 5–20 item variants,
masterable in 1–3 short sessions,
a single point of failure (if a student fails it, you know exactly what to fix).

That suggests roughly 150–300 skills for physics across about 10–11 syllabus units (verify against the current NIE syllabus).

Node attributes:


Skill {
  id: "mech.circ.vertical-tension"        // stable forever
  unit, topic
  syllabus_ref: competency level 2.6       // map to NIE competency levels
  type: recall | conceptual | procedural | method-selection
  exam_weight: 0.0–1.0                     // from 10-yr past-paper tagging
  difficulty: est. → calibrated from data
  est_minutes: 20
  math_deps: [trig.resolve, algebra.rearrange]
  names: { si: "...", ta: "...", en: "..." }
}

Free skeleton: the NIE syllabus is organised as competencies and competency levels. Use those as the topic layer and break each competency level into 2–6 skills. You get syllabus alignment automatically, and teachers recognise the structure.

3. Mastery states: progress isn't one number

The common mistake is showing progress as a bar that only goes up. With memory, mastery decays. Track two dimensions per skill:

Dimension	Meaning	Source
Mastery (θ)	Can they do it?	KC model (Elo/IRT-style) from problem attempts
Retrievability (R)	Can they do it right now, or has it faded?	FSRS-style decay since last successful practice

States shown to students:


⚪ Not started → 🔵 Learning → 🟡 Practising → 🟢 Mastered
                                                  │ (time passes, R drops)
                                                  ▼
                                            🟠 Fading → review restores 🟢

The "fading" state is a strong retention hook: "3 skills are fading, 4 minutes to refresh them." It's honest, specific, and gives a reason to open the app without nagging.

4. Implicit review: the key algorithm idea

Problem: with 250 skills, reviewing each separately creates a huge daily load. That's the backlog that kills Anki users.

Solution: use encompasses edges. When a student solves a vertical-circle problem, they also exercised resolving forces, centripetal force and energy conservation. Give partial review credit to those encompassed skills and push their next review date forward.

This is the same idea as Math Academy's "Fractional Implicit Repetition" (FIRe): credit flows down the graph with weights such as 0.3–0.7 per edge.
Effect: advanced practice keeps foundations fresh automatically, so daily review load drops a lot.
Combined with the 5-minute day, this keeps sessions short as the syllabus grows.
5. Moving evidence through the graph
Event	Update
Success on skill B	B mastery ↑; prerequisites get small implicit-review credit (FIRe)
Failure on B	B mastery ↓; don't penalise prerequisites automatically. Schedule a quick diagnostic check on the most likely weak prerequisite.
Prerequisite A confirmed weak	Remediation goes to A first; B is paused ("let's fix the foundation")
Repeated confusion between A and C	Raise interleaving frequency for the confusable pair; more L3 method cards

Adaptive placement test: use the graph for a smart diagnostic at onboarding.

If a student solves an advanced skill, infer the prerequisites are likely known and skip them.
If they fail it, probe downward.
This is Knowledge Space Theory (the basis of ALEKS). Roughly 15–25 questions can place a student across a whole unit instead of testing every skill.
6. Ordering: graph plus teacher sequence plus exam weight

Students follow their teacher's order, not the graph's ideal order. Recommended next skills come from:


priority(skill) =
    in_current_unit (teacher/student selected)   ← strongest
  × prerequisites_ready (soft gate)
  × exam_weight
  × (1 − mastery) or fading urgency

Soft gating, never hard locks:

Students can open any skill.
If prerequisites are weak, show "Recommended first: Resolving forces (5 min)" instead of a lock.
Teens resist being blocked, and teachers teach in different orders.
7. Readiness score: one number that means something

readiness = Σ_skills  exam_weight_i × mastery_i × retrievability_i
            ─────────────────────────────────────────────────────
                         Σ_skills exam_weight_i
Exam weight comes from tagging 10 years of past-paper questions to skills, which your content pipeline already does. High-frequency skills count more.
Show it per unit and overall. Unit scores move faster, which helps the "felt progress" problem.
Predicted marks (e.g., "~32/50 MCQ") are powerful but must be calibrated against real mock results first. Hold them back until the pilot data validates them; a wrong prediction kills trust.
8. Showing it to students: options
Option	Pros	Cons	Verdict
Unit rings (a progress ring per unit, tap to drill down)	Simple, works on phones, instant overview	Less exciting	✅ Main view
Skill chips per topic (coloured by state)	Shows fading or weak skills clearly	Can get dense	✅ Drill-down view
Local graph (selected skill plus its prerequisites and dependents)	Shows why a skill matters and what it unlocks	—	✅ Skill detail view
Full constellation map (all ~250 nodes)	Looks impressive	Unreadable on a phone; looks like noise	⚠️ Optional "explorer"; also good for marketing screenshots
Game-style skill tree	Familiar from games	Forces a tree structure physics doesn't have; implies hard locks	❌
Territory / fog-of-war map (units as regions revealed as you learn)	Fun, motivating	Extra design work	🔮 v2 idea

Full graph visualisations tempt engineers but fail users. Show the local neighbourhood (focus plus context): one skill, two levels of prerequisites, one level of what it unlocks.

Progress moments to design:

"You unlocked 3 new skills by mastering Ohm's law"
"Mechanics: 0 fading skills 💪"
"This week: 4 skills mastered, 2 rescued from fading"
Weekly "map growth" snapshot (before vs after)
9. Teacher view
View	Insight
Class heatmap (students × units or skills)	Who is weak where
Bottleneck skills	Skills the class fails and their weak prerequisites ("40% fail circular motion because of resolving forces")
Fading alerts	"Class retention of Electrostatics is dropping; revise before the term test"

The bottleneck analysis is the most valuable feature for teachers. It turns raw scores into a teaching action.

10. Building and maintaining the graph

NIE syllabus + teacher guide (competencies/levels)
   → AI drafts skills + typed edges + math deps
   → automated checks: DAG validity, orphan skills, granularity heuristics
   → wife reviews per unit (visual graph editor in the admin UI)
   → past-paper questions tagged → exam weights
   → pilot data refines:
        • calibrated difficulty per skill
        • data-suggested edges (failing A strongly predicts failing B → missing edge?)
        • encompassing weights tuned from observed review outcomes

Versioning: skill IDs are permanent. When the 2031 syllabus arrives, map old skills to new ones, so student history carries over.

11. Cross-subject reuse (pays off later)
A shared maths skill layer (vectors, trigonometry, calculus, graphs, rearranging equations) is used by physics and chemistry now, and becomes the base of Combined Maths later.
A Bio student failing physics because of trigonometry gets maths remediation inside the physics app. That's a real differentiator for your ideal customer.
Chemistry later adds its own graph plus links (e.g., gas laws and thermal physics shared with physics).

A good next step is a sample skill graph for one unit (say Mechanics: circular motion and energy), with skills, typed edges, exam weights and the JSON format. That's concrete enough to start reviewing with your wife and to start the database schema.


5 hours ago
You said: --- let's plan some ui's with all of these ideas and concepts combine.

--- let's plan some ui's with all of these ideas and concepts combine. including these scenarios.

onbording + first day
second day
day after a missed day
day after a missed few days
after 1 week
after 1 month
before next payment day
...etc

--- design only app UIs (ideas) and what's app messages (to students, parents, teachers)
--- we can design the dashboards later

5 hours ago

Claude responded: I'll check what design tools are available, then lay out the screens and messages for each scenario.

I'll check what design tools are available, then lay out the screens and messages for each scenario.

Created 17 files, used a tool

Created 17 files, used a tool

A

Used artifacts

Published artifact: /code/artifact/8663e5e8-8080-4e38-a1bc-a487744ad18f

A

Used artifacts

Published artifact: /code/artifact/8663e5e8-8080-4e38-a1bc-a487744ad18f

A

Used artifacts

Published artifact: /code/artifact/8663e5e8-8080-4e38-a1bc-a487744ad18f

A

Used artifacts

Published artifact: /code/artifact/8663e5e8-8080-4e38-a1bc-a487744ad18f

A

Used artifacts

Published artifact: /code/artifact/8663e5e8-8080-4e38-a1bc-a487744ad18f

A

Used artifacts

Published artifact: /code/artifact/8663e5e8-8080-4e38-a1bc-a487744ad18f

A

Used artifacts

Published artifact: /code/artifact/8663e5e8-8080-4e38-a1bc-a487744ad18f

A

Used artifacts

Published artifact: /code/artifact/8663e5e8-8080-4e38-a1bc-a487744ad18f

A

Used artifacts

Published artifact: /code/artifact/8663e5e8-8080-4e38-a1bc-a487744ad18f

A

Used artifacts

Published artifact: /code/artifact/8663e5e8-8080-4e38-a1bc-a487744ad18f

A

Used artifacts

Published artifact: /code/artifact/8663e5e8-8080-4e38-a1bc-a487744ad18f

A

Used artifacts

Published artifact: /code/artifact/8663e5e8-8080-4e38-a1bc-a487744ad18f

A

Used artifacts

Published artifact: /code/artifact/8663e5e8-8080-4e38-a1bc-a487744ad18f

A

Used artifacts

Published artifact: /code/artifact/8663e5e8-8080-4e38-a1bc-a487744ad18f

A

Used artifacts

Published artifact: /code/artifact/8663e5e8-8080-4e38-a1bc-a487744ad18f

A

Used artifacts

Published artifact: /code/artifact/8663e5e8-8080-4e38-a1bc-a487744ad18f

A

Used artifacts

Published artifact: /code/artifact/8663e5e8-8080-4e38-a1bc-a487744ad18f

I've put 13 app screens and 3 WhatsApp threads on a design canvas, laid out in rows by scenario, with a note beside each row giving its rules. I applied your changes: there are no push notifications or teacher-voice nudges, and nothing depends on a teacher enrolling the class.

What's on it:

Row	Screens
0 · Onboarding + day 1	Medium choice with an optional class code → goal, stream and routine time, with the WhatsApp reminder off by default → no-marks quick check with an "I haven't learned this yet" button → starting map (readiness 34%, what you're already strong in) → day-1 home with a done state and the home-screen widget offer
1 · Daily loop	Day-2 home (the 5-minute card shows the recall/method/problem mix, plus a friend-streak invite) → "which method?" question with a diagram and a 60-second note link → session done (number moved, skill mastered and what it unlocks, equal "Done for today" and "5 more")
2 · Missed days	1 day: the freeze is applied automatically and today is the normal 5 minutes. A few days: "Good to see you", a 3-minute refresh of only the fading skills, progress kept, no backlog count.
3 · Milestones	Week 1: effort first, then progress, then sending the week to a parent with the student choosing what they see. Month 1: weekly readiness trend, unit rings, before vs now, where your marks leak (from error tags). Renewal: recap before price, monthly vs until-exam, "Ask a parent on WhatsApp".
4 · WhatsApp	Student: welcome, 2-day-skip nudge, friend invite, weekly summary, term-test plan. Parent: consent, a weekly report in green and in amber, the renewal request the student sends, the payment receipt. Teacher: welcome with class code, Sunday digest with the bottleneck skill, quiet students, term-test paper builder.

The screens are roughly linked, so you can tap through them in Play mode.

Assumptions I made:

I used UniKey (your project name) as the app name and Kasun as the sample student.
The copy is in English. I'd write the final Sinhala and Tamil versions with your wife rather than translate them literally.
The until-exam price is a placeholder, [EXAM PRICE].
Real WhatsApp messages can use emoji. The mockups use coloured dots instead.

Two design choices to react to:

The amber "quieter week" message to parents. It creates accountability, but some students may see it as reporting on them. One option is to send it only at the "effort + progress" sharing level, and never at "effort only".
Equal weight for "Done for today" and "5 more". This respects autonomy. Pilot data will show whether making "5 more" the primary button raises session length without hurting retention.

Screens I left for a next pass: the learn/notes screen with a simulation, the step-by-step problem player, the progress map drill-down, the friends and league screen, and a comeback after 2+ weeks.


5 hours ago
You said: let's try to minimalist the design-system (not too much).

let's try to minimalist the design-system (not too much). also use calm colors. less detraction. current design system is soo typical. try to be modern, beautiful, abstract. some transparent, gradient blob animation touch. maybe this will help - https://github.com/VoltAgent/awesome-claude-design

5 hours ago

Claude responded: Now aligning the three WhatsApp boards with the new type and brand mark.
Created 13 files, read a page

Created 13 files, read a page

A

Used artifacts

Published artifact: /code/artifact/8663e5e8-8080-4e38-a1bc-a487744ad18f

A

Used artifacts

Published artifact: /code/artifact/8663e5e8-8080-4e38-a1bc-a487744ad18f

A

Used artifacts

Published artifact: /code/artifact/8663e5e8-8080-4e38-a1bc-a487744ad18f

A

Used artifacts

Published artifact: /code/artifact/8663e5e8-8080-4e38-a1bc-a487744ad18f

A

Used artifacts

Published artifact: /code/artifact/8663e5e8-8080-4e38-a1bc-a487744ad18f

A

Used artifacts

Published artifact: /code/artifact/8663e5e8-8080-4e38-a1bc-a487744ad18f

A

Used artifacts

Published artifact: /code/artifact/8663e5e8-8080-4e38-a1bc-a487744ad18f

A

Used artifacts

Published artifact: /code/artifact/8663e5e8-8080-4e38-a1bc-a487744ad18f

A

Used artifacts

Published artifact: /code/artifact/8663e5e8-8080-4e38-a1bc-a487744ad18f

A

Used artifacts

Published artifact: /code/artifact/8663e5e8-8080-4e38-a1bc-a487744ad18f

A

Used artifacts

Published artifact: /code/artifact/8663e5e8-8080-4e38-a1bc-a487744ad18f

A

Used artifacts

Published artifact: /code/artifact/8663e5e8-8080-4e38-a1bc-a487744ad18f

A

Used artifacts

Published artifact: /code/artifact/8663e5e8-8080-4e38-a1bc-a487744ad18f

Now aligning the three WhatsApp boards with the new type and brand mark.

Ran a command

Ran a command

A

Used artifacts

Published artifact: /code/artifact/8663e5e8-8080-4e38-a1bc-a487744ad18f

All 16 boards on the canvas now use a calmer "mist" design system. The WhatsApp threads only picked up the new font and brand mark, since their layout copies WhatsApp's own look.

The new system

Token	Value
Ground	Off-white mist 
#F3F4F1
Ink	
#1C2321, with muted text 
#5E6763
Accents	Sage, lavender and peach. They appear only in the background blobs, progress gradients and status tints, never as loud fills.
Surfaces	Frosted glass: 50% white, 18–24px blur, a hairline white border and large radii (20–32px).
Buttons	Ink pills for the main action, outlined pills for secondary ones.
Type	Geist. Headings at weight 400 with tight tracking; big numbers (readiness, streak, 5/7) at weight 300.
Motion	Two or three blurred gradient blobs per screen drift slowly over 18–26s. On the session-done screen, the orb behind the streak number slowly morphs. Motion is switched off when the phone asks for reduced motion.

What changed besides the colours:

Each screen has fewer elements. Most coloured cards are now plain text rows with thin dividers.
Choices became segmented pills.
The bottom nav is a floating glass pill.
Stats are shown as large light numbers instead of tiles.

The link you shared is a collection of brand design files. It has no glassmorphism entry, so I took the restraint from the Linear and Notion style entries and the soft organic gradients from the Clay entry.

Two things to check on a real phone:

Blur. backdrop-filter blur can stutter on cheap Android phones. In the app, swap it for a solid 85% white surface on low-end devices.
Hierarchy. The near-monochrome screens are calm, but the main action relies on the single dark pill. If students miss it in testing, the fix is a soft sage tint on the main card, not a bright colour.

4 hours ago
You said: much better.

much better. let's add more scenarios and pages. for a full review

4 hours ago

Claude responded: Adding 11 more screens in four new rows: learning (note + live simulation, wrong-answer feedback, step-by-step problem, mistake notebook), progress drill-down …

Adding 11 more screens in four new rows: learning (note + live simulation, wrong-answer feedback, step-by-step problem, mistake notebook), progress drill-down (unit map, skill detail), social (league + friend streaks, duel), and exam/account (term-test mode, free-tier limit, settings).

Created 4 files

Created 4 files

A

Used artifacts

Published artifact: /code/artifact/8663e5e8-8080-4e38-a1bc-a487744ad18f

A

Used artifacts

Published artifact: /code/artifact/8663e5e8-8080-4e38-a1bc-a487744ad18f


4 hours ago
You said: also make a duplicate page with sinhala language (same design)

also make a duplicate page with sinhala language (same design)

4 hours ago

Claude responded: I'll finish the remaining new English screens first, then build a Sinhala page that duplicates every board with the same design.

I'll finish the remaining new English screens first, then build a Sinhala page that duplicates every board with the same design.

Created 36 files, edited a file

Created 36 files, edited a file

A

Used artifacts

Published artifact: /code/artifact/8663e5e8-8080-4e38-a1bc-a487744ad18f

A

Used artifacts

Published artifact: /code/artifact/8663e5e8-8080-4e38-a1bc-a487744ad18f

A

Used artifacts

Published artifact: /code/artifact/8663e5e8-8080-4e38-a1bc-a487744ad18f

A

Used artifacts

Published artifact: /code/artifact/8663e5e8-8080-4e38-a1bc-a487744ad18f

A

Used artifacts

Published artifact: /code/artifact/8663e5e8-8080-4e38-a1bc-a487744ad18f

A

Used artifacts

Published artifact: /code/artifact/8663e5e8-8080-4e38-a1bc-a487744ad18f

A

Used artifacts

Published artifact: /code/artifact/8663e5e8-8080-4e38-a1bc-a487744ad18f

A

Used artifacts

Published artifact: /code/artifact/8663e5e8-8080-4e38-a1bc-a487744ad18f

A

Used artifacts

Published artifact: /code/artifact/8663e5e8-8080-4e38-a1bc-a487744ad18f

A

Used artifacts

Published artifact: /code/artifact/8663e5e8-8080-4e38-a1bc-a487744ad18f

A

Used artifacts

Published artifact: /code/artifact/8663e5e8-8080-4e38-a1bc-a487744ad18f

A

Used artifacts

Published artifact: /code/artifact/8663e5e8-8080-4e38-a1bc-a487744ad18f

A

Used artifacts

Published artifact: /code/artifact/8663e5e8-8080-4e38-a1bc-a487744ad18f

A

Used artifacts

Published artifact: /code/artifact/8663e5e8-8080-4e38-a1bc-a487744ad18f

A

Used artifacts

Published artifact: /code/artifact/8663e5e8-8080-4e38-a1bc-a487744ad18f

A

Used artifacts

Published artifact: /code/artifact/8663e5e8-8080-4e38-a1bc-a487744ad18f

A

Used artifacts

Published artifact: /code/artifact/8663e5e8-8080-4e38-a1bc-a487744ad18f

A

Used artifacts

Published artifact: /code/artifact/8663e5e8-8080-4e38-a1bc-a487744ad18f

A

Used artifacts

Published artifact: /code/artifact/8663e5e8-8080-4e38-a1bc-a487744ad18f

A

Used artifacts

Published artifact: /code/artifact/8663e5e8-8080-4e38-a1bc-a487744ad18f

A

Used artifacts

Published artifact: /code/artifact/8663e5e8-8080-4e38-a1bc-a487744ad18f

A

Used artifacts

Published artifact: /code/artifact/8663e5e8-8080-4e38-a1bc-a487744ad18f

A

Used artifacts

Published artifact: /code/artifact/8663e5e8-8080-4e38-a1bc-a487744ad18f

A

Used artifacts

Published artifact: /code/artifact/8663e5e8-8080-4e38-a1bc-a487744ad18f

A

Used artifacts

Published artifact: /code/artifact/8663e5e8-8080-4e38-a1bc-a487744ad18f

A

Used artifacts

Published artifact: /code/artifact/8663e5e8-8080-4e38-a1bc-a487744ad18f

A

Used artifacts

Published artifact: /code/artifact/8663e5e8-8080-4e38-a1bc-a487744ad18f

A

Used artifacts

Published artifact: /code/artifact/8663e5e8-8080-4e38-a1bc-a487744ad18f

A

Used artifacts

Published artifact: /code/artifact/8663e5e8-8080-4e38-a1bc-a487744ad18f

A

Used artifacts

Published artifact: /code/artifact/8663e5e8-8080-4e38-a1bc-a487744ad18f

A

Used artifacts

Published artifact: /code/artifact/8663e5e8-8080-4e38-a1bc-a487744ad18f

A

Used artifacts

Published artifact: /code/artifact/8663e5e8-8080-4e38-a1bc-a487744ad18f

A

Used artifacts

Published artifact: /code/artifact/8663e5e8-8080-4e38-a1bc-a487744ad18f

A

Used artifacts

Published artifact: /code/artifact/8663e5e8-8080-4e38-a1bc-a487744ad18f

A

Used artifacts

Published artifact: /code/artifact/8663e5e8-8080-4e38-a1bc-a487744ad18f

A

Used artifacts

Published artifact: /code/artifact/8663e5e8-8080-4e38-a1bc-a487744ad18f

The canvas now has two pages, each with 27 screens.

English page: 11 new screens in four rows

Row	Screens
5 · Learning	Micro-note with a live circular-motion simulation. You can drag the speed slider and try the "predict first" question in Play mode. Also: wrong-answer feedback that names the trap (radius vs diameter) and links the prerequisite skill, a step-by-step problem with a hint ladder, and a mistake notebook with your error pattern and a redo button.
6 · Progress	Mechanics unit map (topics as rows, skills as dots in 4 states). Skill detail showing only what it needs and what it opens, plus how often it appeared in past papers.
7 · Social	Friend streaks, a class league that resets Monday, and a calm duel result screen.
8 · Exam + account	School test mode (12-day plan with a mock on day 10), the free-limit screen where "See you tomorrow" is a real option, and settings for parent sharing, WhatsApp, nickname, and data export or delete.

සිංහල page: every board duplicated in the same layout and design, with Sinhala copy. Text is in Noto Sans Sinhala, while numbers stay in Geist. Line heights are taller and headings slightly smaller, because Sinhala runs longer and needs the space. Links work within the Sinhala set in Play mode.

Please review the Sinhala with your wife before using it. It's a first draft, and the physics terms need checking against the NIE textbook glossary: කේන්ද්‍රාභිසාරී බලය, බල විභේදනය, සූර්ණ, ආනත මාර්ග, රේඛීය චලිතය. I also mixed in English words students actually say, like "ටියුෂන් පන්තිය" and "Physics ඇප් එක" in the student-to-parent message. She can judge whether that tone is right.

Gaps I'd still flag:

A Tamil page.
A comeback screen for after 2+ weeks away (right now it reuses the few-days screen).
An offline / no-data state.
The payment success screen inside the app.

4 hours ago
You said: for the sinhala design.

for the sinhala design. only the content and content subjects & topics (because sinhala medium student are familer with sinhala names for subjects & topics) has to be sinhala. everything else can be english. (they are already know lil bit of english. - and it's much easier for us too)

5 minutes ago

Claude responded: I'll rebuild the Sinhala page from the English screens.

I'll rebuild the Sinhala page from the English screens. Lessons, questions, answers, explanations, and subject, topic and skill names will be in Sinhala; everything else stays in English.

Ran a command

Ran a command

A

Used artifacts

Published artifact: /code/artifact/8663e5e8-8080-4e38-a1bc-a487744ad18f

I rebuilt the 27 screens on the සිංහල page from the English ones, so the layout and design match exactly.

Now in Sinhala:

Learning content: the note text, quiz and problem questions, answer options, the solution steps in the step player, and the feedback and explanations after an answer.
Subject, topic and skill names everywhere they appear. For example "යාන්ත්‍ර විද්‍යාව 34 → 37", "Continue: වෘත්ත චලිතය", "Opens: සම්බන්ධිත වස්තු, කප්පි", and the unit rings, skill dots, duel topics and test plan chips.

English: all the app's interface text, such as buttons, labels, navigation, settings, streaks, the league, pricing, and error categories like "Units" and "Wrong method".

On the canvas, the Sinhala boards now have English titles (for example "5.1 Micro-note + live simulation · SI"), and the note on that page states the rule.

The WhatsApp messages to parents are now mostly English, apart from topic names. That follows your rule, but many parents of Sinhala-medium students may not read English comfortably. I'd suggest an exception: send parent messages in the parent's language, chosen at the consent step. Students and teachers can stay English.

The physics terms still need your wife's check against the NIE textbook glossary before anything goes to students.


3 minutes ago
Ask Claude your own question


Tab Context:
- Executed on tabId: seed
- Available tabs:
  • tabId seed: "Claude" ("https://claude.ai/share/bc695477-94b5-41b0-9bca-6f80f03c7093")
