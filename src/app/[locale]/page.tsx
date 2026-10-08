import { LocalBusinessJsonLd } from "@/components/structured-data";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { connection } from "next/server";
import { LegalNotice } from "@/components/legal-notice";
import { NowStrip } from "@/components/presence/live-presence";
import { PriceTable } from "@/components/price-table";
import { Paragraphs } from "@/components/rich-text";
import { ButtonAnchor, ButtonLink } from "@/components/ui/button";
import { HeroBackdrop } from "@/components/ui/hero";
import {
  ArrowRightIcon,
  ClockIcon,
  MapPinIcon,
  PhoneIcon,
} from "@/components/ui/icons";
import { Logo } from "@/components/ui/logo";
import { Section } from "@/components/ui/section";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getPresentProfiles } from "@/lib/data";
import { toPresenceResponse } from "@/lib/data/presence-map";
import {
  getEvents,
  getHome,
  getPrices,
  getSettings,
  pick,
} from "@/lib/content";
import { HERO_VIDEO } from "@/lib/media/hero";
import { telHref } from "@/lib/phone";
import { berlinDayKey } from "@/lib/time/berlin";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    ...pageMetadata({
      locale: locale as Locale,
      path: "/",
      description: t("defaultDescription"),
    }),
    title: { absolute: t("defaultTitle") },
  };
}

// Auf schmalen Handys kompaktere Buttons, damit beide in eine Zeile passen.
const compact = "max-sm:min-h-12 max-sm:px-4 max-sm:text-base";

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const l = locale as Locale;
  const t = await getTranslations("home");
  const tp = await getTranslations("prices");
  const tc = await getTranslations("contact");
  const te = await getTranslations("events");
  const tcommon = await getTranslations("common");
  await connection();
  const [present, home, prices, settings, events] = await Promise.all([
    getPresentProfiles().then((p) => toPresenceResponse(p)),
    getHome(),
    getPrices(),
    getSettings(),
    getEvents(),
  ]);
  const today = berlinDayKey(new Date());
  const nextEvent = events.filter((e) => e.date >= today).at(-1);

  return (
    <>
      <LocalBusinessJsonLd locale={locale as Locale} />
      <HeroBackdrop className="min-h-[calc(100svh-4rem)]" media={HERO_VIDEO}>
        <div className="container-page hero-clearance relative flex min-h-[calc(100svh-4rem)] flex-col items-center justify-center pt-8 text-center sm:pt-12">
          <p className="eyebrow">{t("heroEyebrow")}</p>
          <h1 className="mt-4">
            <Logo size="xl" link={false} animated />
          </h1>
          <p className="mt-4 max-w-md text-lg text-ink sm:mt-6 sm:text-xl">
            {pick(home.heroLead, l)}
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/jetzt-da" size="lg" className={compact}>
              {t("ctaNow")}
              <ArrowRightIcon />
            </ButtonLink>
            <ButtonLink
              href="/preise"
              size="lg"
              variant="secondary"
              className={compact}
            >
              {t("ctaPrices")}
            </ButtonLink>
          </div>
        </div>
      </HeroBackdrop>

      <NowStrip initial={present} className="bg-night-2" />

      <Section title={pick(home.introTitle, l)}>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-end">
          <Paragraphs
            text={pick(home.introText, l)}
            className="max-w-2xl text-lg text-ink"
          />
          {nextEvent && (
            <Link
              href="/events"
              className="panel panel-accent block p-6 no-underline transition-colors hover:border-pink/50"
            >
              <p className="eyebrow">{te("teaser")}</p>
              <p className="mt-2 font-display text-3xl font-extrabold tracking-[0.04em] text-ink uppercase">
                {pick(nextEvent.title, l)}
              </p>
              <p className="mt-1 font-mono text-sm text-cyan">
                {new Intl.DateTimeFormat(l === "en" ? "en-GB" : "de-DE", {
                  day: "numeric",
                  month: "long",
                  timeZone: "UTC",
                }).format(new Date(`${nextEvent.date}T00:00:00Z`))}
                {pick(nextEvent.time, l) ? ` · ${pick(nextEvent.time, l)}` : ""}
              </p>
            </Link>
          )}
        </div>
        <ul className="mt-14 grid gap-px overflow-hidden rounded-card border border-line/70 bg-line/70 sm:grid-cols-3">
          {(t.raw("values") as { title: string; text: string }[]).map((v) => (
            <li key={v.title} className="bg-night p-6 sm:p-8">
              <p className="font-display text-2xl font-semibold tracking-[0.14em] text-ink uppercase">
                {v.title}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {v.text}
              </p>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        tone="night-2"
        eyebrow={t("highlightsEyebrow")}
        title={t("highlightsTitle")}
      >
        <ul className="grid gap-4 md:grid-cols-3 md:gap-5">
          {home.highlights.map((h, i) => (
            <li
              key={i}
              className="group relative aspect-[4/5] overflow-hidden rounded-card border border-line/80"
            >
              {h.image && (
                <Image
                  src={h.image}
                  alt={pick(h.imageAlt, l)}
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover motion-safe:transition-transform motion-safe:duration-700 motion-safe:group-hover:scale-[1.04]"
                />
              )}
              <div
                aria-hidden
                className="absolute inset-0 bg-[linear-gradient(180deg,rgb(13_11_30/0.1)_0%,rgb(13_11_30/0.35)_45%,rgb(13_11_30/0.95)_100%)]"
              />
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-7">
                <p className="font-mono text-xs tracking-[0.3em] text-pink">
                  0{i + 1}
                </p>
                <h3 className="mt-2 text-3xl text-ink">{pick(h.title, l)}</h3>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-ink/80">
                  {pick(h.text, l)}
                </p>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-8">
          <Link href="/galerie" className="font-mono">
            {t("gallery")} →
          </Link>
        </p>
      </Section>

      <Section eyebrow={t("pricesEyebrow")} title={t("pricesTitle")}>
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-16">
          <div className="panel panel-accent p-6 sm:p-8">
            <PriceTable rows={prices.rows} locale={locale} compact />
            <p className="mt-4 text-sm text-muted">
              {pick(prices.footnote, l)}
            </p>
          </div>
          <div className="flex flex-col justify-center gap-8">
            <p className="font-display text-4xl leading-tight font-semibold tracking-[0.06em] text-ink uppercase sm:text-5xl">
              {t("promise")}
            </p>
            <LegalNotice />
            <ButtonLink
              href="/preise"
              variant="secondary"
              className="self-start"
            >
              {tp("allPrices")}
            </ButtonLink>
          </div>
        </div>
      </Section>

      <Section
        tone="night-2"
        eyebrow={t("visitEyebrow")}
        title={t("visitTitle")}
      >
        <div className="grid gap-6 md:grid-cols-3">
          <div className="flex gap-3">
            <MapPinIcon className="mt-1 shrink-0 text-pink" />
            <div>
              <address className="text-lg text-ink not-italic">
                {settings.street}
                <br />
                {settings.postalCode} {settings.city}-{settings.district}
              </address>
              {settings.mapsUrl && (
                <a
                  href={settings.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex min-h-11 items-center font-mono text-sm"
                >
                  {tc("maps")} ↗
                </a>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            <ClockIcon className="mt-1 shrink-0 text-pink" />
            <p className="text-lg text-ink">{pick(settings.openingHours, l)}</p>
          </div>
          <div className="flex flex-col items-start gap-3">
            <a
              href={telHref(settings.phoneE164)}
              className="font-mono text-2xl"
            >
              {settings.phone}
            </a>
            <ButtonAnchor href={telHref(settings.phoneE164)}>
              <PhoneIcon />
              {tcommon("call")}
            </ButtonAnchor>
          </div>
        </div>
      </Section>
    </>
  );
}
