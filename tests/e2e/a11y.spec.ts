import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { en, MAIN_PAGES } from "./pages";

// Automatische Prüfung nach WCAG 2.1 AA mit axe-core. Ersetzt keinen Test mit
// Screenreader, findet aber fehlende Labels, Kontrastfehler, falsche ARIA usw.
const WCAG = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

async function check(page: import("@playwright/test").Page) {
  // Einschalt-Animation des Neon-Logos abwarten (sonst misst axe Zwischenstände)
  await page.waitForTimeout(1800);
  const { violations } = await new AxeBuilder({ page })
    .withTags(WCAG)
    .analyze();
  const summary = violations.map(
    (v) => `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target).join(" | ")}`,
  );
  expect(summary).toEqual([]);
}

for (const path of [...MAIN_PAGES, en("/"), en("/preise")]) {
  test(`axe: ${path}`, async ({ page }) => {
    await page.goto(path);
    await check(page);
  });
}

test("axe: Altersabfrage", async ({ browser, baseURL }) => {
  const ctx = await browser.newContext({
    baseURL,
    storageState: { cookies: [], origins: [] },
  });
  const page = await ctx.newPage();
  await page.goto("/");
  await expect(page.getByRole("dialog", { name: "Willkommen" })).toBeVisible();
  await check(page);
  await ctx.close();
});

test("axe: geöffnetes Handy-Menü", async ({ page, isMobile }) => {
  test.skip(!isMobile, "Menü-Button nur auf dem Handy");
  await page.goto("/");
  await page.getByRole("button", { name: "Menü öffnen" }).click();
  await expect(page.getByRole("dialog", { name: "Menü" })).toBeVisible();
  await check(page);
});
