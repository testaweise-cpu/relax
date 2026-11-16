import type { Locale } from "@/i18n/routing";
import { toLocale } from "@/i18n/locales";
import { pageMetadata } from "@/lib/site";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ProfileExplorer } from "@/components/profiles/profile-explorer";
import { BreadcrumbJsonLd, ItemListJsonLd } from "@/components/structured-data";
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
    titleAbsolute: t("metaTitle"),
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
  const { cards } = await getProfileCards(toLocale(locale));

  return (
    <>
      <BreadcrumbJsonLd
        locale={locale as Locale}
        trail={[{ name: t("title"), path: "/mieterinnen" }]}
      />
      <ItemListJsonLd
        locale={locale as Locale}
        name={t("title")}
        items={cards.map(({ profile }) => ({
          name: profile.name,
          path: `/mieterinnen/${profile.slug}`,
          image: profile.images[0]?.url,
        }))}
      />
      <Section level={1} eyebrow={t("eyebrow")} title={t("title")}>
        <ProfileExplorer cards={cards.map(toExplorerCard)} initial={filters} />
      </Section>
    </>
  );
}
