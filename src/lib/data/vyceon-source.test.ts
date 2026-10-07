import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createVyceonSource, resetVyceonFallbackCache } from "./vyceon-source";

const config = {
  apiUrl: "https://api.vyceon.test/v1/",
  apiKey: "key-123",
  clubId: "club 7",
};

const validProfile = {
  id: "p1",
  slug: "lydia",
  name: "Lydia",
  languages: ["de"],
  services: [],
  images: [],
  updatedAt: "2026-10-01T10:00:00+02:00",
};

function respond(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

describe("VyceON-Quelle", () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    resetVyceonFallbackCache();
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => vi.restoreAllMocks());

  it("ruft den Endpunkt mit Bearer-Token und Cache-Tags auf", async () => {
    fetchMock.mockResolvedValue(respond([validProfile]));
    await createVyceonSource(config).listProfiles();
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.vyceon.test/v1/clubs/club%207/profiles");
    expect((init?.headers as Record<string, string>).Authorization).toBe(
      "Bearer key-123",
    );
    expect((init as RequestInit & { next: unknown }).next).toEqual({
      revalidate: 300,
      tags: ["profiles"],
    });
  });

  it("überspringt ungültige Einträge statt die Seite zu brechen", async () => {
    fetchMock.mockResolvedValue(
      respond({
        data: [
          validProfile,
          { ...validProfile, id: "p2", slug: "Lydia 16-24 Uhr kopie" },
          { id: "p3" },
        ],
      }),
    );
    const profiles = await createVyceonSource(config).listProfiles();
    expect(profiles.map((p) => p.slug)).toEqual(["lydia"]);
    expect(console.warn).toHaveBeenCalledTimes(2);
  });

  it("bei Ausfall: letzte bekannte Daten, sonst leere Liste – nie ein Fehler", async () => {
    const source = createVyceonSource(config);
    fetchMock.mockRejectedValueOnce(new Error("ECONNREFUSED"));
    await expect(source.listProfiles()).resolves.toEqual([]);

    fetchMock.mockResolvedValueOnce(respond([validProfile]));
    await source.listProfiles();
    fetchMock.mockResolvedValueOnce(respond({ error: "down" }, 503));
    const again = await source.listProfiles();
    expect(again.map((p) => p.slug)).toEqual(["lydia"]);
  });

  it("unbekanntes Profil (404) ergibt null", async () => {
    fetchMock.mockResolvedValue(respond({ error: "not found" }, 404));
    await expect(
      createVyceonSource(config).getProfile("gibtsnicht"),
    ).resolves.toBeNull();
  });

  it("Schichten: Zeitraum auf Berliner Tage gerundet, Ergebnis gefiltert", async () => {
    fetchMock.mockResolvedValue(
      respond([
        {
          id: "s1",
          profileId: "p1",
          start: "2026-10-07T10:00:00+02:00",
          end: "2026-10-07T18:00:00+02:00",
        },
        {
          id: "s2",
          profileId: "p1",
          start: "2026-10-09T10:00:00+02:00",
          end: "2026-10-09T18:00:00+02:00",
        },
        {
          id: "bad",
          profileId: "p1",
          start: "2026-10-07T18:00:00+02:00",
          end: "2026-10-07T10:00:00+02:00",
        },
      ]),
    );
    const shifts = await createVyceonSource(config).listShifts(
      new Date("2026-10-07T12:00:00+02:00"),
      new Date("2026-10-08T12:00:00+02:00"),
    );
    expect(shifts.map((s) => s.id)).toEqual(["s1"]);
    expect(String(fetchMock.mock.calls[0][0])).toContain(
      "from=2026-10-06T22%3A00%3A00.000Z&to=2026-10-08T22%3A00%3A00.000Z",
    );
  });
});
