import type { Metadata } from "next";
import { locales, routing, type Locale } from "@/i18n/routing";

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
  description,
  noindex = false,
  image,
}: {
  locale: Locale;
  path: string;
  title?: string;
  description?: string;
  noindex?: boolean;
  image?: string;
}): Metadata {
  return {
    title,
    description,
    alternates: alternatesFor(locale, path),
    robots: noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      type: "website",
      siteName: "Mona Roses",
      locale: locale === "de" ? "de_DE" : "en_GB",
      url: absoluteUrl(locale, path),
      title: title ? `${title} · Mona Roses` : undefined,
      description,
      ...(image ? { images: [{ url: image }] } : {}),
    },
    twitter: { card: "summary_large_image" },
  };
}
