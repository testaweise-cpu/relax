import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { RichText } from "@/components/rich-text";
import { Section } from "@/components/ui/section";
import type { Locale } from "@/i18n/routing";
import { getImprint, pickRich } from "@/lib/content";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/impressum">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal" });
  return { title: t("imprint") };
}

export default async function ImprintPage({
  params,
}: PageProps<"/[locale]/impressum">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("legal");
  const imprint = await getImprint();
  return (
    <Section title={t("imprint")}>
      <RichText node={pickRich(imprint.body, locale as Locale)} />
    </Section>
  );
}
