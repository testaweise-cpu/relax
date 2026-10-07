/**
 * Zeitrechnung in Europe/Berlin – unabhängig von der Zeitzone des Servers
 * (der Container läuft typischerweise in UTC). Nur Intl, keine Bibliothek.
 *
 * Begriffe:
 * - "Instant": ein echter Zeitpunkt (Date / ISO-String mit Offset).
 * - "Berliner Kalendertag": YYYY-MM-DD so, wie ihn eine Uhr in Berlin zeigt.
 */

export const TIME_ZONE = "Europe/Berlin";

const partsFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
  weekday: "short",
});

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export type BerlinParts = {
  year: number;
  month: number; // 1–12
  day: number;
  hour: number; // 0–23
  minute: number;
  second: number;
  weekday: number; // 0 = Sonntag
};

/** Wanduhr-Zeit in Berlin für einen Zeitpunkt. */
export function berlinParts(date: Date): BerlinParts {
  const map: Record<string, string> = {};
  for (const p of partsFormatter.formatToParts(date)) map[p.type] = p.value;
  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    hour: Number(map.hour),
    minute: Number(map.minute),
    second: Number(map.second),
    weekday: WEEKDAYS.indexOf(map.weekday),
  };
}

/** Abstand Berlin zu UTC in Minuten (60 im Winter, 120 im Sommer). */
export function berlinOffsetMinutes(date: Date): number {
  const p = berlinParts(date);
  const asUtc = Date.UTC(
    p.year,
    p.month - 1,
    p.day,
    p.hour,
    p.minute,
    p.second,
  );
  return Math.round((asUtc - Math.floor(date.getTime() / 1000) * 1000) / 60000);
}

/**
 * Zeitpunkt für eine Berliner Wanduhr-Zeit. Bei der Zeitumstellung gilt:
 * nicht existierende Zeiten (02:30 im März) werden nach vorn verschoben,
 * doppelte Zeiten (02:30 im Oktober) ergeben die erste (Sommerzeit-)Variante.
 */
export function fromBerlin(
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
): Date {
  const wall = Date.UTC(year, month - 1, day, hour, minute);
  // Berlin ist UTC+2 (Sommer) oder UTC+1 (Winter). Früheste passende Variante.
  for (const offsetHours of [2, 1]) {
    const candidate = new Date(wall - offsetHours * 3600000);
    const p = berlinParts(candidate);
    if (p.hour === hour && p.minute === minute && p.day === day)
      return candidate;
  }
  // Lücke bei der Umstellung auf Sommerzeit: Zeit nach vorn verschieben.
  return new Date(wall - 3600000);
}

/** Berliner Kalendertag als "YYYY-MM-DD". */
export function berlinDayKey(date: Date): string {
  const p = berlinParts(date);
  return `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
}

/** Beginn (00:00 Berlin) des Kalendertags, in dem `date` liegt, plus `addDays`. */
export function startOfBerlinDay(date: Date, addDays = 0): Date {
  const p = berlinParts(date);
  // Kalenderarithmetik über UTC-Datum (ohne Uhrzeit) – DST-sicher.
  const d = new Date(Date.UTC(p.year, p.month - 1, p.day + addDays));
  return fromBerlin(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
}

/** Anzahl Berliner Kalendertage von `a` bis `b` (b − a). */
export function berlinDayDiff(a: Date, b: Date): number {
  const pa = berlinParts(a);
  const pb = berlinParts(b);
  const ua = Date.UTC(pa.year, pa.month - 1, pa.day);
  const ub = Date.UTC(pb.year, pb.month - 1, pb.day);
  return Math.round((ub - ua) / 86400000);
}
