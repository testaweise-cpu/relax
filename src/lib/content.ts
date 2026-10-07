import "server-only";
import { createReader } from "@keystatic/core/reader";
import type { Node } from "@markdoc/markdoc";
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

type RichNode = { children: readonly unknown[] };

/** Markdoc-Inhalt in der gewünschten Sprache, sonst Deutsch. */
export function pickRich<N extends RichNode>(
  value: { readonly de: { node: N }; readonly en: { node: N } },
  locale: Locale,
): Node {
  const en = value.en?.node;
  const node =
    locale === "en" && en && en.children.length > 0 ? en : value.de.node;
  // Keystatic bündelt eine eigene Markdoc-Kopie; die Knoten sind kompatibel.
  return node as unknown as Node;
}

export const getImprint = cache(async () =>
  reader.singletons.imprint.readOrThrow(),
);
export const getPrivacy = cache(async () =>
  reader.singletons.privacy.readOrThrow(),
);
export const getHome = cache(async () => reader.singletons.home.readOrThrow());
export const getJobs = cache(async () => reader.singletons.jobs.readOrThrow());

export const getFaq = cache(async (page: "prices" | "jobs" | "general") => {
  const all = await reader.collections.faq.all();
  return all
    .map(({ entry }) => entry)
    .filter((e) => e.page === page)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
});

export const getEvents = cache(async () => {
  const all = await reader.collections.events.all();
  return all
    .map(({ entry }) => entry)
    .sort((a, b) => b.date.localeCompare(a.date));
});
