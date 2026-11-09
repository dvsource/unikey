import { expect, test } from "@playwright/test";
import { card, open, storeState, toast } from "./helpers";

test("FB-01 every insight card has Useful / Not right?", async ({ page }) => {
  await open(page, "/");
  for (const k of ["Reteach the root cause", "Clear up a misconception", "Quiet students"]) {
    const c = card(page, k);
    await expect(c.getByRole("button", { name: "Useful" })).toBeVisible();
    await expect(c.getByRole("button", { name: "Not right?" })).toBeVisible();
  }
});

test("FB-02 Useful is logged", async ({ page }) => {
  await open(page, "/");
  const c = card(page, "Reteach the root cause");
  await c.getByRole("button", { name: "Useful" }).click();
  await toast(page, "Thanks. Marked useful.");
  await expect(c.getByRole("button", { name: "Useful" })).toHaveClass(/on/);
  const s = await storeState(page);
  expect(s.feedback).toHaveLength(1);
  expect(s.feedback[0]).toMatchObject({ cardId: "root-cause-2027-02-01", verdict: "useful" });
});

test("FB-03 Not right? with a note is logged; FBL-02 shows in the log", async ({ page }) => {
  await open(page, "/");
  const c = card(page, "Clear up a misconception");
  await c.getByRole("button", { name: "Not right?" }).click();
  await c.locator("textarea").fill("they know this, the wording confused them");
  await c.getByRole("button", { name: "Send" }).click();
  await toast(page, "We'll check this insight");
  const s = await storeState(page);
  expect(s.feedback[0]).toMatchObject({ cardId: "misconception-2027-02-01", verdict: "not-right", note: "they know this, the wording confused them" });

  await open(page, "/feedback/");
  await expect(page.locator(".list")).toContainText("Not right");
  await expect(page.locator(".list")).toContainText("misconception-2027-02-01");
  await expect(page.locator(".list")).toContainText("they know this, the wording confused them");
  const href = await page.getByRole("link", { name: "Send on WhatsApp" }).getAttribute("href");
  expect(decodeURIComponent(href!)).toContain('"verdict": "not-right"');
});

test("FB-04 Cancel saves nothing", async ({ page }) => {
  await open(page, "/");
  const c = card(page, "Quiet students");
  await c.getByRole("button", { name: "Not right?" }).click();
  await c.locator("textarea").fill("x");
  await c.getByRole("button", { name: "Cancel" }).click();
  await expect(c.locator("textarea")).toHaveCount(0);
  expect((await storeState(page)).feedback ?? []).toHaveLength(0);
});

test("FB-05 latest verdict wins", async ({ page }) => {
  await open(page, "/");
  const c = card(page, "Reteach the root cause");
  await c.getByRole("button", { name: "Useful" }).click();
  await c.getByRole("button", { name: "Not right?" }).click();
  await c.getByRole("button", { name: "Send" }).click();
  await expect(c.getByRole("button", { name: "Not right?" })).toHaveClass(/on/);
  await expect(c.getByRole("button", { name: "Useful" })).not.toHaveClass(/on/);
  expect((await storeState(page)).feedback).toHaveLength(2);
});

test("FBL-01 empty log", async ({ page }) => {
  await open(page, "/feedback/");
  await expect(page.locator(".list")).toContainText("Nothing yet.");
});
