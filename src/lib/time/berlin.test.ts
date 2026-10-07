import { describe, expect, it } from "vitest";
import {
  berlinDayDiff,
  berlinDayKey,
  berlinOffsetMinutes,
  berlinParts,
  fromBerlin,
  startOfBerlinDay,
} from "./berlin";

describe("Berliner Zeit (Server läuft in UTC)", () => {
  it("Testumgebung läuft wirklich in UTC", () => {
    expect(new Date("2026-01-01T00:00:00Z").getTimezoneOffset()).toBe(0);
  });

  it("Offset: Winter +60, Sommer +120 Minuten", () => {
    expect(berlinOffsetMinutes(new Date("2026-01-15T12:00:00Z"))).toBe(60);
    expect(berlinOffsetMinutes(new Date("2026-07-15T12:00:00Z"))).toBe(120);
  });

  it("23:30 UTC ist in Berlin schon der nächste Tag", () => {
    const d = new Date("2026-10-06T23:30:00Z"); // 01:30 Uhr am 7.10. (Sommerzeit)
    expect(berlinDayKey(d)).toBe("2026-10-07");
    expect(berlinParts(d).hour).toBe(1);
  });

  it("fromBerlin rechnet Wanduhr-Zeit in den richtigen Zeitpunkt um", () => {
    expect(fromBerlin(2026, 1, 15, 16).toISOString()).toBe(
      "2026-01-15T15:00:00.000Z",
    );
    expect(fromBerlin(2026, 7, 15, 16).toISOString()).toBe(
      "2026-07-15T14:00:00.000Z",
    );
  });

  it("Umstellung auf Sommerzeit (29.03.2026): 02:30 existiert nicht → 03:30", () => {
    const d = fromBerlin(2026, 3, 29, 2, 30);
    expect(d.toISOString()).toBe("2026-03-29T01:30:00.000Z");
    expect(berlinParts(d).hour).toBe(3);
  });

  it("Umstellung auf Winterzeit (25.10.2026): 02:30 doppelt → erste Variante", () => {
    expect(fromBerlin(2026, 10, 25, 2, 30).toISOString()).toBe(
      "2026-10-25T00:30:00.000Z",
    );
  });

  it("Tagesbeginn und Tagesdifferenz über die Zeitumstellung hinweg", () => {
    const sat = new Date("2026-10-24T20:00:00Z"); // Sa 22:00 Berlin
    expect(startOfBerlinDay(sat).toISOString()).toBe(
      "2026-10-23T22:00:00.000Z",
    );
    // Sonntag (Umstellungstag) beginnt noch in Sommerzeit, Montag in Winterzeit
    expect(startOfBerlinDay(sat, 1).toISOString()).toBe(
      "2026-10-24T22:00:00.000Z",
    );
    expect(startOfBerlinDay(sat, 2).toISOString()).toBe(
      "2026-10-25T23:00:00.000Z",
    );
    expect(berlinDayDiff(sat, new Date("2026-10-26T08:00:00Z"))).toBe(2);
  });
});
