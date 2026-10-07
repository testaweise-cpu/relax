import "server-only";
import { connection } from "next/server";
import { getDataSource } from "@/lib/data";
import type { TimeLocale } from "@/lib/time/shifts";
import { buildCards, sortCards } from "./cards";

const DAY = 86400000;

/**
 * Alle Profile als Kacheln (jetzt da zuerst). Rendert pro Anfrage, weil
 * "jetzt" sich ändert; die Daten selbst kommen aus dem Cache der Quelle.
 */
export async function getProfileCards(locale: TimeLocale) {
  await connection();
  const ds = getDataSource();
  const now = new Date();
  const [profiles, presence, shifts] = await Promise.all([
    ds.listProfiles(),
    ds.getPresence(),
    ds.listShifts(
      new Date(now.getTime() - DAY),
      new Date(now.getTime() + 8 * DAY),
    ),
  ]);
  return {
    now,
    cards: sortCards(
      buildCards(profiles, presence, shifts, now, locale),
      locale,
    ),
  };
}

/** Ein Profil mit Anwesenheit und Schichten der nächsten 30 Tage. */
export async function getProfileDetail(slug: string) {
  await connection();
  const ds = getDataSource();
  const now = new Date();
  const profile = await ds.getProfile(slug);
  if (!profile) return null;
  const [presence, shifts] = await Promise.all([
    ds.getPresence(),
    ds.listShifts(
      new Date(now.getTime() - DAY),
      new Date(now.getTime() + 31 * DAY),
    ),
  ]);
  return {
    now,
    profile,
    presence: presence.find((p) => p.profileId === profile.id) ?? null,
    shifts: shifts.filter((s) => s.profileId === profile.id),
  };
}
