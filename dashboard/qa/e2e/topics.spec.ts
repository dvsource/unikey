import { expect, test } from "@playwright/test";
import { badness, skillHref, skillName, skills, topicDist, topics } from "@/lib/data";
import { open } from "./helpers";

test.beforeEach(async ({ page }) => open(page, "/topics/"));

test("TOP-01 8 rows with bars and a 5-state legend", async ({ page }) => {
  await expect(page.locator(".list > div > button.row")).toHaveCount(8);
  await expect(page.locator(".list > div > button.row .bar")).toHaveCount(8);
  await expect(page.locator(".legend span")).toHaveText(["Mastered", "Practising", "Stuck / learning", "Fading", "Not started"]);
});

test("TOP-02 worst first", async ({ page }) => {
  const expected = [...topics].sort((a, b) => badness(topicDist(b.id)) - badness(topicDist(a.id))).map((t) => t.id);
  const ids = await page.locator(".list > div[id]").evaluateAll((ds) => ds.map((d) => d.id));
  expect(ids).toEqual(expected);
});

test("TOP-03 teaching-now topic expanded and tagged", async ({ page }) => {
  const t = page.locator("#phy\\.mech\\.2\\.6");
  await expect(t.locator(".chip", { hasText: "teaching now" })).toBeVisible();
  await expect(t.locator("a").first()).toBeVisible();
});

test("TOP-04 expand and collapse", async ({ page }) => {
  const t = page.locator("#phy\\.mech\\.2\\.7");
  await t.locator("button.row").click();
  await expect(t.locator("a").first()).toBeVisible();
  await expect(page.locator("#phy\\.mech\\.2\\.6 a")).toHaveCount(0);
  await t.locator("button.row").click();
  await expect(t.locator("a")).toHaveCount(0);
});

test("TOP-05 skill rows are practised skills and open the skill", async ({ page }) => {
  const practised = skills.filter((s) => s.topic === "phy.mech.2.6" && s.mastery === "practised");
  const rows = page.locator("#phy\\.mech\\.2\\.6 a");
  await expect(rows).toHaveCount(practised.length);
  const href = await rows.first().getAttribute("href");
  expect(practised.map((s) => skillHref(s.id))).toContain(href);
  await rows.first().click();
  await expect(page).toHaveURL(new RegExp(href!.replace(/\//g, "\\/") + "$"));
  const id = practised.find((s) => skillHref(s.id) === href)!.id;
  await expect(page.locator("h1")).toHaveText(skillName(id));
});

test("TOP-06 / PRV-04 note about anonymous class totals", async ({ page }) => {
  await expect(page.locator("p.note")).toContainText("anonymous class totals");
});
