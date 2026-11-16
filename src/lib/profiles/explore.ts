import type { ProfileCard } from "./cards";

/**
 * Suche, Filter und Sortierung der Mieterinnen-Übersicht. Reine Funktionen:
 * laufen auf dem Server (erste Ausgabe, ohne JavaScript) und im Browser
 * (Sofortsuche). Der Zustand steht im URL-Query, damit Links teilbar sind.
 */

export type ExplorerService = { key: string; de: string; en?: string };

/** Schlanke Kachel-Daten für den Browser (ohne Bio, Maße usw.). */
export type ExplorerCard = {
  slug: string;
  name: string;
  /** ISO-639-1, klein */
  languages: string[];
  origin?: string;
  isNew: boolean;
  isBack: boolean;
  isLive: boolean;
  liveState?: "ready" | "on_site";
  timeLabel?: string;
  image?: { url: string; width: number; height: number; alt: string };
  video?: string | null;
  verified?: boolean;
  services: ExplorerService[];
};

export const SORTS = ["live", "new", "az"] as const;
export type Sort = (typeof SORTS)[number];

export type ProfileFilters = {
  q: string;
  languages: string[]; // ISO-639-1, klein
  origins: string[]; // ISO-3166, groß
  services: string[]; // Service-Schlüssel (siehe serviceKey)
  now: boolean;
  isNew: boolean;
  sort: Sort;
};

export const FILTER_PARAMS = {
  q: "suche",
  languages: "sprache",
  origins: "herkunft",
  services: "service",
  now: "jetzt",
  isNew: "neu",
  sort: "sortierung",
} as const;

export const EMPTY_FILTERS: ProfileFilters = {
  q: "",
  languages: [],
  origins: [],
  services: [],
  now: false,
  isNew: false,
  sort: "live",
};

/** Klein, ohne Akzente/Umlaute-Varianten – für Suche und Schlüssel. */
export function fold(s: string) {
  return s
    .toLowerCase()
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

/** Lesbarer, URL-tauglicher Schlüssel eines Service, z. B. "kussen-bei-sympathie". */
export function serviceKey(name: string) {
  return fold(name)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function toExplorerCard(card: ProfileCard): ExplorerCard {
  const { profile } = card;
  return {
    slug: profile.slug,
    name: profile.name,
    languages: profile.languages.map((l) => l.toLowerCase()),
    origin: profile.origin?.toUpperCase(),
    isNew: profile.isNew,
    isBack: profile.isBack,
    isLive: card.isLive,
    liveState: card.liveState,
    timeLabel: card.timeLabel,
    image: profile.images[0],
    video: profile.video,
    verified: Boolean(
      profile.verificationLevel && profile.verificationLevel !== "none",
    ),
    services: profile.services.map((s) => ({
      key: serviceKey(s.de),
      de: s.de,
      en: s.en,
    })),
  };
}

type SearchParams = Record<string, string | string[] | undefined>;

function one(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

function list(value: string | string[] | undefined, pattern: RegExp) {
  const raw = Array.isArray(value) ? value.join(",") : (value ?? "");
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => pattern.test(s));
}

export function parseFilters(sp: SearchParams): ProfileFilters {
  const sort = one(sp[FILTER_PARAMS.sort]) as Sort;
  return {
    q: one(sp[FILTER_PARAMS.q]).trim().slice(0, 60),
    languages: [
      ...new Set(
        list(sp[FILTER_PARAMS.languages], /^[A-Za-z]{2,3}$/).map((s) =>
          s.toLowerCase(),
        ),
      ),
    ].sort(),
    origins: [
      ...new Set(
        list(sp[FILTER_PARAMS.origins], /^[A-Za-z]{2,3}$/).map((s) =>
          s.toUpperCase(),
        ),
      ),
    ].sort(),
    services: [
      ...new Set(list(sp[FILTER_PARAMS.services], /^[a-z0-9-]{1,60}$/)),
    ].sort(),
    now: one(sp[FILTER_PARAMS.now]) === "1",
    isNew: one(sp[FILTER_PARAMS.isNew]) === "1",
    sort: SORTS.includes(sort) ? sort : "live",
  };
}

/** Query-String für einen Filterzustand (leere Werte und Standards entfallen). */
export function filtersToQuery(f: ProfileFilters): Record<string, string> {
  const q: Record<string, string> = {};
  if (f.q.trim()) q[FILTER_PARAMS.q] = f.q.trim();
  if (f.languages.length)
    q[FILTER_PARAMS.languages] = [...f.languages].sort().join(",");
  if (f.origins.length)
    q[FILTER_PARAMS.origins] = [...f.origins].sort().join(",");
  if (f.services.length)
    q[FILTER_PARAMS.services] = [...f.services].sort().join(",");
  if (f.now) q[FILTER_PARAMS.now] = "1";
  if (f.isNew) q[FILTER_PARAMS.isNew] = "1";
  if (f.sort !== "live") q[FILTER_PARAMS.sort] = f.sort;
  return q;
}

export function toggle<T>(values: T[], value: T): T[] {
  return values.includes(value)
    ? values.filter((v) => v !== value)
    : [...values, value];
}

/** Ändert die Auswahl (nicht nur die Reihenfolge)? Dann noindex. */
export function hasActiveFilters(f: ProfileFilters) {
  return (
    f.q.trim() !== "" ||
    f.languages.length > 0 ||
    f.origins.length > 0 ||
    f.services.length > 0 ||
    f.now ||
    f.isNew
  );
}

function matchesQuery(card: ExplorerCard, q: string) {
  const needle = fold(q.trim());
  if (!needle) return true;
  return (
    fold(card.name).includes(needle) ||
    card.services.some(
      (s) =>
        fold(s.de).includes(needle) || (s.en && fold(s.en).includes(needle)),
    )
  );
}

/**
 * Suche: Name oder Service enthält den Begriff.
 * Sprachen und Herkunft: eine der gewählten genügt (ODER).
 * Services: alle gewählten müssen angeboten werden (UND).
 * Kategorien untereinander: UND.
 */
export function applyFilters(
  cards: ExplorerCard[],
  f: ProfileFilters,
  locale = "de",
): ExplorerCard[] {
  const filtered = cards.filter((card) => {
    if (f.now && !card.isLive) return false;
    if (f.isNew && !card.isNew) return false;
    if (
      f.languages.length &&
      !card.languages.some((l) => f.languages.includes(l))
    )
      return false;
    if (f.origins.length && !(card.origin && f.origins.includes(card.origin)))
      return false;
    if (
      f.services.length &&
      !f.services.every((k) => card.services.some((s) => s.key === k))
    )
      return false;
    return matchesQuery(card, f.q);
  });
  if (f.sort === "az")
    return filtered.sort((a, b) => a.name.localeCompare(b.name, locale));
  if (f.sort === "new")
    // Neue zuerst, sonst die Standardreihenfolge (live → Name) beibehalten
    return filtered
      .map((c, i) => ({ c, i }))
      .sort((a, b) => Number(b.c.isNew) - Number(a.c.isNew) || a.i - b.i)
      .map(({ c }) => c);
  return filtered;
}

/** Verfügbare Filterwerte mit Anzahl, für die Chips. */
export function filterOptions(cards: ExplorerCard[], locale = "de") {
  const count = (values: string[]) => {
    const m = new Map<string, number>();
    for (const v of values) m.set(v, (m.get(v) ?? 0) + 1);
    return [...m.entries()].sort(
      (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
    );
  };
  const names = new Map<string, ExplorerService>();
  for (const c of cards) for (const s of c.services) names.set(s.key, s);
  return {
    languages: count(cards.flatMap((c) => c.languages)),
    origins: count(cards.flatMap((c) => (c.origin ? [c.origin] : []))),
    services: count(
      cards.flatMap((c) => [...new Set(c.services.map((s) => s.key))]),
    ).map(([key, n]) => {
      const s = names.get(key)!;
      return {
        key,
        n,
        label: (locale !== "de" && s.en) || s.de,
      };
    }),
    live: cards.filter((c) => c.isLive).length,
    isNew: cards.filter((c) => c.isNew).length,
  };
}

export type FilterOptions = ReturnType<typeof filterOptions>;
