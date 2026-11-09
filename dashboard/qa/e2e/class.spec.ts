import { expect, test } from "@playwright/test";
import { open, toast } from "./helpers";

test("CLS-01 code, QR and share button", async ({ page }) => {
  await open(page, "/class/");
  await expect(page.locator(".code")).toHaveText("ANU-7K3Q");
  await expect(page.locator(".qr svg")).toBeVisible();
  await expect(page.getByRole("link", { name: "Share on WhatsApp" })).toBeVisible();
});

test("CLS-02 share link carries code and join URL, new tab", async ({ page }) => {
  await open(page, "/class/");
  const a = page.getByRole("link", { name: "Share on WhatsApp" });
  const href = decodeURIComponent((await a.getAttribute("href"))!);
  expect(href).toMatch(/^https:\/\/wa\.me\/\?text=/);
  expect(href).toContain("ANU-7K3Q");
  expect(href).toContain("/join/ANU-7K3Q");
  await expect(a).toHaveAttribute("target", "_blank");
});

test("CLS-03 Teaching now changes home and topics", async ({ page }) => {
  await open(page, "/class/");
  await page.locator("select").selectOption("phy.mech.2.3");
  await toast(page, "Teaching now updated");
  await page.locator("nav.tabs a", { hasText: "This week" }).click();
  await expect(page.locator(".lead a")).toHaveText("2.3 Newton's laws of motion");
  await page.locator("nav.tabs a", { hasText: "Topics" }).click();
  await expect(page.locator("#phy\\.mech\\.2\\.3 .chip", { hasText: "teaching now" })).toBeVisible();
  await expect(page.locator("#phy\\.mech\\.2\\.3 a").first()).toBeVisible();
});

test("CLS-04 / PRV-05 remove a student", async ({ page }) => {
  await open(page, "/class/");
  page.once("dialog", (d) => d.accept());
  await page.locator(".row", { hasText: "Kasun" }).getByRole("button", { name: "Remove" }).click();
  await expect(page.locator("h2", { hasText: "Students who joined" })).toContainText("(23)");
  await expect(page.locator("header .sub")).toContainText("23 joined");
  await page.locator("nav.tabs a", { hasText: "Students" }).click();
  await expect(page.locator("a.row")).toHaveCount(23);
  await expect(page.locator("a.row", { hasText: "Kasun" })).toHaveCount(0);
});

test("CLS-05 dismissing the confirm removes nobody", async ({ page }) => {
  await open(page, "/class/");
  page.once("dialog", (d) => d.dismiss());
  await page.locator(".row", { hasText: "Kasun" }).getByRole("button", { name: "Remove" }).click();
  await expect(page.locator("h2", { hasText: "Students who joined" })).toContainText("(24)");
});

test("CLS-06 copy text", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await open(page, "/class/");
  await page.getByRole("button", { name: "Copy text" }).click();
  await expect(page.getByRole("button", { name: "Copied" })).toBeVisible();
});
