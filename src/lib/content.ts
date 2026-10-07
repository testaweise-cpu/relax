import "server-only";
import { createReader } from "@keystatic/core/reader";
import { cache } from "react";
import type { Locale } from "@/i18n/routing";
import keystaticConfig from "../../keystatic.config";

/**
 * Zugriff auf die Keystatic-Inhalte (git-basiert, Dateien unter src/content).
 * Nur serverseitig; Ergebnisse werden pro Request dedupliziert.
 */
const reader = createReader(process.cwd(), keystaticConfig);

export type Localized = { de: string; en?: string | null };

/** Liefert den Text in der gewünschten Sprache, sonst Deutsch als Rückfall. */
export function pick(value: Localized | null | undefined, locale: Locale) {
  if (!value) return "";
  return (locale === "en" && value.en?.trim()) || value.de;
}

export const getSettings = cache(async () => {
  const settings = await reader.singletons.settings.readOrThrow();
  return settings;
});

export const getLegalNotice = cache(async () => {
  return reader.singletons.legalNotice.readOrThrow();
});

export const getPrices = cache(async () => {
  return reader.singletons.prices.readOrThrow();
});

export const getGallery = cache(async () => {
  const entries = await reader.collections.gallery.all();
  return entries
    .map(({ entry }) => entry)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
});
