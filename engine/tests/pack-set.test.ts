import { expect, test } from "vitest";
import { resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { loadPackSet } from "../sim/pack-set.js";
import { loadFromRepo } from "../src/node/load.js";
import { runStudent, SIM_START, personaSeed, type LogLine } from "../sim/run.js";
import { personas } from "../sim/personas.js";
import { defaultConfig } from "../src/config.js";

const root = resolve(import.meta.dirname, "../..");

test("v1 matches the base packs and v2 uses its own notes and items", () => {
  const base = loadFromRepo(root);
  for (const card of Object.values(base.cards)) delete card.noteRef; // The original packs omit notes.
  expect(loadPackSet(root, "v1")).toEqual(base);
  const v2 = loadPackSet(root, "v2", ["mechanics-20-v2"]);
  expect(Object.keys(v2.cards)).toHaveLength(98);
  expect(v2.cards["phy.mech.c051"].noteRef).toBe("phy.mech.note.ang");
  expect(() => loadPackSet(root, "v1", ["mechanics-20-v2"])).toThrow("not in");
});

const index = personas.findIndex(p => p.id === "strong");
const seed = 6;
const subset = "thermal-physics-20-v2";

function cliLog(packArgs: string[]): LogLine[] {
  const out = mkdtempSync(resolve(tmpdir(), "unikey-sim-"));
  try {
    execFileSync(process.execPath, ["--import", "tsx", "sim/run.ts", ...packArgs,
      "--days", "1", "--seed", String(seed), "--persona", "strong", "--out", out], { cwd: resolve(root, "engine") });
    const lines = readFileSync(resolve(out, "strong.log.jsonl"), "utf8").trimEnd();
    return lines.split("\n").map(line => JSON.parse(line));
  } finally {
    rmSync(out, { recursive: true, force: true });
  }
}

function checkSubsetLog(lines: LogLine[]) {
  const content = loadPackSet(root, "v2", [subset]);
  const expected = runStudent(personas[index], content, {
    days: 1, seed: personaSeed(seed, index), start: SIM_START, cfg: defaultConfig,
  });
  expect(lines).toEqual(expected.lines);
}

test("the CLI serves the exact v2 subset event sequence including a v2-only card", () => {
  const lines = cliLog(["--pack-set", "v2", "--packs", subset]);
  checkSubsetLog(lines);
  expect(lines.some(l => l.kind === "card" && l.served?.card === "phy.therm.c049")).toBe(true);
  expect(loadPackSet(root, "v1").cards["phy.therm.c049"]).toBeUndefined();
});

test("the subset comparison rejects a CLI that ignores both switches or only the subset", () => {
  const defaultLog = cliLog([]);
  const allV2 = cliLog(["--pack-set", "v2"]);
  expect(() => checkSubsetLog(defaultLog)).toThrow();
  expect(() => checkSubsetLog(allV2)).toThrow();
});
