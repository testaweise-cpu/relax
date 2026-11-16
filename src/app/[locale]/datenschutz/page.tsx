import { Link } from "@/i18n/navigation";
import { pageMetadata } from "@/lib/site";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { RichText } from "@/components/rich-text";
import { Section } from "@/components/ui/section";
import type { Locale } from "@/i18n/routing";
import { legalNode } from "@/lib/content";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/datenschutz">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal" });
  return pageMetadata({
    locale: locale as Locale,
    path: "/datenschutz",
    title: t("privacy"),
    description: t("privacyDescription"),
  });
}

export default async function PrivacyPage({
  params,
}: PageProps<"/[locale]/datenschutz">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("legal");
  return (
    <Section level={1} title={t("privacy")}>
      {locale !== "de" && (
        <p className="mb-8 border-l border-gold/60 pl-4 text-sm text-muted">
          {t("bindingNote")}{" "}
          <Link href="/datenschutz" locale="de" hrefLang="de">
            {t("germanVersion")}
          </Link>
        </p>
      )}
      <RichText node={await legalNode("privacy", locale as Locale)} />
    </Section>
  );
}
