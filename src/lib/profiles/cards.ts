import type { Presence, Profile, Shift } from "@/lib/data/types";
import {
  nextRelevantShift,
  presenceLabel,
  profileTimeLabel,
  type TimeLocale,
} from "@/lib/time/shifts";

/** Was eine Kachel braucht – berechnet auf dem Server. */
export type ProfileCard = {
  profile: Profile;
  isLive: boolean;
  timeLabel?: string;
  /** Beginn der nächsten Schicht (für Sortierung) */
  nextStart?: string;
};

export function buildCards(
  profiles: Profile[],
  presence: Presence[],
  shifts: Shift[],
  now: Date,
  locale: TimeLocale,
): ProfileCard[] {
  const presenceById = new Map(presence.map((p) => [p.profileId, p]));
  const shiftsById = new Map<string, Shift[]>();
  for (const s of shifts) {
    const list = shiftsById.get(s.profileId) ?? [];
    list.push(s);
    shiftsById.set(s.profileId, list);
  }
  return profiles.map((profile) => {
    const own = shiftsById.get(profile.id) ?? [];
    const live = presenceById.get(profile.id);
    return {
      profile,
      isLive: Boolean(live),
      timeLabel: live
        ? presenceLabel(live, locale)
        : profileTimeLabel(own, now, locale),
      nextStart: nextRelevantShift(own, now)?.start,
    };
  });
}

/** Sortierung: jetzt da → nächste Schicht zuerst → ohne Schicht; dann Name. */
export function sortCards(
  cards: ProfileCard[],
  locale: TimeLocale,
): ProfileCard[] {
  return [...cards].sort((a, b) => {
    if (a.isLive !== b.isLive) return a.isLive ? -1 : 1;
    if (a.nextStart && b.nextStart && a.nextStart !== b.nextStart) {
      return a.nextStart.localeCompare(b.nextStart);
    }
    if (Boolean(a.nextStart) !== Boolean(b.nextStart))
      return a.nextStart ? -1 : 1;
    return a.profile.name.localeCompare(b.profile.name, locale);
  });
}

/* ---------------- Filter (im URL-Query, damit teilbar) ---------------- */

export type ProfileFilters = {
  languages: string[]; // ISO-639-1, klein
  origins: string[]; // ISO-3166, groß
  now: boolean;
  isNew: boolean;
};

export const FILTER_PARAMS = {
  languages: "sprache",
  origins: "herkunft",
  now: "jetzt",
  isNew: "neu",
} as const;

type SearchParams = Record<string, string | string[] | undefined>;

function list(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value.join(",") : (value ?? "");
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => /^[A-Za-z]{2,3}$/.test(s));
}

export function parseFilters(sp: SearchParams): ProfileFilters {
  return {
    languages: [
      ...new Set(list(sp[FILTER_PARAMS.languages]).map((s) => s.toLowerCase())),
    ].sort(),
    origins: [
      ...new Set(list(sp[FILTER_PARAMS.origins]).map((s) => s.toUpperCase())),
    ].sort(),
    now: sp[FILTER_PARAMS.now] === "1",
    isNew: sp[FILTER_PARAMS.isNew] === "1",
  };
}

/** Query-String für einen Filterzustand (leere Werte entfallen). */
export function filtersToQuery(f: ProfileFilters): Record<string, string> {
  const q: Record<string, string> = {};
  if (f.languages.length)
    q[FILTER_PARAMS.languages] = [...f.languages].sort().join(",");
  if (f.origins.length)
    q[FILTER_PARAMS.origins] = [...f.origins].sort().join(",");
  if (f.now) q[FILTER_PARAMS.now] = "1";
  if (f.isNew) q[FILTER_PARAMS.isNew] = "1";
  return q;
}

export function toggle<T>(values: T[], value: T): T[] {
  return values.includes(value)
    ? values.filter((v) => v !== value)
    : [...values, value];
}

export function hasActiveFilters(f: ProfileFilters) {
  return f.languages.length > 0 || f.origins.length > 0 || f.now || f.isNew;
}

/**
 * Sprachen: mindestens eine der gewählten wird gesprochen (ODER).
 * Herkunft: eines der gewählten Länder (ODER). Kategorien untereinander: UND.
 */
export function applyFilters(
  cards: ProfileCard[],
  f: ProfileFilters,
): ProfileCard[] {
  return cards.filter(({ profile, isLive }) => {
    if (f.now && !isLive) return false;
    if (f.isNew && !profile.isNew) return false;
    if (
      f.languages.length &&
      !profile.languages.some((l) => f.languages.includes(l.toLowerCase()))
    )
      return false;
    if (
      f.origins.length &&
      !(profile.origin && f.origins.includes(profile.origin.toUpperCase()))
    )
      return false;
    return true;
  });
}

/** Verfügbare Filterwerte mit Anzahl, für die Chips. */
export function filterOptions(cards: ProfileCard[]) {
  const count = (values: string[]) => {
    const m = new Map<string, number>();
    for (const v of values) m.set(v, (m.get(v) ?? 0) + 1);
    return [...m.entries()].sort(
      (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
    );
  };
  return {
    languages: count(
      cards.flatMap((c) => c.profile.languages.map((l) => l.toLowerCase())),
    ),
    origins: count(
      cards.flatMap((c) =>
        c.profile.origin ? [c.profile.origin.toUpperCase()] : [],
      ),
    ),
    live: cards.filter((c) => c.isLive).length,
    isNew: cards.filter((c) => c.profile.isNew).length,
  };
}
