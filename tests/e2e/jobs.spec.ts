import { expect, test } from "@playwright/test";

// Formular-Tests nur einmal (Desktop): Der Server hat ein Rate-Limit pro IP.
test.describe("Bewerbungsformular", () => {
  test.skip(({ isMobile }) => !!isMobile, "einmal reicht");

  test("prüft Pflichtfelder schon im Browser", async ({ page }) => {
    await page.goto("/jobs");
    await page.getByRole("button", { name: "Bewerbung senden" }).click();
    await expect(
      page.locator("form").getByText("Bitte gib einen Namen an"),
    ).toBeVisible();
    await expect(
      page.locator("form").getByText("Du musst mindestens 21 Jahre alt sein."),
    ).toBeVisible();
    await expect(
      page
        .locator("form")
        .getByText("Bitte gib eine Telefonnummer oder E-Mail-Adresse an."),
    ).toBeVisible();
    await expect(
      page.locator("form").getByText("Bitte bestätige die Einwilligung."),
    ).toBeVisible();
    await expect(page.getByLabel("Name oder Künstlername *")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  test("lehnt zu junge Bewerberinnen ab", async ({ page }) => {
    await page.goto("/jobs");
    await page.getByLabel("Name oder Künstlername *").fill("Nova");
    await page.getByLabel("Alter *").fill("19");
    await page.getByLabel("Telefon oder E-Mail *").fill("nova@example.com");
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: "Bewerbung senden" }).click();
    await expect(
      page.locator("form").getByText("Du musst mindestens 21 Jahre alt sein."),
    ).toBeVisible();
  });

  test("zeigt ohne SMTP eine klare Meldung statt eines Fehlers", async ({
    page,
  }) => {
    test.skip(!!process.env.SMTP_HOST, "nur ohne SMTP-Konfiguration");
    await page.goto("/jobs");
    await page.getByLabel("Name oder Künstlername *").fill("Nova");
    await page.getByLabel("Alter *").fill("25");
    await page.getByLabel("Telefon oder E-Mail *").fill("+49 170 1234567");
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: "Bewerbung senden" }).click();
    await expect(page.getByRole("alert").first()).toContainText(
      "noch nicht eingerichtet",
    );
  });
});
