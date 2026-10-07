import "server-only";
import { env } from "@/lib/env";
import { createMockSource } from "./mock-source";
import type { DataSource } from "./source";
import type { Presence, Profile } from "./types";
import { createVyceonSource } from "./vyceon-source";

export type { DataSource } from "./source";
export { REVALIDATE, TAGS } from "./source";
export type { Presence, Profile, ProfileImage, Shift } from "./types";

let source: DataSource | undefined;

/** Datenquelle gemäß DATA_SOURCE=mock|vyceon (Standard: mock). */
export function getDataSource(): DataSource {
  if (source) return source;
  if (env.DATA_SOURCE === "vyceon") {
    // Vollständigkeit der Variablen prüft bereits src/lib/env.ts.
    source = createVyceonSource({
      apiUrl: env.VYCEON_API_URL!,
      apiKey: env.VYCEON_API_KEY!,
      clubId: env.VYCEON_CLUB_ID!,
    });
  } else {
    source = createMockSource();
  }
  return source;
}

export type PresentProfile = { profile: Profile; presence: Presence };

/** Alle jetzt Anwesenden mit Profil, sortiert nach Beginn der Anwesenheit. */
export async function getPresentProfiles(): Promise<PresentProfile[]> {
  const ds = getDataSource();
  const [profiles, presence] = await Promise.all([
    ds.listProfiles(),
    ds.getPresence(),
  ]);
  const byId = new Map(profiles.map((p) => [p.id, p]));
  return presence
    .flatMap((pr) => {
      const profile = byId.get(pr.profileId);
      return profile ? [{ profile, presence: pr }] : [];
    })
    .sort((a, b) => a.presence.since.localeCompare(b.presence.since));
}
