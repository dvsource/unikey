import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { Item } from "../src/content/pack";

const app = path.resolve(__dirname, "..");
const repo = path.resolve(app, "..");
const read = (file: string) => JSON.parse(fs.readFileSync(file, "utf8"));
type SourceItem = Pick<Item, "id" | "layer" | "form" | "skills" | "note_ref">;
type Template = SourceItem & { exact?: string; option_order: string };
type Bank = {
  id: string; layer: Item["layer"]; effective_variants: number; position_exempt: boolean;
  variants: { answer_value: number; wrong: { value: number }[]; position: number }[];
};

function roundedRatio(value: number, answer: number) {
  const ratio = value / answer;
  // Python rounds binary floats to nearest, ties to even. The exact thousandth
  // midpoints representable in binary are odd multiples of 1/16.
  if (Math.abs(ratio * 16) % 2 === 1) return Math.round(ratio * 500) / 500;
  return Number(ratio.toFixed(3));
}

function expectedLayer(template: Template, bank: Bank) {
  if (template.layer !== "L4") return template.layer;
  let effectiveCount = bank.variants.length;
  if (template.form !== "F41" || template.exact === "fraction") {
    const patterns = new Set(bank.variants.map(({ answer_value, wrong }) => {
      const values = [answer_value, ...wrong.map(w => w.value)];
      return values.sort((a, b) => a - b).map(v => roundedRatio(v, answer_value)).join(",");
    }));
    effectiveCount = patterns.size;
  }
  if (effectiveCount < 20) return "L2";
  if (template.option_order === "ascending") {
    const counts = new Map<number, number>();
    for (const { position } of bank.variants) counts.set(position, (counts.get(position) ?? 0) + 1);
    if (Math.max(...counts.values()) > 0.6 * bank.variants.length) return "L2";
  }
  return template.layer;
}

function checkTemplateLayer(source: Template, generated: Bank, published: Item["layer"]) {
  expect([source.id, published]).toEqual([source.id, expectedLayer(source, generated)]);
}

const mechanics = path.join(repo, "content/samples/mechanics-20");
const templates: Template[] = read(path.join(mechanics, "items.json")).templates;
const banks: Bank[] = read(path.join(mechanics, "variants.json")).items;

it.each([
  ["phy.mech.t09", "L4", 28],
  ["phy.mech.t13", "L2", 1],
] as const)("rejects a false published layer for %s even when the reported count agrees", (id, layer, count) => {
  const source = templates.find(t => t.id === id)!;
  const bank = banks.find(b => b.id === id)!;
  checkTemplateLayer(source, bank, bank.layer);
  const mutated = { ...bank, layer, effective_variants: count };
  expect(() => checkTemplateLayer(source, mutated, mutated.layer)).toThrow();
});

it("applies the publication position limit even if filtering marked the template exempt", () => {
  const source = templates.find(t => t.id === "phy.mech.t13")!;
  const bank = banks.find(b => b.id === source.id)!;
  const biased = { ...bank, position_exempt: true, variants: bank.variants.map(v => ({ ...v, position: 1 })) };
  checkTemplateLayer({ ...source, option_order: "ascending" }, biased, "L2");
});

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
        const generated: Bank[] = read(path.join(sourceDir, "variants.json")).items;
        const byId = new Map(generated.map(item => [item.id, item]));
        const filename = path.join("packs", entry.id + ".json");
        const pack = read(path.join(out, filename));
        const bundled = read(path.join(app, "assets/content", filename));
        expect({ ...pack, built_at: "" }).toEqual({ ...bundled, built_at: "" });
        const metadata = (i: SourceItem) => [i.id, i.form, i.skills, i.note_ref];
        expect(pack.items.map(metadata).sort()).toEqual(authored.map(metadata).sort());
        const layers = new Map<string, Item["layer"]>(pack.items.map((i: Item) => [i.id, i.layer]));
        for (const i of [...source.cards, ...source.pools, ...source.banks]) expect(layers.get(i.id)).toBe(i.layer);
        for (const t of source.templates) checkTemplateLayer(t, byId.get(t.id)!, layers.get(t.id)!);
      }
    }
    for (const name of ["index.ts", "index-v2.ts", "tags.json", "tags-v2.json"]) {
      expect(fs.readFileSync(path.join(out, name), "utf8")).toBe(fs.readFileSync(path.join(app, "assets/content", name), "utf8"));
    }
  } finally {
    fs.rmSync(out, { recursive: true, force: true });
  }
});
