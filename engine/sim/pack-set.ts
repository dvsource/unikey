import { readFileSync } from "node:fs";
import { join } from "node:path";
import { buildContent, type RawPack } from "../src/content.js";
import { defaultConfig } from "../src/config.js";

type BuiltPack = RawPack & { items: (RawPack["items"][number] & { note_ref?: string })[] };

export function loadPackSet(root: string, edition: "v1" | "v2", ids?: string[], cfg = defaultConfig) {
  const manifest = edition === "v1" ? "app/content-packs.json" : "content/sample-v2/content-packs.json";
  const entries: { id: string }[] = JSON.parse(readFileSync(join(root, manifest), "utf8")).packs;
  const notes: Record<string, string> = {};
  const packs = (ids ?? entries.map(e => e.id)).map(id => {
    if (!entries.some(e => e.id === id)) throw new Error(`pack ${id} is not in ${manifest}`);
    const pack: BuiltPack = JSON.parse(readFileSync(join(root, "app/assets/content/packs", id + ".json"), "utf8"));
    if (pack.id !== id) throw new Error(`expected pack ${id}, found ${pack.id}`);
    for (const item of pack.items) if (item.note_ref) notes[item.id] = item.note_ref;
    return pack;
  });
  const content = buildContent(packs, notes, cfg.content.exclude);
  if (!Object.keys(content.cards).length) throw new Error("no cards loaded from " + manifest);
  return content;
}
