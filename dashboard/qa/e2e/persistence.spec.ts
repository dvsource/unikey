import { expect, test } from "@playwright/test";
import { STORE_KEY, card, open, storeState, toast } from "./helpers";

test("PER-01 assignment, feedback, topic and removal survive a reload", async ({ page }) => {
  await open(page, "/");
  await card(page, "Reteach the root cause").getByRole("button", { name: "Useful" }).click();
  await card(page, "Reteach the root cause").getByRole("button", { name: "Assign as practice" }).click();
  await page.locator(".sheet").getByRole("button", { name: /Assign to/ }).click();
  await open(page, "/class/");
  await page.locator("select").selectOption("phy.mech.2.5");
  page.once("dialog", (d) => d.accept());
  await page.locator(".row", { hasText: "Ishara" }).getByRole("button", { name: "Remove" }).click();

  await page.reload();
  await page.waitForLoadState("networkidle");
  await expect(page.locator("select")).toHaveValue("phy.mech.2.5");
  await expect(page.locator(".row", { hasText: "Ishara" })).toHaveCount(0);
  await open(page, "/");
  await expect(card(page, "Assigned for the week")).toBeVisible();
  await expect(card(page, "Reteach the root cause").getByRole("button", { name: "Useful" })).toHaveClass(/on/);
  const s = await storeState(page);
  expect(s).toMatchObject({ teachingNow: "phy.mech.2.5", removed: ["ishara"] });
});

test("PER-02 reset", async ({ page }) => {
  await open(page, "/class/");
  await page.locator("select").selectOption("phy.mech.2.1");
  await page.getByRole("button", { name: "Reset" }).click();
  await toast(page, "Prototype reset");
  await expect(page.locator("select")).toHaveValue("phy.mech.2.6");
  expect((await storeState(page)).teachingNow).toBe("phy.mech.2.6");
});

test("PER-03 corrupt storage falls back to defaults", async ({ page }) => {
  await page.addInitScript((k) => localStorage.setItem(k, "{not json"), STORE_KEY);
  await open(page, "/");
  await expect(page.locator("h1")).toHaveText("This week");
  await expect(card(page, "Reteach the root cause")).toBeVisible();
});

test("PER-04 blocked storage still renders", async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => { throw new Error("blocked"); };
    Storage.prototype.setItem = () => { throw new Error("blocked"); };
  });
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await open(page, "/");
  await expect(card(page, "Reteach the root cause")).toBeVisible();
  await card(page, "Reteach the root cause").getByRole("button", { name: "Useful" }).click();
  expect(errors).toEqual([]);
});
