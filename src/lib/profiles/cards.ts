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
  /** Zustand im Haus (nur wenn live) */
  liveState?: Presence["state"];
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
      liveState: live?.state,
      timeLabel: live
        ? presenceLabel(live, locale)
        : profileTimeLabel(own, now, locale),
      nextStart: nextRelevantShift(own, now)?.start,
    };
  });
}

/** Sortierung: verfügbar → im Haus → nächste Schicht zuerst → ohne Schicht; dann Name. */
export function sortCards(
  cards: ProfileCard[],
  locale: TimeLocale,
): ProfileCard[] {
  return [...cards].sort((a, b) => {
    if (a.isLive !== b.isLive) return a.isLive ? -1 : 1;
    const ra = a.liveState === "ready";
    const rb = b.liveState === "ready";
    if (ra !== rb) return ra ? -1 : 1;
    if (a.nextStart && b.nextStart && a.nextStart !== b.nextStart) {
      return a.nextStart.localeCompare(b.nextStart);
    }
    if (Boolean(a.nextStart) !== Boolean(b.nextStart))
      return a.nextStart ? -1 : 1;
    return a.profile.name.localeCompare(b.profile.name, locale);
  });
}
