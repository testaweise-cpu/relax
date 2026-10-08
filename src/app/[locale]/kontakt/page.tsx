import { LocalBusinessJsonLd } from "@/components/structured-data";
import { pageMetadata } from "@/lib/site";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";
import { Paragraphs } from "@/components/rich-text";
import { ButtonAnchor } from "@/components/ui/button";
import { ClockIcon, MapPinIcon, PhoneIcon } from "@/components/ui/icons";
import { Section } from "@/components/ui/section";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getSettings, pick } from "@/lib/content";
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
      <h2 className="flex items-center gap-3 font-display text-xl font-semibold tracking-[0.12em] text-ink uppercase">
        <span className="text-pink">{icon}</span>
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
  const s = await getSettings();

  return (
    <>
      <LocalBusinessJsonLd locale={locale as Locale} />
      <Section eyebrow={t("eyebrow")} title={t("title")}>
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
                <a
                  href={s.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex min-h-11 items-center font-mono text-base"
                >
                  {t("maps")} ↗
                </a>
                <p className="text-sm text-muted">{t("mapsNote")}</p>
              </>
            )}
          </Card>
          <Card icon={<PhoneIcon />} title={t("phone")}>
            <a href={telHref(s.phoneE164)} className="font-mono text-2xl">
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
        <p className="mt-8 text-muted">
          {t("jobs")}: <Link href="/jobs">/jobs</Link> · {s.jobsPhone} ·{" "}
          {s.jobsEmail && <a href={`mailto:${s.jobsEmail}`}>{s.jobsEmail}</a>}
        </p>
      </Section>
    </>
  );
}
