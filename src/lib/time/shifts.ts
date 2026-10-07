import {
  berlinDayDiff,
  berlinDayKey,
  berlinParts,
  startOfBerlinDay,
  TIME_ZONE,
} from "./berlin";

export type TimeLocale = "de" | "en";

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
  if (locale === "en") return `${hour}:${String(p.minute).padStart(2, "0")}`;
  return p.minute === 0
    ? String(hour)
    : `${hour}:${String(p.minute).padStart(2, "0")}`;
}

/** "16–24" bzw. "16:00–24:00" */
export function formatRange(shift: ShiftLike, locale: TimeLocale): string {
  return `${formatClock(toDate(shift.start), locale)}–${formatClock(toDate(shift.end), locale, { asEnd: true })}`;
}

const dateFormatters = {
  de: new Intl.DateTimeFormat("de-DE", {
    timeZone: TIME_ZONE,
    day: "2-digit",
    month: "2-digit",
  }),
  en: new Intl.DateTimeFormat("en-GB", {
    timeZone: TIME_ZONE,
    day: "numeric",
    month: "short",
  }),
};
const weekdayFormatters = {
  de: new Intl.DateTimeFormat("de-DE", {
    timeZone: TIME_ZONE,
    weekday: "short",
  }),
  en: new Intl.DateTimeFormat("en-GB", {
    timeZone: TIME_ZONE,
    weekday: "short",
  }),
};

/** "24.09." bzw. "24 Sep" */
export function formatShortDate(date: Date, locale: TimeLocale): string {
  const s = dateFormatters[locale].format(date);
  return locale === "de" ? `${s}.`.replace("..", ".") : s;
}

/** "Mo" bzw. "Mon" */
export function formatWeekday(date: Date, locale: TimeLocale): string {
  return weekdayFormatters[locale].format(date).replace(".", "");
}

const T = {
  de: {
    today: "heute",
    tomorrow: "morgen",
    until: (t: string) => `bis ${t} Uhr`,
    range: (r: string) => `${r} Uhr`,
    from: (t: string) => `ab ${t} Uhr`,
    fromDate: (d: string) => `ab ${d}`,
  },
  en: {
    today: "today",
    tomorrow: "tomorrow",
    until: (t: string) => `until ${t}`,
    range: (r: string) => r,
    from: (t: string) => `from ${t}`,
    fromDate: (d: string) => `from ${d}`,
  },
} as const;

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

/** Label für eine laufende Anwesenheit: "bis 24 Uhr" bzw. "seit 16 Uhr". */
export function presenceLabel(
  presence: { since: string; until?: string | null },
  locale: TimeLocale,
): string {
  if (presence.until) {
    const t = formatClock(toDate(presence.until), locale, { asEnd: true });
    return locale === "de" ? `bis ${t} Uhr` : `until ${t}`;
  }
  const t = formatClock(toDate(presence.since), locale);
  return locale === "de" ? `seit ${t} Uhr` : `since ${t}`;
}
