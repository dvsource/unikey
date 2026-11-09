// Copies the Mechanics skill graph fields the prototype needs into data/skills.json.
// Sinhala names come from content/skills/mechanics/graph.json; a few missing ones
// use the draft names below (unchecked against the NIE glossary).
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repo = join(here, "..", "..");
const graph = JSON.parse(readFileSync(join(repo, "content/skills/mechanics/graph.json"), "utf8"));
const tags = JSON.parse(readFileSync(join(repo, "app/assets/content/tags.json"), "utf8"));

const DRAFT_SI = {
  "phy.mech.vec.resolve": "බල විභේදනය",
  "phy.mech.circ.centripetal-force": "කේන්ද්‍රාභිසාරී බලය සපයන බලය",
};

const skills = graph.skills.map((s) => ({
  id: s.id,
  topic: s.topic,
  en: s.names.en,
  si: s.names.si ?? DRAFT_SI[s.id] ?? null,
  siDraft: !s.names.si && !!DRAFT_SI[s.id],
  mastery: s.mastery,
  examWeight: s.exam_weight,
}));
const requires = graph.edges.filter((e) => e.type === "requires").map((e) => [e.from, e.to]);
const topics = graph.topics.map((t) => ({ id: t.id, ref: t.syllabus_ref, en: t.name }));
const tagMessages = Object.fromEntries(
  Object.entries(tags).map(([k, v]) => [k, { meaning: v.meaning, message: v.message.en }]),
);

writeFileSync(
  join(here, "..", "data", "skills.json"),
  JSON.stringify({ unit: "Mechanics", topics, skills, requires, tags: tagMessages }, null, 1),
);
console.log(`wrote ${skills.length} skills, ${requires.length} requires edges, ${topics.length} topics`);
