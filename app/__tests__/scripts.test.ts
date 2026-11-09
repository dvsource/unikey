import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

// The two node scripts, run as the user runs them, writing into temp folders.

const APP = path.resolve(__dirname, "..");
const run = (script: string, args: string[]) =>
  execFileSync(process.execPath, [path.join(APP, "scripts", script), ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), "unikey-test-"));

describe("build-content: fixed-seed option shuffle", () => {
  const build = () => {
    const out = tmp();
    run("build-content.mjs", ["--out", out]);
    return JSON.parse(fs.readFileSync(path.join(out, "packs", "mechanics-20.json"), "utf8"));
  };
  const optionOrder = (pack: { items: { id: string; kind: string; variants: { options: { text: { en: string } }[] }[] }[] }) =>
    pack.items.filter((it) => it.kind === "card").map((it) => [it.id, it.variants[0].options.map((o) => o.text.en)]);

  const first = build();
  const second = build();

  it("gives the same option order on every build", () => {
    expect(optionOrder(second)).toEqual(optionOrder(first));
  });

  it("matches the bundled pack", () => {
    const bundled = JSON.parse(fs.readFileSync(path.join(APP, "assets/content/packs/mechanics-20.json"), "utf8"));
    expect(optionOrder(bundled)).toEqual(optionOrder(first));
  });

  it("writes to --out and parses the spec's 70 error tags (BLD-05, BLD-07)", () => {
    const out = tmp();
    run("build-content.mjs", ["--out", out]);
    const tags = JSON.parse(fs.readFileSync(path.join(out, "tags.json"), "utf8"));
    const spec = Object.values(tags).filter((t) => !(t as { proposed?: boolean }).proposed);
    expect(spec).toHaveLength(70);
    for (const t of spec as { group: string; message: { en: string } }[]) {
      expect(t.group).toMatch(/^(Method|Execution|Reading|Concept)/);
      expect(t.message.en.length).toBeGreaterThan(5);
    }
    expect(tags["forgot-half"].message.en).toBe("Check the ½.");
  });

  it("actually moves the correct answer around", () => {
    const positions = new Set(
      first.items
        .filter((it: { kind: string }) => it.kind === "card")
        .map((it: { variants: { options: { correct: boolean }[] }[] }) => it.variants[0].options.findIndex((o) => o.correct)),
    );
    expect(positions.size).toBeGreaterThanOrEqual(3);
  });
});

describe("merge-review", () => {
  const result = (over: Record<string, unknown>) => ({
    item_id: "phy.mech.c001",
    variant_id: null,
    item_version: 1,
    spec_version: "0.5",
    pack: "mechanics-20",
    verdict: "ok",
    issues: [],
    distractors: [],
    note: "",
    reviewer: "Test Reviewer",
    timestamp: "2026-11-07T10:00:00.000Z",
    ...over,
  });
  const exportFile = (dir: string, name: string, results: unknown[]) => {
    const file = path.join(dir, name);
    fs.writeFileSync(file, JSON.stringify({ format: "unikey-review/1", exported_at: "2026-11-07T10:05:00Z", reviewer: "Test Reviewer", results }));
    return file;
  };

  it("merges an export into the results file without duplicates on re-merge", () => {
    const dir = tmp();
    const out = path.join(dir, "review-results.json");
    const a = exportFile(dir, "a.json", [
      result({ verdict: "issues", issues: ["bad-distractor"], distractors: [{ index: 2, letter: "C", text_en: "A + B" }], note: "first" }),
      result({ item_id: "phy.mech.t03", variant_id: "v0" }),
    ]);

    run("merge-review.mjs", ["--out", out, a]);
    run("merge-review.mjs", ["--out", out, a]);
    let merged = JSON.parse(fs.readFileSync(out, "utf8"));
    expect(merged.results).toHaveLength(2);
    expect(merged.items_reviewed).toBe(2);
    expect(merged.items_with_issues).toBe(1);

    // A newer mark for the same item and reviewer replaces the old one; another reviewer adds a row.
    const b = exportFile(dir, "b.json", [
      result({ note: "second", timestamp: "2026-11-08T09:00:00.000Z" }),
      result({ reviewer: "Second Reviewer" }),
    ]);
    run("merge-review.mjs", ["--out", out, b]);
    merged = JSON.parse(fs.readFileSync(out, "utf8"));
    expect(merged.results).toHaveLength(3);
    const c001 = merged.results.filter((r: { item_id: string; reviewer: string }) => r.item_id === "phy.mech.c001" && r.reviewer === "Test Reviewer");
    expect(c001).toHaveLength(1);
    expect(c001[0]).toMatchObject({ note: "second", verdict: "ok" });
    expect(merged.reviewers).toEqual(["Second Reviewer", "Test Reviewer"]);

    // Re-sending the older export changes nothing.
    run("merge-review.mjs", ["--out", out, a]);
    expect(JSON.parse(fs.readFileSync(out, "utf8")).results).toEqual(merged.results);
  });

  it("skips results with an unknown pack or missing fields, and --dry-run writes nothing (MRG-05, MRG-06)", () => {
    const dir = tmp();
    const out = path.join(dir, "review-results.json");
    const file = exportFile(dir, "mixed.json", [
      result({}),
      result({ item_id: "phy.mech.c002", pack: "no-such-pack" }),
      result({ item_id: "phy.mech.c003", reviewer: "" }),
    ]);
    run("merge-review.mjs", ["--dry-run", "--out", out, file]);
    expect(fs.existsSync(out)).toBe(false);
    run("merge-review.mjs", ["--out", out, file]);
    expect(JSON.parse(fs.readFileSync(out, "utf8")).results.map((r: { item_id: string }) => r.item_id)).toEqual(["phy.mech.c001"]);
  });

  it("rejects files that aren't review exports", () => {
    const dir = tmp();
    const bad = path.join(dir, "bad.json");
    fs.writeFileSync(bad, JSON.stringify({ hello: 1 }));
    expect(() => run("merge-review.mjs", ["--out", path.join(dir, "o.json"), bad])).toThrow();
  });
});
