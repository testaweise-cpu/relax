import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createVyceonSource, resetVyceonFallbackCache } from "./vyceon-source";
import { localize } from "./types";
import { tagsForEvent, webhookPayloadSchema } from "./webhook";

/**
 * Contract-Test: Die Beispiele der Spezifikation (docs/vyceon-beispiele/) müssen
 * von der Website genau so verarbeitet werden. Ändert sich Spezifikation oder
 * Code, schlägt dieser Test fehl, bis beide wieder zusammenpassen.
 */
const example = (name: string): unknown =>
  JSON.parse(
    readFileSync(join(process.cwd(), "docs/vyceon-beispiele", name), "utf8"),
  );

const config = {
  apiUrl: "https://api.vyceon.test/v1",
  apiKey: "key",
  clubId: "mona-roses",
};

function respond(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

describe("VyceON-Spezifikation (Contract)", () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    resetVyceonFallbackCache();
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => vi.restoreAllMocks());

  it("§3.1 Profile: alle Beispiele gültig, Texte zweisprachig, Zeiten in UTC", async () => {
    fetchMock.mockResolvedValue(respond(example("profiles.json")));
    const profiles = await createVyceonSource(config).listProfiles();

    expect(profiles.map((p) => p.slug)).toEqual(["aurora", "bella"]);
    expect(console.warn).not.toHaveBeenCalled();
    const [aurora, bella] = profiles;
    expect(aurora.updatedAt).toBe("2026-10-20T12:05:00.000Z");
    expect(aurora.images[0]).toMatchObject({ width: 1200, height: 1600 });
    expect(aurora.images[1].alt).toBe("");
    expect(aurora.services.map((s) => localize(s, "en"))).toEqual([
      "Massage",
      "Table dance",
      "Gesellschaft an der Bar", // ohne Englisch → Deutsch
    ]);
    expect(localize(aurora.personalNote!, "en")).toMatch(/^I love/);
    expect(bella).toMatchObject({ isNew: true, services: [], images: [] });
    expect(fetchMock.mock.calls[0][0]).toBe(
      "https://api.vyceon.test/v1/clubs/mona-roses/profiles",
    );
  });

  it("§3.2 Einzelprofil und 404", async () => {
    const source = createVyceonSource(config);
    fetchMock.mockResolvedValueOnce(respond(example("profile.json")));
    const aurora = await source.getProfile("aurora");
    expect(aurora?.name).toBe("Aurora");
    expect(localize(aurora!.personalNote!, "en")).toMatch(/^Ich liebe/);

    fetchMock.mockResolvedValueOnce(respond(example("fehler-404.json"), 404));
    await expect(source.getProfile("gibtsnicht")).resolves.toBeNull();
  });

  it("§3.3 Schichten inkl. Nachtschicht und Zeitumstellung", async () => {
    fetchMock.mockResolvedValue(respond(example("shifts.json")));
    const shifts = await createVyceonSource(config).listShifts(
      new Date("2026-10-24T00:00:00Z"),
      new Date("2026-10-26T00:00:00Z"),
    );
    expect(shifts).toEqual([
      expect.objectContaining({
        id: "shf_71c0",
        start: "2026-10-24T14:00:00.000Z",
        end: "2026-10-25T00:00:00.000Z",
      }),
      expect.objectContaining({
        id: "shf_71c1",
        start: "2026-10-25T09:00:00.000Z",
      }),
    ]);
  });

  it("§3.4 Anwesenheit", async () => {
    fetchMock.mockResolvedValue(respond(example("presence.json")));
    const presence = await createVyceonSource(config).getPresence();
    expect(presence).toEqual([
      {
        profileId: "prf_8f3k2",
        since: "2026-10-24T14:05:00.000Z",
        until: "2026-10-25T00:00:00.000Z",
      },
    ]);
  });

  it("§6 Webhooks: Umbenennung leert alten und neuen Slug", () => {
    const renamed = webhookPayloadSchema.parse(
      example("webhook-profile-updated.json"),
    );
    expect(tagsForEvent(renamed)).toEqual([
      "profiles",
      "profile:aurora",
      "profile:aurora-berlin",
    ]);
    const checkin = webhookPayloadSchema.parse(
      example("webhook-presence-checkin.json"),
    );
    expect(tagsForEvent(checkin)).toEqual(["presence"]);
  });

  it("§2 Alle Zeitangaben in den Beispielen haben einen Offset", () => {
    const iso = /"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?[^"]*"/g;
    for (const file of [
      "profiles.json",
      "profile.json",
      "shifts.json",
      "presence.json",
      "webhook-profile-updated.json",
      "webhook-presence-checkin.json",
    ]) {
      const text = JSON.stringify(example(file));
      for (const t of text.match(iso) ?? [])
        expect(t, `${file}: ${t}`).toMatch(/(Z|[+-]\d{2}:\d{2})"$/);
    }
  });
});
