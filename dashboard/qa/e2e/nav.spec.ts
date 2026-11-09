import { expect, test } from "@playwright/test";
import { MAIN_ROUTES, SKILL_ROUTES, STUDENT_ROUTES, open } from "./helpers";

test("NAV-01 tabs shown, This week current", async ({ page }) => {
  await open(page, "/");
  const tabs = page.locator("nav.tabs a");
  await expect(tabs).toHaveText(["This week", "Topics", "Students"]);
  await expect(tabs.nth(0)).toHaveClass(/on/);
});

test("NAV-02 each tab opens its page", async ({ page }) => {
  await open(page, "/");
  for (const [name, heading] of [["Topics", "Topics"], ["Students", "Students"], ["This week", "This week"]]) {
    await page.locator("nav.tabs a", { hasText: name }).click();
    await expect(page.locator("h1")).toHaveText(heading);
    await expect(page.locator("nav.tabs a.on")).toHaveText(name);
  }
});

test("NAV-03 every route returns 200 and has an h1", async ({ page, request }) => {
  const routes = [...MAIN_ROUTES, ...SKILL_ROUTES, ...STUDENT_ROUTES];
  expect(routes).toHaveLength(7 + 83 + 24);
  for (const r of routes) {
    const res = await request.get(r);
    expect(res.status(), r).toBe(200);
    expect(await res.text(), r).toContain("<h1");
  }
  await open(page, SKILL_ROUTES[0]);
  await expect(page.locator("h1")).toBeVisible();
});

test("NAV-04 no in-app link leads to a 404", async ({ page, request }) => {
  const seen = new Set<string>();
  for (const r of [...MAIN_ROUTES, "/students/tharushi/", SKILL_ROUTES[40]]) {
    await open(page, r);
    const hrefs = await page.locator("a[href^='/']").evaluateAll((as) => as.map((a) => a.getAttribute("href")!));
    hrefs.forEach((h) => seen.add(h.split("#")[0]));
  }
  // also links shown inside expanded topic rows
  for (const h of seen) {
    const res = await request.get(h);
    expect(res.status(), h).toBe(200);
  }
  expect(seen.size).toBeGreaterThan(10);
});

test("NAV-05 class name in header opens Class setup", async ({ page }) => {
  await open(page, "/");
  await page.locator("header .cls").click();
  await expect(page.locator("h1")).toHaveText("Class setup");
});

test("NAV-06 back links", async ({ page }) => {
  await open(page, "/students/tharushi/");
  await page.getByRole("link", { name: "‹ Students" }).click();
  await expect(page.locator("h1")).toHaveText("Students");
  await open(page, SKILL_ROUTES[0]);
  await page.getByRole("link", { name: "‹ This week" }).click();
  await expect(page.locator("h1")).toHaveText("This week");
});
