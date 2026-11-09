import { expect, type Page } from "@playwright/test";
import { skillHref, skills, students } from "@/lib/data";

export const STORE_KEY = "unikey-dashboard-p0";
export const MAIN_ROUTES = ["/", "/topics/", "/students/", "/class/", "/signin/", "/digest/", "/feedback/"];
export const SKILL_ROUTES = skills.map((s) => skillHref(s.id));
export const STUDENT_ROUTES = students.map((s) => `/students/${s.id}/`);
export const SAMPLE_ROUTES = [
  ...MAIN_ROUTES,
  skillHref("phy.mech.circ.friction-limit"),
  skillHref("phy.mech.circ.centripetal-force"),
  "/students/tharushi/",
  "/students/hasini/",
  "/students/nimal/",
  "/students/kasun/",
];

/** Wait until the client has hydrated and read localStorage (the tab bar is client-rendered). */
export async function ready(page: Page) {
  await page.waitForLoadState("networkidle");
}

export async function open(page: Page, path: string) {
  await page.goto(path);
  await ready(page);
}

export const card = (page: Page, kicker: string) => page.locator(".card", { hasText: kicker });

export async function toast(page: Page, text: string | RegExp) {
  await expect(page.locator(".toast")).toContainText(text);
}

export async function storeState(page: Page) {
  return page.evaluate((k) => JSON.parse(localStorage.getItem(k) || "{}"), STORE_KEY);
}

export async function goToClassAndToggleWeek1(page: Page) {
  await open(page, "/class/");
  await page.getByLabel("Preview week 1").check();
}
