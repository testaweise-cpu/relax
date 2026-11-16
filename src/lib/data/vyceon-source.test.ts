import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createVyceonSource,
  PAGE_SIZE,
  PRESENCE_FALLBACK_MAX_AGE_MS,
  resetVyceonFallbackCache,
} from "./vyceon-source";

/**
 * Aufbau wie die echten Antworten der VYCE69 Bordell-Sync API v1
 * (Stand 11/2026), Inhalte frei erfunden.
 */
const config = {
  apiUrl: "https://vyce69.test/api/v1/",
  apiKey: "vyc_live_test",
  organizationId: "org 7",
};

const IMG = "https://vyce69.test/api/img";

const item = (slug: string, extra: object = {}) => ({
  id: `id-${slug}`,
  slug,
  name: slug[0].toUpperCase() + slug.slice(1),
  category: "escort",
  tagline: null,
  city: "Berlin",
  availability: "off",
  in_house: false,
  languages: ["Deutsch", "Englisch"],
  services: [
    { key: "kussen", label: "Küssen", services: ["Küssen bei Sympathie"] },
    {
      key: "erotikmassagen",
      label: "Erotikmassagen",
      services: ["Body2Body", "Küssen bei Sympathie"],
    },
  ],
  thumbnail_url: `${IMG}?key=a%2Fb.jpeg&w=480&h=640`,
  permalink: `https://vyce69.test/sedcard/${slug}`,
  published_at: "2026-02-27T03:38:26.000Z",
  updated_at: "2026-11-02T09:45:03.335Z",
  ...extra,
});

const detail = (slug: string, extra: object = {}) => ({
  ...item(slug),
  about_text: "Erfundener Text.",
  alsoWith: [],
  serviceFor: [],
  contacts: [{ key: "phone", label: "Telefon", value: "0", href: "tel:0" }],
  internalMessaging: false,
  location: { city: "Berlin", country_code: "DE", region_code: "BE", zip: "" },
  schedule: null,
  media: [
    {
      id: "m1",
      url: `${IMG}?key=1`,
      thumbnail_url: "",
      width: 980,
      height: 1245,
    },
    {
      id: "m2",
      url: `${IMG}?key=2`,
      thumbnail_url: "",
      width: 1200,
      height: 800,
    },
  ],
  ...extra,
});

const list = (items: unknown[], pagination: object = {}) => ({
  success: true,
  data: {
    items,
    pagination: {
      page: 1,
      per_page: 100,
      total: items.length,
      total_pages: 1,
      ...pagination,
    },
  },
});

function respond(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

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

  it("ruft die Sedcard-Liste mit Bearer-Schlüssel ohne Next-Fetch-Cache auf", async () => {
    fetchMock.mockResolvedValue(respond(list([item("lydia")])));
    await createVyceonSource(config).listProfiles();
    const [u, init] = fetchMock.mock.calls[0];
    expect(u).toBe(
      "https://vyce69.test/api/v1/bordells/org%207/sedcards?page=1&per_page=100&order=name",
    );
    expect((init?.headers as Record<string, string>).Authorization).toBe(
      "Bearer vyc_live_test",
    );
    expect(init?.cache).toBe("no-store");
  });

  it("Liste und Live-Status teilen einen Abruf für 60 Sekunden", async () => {
    vi.useFakeTimers({ now: new Date("2026-11-13T18:00:00Z") });
    fetchMock.mockImplementation(async () =>
      respond(list([item("lydia", { in_house: true })])),
    );
    const source = createVyceonSource(config);
    await source.listProfiles();
    await source.getPresence();
    vi.advanceTimersByTime(59_000);
    await source.getPresence();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(2_000);
    await source.getPresence();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("ordnet die Felder der Liste zu", async () => {
    vi.useFakeTimers({ now: new Date("2026-11-13T12:00:00Z") });
    fetchMock.mockResolvedValue(
      respond(
        list([
          item("lydia"),
          item("mia", {
            published_at: "2026-11-05T10:00:00.000Z",
            languages: ["Rumänisch", "Klingonisch"],
            tagline: "Kurzer Satz",
          }),
        ]),
      ),
    );
    const [lydia, mia] = await createVyceonSource(config).listProfiles();
    expect(lydia).toEqual({
      id: "id-lydia",
      slug: "lydia",
      name: "Lydia",
      isNew: false,
      isBack: false,
      gender: "female",
      languages: ["de", "en"],
      services: [
        { id: "kussen:Küssen bei Sympathie", de: "Küssen bei Sympathie" },
        { id: "erotikmassagen:Body2Body", de: "Body2Body" },
      ],
      images: [
        {
          url: `${IMG}?key=a%2Fb.jpeg&w=480&h=640`,
          width: 480,
          height: 640,
          alt: "",
        },
      ],
      video: null,
      verificationLevel: null,
      trust: null,
      reviews: null,
      extraFacts: [],
      updatedAt: "2026-11-02T09:45:03.335Z",
    });
    expect(mia.isNew).toBe(true);
    expect(mia.languages).toEqual(["ro"]);
    expect(mia.personalNote).toEqual({ de: "Kurzer Satz" });
  });

  it("Detail: Bio und alle freigegebenen Bilder, keine Kontakte", async () => {
    fetchMock.mockResolvedValueOnce(
      respond({ success: true, data: detail("lydia") }),
    );
    const p = await createVyceonSource(config).getProfile("lydia");
    expect(p?.personalNote).toEqual({ de: "Erfundener Text." });
    expect(p?.images.map((i) => [i.width, i.height])).toEqual([
      [980, 1245],
      [1200, 800],
    ]);
    expect(JSON.stringify(p)).not.toContain("tel:");
    expect(String(fetchMock.mock.calls[0][0])).toBe(
      "https://vyce69.test/api/v1/bordells/org%207/sedcards/lydia",
    );
  });

  it("Eckdaten aus attributes: bekannte typisiert, unbekannte bleiben erhalten", async () => {
    fetchMock.mockResolvedValueOnce(
      respond({
        success: true,
        data: detail("lydia", {
          attributes: {
            age: 27,
            height_cm: "172",
            weight_kg: 58,
            cup_size: "75C",
            shoe_size: 39,
            clothing_size: 36,
            hair_color: "Blond",
            eye_color: null,
            tattoos: true,
            piercings: "Bauchnabel",
            origin: "ro",
            hair_length: "lang",
            smoker: false,
            leer: "",
          },
        }),
      }),
    );
    const p = await createVyceonSource(config).getProfile("lydia");
    expect(p).toMatchObject({
      age: 27,
      heightCm: 172,
      weightKg: 58,
      cupSize: "75C",
      shoeSize: 39,
      clothingSize: "36",
      hairColor: "Blond",
      tattoos: true,
      piercings: "Bauchnabel",
      origin: "RO",
      extraFacts: [
        { label: "Hair length", value: "lang" },
        { label: "Smoker", value: "Nein" },
      ],
    });
    expect(p?.eyeColor).toBeUndefined();
  });

  it("ausgeschriebene Herkunft bleibt als freie Angabe erhalten", async () => {
    fetchMock.mockResolvedValueOnce(
      respond({
        success: true,
        data: detail("lydia", { attributes: { nationality: "Rumänien" } }),
      }),
    );
    const p = await createVyceonSource(config).getProfile("lydia");
    expect(p?.origin).toBeUndefined();
    expect(p?.extraFacts).toEqual([{ label: "Herkunft", value: "Rumänien" }]);
  });

  it("Alter unter 18 macht das Profil ungültig (wird nicht angezeigt)", async () => {
    fetchMock.mockResolvedValueOnce(
      respond({
        success: true,
        data: detail("lydia", { attributes: { age: 17 } }),
      }),
    );
    await expect(
      createVyceonSource(config).getProfile("lydia"),
    ).resolves.toBeNull();
  });

  it("nicht freigegeben (404) ergibt null", async () => {
    fetchMock.mockResolvedValue(
      respond({ success: false, error: "not_found" }, 404),
    );
    await expect(
      createVyceonSource(config).getProfile("gibtsnicht"),
    ).resolves.toBeNull();
  });

  it("lädt alle Seiten laut total_pages", async () => {
    const all = Array.from({ length: 150 }, (_, i) => item(`p${i}`));
    fetchMock
      .mockResolvedValueOnce(
        respond(list(all.slice(0, PAGE_SIZE), { total_pages: 2 })),
      )
      .mockResolvedValueOnce(
        respond(list(all.slice(PAGE_SIZE), { page: 2, total_pages: 2 })),
      );
    expect(await createVyceonSource(config).listProfiles()).toHaveLength(150);
    expect(String(fetchMock.mock.calls[1][0])).toContain("page=2");
  });

  it("überspringt ungültige Sedcards statt die Seite zu brechen", async () => {
    fetchMock.mockResolvedValue(
      respond(list([item("lydia"), item("Lydia Kopie"), { id: "x" }])),
    );
    const profiles = await createVyceonSource(config).listProfiles();
    expect(profiles.map((p) => p.slug)).toEqual(["lydia"]);
  });

  it("Fehlervertrag {success:false} gilt als Ausfall: letzter Stand bleibt", async () => {
    vi.useFakeTimers({ now: new Date("2026-11-13T18:00:00Z") });
    const next = () => vi.advanceTimersByTime(61_000);
    const source = createVyceonSource(config);
    fetchMock.mockRejectedValueOnce(new Error("ECONNREFUSED"));
    await expect(source.listProfiles()).resolves.toEqual([]);

    // Fehlschlag wird nicht zwischengespeichert: sofort neuer Versuch
    fetchMock.mockResolvedValueOnce(respond(list([item("lydia")])));
    await source.listProfiles();
    next();
    fetchMock.mockResolvedValueOnce(
      respond({ success: false, error: "rate_limited" }, 429),
    );
    expect((await source.listProfiles()).map((p) => p.slug)).toEqual(["lydia"]);
    next();
    fetchMock.mockResolvedValueOnce(
      respond({ success: false, error: "maintenance" }),
    );
    expect((await source.listProfiles()).map((p) => p.slug)).toEqual(["lydia"]);
  });

  it("live ist, wer in_house ist; Zustand aus presence_state; keine Schichtdaten", async () => {
    fetchMock.mockResolvedValue(
      respond(
        list([
          item("lydia", { in_house: true, presence_state: "ready" }),
          item("nina", {
            in_house: true,
            presence_state: "on_site",
            in_house_since: "2026-11-13T19:05:00+01:00",
          }),
          item("ola", { in_house: true, presence_state: "irgendwas" }),
          item("mia", { presence_state: null }),
        ]),
      ),
    );
    const source = createVyceonSource(config);
    expect(source.hasShifts).toBe(false);
    expect(await source.getPresence()).toEqual([
      { profileId: "id-lydia", state: "ready" },
      {
        profileId: "id-nina",
        state: "on_site",
        since: "2026-11-13T18:05:00.000Z",
      },
      { profileId: "id-ola", state: "on_site" },
    ]);
    expect(await source.listShifts(new Date(), new Date())).toEqual([]);
  });

  it("veralteter Live-Status wird bei Ausfall nicht endlos weiter gezeigt", async () => {
    vi.useFakeTimers({ now: new Date("2026-11-13T18:00:00Z") });
    const source = createVyceonSource(config);
    fetchMock.mockResolvedValueOnce(
      respond(list([item("lydia", { in_house: true })])),
    );
    expect(await source.getPresence()).toHaveLength(1);

    fetchMock.mockRejectedValue(new Error("ECONNREFUSED"));
    vi.advanceTimersByTime(PRESENCE_FALLBACK_MAX_AGE_MS - 60_000);
    expect(await source.getPresence()).toHaveLength(1);
    vi.advanceTimersByTime(2 * 60_000);
    expect(await source.getPresence()).toEqual([]);
  });
});
