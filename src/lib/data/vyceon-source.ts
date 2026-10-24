import { startOfBerlinDay } from "@/lib/time/berlin";
import { REVALIDATE, TAGS, type DataSource } from "./source";
import {
  parseList,
  presenceSchema,
  profileSchema,
  shiftSchema,
  type Presence,
  type Profile,
  type Shift,
} from "./types";

/**
 * Anbindung an die VyceON-API (Vyce69).
 *
 * Umgesetzt nach der verbindlichen Spezifikation docs/vyceon-schnittstelle.md
 * (OpenAPI: docs/vyceon-api.yaml). Verweise "§n" beziehen sich auf deren
 * Abschnitte. Die Beispiele in docs/vyceon-beispiele/ prüft ein Contract-Test.
 */

export type VyceonConfig = {
  apiUrl: string;
  apiKey: string;
  clubId: string;
  /** Timeout pro Request in ms */
  timeoutMs?: number;
};

class NotFoundError extends Error {}

/** Letzte erfolgreiche Antworten pro Prozess – Rückfall, falls VyceON ausfällt. */
const lastGood = new Map<string, { value: unknown; at: number }>();

/** Anwesenheit veraltet schnell: länger als 15 Minuten nicht als „jetzt da“ zeigen. */
export const PRESENCE_FALLBACK_MAX_AGE_MS = 15 * 60_000;

async function withFallback<T>(
  key: string,
  load: () => Promise<T>,
  empty: T,
  maxAgeMs = Infinity,
): Promise<T> {
  try {
    const value = await load();
    lastGood.set(key, { value, at: Date.now() });
    return value;
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    console.error(
      `[vyceon] ${key} fehlgeschlagen – nutze letzte bekannte Daten:`,
      error,
    );
    const last = lastGood.get(key);
    return last && Date.now() - last.at <= maxAgeMs ? (last.value as T) : empty;
  }
}

/** Nur für Tests. */
export function resetVyceonFallbackCache() {
  lastGood.clear();
}

// §2: Antworten haben die Form { data: [...] }. Ein nacktes Array wird toleriert.
// Alles andere gilt als Fehler, damit der Rückfall auf die letzten Daten greift
// (statt eine leere Liste als „Erfolg“ zu speichern).
function unwrapList(json: unknown): unknown[] {
  const list =
    json && typeof json === "object" && !Array.isArray(json) && "data" in json
      ? (json as { data: unknown }).data
      : json;
  if (!Array.isArray(list)) throw new Error("VyceON: Liste erwartet");
  return list;
}

// §2: Einzelobjekte kommen als { data: {...} }.
function unwrapOne(json: unknown): unknown {
  if (json && typeof json === "object" && "data" in json) {
    return (json as { data: unknown }).data;
  }
  return json;
}

// §4: Die Feldnamen der API entsprechen dem Modell der Website (camelCase).
// Sollte VyceON einmal abweichen, werden NUR diese Funktionen angepasst.
function fromApiProfile(raw: unknown): unknown {
  return raw;
}
function fromApiShift(raw: unknown): unknown {
  return raw;
}
function fromApiPresence(raw: unknown): unknown {
  return raw;
}

export function createVyceonSource(config: VyceonConfig): DataSource {
  const base = config.apiUrl.replace(/\/+$/, "");
  const club = encodeURIComponent(config.clubId);

  async function getJson(
    path: string,
    cache: { revalidate: number; tags: string[] },
  ) {
    const res = await fetch(`${base}${path}`, {
      headers: {
        // §1: Bearer-Token, nur lesend, ein Schlüssel pro Club.
        Authorization: `Bearer ${config.apiKey}`,
        Accept: "application/json",
      },
      next: cache,
      signal: AbortSignal.timeout(config.timeoutMs ?? 8000),
    });
    if (res.status === 404) throw new NotFoundError(path);
    if (!res.ok)
      throw new Error(`VyceON ${res.status} ${res.statusText} für ${path}`);
    return res.json() as Promise<unknown>;
  }

  return {
    name: "vyceon",

    async listProfiles(): Promise<Profile[]> {
      return withFallback(
        "profiles",
        async () => {
          // §3.1: alle auf der Website sichtbaren Profile, ohne Paginierung.
          const json = await getJson(`/clubs/${club}/profiles`, {
            revalidate: REVALIDATE.profiles,
            tags: [TAGS.profiles],
          });
          const list = unwrapList(json);
          return parseList(
            profileSchema,
            list.map(fromApiProfile),
            "vyceon.profiles",
          );
        },
        [],
      );
    },

    async getProfile(slug: string): Promise<Profile | null> {
      try {
        return await withFallback(
          `profile:${slug}`,
          async () => {
            // §3.2: 404 bei unbekanntem Slug; ein alter Slug liefert das umbenannte
            // Profil (die Seite leitet dann auf den neuen Slug um).
            const json = await getJson(
              `/clubs/${club}/profiles/${encodeURIComponent(slug)}`,
              {
                revalidate: REVALIDATE.profiles,
                tags: [TAGS.profiles, TAGS.profile(slug)],
              },
            );
            const parsed = profileSchema.safeParse(
              fromApiProfile(unwrapOne(json)),
            );
            if (!parsed.success) {
              console.warn(
                `[vyceon] Profil "${slug}" ungültig:`,
                parsed.error.issues,
              );
              return null;
            }
            return parsed.data;
          },
          null,
        );
      } catch (error) {
        if (error instanceof NotFoundError) return null;
        throw error;
      }
    },

    async listShifts(from: Date, to: Date): Promise<Shift[]> {
      // Auf ganze Berliner Tage runden, damit der Cache greift.
      const fromDay = startOfBerlinDay(from);
      const toDay = startOfBerlinDay(to, 1);
      const key = `shifts:${fromDay.toISOString()}:${toDay.toISOString()}`;
      const shifts = await withFallback(
        key,
        async () => {
          // §3.3: alle Schichten, die den Zeitraum berühren; Zeiten ISO 8601 mit
          // Offset; höchstens 45 Tage pro Anfrage.
          const qs = new URLSearchParams({
            from: fromDay.toISOString(),
            to: toDay.toISOString(),
          });
          const json = await getJson(`/clubs/${club}/shifts?${qs}`, {
            revalidate: REVALIDATE.shifts,
            tags: [TAGS.shifts],
          });
          const list = unwrapList(json);
          return parseList(
            shiftSchema,
            list.map(fromApiShift),
            "vyceon.shifts",
          );
        },
        [] as Shift[],
      );
      return shifts.filter(
        (s) => new Date(s.end) > from && new Date(s.start) < to,
      );
    },

    async getPresence(): Promise<Presence[]> {
      return withFallback(
        "presence",
        async () => {
          // §3.4: aktuell Eingecheckte (Check-in, nicht aus dem Schichtplan).
          const json = await getJson(`/clubs/${club}/presence`, {
            revalidate: REVALIDATE.presence,
            tags: [TAGS.presence],
          });
          const list = unwrapList(json);
          return parseList(
            presenceSchema,
            list.map(fromApiPresence),
            "vyceon.presence",
          );
        },
        [],
        PRESENCE_FALLBACK_MAX_AGE_MS,
      );
    },
  };
}
