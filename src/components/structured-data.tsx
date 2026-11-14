import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { getPrices, getSettings, pick } from "@/lib/content";
import { absoluteUrl, SITE_URL } from "@/lib/site";

/**
 * Lage des Hauses (Hindenburgdamm 76, 12203 Berlin), Quelle: OpenStreetMap.
 * Wird auch für die Geo-Meta-Angaben im Layout verwendet.
 */
export const GEO = { latitude: 52.44835, longitude: 13.31499 } as const;

/** Gibt ein JSON-LD-Skript aus; "<" wird maskiert, damit nichts das Tag schließt. */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

/**
 * Strukturierte Daten (schema.org) für Suchmaschinen und KI-Suchen:
 * NightClub ist eine Unterart von LocalBusiness und passt zu Bar mit
 * Tabledance. Enthält Lage, Öffnungszeiten und die Zimmermieten als Angebote.
 */
export async function LocalBusinessJsonLd({ locale }: { locale: Locale }) {
  const [s, prices, t] = await Promise.all([
    getSettings(),
    getPrices(),
    getTranslations({ locale, namespace: "meta" }),
  ]);
  const tp = await getTranslations({ locale, namespace: "prices" });
  const data = {
    "@context": "https://schema.org",
    "@type": "NightClub",
    "@id": `${SITE_URL}/#business`,
    name: "Mona Roses",
    url: absoluteUrl(locale, "/"),
    image: [
      `${SITE_URL}/media/hero-home-poster.jpg`,
      `${SITE_URL}/images/home/bar-lounge.jpg`,
      `${SITE_URL}/images/home/zimmer.jpg`,
    ],
    logo: `${SITE_URL}/logo/mona-roses.png`,
    description: t("defaultDescription"),
    slogan: pick(s.foundedNote, locale),
    telephone: s.phoneE164,
    email: s.email || undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: s.street,
      postalCode: s.postalCode,
      addressLocality: s.city,
      addressRegion: "Berlin",
      addressCountry: "DE",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: GEO.latitude,
      longitude: GEO.longitude,
    },
    areaServed: [
      { "@type": "City", name: "Berlin" },
      { "@type": "Place", name: "Berlin-Steglitz" },
      { "@type": "Place", name: "Berlin-Lichterfelde" },
    ],
    hasMap: s.mapsUrl || undefined,
    // Rund um die Uhr geöffnet, jeden Tag
    openingHours: "Mo-Su 00:00-24:00",
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        opens: "00:00",
        closes: "23:59",
      },
    ],
    priceRange: "€",
    currenciesAccepted: "EUR",
    isAccessibleForFree: false,
    // Zimmermiete nach Dauer – ausschließlich die Miete, keine Dienstleistungen
    makesOffer: prices.rows
      .filter((r) => r.minutes && r.priceEur)
      .map((r) => ({
        "@type": "Offer",
        name: `${tp("roomRent")} · ${tp("minutes", { count: r.minutes ?? 0 })}`,
        price: r.priceEur,
        priceCurrency: "EUR",
      })),
  };
  return <JsonLd data={data} />;
}

/** Website als Ganzes: Name, Sprache, Betreiber. */
export function WebSiteJsonLd({ locale }: { locale: Locale }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        name: "Mona Roses",
        url: absoluteUrl(locale, "/"),
        inLanguage: locale === "en" ? "en" : "de",
        publisher: { "@id": `${SITE_URL}/#business` },
      }}
    />
  );
}

/** Brotkrumen für Unterseiten (Startseite › … › aktuelle Seite). */
export function BreadcrumbJsonLd({
  locale,
  trail,
}: {
  locale: Locale;
  /** von der ersten Ebene unter der Startseite bis zur aktuellen Seite */
  trail: { name: string; path: string }[];
}) {
  const items = [{ name: "Mona Roses", path: "/" }, ...trail];
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((it, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: it.name,
          item: absoluteUrl(locale, it.path),
        })),
      }}
    />
  );
}

/** Fragen und Antworten einer Seite (wird von der FAQ-Komponente ausgegeben). */
export function FaqJsonLd({
  items,
}: {
  items: { question: string; answer: string }[];
}) {
  if (items.length === 0) return null;
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: items.map((it) => ({
          "@type": "Question",
          name: it.question,
          acceptedAnswer: { "@type": "Answer", text: it.answer },
        })),
      }}
    />
  );
}
