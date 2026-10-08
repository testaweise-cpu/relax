import type { PresenceResponse, PresentEntry } from "./presence-dto";

/**
 * Schlanke Prüfung der /api/presence-Antwort für den Browser.
 * Bewusst ohne zod: das würde rund 30 KB (gzip) ins Client-Bundle ziehen.
 * Das zod-Schema in presence-dto.ts bleibt die Referenz (siehe Test).
 */
const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null;
const isStr = (v: unknown): v is string => typeof v === "string";
const isPosInt = (v: unknown) => Number.isInteger(v) && (v as number) > 0;

function isImage(v: unknown) {
  return (
    isObj(v) &&
    isStr(v.url) &&
    v.url.length > 0 &&
    isPosInt(v.width) &&
    isPosInt(v.height) &&
    (v.alt === undefined || isStr(v.alt))
  );
}

function isEntry(v: unknown): v is PresentEntry {
  return (
    isObj(v) &&
    isStr(v.slug) &&
    isStr(v.name) &&
    Array.isArray(v.languages) &&
    v.languages.every(isStr) &&
    typeof v.isNew === "boolean" &&
    typeof v.isBack === "boolean" &&
    (v.image === null || isImage(v.image)) &&
    isStr(v.since) &&
    (v.until === null || isStr(v.until))
  );
}

export function parsePresenceResponse(v: unknown): PresenceResponse | null {
  if (!isObj(v) || !isStr(v.updatedAt) || !Array.isArray(v.present))
    return null;
  if (!v.present.every(isEntry)) return null;
  return {
    updatedAt: v.updatedAt,
    present: v.present.map((p) => ({
      ...p,
      image: p.image && { ...p.image, alt: p.image.alt ?? "" },
    })),
  };
}
