import type { Locale } from "@/i18n/routing";
import { pageMetadata } from "@/lib/site";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ProfileExplorer } from "@/components/profiles/profile-explorer";
import { Section } from "@/components/ui/section";
import {
  hasActiveFilters,
  parseFilters,
  toExplorerCard,
} from "@/lib/profiles/explore";
import { getProfileCards } from "@/lib/profiles/server";

export async function generateMetadata({
  params,
  searchParams,
}: PageProps<"/[locale]/mieterinnen">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "profiles" });
  const filtered = hasActiveFilters(parseFilters(await searchParams));
  // Gefilterte Varianten nicht indexieren (Duplicate Content)
  return pageMetadata({
    locale: locale as Locale,
    path: "/mieterinnen",
    title: t("title"),
    description: t("metaDescription"),
    noindex: filtered,
  });
}

export default async function ProfilesPage({
  params,
  searchParams,
}: PageProps<"/[locale]/mieterinnen">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("profiles");
  const filters = parseFilters(await searchParams);
  const { cards } = await getProfileCards(locale === "en" ? "en" : "de");

  return (
    <Section
      level={1}
      eyebrow={t("eyebrow")}
      title={t("title")}
      intro={t("intro")}
    >
      <ProfileExplorer cards={cards.map(toExplorerCard)} initial={filters} />
    </Section>
  );
}
