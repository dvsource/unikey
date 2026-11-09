import { expect, test } from "@playwright/test";
import { STUDENT_ROUTES, open } from "./helpers";

test("PRV-01 effort-only student shows effort only", async ({ page }) => {
  await open(page, "/students/hasini/");
  await expect(page.locator(".card", { hasText: "Effort" }).first()).toBeVisible();
  await expect(page.locator(".shell")).toContainText("shares practice days only");
  await expect(page.locator(".bar")).toHaveCount(0);
  await expect(page.locator("h2")).toHaveCount(0);
  await expect(page.locator(".shell")).not.toContainText("Mistake pattern");
});

test("PRV-02 student waiting for consent shows effort only", async ({ page }) => {
  await open(page, "/students/nimal/");
  await expect(page.locator(".shell")).toContainText("once a parent confirms consent");
  await expect(page.locator(".bar")).toHaveCount(0);
  await expect(page.locator(".shell")).not.toContainText("Mistake pattern");
});

test("PRV-03 no marks, phone numbers, parent or payment details on any student page", async ({ page }) => {
  for (const r of STUDENT_ROUTES) {
    await open(page, r);
    // The page's own reassurance line mentions "marks"; everything else must not.
    const text = (await page.locator(".shell").innerText()).replace("No marks or individual answers are shown, only patterns.", "");
    expect(text, r).not.toMatch(/\b0?7\d[\s-]?\d{3}[\s-]?\d{4}\b|\+94/);
    expect(text, r).not.toMatch(/parent'?s? (name|number|phone)|payment|paid|LKR|rupee|marks?\b|\/\s?50/i);
  }
});
