import { readFileSync } from "node:fs";
import { join } from "node:path";
import { defaultConfig, type Config } from "../config.js";
import { buildContent, type RawPack } from "../content.js";
import type { Content } from "../types.js";

type PackEntry = { id: string; dir: string };

/**
 * Node only: reads built packs and the source items.json files (for note_ref). Fails loudly (F7): a requested pack id
 * not in app/content-packs.json, a built pack with no skill graph, or no cards at all is an error naming the pack(s).
 */
export function loadFromRepo(repoRoot: string, packIds?: string[], cfg: Config = defaultConfig): Content {
  const readJson = (p: string) => JSON.parse(readFileSync(join(repoRoot, p), "utf8"));
  const entries: PackEntry[] = readJson("app/content-packs.json").packs;
  const ids = packIds ?? entries.map(e => e.id);
  const packs: RawPack[] = [];
  const noteRefs: Record<string, string> = {};
  for (const id of ids) {
    const entry = entries.find(e => e.id === id);
    if (!entry) throw new Error(`pack ${id} is not in app/content-packs.json`);
    const pack = readJson(`app/assets/content/packs/${id}.json`) as RawPack;
    if (!pack.graph) throw new Error(`pack ${id} has no skill graph (app/assets/content/packs/${id}.json has no "graph" field)`);
    packs.push(pack);
    const src = readJson(`${entry.dir}/items.json`);
    for (const key of ["cards", "pools", "templates", "banks"]) {
      for (const it of (src[key] ?? []) as { id: string; note_ref?: string }[]) {
        if (it.note_ref) noteRefs[it.id] = it.note_ref;
      }
    }
  }
  const content = buildContent(packs, noteRefs, cfg.content.exclude);
  if (Object.keys(content.cards).length === 0) throw new Error(`no cards loaded (packs: ${ids.join(", ")})`);
  return content;
}
