import type { MetadataRoute } from "next";
import { connection } from "next/server";
import { locales, type Locale } from "@/i18n/routing";
import { getDataSource } from "@/lib/data";
import { getGallery, getHome } from "@/lib/content";
import { absoluteUrl, SITE_URL } from "@/lib/site";

/** Bildadressen absolut (Inhalte liegen relativ, Sedcard-Bilder bei VyceON). */
const abs = (url: string) =>
  /^https?:\/\//.test(url) ? url : `${SITE_URL}${url}`;

/** Bilder je Seite für die Bildersuche (höchstens 20 je Adresse). */
async function pageImages(): Promise<Record<string, string[]>> {
  const [gallery, home] = await Promise.all([getGallery(), getHome()]);
  const galleryImages = gallery.flatMap((g) => (g.image ? [abs(g.image)] : []));
  const homeImages = home.highlights.flatMap((h) =>
    h.image ? [abs(h.image)] : [],
  );
  return {
    "/": [abs("/media/hero-home-poster.webp"), ...homeImages],
    "/galerie": galleryImages.slice(0, 20),
  };
}
import { hasUpcomingShift } from "@/lib/time/shifts";

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
  if (extra.images && extra.images.length === 0) delete extra.images;
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
  // Pro Abruf erzeugen (Daten aus dem Cache der Quelle): beim Build gäbe es
  // nur die Daten der Build-Umgebung, nicht die von VyceON.
  await connection();
  const ds = getDataSource();
  const now = new Date();
  const [profiles, shifts, images] = await Promise.all([
    ds.listProfiles(),
    ds.listShifts(now, new Date(now.getTime() + 30 * 86400000)),
    pageImages(),
  ]);
  // Nur Profile mit Schicht in den nächsten 30 Tagen (die übrigen sind noindex);
  // ohne Schichtdaten in der Quelle alle.
  const indexable = profiles.filter(
    (p) =>
      !ds.hasShifts ||
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
        images: images[s.path] ?? [],
      }),
    ),
    ...indexable.flatMap((p) =>
      entry(`/mieterinnen/${p.slug}`, {
        lastModified: p.updatedAt,
        changeFrequency: "daily",
        priority: 0.7,
        // Bewusst ohne Fotos: die Bildersuche soll Mieterinnen nicht
        // zusätzlich auffindbar machen (Rückwärtssuche nach Gesichtern).
      }),
    ),
  ];
}
