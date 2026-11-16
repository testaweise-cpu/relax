import type { Metadata } from "next";
import { locales, routing, type Locale } from "@/i18n/routing";
import { LOCALE_META } from "@/i18n/locales";

/** Öffentliche Basis-URL ohne abschließenden Slash. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/+$/, "");

/** Interner Pfad (/preise) → sprachspezifischer Pfad (/preise bzw. /en/preise). */
export function localizedPath(locale: Locale, path: string) {
  const clean = path === "/" ? "" : path;
  return locale === routing.defaultLocale ? clean || "/" : `/${locale}${clean}`;
}

export function absoluteUrl(locale: Locale, path: string) {
  return `${SITE_URL}${localizedPath(locale, path)}`;
}

/** Canonical + hreflang (de, en, x-default) für eine Seite. */
export function alternatesFor(
  locale: Locale,
  path: string,
): Metadata["alternates"] {
  return {
    canonical: absoluteUrl(locale, path),
    languages: {
      ...Object.fromEntries(locales.map((l) => [l, absoluteUrl(l, path)])),
      "x-default": absoluteUrl(routing.defaultLocale, path),
    },
  };
}

/** Einheitliche Seiten-Metadaten inkl. Open Graph. */
export function pageMetadata({
  locale,
  path,
  title,
  titleAbsolute,
  description,
  noindex = false,
  image,
}: {
  locale: Locale;
  path: string;
  title?: string;
  /** vollständiger Seitentitel ohne angehängten Markennamen */
  titleAbsolute?: string;
  description?: string;
  noindex?: boolean;
  image?: string;
}): Metadata {
  // Ohne eigenes Bild das allgemeine Vorschaubild der Sprache
  const ogImage = image ?? absoluteUrl(locale, "/opengraph-image");
  return {
    title: titleAbsolute ? { absolute: titleAbsolute } : title,
    description,
    alternates: alternatesFor(locale, path),
    robots: noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      type: "website",
      siteName: "Mona Roses",
      locale: LOCALE_META[locale].og,
      url: absoluteUrl(locale, path),
      title: titleAbsolute ?? (title ? `${title} · Mona Roses` : undefined),
      description,
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", images: [ogImage] },
  };
}
