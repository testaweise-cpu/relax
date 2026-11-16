import type { Locale } from "@/i18n/locales";
import pl from "./pl.json";
import ro from "./ro.json";
import bg from "./bg.json";
import hu from "./hu.json";
import tr from "./tr.json";
import es from "./es.json";
import fr from "./fr.json";
import pt from "./pt.json";

/**
 * Übersetzungen der Redaktionstexte (Keystatic) für die Sprachen ohne eigenes
 * Feld im Redaktionssystem: deutscher Text → Übersetzung.
 */
const TABLES: Partial<Record<Locale, Record<string, string>>> = {
  pl,
  ro,
  bg,
  hu,
  tr,
  es,
  fr,
  pt,
};

export function contentTranslation(locale: Locale, de: string) {
  const hit = TABLES[locale]?.[de];
  return hit && hit.trim() ? hit : undefined;
}
