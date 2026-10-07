import { describe, expect, it } from "vitest";
import { createMockSource, MOCK_PROFILES } from "@/lib/data/mock-source";
import { fromBerlin } from "@/lib/time/berlin";
import {
  applyFilters,
  buildCards,
  filterOptions,
  filtersToQuery,
  parseFilters,
  sortCards,
  toggle,
} from "./cards";

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
      sprache: "EN,de,xx-invalid",
      herkunft: ["ro", "es"],
      jetzt: "1",
    });
    expect(f).toEqual({
      languages: ["de", "en"],
      origins: ["ES", "RO"],
      now: true,
      isNew: false,
    });
    expect(filtersToQuery(f)).toEqual({
      sprache: "de,en",
      herkunft: "ES,RO",
      jetzt: "1",
    });
    expect(filtersToQuery(parseFilters({}))).toEqual({});
  });

  it("ignoriert Unsinn im Query", () => {
    expect(parseFilters({ sprache: "<script>", neu: "ja" })).toEqual({
      languages: [],
      origins: [],
      now: false,
      isNew: false,
    });
  });

  it("toggle fügt hinzu und entfernt", () => {
    expect(toggle(["de"], "en")).toEqual(["de", "en"]);
    expect(toggle(["de", "en"], "de")).toEqual(["en"]);
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
    const list = await cards();
    const de = applyFilters(list, parseFilters({ sprache: "de" }));
    expect(de.every((c) => c.profile.languages.includes("de"))).toBe(true);
    const deOrEs = applyFilters(list, parseFilters({ sprache: "es,pl" }));
    expect(deOrEs.map((c) => c.profile.slug).sort()).toEqual([
      "carmen",
      "dalia",
    ]);
    const newAndLive = applyFilters(
      list,
      parseFilters({ neu: "1", jetzt: "1" }),
    );
    expect(newAndLive.every((c) => c.isLive && c.profile.isNew)).toBe(true);
  });

  it("Filteroptionen mit Anzahl", async () => {
    const opts = filterOptions(await cards());
    expect(opts.isNew).toBe(MOCK_PROFILES.filter((p) => p.isNew).length);
    expect(opts.languages.slice(0, 2)).toEqual([
      ["de", 8],
      ["en", 8],
    ]);
    expect(opts.origins.find(([o]) => o === "DE")?.[1]).toBe(2);
  });
});
