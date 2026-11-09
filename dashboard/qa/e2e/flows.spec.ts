import { expect, test } from "@playwright/test";
import { activeThisWeek, classReadiness, quietStudents, students } from "@/lib/data";
import { open } from "./helpers";

test("SIGN-01 sign-in to class code", async ({ page }) => {
  await open(page, "/signin/");
  await page.getByPlaceholder("07X XXX XXXX").fill("0771234567");
  await page.getByRole("button", { name: "Send code by SMS" }).click();
  await page.getByPlaceholder("••••••").fill("123456");
  await page.getByPlaceholder("Your name").fill("Test Teacher");
  await page.getByPlaceholder("School or tuition class").fill("Test school");
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("button", { name: "Create class" }).click();
  await expect(page.locator(".card")).toContainText("Your class code");
  await expect(page.locator(".code")).toHaveText("ANU-7K3Q");
  await expect(page.getByRole("link", { name: "Share class code" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Go to This week" })).toBeVisible();
});

test("SIGN-02 short number keeps Send disabled", async ({ page }) => {
  await open(page, "/signin/");
  await page.getByPlaceholder("07X XXX XXXX").fill("0771");
  await expect(page.getByRole("button", { name: "Send code by SMS" })).toBeDisabled();
});

test("DIG-01 / DIG-02 digest content matches the dashboard", async ({ page }) => {
  await open(page, "/digest/");
  const wa = page.locator(".wa");
  await expect(wa).toContainText(`${activeThisWeek.length} of ${students.length} practised this week`);
  await expect(wa).toContainText(`practice readiness ${classReadiness}%`);
  await expect(wa).toContainText("9 students are stuck");
  await expect(wa).toContainText("11 students think");
  await expect(wa).toContainText(`3 quiet students: ${quietStudents.map((s) => s.name).join(", ")}`);
  await expect(wa).toContainText("What was missing?");
  await wa.getByRole("link", { name: "Open your class →" }).click();
  await expect(page.locator("h1")).toHaveText("This week");
});
