#!/usr/bin/env node
// Builds the app's bundled content from the authored packs.
//
// --pack-set v1 (default) reads app/content-packs.json. --pack-set v2 reads
// content/sample-v2/content-packs.json and writes distinct pack IDs plus
// index-v2.ts and tags-v2.json alongside the default output. Each pack uses:
//   items.json     cards, pools, templates, banks, skills (with name_si)
//   variants.json  generated template and bank variants
//   si.tsv         English → Sinhala pairs, used where a text has no `si`
//   figures/*.svg  drawings referenced by card options
// plus the error-tag taxonomy (student messages) from the spec doc, §7, and any
// proposed tag tables (content/tags/*-proposed.md) for tags the spec doesn't have yet.
//
// Writes app/assets/content/packs/<id>.json and app/assets/content/index.ts.
// The app only reads these files, so updated content needs no code changes:
// edit the pack, run `npm run content`, reload the app.
// `--out <dir>` writes somewhere else (used by the tests).

import fs from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import { fileURLToPath } from "node:url";

const APP = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const REPO = path.resolve(APP, "..");
const { values } = parseArgs({ options: { out: { type: "string" }, "pack-set": { type: "string", default: "v1" } } });
const edition = values["pack-set"];
if (!["v1", "v2"].includes(edition)) throw new Error("--pack-set must be v1 or v2");
const suffix = edition === "v2" ? "-v2" : "";
const manifest = edition === "v2" ? "content/sample-v2/content-packs.json" : "app/content-packs.json";
const OUT = values.out ? path.resolve(values.out) : path.join(APP, "assets", "content");
const config = JSON.parse(fs.readFileSync(path.join(REPO, manifest), "utf8"));

const LAYER_ORDER = { L1: 1, L2: 2, L3: 3, L4: 4 };

// ---------- helpers ----------
function hash(str) {
  let h = 2166136261;
  for (const ch of str) h = Math.imul(h ^ ch.codePointAt(0), 16777619);
  return h >>> 0;
}

function seededShuffle(list, seed) {
  let s = hash(seed);
  const rand = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function readTsv(file) {
  const map = new Map();
  if (!fs.existsSync(file)) return map;
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const [en, si] = line.split("\t");
    if (en && si) map.set(en.trim(), si.trim());
  }
  return map;
}

// Error tags and their student messages, from the spec's §7 tables.
function readTags(specFile, tsv) {
  const tags = {};
  let group = null;
  let inTaxonomy = false;
  for (const line of fs.readFileSync(specFile, "utf8").split("\n")) {
    if (line.startsWith("## ")) inTaxonomy = /error-tag taxonomy/i.test(line);
    if (!inTaxonomy) continue;
    const heading = line.match(/^### (.+)$/);
    if (heading) group = heading[1].trim();
    const row = line.match(/^\|\s*`([^`]+)`\s*\|\s*([^|]+?)\s*\|\s*"(.+)"\s*\|\s*$/);
    if (row && group) {
      const [, tag, meaning, message] = row;
      const en = message.replace(/\*\*/g, "");
      tags[tag] = { group, meaning, message: tsv.has(en) ? { en, si: tsv.get(en) } : { en } };
    }
  }
  return tags;
}

// Proposed Concept tags for a unit (not yet approved into §7). Shown so reviewers can
// judge the messages, and marked `proposed` so the app can say so.
function readProposedTags(file, tags, tsv) {
  const unit = path.basename(file).replace(/-proposed\.md$/, "").replace(/-/g, " ");
  let added = 0;
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const row = line.match(/^\|\s*`([^`]+)`\s*\|\s*([^|]+?)\s*\|\s*"(.+)"\s*\|\s*$/);
    if (!row || tags[row[1]]) continue;
    const [, tag, meaning, message] = row;
    const en = message.replace(/\*\*/g, "");
    tags[tag] = { group: `Concept (C): ${unit} (proposed)`, meaning, message: tsv.has(en) ? { en, si: tsv.get(en) } : { en }, proposed: true };
    added++;
  }
  return added;
}

// ---------- pack ----------
function buildPack(pack, tags, tsv) {
  const dir = path.join(REPO, pack.dir);
  const items = JSON.parse(fs.readFileSync(path.join(dir, "items.json"), "utf8"));
  const variantsFile = path.join(dir, "variants.json");
  const built = fs.existsSync(variantsFile) ? JSON.parse(fs.readFileSync(variantsFile, "utf8")) : { items: [] };
  const packTsv = new Map([...tsv, ...readTsv(path.join(dir, "si.tsv"))]);
  const missing = new Set();

  const text = (t) => {
    if (t == null) return null;
    if (typeof t === "string") t = { en: t };
    const si = t.si ?? packTsv.get(t.en?.trim());
    if (!si && /[A-Za-z]{3,}/.test(t.en ?? "")) missing.add(t.en);
    return si ? { en: t.en, si } : { en: t.en };
  };
  const svg = (asset) => {
    if (!asset) return undefined;
    const file = path.join(dir, asset);
    if (!fs.existsSync(file)) throw new Error(`${pack.id}: missing figure ${asset}`);
    return fs.readFileSync(file, "utf8");
  };

  // Card / pool scenario: 4 options, always including the correct one.
  const cardItem = (c, kind) => {
    const all = [...c.options, ...(c.spare_options ?? [])];
    const correct = all.filter((o) => o.correct);
    const wrong = all.filter((o) => !o.correct).slice(0, Math.max(0, 4 - correct.length));
    let shown = [...correct, ...wrong];
    shown = c.option_order === "shuffle" ? seededShuffle(shown, c.id) : all.filter((o) => shown.includes(o));
    return {
      id: c.id,
      kind,
      pool_id: c.pool_id,
      version: c.version,
      status: c.status,
      layer: c.layer,
      form: c.form,
      skills: c.skills,
      difficulty: c.difficulty_est,
      source_ref: c.source_ref,
      note_ref: c.note_ref,
      constants: c.constants ?? {},
      explanation: text(c.explanation),
      variants: [
        {
          vid: null,
          stem: text(c.text),
          figure: c.assets?.length ? { svg: svg(c.assets[0]) } : null,
          options: shown.map((o) => ({
            text: text(o.text),
            correct: !!o.correct,
            tag: o.tag,
            detail: o.detail ? text(o.detail) : undefined,
            svg: svg(o.asset),
          })),
        },
      ],
    };
  };

  const source = Object.fromEntries([...items.templates, ...items.banks].map((t) => [t.id, t]));

  // The examples teachers see in review.md (validate.py pick_examples).
  const exampleIndices = (b) => {
    const vs = b.variants.map((v, i) => ({ ...v, i }));
    if (vs[0].scenario && vs[0].scenario.length) {
      const by = new Map();
      for (const v of vs) if (!by.has(String(v.scenario))) by.set(String(v.scenario), v.i);
      return [...by.values()].slice(0, 4);
    }
    if (b.kind === "bank") {
      const seen = new Map();
      for (const v of vs) if (!seen.has(v.answer)) seen.set(v.answer, v.i);
      return [...seen.values()].slice(0, 3);
    }
    const ordered = [...vs].sort((a, z) => a.answer_value - z.answer_value);
    return [ordered[0].i, ordered[Math.floor(ordered.length / 2)].i, ordered[ordered.length - 1].i];
  };

  const generatedItem = (b) => {
    const src = source[b.id] ?? {};
    const examples = exampleIndices(b);
    return {
      id: b.id,
      kind: b.kind,
      version: src.version ?? 1,
      status: src.status ?? "draft",
      layer: b.layer,
      form: b.form,
      skills: b.skills,
      difficulty: b.difficulty_est,
      source_ref: b.source_ref,
      note_ref: src.note_ref,
      constants: src.constants ?? {},
      explanation: text(b.explanation),
      n_variants: b.variants.length,
      examples,
      variants: b.variants.map((v, i) => {
        const wrong = Object.fromEntries((v.wrong ?? []).map((w) => [w.text, w]));
        return {
          vid: `v${i}`,
          values: v.values,
          stem: text({ en: v.prompt, si: v.prompt_si }),
          figure: v.figure ? { engine: v.figure.engine, params: v.figure.params } : null,
          options: v.options.map((o, k) => {
            const w = wrong[o];
            const si = v.options_si?.[k];
            return {
              text: si ? { en: o, si } : { en: o, si: o },
              correct: o === v.answer,
              tag: w?.error_tag,
              detail: w?.detail ? { en: w.detail, ...(w.detail_si ? { si: w.detail_si } : {}) } : undefined,
            };
          }),
        };
      }),
    };
  };

  const playItems = [
    ...items.cards.map((c) => cardItem(c, "card")),
    ...items.pools.map((p) => cardItem(p, "pool")),
    ...built.items.map(generatedItem),
  ];

  // Fixed order: grouped by skill (in the pack's skill order), then by layer, then authored order.
  const skillOrder = new Map(items.skills.map((s, i) => [s.id, i]));
  const authored = new Map(playItems.map((it, i) => [it.id, i]));
  playItems.sort(
    (a, b) =>
      (skillOrder.get(a.skills[0]) ?? 999) - (skillOrder.get(b.skills[0]) ?? 999) ||
      LAYER_ORDER[a.layer] - LAYER_ORDER[b.layer] ||
      authored.get(a.id) - authored.get(b.id),
  );

  const usedTags = new Set(playItems.flatMap((it) => it.variants.flatMap((v) => v.options.map((o) => o.tag))).filter(Boolean));
  for (const t of usedTags) if (!tags[t]) console.warn(`  ! ${pack.id}: tag "${t}" is not in the spec's taxonomy`);
  if (missing.size) console.warn(`  ! ${pack.id}: ${missing.size} texts have no Sinhala, e.g. "${[...missing][0]}"`);

  return {
    id: pack.id,
    unit: pack.unit,
    spec_version: items.spec_version,
    status: items.status,
    medium: items.medium,
    built_at: new Date().toISOString(),
    source_dir: pack.dir,
    skills: items.skills.map((s) => ({ id: s.id, name: { en: s.name, si: s.name_si }, type: s.type })),
    items: playItems,
    graph: pack.graph ? buildGraph(path.join(REPO, pack.graph), items.skills) : null,
  };
}

// The unit's typed skill graph (DR-0022), trimmed to what the screens draw:
// topics (rings), every skill with its exam weight, and the requires /
// encompasses / confusable / helps edges. Sinhala skill names come from the
// graph, else from the content sample.
function buildGraph(file, sampleSkills) {
  const g = JSON.parse(fs.readFileSync(file, "utf8"));
  const sampleSi = new Map(sampleSkills.map((s) => [s.id, s.name_si]));
  const name = (n, id) => ({ en: n.en ?? n, ...((n.si ?? sampleSi.get(id)) ? { si: n.si ?? sampleSi.get(id) } : {}) });
  const kept = new Set(["requires", "encompasses", "confusable", "helps"]);
  return {
    status: g.status,
    exam_note: g.exam_weight_policy?.source,
    topics: g.topics.map((t) => ({ id: t.id, ref: t.syllabus_ref, name: { en: t.name }, exam_share: t.exam_share })),
    skills: g.skills.map((s) => ({
      id: s.id,
      topic: s.topic,
      subtopic: s.subtopic,
      ref: s.syllabus_ref,
      type: s.type,
      mastery: s.mastery,
      minutes: s.est_minutes,
      name: name(s.names, s.id),
      exam: { primary: s.exam?.primary?.length ?? 0, secondary: s.exam?.secondary?.length ?? 0 },
      weight: s.exam_weight_share ?? 0,
    })),
    // Skills from other units and maths skills the edges point at, so chips can be named.
    outside: [...(g.external ?? []), ...(g.math ?? [])].map((x) => ({ id: x.id, name: { en: x.name }, ref: x.syllabus_ref ?? null })),
    edges: g.edges.filter((e) => kept.has(e.type)).map((e) => ({ type: e.type, from: e.from, to: e.to, ...(e.weight ? { weight: e.weight } : {}) })),
  };
}

// ---------- main ----------
const tsv = new Map();
const tags = readTags(path.join(REPO, config.spec_doc), tsv);
const specTagCount = Object.keys(tags).length;
const proposedCounts = (config.proposed_tag_docs ?? []).map((f) => [f, readProposedTags(path.join(REPO, f), tags, tsv)]);
fs.mkdirSync(path.join(OUT, "packs"), { recursive: true });

const ids = [];
for (const pack of config.packs) {
  const out = buildPack(pack, tags, tsv);
  fs.writeFileSync(path.join(OUT, "packs", `${pack.id}.json`), JSON.stringify(out));
  ids.push(pack.id);
  const variants = out.items.reduce((n, it) => n + it.variants.length, 0);
  console.log(`✓ ${pack.id}: ${out.items.length} items, ${out.skills.length} skills, ${variants} variants`);
}
fs.writeFileSync(path.join(OUT, `tags${suffix}.json`), JSON.stringify(tags, null, 1));
console.log(`✓ ${specTagCount} error tags from ${config.spec_doc}`);
for (const [f, n] of proposedCounts) console.log(`✓ ${n} proposed tags from ${f}`);

const index = [
  "// Generated by scripts/build-content.mjs. Do not edit.",
  "/* eslint-disable */",
  `export const packs = [`,
  ...ids.map((id) => `  require("./packs/${id}.json"),`),
  `];`,
  `export const tags = require("./tags${suffix}.json");`,
  "",
].join("\n");
fs.writeFileSync(path.join(OUT, `index${suffix}.ts`), index);
