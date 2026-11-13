import { createHash, timingSafeEqual } from "node:crypto";

/**
 * Passwortschutz für Vorschau-Umgebungen (HTTP Basic Auth).
 * Aktiv, sobald PREVIEW_PASSWORD gesetzt ist; der Benutzername kommt aus
 * PREVIEW_USER (Standard "mona"). Ohne Passwort ist die Seite offen.
 */
export const PREVIEW_REALM = "Mona Roses Vorschau";

const digest = (s: string) => createHash("sha256").update(s).digest();

/** Vergleich in konstanter Zeit, unabhängig von der Länge der Eingaben. */
function safeEqual(a: string, b: string) {
  return timingSafeEqual(digest(a), digest(b));
}

export function isPreviewAuthorized(
  header: string | null,
  user: string,
  password: string,
): boolean {
  if (!header?.startsWith("Basic ")) return false;
  let decoded: string;
  try {
    decoded = Buffer.from(header.slice(6).trim(), "base64").toString("utf8");
  } catch {
    return false;
  }
  const sep = decoded.indexOf(":");
  if (sep < 0) return false;
  // beide Vergleiche immer ausführen (kein vorzeitiger Abbruch)
  const userOk = safeEqual(decoded.slice(0, sep), user);
  const passOk = safeEqual(decoded.slice(sep + 1), password);
  return userOk && passOk;
}
