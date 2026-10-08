import { expect, test } from "@playwright/test";

// Ohne Cookie – frischer Zustand
test.use({ storageState: { cookies: [], origins: [] } });

test.describe("Altersabfrage", () => {
  test("erscheint beim ersten Besuch und bleibt nach Bestätigung weg", async ({
    page,
  }) => {
    await page.goto("/");
    const gate = page.getByRole("dialog", { name: "Willkommen" });
    await expect(gate).toBeVisible();
    // Inhalt ist serverseitig gerendert (für Suchmaschinen), aber nicht bedienbar
    await expect(page.locator("#seite")).toHaveAttribute("inert", "");
    await expect(
      page.getByRole("button", { name: "Ich bin mindestens 18 Jahre alt" }),
    ).toBeFocused();

    await page
      .getByRole("button", { name: "Ich bin mindestens 18 Jahre alt" })
      .click();
    await expect(gate).toBeHidden();
    const cookie = (await page.context().cookies()).find(
      (c) => c.name === "age_ok",
    );
    expect(cookie?.value).toBe("1");
    // 30 Tage (± 1 Minute)
    expect(cookie!.expires * 1000 - Date.now()).toBeGreaterThan(
      30 * 86400_000 - 60_000,
    );

    await page.goto("/preise");
    await expect(page.getByRole("dialog", { name: "Willkommen" })).toBeHidden();
  });

  test("bleibt nach dem Sprachwechsel weg", async ({ page, isMobile }) => {
    test.skip(!!isMobile, "Sprachumschalter im Desktop-Header");
    await page.goto("/preise");
    await page
      .getByRole("button", { name: "Ich bin mindestens 18 Jahre alt" })
      .click();
    await page.getByRole("link", { name: "English" }).first().click();
    await expect(page).toHaveURL(/\/en\/preise$/);
    await expect(
      page.getByRole("heading", { level: 2, name: "Prices" }),
    ).toBeVisible();
    await expect(page.getByRole("dialog", { name: "Welcome" })).toBeHidden();
    await expect(page.locator("#seite")).not.toHaveAttribute("inert", "");
  });

  test("Verlassen führt von der Seite weg", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "Verlassen" })).toHaveAttribute(
      "href",
      /^https:\/\/www\.google\.com/,
    );
  });

  test("Impressum und Datenschutz sind ohne Bestätigung lesbar", async ({
    page,
  }) => {
    await page.goto("/impressum");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(
      page.getByRole("heading", { level: 2, name: "Impressum" }),
    ).toBeVisible();
  });

  test("funktioniert ohne JavaScript (Formular an /api/age)", async ({
    browser,
    baseURL,
  }) => {
    const ctx = await browser.newContext({
      javaScriptEnabled: false,
      storageState: { cookies: [], origins: [] },
    });
    const page = await ctx.newPage();
    await page.goto(`${baseURL}/galerie`);
    await page
      .getByRole("button", { name: "Ich bin mindestens 18 Jahre alt" })
      .click();
    await expect(page).toHaveURL(/\/galerie$/);
    expect((await ctx.cookies()).some((c) => c.name === "age_ok")).toBe(true);
    await ctx.close();
  });
});

test.describe("SEO-Grundlagen", () => {
  test.skip(({ isMobile }) => !!isMobile, "einmal reicht");

  test("hreflang, Canonical und strukturierte Daten auf der Startseite", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      /^https?:\/\/[^/]+\/?$/,
    );
    await expect(
      page.locator('link[rel="alternate"][hreflang="en"]'),
    ).toHaveAttribute("href", /\/en$/);
    await expect(
      page.locator('link[rel="alternate"][hreflang="x-default"]'),
    ).toHaveCount(1);
    const ld = JSON.parse(
      (await page.locator('script[type="application/ld+json"]').textContent())!,
    );
    expect(ld["@type"]).toBe("NightClub");
    expect(ld.openingHoursSpecification[0].dayOfWeek).toHaveLength(7);
  });

  test("robots.txt, sitemap.xml und OG-Bild", async ({ request }) => {
    const robots = await (await request.get("/robots.txt")).text();
    expect(robots).toContain("Disallow: /keystatic");
    expect(robots).toContain("Sitemap:");
    const sitemap = await (await request.get("/sitemap.xml")).text();
    expect(sitemap).toContain("/en/preise");
    expect(sitemap).toContain("/mieterinnen/aurora");
    expect(sitemap).not.toContain("/mieterinnen/kira"); // keine Schichten → noindex, nicht in der Sitemap
    const og = await request.get("/opengraph-image");
    expect(og.headers()["content-type"]).toBe("image/png");
  });

  test("alte URLs: 301 bzw. 410", async ({ request }) => {
    for (const [from, to] of [
      ["/anwesenheit/", "/jetzt-da"],
      ["/preise/", "/preise"],
      ["/product/irgendwer/", "/mieterinnen"],
      ["/warenkorb/", "/"],
    ]) {
      const res = await request.get(from, { maxRedirects: 0 });
      expect(res.status(), from).toBe(301);
      expect(new URL(res.headers().location, "http://x").pathname).toBe(to);
    }
    expect((await request.get("/feed/", { maxRedirects: 0 })).status()).toBe(
      410,
    );
    expect(
      (await request.get("/wp-login.php", { maxRedirects: 0 })).status(),
    ).toBe(410);
  });
});
