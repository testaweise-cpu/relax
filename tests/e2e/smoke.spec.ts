import { expect, test } from "@playwright/test";

// Phase 1: Grundgerüst. Die Smoke-Tests aller Hauptseiten folgen in Phase 8.

test("Startseite DE lädt ohne horizontales Scrollen", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "de");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  const width = page.viewportSize()!.width;
  expect(await page.evaluate(() => window.innerWidth)).toBe(width);
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(width);
});

test("Englische Version unter /en", async ({ page }) => {
  await page.goto("/en");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});

test("Keine externen Requests (Fonts, Tracking)", async ({ page, baseURL }) => {
  const external: string[] = [];
  page.on("request", (req) => {
    if (!req.url().startsWith(baseURL!) && !req.url().startsWith("data:")) {
      external.push(req.url());
    }
  });
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  expect(external).toEqual([]);
});
