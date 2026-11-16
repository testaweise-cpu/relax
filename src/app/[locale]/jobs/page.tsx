import { BreadcrumbJsonLd } from "@/components/structured-data";
import { pageMetadata } from "@/lib/site";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Faq } from "@/components/faq";
import { ApplicationForm } from "@/components/jobs/application-form";
import { Paragraphs } from "@/components/rich-text";
import { Section } from "@/components/ui/section";
import { PAGE_VIDEO } from "@/lib/media/hero";
import type { Locale } from "@/i18n/routing";
import { getFaq, getJobs, getSettings, pick } from "@/lib/content";
import { telHref } from "@/lib/phone";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/jobs">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "jobs" });
  return pageMetadata({
    locale: locale as Locale,
    path: "/jobs",
    titleAbsolute: t("metaTitle"),
    description: t("metaDescription"),
  });
}

export default async function JobsPage({
  params,
}: PageProps<"/[locale]/jobs">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const l = locale as Locale;
  const t = await getTranslations("jobs");
  const [jobs, faq, s] = await Promise.all([
    getJobs(),
    getFaq("jobs"),
    getSettings(),
  ]);

  return (
    <>
      <BreadcrumbJsonLd
        locale={l}
        trail={[{ name: pick(jobs.title, l), path: "/jobs" }]}
      />
      <Section
        level={1}
        media={PAGE_VIDEO}
        eyebrow={t("eyebrow")}
        title={pick(jobs.title, l)}
      >
        <div className="grid gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-16">
          <Paragraphs text={pick(jobs.intro, l)} className="text-lg text-ink" />
          <div className="panel p-6">
            <h2 className="text-2xl text-ink">{t("offersTitle")}</h2>
            <ul className="mt-5 space-y-3">
              {jobs.offers.map((o, i) => (
                <li key={i} className="flex gap-3 text-ink">
                  <span
                    aria-hidden
                    className="mt-3 h-px w-4 shrink-0 bg-gold"
                  />
                  {pick(o, l)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section tone="night-2" id="bewerbung" title={t("formTitle")}>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-16">
          <div className="panel panel-accent p-6 sm:p-9">
            <Paragraphs
              text={pick(jobs.formIntro, l)}
              className="mb-8 text-muted"
            />
            <ApplicationForm minAge={jobs.minAge} />
          </div>
          <aside className="panel h-fit p-6 lg:sticky lg:top-28">
            <p className="text-muted">{t("contactDirect")}</p>
            {s.jobsPhone && s.jobsPhoneE164 && (
              <p className="mt-3">
                <a
                  href={telHref(s.jobsPhoneE164)}
                  className="font-label text-2xl"
                >
                  {s.jobsPhone}
                </a>
              </p>
            )}
            {s.jobsEmail && (
              <p className="mt-2">
                <a href={`mailto:${s.jobsEmail}`}>{s.jobsEmail}</a>
              </p>
            )}
          </aside>
        </div>
      </Section>

      {/* wie auf der Preisseite: Überschrift links, Fragen rechts */}
      <Section>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <h2 className="text-5xl text-ink sm:text-[4.2rem]">
              {t("faqTitle")}
            </h2>
            {jobs.resources.length > 0 && (
              <div className="mt-10">
                <h3 className="font-label text-[0.7rem] font-medium tracking-[0.3em] text-gold uppercase">
                  {t("resourcesTitle")}
                </h3>
                <ul className="mt-4 space-y-2">
                  {jobs.resources.map((r) => (
                    <li key={r.url}>
                      <a href={r.url} target="_blank" rel="noopener noreferrer">
                        {pick(r.label, l)} ↗
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <Faq items={faq} locale={l} />
        </div>
      </Section>
    </>
  );
}
