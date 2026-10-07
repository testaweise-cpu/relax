import { defineRouting } from "next-intl/routing";

export const locales = ["de", "en"] as const;
export type Locale = (typeof locales)[number];

export const routing = defineRouting({
  locales,
  defaultLocale: "de",
  // Deutsch ohne Präfix (/preise), Englisch unter /en (/en/preise).
  localePrefix: "as-needed",
  // Keine automatische Umleitung nach Browsersprache: "/" ist immer Deutsch,
  // Englisch wird über den Sprachumschalter gewählt (stabil für SEO und Links).
  localeDetection: false,
});
