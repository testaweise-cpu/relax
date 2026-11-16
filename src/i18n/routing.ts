import { defineRouting } from "next-intl/routing";

import { locales } from "./locales";

export { locales, type Locale } from "./locales";

export const routing = defineRouting({
  locales,
  defaultLocale: "de",
  // Deutsch ohne Präfix (/preise), alle anderen mit Präfix (/en/preise, /pl/preise …).
  localePrefix: "as-needed",
  // Keine automatische Umleitung nach Browsersprache: "/" ist immer Deutsch,
  // die anderen Sprachen über die Sprachwahl (stabil für SEO und Links).
  localeDetection: false,
});
