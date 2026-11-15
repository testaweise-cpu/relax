import "server-only";
import { env } from "@/lib/env";
import { createMockSource } from "./mock-source";
import type { DataSource } from "./source";
import type { Presence, Profile, ProfileImage, Story } from "./types";
import { createVyceonSource } from "./vyceon-source";

export type { DataSource } from "./source";
export { REVALIDATE, TAGS } from "./source";
export type { Presence, Profile, ProfileImage, Shift, Story } from "./types";

let source: DataSource | undefined;

/** Datenquelle gemäß DATA_SOURCE=mock|vyceon (Standard: mock). */
export function getDataSource(): DataSource {
  if (source) return source;
  if (env.DATA_SOURCE === "vyceon") {
    // Vollständigkeit der Variablen prüft bereits src/lib/env.ts.
    source = createVyceonSource({
      apiUrl: env.VYCEON_API_URL!,
      apiKey: env.VYCEON_API_KEY!,
      organizationId: env.VYCEON_ORGANIZATION_ID!,
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
    .sort(
      (a, b) =>
        // Verfügbare zuerst, dann nach Beginn, dann nach Name
        Number(b.presence.state === "ready") -
          Number(a.presence.state === "ready") ||
        (a.presence.since ?? "").localeCompare(b.presence.since ?? "") ||
        a.profile.name.localeCompare(b.profile.name),
    );
}

/** Stories einer Sedcard bzw. des Hauses, in der Reihenfolge des Erscheinens. */
export type StoryGroup = {
  /** Slug der Sedcard; null = Stories des Hauses */
  slug: string | null;
  name: string | null;
  /** Profilbild der Sedcard; fehlt bei Haus-Stories, die nur aus Videos bestehen */
  avatar: ProfileImage | null;
  stories: {
    id: string;
    image: ProfileImage | null;
    video: string | null;
    caption: string | null;
  }[];
};

/**
 * Laufende Stories, gruppiert: die Gruppe mit der neuesten Story zuerst,
 * innerhalb der Gruppe die älteste zuerst (wie man eine Story ansieht).
 */
export async function getStoryGroups(): Promise<StoryGroup[]> {
  const ds = getDataSource();
  const [stories, profiles] = await Promise.all([
    ds.listStories(),
    ds.listProfiles(),
  ]);
  const now = Date.now();
  const avatarBySlug = new Map(profiles.map((p) => [p.slug, p.images[0]]));
  const groups = new Map<string, StoryGroup & { latest: string }>();
  for (const s of stories as Story[]) {
    if (Date.parse(s.expiresAt) <= now) continue;
    // Story einer Sedcard, die nicht (mehr) veröffentlicht ist: nicht zeigen
    if (s.profileSlug && !avatarBySlug.has(s.profileSlug)) continue;
    const key = s.profileSlug ?? "";
    let g = groups.get(key);
    if (!g) {
      g = {
        slug: s.profileSlug,
        name: s.profileName,
        avatar: (s.profileSlug && avatarBySlug.get(s.profileSlug)) || s.image,
        // (bei einer Video-Story ohne Profilbild: das erste Bild der Gruppe, s. u.)
        stories: [],
        latest: s.createdAt,
      };
      groups.set(key, g);
    }
    if (s.createdAt > g.latest) g.latest = s.createdAt;
    if (!g.avatar && s.image) g.avatar = s.image;
    g.stories.push({
      id: s.id,
      image: s.image,
      video: s.video,
      caption: s.caption,
    });
  }
  return [...groups.values()]
    .sort((a, b) => b.latest.localeCompare(a.latest))
    .map((g) => ({
      slug: g.slug,
      name: g.name,
      avatar: g.avatar,
      stories: [...g.stories].reverse(),
    }));
}

/**
 * Kennt die Website dieses Video gerade (Profilvideo oder laufende Story)?
 * Die Durchleitung holt nur solche ab – sonst könnte jede erfundene Kennung
 * eine Anfrage an die Bordell-API auslösen und deren Kontingent aufbrauchen.
 */
export async function isKnownVideo(id: string): Promise<boolean> {
  const ds = getDataSource();
  const [stories, profiles] = await Promise.all([
    ds.listStories(),
    ds.listProfiles(),
  ]);
  const local = `/api/video/${id}`;
  return (
    stories.some((s) => s.video === local) ||
    profiles.some((p) => p.video === local)
  );
}
