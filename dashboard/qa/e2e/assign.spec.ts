import { expect, test } from "@playwright/test";
import { insights, skillHref, skillName, skills } from "@/lib/data";
import { card, open, toast } from "./helpers";

const sheet = (page: import("@playwright/test").Page) => page.locator(".sheet");

test("ASN-01 sheet opens with suggested skills first and ticked", async ({ page }) => {
  await open(page, "/");
  await card(page, "Reteach the root cause").getByRole("button", { name: "Assign as practice" }).click();
  const s = sheet(page);
  await expect(s).toContainText("No notification, and students can skip it");
  const boxes = s.locator("label.check");
  await expect(boxes.nth(0)).toContainText(skillName(insights.rootCause.root));
  await expect(boxes.nth(1)).toContainText(skillName(insights.rootCause.bottleneck));
  await expect(boxes.nth(0).locator("input")).toBeChecked();
  await expect(boxes.nth(1).locator("input")).toBeChecked();
  const n = await boxes.count();
  for (let i = 2; i < n; i++) await expect(boxes.nth(i).locator("input")).not.toBeChecked();
});

test("ASN-02 assigning shows a toast and the home banner", async ({ page }) => {
  await open(page, "/");
  await card(page, "Reteach the root cause").getByRole("button", { name: "Assign as practice" }).click();
  await sheet(page).getByRole("button", { name: "Assign to 24 students" }).click();
  await toast(page, "Assigned to 24 students");
  await expect(sheet(page)).toHaveCount(0);
  const banner = card(page, "Assigned for the week of Mon 1 Feb");
  await expect(banner).toContainText(skillName(insights.rootCause.root));
  await expect(banner).toContainText(skillName(insights.rootCause.bottleneck));
});

test("ASN-03 nothing ticked disables Assign", async ({ page }) => {
  await open(page, "/");
  await card(page, "Reteach the root cause").getByRole("button", { name: "Assign as practice" }).click();
  const boxes = sheet(page).locator("label.check input:checked");
  while ((await boxes.count()) > 0) await boxes.first().uncheck();
  await expect(sheet(page).getByRole("button", { name: /Assign to/ })).toBeDisabled();
});

test("ASN-04 cancel and backdrop close without assigning", async ({ page }) => {
  await open(page, "/");
  const btn = card(page, "Reteach the root cause").getByRole("button", { name: "Assign as practice" });
  await btn.click();
  await sheet(page).getByRole("button", { name: "Cancel" }).click();
  await expect(sheet(page)).toHaveCount(0);
  await btn.click();
  await page.locator(".scrim").click({ position: { x: 10, y: 10 } });
  await expect(sheet(page)).toHaveCount(0);
  await expect(page.locator(".card", { hasText: "Assigned for the week" })).toHaveCount(0);
});

test("ASN-05 count follows removed students", async ({ page }) => {
  await open(page, "/class/");
  page.once("dialog", (d) => d.accept());
  await page.locator(".row", { hasText: "Kasun" }).getByRole("button", { name: "Remove" }).click();
  await open(page, "/");
  await card(page, "Reteach the root cause").getByRole("button", { name: "Assign as practice" }).click();
  await expect(sheet(page).getByRole("button", { name: "Assign to 23 students" })).toBeVisible();
});

test("ASN-06 assign from a topic lists that topic's practised skills, none ticked", async ({ page }) => {
  await open(page, "/topics/");
  await page.locator("#phy\\.mech\\.2\\.3 button.row").click();
  await page.locator("#phy\\.mech\\.2\\.3").getByRole("button", { name: "Assign from this topic" }).click();
  const expected = skills.filter((s) => s.topic === "phy.mech.2.3" && s.mastery === "practised").length;
  await expect(sheet(page).locator("label.check")).toHaveCount(expected);
  await expect(sheet(page).locator("label.check input:checked")).toHaveCount(0);
});

test("ASN-07 assign from a skill page pre-ticks it", async ({ page }) => {
  const id = "phy.mech.newton.second-law";
  await open(page, skillHref(id));
  await page.getByRole("button", { name: "Assign as practice" }).click();
  await expect(sheet(page).locator("label.check").first()).toContainText(skillName(id));
  await expect(sheet(page).locator("label.check input:checked")).toHaveCount(1);
});
