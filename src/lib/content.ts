import "server-only";
import { createReader } from "@keystatic/core/reader";
import Markdoc, { type Node } from "@markdoc/markdoc";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { cache } from "react";
import type { Locale } from "@/i18n/routing";
import keystaticConfig from "../../keystatic.config";
import { contentTranslation } from "@/i18n/content";

/**
 * Zugriff auf die Keystatic-Inhalte (git-basiert, Dateien unter src/content).
 * Nur serverseitig; Ergebnisse werden pro Request dedupliziert.
 */
const reader = createReader(process.cwd(), keystaticConfig);

export type Localized = { de: string | null; en?: string | null };

/**
 * Text in der gewünschten Sprache. Deutsch und Englisch pflegt die Redaktion
 * in Keystatic; die übrigen Sprachen kommen aus i18n/content/<sprache>.json,
 * nachgeschlagen über den deutschen Text. Ändert die Redaktion den deutschen
 * Text, fehlt die alte Übersetzung von selbst – dann gilt Englisch.
 */
export function pick(value: Localized | null | undefined, locale: Locale) {
  if (!value) return "";
  const de = value.de ?? "";
  if (locale === "de") return de;
  const en = value.en?.trim() || de;
  if (locale === "en") return en;
  return contentTranslation(locale, de) ?? en;
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
    // Rechtstexte: Englisch für alle Fremdsprachen, verbindlich bleibt Deutsch
    locale !== "de" && en && en.children.length > 0 ? en : value.de.node;
  // Keystatic bündelt eine eigene Markdoc-Kopie; die Knoten sind kompatibel.
  return node as unknown as Node;
}

/**
 * Rechtstext (Impressum/Datenschutz) in der gewünschten Sprache. Für die
 * Sprachen ohne eigenes Redaktionsfeld steht die Übersetzung in der
 * Übersetzungstabelle, nachgeschlagen über den deutschen Markdoc-Quelltext.
 */
export async function legalNode(
  kind: "imprint" | "privacy",
  locale: Locale,
): Promise<Node> {
  const entry = kind === "imprint" ? await getImprint() : await getPrivacy();
  if (locale !== "de" && locale !== "en") {
    const raw = JSON.parse(
      await readFile(
        join(process.cwd(), "src/content/legal", `${kind}.json`),
        "utf8",
      ),
    ) as { body?: { de?: string } };
    const translated = raw.body?.de
      ? contentTranslation(locale, raw.body.de)
      : undefined;
    if (translated) return Markdoc.parse(translated);
  }
  return pickRich(entry.body, locale);
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
