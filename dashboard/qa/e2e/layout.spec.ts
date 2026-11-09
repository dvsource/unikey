import { expect, test } from "@playwright/test";
import { SAMPLE_ROUTES, open } from "./helpers";

async function noHorizontalScroll(page: import("@playwright/test").Page) {
  for (const r of SAMPLE_ROUTES) {
    await open(page, r);
    const { sw, cw } = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
    expect(sw, `${r} scrollWidth ${sw} > ${cw}`).toBeLessThanOrEqual(cw);
  }
}

test("LAY-01 no horizontal scroll at 375", async ({ page }) => {
  await noHorizontalScroll(page);
});

test.describe("small phone", () => {
  test.use({ viewport: { width: 320, height: 640 } });
  test("LAY-02 no horizontal scroll at 320", async ({ page }) => {
    await noHorizontalScroll(page);
  });
});

test.describe("desktop", () => {
  test.use({ viewport: { width: 1280, height: 800 }, isMobile: false, hasTouch: false });
  test("LAY-03 content column at most 560px and centred", async ({ page }) => {
    await open(page, "/");
    const box = (await page.locator(".shell").boundingBox())!;
    expect(box.width).toBeLessThanOrEqual(560);
    expect(Math.abs(box.x + box.width / 2 - 640)).toBeLessThan(10);
  });
});

test("LAY-04 last element clears the tab bar", async ({ page }) => {
  for (const r of ["/", "/students/", "/class/"]) {
    await open(page, r);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const tabsTop = (await page.locator("nav.tabs").boundingBox())!.y;
    const last = page.locator(".shell > *").last();
    const lb = (await last.boundingBox())!;
    expect(lb.y + lb.height, r).toBeLessThanOrEqual(tabsTop + 1);
  }
});
