import type { Locale } from "@/i18n/routing";
import { pageMetadata } from "@/lib/site";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { FilterChips } from "@/components/profiles/filter-chips";
import { ProfileGrid } from "@/components/profiles/profile-grid";
import { Section } from "@/components/ui/section";
import {
  applyFilters,
  filterOptions,
  hasActiveFilters,
  parseFilters,
} from "@/lib/profiles/cards";
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
  const visible = applyFilters(cards, filters);

  return (
    <Section
      level={1}
      eyebrow={t("eyebrow")}
      title={t("title")}
      intro={t("intro")}
    >
      <FilterChips
        filters={filters}
        options={filterOptions(cards)}
        locale={locale}
      />

      <p className="mt-8 mb-4 font-label text-sm text-muted" aria-live="polite">
        {t("count", { count: visible.length })}
      </p>

      {visible.length > 0 ? (
        <ProfileGrid cards={visible} />
      ) : (
        <div className="panel p-8 text-center">
          <p className="text-lg text-ink">{t("empty")}</p>
          <p className="mt-2 text-muted">{t("emptyHint")}</p>
        </div>
      )}
    </Section>
  );
}
