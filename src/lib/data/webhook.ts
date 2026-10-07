import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { TAGS } from "./source";

/**
 * Webhook von VyceON → gezielte Cache-Invalidierung.
 *
 * ANNAHME (abzustimmen, siehe docs/vyceon-fragen.md):
 * - Header "X-Vyceon-Timestamp": Unix-Zeit in Sekunden
 * - Header "X-Vyceon-Signature": "sha256=" + HMAC-SHA256(secret, `${timestamp}.${rohBody}`) als Hex
 * - Zeitstempel darf höchstens 5 Minuten abweichen (Schutz gegen Wiederholung)
 */
export const SIGNATURE_HEADER = "x-vyceon-signature";
export const TIMESTAMP_HEADER = "x-vyceon-timestamp";
export const TOLERANCE_SECONDS = 300;

export function sign(secret: string, timestamp: string, body: string) {
  return `sha256=${createHmac("sha256", secret).update(`${timestamp}.${body}`).digest("hex")}`;
}

export type VerifyResult = { ok: true } | { ok: false; reason: string };

export function verifySignature({
  secret,
  body,
  signature,
  timestamp,
  now = new Date(),
}: {
  secret: string;
  body: string;
  signature: string | null;
  timestamp: string | null;
  now?: Date;
}): VerifyResult {
  if (!signature || !timestamp)
    return { ok: false, reason: "Signatur oder Zeitstempel fehlt" };
  if (!/^\d+$/.test(timestamp))
    return { ok: false, reason: "Zeitstempel ungültig" };
  const age = Math.abs(now.getTime() / 1000 - Number(timestamp));
  if (age > TOLERANCE_SECONDS)
    return { ok: false, reason: "Zeitstempel zu alt" };

  const expected = Buffer.from(sign(secret, timestamp, body));
  const given = Buffer.from(signature.trim());
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) {
    return { ok: false, reason: "Signatur stimmt nicht" };
  }
  return { ok: true };
}

// ANNAHME: Ereignisnamen und Nutzlast.
export const webhookPayloadSchema = z.object({
  type: z.string().min(1),
  data: z
    .object({
      slug: z.string().optional(),
      slugs: z.array(z.string()).optional(),
    })
    .partial()
    .optional(),
});
export type WebhookPayload = z.infer<typeof webhookPayloadSchema>;

/** Welche Cache-Tags ein Ereignis betrifft. Unbekannte Ereignisse leeren alles. */
export function tagsForEvent(payload: WebhookPayload): string[] {
  const slugs = [
    ...(payload.data?.slug ? [payload.data.slug] : []),
    ...(payload.data?.slugs ?? []),
  ];
  const profileTags = slugs.map(TAGS.profile);
  const [entity] = payload.type.split(".");
  switch (entity) {
    case "profile":
      return [TAGS.profiles, ...profileTags];
    case "shift":
      return [TAGS.shifts];
    case "presence":
    case "checkin":
    case "checkout":
      return [TAGS.presence];
    default:
      return [TAGS.profiles, TAGS.shifts, TAGS.presence, ...profileTags];
  }
}
