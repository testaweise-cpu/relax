import type { Presence, Profile, Shift, Story } from "./types";

/** Austauschbare Datenquelle (Mock oder VyceON). */
export interface DataSource {
  readonly name: "mock" | "vyceon";
  /** Liefert die Quelle Schichtzeiten? Ohne sie entfallen Schichtplan und noindex-Regel. */
  readonly hasShifts: boolean;
  listProfiles(): Promise<Profile[]>;
  getProfile(slug: string): Promise<Profile | null>;
  listShifts(from: Date, to: Date): Promise<Shift[]>;
  /** Wer ist JETZT da? */
  getPresence(): Promise<Presence[]>;
  /** Laufende Stories (neueste zuerst); abgelaufene liefert die Quelle nicht. */
  listStories(): Promise<Story[]>;
}

/** Cache-Tags – gleiche Namen in Datenquelle und Webhook. */
export const TAGS = {
  profiles: "profiles",
  profile: (slug: string) => `profile:${slug}`,
  shifts: "shifts",
  presence: "presence",
  stories: "stories",
} as const;

/** Aktualität in Sekunden. */
export const REVALIDATE = {
  profiles: 300,
  shifts: 300,
  presence: 60,
  stories: 120,
} as const;
