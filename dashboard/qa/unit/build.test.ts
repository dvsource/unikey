import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = join(__dirname, "..", "..");
const out = join(root, "out");

describe("BLD: build", () => {
  it("BLD-01 static export has home, 83 skill pages and 24 student pages (run npm run build first)", () => {
    expect(existsSync(join(out, "index.html")), "out/ missing: run npm run build").toBe(true);
    for (const p of ["topics", "students", "class", "signin", "digest", "feedback"])
      expect(existsSync(join(out, p, "index.html"))).toBe(true);
    const skills = readdirSync(join(out, "skill")).filter((d) => existsSync(join(out, "skill", d, "index.html")));
    expect(skills).toHaveLength(83);
    expect(skills.every((d) => !d.includes("."))).toBe(true);
    const students = readdirSync(join(out, "students")).filter((d) => existsSync(join(out, "students", d, "index.html")));
    expect(students).toHaveLength(24);
  });

  it("BLD-02 skills script is idempotent", () => {
    const file = join(root, "data", "skills.json");
    const before = readFileSync(file, "utf8");
    execFileSync("node", [join(root, "scripts", "build-skills.mjs")], { stdio: "pipe" });
    expect(readFileSync(file, "utf8")).toBe(before);
  });
});
