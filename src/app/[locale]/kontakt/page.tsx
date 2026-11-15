import { LocalBusinessJsonLd } from "@/components/structured-data";
import { pageMetadata } from "@/lib/site";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";
import { Faq } from "@/components/faq";
import { Paragraphs } from "@/components/rich-text";
import { ButtonAnchor, ButtonLink } from "@/components/ui/button";
import { ClockIcon, MapPinIcon, PhoneIcon } from "@/components/ui/icons";
import { Section } from "@/components/ui/section";
import type { Locale } from "@/i18n/routing";
import { getFaq, getSettings, pick } from "@/lib/content";
import { telHref } from "@/lib/phone";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/kontakt">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  return pageMetadata({
    locale: locale as Locale,
    path: "/kontakt",
    title: t("title"),
    description: t("metaDescription"),
  });
}

function Card({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="panel p-5 sm:p-6">
      <h2 className="flex items-center gap-3 font-label text-[0.7rem] font-medium tracking-[0.3em] text-gold uppercase">
        <span className="text-gold">{icon}</span>
        {title}
      </h2>
      <div className="mt-3 text-lg text-ink">{children}</div>
    </div>
  );
}

export default async function ContactPage({
  params,
}: PageProps<"/[locale]/kontakt">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const l = locale as Locale;
  const t = await getTranslations("contact");
  const tc = await getTranslations("common");
  const [s, faq] = await Promise.all([getSettings(), getFaq("general")]);

  return (
    <>
      <LocalBusinessJsonLd locale={locale as Locale} />
      <Section level={1} eyebrow={t("eyebrow")} title={t("title")}>
        <div className="grid gap-4 md:grid-cols-2">
          <Card icon={<MapPinIcon />} title={t("address")}>
            <address className="not-italic">
              Mona Roses
              <br />
              {s.street}
              <br />
              {s.postalCode} {s.city}-{s.district}
            </address>
            {s.mapsUrl && (
              <>
                <ButtonAnchor
                  href={s.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="secondary"
                  className="mt-5"
                >
                  <MapPinIcon />
                  {t("maps")}
                </ButtonAnchor>
                <p className="mt-3 text-sm text-muted">{t("mapsNote")}</p>
              </>
            )}
          </Card>
          <Card icon={<PhoneIcon />} title={t("phone")}>
            <a href={telHref(s.phoneE164)} className="font-label text-2xl">
              {s.phone}
            </a>
            {s.email && (
              <p className="mt-2">
                <a href={`mailto:${s.email}`}>{s.email}</a>
              </p>
            )}
            <ButtonAnchor href={telHref(s.phoneE164)} className="mt-5">
              <PhoneIcon />
              {tc("call")}
            </ButtonAnchor>
          </Card>
          <Card icon={<ClockIcon />} title={t("hours")}>
            <p>{pick(s.openingHours, l)}</p>
          </Card>
          <Card icon={<MapPinIcon />} title={t("directions")}>
            <Paragraphs
              text={pick(s.directions, l)}
              className="text-base text-muted"
            />
          </Card>
        </div>
        <div className="panel mt-4 flex flex-wrap items-center justify-between gap-x-8 gap-y-4 p-6">
          <div>
            <p className="font-label text-[0.7rem] font-medium tracking-[0.3em] text-gold uppercase">
              {t("jobs")}
            </p>
            <p className="mt-2 font-display text-2xl text-ink italic">
              {t("jobsLead")}
            </p>
            {s.jobsEmail && (
              <p className="mt-1 text-muted">
                <a href={`mailto:${s.jobsEmail}`}>{s.jobsEmail}</a>
                {s.jobsPhone && <> · {s.jobsPhone}</>}
              </p>
            )}
          </div>
          <ButtonLink href="/jobs" variant="secondary">
            {t("jobsCta")}
          </ButtonLink>
        </div>
      </Section>
      {faq.length > 0 && (
        <Section tone="night-2" title={t("faqTitle")} id="faq">
          <div className="max-w-3xl">
            <Faq items={faq} locale={l} />
          </div>
        </Section>
      )}
    </>
  );
}
