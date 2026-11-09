import { expect, test } from "@playwright/test";
import { requiresOf, skillById, skillHref, skillName, unlocksOf } from "@/lib/data";
import { open } from "./helpers";

const B = "phy.mech.circ.friction-limit";

test("SKL-01 header and counts sum to 24", async ({ page }) => {
  await open(page, skillHref(B));
  await expect(page.locator("h1")).toHaveText(skillName(B));
  await expect(page.locator("p.lead")).toContainText(skillById[B].en);
  await expect(page.locator("p.lead")).toContainText("2.6");
  const nums = await page.locator(".card .kv span:not(.k)").allTextContents();
  const counts = nums.map(Number).filter((n) => !Number.isNaN(n));
  expect(counts.reduce((a, b) => a + b, 0)).toBe(24);
});

test("SKL-02 mistakes with what to say", async ({ page }) => {
  await open(page, skillHref(B));
  const row = page.locator(".row", { hasText: "Adds an outward force in circular motion" });
  await expect(row).toContainText("Say: “Circular motion needs a net inward force.”");
  await expect(row.locator(".chip")).toHaveText(/\d+ students/);
});

test("SKL-03 needs first / opens up match the graph", async ({ page }) => {
  const id = "phy.mech.circ.centripetal-force";
  await open(page, skillHref(id));
  const needs = requiresOf(id).filter((x) => skillById[x]);
  const opens = unlocksOf(id).filter((x) => skillById[x]);
  const section = (h: string) => page.locator(`h2:has-text("${h}") + .list a`);
  await expect(section("Needs first")).toHaveCount(needs.length);
  await expect(section("Opens up")).toHaveCount(opens.length);
  for (const x of opens) await expect(section("Opens up").filter({ hasText: skillName(x) })).toHaveAttribute("href", skillHref(x));
  await section("Opens up").first().click();
  await expect(page.locator("h1")).toBeVisible();
});

test("SKL-04 unknown skill slug is a 404, not a crash", async ({ page }) => {
  const res = await page.goto("/skill/nope/");
  expect(res?.status()).toBe(404);
});
