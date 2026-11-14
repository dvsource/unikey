import type { PersonaSpec } from "./student.js";

const average: PersonaSpec["traits"] = {
  prior: 0.4, learn: 1, forget: 1, calc: 0, concept: 0,
  misconceptions: {}, patienceWrongs: 4, patienceSessions: 3, skipBelow: 0.3, fearedSections: [],
  dontKnowBelow: 0.3, stamina: 14, baseMs: 9000, guesser: false, extendChance: 0.3,
  habit: "daily", classPace: null,
};

const P = (id: string, name: string, sheet: string, o: Partial<PersonaSpec["traits"]>): PersonaSpec =>
  ({ id, name, sheet, traits: { ...average, ...o } });

export const personas: PersonaSpec[] = [
  P("average-noclass", "Average, no class",
    "I am an ordinary student, neither the best nor the worst in my batch. I study by myself because I do not go to any tuition class. I do my work most evenings after dinner. When things get confusing I just keep going and sort it out later.", {}),
  P("average-fastclass", "Average, fast class",
    "I am an ordinary student and I go to a tuition class that rushes through the syllabus. Every few days the teacher moves to a new topic, so I am always a bit behind. I try to practise every evening to keep up. I am fine with most things but I do not retain it forever.", { classPace: 4 }),
  P("strong", "Strong student",
    "I am one of the top students in my school and I enjoy physics. I pick up new ideas quickly and I seldom forget them. I like long sessions and I usually want to do some extra questions after I finish. Mistakes do not worry me much.", { prior: 0.8, learn: 1.5, forget: 0.5, calc: 0.1, concept: 0.1, patienceWrongs: 6, patienceSessions: 5, skipBelow: 0.1, stamina: 25, extendChance: 0.7 }),
  P("weak-stubborn", "Weak but stubborn",
    "Physics has never come easily to me and I know I am behind. I learn slowly and forget fast. But I do not give up, I keep coming back even when I get many wrong in a row. My teacher says I just need time.", { prior: 0.15, learn: 0.7, forget: 1.2, calc: -0.1, concept: -0.1, patienceWrongs: 8, patienceSessions: 8, skipBelow: 0.15 }),
  P("weak-impatient", "Weak and impatient",
    "I am behind in physics and it makes me annoyed. When I get a couple of questions wrong I want to throw my phone down. I get tired quickly and I do not have much patience for it. If the app feels like a waste of time I will stop using it.", { prior: 0.15, learn: 0.7, forget: 1.2, calc: -0.1, concept: -0.1, patienceWrongs: 2, patienceSessions: 2, skipBelow: 0.4, stamina: 9 }),
  P("smart-impatient", "Smart but impatient",
    "I am quick and I understand things fast, but I get fed up quickly. If a few questions go wrong or the session drags on, I am done. I only study on some days, usually every other day. I do not have patience for a tool that wastes my time.", { prior: 0.7, learn: 1.5, forget: 0.7, patienceWrongs: 2, patienceSessions: 2, skipBelow: 0.4, stamina: 10, habit: "alternate" }),
  P("memory-good-calc-weak", "Good memory, weak calculations",
    "I remember definitions and explanations very well, even weeks later. The ideas make sense to me. But when it comes to working out numbers I make silly mistakes and get stuck. Calculations are the part I dread.", { prior: 0.5, forget: 0.3, calc: -0.3, concept: 0.2 }),
  P("calc-strong-memory-poor", "Strong calculations, poor memory",
    "I am good at working through numerical problems once I know the formula. The trouble is I forget things quickly, so last week's lesson is often gone. I need to see things again and again. Theory questions are where I lose marks.", { prior: 0.5, forget: 2.5, calc: 0.25, concept: -0.1 }),
  P("confident-misconceptions", "Confident with misconceptions",
    "I always feel sure about my answers and I almost never say I do not know. The thing is, I have some wrong ideas stuck in my head from the past and I do not notice them. I answer quickly and with confidence even when I am wrong. I only change my mind when I see the correct answer.", { prior: 0.5, patienceWrongs: 5, patienceSessions: 4, skipBelow: 0.05, stamina: 16, dontKnowBelow: 0, misconceptions: "auto" as const }),
  P("underconfident-skipper", "Underconfident skipper",
    "I actually know more than I think, but I never trust myself. When a question looks hard I would rather skip it or say I do not know. I get nervous about being wrong in front of anyone, even an app. I need a lot of encouragement.", { prior: 0.65, patienceWrongs: 3, skipBelow: 0.75, stamina: 12, dontKnowBelow: 0.6 }),
  P("one-feared-section", "One feared section",
    "I am fine with most of physics. There is one part of the syllabus that scares me and I always have been weak at it, so I avoid it whenever I can. The other parts I handle normally. I study at my usual time every day.", { prior: 0.5, fearedSections: "auto" as const, fearedPrior: 0.1 }),
  P("steady-five-min", "Steady five-minute studier",
    "I only have a few minutes each day because of school and other classes. I open the app, do a short round and leave. I do it every single day without fail. I never stay long but I am regular.", { patienceSessions: 4, stamina: 12, habit: "five-min" }),
  P("binge-quit", "Binger who disappears",
    "When I start something new I go crazy with it and study for hours at a stretch. Then something else takes over and I vanish for weeks. After some time I feel guilty and come back. I learn fast when I am in the mood but I forget a lot while I am away.", { learn: 1.2, forget: 1.5, patienceWrongs: 3, patienceSessions: 2, stamina: 30, habit: "binge-vanish", extendChance: 0.9 }),
  P("comeback-10", "Comes back after a break",
    "I study regularly but sometimes life gets in the way, like exams in another subject or a family trip. I can disappear for a long stretch and then return. When I come back I have forgotten quite a lot. I am a bit embarrassed but I start again.", { prior: 0.45, forget: 1.3, habit: "gap10" }),
  P("slow-reader", "Slow reader",
    "I read very carefully and slowly because English is not my first language in science. I take a long time on each question, even the simple ones. I do get most of them right if I have time. I get tired sooner because everything takes me so long.", { prior: 0.45, stamina: 10, baseMs: 22000 }),
  P("fast-guesser", "Fast guesser",
    "I rush through questions without reading them properly. I just tap an option quickly and move on to see what is next. I never say I do not know, I would rather guess. I do not remember much because I am not really paying attention.", { prior: 0.3, learn: 0.5, patienceWrongs: 6, patienceSessions: 5, skipBelow: 0.1, stamina: 18, baseMs: 3000, guesser: true }),
];
