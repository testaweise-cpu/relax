import { pageMetadata } from "@/lib/site";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { RichText } from "@/components/rich-text";
import { Section } from "@/components/ui/section";
import type { Locale } from "@/i18n/routing";
import { getPrivacy, pickRich } from "@/lib/content";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/datenschutz">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal" });
  return pageMetadata({
    locale: locale as Locale,
    path: "/datenschutz",
    title: t("privacy"),
  });
}

export default async function PrivacyPage({
  params,
}: PageProps<"/[locale]/datenschutz">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("legal");
  const privacy = await getPrivacy();
  return (
    <Section title={t("privacy")}>
      <RichText node={pickRich(privacy.body, locale as Locale)} />
    </Section>
  );
}
