import { revalidateTag } from "next/cache";
import { env } from "@/lib/env";
import {
  SIGNATURE_HEADER,
  TIMESTAMP_HEADER,
  tagsForEvent,
  verifySignature,
  webhookPayloadSchema,
} from "@/lib/data/webhook";

/**
 * POST /api/revalidate – Webhook von VyceON.
 * Prüft die HMAC-Signatur und invalidiert nur die betroffenen Cache-Tags.
 */
export async function POST(request: Request) {
  const secret = env.VYCEON_WEBHOOK_SECRET;
  if (!secret) {
    return Response.json(
      { error: "Webhook nicht konfiguriert" },
      { status: 503 },
    );
  }

  const body = await request.text();
  const check = verifySignature({
    secret,
    body,
    signature: request.headers.get(SIGNATURE_HEADER),
    timestamp: request.headers.get(TIMESTAMP_HEADER),
  });
  if (!check.ok) {
    console.warn(`[webhook] abgelehnt: ${check.reason}`);
    return Response.json({ error: "Ungültige Signatur" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = JSON.parse(body);
  } catch {
    return Response.json({ error: "Kein gültiges JSON" }, { status: 400 });
  }
  const payload = webhookPayloadSchema.safeParse(json);
  if (!payload.success) {
    return Response.json({ error: "Unbekanntes Format" }, { status: 400 });
  }

  const tags = tagsForEvent(payload.data);
  // Webhook kommt von außen (keine Server Action): sofort ablaufen lassen.
  for (const tag of tags) revalidateTag(tag, { expire: 0 });
  return Response.json({ revalidated: tags });
}
