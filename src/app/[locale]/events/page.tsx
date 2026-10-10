import { pageMetadata } from "@/lib/site";
import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { connection } from "next/server";
import { Paragraphs } from "@/components/rich-text";
import { Badge } from "@/components/ui/badge";
import { Section } from "@/components/ui/section";
import type { Locale } from "@/i18n/routing";
import { getEvents, pick } from "@/lib/content";
import { imageSize } from "@/lib/image-size";
import { berlinDayKey } from "@/lib/time/berlin";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/events">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "events" });
  return pageMetadata({
    locale: locale as Locale,
    path: "/events",
    title: t("title"),
    description: t("metaDescription"),
  });
}

function formatDate(date: string, locale: string) {
  return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

export default async function EventsPage({
  params,
}: PageProps<"/[locale]/events">) {
  const { locale } = await params;
  setRequestLocale(locale);
  await connection(); // "demnächst" hängt vom heutigen Tag ab
  const l = locale as Locale;
  const t = await getTranslations("events");
  const events = await getEvents();
  const today = berlinDayKey(new Date());
  const upcoming = events.filter((e) => e.date >= today).reverse();
  const past = events.filter((e) => e.date < today);

  const list = (items: typeof events, highlight: boolean) => (
    <ul className="grid gap-6 md:grid-cols-2">
      {items.map((e) => {
        const size = e.image ? imageSize(e.image) : null;
        return (
          <li
            key={e.slug}
            className={
              highlight
                ? "panel panel-accent overflow-hidden"
                : "panel overflow-hidden"
            }
          >
            <article>
              {e.image && size && (
                <div className="relative aspect-[3/2]">
                  <Image
                    src={e.image}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
              )}
              <div className="p-5 sm:p-6">
                <p className="font-mono text-sm text-gold">
                  <time dateTime={e.date}>{formatDate(e.date, locale)}</time>
                  {pick(e.time, l) ? ` · ${pick(e.time, l)}` : ""}
                </p>
                {highlight && (
                  <Badge variant="new" className="mt-3">
                    {t("upcoming")}
                  </Badge>
                )}
                <h3 className="mt-3 text-3xl text-ink">{pick(e.title, l)}</h3>
                <Paragraphs
                  text={pick(e.body, l)}
                  className="mt-3 text-muted"
                />
              </div>
            </article>
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      <Section level={1} eyebrow={t("eyebrow")} title={t("title")}>
        <h2 className="sr-only">{t("upcoming")}</h2>
        {upcoming.length ? (
          list(upcoming, true)
        ) : (
          <p className="text-muted">{t("empty")}</p>
        )}
      </Section>
      {past.length > 0 && (
        <Section tone="night-2" title={t("past")}>
          {list(past, false)}
        </Section>
      )}
    </>
  );
}
