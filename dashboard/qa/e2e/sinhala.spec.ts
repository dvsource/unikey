import { expect, test } from "@playwright/test";
import { open } from "./helpers";

test("SI-01 Sinhala names use Noto Sans Sinhala and render glyphs", async ({ page }) => {
  await open(page, "/");
  await page.evaluate(() => document.fonts.ready);
  const el = page.locator(".card .title .si").first();
  await expect(el).toBeVisible();
  const info = await el.evaluate((e) => {
    const fam = getComputedStyle(e).fontFamily;
    const loaded = [...document.fonts].some((f) => /Noto.Sans.Sinhala/i.test(f.family) && f.status === "loaded");
    return { fam, loaded, w: e.getBoundingClientRect().width };
  });
  expect(info.fam).toMatch(/Noto.Sans.Sinhala/i);
  expect(info.loaded).toBe(true);
  expect(info.w).toBeGreaterThan(50);
});

test("SI-02 Sinhala line height at least 1.5", async ({ page }) => {
  await open(page, "/");
  const ratio = await page.locator(".si").first().evaluate((e) => {
    const cs = getComputedStyle(e);
    return parseFloat(cs.lineHeight) / parseFloat(cs.fontSize);
  });
  expect(ratio).toBeGreaterThanOrEqual(1.5);
});
