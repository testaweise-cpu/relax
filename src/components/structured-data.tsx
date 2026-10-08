import type { Locale } from "@/i18n/routing";
import { getSettings, pick } from "@/lib/content";
import { absoluteUrl, SITE_URL } from "@/lib/site";

/**
 * Strukturierte Daten (schema.org) für Suchmaschinen: NightClub ist eine
 * Unterart von LocalBusiness und passt zu Bar mit Tabledance.
 */
export async function LocalBusinessJsonLd({ locale }: { locale: Locale }) {
  const s = await getSettings();
  const data = {
    "@context": "https://schema.org",
    "@type": "NightClub",
    "@id": `${SITE_URL}/#business`,
    name: "Mona Roses",
    url: absoluteUrl(locale, "/"),
    image: `${SITE_URL}/media/hero-ambiente-poster.jpg`,
    logo: `${SITE_URL}/icon.svg`,
    description: pick(s.openingHours, locale),
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
    hasMap: s.mapsUrl || undefined,
    // Rund um die Uhr geöffnet, jeden Tag
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
    isAccessibleForFree: false,
  };
  return (
    <script
      type="application/ld+json"
      // JSON.stringify + Escaping von "<" verhindert, dass Inhalte das Script-Tag schließen
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
