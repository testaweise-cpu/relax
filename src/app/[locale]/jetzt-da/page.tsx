import type { Locale } from "@/i18n/routing";
import { pageMetadata } from "@/lib/site";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { connection } from "next/server";
import { LivePresenceGrid } from "@/components/presence/live-presence";
import { Section } from "@/components/ui/section";
import { getPresentProfiles } from "@/lib/data";
import { toPresenceResponse } from "@/lib/data/presence-map";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/jetzt-da">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "now" });
  return pageMetadata({
    locale: locale as Locale,
    path: "/jetzt-da",
    title: t("title"),
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
  const initial = toPresenceResponse(await getPresentProfiles());

  return (
    <Section eyebrow={t("eyebrow")} title={t("title")} intro={t("intro")}>
      <LivePresenceGrid initial={initial} />
    </Section>
  );
}
