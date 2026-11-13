import { describe, expect, it } from "vitest";
import { createMockSource, MOCK_PROFILES } from "@/lib/data/mock-source";
import { fromBerlin } from "@/lib/time/berlin";
import { buildCards, sortCards } from "./cards";
import {
  applyFilters,
  filterOptions,
  filtersToQuery,
  parseFilters,
  serviceKey,
  toExplorerCard,
  toggle,
} from "./explore";

const now = fromBerlin(2026, 10, 7, 14);

async function cards() {
  const ds = createMockSource(() => now);
  const [profiles, presence, shifts] = await Promise.all([
    ds.listProfiles(),
    ds.getPresence(),
    ds.listShifts(now, new Date(now.getTime() + 8 * 86400000)),
  ]);
  return sortCards(buildCards(profiles, presence, shifts, now, "de"), "de");
}

describe("Filter im URL-Query", () => {
  it("liest und schreibt Filter stabil (teilbare URLs)", () => {
    const f = parseFilters({
      suche: "  mia ",
      sprache: "EN,de,xx-invalid",
      herkunft: ["ro", "es"],
      service: "tabledance,massage,<x>",
      jetzt: "1",
      sortierung: "az",
    });
    expect(f).toEqual({
      q: "mia",
      languages: ["de", "en"],
      origins: ["ES", "RO"],
      services: ["massage", "tabledance"],
      now: true,
      isNew: false,
      sort: "az",
    });
    expect(filtersToQuery(f)).toEqual({
      suche: "mia",
      sprache: "de,en",
      herkunft: "ES,RO",
      service: "massage,tabledance",
      jetzt: "1",
      sortierung: "az",
    });
    expect(filtersToQuery(parseFilters({}))).toEqual({});
  });

  it("ignoriert Unsinn im Query", () => {
    expect(
      parseFilters({ sprache: "<script>", neu: "ja", sortierung: "x" }),
    ).toEqual({
      q: "",
      languages: [],
      origins: [],
      services: [],
      now: false,
      isNew: false,
      sort: "live",
    });
  });

  it("toggle fügt hinzu und entfernt", () => {
    expect(toggle(["de"], "en")).toEqual(["de", "en"]);
    expect(toggle(["de", "en"], "de")).toEqual(["en"]);
  });

  it("Service-Schlüssel sind URL-tauglich", () => {
    expect(serviceKey("Küssen bei Sympathie")).toBe("kussen-bei-sympathie");
    expect(serviceKey("Finger- & Dildospiele")).toBe("finger-dildospiele");
    expect(serviceKey("Fußerotik")).toBe("fusserotik");
  });
});

describe("Kacheln", () => {
  it("jetzt Anwesende stehen vorn und tragen ein Bis-Label", async () => {
    const list = await cards();
    const live = list.filter((c) => c.isLive);
    expect(live.length).toBeGreaterThanOrEqual(3);
    expect(list.slice(0, live.length).every((c) => c.isLive)).toBe(true);
    expect(live[0].timeLabel).toMatch(/^bis \d{1,2}(:\d{2})? Uhr$/);
  });

  it("Profil ohne Schichten steht am Ende, ohne Label", async () => {
    const last = (await cards()).at(-1)!;
    expect(last.profile.slug).toBe("kira");
    expect(last.timeLabel).toBeUndefined();
  });

  it("Filter: Kategorien UND, Werte innerhalb ODER", async () => {
    const list = (await cards()).map(toExplorerCard);
    const de = applyFilters(list, parseFilters({ sprache: "de" }));
    expect(de.every((c) => c.languages.includes("de"))).toBe(true);
    const esOrPl = applyFilters(list, parseFilters({ sprache: "es,pl" }));
    expect(esOrPl.map((c) => c.slug).sort()).toEqual(["carmen", "dalia"]);
    const newAndLive = applyFilters(
      list,
      parseFilters({ neu: "1", jetzt: "1" }),
    );
    expect(newAndLive.every((c) => c.isLive && c.isNew)).toBe(true);
  });

  it("Services: alle gewählten müssen passen", async () => {
    const list = (await cards()).map(toExplorerCard);
    const both = applyFilters(
      list,
      parseFilters({ service: "massage,dessous-show" }),
    );
    expect(both.map((c) => c.slug).sort()).toEqual(["bella", "jade"]);
  });

  it("Suche findet Name und Service, ohne Groß-/Kleinschreibung", async () => {
    const list = (await cards()).map(toExplorerCard);
    expect(
      applyFilters(list, parseFilters({ suche: "AURO" })).map((c) => c.slug),
    ).toEqual(["aurora"]);
    expect(
      applyFilters(list, parseFilters({ suche: "role play" })).map(
        (c) => c.slug,
      ),
    ).toContain("carmen");
    expect(applyFilters(list, parseFilters({ suche: "zzz" }))).toEqual([]);
  });

  it("Sortierung: A–Z und Neu zuerst", async () => {
    const list = (await cards()).map(toExplorerCard);
    const az = applyFilters(list, parseFilters({ sortierung: "az" }));
    expect(az.map((c) => c.name)).toEqual(
      [...list.map((c) => c.name)].sort((a, b) => a.localeCompare(b, "de")),
    );
    const fresh = applyFilters(list, parseFilters({ sortierung: "new" }));
    const n = list.filter((c) => c.isNew).length;
    expect(fresh.slice(0, n).every((c) => c.isNew)).toBe(true);
  });

  it("Filteroptionen mit Anzahl", async () => {
    const opts = filterOptions((await cards()).map(toExplorerCard));
    expect(opts.isNew).toBe(MOCK_PROFILES.filter((p) => p.isNew).length);
    expect(opts.languages.slice(0, 2)).toEqual([
      ["de", 8],
      ["en", 8],
    ]);
    expect(opts.origins.find(([o]) => o === "DE")?.[1]).toBe(2);
    expect(opts.services[0]).toEqual({
      key: "massage",
      n: 8,
      label: "Massage",
    });
  });
});
