import { berlinParts, fromBerlin, startOfBerlinDay } from "@/lib/time/berlin";
import type { DataSource } from "./source";
import type { Presence, Profile, Shift, Story } from "./types";

/**
 * Mock-Datenquelle – ausschließlich FIKTIVE Profile mit Platzhalterbildern
 * (Verläufe in Markenfarben). Keine Daten oder Bilder echter Mieterinnen.
 *
 * Schichten werden relativ zur aktuellen Uhrzeit erzeugt, damit immer einige
 * Profile "jetzt da" sind. Die Muster sind deterministisch (gleiche Eingabe →
 * gleiche Schichten), damit Seiten und Tests stabil bleiben.
 */

/** Fester Service-Katalog wie in VyceON (stabile ID, Name DE/EN). */
const SERVICES = {
  massage: { id: "massage", de: "Massage", en: "Massage" },
  tabledance: { id: "tabledance", de: "Tabledance", en: "Table dance" },
  bar: { id: "bar", de: "Gesellschaft an der Bar", en: "Company at the bar" },
  dessous: { id: "dessous", de: "Dessous-Show", en: "Lingerie show" },
  rollenspiele: { id: "rollenspiele", de: "Rollenspiele", en: "Role play" },
} satisfies Record<string, Profile["services"][number]>;

type Seed = Omit<
  Profile,
  | "id"
  | "slug"
  | "images"
  | "video"
  | "verificationLevel"
  | "trust"
  | "reviews"
  | "updatedAt"
  | "gender"
  | "services"
  | "extraFacts"
> & {
  services: (keyof typeof SERVICES)[];
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
    age: 27,
    clothingSize: "36",
    hairColor: "Blond",
    eyeColor: "Blau",
    bodyType: "Schlank",
    tattoos: false,
    piercings: "Bauchnabel",
    services: ["massage", "tabledance", "bar"],
    personalNote: {
      de: "Ich liebe gute Gespräche an der Bar und lange Abende mit Musik.",
      en: "I love good conversations at the bar and long evenings with music.",
    },
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
    services: ["massage", "dessous"],
    personalNote: {
      de: "Neu in Berlin – ich freue mich darauf, dich kennenzulernen.",
      en: "New in Berlin – I look forward to meeting you.",
    },
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
    services: ["tabledance", "rollenspiele"],
    personalNote: {
      de: "Temperamentvoll, herzlich und immer für ein Lachen gut.",
      en: "Spirited, warm and always up for a laugh.",
    },
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
    services: ["massage"],
    personalNote: {
      de: "Ruhig, aufmerksam und mit viel Zeit für dich.",
      en: "Calm, attentive and with plenty of time for you.",
    },
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
    services: ["massage", "bar"],
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
    services: ["tabledance", "dessous"],
    personalNote: {
      de: "Rote Haare, gute Laune, irischer Humor.",
      en: "Red hair, good mood, Irish humour.",
    },
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
    services: ["massage", "rollenspiele"],
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
    services: ["bar", "massage"],
    personalNote: {
      de: "Berlinerin mit Herz und Schnauze.",
      en: "A Berliner with heart and a big mouth.",
    },
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
    services: ["tabledance"],
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
    services: ["massage", "dessous", "rollenspiele"],
    personalNote: {
      de: "Un peu de Paris in Steglitz.",
      en: "Un peu de Paris in Steglitz.",
    },
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
    services: ["massage"],
    inactive: true,
  },
];

const slugify = (name: string) => name.toLowerCase();

/** Fiktive Umbenennung zum Testen der Weiterleitung alter Profil-Adressen. */
const PREVIOUS_SLUGS: Record<string, string> = { "aurora-berlin": "aurora" };

const MOCK_VIDEO = "/media/mona-roses-werbevideo.mp4";

export const MOCK_PROFILES: Profile[] = SEEDS.map((seed, i) => {
  const rest = { ...seed };
  delete rest.inactive;
  const slug = slugify(seed.name);
  return {
    ...rest,
    extraFacts: [],
    services: seed.services.map((key) => SERVICES[key]),
    id: `mock-${slug}`,
    slug,
    gender: "female",
    images: [1, 2, 3].map((n) => ({
      url: `/mock/${slug}-${n}.webp`,
      width: 600,
      height: 800,
      alt: `Platzhalterbild ${n} für ${seed.name}`,
    })),
    // Das Werbevideo des Hauses als Platzhalter für ein bewegtes Profilbild
    video: i === 0 ? MOCK_VIDEO : null,
    // Zwei Prüfstufen und Bewertungen, damit beide Darstellungen sichtbar sind
    verificationLevel: i === 0 ? "full" : i === 1 ? "id" : null,
    trust:
      i < 2
        ? {
            checks: (
              ["owner", "identity", "photo", "video", "location"] as const
            ).map((key, n) => ({ key, confirmed: i === 0 ? true : n < 2 })),
            lastReviewedAt: new Date(Date.UTC(2026, 9, 20)).toISOString(),
          }
        : null,
    reviews:
      i === 0
        ? {
            count: 2,
            average: 4.5,
            items: [
              {
                rating: 5,
                body: "Sehr freundlich, pünktlich und genau wie auf den Bildern.",
                reply: "Danke, gern wieder!",
                afterAppointment: true,
                createdAt: new Date(Date.UTC(2026, 9, 28)).toISOString(),
              },
              {
                rating: 4,
                body: "Angenehme Atmosphäre, gutes Gespräch an der Bar.",
                reply: null,
                afterAppointment: false,
                createdAt: new Date(Date.UTC(2026, 9, 12)).toISOString(),
              },
            ],
          }
        : null,
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
    hasShifts: true,
    async listProfiles() {
      return MOCK_PROFILES;
    },
    async getProfile(slug) {
      // Wie VyceON ("slug-or-id"): eine andere Kennung liefert das Profil unter seinem Slug
      const current = PREVIOUS_SLUGS[slug] ?? slug;
      return MOCK_PROFILES.find((p) => p.slug === current) ?? null;
    },
    async listShifts(from, to) {
      return generateMockShifts(clock()).filter(
        (s) => new Date(s.end) > from && new Date(s.start) < to,
      );
    },
    async listStories(): Promise<Story[]> {
      const now = clock();
      // Vier Sedcards mit je ein bis zwei Bildern, gestaffelt in den letzten Stunden
      return MOCK_PROFILES.slice(0, 4).flatMap((p, i) =>
        p.images.slice(1, i % 2 === 0 ? 3 : 2).map((image, n) => {
          const created = new Date(now.getTime() - (i * 3 + n + 1) * 3600000);
          return {
            id: `mock-story-${p.slug}-${n}`,
            profileSlug: p.slug,
            profileName: p.name,
            // die zweite Story der ersten Sedcard ist ein Video
            image: i === 0 && n === 0 ? null : image,
            video: i === 0 && n === 0 ? MOCK_VIDEO : null,
            caption: n === 0 && i === 0 ? "Heute bis spät da" : null,
            createdAt: created.toISOString(),
            expiresAt: new Date(created.getTime() + 86400000).toISOString(),
          };
        }),
      );
    },
    async fetchPhoto() {
      return null;
    },
    async fetchVideo() {
      // Testvideos liegen in /public und brauchen keine Durchleitung
      return null;
    },
    async getPresence(): Promise<Presence[]> {
      const now = clock();
      return generateMockShifts(now)
        .filter((s) => new Date(s.start) <= now && now < new Date(s.end))
        .map((s, i) => ({
          profileId: s.profileId,
          // jede dritte gerade beschäftigt, damit beide Zustände sichtbar sind
          state: i % 3 === 1 ? ("on_site" as const) : ("ready" as const),
          since: s.start,
          until: s.end,
        }));
    },
  };
}
