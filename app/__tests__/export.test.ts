import { buildExport, fileName } from "../src/state/exportReviews";
import { ReviewRecord } from "../src/state/store";

const record: ReviewRecord = {
  item_id: "phy.mech.t03",
  variant_id: "v12",
  variant_values: { v1: 2, t1: 1, v2: 1, t2: 4 },
  item_version: 1,
  spec_version: "0.5",
  pack: "mechanics-20",
  verdict: "issues",
  issues: ["bad-distractor", "bad-sinhala"],
  distractors: [{ index: 3, letter: "D", text_en: "3 m s⁻¹", text_si: "3 m s⁻¹", tag: "wrong-law" }],
  note: "D is not a real mistake",
  reviewer: "Test Reviewer",
  timestamp: "2026-11-07T10:00:00.000Z",
};

describe("review export", () => {
  const out = buildExport({ "phy.mech.t03|v12": record }, "Test Reviewer");

  it("has the header the merge script expects", () => {
    expect(out.format).toBe("unikey-review/1");
    expect(out.reviewer).toBe("Test Reviewer");
    expect(new Date(out.exported_at).toString()).not.toBe("Invalid Date");
    expect(out.packs).toEqual([
      expect.objectContaining({ id: "mechanics-20", spec_version: "0.5", items: 91 }),
      expect.objectContaining({ id: "thermal-physics-20", spec_version: "0.5", items: 68 }),
      expect.objectContaining({ id: "current-electricity-20", spec_version: "0.5", items: 82 }),
    ]);
  });

  it("carries every documented field on each result", () => {
    expect(out.results).toHaveLength(1);
    const r = out.results[0];
    for (const key of [
      "item_id",
      "variant_id",
      "variant_values",
      "item_version",
      "spec_version",
      "pack",
      "verdict",
      "issues",
      "distractors",
      "note",
      "reviewer",
      "timestamp",
    ]) {
      expect(r).toHaveProperty(key);
    }
    expect(r.distractors[0]).toEqual({ index: 3, letter: "D", text_en: "3 m s⁻¹", text_si: "3 m s⁻¹", tag: "wrong-law" });
  });

  it("round-trips through JSON", () => {
    expect(JSON.parse(JSON.stringify(out))).toEqual(out);
  });
});

describe("export file name (EXP-06)", () => {
  it("is lower-case with dashes, a timestamp and .json", () => {
    expect(fileName("Test Reviewer")).toMatch(/^unikey-review-test-reviewer-\d{4}-\d{2}-\d{2}-\d{2}-\d{2}\.json$/);
  });
  it("falls back to 'reviewer' for a Sinhala name (BUG-02)", () => {
    expect(fileName("නිමාලි")).toMatch(/^unikey-review-reviewer-\d{4}-/);
    expect(fileName("")).toMatch(/^unikey-review-reviewer-/);
  });
});
