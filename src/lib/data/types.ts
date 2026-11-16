import { z } from "zod";

/**
 * Gemeinsame Typen der Datenschicht. Jede externe Antwort (VyceON) wird gegen
 * diese Schemas geprüft; ungültige Einträge werden geloggt und übersprungen.
 */

// ISO 8601 mit beliebigem Offset annehmen, aber einheitlich als UTC ("…Z")
// weitergeben – so sind Zeichenkettenvergleiche (Sortierung) zugleich Zeitvergleiche.
const isoDateTime = z.iso
  .datetime({ offset: true })
  .transform((s) => new Date(s).toISOString());

/** Zweisprachiger Text: Deutsch Pflicht, Englisch optional (Englisch fehlt → Deutsch). */
export const localizedTextSchema = z.object({
  de: z.string().trim().min(1),
  en: z.string().trim().min(1).optional(),
});

/** Service: zweisprachiger Name, optional mit stabiler ID aus VyceON. */
export const serviceSchema = localizedTextSchema.extend({
  id: z.string().min(1).optional(),
});

export const imageSchema = z.object({
  url: z.string().min(1),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  alt: z.string().default(""),
});

export const profileSchema = z.object({
  id: z.string().min(1),
  /** sauberer Slug, z. B. "lydia" – keine Zeiten oder "kopie" */
  slug: z
    .string()
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug nur aus a–z, 0–9 und Bindestrichen",
    ),
  /** nur der Name – keine Zusätze wie "Neu !!!" oder Uhrzeiten */
  name: z.string().trim().min(1).max(40),
  isNew: z.boolean().default(false),
  isBack: z.boolean().default(false),
  gender: z.string().default("female"),
  languages: z.array(z.string().min(1)).default([]),
  origin: z.string().optional(),
  heightCm: z.number().int().min(120).max(230).optional(),
  cupSize: z.string().optional(),
  shoeSize: z.number().min(30).max(50).optional(),
  weightKg: z.number().min(30).max(200).optional(),
  /** Nur Volljährige: ein Alter unter 18 macht das ganze Profil ungültig. */
  age: z.number().int().min(18).max(99).optional(),
  clothingSize: z.string().optional(),
  hairColor: z.string().optional(),
  eyeColor: z.string().optional(),
  bodyType: z.string().optional(),
  intimateHair: z.string().optional(),
  tattoos: z.union([z.boolean(), z.string()]).optional(),
  piercings: z.union([z.boolean(), z.string()]).optional(),
  /** Weitere Eckdaten der Quelle, die die Website (noch) nicht kennt */
  extraFacts: z
    .array(z.object({ label: z.string().min(1), value: z.string().min(1) }))
    .default([]),
  services: z.array(serviceSchema).default([]),
  personalNote: localizedTextSchema.optional(),
  images: z.array(imageSchema).default([]),
  /** VYCE69 Trust: Prüfstufe (Zeichen auf der Kachel) */
  verificationLevel: z
    .enum(["none", "id", "live", "full"])
    .nullable()
    .default(null),
  /** VYCE69 Trust: die fünf Prüfungen der Sedcard (nur Einzelabfrage) */
  trust: z
    .object({
      checks: z.array(
        z.object({
          key: z.enum(["owner", "identity", "photo", "video", "location"]),
          confirmed: z.boolean(),
        }),
      ),
      lastReviewedAt: isoDateTime.nullable(),
    })
    .nullable()
    .default(null),
  /** Freigegebene Bewertungen von VYCE69 (nur Einzelabfrage) */
  reviews: z
    .object({
      count: z.number().int().min(0),
      average: z.number().min(0).max(5).nullable(),
      items: z.array(
        z.object({
          rating: z.number().int().min(1).max(5),
          body: z.string().nullable(),
          reply: z.string().nullable(),
          afterAppointment: z.boolean(),
          createdAt: isoDateTime,
        }),
      ),
    })
    .nullable()
    .default(null),
  /** Kurzes Video als bewegtes Profilbild (abspielbare Adresse), falls vorhanden */
  video: z.string().min(1).nullable().default(null),
  updatedAt: isoDateTime,
});

export const shiftSchema = z
  .object({
    id: z.string().min(1),
    profileId: z.string().min(1),
    start: isoDateTime,
    end: isoDateTime,
  })
  .refine((s) => new Date(s.end) > new Date(s.start), {
    message: "Schichtende liegt nicht nach dem Beginn",
  });

/** ready = jetzt verfügbar; on_site = im Haus, aber gerade beschäftigt oder in Pause */
export const presenceStateSchema = z.enum(["ready", "on_site"]);

export const presenceSchema = z.object({
  profileId: z.string().min(1),
  state: presenceStateSchema.optional(),
  /** Beginn, falls bekannt (VyceON meldet nur „im Haus“) */
  since: isoDateTime.optional(),
  until: isoDateTime.optional(),
});

/**
 * Story: ein Bild oder kurzes Video, das 24 Stunden sichtbar ist. Gehört zu einer Sedcard oder
 * (ohne profileSlug) zum Haus selbst.
 */
export const storySchema = z.object({
  id: z.string().min(1),
  profileSlug: z.string().min(1).nullable(),
  profileName: z.string().min(1).nullable(),
  /** Bild-Story: das Bild. Video-Story: kein Bild. */
  image: imageSchema.nullable(),
  /** Video-Story: Adresse, die der Browser abspielen kann (eigene Durchleitung) */
  video: z.string().min(1).nullable().default(null),
  caption: z.string().trim().max(500).nullable(),
  createdAt: isoDateTime,
  expiresAt: isoDateTime,
});

export type LocalizedText = z.infer<typeof localizedTextSchema>;
export type ProfileImage = z.infer<typeof imageSchema>;
export type Profile = z.infer<typeof profileSchema>;
export type Shift = z.infer<typeof shiftSchema>;
export type Presence = z.infer<typeof presenceSchema>;
export type Story = z.infer<typeof storySchema>;
export type PresenceState = z.infer<typeof presenceStateSchema>;

/**
 * Prüft eine Liste Eintrag für Eintrag: Gültiges wird übernommen, Ungültiges
 * geloggt und übersprungen – ein fehlerhafter Datensatz bricht nie die Seite.
 */
export function parseList<T>(
  schema: z.ZodType<T>,
  input: unknown,
  label: string,
): T[] {
  if (!Array.isArray(input)) {
    console.warn(`[data] ${label}: Liste erwartet, erhalten: ${typeof input}`);
    return [];
  }
  const out: T[] = [];
  input.forEach((item, i) => {
    const r = schema.safeParse(item);
    if (r.success) out.push(r.data);
    else
      console.warn(
        `[data] ${label}[${i}] übersprungen: ${z.prettifyError(r.error).replace(/\n/g, "; ")}`,
      );
  });
  return out;
}

/** Text in der gewünschten Sprache; fehlt Englisch, gilt Deutsch. */
export function localize(text: LocalizedText, locale: string): string {
  // VyceON liefert Deutsch und Englisch; für alle anderen Sprachen Englisch
  return (locale !== "de" && text.en) || text.de;
}
