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
              className="block rounded-card border border-pink/60 bg-panel p-5 no-underline shadow-[0_0_24px_color-mix(in_oklab,var(--pink)_25%,transparent)] transition-shadow hover:shadow-[0_0_32px_color-mix(in_oklab,var(--pink)_45%,transparent)]"
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
                {nextEvent.time ? ` · ${nextEvent.time}` : ""}
              </p>
            </Link>
          )}
        </div>
      </Section>

      <Section
        tone="night-2"
        eyebrow={t("highlightsEyebrow")}
        title={t("highlightsTitle")}
      >
        <ul className="grid gap-5 md:grid-cols-3">
          {home.highlights.map((h, i) => (
            <li
              key={i}
              className="overflow-hidden rounded-card border border-line bg-panel"
            >
              {h.image && (
                <div className="relative aspect-[4/3]">
                  <Image
                    src={h.image}
                    alt={pick(h.imageAlt, l)}
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-cover"
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-panel via-transparent"
                    aria-hidden
                  />
                </div>
              )}
              <div className="p-5">
                <h3 className="text-2xl text-ink">{pick(h.title, l)}</h3>
                <p className="mt-2 text-muted">{pick(h.text, l)}</p>
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
          <div className="rounded-card border border-pink/50 bg-panel p-5 sm:p-6">
            <PriceTable rows={prices.rows} locale={locale} compact />
            <p className="mt-4 text-sm text-muted">
              {pick(prices.footnote, l)}
            </p>
          </div>
          <div className="flex flex-col justify-between gap-6">
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
