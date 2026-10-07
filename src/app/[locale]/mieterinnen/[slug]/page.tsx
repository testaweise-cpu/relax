import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { ProfileGallery } from "@/components/profiles/profile-gallery";
import { WeekPlan } from "@/components/profiles/week-plan";
import { Badge } from "@/components/ui/badge";
import { ButtonAnchor } from "@/components/ui/button";
import { PhoneIcon } from "@/components/ui/icons";
import { NeonText } from "@/components/ui/neon-text";
import { Link } from "@/i18n/navigation";
import { getSettings } from "@/lib/content";
import { languageName, regionName } from "@/lib/display-names";
import { telHref } from "@/lib/phone";
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
  const { profile, shifts, now } = detail;
  const langs = profile.languages
    .map((l) => languageName(l, locale))
    .join(", ");
  return {
    title: profile.name,
    description: `${profile.name} – Mona Roses Berlin-Steglitz. ${t("languages")}: ${langs}.`,
    // Profile ohne Schicht in den nächsten 30 Tagen bleiben erreichbar, aber noindex.
    robots: hasUpcomingShift(shifts, now, 30)
      ? undefined
      : { index: false, follow: true },
    openGraph: profile.images[0]
      ? { images: [{ url: profile.images[0].url }] }
      : undefined,
  };
}

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

  const t = await getTranslations("sedcard");
  const tc = await getTranslations("common");
  const tp = await getTranslations("profile");
  const settings = await getSettings();
  const tl = locale === "en" ? "en" : "de";
  const { profile, presence, shifts, now } = detail;
  const plan = weekPlan(shifts, now, tl);
  const next = presence
    ? presenceLabel(presence, tl)
    : profileTimeLabel(shifts, now, tl);

  return (
    <article className="container-page py-8 sm:py-14">
      <Link href="/mieterinnen" className="font-mono text-sm">
        ← {t("back")}
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-14">
        <ProfileGallery images={profile.images} name={profile.name} />

        <div>
          <div className="flex flex-wrap gap-2">
            {presence ? (
              <Badge variant="live">{t("liveNow")}</Badge>
            ) : (
              <Badge>{t("notHere")}</Badge>
            )}
            {profile.isNew && <Badge variant="new">{tp("new")}</Badge>}
            {profile.isBack && !profile.isNew && (
              <Badge variant="back">{tp("back")}</Badge>
            )}
          </div>

          <h1 className="mt-4">
            <NeonText tilt className="origin-left text-7xl sm:text-8xl">
              {profile.name}
            </NeonText>
          </h1>

          <p
            className={
              presence
                ? "mt-4 font-mono text-cyan"
                : "mt-4 font-mono text-muted"
            }
          >
            {next ?? t("noShift")}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <ButtonAnchor href={telHref(settings.phoneE164)} size="lg">
              <PhoneIcon />
              {tc("call")}
            </ButtonAnchor>
            <p className="text-sm text-muted">
              {t("callHint", { name: profile.name })}
            </p>
          </div>

          {profile.personalNote && (
            <section className="mt-10" aria-labelledby="about">
              <h2 id="about" className="heading-glow text-2xl text-ink">
                {t("about")}
              </h2>
              <p className="mt-4 text-lg text-ink">{profile.personalNote}</p>
            </section>
          )}

          <div className="mt-10 grid gap-10 sm:grid-cols-2">
            <section aria-labelledby="facts">
              <h2 id="facts" className="heading-glow text-2xl text-ink">
                {t("facts")}
              </h2>
              <dl className="mt-4 text-sm">
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
              </dl>
            </section>

            <section aria-labelledby="week">
              <h2 id="week" className="heading-glow text-2xl text-ink">
                {t("week")}
              </h2>
              <div className="mt-4">
                <WeekPlan days={plan} />
              </div>
            </section>
          </div>

          {profile.services.length > 0 && (
            <section className="mt-10" aria-labelledby="services">
              <h2 id="services" className="heading-glow text-2xl text-ink">
                {t("services")}
              </h2>
              <ul className="mt-4 flex flex-wrap gap-2">
                {profile.services.map((s) => (
                  <li
                    key={s}
                    className="rounded-full border border-line bg-panel px-3 py-1 text-sm text-ink"
                  >
                    {s}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-sm text-muted">{t("servicesNote")}</p>
            </section>
          )}
        </div>
      </div>
    </article>
  );
}
