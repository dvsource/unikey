import { expect, test } from "@playwright/test";
import { MAIN_ROUTES, SAMPLE_ROUTES, open } from "./helpers";

test("CON-01 no console errors or failed requests on any page", async ({ page }) => {
  const problems: string[] = [];
  page.on("console", (m) => m.type() === "error" && problems.push(`console: ${m.text()} @ ${page.url()}`));
  page.on("pageerror", (e) => problems.push(`pageerror: ${e.message}`));
  page.on("response", (r) => r.status() >= 400 && problems.push(`${r.status()} ${r.url()}`));
  for (const r of SAMPLE_ROUTES) await open(page, r);
  expect(problems).toEqual([]);
});

test("CON-02 client navigation has no failed prefetches", async ({ page }) => {
  const failed: string[] = [];
  page.on("response", (r) => r.status() >= 400 && failed.push(`${r.status()} ${r.url()}`));
  await open(page, "/");
  for (const t of ["Topics", "Students", "This week"]) {
    await page.locator("nav.tabs a", { hasText: t }).click();
    await page.waitForLoadState("networkidle");
  }
  await page.getByRole("link", { name: "Open the skill" }).click();
  await page.waitForLoadState("networkidle");
  await page.locator("nav.tabs a", { hasText: "Topics" }).click();
  await page.locator("#phy\\.mech\\.2\\.6 a").first().click();
  await page.waitForLoadState("networkidle");
  expect(failed).toEqual([]);
  expect(MAIN_ROUTES.length).toBeGreaterThan(0);
});
