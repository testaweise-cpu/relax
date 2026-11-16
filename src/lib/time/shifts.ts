import {
  berlinDayDiff,
  berlinDayKey,
  berlinParts,
  startOfBerlinDay,
  TIME_ZONE,
} from "./berlin";
import { LOCALE_META, type Locale } from "@/i18n/locales";

export type TimeLocale = Locale;

/** Minimale Schicht-Form, damit die Zeitlogik unabhängig von der Datenschicht bleibt. */
export type ShiftLike = { start: string; end: string };

const toDate = (iso: string) => new Date(iso);

export function isShiftActive(shift: ShiftLike, now: Date): boolean {
  const t = now.getTime();
  return toDate(shift.start).getTime() <= t && t < toDate(shift.end).getTime();
}

/**
 * Uhrzeit kompakt: "16", "16:30". Endet eine Schicht genau um Mitternacht,
 * heißt das Ende "24" (bzw. "24:00"), nicht "0".
 */
export function formatClock(
  date: Date,
  locale: TimeLocale,
  { asEnd = false }: { asEnd?: boolean } = {},
): string {
  const p = berlinParts(date);
  const hour = asEnd && p.hour === 0 && p.minute === 0 ? 24 : p.hour;
  // Nur im Deutschen ohne Minuten ("16 Uhr"); sonst immer 16:00
  if (locale !== "de") return `${hour}:${String(p.minute).padStart(2, "0")}`;
  return p.minute === 0
    ? String(hour)
    : `${hour}:${String(p.minute).padStart(2, "0")}`;
}

/** "16–24" bzw. "16:00–24:00" */
export function formatRange(shift: ShiftLike, locale: TimeLocale): string {
  return `${formatClock(toDate(shift.start), locale)}–${formatClock(toDate(shift.end), locale, { asEnd: true })}`;
}

const dateFormatters = new Map<TimeLocale, Intl.DateTimeFormat>();
const weekdayFormatters = new Map<TimeLocale, Intl.DateTimeFormat>();
function dateFormatter(locale: TimeLocale) {
  let f = dateFormatters.get(locale);
  if (!f) {
    f = new Intl.DateTimeFormat(
      LOCALE_META[locale].bcp47,
      locale === "de"
        ? { timeZone: TIME_ZONE, day: "2-digit", month: "2-digit" }
        : { timeZone: TIME_ZONE, day: "numeric", month: "short" },
    );
    dateFormatters.set(locale, f);
  }
  return f;
}
function weekdayFormatter(locale: TimeLocale) {
  let f = weekdayFormatters.get(locale);
  if (!f) {
    f = new Intl.DateTimeFormat(LOCALE_META[locale].bcp47, {
      timeZone: TIME_ZONE,
      weekday: "short",
    });
    weekdayFormatters.set(locale, f);
  }
  return f;
}

/** "24.09." bzw. "24 Sep" */
export function formatShortDate(date: Date, locale: TimeLocale): string {
  const s = dateFormatter(locale).format(date);
  return locale === "de" ? `${s}.`.replace("..", ".") : s;
}

/** "Mo" bzw. "Mon" */
export function formatWeekday(date: Date, locale: TimeLocale): string {
  return weekdayFormatter(locale).format(date).replace(".", "");
}

type Phrases = {
  today: string;
  tomorrow: string;
  until: (t: string) => string;
  range: (r: string) => string;
  from: (t: string) => string;
  fromDate: (d: string) => string;
  since: (t: string) => string;
  busy: string;
  available: string;
  inHouse: string;
};

/** Kurze Zeitangaben je Sprache (Mieterinnen sind Frauen: weibliche Formen). */
const T: Record<TimeLocale, Phrases> = {
  de: {
    today: "heute",
    tomorrow: "morgen",
    until: (t) => `bis ${t} Uhr`,
    range: (r) => `${r} Uhr`,
    from: (t) => `ab ${t} Uhr`,
    fromDate: (d) => `ab ${d}`,
    since: (t) => `seit ${t} Uhr`,
    busy: "im Haus · gerade beschäftigt",
    available: "gerade vor Ort",
    inHouse: "jetzt im Haus",
  },
  en: {
    today: "today",
    tomorrow: "tomorrow",
    until: (t) => `until ${t}`,
    range: (r) => r,
    from: (t) => `from ${t}`,
    fromDate: (d) => `from ${d}`,
    since: (t) => `since ${t}`,
    busy: "in the house · busy",
    available: "on site now",
    inHouse: "in the house now",
  },
  pl: {
    today: "dziś",
    tomorrow: "jutro",
    until: (t) => `do ${t}`,
    range: (r) => r,
    from: (t) => `od ${t}`,
    fromDate: (d) => `od ${d}`,
    since: (t) => `od ${t}`,
    busy: "na miejscu · zajęta",
    available: "teraz na miejscu",
    inHouse: "teraz na miejscu",
  },
  ro: {
    today: "azi",
    tomorrow: "mâine",
    until: (t) => `până la ${t}`,
    range: (r) => r,
    from: (t) => `de la ${t}`,
    fromDate: (d) => `din ${d}`,
    since: (t) => `de la ${t}`,
    busy: "în casă · ocupată",
    available: "acum la fața locului",
    inHouse: "acum în casă",
  },
  bg: {
    today: "днес",
    tomorrow: "утре",
    until: (t) => `до ${t} ч.`,
    range: (r) => `${r} ч.`,
    from: (t) => `от ${t} ч.`,
    fromDate: (d) => `от ${d}`,
    since: (t) => `от ${t} ч.`,
    busy: "в къщата · заета",
    available: "в момента на място",
    inHouse: "сега в къщата",
  },
  hu: {
    today: "ma",
    tomorrow: "holnap",
    until: (t) => `${t} óráig`,
    range: (r) => r,
    from: (t) => `${t} órától`,
    fromDate: (d) => `kezdés: ${d}`,
    since: (t) => `${t} óra óta`,
    busy: "a házban · foglalt",
    available: "most a helyszínen",
    inHouse: "most a házban",
  },
  tr: {
    today: "bugün",
    tomorrow: "yarın",
    until: (t) => `bitiş ${t}`,
    range: (r) => r,
    from: (t) => `başlangıç ${t}`,
    fromDate: (d) => `${d} itibarıyla`,
    since: (t) => `başlangıç ${t}`,
    busy: "evde · meşgul",
    available: "şu an burada",
    inHouse: "şimdi evde",
  },
  es: {
    today: "hoy",
    tomorrow: "mañana",
    until: (t) => `hasta las ${t}`,
    range: (r) => r,
    from: (t) => `desde las ${t}`,
    fromDate: (d) => `desde el ${d}`,
    since: (t) => `desde las ${t}`,
    busy: "en casa · ocupada",
    available: "ahora en el local",
    inHouse: "ahora en casa",
  },
  fr: {
    today: "aujourd’hui",
    tomorrow: "demain",
    until: (t) => `jusqu’à ${t}`,
    range: (r) => r,
    from: (t) => `à partir de ${t}`,
    fromDate: (d) => `à partir du ${d}`,
    since: (t) => `depuis ${t}`,
    busy: "sur place · occupée",
    available: "sur place en ce moment",
    inHouse: "sur place maintenant",
  },
  pt: {
    today: "hoje",
    tomorrow: "amanhã",
    until: (t) => `até ${t}`,
    range: (r) => r,
    from: (t) => `a partir das ${t}`,
    fromDate: (d) => `a partir de ${d}`,
    since: (t) => `desde ${t}`,
    busy: "na casa · ocupada",
    available: "no local agora",
    inHouse: "na casa agora",
  },
};

/**
 * Kurzlabel für eine Schicht relativ zu `now`:
 * - läuft seit gestern (über Mitternacht): "heute bis 6 Uhr"
 * - beginnt/läuft heute: "heute 16–24 Uhr"
 * - beginnt morgen: "morgen ab 10 Uhr"
 * - später: "ab 24.09."
 */
export function shiftLabel(
  shift: ShiftLike,
  now: Date,
  locale: TimeLocale,
): string {
  const t = T[locale];
  const start = toDate(shift.start);
  const end = toDate(shift.end);
  const startDiff = berlinDayDiff(now, start);

  if (startDiff < 0 && end > now) {
    return `${t.today} ${t.until(formatClock(end, locale, { asEnd: true }))}`;
  }
  if (startDiff === 0)
    return `${t.today} ${t.range(formatRange(shift, locale))}`;
  if (startDiff === 1)
    return `${t.tomorrow} ${t.from(formatClock(start, locale))}`;
  return t.fromDate(formatShortDate(start, locale));
}

/** Die laufende Schicht, sonst die nächste kommende; vergangene zählen nicht. */
export function nextRelevantShift<S extends ShiftLike>(
  shifts: S[],
  now: Date,
): S | undefined {
  const active = shifts.find((s) => isShiftActive(s, now));
  if (active) return active;
  return shifts
    .filter((s) => toDate(s.start) > now)
    .sort((a, b) => toDate(a.start).getTime() - toDate(b.start).getTime())[0];
}

export function profileTimeLabel(
  shifts: ShiftLike[],
  now: Date,
  locale: TimeLocale,
) {
  const next = nextRelevantShift(shifts, now);
  return next ? shiftLabel(next, now, locale) : undefined;
}

export type WeekPlanDay = {
  key: string; // YYYY-MM-DD (Berlin)
  weekday: string; // "Mo"
  date: string; // "07.10."
  isToday: boolean;
  isTomorrow: boolean;
  slots: { range: string; active: boolean }[];
};

/**
 * Wochenplan ab heute: eine Zeile je Berliner Kalendertag. Eine Schicht über
 * Mitternacht erscheint am Tag ihres Beginns ("22–6").
 */
export function weekPlan(
  shifts: ShiftLike[],
  now: Date,
  locale: TimeLocale,
  days = 7,
): WeekPlanDay[] {
  const sorted = [...shifts].sort(
    (a, b) => toDate(a.start).getTime() - toDate(b.start).getTime(),
  );
  return Array.from({ length: days }, (_, i) => {
    const dayStart = startOfBerlinDay(now, i);
    const key = berlinDayKey(dayStart);
    const slots = sorted
      .filter(
        (s) => berlinDayKey(toDate(s.start)) === key && toDate(s.end) > now,
      )
      .map((s) => ({
        range: T[locale].range(formatRange(s, locale)),
        active: isShiftActive(s, now),
      }));
    // Schicht von gestern, die heute noch läuft
    if (i === 0) {
      const carried = sorted.find(
        (s) => berlinDayDiff(now, toDate(s.start)) < 0 && isShiftActive(s, now),
      );
      if (carried) {
        slots.unshift({
          range: T[locale].until(
            formatClock(toDate(carried.end), locale, { asEnd: true }),
          ),
          active: true,
        });
      }
    }
    return {
      key,
      weekday: formatWeekday(dayStart, locale),
      date: formatShortDate(dayStart, locale),
      isToday: i === 0,
      isTomorrow: i === 1,
      slots,
    };
  });
}

/** Hat das Profil in den nächsten `days` Tagen mindestens eine Schicht? (für noindex) */
export function hasUpcomingShift(
  shifts: ShiftLike[],
  now: Date,
  days = 30,
): boolean {
  const limit = now.getTime() + days * 86400000;
  return shifts.some(
    (s) => toDate(s.end) > now && toDate(s.start).getTime() <= limit,
  );
}

/** Label für eine laufende Anwesenheit: "bis 24 Uhr", "seit 16 Uhr" oder "jetzt im Haus". */
export function presenceLabel(
  presence: {
    state?: "ready" | "on_site" | null;
    since?: string | null;
    until?: string | null;
  },
  locale: TimeLocale,
): string {
  const t = T[locale];
  if (presence.state === "on_site" && !presence.until) return t.busy;
  if (presence.until)
    return t.until(
      formatClock(toDate(presence.until), locale, { asEnd: true }),
    );
  if (presence.since)
    return t.since(formatClock(toDate(presence.since), locale));
  if (presence.state === "ready") return t.available;
  return t.inHouse;
}
