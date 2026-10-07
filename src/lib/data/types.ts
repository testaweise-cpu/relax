import { z } from "zod";

/**
 * Gemeinsame Typen der Datenschicht. Jede externe Antwort (VyceON) wird gegen
 * diese Schemas geprüft; ungültige Einträge werden geloggt und übersprungen.
 */

const isoDateTime = z.iso.datetime({ offset: true });

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
  services: z.array(z.string().min(1)).default([]),
  personalNote: z.string().optional(),
  images: z.array(imageSchema).default([]),
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

export const presenceSchema = z.object({
  profileId: z.string().min(1),
  since: isoDateTime,
  until: isoDateTime.optional(),
});

export type ProfileImage = z.infer<typeof imageSchema>;
export type Profile = z.infer<typeof profileSchema>;
export type Shift = z.infer<typeof shiftSchema>;
export type Presence = z.infer<typeof presenceSchema>;

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
