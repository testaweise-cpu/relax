import { expect, test } from "@playwright/test";

test.describe("Mieterinnen", () => {
  test("Filter landen im URL und lassen sich teilen", async ({ page }) => {
    await page.goto("/mieterinnen");
    const before = await page.locator(".sedcard").count();
    await page
      .getByRole("group", { name: "Filter" })
      .getByRole("link", { name: /^Jetzt da/ })
      .click();
    await expect(page).toHaveURL(/\/mieterinnen\?jetzt=1$/);
    const after = await page.locator(".sedcard").count();
    expect(after).toBeGreaterThan(0);
    expect(after).toBeLessThan(before);
    // Direktaufruf mit Filter liefert dasselbe Ergebnis
    await page.goto("/mieterinnen?jetzt=1");
    await expect(page.locator(".sedcard")).toHaveCount(after);
  });

  test("Sedcard mit Wochenplan; unbekannter Slug ergibt 404", async ({
    page,
  }) => {
    await page.goto("/mieterinnen/carmen");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Carmen");
    await expect(page.getByRole("table")).toBeVisible();
    await expect(page.getByRole("table").getByRole("row")).toHaveCount(7);
    const res = await page.goto("/mieterinnen/gibtsnicht");
    expect(res?.status()).toBe(404);
  });

  test("Lightbox öffnet, zeigt Zähler und schließt mit Escape", async ({
    page,
  }) => {
    await page.goto("/mieterinnen/carmen");
    await page.getByRole("button", { name: /Bild 1 von 3 vergrößern/ }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("Bild 1 von 3")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("Profil ohne Schichten ist erreichbar, aber noindex", async ({
    page,
  }) => {
    await page.goto("/mieterinnen/kira");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      /noindex/,
    );
  });
});

test.describe("Jetzt da", () => {
  test("lädt alle 60 s neu, solange der Tab sichtbar ist", async ({ page }) => {
    await page.clock.install();
    let calls = 0;
    await page.route("**/api/presence", async (route) => {
      calls++;
      await route.fulfill({
        json: {
          updatedAt: new Date().toISOString(),
          present: [
            {
              slug: "testa",
              name: "Testa",
              languages: ["de"],
              isNew: false,
              isBack: false,
              image: null,
              since: new Date(Date.now() - 3600_000).toISOString(),
              until: null,
            },
          ],
        },
      });
    });
    await page.goto("/jetzt-da");
    await expect(page.getByText("Testa")).toHaveCount(0);
    await page.clock.runFor(61_000);
    await expect(page.getByText("Testa")).toBeVisible();
    expect(calls).toBe(1);
  });
});
