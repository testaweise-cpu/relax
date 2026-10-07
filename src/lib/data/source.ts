import type { Presence, Profile, Shift } from "./types";

/** Austauschbare Datenquelle (Mock oder VyceON). */
export interface DataSource {
  readonly name: "mock" | "vyceon";
  listProfiles(): Promise<Profile[]>;
  getProfile(slug: string): Promise<Profile | null>;
  listShifts(from: Date, to: Date): Promise<Shift[]>;
  /** Wer ist JETZT da? */
  getPresence(): Promise<Presence[]>;
}

/** Cache-Tags – gleiche Namen in Datenquelle und Webhook. */
export const TAGS = {
  profiles: "profiles",
  profile: (slug: string) => `profile:${slug}`,
  shifts: "shifts",
  presence: "presence",
} as const;

/** Aktualität in Sekunden. */
export const REVALIDATE = {
  profiles: 300,
  shifts: 300,
  presence: 60,
} as const;
