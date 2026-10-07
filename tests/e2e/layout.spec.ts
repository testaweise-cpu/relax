import { expect, test } from "@playwright/test";

// Kein horizontales Scrollen und kein "Herauszoomen" auf dem Handy:
// Das Layout-Viewport muss exakt so breit sein wie das Gerät.
const PAGES = [
  "/",
  "/mieterinnen",
  "/mieterinnen?sprache=de",
  "/mieterinnen/carmen",
  "/jetzt-da",
  "/styleguide",
  "/en/mieterinnen",
];

for (const path of PAGES) {
  test(`kein Überlauf: ${path}`, async ({ page }) => {
    await page.goto(path);
    const deviceWidth = page.viewportSize()!.width;
    const { inner, scroll } = await page.evaluate(() => ({
      inner: window.innerWidth,
      scroll: document.documentElement.scrollWidth,
    }));
    expect(inner, "Layout-Viewport breiter als das Gerät").toBe(deviceWidth);
    expect(scroll).toBeLessThanOrEqual(deviceWidth);
  });
}
