import { expect, test } from "@playwright/test";

test.describe("reduzierte Bewegung", () => {
  test.use({ reducedMotion: "reduce" });

  test("kein Hero-Video, Logo sichtbar", async ({ page }) => {
    await page.goto("/");
    // Das Video würde nach dem Leerlauf nachgeladen – etwas warten
    await page.waitForTimeout(2500);
    await expect(page.locator(".hero-media video")).toHaveCount(0);
    await expect(page.locator(".hero-media img")).toBeVisible();
    await expect(page.locator('h1 img[alt="Mona Roses"]')).toBeVisible();
  });
});

test("ohne Einschränkung läuft das Hero-Video", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".hero-media video")).toHaveCount(1, {
    timeout: 10_000,
  });
});
