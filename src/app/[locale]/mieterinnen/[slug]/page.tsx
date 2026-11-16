import type { Locale } from "@/i18n/routing";
import { toLocale } from "@/i18n/locales";
import { absoluteUrl, pageMetadata } from "@/lib/site";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { ProfileGallery } from "@/components/profiles/profile-gallery";
import {
  BreadcrumbJsonLd,
  ProfilePageJsonLd,
} from "@/components/structured-data";
import { WeekPlan } from "@/components/profiles/week-plan";
import { Badge } from "@/components/ui/badge";
import { VerifiedSeal } from "@/components/ui/verified-seal";
import { ButtonAnchor } from "@/components/ui/button";
import { PhoneIcon } from "@/components/ui/icons";
import { Link, permanentRedirect } from "@/i18n/navigation";
import { getSettings } from "@/lib/content";
import { languageName, regionName } from "@/lib/display-names";
import { telHref } from "@/lib/phone";
import { localize } from "@/lib/data/types";
import { getPresentProfiles, getStoryGroups } from "@/lib/data";
import { ProfileReviews, TrustPanel } from "@/components/profiles/trust";
import { StoryBadge } from "@/components/stories/story-ring";
import { SedcardTile } from "@/components/ui/sedcard-tile";
import { getProfileDetail } from "@/lib/profiles/server";
import {
  hasUpcomingShift,
  presenceLabel,
  profileTimeLabel,
  weekPlan,
} from "@/lib/time/shifts";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/mieterinnen/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  const detail = await getProfileDetail(slug);
  const t = await getTranslations({ locale, namespace: "sedcard" });
  if (!detail) return { title: t("notFoundTitle"), robots: { index: false } };
  const { profile, shifts, now, hasShifts } = detail;
  const langs = profile.languages
    .map((l) => languageName(l, locale))
    .join(", ");
  // Profile ohne Schicht in den nächsten 30 Tagen bleiben erreichbar, aber noindex
  // (nur wenn die Datenquelle überhaupt Schichten liefert).
  // Das Vorschaubild erzeugt opengraph-image.tsx im selben Ordner.
  return pageMetadata({
    locale: locale as Locale,
    path: `/mieterinnen/${profile.slug}`,
    titleAbsolute: t("metaTitle", { name: profile.name }),
    description: langs
      ? t("metaDescription", { name: profile.name, langs })
      : t("metaDescriptionNoLangs", { name: profile.name }),
    noindex: hasShifts && !hasUpcomingShift(shifts, now, 30),
    image: absoluteUrl(
      locale as Locale,
      `/mieterinnen/${profile.slug}/opengraph-image`,
    ),
  });
}

/** So viele Services stehen sofort da; der Rest auf Wunsch */
const SERVICES_SHOWN = 12;

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-line py-2.5">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right text-ink">{children}</dd>
    </div>
  );
}

export default async function SedcardPage({
  params,
}: PageProps<"/[locale]/mieterinnen/[slug]">) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const detail = await getProfileDetail(slug);
  if (!detail) notFound();
  // VyceON findet Sedcards per Slug oder ID; kommt ein anderer Slug zurück
  // (Aufruf per ID, umbenanntes Profil), dauerhaft auf die Slug-Adresse umleiten.
  if (detail.profile.slug !== slug)
    permanentRedirect({
      href: `/mieterinnen/${detail.profile.slug}`,
      locale: locale as Locale,
    });

  const t = await getTranslations("sedcard");
  const tc = await getTranslations("common");
  const tp = await getTranslations("profile");
  const settings = await getSettings();
  const tl = toLocale(locale);
  const { profile, presence, shifts, now, hasShifts } = detail;
  // Wer sonst gerade im Haus ist (verfügbare zuerst)
  const others = (await getPresentProfiles())
    .filter((o) => o.profile.id !== profile.id)
    .slice(0, 8);
  const plan = weekPlan(shifts, now, tl);
  const yesNo = (v: boolean | string) =>
    typeof v === "string" ? v : v ? tc("yes") : tc("no");
  const next = presence
    ? presenceLabel(presence, tl)
    : hasShifts
      ? (profileTimeLabel(shifts, now, tl) ?? t("noShift"))
      : undefined;

  const tProfiles = await getTranslations("profiles");
  const story = (await getStoryGroups()).find((g) => g.slug === profile.slug);
  // Kurzzeile unter dem Namen: die drei Angaben, nach denen zuerst gefragt wird
  const stats = [
    profile.age ? t("years", { count: profile.age }) : null,
    profile.heightCm ? `${profile.heightCm} cm` : null,
    profile.origin ? regionName(profile.origin, locale) : null,
  ].filter((x): x is string => Boolean(x));

  return (
    <article className="container-page py-8 sm:py-14">
      <BreadcrumbJsonLd
        locale={locale as Locale}
        trail={[
          { name: tProfiles("title"), path: "/mieterinnen" },
          { name: profile.name, path: `/mieterinnen/${profile.slug}` },
        ]}
      />
      <ProfilePageJsonLd
        url={absoluteUrl(locale as Locale, `/mieterinnen/${profile.slug}`)}
        name={profile.name}
        images={profile.images.slice(0, 6).map((i) => i.url)}
        languages={profile.languages}
        dateModified={profile.updatedAt}
      />
      <Link href="/mieterinnen" className="font-label text-sm">
        ← {t("back")}
      </Link>

      {/* grid-cols-1 = minmax(0,1fr): die Spalte darf nicht mit dem Inhalt
          wachsen, sonst schiebt eine breite Galerie die Seite zur Seite */}
      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-14">
        {/* Links: Bilder, sie bleiben beim Lesen stehen (nur wenn das Fenster
            hoch genug ist). Rechts: Name, Beschreibung, Eckdaten.
            Auf dem Handy eine Spalte in derselben Reihenfolge. */}
        {/* Desktop: Bilder füllen die Fensterhöhe und laufen beim Lesen mit */}
        <div className="max-lg:contents lg:sticky lg:top-24 lg:h-[max(30rem,calc(100dvh-7.5rem))] lg:self-start">
          <div className="max-lg:order-1 lg:h-full">
            <ProfileGallery
              images={profile.images}
              video={profile.video}
              name={profile.name}
              slug={profile.slug}
            />
          </div>
        </div>

        <div className="max-lg:contents">
          <div className="max-lg:order-2">
            {story && (
              <div className="mb-6">
                <StoryBadge group={story} />
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {presence ? (
                presence.state ? (
                  <Badge
                    variant={presence.state === "ready" ? "ready" : "live"}
                  >
                    {presence.state === "ready"
                      ? tp("available")
                      : tp("onSite")}
                  </Badge>
                ) : (
                  <Badge variant="live">{t("liveNow")}</Badge>
                )
              ) : (
                <Badge>{t("notHere")}</Badge>
              )}
              {profile.verificationLevel &&
                profile.verificationLevel !== "none" && (
                  <VerifiedSeal label={tp("verified")} />
                )}
              {profile.isNew && <Badge variant="new">{tp("new")}</Badge>}
              {profile.isBack && !profile.isNew && (
                <Badge variant="back">{tp("back")}</Badge>
              )}
            </div>

            <h1
              translate="no"
              className="profile-name mt-6 text-6xl sm:text-8xl"
            >
              {profile.name}
            </h1>

            {stats.length > 0 && (
              <p className="mt-3 font-display text-2xl text-gold italic sm:text-3xl">
                {stats.join(" · ")}
              </p>
            )}

            {next && (
              <p
                className={
                  presence?.state === "ready"
                    ? "mt-4 font-label text-mint"
                    : presence
                      ? "mt-4 font-label text-gold"
                      : "mt-4 font-label text-muted"
                }
              >
                {next}
              </p>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <ButtonAnchor
                href={telHref(settings.phoneE164)}
                size="lg"
                className="max-md:hidden"
              >
                <PhoneIcon />
                {tc("call")}
              </ButtonAnchor>
              <p className="text-sm text-muted">
                {t("callHint", { name: profile.name })}
              </p>
            </div>
          </div>

          {profile.personalNote && (
            <section
              className="panel panel-ornate p-7 max-lg:order-3 sm:p-9 lg:mt-10"
              aria-labelledby="about"
            >
              <h2 id="about" className="card-title">
                {t("about")}
              </h2>
              <p className="mt-4 text-lg leading-relaxed whitespace-pre-line text-ink">
                {localize(profile.personalNote, locale)}
              </p>
            </section>
          )}

          <div className="max-lg:order-4">
            <div
              className={
                hasShifts ? "grid gap-6 sm:grid-cols-2 lg:mt-6" : "lg:mt-6"
              }
            >
              <section
                aria-labelledby="facts"
                className="panel panel-ornate p-7 sm:p-9"
              >
                <h2 id="facts" className="card-title">
                  {t("facts")}
                </h2>
                <dl className="mt-4 text-sm">
                  {profile.age && (
                    <Fact label={t("age")}>
                      {t("years", { count: profile.age })}
                    </Fact>
                  )}
                  <Fact label={t("languages")}>
                    {profile.languages
                      .map((l) => languageName(l, locale))
                      .join(", ")}
                  </Fact>
                  {profile.origin && (
                    <Fact label={t("origin")}>
                      {regionName(profile.origin, locale)}
                    </Fact>
                  )}
                  {profile.heightCm && (
                    <Fact label={t("height")}>{profile.heightCm} cm</Fact>
                  )}
                  {profile.cupSize && (
                    <Fact label={t("cup")}>{profile.cupSize}</Fact>
                  )}
                  {profile.shoeSize && (
                    <Fact label={t("shoe")}>{profile.shoeSize}</Fact>
                  )}
                  {profile.weightKg && (
                    <Fact label={t("weight")}>{profile.weightKg} kg</Fact>
                  )}
                  {profile.clothingSize && (
                    <Fact label={t("clothing")}>{profile.clothingSize}</Fact>
                  )}
                  {profile.bodyType && (
                    <Fact label={t("body")}>{profile.bodyType}</Fact>
                  )}
                  {profile.hairColor && (
                    <Fact label={t("hair")}>{profile.hairColor}</Fact>
                  )}
                  {profile.eyeColor && (
                    <Fact label={t("eyes")}>{profile.eyeColor}</Fact>
                  )}
                  {profile.intimateHair && (
                    <Fact label={t("intimate")}>{profile.intimateHair}</Fact>
                  )}
                  {profile.tattoos !== undefined && (
                    <Fact label={t("tattoos")}>{yesNo(profile.tattoos)}</Fact>
                  )}
                  {profile.piercings !== undefined && (
                    <Fact label={t("piercings")}>
                      {yesNo(profile.piercings)}
                    </Fact>
                  )}
                  {profile.extraFacts.map((f) => (
                    <Fact key={f.label} label={f.label}>
                      {f.value}
                    </Fact>
                  ))}
                </dl>
              </section>

              {hasShifts && (
                <section
                  aria-labelledby="week"
                  className="panel panel-ornate p-7 sm:p-9"
                >
                  <h2 id="week" className="card-title">
                    {t("week")}
                  </h2>
                  <div className="mt-4">
                    <WeekPlan days={plan} />
                  </div>
                </section>
              )}
            </div>

            {profile.services.length > 0 && (
              <section
                className="panel panel-ornate mt-6 p-7 sm:p-9"
                aria-labelledby="services"
              >
                <h2 id="services" className="card-title">
                  {t("services")}
                </h2>
                {/* Lange Listen: die ersten zwölf, der Rest klappt auf */}
                <ul className="mt-4 flex flex-wrap gap-2">
                  {profile.services.slice(0, SERVICES_SHOWN).map((s) => (
                    <li key={s.id ?? s.de} className="service-chip">
                      {localize(s, locale)}
                    </li>
                  ))}
                </ul>
                {profile.services.length > SERVICES_SHOWN && (
                  <details className="services-more mt-2">
                    <summary className="cursor-pointer font-label text-xs text-gold">
                      {tProfiles("moreServices", {
                        count: profile.services.length,
                      })}
                    </summary>
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {profile.services.slice(SERVICES_SHOWN).map((s) => (
                        <li key={s.id ?? s.de} className="service-chip">
                          {localize(s, locale)}
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
                <p className="mt-3 text-sm text-muted">{t("servicesNote")}</p>
              </section>
            )}
            {profile.trust && (
              <TrustPanel
                trust={profile.trust}
                name={profile.name}
                locale={tl}
              />
            )}
          </div>
        </div>
      </div>

      {profile.reviews && profile.reviews.count > 0 && (
        <ProfileReviews
          reviews={profile.reviews}
          name={profile.name}
          locale={tl}
        />
      )}

      {others.length > 0 && (
        <section className="mt-20 sm:mt-28" aria-labelledby="also-here">
          <h2 id="also-here" className="text-4xl text-ink sm:text-5xl">
            {t("alsoHere")}
          </h2>
          <ul className="-mx-4 mt-8 flex snap-x snap-mandatory scroll-px-4 [scrollbar-width:none] gap-3 overflow-x-auto px-4 pb-4 sm:mx-0 sm:scroll-px-0 sm:gap-4 sm:px-0">
            {others.map(({ profile: o, presence: op }) => (
              <li
                key={o.id}
                className="w-[44%] shrink-0 snap-start sm:w-[30%] lg:w-[22%]"
              >
                <SedcardTile
                  slug={o.slug}
                  name={o.name}
                  languages={o.languages.map((x) => x.toUpperCase())}
                  isLive
                  liveState={op.state}
                  isNew={o.isNew}
                  isBack={o.isBack}
                  timeLabel={presenceLabel(op, tl)}
                  image={o.images[0]}
                  video={o.video}
                  verified={Boolean(
                    o.verificationLevel && o.verificationLevel !== "none",
                  )}
                />
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
