import { describe, expect, it } from "vitest";
import { fromBerlin } from "@/lib/time/berlin";
import {
  createMockSource,
  generateMockShifts,
  MOCK_PROFILES,
} from "./mock-source";
import { parseList, profileSchema, shiftSchema } from "./types";

describe("Mock-Quelle", () => {
  it("8–12 fiktive Profile, alle schema-gültig, mit sauberen Slugs", () => {
    expect(MOCK_PROFILES.length).toBeGreaterThanOrEqual(8);
    expect(MOCK_PROFILES.length).toBeLessThanOrEqual(12);
    expect(parseList(profileSchema, MOCK_PROFILES, "mock")).toHaveLength(
      MOCK_PROFILES.length,
    );
    for (const p of MOCK_PROFILES) {
      expect(p.images.every((i) => i.url.startsWith("/mock/"))).toBe(true);
    }
  });

  it("zu jeder Uhrzeit sind mindestens drei Profile jetzt da", async () => {
    for (let h = 0; h < 24; h += 1) {
      const now = fromBerlin(2026, 10, 7, h, 17);
      const presence = await createMockSource(() => now).getPresence();
      expect(presence.length, `${h} Uhr`).toBeGreaterThanOrEqual(3);
    }
  });

  it("Schichten sind gültig, enthalten Nachtschichten und sind deterministisch", () => {
    const now = fromBerlin(2026, 10, 7, 14);
    const shifts = generateMockShifts(now);
    expect(parseList(shiftSchema, shifts, "mock")).toHaveLength(shifts.length);
    expect(
      shifts.some(
        (s) =>
          new Date(s.end).getTime() - new Date(s.start).getTime() ===
          8 * 3600000,
      ),
    ).toBe(true);
    expect(generateMockShifts(now)).toEqual(shifts);
  });

  it("ein Profil ohne künftige Schichten (noindex-Fall)", () => {
    const shifts = generateMockShifts(fromBerlin(2026, 10, 7, 14));
    expect(shifts.some((s) => s.profileId === "mock-kira")).toBe(false);
  });
});
