import { expect, test } from "@playwright/test";
import { en, MAIN_PAGES } from "./pages";

// Jede Hauptseite in beiden Sprachen: lädt mit 200, hat genau eine H1,
// wirft keine Fehler in der Konsole und scrollt nicht seitlich.
for (const path of MAIN_PAGES.flatMap((p) => [p, en(p)])) {
  test(`Smoke: ${path}`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    const res = await page.goto(path);
    expect(res?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.waitForLoadState("networkidle");
    expect(errors).toEqual([]);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(page.viewportSize()!.width);
  });
}

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

test("Content-Security-Policy gilt und wird nirgends verletzt", async ({
  page,
}) => {
  const violations: string[] = [];
  page.on("console", (msg) => {
    if (/Content Security Policy/i.test(msg.text()))
      violations.push(msg.text());
  });
  for (const path of ["/", "/mieterinnen", "/mieterinnen/carmen", "/galerie"]) {
    const res = await page.goto(path);
    expect(res?.headers()["content-security-policy"], path).toContain(
      "default-src 'self'",
    );
    await page.waitForLoadState("networkidle");
  }
  expect(violations).toEqual([]);
});

test("404-Seite hilft weiter", async ({ page }) => {
  const res = await page.goto("/gibtsnicht");
  expect(res?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Hier ist kein Zimmer",
  );
  await expect(
    page.getByRole("main").getByRole("link", { name: "Wer ist jetzt da?" }),
  ).toBeVisible();
});

test("Profil zeigt, wer sonst gerade da ist", async ({ page }) => {
  await page.goto("/mieterinnen/kira");
  const others = page.getByRole("region", { name: "Auch gerade da" });
  await expect(others.locator(".sedcard").first()).toBeVisible();
  await expect(others.locator('a[href$="/mieterinnen/kira"]')).toHaveCount(0);
});
