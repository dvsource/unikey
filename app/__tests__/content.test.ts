import fs from "node:fs";
import path from "node:path";
import { figureSvg } from "../src/content/figureEngines";
import { getItem, items, packs, reviewVariants, tags, type Pack } from "../src/content/pack";

// Each bundled pack (assets/content) must match the authored sample it was built from.

const REPO = path.resolve(__dirname, "../..");
const config = JSON.parse(fs.readFileSync(path.join(__dirname, "../content-packs.json"), "utf8"));

type Source = {
  id: string;
  dir: string;
  items: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  built: { spec_version: string; items: any[] }; // eslint-disable-line @typescript-eslint/no-explicit-any
  tsv: Map<string, string>;
};
const v2Config = JSON.parse(fs.readFileSync(path.join(REPO, "content/sample-v2/content-packs.json"), "utf8"));
const sources: Source[] = [...config.packs, ...v2Config.packs].map((p: { id: string; dir: string }) => {
  const dir = path.join(REPO, p.dir);
  const tsv = new Map<string, string>(
    fs
      .readFileSync(path.join(dir, "si.tsv"), "utf8")
      .split("\n")
      .map((l: string) => l.split("\t"))
      .filter(([en, si]: string[]) => en && si)
      .map(([en, si]: string[]) => [en.trim(), si.trim()] as [string, string]),
  );
  return {
    id: p.id,
    dir,
    items: JSON.parse(fs.readFileSync(path.join(dir, "items.json"), "utf8")),
    built: JSON.parse(fs.readFileSync(path.join(dir, "variants.json"), "utf8")),
    tsv,
  };
});

it("loads every pack in content-packs.json, in order (BLD-01)", () => {
  expect(packs.map((p) => p.id)).toEqual(config.packs.map((s: { id: string }) => s.id));
  expect(packs.length).toBeGreaterThanOrEqual(3);
  expect(new Set(items.map((it) => it.id)).size).toBe(items.length); // ids unique across packs
});

describe.each(sources)("pack $id", (src) => {
  const v2 = v2Config.packs.some((p: { id: string }) => p.id === src.id);
  const pack: Pack = v2 ? require("../assets/content/index-v2").packs.find((p: Pack) => p.id === src.id)
    : packs.find(p => p.id === src.id)!;
  const packTags: typeof tags = v2 ? require("../assets/content/index-v2").tags : tags;
  const itemById = new Map(pack.items.map(item => [item.id, item]));

  it("has its unit's names and spec version", () => {
    expect(pack.spec_version).toBe(src.items.spec_version);
    expect(pack.unit.name_si).toMatch(/[඀-෿]/);
    expect(pack.unit.name_en.length).toBeGreaterThan(3);
  });

  it("has every card, scenario, template and bank, and every skill", () => {
    const ids = [...src.items.cards, ...src.items.pools, ...src.built.items].map((x: { id: string }) => x.id).sort();
    expect(pack.items.map((it) => it.id).sort()).toEqual(ids);
    expect(pack.skills.map((s) => s.id)).toEqual(src.items.skills.map((s: { id: string }) => s.id));
    for (const s of src.items.skills) expect(pack.skills.find((x) => x.id === s.id)?.name.si).toBe(s.name_si);
  });

  it("keeps every generated variant, with its Sinhala prompt", () => {
    for (const b of src.built.items) {
      const it = itemById.get(b.id)!;
      expect(it.variants).toHaveLength(b.variants.length);
      b.variants.forEach((v: { prompt: string; prompt_si: string; answer: string }, i: number) => {
        expect(it.variants[i].vid).toBe(`v${i}`);
        expect(it.variants[i].stem).toEqual({ en: v.prompt, si: v.prompt_si });
        expect(it.variants[i].options.filter((o) => o.correct).map((o) => o.text.en)).toEqual([v.answer]);
      });
    }
  });

  it("gives every stem, option and explanation a Sinhala text that agrees with si.tsv (LANG-05)", () => {
    let checked = 0;
    for (const it of pack.items) {
      for (const t of [it.explanation, ...it.variants.flatMap((v) => [v.stem, ...v.options.map((o) => o.text)])]) {
        expect(t.si).toBeTruthy();
        if (src.tsv.has(t.en.trim())) {
          expect(t.si).toBe(src.tsv.get(t.en.trim()));
          checked++;
        }
      }
    }
    expect(checked).toBeGreaterThan(50);
  });

  it("shows up to 4 of a card's options, with exactly one correct", () => {
    for (const c of [...src.items.cards, ...src.items.pools]) {
      const opts = itemById.get(c.id)!.variants[0].options;
      expect(opts.length).toBe(Math.min(4, c.options.length + (c.spare_options?.length ?? 0)));
      expect(opts.filter((o) => o.correct)).toHaveLength(1);
    }
  });

  it("resolves every card figure to the SVG file it names (BLD-04)", () => {
    let n = 0;
    for (const c of [...src.items.cards, ...src.items.pools]) {
      const it = itemById.get(c.id)!;
      for (const o of c.options.filter((x: { asset?: string }) => x.asset)) {
        const shown = it.variants[0].options.find((x) => x.text.en === o.text.en)!;
        expect(shown.svg).toBe(fs.readFileSync(path.join(src.dir, o.asset), "utf8"));
        n++;
      }
    }
    const figDir = path.join(src.dir, "figures");
    const cardFigures = fs.existsSync(figDir) ? fs.readdirSync(figDir).filter((f) => /^c\d/.test(f)).length : 0;
    expect(n).toBe(cardFigures);
  });

  it("draws every F44 variant's figure with a known engine (SES-10)", () => {
    for (const it of pack.items.filter((x) => x.form === "F44")) {
      for (const v of it.variants) expect(figureSvg(v.figure)).toMatch(/^<svg[\s\S]*<\/svg>$/);
    }
  });

  it("gives every tag a student message, from the spec or a proposed tag table", () => {
    const used = new Set(pack.items.flatMap((it) => it.variants.flatMap((v) => v.options.map((o) => o.tag))).filter(Boolean) as string[]);
    for (const t of used) expect(packTags[t]?.message.en).toBeTruthy();
  });

  it("plays items grouped by skill, in the pack's skill order (BLD-06)", () => {
    const order = src.items.skills.map((s: { id: string }) => s.id);
    const seen = pack.items.map((it) => order.indexOf(it.skills[0]));
    expect(seen).not.toContain(-1);
    expect([...seen].sort((a, b) => a - b)).toEqual(seen);
  });
});

it("draws the Mechanics review doc's example figures the same way validate.py does", () => {
  const dir = sources.find((s) => s.id === "mechanics-20")!.dir;
  for (const id of ["t03", "t08", "t11"]) {
    const it = getItem(`phy.mech.${id}`)!;
    reviewVariants(it).forEach((vi, k) => {
      const expected = fs.readFileSync(path.join(dir, "figures", `${id}-${k + 1}.svg`), "utf8");
      expect(figureSvg(it.variants[vi].figure)).toBe(expected);
    });
  }
});

it("marks proposed tags so the app can say they're not approved", () => {
  expect(tags["wrong-law"].proposed).toBeUndefined();
  expect(tags["celsius-in-gas-law"]).toMatchObject({ proposed: true, group: expect.stringMatching(/proposed/) });
});
