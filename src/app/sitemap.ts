import type { MetadataRoute } from "next";
import { locales, type Locale } from "@/i18n/routing";
import { getDataSource } from "@/lib/data";
import { absoluteUrl } from "@/lib/site";
import { hasUpcomingShift } from "@/lib/time/shifts";

// Stündlich neu erzeugen – Profile kommen und gehen.
export const revalidate = 3600;

const STATIC: {
  path: string;
  changeFrequency: "hourly" | "daily" | "weekly" | "monthly";
  priority: number;
}[] = [
  { path: "/", changeFrequency: "hourly", priority: 1 },
  { path: "/jetzt-da", changeFrequency: "hourly", priority: 0.9 },
  { path: "/mieterinnen", changeFrequency: "daily", priority: 0.9 },
  { path: "/preise", changeFrequency: "monthly", priority: 0.8 },
  { path: "/galerie", changeFrequency: "monthly", priority: 0.6 },
  { path: "/events", changeFrequency: "weekly", priority: 0.6 },
  { path: "/jobs", changeFrequency: "monthly", priority: 0.6 },
  { path: "/kontakt", changeFrequency: "monthly", priority: 0.7 },
  { path: "/impressum", changeFrequency: "monthly", priority: 0.2 },
  { path: "/datenschutz", changeFrequency: "monthly", priority: 0.2 },
];

function entry(
  path: string,
  extra: Omit<MetadataRoute.Sitemap[number], "url" | "alternates">,
): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(
    locales.map((l) => [l, absoluteUrl(l, path)]),
  );
  return locales.map((l: Locale) => ({
    url: absoluteUrl(l, path),
    alternates: { languages },
    ...extra,
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const ds = getDataSource();
  const now = new Date();
  const [profiles, shifts] = await Promise.all([
    ds.listProfiles(),
    ds.listShifts(now, new Date(now.getTime() + 30 * 86400000)),
  ]);
  // Nur Profile mit Schicht in den nächsten 30 Tagen (die übrigen sind noindex)
  const indexable = profiles.filter((p) =>
    hasUpcomingShift(
      shifts.filter((s) => s.profileId === p.id),
      now,
      30,
    ),
  );
  return [
    ...STATIC.flatMap((s) =>
      entry(s.path, {
        changeFrequency: s.changeFrequency,
        priority: s.priority,
      }),
    ),
    ...indexable.flatMap((p) =>
      entry(`/mieterinnen/${p.slug}`, {
        lastModified: p.updatedAt,
        changeFrequency: "daily",
        priority: 0.7,
      }),
    ),
  ];
}
