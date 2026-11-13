import { REVALIDATE, TAGS, type DataSource } from "./source";
import { parseList, profileSchema, type Presence, type Profile } from "./types";

/**
 * Anbindung an die VYCE69 Bordell-Sync API v1 (VyceON).
 *
 * Beschreibung und Zuordnung der Felder: docs/vyceon-schnittstelle.md.
 * Die API liefert nur Sedcards (Liste und Detail). Live ist, wer laut
 * `in_house` gerade im Haus ist. Schichtzeiten liefert die API nicht.
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
/** „Neu“: veröffentlicht vor höchstens so vielen Tagen */
export const NEW_DAYS = 14;
/** Live-Status veraltet schnell: länger als 15 Minuten nicht als „jetzt da“ zeigen. */
export const PRESENCE_FALLBACK_MAX_AGE_MS = 15 * 60_000;

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
const str = (v: unknown) =>
  typeof v === "string" && v.trim() ? v.trim() : undefined;

/** Fehlervertrag: {"success":false,"error":"code"} – auch bei Status 200 ein Fehler. */
function assertSuccess(json: unknown, path: string) {
  if (isObject(json) && json.success === false) {
    throw new Error(`VyceON-Fehler "${String(json.error)}" für ${path}`);
  }
}

/** {"success":true,"data":…} → data */
function payload(json: unknown): unknown {
  return isObject(json) && "data" in json ? json.data : json;
}

/** Einträge einer Listenseite. Keine Liste gilt als Fehler (Rückfall greift). */
function pageItems(data: unknown): unknown[] {
  const list = isObject(data) ? data.items : data;
  if (!Array.isArray(list)) throw new Error("VyceON: Liste erwartet");
  return list;
}

/** Gibt es nach `page` noch eine Seite? Fehlen Angaben, zählt eine volle Seite. */
function hasNextPage(data: unknown, page: number, count: number): boolean {
  const p = isObject(data) && isObject(data.pagination) ? data.pagination : {};
  if (typeof p.total_pages === "number") return page < p.total_pages;
  return count === PAGE_SIZE;
}

// ---------------------------------------------------------------------------
// Zuordnung VYCE69 → Website. NUR hier wird an die Feldnamen angepasst.
// ---------------------------------------------------------------------------

/** VYCE69 liefert Sprachen als deutsche Namen; die Website arbeitet mit ISO-639-1. */
const LANGUAGE_CODES: Record<string, string> = {
  arabisch: "ar",
  bulgarisch: "bg",
  chinesisch: "zh",
  deutsch: "de",
  englisch: "en",
  französisch: "fr",
  griechisch: "el",
  italienisch: "it",
  niederländisch: "nl",
  polnisch: "pl",
  portugiesisch: "pt",
  rumänisch: "ro",
  russisch: "ru",
  serbisch: "sr",
  spanisch: "es",
  thailändisch: "th",
  tschechisch: "cs",
  türkisch: "tr",
  ukrainisch: "uk",
  ungarisch: "hu",
};

function languageCodes(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const codes = raw.flatMap((name) => {
    const s = str(name)?.toLowerCase();
    if (!s) return [];
    if (/^[a-z]{2}$/.test(s)) return [s];
    const code = LANGUAGE_CODES[s];
    if (!code) console.warn(`[vyceon] unbekannte Sprache "${s}"`);
    return code ? [code] : [];
  });
  return [...new Set(codes)];
}

/** 16-Gruppen-Serviceauswahl: [{key, label, services: [..]}] → einzelne Services */
function services(raw: unknown): Profile["services"] {
  if (!Array.isArray(raw)) return [];
  const out = new Map<string, Profile["services"][number]>();
  for (const group of raw) {
    if (!isObject(group) || !Array.isArray(group.services)) continue;
    const key = str(group.key) ?? "service";
    for (const name of group.services) {
      const de = str(name);
      if (de && !out.has(de)) out.set(de, { id: `${key}:${de}`, de });
    }
  }
  return [...out.values()];
}

/** Bildmaße aus ?w=…&h=… der Bild-URL (Listen-Vorschaubild hat keine Felder dafür). */
function sizeFromUrl(url: string) {
  try {
    const q = new URL(url).searchParams;
    const width = Number(q.get("w"));
    const height = Number(q.get("h"));
    if (width > 0 && height > 0) return { width, height };
  } catch {
    // ungültige URL → Standard
  }
  return { width: 480, height: 640 };
}

function images(raw: Json): Profile["images"] {
  if (Array.isArray(raw.media) && raw.media.length) {
    return raw.media.flatMap((m) =>
      isObject(m) &&
      str(m.url) &&
      typeof m.width === "number" &&
      typeof m.height === "number"
        ? [{ url: str(m.url)!, width: m.width, height: m.height, alt: "" }]
        : [],
    );
  }
  const thumb = str(raw.thumbnail_url);
  return thumb ? [{ url: thumb, ...sizeFromUrl(thumb), alt: "" }] : [];
}

function isRecent(iso: unknown, now: Date) {
  const t = typeof iso === "string" ? Date.parse(iso) : NaN;
  return (
    Number.isFinite(t) && now.getTime() - t <= NEW_DAYS * 86400000 && t <= +now
  );
}

/** Sedcard (Liste oder Detail) → Profil der Website. */
export function fromApiProfile(raw: unknown, now = new Date()): unknown {
  if (!isObject(raw)) return raw;
  const note = str(raw.about_text) ?? str(raw.tagline);
  return {
    id: raw.id,
    slug: raw.slug,
    name: str(raw.name),
    isNew: isRecent(raw.published_at, now),
    isBack: false,
    gender: "female",
    languages: languageCodes(raw.languages),
    services: services(raw.services),
    personalNote: note ? { de: note } : undefined,
    images: images(raw),
    updatedAt: raw.updated_at,
  };
}

/** Wer ist gerade im Haus? Der Beginn ist unbekannt. */
function fromApiPresence(raw: unknown): Presence[] {
  return isObject(raw) && raw.in_house === true && str(raw.id)
    ? [{ profileId: str(raw.id)! }]
    : [];
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
    return payload(json);
  }

  /**
   * Alle veröffentlichten Sedcards, Seite für Seite. Profile und Live-Status
   * kommen aus derselben Liste, daher ein gemeinsamer Cache von 60 Sekunden
   * (60 Abrufe pro Stunde bei einem Limit von 1000).
   */
  async function fetchAllSedcards(): Promise<unknown[]> {
    const all: unknown[] = [];
    for (let page = 1; page <= MAX_PAGES; page++) {
      const qs = new URLSearchParams({
        page: String(page),
        per_page: String(PAGE_SIZE),
        order: "name",
      });
      const data = await getJson(`/bordells/${org}/sedcards?${qs}`, {
        revalidate: REVALIDATE.presence,
        tags: [TAGS.profiles, TAGS.presence],
      });
      const items = pageItems(data);
      all.push(...items);
      if (!hasNextPage(data, page, items.length)) return all;
    }
    throw new Error(`VyceON: mehr als ${MAX_PAGES} Seiten`);
  }

  return {
    name: "vyceon",
    hasShifts: false,

    async listProfiles(): Promise<Profile[]> {
      return withFallback(
        "profiles",
        async () => {
          const now = new Date();
          const items = await fetchAllSedcards();
          return parseList(
            profileSchema,
            items.map((i) => fromApiProfile(i, now)),
            "vyceon.sedcards",
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
            const data = await getJson(
              `/bordells/${org}/sedcards/${encodeURIComponent(slug)}`,
              {
                revalidate: REVALIDATE.profiles,
                tags: [TAGS.profiles, TAGS.profile(slug)],
              },
            );
            const parsed = profileSchema.safeParse(fromApiProfile(data));
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

    async listShifts() {
      return [];
    },

    /** Live = `in_house`. */
    async getPresence(): Promise<Presence[]> {
      return withFallback(
        "presence",
        async () => (await fetchAllSedcards()).flatMap(fromApiPresence),
        [],
        PRESENCE_FALLBACK_MAX_AGE_MS,
      );
    },
  };
}
