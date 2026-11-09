import { expect, test } from "@playwright/test";
import { SAMPLE_ROUTES, open } from "./helpers";

async function scan(page: import("@playwright/test").Page, fn: (body: string, controls: string[], route: string) => void) {
  for (const r of SAMPLE_ROUTES) {
    await open(page, r);
    const body = await page.locator("body").innerText();
    const controls = await page.locator("button, a").allInnerTexts();
    fn(body, controls, r);
  }
}

test("RULE-01 no nudge / message / remind controls (DR-0038)", async ({ page }) => {
  await scan(page, (_b, controls, r) => {
    for (const c of controls) expect(c, `${r}: "${c}"`).not.toMatch(/nudge|remind|notify|message (him|her|them|student)|send .*to (student|kasun)/i);
  });
});

test("RULE-02 no earnings / affiliate / payout content (DR-0040)", async ({ page }) => {
  await scan(page, (body, _c, r) => expect(body, r).not.toMatch(/\bearn|affiliate|payout|\bLKR\b|rupee|commission/i));
});

test("RULE-03 no ranking of students", async ({ page }) => {
  await scan(page, (body, _c, r) => expect(body, r).not.toMatch(/leaderboard|\brank|top student|worst student|best student/i));
});

test("RULE-04 no predicted marks; readiness labelled practice readiness", async ({ page }) => {
  await scan(page, (body, _c, r) => {
    expect(body, r).not.toMatch(/\/\s?50\b|predicted|expected mark|you will get/i);
    if (/readiness/i.test(body)) expect(body, r).toMatch(/practice readiness/i);
  });
});

test("RULE-05 no class sets / projector / show 3 questions (DR-0042)", async ({ page }) => {
  await scan(page, (body, _c, r) => expect(body, r).not.toMatch(/\bclass sets?\b|projector|show 3 questions/i));
});

test("RULE-06 at most 3 action cards on home", async ({ page }) => {
  await open(page, "/");
  await expect(page.locator(".card .kicker .n")).toHaveCount(3);
});
