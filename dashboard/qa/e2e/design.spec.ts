import { expect, test } from "@playwright/test";
import { open } from "./helpers";

test("DS-01 primary buttons are Dawn yellow, at most one per card", async ({ page }) => {
  await open(page, "/");
  const bg = await page.locator(".btn.primary").first().evaluate((e) => getComputedStyle(e).backgroundColor);
  expect(bg).toBe("rgb(246, 196, 83)");
  for (const c of await page.locator(".card").all()) expect(await c.locator(".btn.primary").count()).toBeLessThanOrEqual(1);
});

test("DS-02 body uses the Dawn sky gradient", async ({ page }) => {
  await open(page, "/");
  const img = await page.evaluate(() => getComputedStyle(document.body).backgroundImage);
  expect(img).toContain("linear-gradient");
  expect(img).toContain("rgb(227, 236, 251)");
  expect(img).toContain("rgb(253, 234, 214)");
});

test("DS-03 bar colours: mastered green, fading terracotta", async ({ page }) => {
  await open(page, "/topics/");
  const color = (sel: string) => page.locator(sel).first().evaluate((e) => getComputedStyle(e).backgroundColor);
  expect(await color(".bar .c-mastered")).toBe("rgb(35, 105, 77)");
  expect(await color(".bar .c-fading")).toBe("rgb(196, 105, 63)");
});
