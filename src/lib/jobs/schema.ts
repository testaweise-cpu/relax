import { z } from "zod";

/** Gemeinsames Schema für Bewerbungen – im Browser und auf dem Server. */

export const MAX_PHOTOS = 3;
export const MAX_PHOTO_BYTES = 8 * 1024 * 1024;
export const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

const phoneOrEmail = z
  .string()
  .trim()
  .min(5)
  .max(120)
  .refine(
    (v) => z.email().safeParse(v).success || /^\+?[\d\s/().-]{6,}$/.test(v),
    "contact",
  );

export function applicationSchema(minAge: number) {
  return z.object({
    name: z.string().trim().min(2, "name").max(60, "name"),
    age: z.coerce.number().int().min(minAge, "age").max(99, "age"),
    contact: phoneOrEmail,
    languages: z.string().trim().max(120, "languages").optional().default(""),
    period: z.string().trim().max(120, "period").optional().default(""),
    message: z.string().trim().max(2000, "message").optional().default(""),
    consent: z.literal("on", { error: "consent" }),
  });
}

export type ApplicationFields = z.infer<ReturnType<typeof applicationSchema>>;
export type FieldName = keyof ApplicationFields | "photos";

type FileLike = { size: number; type: string; name: string };

/** Fotos prüfen: Anzahl, Typ, Größe. Leere Datei-Felder werden ignoriert. */
export function validatePhotos<F extends FileLike>(
  files: F[],
): { ok: true; files: F[] } | { ok: false } {
  const real = files.filter((f) => f.size > 0);
  if (real.length > MAX_PHOTOS) return { ok: false };
  for (const f of real) {
    if (
      !(PHOTO_TYPES as readonly string[]).includes(f.type) ||
      f.size > MAX_PHOTO_BYTES
    ) {
      return { ok: false };
    }
  }
  return { ok: true, files: real };
}

/** Fehler je Feld (Schlüssel = Feldname, Wert = Fehlerkürzel für die Übersetzung). */
export function fieldErrors(
  error: z.ZodError,
): Partial<Record<FieldName, string>> {
  const out: Partial<Record<FieldName, string>> = {};
  for (const issue of error.issues) {
    const key = issue.path[0] as FieldName;
    if (key && !out[key]) out[key] = key;
  }
  return out;
}

export type ApplicationState =
  | { status: "idle" }
  | { status: "success" }
  | {
      status: "error";
      reason: "invalid" | "rateLimited" | "notConfigured" | "error";
      fields?: Partial<Record<FieldName, string>>;
    };
