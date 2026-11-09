#!/usr/bin/env node
// Merges review exports from the app (JSON files sent over WhatsApp) into each
// pack's review-results.json, e.g. content/samples/mechanics-20/review-results.json.
//
//   node scripts/merge-review.mjs ~/Downloads/unikey-review-*.json
//   node scripts/merge-review.mjs --dry-run export.json
//   node scripts/merge-review.mjs --out /tmp/results.json export.json   (one pack; used by the tests)
//
// One result per (item, variant, reviewer); the newest timestamp wins, so
// re-sending a corrected export is safe. A text export pasted into a .json file works too.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const APP = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const REPO = path.resolve(APP, "..");
const config = JSON.parse(fs.readFileSync(path.join(APP, "content-packs.json"), "utf8"));
const packDir = Object.fromEntries(config.packs.map((p) => [p.id, path.join(REPO, p.dir)]));

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const outIndex = args.indexOf("--out");
const outOverride = outIndex >= 0 ? path.resolve(args[outIndex + 1]) : null;
const files = args.filter((a, i) => !a.startsWith("--") && (outIndex < 0 || i !== outIndex + 1));
if (!files.length) {
  console.error("Usage: node scripts/merge-review.mjs [--dry-run] <export.json> [...]");
  process.exit(1);
}

const key = (r) => `${r.item_id}|${r.variant_id ?? "-"}|${(r.reviewer ?? "").trim().toLowerCase()}`;
const REQUIRED = ["item_id", "spec_version", "reviewer", "timestamp", "verdict", "pack"];

const incoming = {}; // pack → results
for (const file of files) {
  const data = JSON.parse(fs.readFileSync(file, "utf8").trim());
  if (data.format !== "unikey-review/1") throw new Error(`${file}: not a UniKey review export (format ${data.format})`);
  for (const r of data.results ?? []) {
    const missing = REQUIRED.filter((k) => r[k] == null || r[k] === "");
    if (missing.length) {
      console.warn(`  ! ${file}: skipped a result with no ${missing.join(", ")}`);
      continue;
    }
    if (!packDir[r.pack]) {
      console.warn(`  ! ${file}: unknown pack "${r.pack}" for ${r.item_id}`);
      continue;
    }
    (incoming[r.pack] ??= []).push({ ...r, source_file: path.basename(file) });
  }
  console.log(`Read ${file}: ${data.results?.length ?? 0} results from ${data.reviewer || "unknown"} (${data.exported_at})`);
}

for (const [pack, results] of Object.entries(incoming)) {
  const out = outOverride ?? path.join(packDir[pack], "review-results.json");
  const current = fs.existsSync(out) ? JSON.parse(fs.readFileSync(out, "utf8")) : { pack, results: [] };
  const merged = new Map(current.results.map((r) => [key(r), r]));
  let added = 0;
  let updated = 0;
  let skipped = 0;
  for (const r of results) {
    const k = key(r);
    const have = merged.get(k);
    if (!have) added++;
    else if (have.timestamp < r.timestamp) updated++;
    else {
      skipped++;
      continue;
    }
    merged.set(k, r);
  }
  const list = [...merged.values()].sort(
    (a, b) =>
      a.item_id.localeCompare(b.item_id) ||
      String(a.variant_id).localeCompare(String(b.variant_id)) ||
      a.reviewer.localeCompare(b.reviewer),
  );
  const issues = list.filter((r) => r.verdict === "issues");
  const summary = {
    pack,
    updated_at: new Date().toISOString(),
    reviewers: [...new Set(list.map((r) => r.reviewer))].sort(),
    items_reviewed: new Set(list.map((r) => r.item_id)).size,
    items_with_issues: new Set(issues.map((r) => r.item_id)).size,
    results: list,
  };
  console.log(
    `${pack}: ${added} new, ${updated} updated, ${skipped} unchanged or older → ${list.length} results, ` +
      `${summary.items_reviewed} items reviewed, ${summary.items_with_issues} with issues`,
  );
  if (dryRun) console.log(`  (dry run, ${path.relative(REPO, out)} not written)`);
  else {
    fs.writeFileSync(out, JSON.stringify(summary, null, 1) + "\n");
    console.log(`  wrote ${path.relative(REPO, out)}`);
  }
}
