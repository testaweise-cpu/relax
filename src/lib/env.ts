import "server-only";
import { z } from "zod";

/**
 * Serverseitige Umgebungsvariablen, einmal zentral validiert.
 * Optionale Werte dürfen fehlen, damit die Seite auch ohne VyceON/SMTP startet
 * (dann greifen Mock-Daten bzw. eine klare Fehlermeldung im Formular).
 */
const schema = z
  .object({
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
    NEXT_PUBLIC_SITE_URL: z.url().default("http://localhost:3000"),

    DATA_SOURCE: z.enum(["mock", "vyceon"]).default("mock"),
    VYCEON_API_URL: z.url().optional(),
    VYCEON_API_KEY: z.string().min(1).optional(),
    VYCEON_CLUB_ID: z.string().min(1).optional(),
    VYCEON_WEBHOOK_SECRET: z.string().min(16).optional(),
    VYCEON_IMAGE_HOST: z.string().optional(),

    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.coerce.number().int().positive().default(587),
    SMTP_SECURE: z
      .enum(["true", "false"])
      .default("false")
      .transform((v) => v === "true"),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
    SMTP_FROM: z.string().optional(),
    JOBS_MAIL_TO: z.string().optional(),

    RATE_LIMIT_PER_HOUR: z.coerce.number().int().positive().default(5),
    TRUST_PROXY: z
      .enum(["true", "false"])
      .default("true")
      .transform((v) => v === "true"),
  })
  .superRefine((v, ctx) => {
    if (v.DATA_SOURCE !== "vyceon") return;
    for (const key of [
      "VYCEON_API_URL",
      "VYCEON_API_KEY",
      "VYCEON_CLUB_ID",
    ] as const) {
      if (!v[key]) {
        ctx.addIssue({
          code: "custom",
          path: [key],
          message: `${key} ist Pflicht, wenn DATA_SOURCE=vyceon`,
        });
      }
    }
  });

export type Env = z.infer<typeof schema>;

const optionalKeys = Object.keys(schema.shape);

function read(): Env {
  // Leere Strings aus .env-Dateien als "nicht gesetzt" behandeln.
  const raw = Object.fromEntries(
    optionalKeys.map((k) => [
      k,
      process.env[k] === "" ? undefined : process.env[k],
    ]),
  );
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(
      `Ungültige Umgebungsvariablen:\n${z.prettifyError(parsed.error)}`,
    );
  }
  return parsed.data;
}

export const env = read();
