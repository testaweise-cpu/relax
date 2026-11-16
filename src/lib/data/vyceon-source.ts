import { REVALIDATE, TAGS, type DataSource } from "./source";
import {
  parseList,
  profileSchema,
  storySchema,
  type Presence,
  type Profile,
  type Story,
} from "./types";

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

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Foto-Adresse ohne Wasserzeichen (…/media/{id}?w=&h=) → eigene Durchleitung
 * /api/foto/{slug}/{id}. Ohne solche Adresse (ältere API) bleibt das Bild von
 * VYCE69 mit Wasserzeichen.
 */
export function localPhotoUrl(original: unknown, slug: unknown): string | null {
  const url = str(original);
  const s = str(slug);
  if (!url || !s) return null;
  try {
    const u = new URL(url);
    const id = u.pathname.split("/").pop() ?? "";
    const w = u.searchParams.get("w");
    const h = u.searchParams.get("h");
    if (!UUID.test(id) || !w || !h) return null;
    return `/api/foto/${s}/${id.toLowerCase()}?w=${w}&h=${h}`;
  } catch {
    return null;
  }
}

function images(raw: Json): Profile["images"] {
  if (Array.isArray(raw.media) && raw.media.length) {
    return raw.media.flatMap((m) =>
      isObject(m) &&
      str(m.url) &&
      typeof m.width === "number" &&
      typeof m.height === "number"
        ? [
            {
              url: localPhotoUrl(m.original_url, raw.slug) ?? str(m.url)!,
              width: m.width,
              height: m.height,
              alt: "",
            },
          ]
        : [],
    );
  }
  const plain = localPhotoUrl(raw.original_thumbnail_url, raw.slug);
  if (plain) return [{ url: plain, width: 480, height: 640, alt: "" }];
  const thumb = str(raw.thumbnail_url);
  return thumb ? [{ url: thumb, ...sizeFromUrl(thumb), alt: "" }] : [];
}

function isRecent(iso: unknown, now: Date) {
  const t = typeof iso === "string" ? Date.parse(iso) : NaN;
  return (
    Number.isFinite(t) && now.getTime() - t <= NEW_DAYS * 86400000 && t <= +now
  );
}

const num = (v: unknown) => {
  const n = typeof v === "string" ? Number(v.replace(",", ".")) : v;
  return typeof n === "number" && Number.isFinite(n) ? n : undefined;
};
const flag = (v: unknown) =>
  typeof v === "boolean" ? v : (str(v) ?? undefined);

/** Bekannte Eckdaten: Feld der Website ← mögliche Namen bei VYCE69 */
const ATTRIBUTE_KEYS = {
  age: ["age"],
  heightCm: ["height_cm", "height"],
  weightKg: ["weight_kg", "weight"],
  cupSize: ["cup_size", "bra_size", "cup"],
  shoeSize: ["shoe_size"],
  clothingSize: ["clothing_size", "dress_size"],
  hairColor: ["hair_color"],
  eyeColor: ["eye_color"],
  bodyType: ["body_type", "figure"],
  intimateHair: ["intimate_hair"],
  tattoos: ["tattoos", "tattoo"],
  piercings: ["piercings", "piercing"],
  origin: ["origin", "country_code", "nationality"],
} as const;

/** "hair_length" → "Hair length" (nur für Felder ohne eigene Beschriftung) */
const humanize = (key: string) =>
  key.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());

/**
 * Eckdaten aus `attributes`. Bekannte Felder werden typisiert; alles andere
 * (Text, Zahl, Ja/Nein) landet in `extraFacts`, damit nichts verloren geht.
 */
function attributes(raw: unknown) {
  if (!isObject(raw)) return {};
  const pick = (names: readonly string[]) => {
    for (const n of names) if (raw[n] != null && raw[n] !== "") return raw[n];
    return undefined;
  };
  const known = new Set<string>(Object.values(ATTRIBUTE_KEYS).flat());
  const origin = str(pick(ATTRIBUTE_KEYS.origin));
  const extraFacts = Object.entries(raw).flatMap(([key, value]) => {
    if (known.has(key) || value == null || value === "") return [];
    const text =
      typeof value === "boolean"
        ? value
          ? "Ja"
          : "Nein"
        : typeof value === "number"
          ? String(value)
          : Array.isArray(value)
            ? value.filter((v) => typeof v === "string").join(", ")
            : str(value);
    return text ? [{ label: humanize(key), value: text }] : [];
  });
  return {
    age: num(pick(ATTRIBUTE_KEYS.age)),
    heightCm: num(pick(ATTRIBUTE_KEYS.heightCm)),
    weightKg: num(pick(ATTRIBUTE_KEYS.weightKg)),
    cupSize: str(pick(ATTRIBUTE_KEYS.cupSize)),
    shoeSize: num(pick(ATTRIBUTE_KEYS.shoeSize)),
    clothingSize:
      str(pick(ATTRIBUTE_KEYS.clothingSize)) ??
      num(pick(ATTRIBUTE_KEYS.clothingSize))?.toString(),
    hairColor: str(pick(ATTRIBUTE_KEYS.hairColor)),
    eyeColor: str(pick(ATTRIBUTE_KEYS.eyeColor)),
    bodyType: str(pick(ATTRIBUTE_KEYS.bodyType)),
    intimateHair: str(pick(ATTRIBUTE_KEYS.intimateHair)),
    tattoos: flag(pick(ATTRIBUTE_KEYS.tattoos)),
    piercings: flag(pick(ATTRIBUTE_KEYS.piercings)),
    // nur ISO-Ländercodes; ausgeschriebene Namen als freie Angabe
    origin:
      origin && /^[A-Za-z]{2}$/.test(origin) ? origin.toUpperCase() : undefined,
    extraFacts:
      origin && !/^[A-Za-z]{2}$/.test(origin)
        ? [{ label: "Herkunft", value: origin }, ...extraFacts]
        : extraFacts,
  };
}

/** Sedcard (Liste oder Detail) → Profil der Website. */
const LEVELS = ["none", "id", "live", "full"] as const;

/** Prüfstufe: aus der Liste direkt, aus der Einzelabfrage über trust.level */
function verificationLevel(raw: Json) {
  const v =
    raw.verification_level ?? (isObject(raw.trust) ? raw.trust.level : null);
  return LEVELS.find((l) => l === v) ?? null;
}

function trust(raw: unknown) {
  if (!isObject(raw) || !Array.isArray(raw.checks)) return null;
  return {
    checks: raw.checks.flatMap((c) =>
      isObject(c) && str(c.key)
        ? [{ key: c.key, confirmed: c.confirmed === true }]
        : [],
    ),
    lastReviewedAt: str(raw.last_reviewed_at) ?? null,
  };
}

function reviews(raw: unknown) {
  if (!isObject(raw) || !Array.isArray(raw.items)) return null;
  return {
    count: typeof raw.count === "number" ? raw.count : raw.items.length,
    average: typeof raw.average === "number" ? raw.average : null,
    items: raw.items.flatMap((r) =>
      isObject(r) && typeof r.rating === "number"
        ? [
            {
              rating: r.rating,
              body: str(r.body) ?? null,
              reply: str(r.provider_reply) ?? null,
              afterAppointment: r.after_appointment === true,
              createdAt: r.created_at,
            },
          ]
        : [],
    ),
  };
}

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
    verificationLevel: verificationLevel(raw),
    trust: trust(raw.trust),
    reviews: reviews(raw.reviews),
    // Liste: video_url; Einzelabfrage: videos[] – jeweils das erste
    video:
      localVideoUrl(raw.video_url) ??
      (Array.isArray(raw.videos) && isObject(raw.videos[0])
        ? localVideoUrl(raw.videos[0].url)
        : null),
    ...attributes(raw.attributes),
    updatedAt: raw.updated_at,
  };
}

/**
 * Wer ist gerade im Haus? `presence_state` "ready" heißt verfügbar; jeder
 * andere Wert (z. B. "on_site" für Zimmer oder Pause) nur „im Haus“.
 */
function fromApiPresence(raw: unknown): Presence[] {
  if (!isObject(raw) || raw.in_house !== true || !str(raw.id)) return [];
  const since = str(raw.in_house_since);
  return [
    {
      profileId: str(raw.id)!,
      state: raw.presence_state === "ready" ? "ready" : "on_site",
      ...(since && !Number.isNaN(Date.parse(since))
        ? { since: new Date(since).toISOString() }
        : {}),
    },
  ];
}

/** Stories laufen nach 24 h ab: bei Ausfall höchstens eine Stunde alte zeigen. */
const STORIES_FALLBACK_MAX_AGE_MS = 3600000;

/**
 * Video-Adresse der Bordell-API (…/media/{id}) → Adresse der eigenen
 * Durchleitung. Der Browser bekommt nie die Adresse der Gegenseite: sie
 * verlangt den API-Schlüssel, und die Seite lädt nichts von fremden Servern.
 */
export function localVideoUrl(url: unknown): string | null {
  const id = str(url)?.split(/[?#]/)[0].split("/").pop();
  return id && UUID.test(id) ? `/api/video/${id.toLowerCase()}` : null;
}

/** Antwort der Bordell-API → Story (Bild oder Video). */
function fromApiStory(raw: unknown): unknown[] {
  if (!isObject(raw)) return [];
  const url = str(raw.url);
  if (!url) return [];
  const video = raw.media_kind === "video" ? localVideoUrl(url) : null;
  if (raw.media_kind !== "image" && !video) return [];
  return [
    {
      id: raw.id,
      profileSlug: str(raw.sedcard_slug) ?? null,
      profileName: str(raw.sedcard_name) ?? null,
      image: video ? null : { url, ...sizeFromUrl(url), alt: "" },
      video,
      caption: str(raw.caption) ?? null,
      createdAt: raw.created_at,
      expiresAt: raw.expires_at,
    },
  ];
}

export function createVyceonSource(config: VyceonConfig): DataSource {
  const base = config.apiUrl.replace(/\/+$/, "");
  const org = encodeURIComponent(config.organizationId);

  async function getJson(
    path: string,
    cache: { revalidate: number; tags: string[] } | "no-store",
  ) {
    const res = await fetch(`${base}${path}`, {
      headers: {
        // Schlüssel nur im Header, nie in der URL; nur serverseitig.
        Authorization: `Bearer ${config.apiKey}`,
        Accept: "application/json",
      },
      ...(cache === "no-store" ? { cache } : { next: cache }),
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
   * kommen aus derselben Liste: ein eigener Zwischenspeicher von 60 Sekunden
   * statt des Next-Fetch-Caches, der nach einer Pause erst den alten Stand
   * ausliefert (60 Abrufe pro Stunde bei einem Limit von 1000).
   */
  let listMemo: { at: number; items: Promise<unknown[]> } | undefined;
  function fetchAllSedcards(): Promise<unknown[]> {
    if (listMemo && Date.now() - listMemo.at < REVALIDATE.presence * 1000)
      return listMemo.items;
    const memo = { at: Date.now(), items: loadAllSedcards() };
    listMemo = memo;
    memo.items.catch(() => {
      if (listMemo === memo) listMemo = undefined;
    });
    return memo.items;
  }

  async function loadAllSedcards(): Promise<unknown[]> {
    const all: unknown[] = [];
    for (let page = 1; page <= MAX_PAGES; page++) {
      const qs = new URLSearchParams({
        page: String(page),
        per_page: String(PAGE_SIZE),
        order: "name",
      });
      const data = await getJson(`/bordells/${org}/sedcards?${qs}`, "no-store");
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

    /** Ein Abschnitt eines Videos, mit Schlüssel bei der Bordell-API geholt. */
    /** Foto ohne Wasserzeichen, mit Schlüssel geholt; 10 min zwischengespeichert. */
    async fetchPhoto(id: string, w: number, h: number) {
      if (!UUID.test(id)) return null;
      return fetch(`${base}/bordells/${org}/media/${id}?w=${w}&h=${h}`, {
        headers: { Authorization: `Bearer ${config.apiKey}` },
        cache: "force-cache",
        next: { revalidate: 600, tags: [TAGS.profiles] },
        signal: AbortSignal.timeout(15000),
      });
    },

    async fetchVideo(id: string, range?: string): Promise<Response | null> {
      if (!UUID.test(id)) return null;
      return fetch(`${base}/bordells/${org}/media/${id}`, {
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          ...(range ? { Range: range } : {}),
        },
        cache: "no-store",
        signal: AbortSignal.timeout(30000),
      });
    },

    /**
     * Laufende Stories (Bordell-API v1: GET /bordells/{id}/stories). Kennt die
     * Gegenseite den Endpunkt noch nicht (404), gibt es schlicht keine Stories.
     * Videos laufen über die eigene Durchleitung (/api/video).
     */
    async listStories(): Promise<Story[]> {
      try {
        return await withFallback(
          "stories",
          async () => {
            const data = await getJson(`/bordells/${org}/stories`, {
              revalidate: REVALIDATE.stories,
              tags: [TAGS.stories],
            });
            return parseList(
              storySchema,
              pageItems(data).flatMap(fromApiStory),
              "vyceon.stories",
            );
          },
          [],
          STORIES_FALLBACK_MAX_AGE_MS,
        );
      } catch (error) {
        if (error instanceof NotFoundError) return [];
        throw error;
      }
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
