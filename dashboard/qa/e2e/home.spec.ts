import { expect, test } from "@playwright/test";
import { insights, skillName, tags } from "@/lib/data";
import { card, open } from "./helpers";

test.beforeEach(async ({ page }) => open(page, "/"));

test("HOME-01 header", async ({ page }) => {
  const h = page.locator("header.head");
  await expect(h).toContainText("Grade 13 · 2027 batch");
  await expect(h).toContainText("24 joined · 18 active this week");
  await expect(h.locator(".num")).toHaveText(/^\d{1,3}%$/);
  await expect(h).toContainText("practice readiness");
});

test("HOME-02 root-cause card", async ({ page }) => {
  const c = card(page, "Reteach the root cause");
  const rc = insights.rootCause;
  await expect(c.locator(".chain .node").nth(0)).toHaveText(skillName(rc.root));
  await expect(c.locator(".chain .node").nth(1)).toHaveText(skillName(rc.bottleneck));
  await expect(c.locator(".chain .who")).toHaveText("9 students");
  await expect(c).toContainText("Based on prerequisite checks from 7 students");
});

test("HOME-03 misconception card", async ({ page }) => {
  const c = card(page, "Clear up a misconception");
  await expect(c.locator(".quote")).toHaveText("There's an outward force pushing it out");
  await expect(c).toContainText("11 students");
  await expect(c).toContainText(tags.centrifugal.message);
});

test("HOME-04 quiet students card links to each student", async ({ page }) => {
  const c = card(page, "Quiet students");
  await expect(c).toContainText("3 haven't practised for a week or more");
  const chips = c.locator(".names a");
  await expect(chips).toHaveCount(3);
  await expect(chips).toContainText(["Kasun", "Dilan", "Ishara"]);
  await expect(chips.first()).toHaveText(/Kasun · \d+ days/);
  await chips.nth(1).click();
  await expect(page.locator("h1")).toContainText("Dilan");
});

test("HOME-05 fading rows open Topics with that topic expanded", async ({ page }) => {
  const rows = page.locator("h2:has-text('Fading') + .list a");
  await expect(rows).toHaveCount(2);
  await rows.nth(1).click();
  await expect(page).toHaveURL(/\/topics\/#phy\.mech\.2\.3$/);
  await expect(page.locator("#phy\\.mech\\.2\\.3 a").first()).toBeVisible();
});

test("HOME-06 teaching-now link", async ({ page }) => {
  const l = page.locator(".lead a");
  await expect(l).toHaveText("2.6 Rotational motion and circular motion");
  await l.click();
  await expect(page.locator("h1")).toHaveText("Class setup");
});

test("HOME-07 open the root skill", async ({ page }) => {
  await card(page, "Reteach the root cause").getByRole("link", { name: "Open the skill" }).click();
  await expect(page.locator("h1")).toHaveText(skillName(insights.rootCause.root));
});

test("HOME-08 digest link", async ({ page }) => {
  await page.getByRole("link", { name: /what you'd get on WhatsApp/ }).click();
  await expect(page.locator("h1")).toHaveText("Sunday digest");
});
