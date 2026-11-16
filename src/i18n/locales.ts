/**
 * Sprachen der Website – dieselben zehn wie bei VyceON. Bewusst importfrei,
 * damit Zeitlogik und Tests sie ohne next-intl nutzen können.
 *
 * Deutsch ist die Ausgangssprache (ohne Präfix), Englisch die zweite
 * vollständig gepflegte Fassung. Für die übrigen acht stammen die
 * Oberflächentexte aus messages/<sprache>.json, die Redaktionstexte aus
 * i18n/content/<sprache>.json; fehlt dort ein Text, gilt Englisch.
 */
export const locales = [
  "de",
  "en",
  "pl",
  "ro",
  "bg",
  "hu",
  "tr",
  "es",
  "fr",
  "pt",
] as const;

export type Locale = (typeof locales)[number];

type LocaleMeta = {
  /** Name in der eigenen Sprache (Sprachwahl) */
  label: string;
  /** Sprach-Tag für Intl, <html lang>, hreflang-nahe Angaben */
  bcp47: string;
  /** Open Graph (og:locale) */
  og: string;
};

export const LOCALE_META: Record<Locale, LocaleMeta> = {
  de: { label: "Deutsch", bcp47: "de-DE", og: "de_DE" },
  en: { label: "English", bcp47: "en-GB", og: "en_GB" },
  pl: { label: "Polski", bcp47: "pl-PL", og: "pl_PL" },
  ro: { label: "Română", bcp47: "ro-RO", og: "ro_RO" },
  bg: { label: "Български", bcp47: "bg-BG", og: "bg_BG" },
  hu: { label: "Magyar", bcp47: "hu-HU", og: "hu_HU" },
  tr: { label: "Türkçe", bcp47: "tr-TR", og: "tr_TR" },
  es: { label: "Español", bcp47: "es-ES", og: "es_ES" },
  fr: { label: "Français", bcp47: "fr-FR", og: "fr_FR" },
  pt: { label: "Português", bcp47: "pt-BR", og: "pt_BR" },
};

export const isLocale = (v: unknown): v is Locale =>
  typeof v === "string" && (locales as readonly string[]).includes(v);

/** Beliebige Sprachangabe → unterstützte Sprache (Rückfall Deutsch). */
export const toLocale = (v: unknown): Locale => (isLocale(v) ? v : "de");

export const bcp47 = (locale: string) => LOCALE_META[toLocale(locale)].bcp47;
