import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { open } from "./helpers";

const PAGES = ["/", "/topics/", "/students/", "/students/tharushi/", "/class/", "/signin/", "/digest/"];

for (const p of PAGES) {
  test(`A11Y-01 no critical/serious axe violations on ${p}`, async ({ page }) => {
    await open(page, p);
    const r = await new AxeBuilder({ page }).analyze();
    const bad = r.violations.filter((v) => v.impact === "critical" || v.impact === "serious");
    expect(bad.map((v) => `${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ")}`)).toEqual([]);
  });
}

test("A11Y-02 lang and title", async ({ page }) => {
  await open(page, "/");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page).toHaveTitle("UniKey Teacher");
});

test("A11Y-03 day bars have an aria-label", async ({ page }) => {
  await open(page, "/students/");
  await expect(page.locator(".days").first()).toHaveAttribute("aria-label", /^\d of 7 days$/);
});
