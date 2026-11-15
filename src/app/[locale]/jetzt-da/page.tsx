import type { Locale } from "@/i18n/routing";
import { pageMetadata } from "@/lib/site";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { connection } from "next/server";
import { BreadcrumbJsonLd, ItemListJsonLd } from "@/components/structured-data";
import { LivePresenceGrid } from "@/components/presence/live-presence";
import { ButtonLink } from "@/components/ui/button";
import { ArrowRightIcon } from "@/components/ui/icons";
import { Ornament } from "@/components/ui/ornament";
import { Section } from "@/components/ui/section";
import { PAGE_VIDEO } from "@/lib/media/hero";
import { getPresentProfiles, getStoryGroups } from "@/lib/data";
import { StoryRail } from "@/components/stories/story-ring";
import { toPresenceResponse } from "@/lib/data/presence-map";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/jetzt-da">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "now" });
  return pageMetadata({
    locale: locale as Locale,
    path: "/jetzt-da",
    titleAbsolute: t("metaTitle"),
    description: t("metaDescription"),
  });
}

export default async function NowPage({
  params,
}: PageProps<"/[locale]/jetzt-da">) {
  const { locale } = await params;
  setRequestLocale(locale);
  await connection();
  const t = await getTranslations("now");
  const [present, stories] = await Promise.all([
    getPresentProfiles(),
    getStoryGroups(),
  ]);
  const initial = toPresenceResponse(present);

  return (
    <>
      <BreadcrumbJsonLd
        locale={locale as Locale}
        trail={[{ name: t("title"), path: "/jetzt-da" }]}
      />
      <ItemListJsonLd
        locale={locale as Locale}
        name={t("listName")}
        items={present.map(({ profile }) => ({
          name: profile.name,
          path: `/mieterinnen/${profile.slug}`,
          image: profile.images[0]?.url,
        }))}
      />
      <Section
        level={1}
        media={PAGE_VIDEO}
        eyebrow={t("eyebrow")}
        title={t("title")}
        intro={t("intro")}
      >
        <StoryRail groups={stories} className="story-rail-flush mb-12" />
        <LivePresenceGrid initial={initial} />

        {/* Abschluss: von den Anwesenden weiter zu allen Sedcards */}
        <div className="mt-16 text-center sm:mt-24">
          <Ornament />
          <p className="mx-auto mt-8 max-w-xl font-display text-3xl leading-tight text-ink italic sm:text-4xl">
            {t("allProfilesLead")}
          </p>
          <ButtonLink
            href="/mieterinnen"
            variant="secondary"
            size="lg"
            className="mt-8"
          >
            {t("allProfilesCta")}
            <ArrowRightIcon width={16} height={16} />
          </ButtonLink>
        </div>
      </Section>
    </>
  );
}
