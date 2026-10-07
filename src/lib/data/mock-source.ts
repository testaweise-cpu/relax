import { berlinParts, fromBerlin, startOfBerlinDay } from "@/lib/time/berlin";
import type { DataSource } from "./source";
import type { Presence, Profile, Shift } from "./types";

/**
 * Mock-Datenquelle – ausschließlich FIKTIVE Profile mit Platzhalterbildern
 * (Verläufe in Markenfarben). Keine Daten oder Bilder echter Mieterinnen.
 *
 * Schichten werden relativ zur aktuellen Uhrzeit erzeugt, damit immer einige
 * Profile "jetzt da" sind. Die Muster sind deterministisch (gleiche Eingabe →
 * gleiche Schichten), damit Seiten und Tests stabil bleiben.
 */

type Seed = Omit<Profile, "id" | "slug" | "images" | "updatedAt" | "gender"> & {
  /** keine Schichten in den nächsten 30 Tagen (prüft die noindex-Regel) */
  inactive?: boolean;
};

const SEEDS: Seed[] = [
  {
    name: "Aurora",
    isNew: false,
    isBack: false,
    languages: ["de", "en"],
    origin: "DE",
    heightCm: 172,
    cupSize: "C",
    shoeSize: 39,
    weightKg: 58,
    services: ["Massage", "Tabledance", "Gesellschaft an der Bar"],
    personalNote:
      "Ich liebe gute Gespräche an der Bar und lange Abende mit Musik.",
  },
  {
    name: "Bella",
    isNew: true,
    isBack: false,
    languages: ["ro", "en", "de"],
    origin: "RO",
    heightCm: 165,
    cupSize: "B",
    shoeSize: 38,
    weightKg: 52,
    services: ["Massage", "Dessous-Show"],
    personalNote: "Neu in Berlin – ich freue mich darauf, dich kennenzulernen.",
  },
  {
    name: "Carmen",
    isNew: false,
    isBack: true,
    languages: ["es", "de"],
    origin: "ES",
    heightCm: 168,
    cupSize: "D",
    shoeSize: 38,
    weightKg: 60,
    services: ["Tabledance", "Rollenspiele"],
    personalNote: "Temperamentvoll, herzlich und immer für ein Lachen gut.",
  },
  {
    name: "Dalia",
    isNew: false,
    isBack: false,
    languages: ["pl", "en"],
    origin: "PL",
    heightCm: 175,
    cupSize: "B",
    shoeSize: 40,
    weightKg: 57,
    services: ["Massage"],
    personalNote: "Ruhig, aufmerksam und mit viel Zeit für dich.",
  },
  {
    name: "Elena",
    isNew: false,
    isBack: false,
    languages: ["ru", "de", "en"],
    origin: "UA",
    heightCm: 170,
    cupSize: "C",
    shoeSize: 39,
    weightKg: 55,
    services: ["Massage", "Gesellschaft an der Bar"],
  },
  {
    name: "Fiona",
    isNew: true,
    isBack: false,
    languages: ["en", "de"],
    origin: "IE",
    heightCm: 163,
    cupSize: "C",
    shoeSize: 37,
    weightKg: 54,
    services: ["Tabledance", "Dessous-Show"],
    personalNote: "Rote Haare, gute Laune, irischer Humor.",
  },
  {
    name: "Gina",
    isNew: false,
    isBack: false,
    languages: ["it", "en"],
    origin: "IT",
    heightCm: 167,
    cupSize: "D",
    shoeSize: 38,
    weightKg: 59,
    services: ["Massage", "Rollenspiele"],
  },
  {
    name: "Hanna",
    isNew: false,
    isBack: false,
    languages: ["de"],
    origin: "DE",
    heightCm: 178,
    cupSize: "B",
    shoeSize: 41,
    weightKg: 63,
    services: ["Gesellschaft an der Bar", "Massage"],
    personalNote: "Berlinerin mit Herz und Schnauze.",
  },
  {
    name: "Ivy",
    isNew: false,
    isBack: false,
    languages: ["hu", "en", "de"],
    origin: "HU",
    heightCm: 160,
    cupSize: "A",
    shoeSize: 36,
    weightKg: 48,
    services: ["Tabledance"],
  },
  {
    name: "Jade",
    isNew: false,
    isBack: false,
    languages: ["fr", "en"],
    origin: "FR",
    heightCm: 171,
    cupSize: "C",
    shoeSize: 39,
    weightKg: 56,
    services: ["Massage", "Dessous-Show", "Rollenspiele"],
    personalNote: "Un peu de Paris in Steglitz.",
  },
  {
    name: "Kira",
    isNew: false,
    isBack: false,
    languages: ["de", "ru"],
    origin: "LV",
    heightCm: 174,
    cupSize: "B",
    shoeSize: 40,
    weightKg: 58,
    services: ["Massage"],
    inactive: true,
  },
];

const slugify = (name: string) => name.toLowerCase();

export const MOCK_PROFILES: Profile[] = SEEDS.map((seed, i) => {
  const rest = { ...seed };
  delete rest.inactive;
  const slug = slugify(seed.name);
  return {
    ...rest,
    id: `mock-${slug}`,
    slug,
    gender: "female",
    images: [1, 2, 3].map((n) => ({
      url: `/mock/${slug}-${n}.webp`,
      width: 600,
      height: 800,
      alt: `Platzhalterbild ${n} für ${seed.name}`,
    })),
    updatedAt: new Date(Date.UTC(2026, 9, 1 + i)).toISOString(),
  };
});

/** Schichtmuster: [Beginn, Ende] in Stunden ab Tagesbeginn (Ende > 24 = nächster Tag). */
const PATTERNS: Array<[number, number]> = [
  [10, 18],
  [16, 24],
  [22, 30], // Nachtschicht 22–6 Uhr
  [12, 20],
];

function dayNumber(date: Date) {
  const p = berlinParts(date);
  return Math.floor(Date.UTC(p.year, p.month - 1, p.day) / 86400000);
}

function atBerlinHour(dayStart: Date, hours: number) {
  const p = berlinParts(dayStart);
  const d = new Date(
    Date.UTC(p.year, p.month - 1, p.day + Math.floor(hours / 24)),
  );
  return fromBerlin(
    d.getUTCFullYear(),
    d.getUTCMonth() + 1,
    d.getUTCDate(),
    hours % 24,
  );
}

/** Erzeugt alle Mock-Schichten von gestern bis in 14 Tagen, relativ zu `now`. */
export function generateMockShifts(now: Date): Shift[] {
  const shifts: Shift[] = [];
  SEEDS.forEach((seed, pi) => {
    if (seed.inactive) return;
    const profileId = MOCK_PROFILES[pi].id;
    for (let offset = -1; offset <= 14; offset++) {
      const dayStart = startOfBerlinDay(now, offset);
      const dn = dayNumber(dayStart);
      if ((dn + pi) % 3 === 0) continue; // freier Tag
      const [from, to] = PATTERNS[(dn + pi * 2) % PATTERNS.length];
      const start = atBerlinHour(dayStart, from);
      const end = atBerlinHour(dayStart, to);
      shifts.push({
        id: `${profileId}-${dn}`,
        profileId,
        start: start.toISOString(),
        end: end.toISOString(),
      });
    }
  });

  // Garantie: Die ersten drei Profile ohne laufende Schicht bekommen eine
  // Schicht um die aktuelle Uhrzeit (volle Stunde −2 bis +6).
  const active = (id: string) =>
    shifts.some(
      (s) =>
        s.profileId === id && new Date(s.start) <= now && now < new Date(s.end),
    );
  const needed = 3 - MOCK_PROFILES.filter((p) => active(p.id)).length;
  if (needed > 0) {
    const p = berlinParts(now);
    const start = fromBerlin(p.year, p.month, p.day, p.hour);
    start.setTime(start.getTime() - 2 * 3600000);
    const end = new Date(start.getTime() + 8 * 3600000);
    MOCK_PROFILES.filter((pr, i) => !SEEDS[i].inactive && !active(pr.id))
      .slice(0, needed)
      .forEach((pr) =>
        shifts.push({
          id: `${pr.id}-now-${start.getTime()}`,
          profileId: pr.id,
          start: start.toISOString(),
          end: end.toISOString(),
        }),
      );
  }

  return shifts.sort((a, b) => a.start.localeCompare(b.start));
}

export function createMockSource(
  clock: () => Date = () => new Date(),
): DataSource {
  return {
    name: "mock",
    async listProfiles() {
      return MOCK_PROFILES;
    },
    async getProfile(slug) {
      return MOCK_PROFILES.find((p) => p.slug === slug) ?? null;
    },
    async listShifts(from, to) {
      return generateMockShifts(clock()).filter(
        (s) => new Date(s.end) > from && new Date(s.start) < to,
      );
    },
    async getPresence(): Promise<Presence[]> {
      const now = clock();
      return generateMockShifts(now)
        .filter((s) => new Date(s.start) <= now && now < new Date(s.end))
        .map((s) => ({ profileId: s.profileId, since: s.start, until: s.end }));
    },
  };
}
