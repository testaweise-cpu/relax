import { expect, test } from "@playwright/test";

const EN_PAGES = [
  "/en",
  "/en/jetzt-da",
  "/en/mieterinnen",
  "/en/mieterinnen/aurora",
  "/en/preise",
  "/en/galerie",
  "/en/events",
  "/en/jobs",
  "/en/kontakt",
  "/en/impressum",
  "/en/datenschutz",
];
// Typische deutsche UI-Wörter, die auf englischen Seiten nicht auftauchen dürfen
const GERMAN =
  /\b(Anrufen|Jetzt da|Mieterinnen|Preise|Öffnungszeiten|Bewerbung senden|Häufige Fragen|Zimmermiete)\b/;

test.describe("Englische Version", () => {
  test.skip(({ isMobile }) => !!isMobile, "Desktop reicht");

  for (const path of EN_PAGES) {
    test(`englisch: ${path}`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator("html")).toHaveAttribute("lang", "en");
      const text = await page.locator("main, header, footer").allInnerTexts();
      expect(text.join(" ")).not.toMatch(GERMAN);
    });
  }

  test("Sprachwechsel bleibt auf derselben Seite", async ({ page }) => {
    await page.goto("/en/preise");
    await page.getByRole("link", { name: "Deutsch" }).first().click();
    await expect(page).toHaveURL(/\/preise$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "de");
  });
});
