import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Faq } from "@/components/faq";
import { LegalNotice } from "@/components/legal-notice";
import { PriceTable } from "@/components/price-table";
import { Section } from "@/components/ui/section";
import type { Locale } from "@/i18n/routing";
import { getFaq, getPrices, pick } from "@/lib/content";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/preise">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "prices" });
  return { title: t("title"), description: t("metaDescription") };
}

export default async function PricesPage({
  params,
}: PageProps<"/[locale]/preise">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const l = locale as Locale;
  const t = await getTranslations("prices");
  const [prices, faq] = await Promise.all([getPrices(), getFaq("prices")]);

  return (
    <>
      <Section
        eyebrow={t("eyebrow")}
        title={t("title")}
        intro={pick(prices.intro, l)}
      >
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
          <div className="rounded-card border border-pink/50 bg-panel p-5 shadow-[0_0_24px_color-mix(in_oklab,var(--pink)_20%,transparent)] sm:p-8">
            <PriceTable rows={prices.rows} locale={locale} />
            <p className="mt-6 text-sm text-muted">
              {pick(prices.footnote, l)}
            </p>
          </div>
          <div>
            <h2 className="heading-glow text-2xl text-ink">
              {t("legalTitle")}
            </h2>
            <LegalNotice variant="long" className="mt-5" />
          </div>
        </div>
      </Section>
      <Section tone="night-2" title={t("faqTitle")} id="faq">
        <div className="max-w-3xl">
          <Faq items={faq} locale={l} />
        </div>
      </Section>
    </>
  );
}
