import { readFileSync } from "node:fs";
import { join } from "node:path";
import { buildContent, type RawPack } from "../content.js";
import type { Content } from "../types.js";

type PackEntry = { id: string; dir: string };

// Node only: reads built packs and the source items.json files (for note_ref).
export function loadFromRepo(repoRoot: string, packIds?: string[]): Content {
  const readJson = (p: string) => JSON.parse(readFileSync(join(repoRoot, p), "utf8"));
  const entries: PackEntry[] = readJson("app/content-packs.json").packs;
  const ids = packIds ?? entries.map(e => e.id);
  const packs: RawPack[] = [];
  const noteRefs: Record<string, string> = {};
  for (const id of ids) {
    packs.push(readJson(`app/assets/content/packs/${id}.json`));
    const entry = entries.find(e => e.id === id);
    if (!entry) continue;
    const src = readJson(`${entry.dir}/items.json`);
    for (const key of ["cards", "pools", "templates", "banks"]) {
      for (const it of (src[key] ?? []) as { id: string; note_ref?: string }[]) {
        if (it.note_ref) noteRefs[it.id] = it.note_ref;
      }
    }
  }
  return buildContent(packs, noteRefs);
}
