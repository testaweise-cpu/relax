import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { LOCALE_META, locales } from "@/i18n/locales";
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
    "@type": ["NightClub", "AdultEntertainment"],
    "@id": `${SITE_URL}/#business`,
    name: "Mona Roses",
    alternateName: ["Mona Roses Bordell", "Bordell Mona Roses Berlin"],
    foundingDate: "1993",
    keywords:
      locale !== "de"
        ? "brothel Berlin, brothel Berlin-Steglitz, table dance, room rental"
        : "Bordell Berlin, Bordell Berlin-Steglitz, Puff Berlin, Tabledance, Zimmervermietung",
    url: absoluteUrl(locale, "/"),
    image: [
      `${SITE_URL}/media/hero-salon-poster.jpg`,
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
      { "@type": "Place", name: "Berlin-Lankwitz" },
      { "@type": "Place", name: "Berlin-Dahlem" },
      { "@type": "Place", name: "Berlin-Zehlendorf" },
      { "@type": "Place", name: "Berlin-Friedenau" },
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
    contactPoint: {
      "@type": "ContactPoint",
      telephone: s.phoneE164,
      contactType: "customer service",
      availableLanguage: [...locales],
      hoursAvailable: {
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
    },
    // Zutritt nur für Erwachsene
    audience: {
      "@type": "PeopleAudience",
      requiredMinAge: 18,
      suggestedMinAge: 18,
    },
    amenityFeature: ["Bar", "Lounge", "Tabledance"].map((name) => ({
      "@type": "LocationFeatureSpecification",
      name,
      value: true,
    })),
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
        inLanguage: LOCALE_META[locale].bcp47,
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

/** Liste von Sedcards (Übersicht, „Jetzt da“): Name, Adresse, Bild. */
export function ItemListJsonLd({
  locale,
  name,
  items,
}: {
  locale: Locale;
  name: string;
  items: { name: string; path: string; image?: string }[];
}) {
  if (items.length === 0) return null;
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "ItemList",
        name,
        numberOfItems: items.length,
        itemListElement: items.map((it, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: it.name,
          url: absoluteUrl(locale, it.path),
          ...(it.image ? { image: absoluteMedia(it.image) } : {}),
        })),
      }}
    />
  );
}

/** Bild-Adresse absolut machen (Inhalte liegen teils relativ, teils bei VyceON). */
function absoluteMedia(url: string) {
  return /^https?:\/\//.test(url) ? url : `${SITE_URL}${url}`;
}

/** Kommende Veranstaltungen im Haus. */
export function EventsJsonLd({
  events,
}: {
  events: {
    name: string;
    date: string;
    description: string;
    image?: string | null;
    url: string;
  }[];
}) {
  return (
    <>
      {events.map((e) => (
        <JsonLd
          key={e.date + e.name}
          data={{
            "@context": "https://schema.org",
            "@type": "Event",
            name: e.name,
            startDate: e.date,
            description: e.description,
            url: e.url,
            ...(e.image ? { image: absoluteMedia(e.image) } : {}),
            eventStatus: "https://schema.org/EventScheduled",
            eventAttendanceMode:
              "https://schema.org/OfflineEventAttendanceMode",
            location: { "@id": `${SITE_URL}/#business` },
            organizer: { "@id": `${SITE_URL}/#business` },
          }}
        />
      ))}
    </>
  );
}

/** Bilder der Galerie mit ihren Beschreibungen. */
export function ImageGalleryJsonLd({
  name,
  url,
  images,
}: {
  name: string;
  url: string;
  images: { url: string; alt: string }[];
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "ImageGallery",
        name,
        url,
        about: { "@id": `${SITE_URL}/#business` },
        image: images.map((img) => ({
          "@type": "ImageObject",
          contentUrl: absoluteMedia(img.url),
          ...(img.alt ? { caption: img.alt } : {}),
        })),
      }}
    />
  );
}

/**
 * Sedcard als Profilseite: nur, was auf der Seite ohnehin steht
 * (Künstlername, Bilder, Sprachen).
 */
export function ProfilePageJsonLd({
  url,
  name,
  images,
  languages,
  dateModified,
}: {
  url: string;
  name: string;
  images: string[];
  languages: string[];
  dateModified?: string;
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "ProfilePage",
        url,
        ...(dateModified ? { dateModified } : {}),
        isPartOf: { "@id": `${SITE_URL}/#website` },
        mainEntity: {
          "@type": "Person",
          name,
          url,
          ...(images.length ? { image: images.map(absoluteMedia) } : {}),
          ...(languages.length ? { knowsLanguage: languages } : {}),
        },
      }}
    />
  );
}
