import { expect, test } from "@playwright/test";

test.describe("API", () => {
  test.skip(({ isMobile }) => !!isMobile, "einmal reicht");

  test("/api/presence liefert gültige Anwesenheit mit Cache-Header", async ({ request }) => {
    const res = await request.get("/api/presence");
    expect(res.ok()).toBe(true);
    expect(res.headers()["cache-control"]).toContain("max-age=30");
    const body = await res.json();
    expect(Array.isArray(body.present)).toBe(true);
    for (const p of body.present) {
      expect(p.slug).toMatch(/^[a-z0-9-]+$/);
      expect(new Date(p.since).getTime()).toBeLessThanOrEqual(Date.now());
    }
  });

  test("/api/revalidate lehnt Anfragen ohne Signatur ab", async ({ request }) => {
    const res = await request.post("/api/revalidate", { data: { type: "profile.updated" } });
    // 401 mit gesetztem Geheimnis, 503 wenn nicht konfiguriert – nie 200.
    expect([401, 503]).toContain(res.status());
  });
});
