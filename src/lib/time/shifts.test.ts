import { describe, expect, it } from "vitest";
import { fromBerlin } from "./berlin";
import {
  formatRange,
  hasUpcomingShift,
  isShiftActive,
  nextRelevantShift,
  profileTimeLabel,
  shiftLabel,
  weekPlan,
} from "./shifts";

/** Schicht aus Berliner Wanduhr-Zeiten bauen. */
function shift(
  [y, m, d, h, min = 0]: [number, number, number, number, number?],
  [y2, m2, d2, h2, min2 = 0]: [number, number, number, number, number?],
) {
  return {
    start: fromBerlin(y, m, d, h, min).toISOString(),
    end: fromBerlin(y2, m2, d2, h2, min2).toISOString(),
  };
}

// "Jetzt": Mittwoch, 07.10.2026, 14:00 Uhr Berlin
const now = fromBerlin(2026, 10, 7, 14);

describe("Schicht-Labels", () => {
  it("heute 16–24 Uhr (Ende um Mitternacht heißt 24)", () => {
    const s = shift([2026, 10, 7, 16], [2026, 10, 8, 0]);
    expect(shiftLabel(s, now, "de")).toBe("heute 16–24 Uhr");
    expect(shiftLabel(s, now, "en")).toBe("today 16:00–24:00");
  });

  it("morgen ab 10 Uhr", () => {
    const s = shift([2026, 10, 8, 10], [2026, 10, 8, 18]);
    expect(shiftLabel(s, now, "de")).toBe("morgen ab 10 Uhr");
    expect(shiftLabel(s, now, "en")).toBe("tomorrow from 10:00");
  });

  it("ab 24.10. bei späteren Tagen", () => {
    const s = shift([2026, 10, 24, 12], [2026, 10, 24, 20]);
    expect(shiftLabel(s, now, "de")).toBe("ab 24.10.");
    expect(shiftLabel(s, now, "en")).toBe("from 24 Oct");
  });

  it("Minuten werden nur angezeigt, wenn nötig", () => {
    const s = shift([2026, 10, 7, 16, 30], [2026, 10, 7, 23, 45]);
    expect(formatRange(s, "de")).toBe("16:30–23:45");
  });

  it("Nachtschicht über Mitternacht: 22–6 Uhr", () => {
    const s = shift([2026, 10, 7, 22], [2026, 10, 8, 6]);
    expect(shiftLabel(s, now, "de")).toBe("heute 22–6 Uhr");
  });

  it("Nachtschicht von gestern, die noch läuft: heute bis 6 Uhr", () => {
    const early = fromBerlin(2026, 10, 7, 2);
    const s = shift([2026, 10, 6, 22], [2026, 10, 7, 6]);
    expect(isShiftActive(s, early)).toBe(true);
    expect(shiftLabel(s, early, "de")).toBe("heute bis 6 Uhr");
  });

  it("Server-Uhrzeit nach Mitternacht UTC zählt trotzdem als Berliner Tag", () => {
    // 23:30 UTC am 7.10. = 01:30 Uhr am 8.10. in Berlin
    const late = new Date("2026-10-07T23:30:00Z");
    const s = shift([2026, 10, 8, 10], [2026, 10, 8, 18]);
    expect(shiftLabel(s, late, "de")).toBe("heute 10–18 Uhr");
  });
});

describe("Auswahl und Wochenplan", () => {
  const past = shift([2026, 10, 6, 10], [2026, 10, 6, 18]);
  const active = shift([2026, 10, 7, 10], [2026, 10, 7, 18]);
  const later = shift([2026, 10, 9, 12], [2026, 10, 9, 20]);

  it("laufende Schicht hat Vorrang, vergangene zählen nicht", () => {
    expect(nextRelevantShift([later, past, active], now)).toBe(active);
    expect(nextRelevantShift([later, past], now)).toBe(later);
    expect(profileTimeLabel([past], now, "de")).toBeUndefined();
  });

  it("7 Tage ab heute, Schichten am Tag ihres Beginns", () => {
    const night = shift([2026, 10, 10, 22], [2026, 10, 11, 4]);
    const plan = weekPlan([past, active, later, night], now, "de");
    expect(plan).toHaveLength(7);
    expect(plan[0]).toMatchObject({
      key: "2026-10-07",
      weekday: "Mi",
      date: "07.10.",
      isToday: true,
    });
    expect(plan[0].slots).toEqual([{ range: "10–18 Uhr", active: true }]);
    expect(plan[1].slots).toEqual([]);
    expect(plan[2].slots).toEqual([{ range: "12–20 Uhr", active: false }]);
    expect(plan[3].slots).toEqual([{ range: "22–4 Uhr", active: false }]);
    expect(plan[4].slots).toEqual([]);
  });

  it("Wochenplan zeigt eine laufende Nachtschicht von gestern", () => {
    const early = fromBerlin(2026, 10, 7, 2);
    const carried = shift([2026, 10, 6, 22], [2026, 10, 7, 6]);
    expect(weekPlan([carried], early, "de")[0].slots).toEqual([
      { range: "bis 6 Uhr", active: true },
    ]);
  });

  it("Wochenplan über die Zeitumstellung: jeder Tag genau einmal", () => {
    const sat = fromBerlin(2026, 10, 24, 12);
    const keys = weekPlan([], sat, "de").map((d) => d.key);
    expect(keys).toEqual([
      "2026-10-24",
      "2026-10-25",
      "2026-10-26",
      "2026-10-27",
      "2026-10-28",
      "2026-10-29",
      "2026-10-30",
    ]);
  });

  it("noindex-Regel: Schicht in den nächsten 30 Tagen?", () => {
    expect(hasUpcomingShift([later], now)).toBe(true);
    expect(hasUpcomingShift([past], now)).toBe(false);
    expect(
      hasUpcomingShift([shift([2026, 11, 20, 10], [2026, 11, 20, 18])], now),
    ).toBe(false);
  });
});
