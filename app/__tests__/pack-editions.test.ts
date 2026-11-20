import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { Item } from "../src/content/pack";

const app = path.resolve(__dirname, "..");
const repo = path.resolve(app, "..");
const read = (file: string) => JSON.parse(fs.readFileSync(file, "utf8"));
type SourceItem = Pick<Item, "id" | "layer" | "form" | "skills" | "note_ref">;
type Generated = {
  id: string; kind: string; effective_variants: number; option_order: string; position_exempt: boolean;
  variants: { position: number }[];
};

// Authoring spec V7/V8. A rescaled variant does not add a new effective problem.
function publishedLayer(item: SourceItem, bank?: Generated) {
  if (item.layer !== "L4" || bank?.kind !== "template") return item.layer;
  if (bank.effective_variants < 20) return "L2";
  if (bank.option_order === "ascending" && !bank.position_exempt) {
    const counts = new Map<number, number>();
    for (const { position } of bank.variants) counts.set(position, (counts.get(position) ?? 0) + 1);
    if (Math.max(...counts.values()) > 0.6 * bank.variants.length) return "L2";
  }
  return item.layer;
}

it("builds both editions alongside each other with source IDs, forms, notes and validated layers", () => {
  const out = fs.mkdtempSync(path.join(os.tmpdir(), "unikey-editions-"));
  try {
    for (const edition of ["v1", "v2"]) {
      execFileSync(process.execPath, [path.join(app, "scripts/build-content.mjs"), "--out", out, "--pack-set", edition]);
      const manifest = edition === "v2" ? "content/sample-v2/content-packs.json" : "app/content-packs.json";
      for (const entry of read(path.join(repo, manifest)).packs) {
        const sourceDir = path.join(repo, entry.dir);
        const source = read(path.join(sourceDir, "items.json"));
        const authored: SourceItem[] = [...source.cards, ...source.pools, ...source.templates, ...source.banks];
        const generated: Generated[] = read(path.join(sourceDir, "variants.json")).items;
        const byId = new Map(generated.map(item => [item.id, item]));
        const filename = path.join("packs", entry.id + ".json");
        const pack = read(path.join(out, filename));
        const bundled = read(path.join(app, "assets/content", filename));
        expect({ ...pack, built_at: "" }).toEqual({ ...bundled, built_at: "" });
        const metadata = (i: SourceItem) => [i.id, i.form, i.layer, i.skills, i.note_ref];
        expect(pack.items.map(metadata).sort()).toEqual(authored.map(i =>
          metadata({ ...i, layer: publishedLayer(i, byId.get(i.id)) })).sort());
      }
    }
    for (const name of ["index.ts", "index-v2.ts", "tags.json", "tags-v2.json"]) {
      expect(fs.readFileSync(path.join(out, name), "utf8")).toBe(fs.readFileSync(path.join(app, "assets/content", name), "utf8"));
    }
  } finally {
    fs.rmSync(out, { recursive: true, force: true });
  }
});
