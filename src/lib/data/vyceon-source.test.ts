import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createVyceonSource,
  PAGE_SIZE,
  resetVyceonFallbackCache,
  SHIFTS_FALLBACK_MAX_AGE_MS,
} from "./vyceon-source";

const config = {
  apiUrl: "https://vyce69.test/api/v1/",
  apiKey: "vyc_live_test",
  organizationId: "org 7",
};

const card = (slug: string, extra: object = {}) => ({
  id: `id-${slug}`,
  slug,
  name: slug[0].toUpperCase() + slug.slice(1),
  languages: ["de"],
  updatedAt: "2026-10-01T10:00:00+02:00",
  ...extra,
});

function respond(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

const url = (call: unknown[]) => String(call[0]);

describe("VyceON-Quelle (VYCE69 Bordell-Sync API)", () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    resetVyceonFallbackCache();
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("ruft die Sedcard-Liste mit Bearer-Schlüssel und Cache-Tags auf", async () => {
    fetchMock.mockResolvedValue(respond({ items: [card("lydia")] }));
    await createVyceonSource(config).listProfiles();
    const [u, init] = fetchMock.mock.calls[0];
    expect(u).toBe(
      "https://vyce69.test/api/v1/bordells/org%207/sedcards?page=1&per_page=100&order=name",
    );
    expect((init?.headers as Record<string, string>).Authorization).toBe(
      "Bearer vyc_live_test",
    );
    expect((init as RequestInit & { next: unknown }).next).toEqual({
      revalidate: 300,
      tags: ["profiles"],
    });
  });

  it("lädt alle Seiten (total_pages, has_more oder volle Seite)", async () => {
    const full = Array.from({ length: PAGE_SIZE }, (_, i) => card(`p${i}`));
    fetchMock
      .mockResolvedValueOnce(
        respond({ items: full.slice(0, 50), pagination: { total_pages: 2 } }),
      )
      .mockResolvedValueOnce(
        respond({ items: full.slice(50), pagination: { total_pages: 2 } }),
      );
    const a = await createVyceonSource(config).listProfiles();
    expect(a).toHaveLength(PAGE_SIZE);
    expect(url(fetchMock.mock.calls[1])).toContain("page=2");

    resetVyceonFallbackCache();
    fetchMock.mockReset();
    fetchMock
      .mockResolvedValueOnce(respond({ items: full }))
      .mockResolvedValueOnce(respond({ items: [card("letzte")] }));
    const b = await createVyceonSource(config).listProfiles();
    expect(b).toHaveLength(PAGE_SIZE + 1);
  });

  it("überspringt ungültige Sedcards statt die Seite zu brechen", async () => {
    fetchMock.mockResolvedValue(
      respond({
        items: [card("lydia"), card("Lydia 16-24 Uhr kopie"), { id: "x" }],
      }),
    );
    const profiles = await createVyceonSource(config).listProfiles();
    expect(profiles.map((p) => p.slug)).toEqual(["lydia"]);
    expect(console.warn).toHaveBeenCalledTimes(2);
  });

  it("Fehlervertrag {success:false} gilt als Ausfall: letzter Stand bleibt", async () => {
    const source = createVyceonSource(config);
    fetchMock.mockRejectedValueOnce(new Error("ECONNREFUSED"));
    await expect(source.listProfiles()).resolves.toEqual([]);

    fetchMock.mockResolvedValueOnce(respond({ items: [card("lydia")] }));
    await source.listProfiles();
    fetchMock.mockResolvedValueOnce(
      respond({ success: false, error: "rate_limited" }, 429),
    );
    expect((await source.listProfiles()).map((p) => p.slug)).toEqual(["lydia"]);
    fetchMock.mockResolvedValueOnce(
      respond({ success: false, error: "maintenance" }),
    );
    expect((await source.listProfiles()).map((p) => p.slug)).toEqual(["lydia"]);
  });

  it("Einzelprofil per Slug; nicht freigegeben (404) ergibt null", async () => {
    const source = createVyceonSource(config);
    fetchMock.mockResolvedValueOnce(respond({ data: card("lydia") }));
    expect((await source.getProfile("lydia"))?.updatedAt).toBe(
      "2026-10-01T08:00:00.000Z",
    );
    expect(url(fetchMock.mock.calls[0])).toBe(
      "https://vyce69.test/api/v1/bordells/org%207/sedcards/lydia",
    );

    fetchMock.mockResolvedValueOnce(
      respond({ success: false, error: "not_found" }, 404),
    );
    await expect(source.getProfile("gibtsnicht")).resolves.toBeNull();
  });

  describe("Schichten aus der Zeitplanung, live = in Schicht", () => {
    const now = new Date("2026-11-12T18:00:00Z");
    const shift = (start: string, end: string) => ({ start, end });

    function mockApi() {
      fetchMock.mockImplementation(async (input) => {
        const u = String(input);
        if (u.includes("/sedcards?"))
          return respond({
            items: [card("lydia"), card("mia"), card("weg")],
          });
        if (u.endsWith("/sedcards/lydia"))
          return respond(
            card("lydia", {
              shifts: [
                shift("2026-11-12T17:00:00+01:00", "2026-11-13T01:00:00+01:00"),
                shift("2026-11-14T10:00:00+01:00", "2026-11-14T18:00:00+01:00"),
              ],
            }),
          );
        if (u.endsWith("/sedcards/mia"))
          return respond(
            card("mia", {
              shifts: [
                shift("2026-11-12T10:00:00+01:00", "2026-11-12T16:00:00+01:00"),
              ],
            }),
          );
        return respond({ success: false, error: "not_found" }, 404);
      });
    }

    it("liest die Schichten jeder Sedcard und filtert den Zeitraum", async () => {
      vi.useFakeTimers({ now });
      mockApi();
      const shifts = await createVyceonSource(config).listShifts(
        new Date("2026-11-12T00:00:00Z"),
        new Date("2026-11-13T00:00:00Z"),
      );
      expect(shifts).toEqual([
        {
          id: "id-lydia-0",
          profileId: "id-lydia",
          start: "2026-11-12T16:00:00.000Z",
          end: "2026-11-13T00:00:00.000Z",
        },
        {
          id: "id-mia-0",
          profileId: "id-mia",
          start: "2026-11-12T09:00:00.000Z",
          end: "2026-11-12T15:00:00.000Z",
        },
      ]);
    });

    it("live ist nur, wer gerade in Schicht ist", async () => {
      vi.useFakeTimers({ now });
      mockApi();
      expect(await createVyceonSource(config).getPresence()).toEqual([
        {
          profileId: "id-lydia",
          since: "2026-11-12T16:00:00.000Z",
          until: "2026-11-13T00:00:00.000Z",
        },
      ]);
    });

    it("bei Ausfall: Schichtplan höchstens 6 Stunden weiter nutzen", async () => {
      vi.useFakeTimers({ now });
      mockApi();
      const source = createVyceonSource(config);
      expect(await source.getPresence()).toHaveLength(1);

      fetchMock.mockReset();
      fetchMock.mockRejectedValue(new Error("ECONNREFUSED"));
      vi.advanceTimersByTime(SHIFTS_FALLBACK_MAX_AGE_MS - 60 * 60_000);
      expect(await source.getPresence()).toHaveLength(1);

      vi.advanceTimersByTime(2 * 60 * 60_000);
      expect(await source.getPresence()).toEqual([]);
    });
  });
});
