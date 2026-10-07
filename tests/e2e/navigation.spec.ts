import { expect, test } from "@playwright/test";

test("Mobiles Vollbild-Menü öffnet, schließt mit Escape und navigiert", async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, "nur Handy");
  await page.goto("/");
  await page.getByRole("button", { name: "Menü öffnen" }).click();
  const menu = page.getByRole("dialog", { name: "Menü" });
  await expect(menu).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();

  await page.getByRole("button", { name: "Menü öffnen" }).click();
  await menu.getByRole("link", { name: "Preise" }).click();
  await expect(page).toHaveURL(/\/preise$/);
});

test("Sprachumschalter führt auf die englische Seite", async ({
  page,
  isMobile,
}) => {
  test.skip(!!isMobile, "Desktop-Header");
  await page.goto("/styleguide");
  await page.getByRole("link", { name: "English" }).first().click();
  await expect(page).toHaveURL(/\/en\/styleguide$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});

test("Anruf-Button ist auf dem Handy immer sichtbar", async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, "nur Handy");
  await page.goto("/styleguide");
  await page.mouse.wheel(0, 3000);
  const call = page.locator('a[href^="tel:"]').last();
  await expect(call).toBeInViewport();
});
