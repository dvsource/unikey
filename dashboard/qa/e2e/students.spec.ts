import { expect, test } from "@playwright/test";
import { students } from "@/lib/data";
import { open } from "./helpers";

test("STU-01 quiet first, then A-Z", async ({ page }) => {
  await open(page, "/students/");
  const groups = page.locator("h2");
  await expect(groups.nth(0)).toContainText("Quiet");
  await expect(groups.nth(1)).toContainText("Everyone else");
  const quiet = await page.locator(".list").nth(0).locator(".name").allTextContents();
  expect(quiet).toEqual(["Kasun", "Dilan", "Ishara"]);
  const rest = await page.locator(".list").nth(1).locator(".name").allTextContents();
  expect(rest).toEqual([...rest].sort((a, b) => a.localeCompare(b)));
});

test("STU-02 24 rows, 7 day bars each, no scores", async ({ page }) => {
  await open(page, "/students/");
  const rows = page.locator("a.row");
  await expect(rows).toHaveCount(24);
  for (const r of await rows.all()) await expect(r.locator(".days i")).toHaveCount(7);
  // Rows only: the header's class practice readiness % is allowed.
  for (const l of await page.locator(".list").all()) await expect(l).not.toContainText(/%|score|rank/i);
});

test("STU-03 sharing chips", async ({ page }) => {
  await open(page, "/students/");
  await expect(page.locator(".chip", { hasText: "shares effort only" })).toHaveCount(4);
  await expect(page.locator("a.row", { hasText: "Nimal" }).locator(".chip")).toHaveText("waiting for parent consent");
});

test("STU-04 sharing student detail", async ({ page }) => {
  expect(students.find((s) => s.id === "tharushi")!.sharing).toBe("effort+skills");
  await open(page, "/students/tharushi/");
  await expect(page.locator(".card", { hasText: "Effort" })).toContainText("Practice days, last 4 weeks");
  await expect(page.locator("h2", { hasText: "Mechanics by topic" })).toBeVisible();
  await expect(page.locator("h2:has-text('Mechanics by topic') + .list .bar")).toHaveCount(8);
  await expect(page.locator(".card", { hasText: "Mistake pattern" })).toBeVisible();
});
