import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Faq } from "@/components/faq";
import { ApplicationForm } from "@/components/jobs/application-form";
import { Paragraphs } from "@/components/rich-text";
import { Section } from "@/components/ui/section";
import type { Locale } from "@/i18n/routing";
import { getFaq, getJobs, getSettings, pick } from "@/lib/content";
import { telHref } from "@/lib/phone";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/jobs">): Promise<Metadata> {
  const { locale } = await params;
  const jobs = await getJobs();
  const t = await getTranslations({ locale, namespace: "jobs" });
  return {
    title: pick(jobs.title, locale as Locale),
    description: t("metaDescription"),
  };
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
      <Section eyebrow={t("eyebrow")} title={pick(jobs.title, l)}>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-16">
          <Paragraphs text={pick(jobs.intro, l)} className="text-lg text-ink" />
          <div className="rounded-card border border-line bg-panel p-6">
            <h2 className="heading-glow text-2xl text-ink">
              {t("offersTitle")}
            </h2>
            <ul className="mt-5 space-y-3">
              {jobs.offers.map((o, i) => (
                <li key={i} className="flex gap-3 text-ink">
                  <span
                    aria-hidden
                    className="mt-2 size-2 shrink-0 rounded-full bg-mint shadow-[0_0_8px_var(--mint)]"
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
          <div>
            <Paragraphs
              text={pick(jobs.formIntro, l)}
              className="mb-8 text-muted"
            />
            <ApplicationForm minAge={jobs.minAge} />
          </div>
          <aside className="h-fit rounded-card border border-line bg-panel p-6">
            <p className="text-muted">{t("contactDirect")}</p>
            {s.jobsPhone && s.jobsPhoneE164 && (
              <p className="mt-3">
                <a
                  href={telHref(s.jobsPhoneE164)}
                  className="font-mono text-2xl"
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

      <Section title={t("faqTitle")}>
        <div className="max-w-3xl">
          <Faq items={faq} locale={l} />
        </div>
        {jobs.resources.length > 0 && (
          <div className="mt-12">
            <h2 className="heading-glow text-2xl text-ink">
              {t("resourcesTitle")}
            </h2>
            <ul className="mt-5 space-y-2">
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
      </Section>
    </>
  );
}
