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
 * Die API wird parallel entwickelt. ALLE Annahmen über Endpunkte, Felder und
 * Authentifizierung stehen in dieser Datei und sind mit "ANNAHME:" markiert.
 * Offene Punkte: docs/vyceon-fragen.md
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
const lastGood = new Map<string, unknown>();

async function withFallback<T>(
  key: string,
  load: () => Promise<T>,
  empty: T,
): Promise<T> {
  try {
    const value = await load();
    lastGood.set(key, value);
    return value;
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    console.error(
      `[vyceon] ${key} fehlgeschlagen – nutze letzte bekannte Daten:`,
      error,
    );
    return lastGood.has(key) ? (lastGood.get(key) as T) : empty;
  }
}

/** Nur für Tests. */
export function resetVyceonFallbackCache() {
  lastGood.clear();
}

// ANNAHME: Listen kommen entweder direkt als Array oder als { data: [...] }.
function unwrapList(json: unknown): unknown {
  if (Array.isArray(json)) return json;
  if (json && typeof json === "object" && "data" in json)
    return (json as { data: unknown }).data;
  return json;
}

// ANNAHME: Einzelobjekte kommen direkt oder als { data: {...} }.
function unwrapOne(json: unknown): unknown {
  if (json && typeof json === "object" && "data" in json && !("slug" in json)) {
    return (json as { data: unknown }).data;
  }
  return json;
}

// ANNAHME: Feldnamen der API entsprechen unserem Modell (camelCase).
// Weicht die echte API ab, wird NUR diese Funktion angepasst.
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
        // ANNAHME: Authentifizierung per Bearer-Token.
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
          // ANNAHME: GET /clubs/:clubId/profiles liefert alle aktiven Profile.
          const json = await getJson(`/clubs/${club}/profiles`, {
            revalidate: REVALIDATE.profiles,
            tags: [TAGS.profiles],
          });
          const list = unwrapList(json);
          return parseList(
            profileSchema,
            Array.isArray(list) ? list.map(fromApiProfile) : list,
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
            // ANNAHME: GET /clubs/:clubId/profiles/:slug, 404 wenn unbekannt.
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
          // ANNAHME: GET /clubs/:clubId/shifts?from=ISO&to=ISO liefert Schichten,
          // die den Zeitraum berühren; Zeiten als ISO 8601 mit Offset.
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
            Array.isArray(list) ? list.map(fromApiShift) : list,
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
          // ANNAHME: GET /clubs/:clubId/presence liefert die aktuell Eingecheckten.
          const json = await getJson(`/clubs/${club}/presence`, {
            revalidate: REVALIDATE.presence,
            tags: [TAGS.presence],
          });
          const list = unwrapList(json);
          return parseList(
            presenceSchema,
            Array.isArray(list) ? list.map(fromApiPresence) : list,
            "vyceon.presence",
          );
        },
        [],
      );
    },
  };
}
