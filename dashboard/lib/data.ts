// Fake class for the P0 prototype. Everything here is made up except the skill
// graph (data/skills.json, from content/skills/mechanics). Deterministic: the
// same seed gives every teacher the same class.
import graph from "@/data/skills.json";

export type SkillState = "not-started" | "learning" | "practising" | "mastered" | "fading";
export type Sharing = "effort+skills" | "effort" | "awaiting-consent";

export type Skill = (typeof graph.skills)[number];
export type Topic = (typeof graph.topics)[number];

export const unitName = graph.unit;
export const topics: Topic[] = graph.topics;
export const skills: Skill[] = graph.skills;
export const tags = graph.tags as Record<string, { meaning: string; message: string }>;
export const skillById = Object.fromEntries(skills.map((s) => [s.id, s])) as Record<string, Skill>;
export const topicById = Object.fromEntries(topics.map((t) => [t.id, t])) as Record<string, Topic>;

export function skillName(id: string): string {
  const s = skillById[id];
  if (!s) return id;
  return s.si ?? s.en;
}
// Skill ids contain dots, which static hosting and Next prefetch treat as file
// extensions, so URLs use "_" instead.
export const skillHref = (id: string) => `/skill/${id.replaceAll(".", "_")}/`;
export const skillIdFromSlug = (slug: string) => slug.replaceAll("_", ".");

export function requiresOf(id: string): string[] {
  return graph.requires.filter(([from]) => from === id).map(([, to]) => to);
}
export function unlocksOf(id: string): string[] {
  return graph.requires.filter(([, to]) => to === id).map(([from]) => from);
}

// ---------- the class ----------

export const teacher = { name: "Anusha Perera", school: "Sample school, Matara", medium: "Sinhala" };
export const klass = {
  name: "Grade 13 · 2027 batch",
  code: "ANU-7K3Q",
  defaultTeachingNow: "phy.mech.2.6",
  weekOf: "Mon 1 Feb",
};

export type Student = {
  id: string;
  name: string;
  joined: string;
  sharing: Sharing;
  daysThisWeek: boolean[]; // Mon..Sun
  last28: number; // practice days in the last 4 weeks
  streak: number;
  lastSeenDays: number; // days since last session
  trend: "up" | "flat" | "down";
  readiness: number; // practice readiness, Mechanics, 0..100
  topError?: { tag: string; share: number };
};

function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const NAMES = [
  "Kasun", "Dilan", "Ishara", "Sachini", "Tharushi", "Hasini", "Pasindu", "Ravindu",
  "Chamodi", "Nethmi", "Yasiru", "Sandun", "Dinithi", "Malsha", "Kavindu", "Oshadi",
  "Lahiru", "Senuri", "Thilina", "Ruwini", "Ashen", "Hiruni", "Janith", "Nimal",
];
const QUIET = new Set(["Kasun", "Dilan", "Ishara"]);
const EFFORT_ONLY = new Set(["Hasini", "Yasiru", "Oshadi", "Ashen"]);
const AWAITING = new Set(["Nimal"]);
const INACTIVE_NOT_QUIET = new Set(["Janith", "Ruwini", "Lahiru"]); // practised 1-6 days ago, not this week
const ERROR_TAGS = ["centrifugal", "forgot-g", "unit-conversion", "sign", "no-resolve", "friction-direction", "radius-diameter"];

const r = rng(20261116);
export const students: Student[] = NAMES.map((name, i) => {
  const ability = r();
  const quiet = QUIET.has(name);
  const off = quiet || INACTIVE_NOT_QUIET.has(name);
  const p = 0.35 + ability * 0.55;
  const daysThisWeek = Array.from({ length: 7 }, (_, d) => !off && d < 6 && r() < p);
  if (!off && !daysThisWeek.some(Boolean)) daysThisWeek[1] = true;
  const thisWeek = daysThisWeek.filter(Boolean).length;
  const streak = off ? 0 : Math.max(1, Math.round(thisWeek * (0.6 + r())));
  return {
    id: name.toLowerCase(),
    name,
    joined: `${10 + (i % 5)} Jan`,
    sharing: AWAITING.has(name) ? "awaiting-consent" : EFFORT_ONLY.has(name) ? "effort" : "effort+skills",
    daysThisWeek,
    last28: quiet ? 3 + Math.round(r() * 4) : Math.round(6 + ability * 16),
    streak,
    lastSeenDays: quiet ? 7 + Math.round(r() * 5) : INACTIVE_NOT_QUIET.has(name) ? 2 + Math.round(r() * 4) : 0,
    trend: quiet ? "down" : ability > 0.6 ? "up" : ability < 0.25 ? "down" : "flat",
    readiness: Math.round(22 + ability * 50 - (quiet ? 8 : 0)),
    topError: { tag: ERROR_TAGS[Math.floor(r() * ERROR_TAGS.length)], share: 25 + Math.round(r() * 25) },
  };
});
export const studentById = Object.fromEntries(students.map((s) => [s.id, s])) as Record<string, Student>;
export const activeThisWeek = students.filter((s) => s.daysThisWeek.some(Boolean));
export const quietStudents = students.filter((s) => s.lastSeenDays >= 7);
export const classReadiness = Math.round(
  students.reduce((a, s) => a + s.readiness, 0) / students.length,
);

// Per-student skill states, for students who share skills.
const BOTTLENECK = "phy.mech.circ.friction-limit";
const ROOT = "phy.mech.circ.centripetal-force";
const STUCK = new Set(["dilan", "tharushi", "pasindu", "chamodi", "sandun", "malsha", "kavindu", "senuri", "hiruni"]);

const TOPIC_TAUGHT: Record<string, number> = {
  // how far along the class is per topic: 1 = taught long ago, 0 = not yet
  "phy.mech.2.1": 1, "phy.mech.2.2": 0.9, "phy.mech.2.3": 0.85, "phy.mech.2.4": 0.6,
  "phy.mech.2.5": 0.55, "phy.mech.2.6": 0.4, "phy.mech.2.7": 0.05, "phy.mech.2.8": 0,
};

const rs = rng(7);
export const skillStates: Record<string, Record<string, SkillState>> = {};
for (const st of students) {
  const map: Record<string, SkillState> = {};
  for (const sk of skills) {
    const taught = TOPIC_TAUGHT[sk.topic] ?? 0;
    const x = st.readiness / 100 + rs() * 0.5 - 0.25;
    let s: SkillState;
    if (rs() > taught + 0.1) s = "not-started";
    else if (x > 0.62) s = sk.topic === "phy.mech.2.1" && rs() < 0.45 ? "fading" : "mastered";
    else if (x > 0.42) s = "practising";
    else s = "learning";
    if (sk.topic === "phy.mech.2.3" && s === "mastered" && rs() < 0.3) s = "fading";
    map[sk.id] = s;
  }
  if (STUCK.has(st.id)) {
    map[BOTTLENECK] = "learning";
    if (st.id !== "senuri" && st.id !== "hiruni") map[ROOT] = "learning";
  } else if (map[BOTTLENECK] === "learning") map[BOTTLENECK] = "practising";
  skillStates[st.id] = map;
}

export function sharesSkills(s: Student) {
  return s.sharing === "effort+skills";
}

export type Dist = Record<SkillState, number>;
const emptyDist = (): Dist => ({ "not-started": 0, learning: 0, practising: 0, mastered: 0, fading: 0 });

// Class distributions count every member (anonymous class totals), DR-0039.
export function skillDist(skillId: string): Dist {
  const d = emptyDist();
  for (const st of students) d[skillStates[st.id][skillId]]++;
  return d;
}
export function topicDist(topicId: string): Dist {
  const d = emptyDist();
  const ids = skills.filter((s) => s.topic === topicId).map((s) => s.id);
  for (const st of students) for (const id of ids) d[skillStates[st.id][id]]++;
  return d;
}
export function badness(d: Dist) {
  const n = Object.values(d).reduce((a, b) => a + b, 0) || 1;
  return (d.learning + d.fading * 0.8 + d["not-started"] * 0.3) / n;
}

const re = rng(99);
export function topErrorsForSkill(skillId: string): { tag: string; students: number }[] {
  if (skillId === BOTTLENECK) return [{ tag: "centrifugal", students: 8 }, { tag: "forgot-mu", students: 5 }];
  if (skillId === ROOT) return [{ tag: "centrifugal", students: 7 }, { tag: "force-wrong-source", students: 4 }];
  const pick = Object.keys(tags);
  const n = Math.floor(re() * 3);
  return Array.from({ length: n }, () => ({ tag: pick[Math.floor(re() * pick.length)], students: 2 + Math.floor(re() * 5) }));
}

// ---------- this week's insight cards ----------

export const insights = {
  rootCause: {
    id: "root-cause-2027-02-01",
    bottleneck: BOTTLENECK,
    root: ROOT,
    stuck: STUCK.size,
    activeChecked: 7, // students whose prerequisite check confirms the root weakness (≥ 3 needed)
  },
  misconception: {
    id: "misconception-2027-02-01",
    tag: "centrifugal",
    trap: "There's an outward force pushing it out",
    students: 11,
    days: 14,
    skills: [BOTTLENECK, ROOT, "phy.mech.circ.inclined-forces"],
  },
  quiet: { id: "quiet-2027-02-01" },
  fading: [
    { topic: "phy.mech.2.1", note: "taught in Grade 12" },
    { topic: "phy.mech.2.3", note: "taught 6 weeks ago" },
  ],
};

// Week-1 preview (empty-state) data: from the onboarding quick check (A4).
export const week1 = {
  joined: 11,
  practised: 3,
  strongest: "phy.mech.2.1",
  weakest: "phy.mech.2.6",
};
