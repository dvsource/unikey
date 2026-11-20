import { expect, test } from "vitest";
import { resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { loadPackSet } from "../sim/pack-set.js";
import { loadFromRepo } from "../src/node/load.js";

const root = resolve(import.meta.dirname, "../..");

test("bundled v1 reproduces the original source-assisted engine input; v2 uses its own notes and items", () => {
  expect(loadPackSet(root, "v1")).toEqual(loadFromRepo(root));
  const v2 = loadPackSet(root, "v2", ["mechanics-20-v2"]);
  expect(Object.keys(v2.cards)).toHaveLength(98);
  expect(v2.cards["phy.mech.c051"].noteRef).toBe("phy.mech.note.ang");
  expect(() => loadPackSet(root, "v1", ["mechanics-20-v2"])).toThrow("not in");
});

test("the simulator CLI accepts v2 with an edition-specific subset", () => {
  const out = mkdtempSync(resolve(tmpdir(), "unikey-sim-"));
  try {
    execFileSync(process.execPath, ["--import", "tsx", "sim/run.ts", "--pack-set", "v2",
      "--packs", "mechanics-20-v2", "--days", "1", "--persona", "strong", "--out", out], { cwd: resolve(root, "engine") });
    expect(JSON.parse(readFileSync(resolve(out, "strong.summary.json"), "utf8")).persona).toBe("strong");
  } finally {
    rmSync(out, { recursive: true, force: true });
  }
});
