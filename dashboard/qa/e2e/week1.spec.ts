import { expect, test } from "@playwright/test";
import { goToClassAndToggleWeek1 } from "./helpers";

test("W1-01 home shows the week-1 empty state", async ({ page }) => {
  await goToClassAndToggleWeek1(page);
  await page.locator("nav.tabs a", { hasText: "This week" }).click();
  await expect(page.locator("header .sub")).toHaveText("11 joined · 3 active this week");
  await expect(page.locator("header .num")).toHaveText("—");
  await expect(page.locator(".card", { hasText: "From the starting quick check" })).toBeVisible();
  await expect(page.locator(".card.empty")).toContainText("Patterns appear once 5 students have practised");
  for (const k of ["Reteach the root cause", "Clear up a misconception", "Quiet students"])
    await expect(page.locator(".card .kicker", { hasText: k })).toHaveCount(0);
});

test("FB-06 week-1 placement card has feedback", async ({ page }) => {
  await goToClassAndToggleWeek1(page);
  await page.locator("nav.tabs a", { hasText: "This week" }).click();
  const c = page.locator(".card", { hasText: "From the starting quick check" });
  await expect(c.getByRole("button", { name: "Useful" })).toBeVisible();
  await expect(c.getByRole("button", { name: "Not right?" })).toBeVisible();
});

test("W1-02 topics empty in week 1", async ({ page }) => {
  await goToClassAndToggleWeek1(page);
  await page.locator("nav.tabs a", { hasText: "Topics" }).click();
  await expect(page.locator(".card.empty")).toContainText("Topic bars appear once 5 students have practised");
  await expect(page.locator(".bar")).toHaveCount(0);
});
