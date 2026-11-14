import { expect, test } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dirname, "..", "src");
const banned = /Date\.now\(|new Date\(\)|Math\.random\(|from ["'](node:)?(fs|path)["']|from ["'](react|expo)[^"']*["']/;

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) return p === join(root, "node") ? [] : files(p);
    return p.endsWith(".ts") || p.endsWith(".tsx") ? [p] : [];
  });
}

test("src is pure (no fs, path, react, expo, clock or random)", () => {
  for (const f of files(root)) expect(readFileSync(f, "utf8"), f).not.toMatch(banned);
});
