import { REVALIDATE, TAGS, type DataSource } from "./source";
import {
  parseList,
  profileSchema,
  shiftSchema,
  type Presence,
  type Profile,
  type Shift,
} from "./types";

/**
 * Anbindung an die VYCE69 Bordell-Sync API v1 (VyceON).
 *
 * Beschreibung und Zuordnung der Felder: docs/vyceon-schnittstelle.md.
 * Die API liefert nur Sedcards (Liste und Detail). Schichten stehen in der
 * Zeitplanung der Sedcard; „live“ ist, wer gerade in Schicht ist.
 */

export type VyceonConfig = {
  /** z. B. https://vyce69.com/api/v1 */
  apiUrl: string;
  apiKey: string;
  organizationId: string;
  /** Timeout pro Request in ms */
  timeoutMs?: number;
};

/** API-Grenze für per_page */
export const PAGE_SIZE = 100;
/** Schutz vor Endlosschleifen bei fehlerhafter Paginierung */
const MAX_PAGES = 20;
/** Gleichzeitige Detail-Abrufe (Ratenbegrenzung pro Schlüssel) */
const DETAIL_CONCURRENCY = 4;
/** Ein Schichtplan von gestern ist noch brauchbar, einer von letzter Woche nicht. */
export const SHIFTS_FALLBACK_MAX_AGE_MS = 6 * 60 * 60_000;

class NotFoundError extends Error {}

/** Letzte erfolgreiche Antworten pro Prozess – Rückfall, falls VyceON ausfällt. */
const lastGood = new Map<string, { value: unknown; at: number }>();

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

type Json = Record<string, unknown>;
const isObject = (v: unknown): v is Json =>
  !!v && typeof v === "object" && !Array.isArray(v);

/** Fehlervertrag: {"success":false,"error":"code"} – auch bei Status 200 ein Fehler. */
function assertSuccess(json: unknown, path: string) {
  if (isObject(json) && json.success === false) {
    throw new Error(`VyceON-Fehler "${String(json.error)}" für ${path}`);
  }
}

/** Einträge einer Listenseite. Keine Liste gilt als Fehler (Rückfall greift). */
function pageItems(json: unknown): unknown[] {
  const list = isObject(json) ? (json.items ?? json.data) : json;
  if (!Array.isArray(list)) throw new Error("VyceON: Liste erwartet");
  return list;
}

/** Gibt es nach `page` noch eine Seite? Fehlen Angaben, zählt eine volle Seite. */
function hasNextPage(json: unknown, page: number, count: number): boolean {
  const p = isObject(json) && isObject(json.pagination) ? json.pagination : {};
  const hasMore = p.has_more ?? p.hasMore;
  if (typeof hasMore === "boolean") return hasMore;
  const totalPages = p.total_pages ?? p.totalPages ?? p.pages;
  if (typeof totalPages === "number") return page < totalPages;
  return count === PAGE_SIZE;
}

/** Einzelobjekte: nackt oder in { data } bzw. { item }. */
function unwrapOne(json: unknown): unknown {
  if (isObject(json)) {
    if (isObject(json.data)) return json.data;
    if (isObject(json.item)) return json.item;
  }
  return json;
}

// ---------------------------------------------------------------------------
// Zuordnung API → Website. NUR hier wird an die Feldnamen von VYCE69 angepasst.
// TODO(VyceON): Feldnamen nach der ersten echten Antwort festlegen
// (docs/vyceon-schnittstelle.md, Abschnitt „Zuordnung“). Bis dahin wird das
// Modell der Website erwartet; Abweichungen werden geloggt und übersprungen.
// ---------------------------------------------------------------------------

function fromApiProfile(raw: unknown): unknown {
  return raw;
}

/** Schichten aus der Zeitplanung einer Sedcard. */
function fromApiSchedule(raw: unknown, profileId: string): unknown[] {
  if (!isObject(raw)) return [];
  const schedule = raw.shifts ?? raw.schedule;
  if (!Array.isArray(schedule)) return [];
  return schedule.map((entry, i) =>
    isObject(entry) ? { id: `${profileId}-${i}`, ...entry, profileId } : entry,
  );
}

/** Läuft `fn` über alle Einträge, höchstens `limit` gleichzeitig. */
async function mapLimited<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const out = new Array<R>(items.length);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i]);
    }
  };
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, worker),
  );
  return out;
}

export function createVyceonSource(config: VyceonConfig): DataSource {
  const base = config.apiUrl.replace(/\/+$/, "");
  const org = encodeURIComponent(config.organizationId);

  async function getJson(
    path: string,
    cache: { revalidate: number; tags: string[] },
  ) {
    const res = await fetch(`${base}${path}`, {
      headers: {
        // Schlüssel nur im Header, nie in der URL; nur serverseitig.
        Authorization: `Bearer ${config.apiKey}`,
        Accept: "application/json",
      },
      next: cache,
      signal: AbortSignal.timeout(config.timeoutMs ?? 8000),
    });
    if (res.status === 404) throw new NotFoundError(path);
    if (!res.ok)
      throw new Error(`VyceON ${res.status} ${res.statusText} für ${path}`);
    const json = (await res.json()) as unknown;
    assertSuccess(json, path);
    return json;
  }

  /** Alle veröffentlichten Sedcards, Seite für Seite. */
  async function fetchAllSedcards(): Promise<unknown[]> {
    const all: unknown[] = [];
    for (let page = 1; page <= MAX_PAGES; page++) {
      const qs = new URLSearchParams({
        page: String(page),
        per_page: String(PAGE_SIZE),
        order: "name",
      });
      const json = await getJson(`/bordells/${org}/sedcards?${qs}`, {
        revalidate: REVALIDATE.profiles,
        tags: [TAGS.profiles],
      });
      const items = pageItems(json);
      all.push(...items);
      if (!hasNextPage(json, page, items.length)) return all;
    }
    throw new Error(`VyceON: mehr als ${MAX_PAGES} Seiten`);
  }

  async function fetchSedcard(slugOrId: string): Promise<unknown> {
    const json = await getJson(
      `/bordells/${org}/sedcards/${encodeURIComponent(slugOrId)}`,
      {
        revalidate: REVALIDATE.shifts,
        tags: [TAGS.profiles, TAGS.profile(slugOrId), TAGS.shifts],
      },
    );
    return unwrapOne(json);
  }

  async function listProfiles(): Promise<Profile[]> {
    return withFallback(
      "profiles",
      async () =>
        parseList(
          profileSchema,
          (await fetchAllSedcards()).map(fromApiProfile),
          "vyceon.sedcards",
        ),
      [],
    );
  }

  /** Alle Schichten aus den Zeitplanungen aller Sedcards. */
  async function allShifts(): Promise<Shift[]> {
    return withFallback(
      "shifts",
      async () => {
        const profiles = await listProfiles();
        const details = await mapLimited(profiles, DETAIL_CONCURRENCY, (p) =>
          fetchSedcard(p.slug).catch((error) => {
            // Profil inzwischen nicht mehr freigegeben → keine Schichten.
            if (error instanceof NotFoundError) return null;
            throw error;
          }),
        );
        const raw = details.flatMap((d, i) =>
          fromApiSchedule(d, profiles[i].id),
        );
        return parseList(shiftSchema, raw, "vyceon.zeitplanung");
      },
      [] as Shift[],
      SHIFTS_FALLBACK_MAX_AGE_MS,
    );
  }

  return {
    name: "vyceon",

    listProfiles,

    async getProfile(slug: string): Promise<Profile | null> {
      try {
        return await withFallback(
          `profile:${slug}`,
          async () => {
            const parsed = profileSchema.safeParse(
              fromApiProfile(await fetchSedcard(slug)),
            );
            if (!parsed.success) {
              console.warn(
                `[vyceon] Sedcard "${slug}" ungültig:`,
                parsed.error.issues,
              );
              return null;
            }
            return parsed.data;
          },
          null,
        );
      } catch (error) {
        // 404: nicht (mehr) veröffentlicht
        if (error instanceof NotFoundError) return null;
        throw error;
      }
    },

    async listShifts(from: Date, to: Date): Promise<Shift[]> {
      return (await allShifts()).filter(
        (s) => new Date(s.end) > from && new Date(s.start) < to,
      );
    },

    /** Live = gerade in Schicht. */
    async getPresence(): Promise<Presence[]> {
      const now = new Date();
      return (await allShifts())
        .filter((s) => new Date(s.start) <= now && now < new Date(s.end))
        .map((s) => ({ profileId: s.profileId, since: s.start, until: s.end }));
    },
  };
}
