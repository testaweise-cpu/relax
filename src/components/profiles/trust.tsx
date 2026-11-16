import { getTranslations } from "next-intl/server";
import { bcp47, type Locale } from "@/i18n/locales";
import type { Profile } from "@/lib/data/types";
import { cn } from "@/lib/cn";

type Trust = NonNullable<Profile["trust"]>;
type Reviews = NonNullable<Profile["reviews"]>;

const formatDay = (iso: string, locale: Locale) =>
  new Intl.DateTimeFormat(bcp47(locale), {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Berlin",
  }).format(new Date(iso));

/**
 * VYCE69 Trust: die fünf Prüfungen wie auf VYCE69 – bestätigte in Gold, offene
 * gedimmt und neutral („noch nicht nachgewiesen“), nie als Mangel formuliert.
 * Angezeigt wird nur das Ergebnis, nie ein Nachweis.
 */
export async function TrustPanel({
  trust,
  name,
  locale,
}: {
  trust: Trust;
  name: string;
  locale: Locale;
}) {
  const t = await getTranslations({ locale, namespace: "trust" });
  const confirmed = trust.checks.filter((c) => c.confirmed).length;
  return (
    <section
      aria-labelledby="trust"
      className="panel panel-ornate mt-6 p-7 sm:p-8"
    >
      <h2 id="trust" className="card-title" translate="no">
        {t("title")}
      </h2>
      <p className="mt-2 text-sm text-muted">
        {confirmed > 0
          ? t("checksConfirmed", { count: confirmed, max: trust.checks.length })
          : t("noneConfirmed")}
      </p>
      {/* Kompakt: eine Reihe Marken; Erklärungen erst auf Wunsch */}
      <ul className="mt-4 flex flex-wrap gap-2">
        {trust.checks.map((c) => (
          <li
            key={c.key}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm",
              c.confirmed
                ? "border-gold/50 bg-gold/10 text-ink"
                : "border-line text-muted opacity-60",
            )}
            title={
              c.confirmed
                ? t(`checks.${c.key}.detail`)
                : `${t(`checks.${c.key}.openLabel`)} – ${t("openStatus")}`
            }
          >
            <span aria-hidden className={c.confirmed ? "text-gold" : ""}>
              {c.confirmed ? "✓" : "·"}
            </span>
            {c.confirmed
              ? t(`checks.${c.key}.label`)
              : t(`checks.${c.key}.openLabel`)}
            {!c.confirmed && (
              <span className="sr-only"> ({t("openStatus")})</span>
            )}
          </li>
        ))}
      </ul>
      <details className="trust-more mt-4">
        <summary className="cursor-pointer font-label text-xs text-gold">
          {t("explainer")}
        </summary>
        <dl className="mt-3 space-y-2 text-sm">
          {trust.checks.map((c) => (
            <div key={c.key}>
              <dt className={c.confirmed ? "text-ink" : "text-muted"}>
                {c.confirmed
                  ? t(`checks.${c.key}.label`)
                  : `${t(`checks.${c.key}.openLabel`)} – ${t("openStatus")}`}
              </dt>
              <dd className="text-muted">
                {c.confirmed
                  ? t(`checks.${c.key}.detail`)
                  : t(`checks.${c.key}.openDetail`)}
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-xs leading-relaxed text-muted">
          {trust.lastReviewedAt && confirmed > 0 && (
            <>
              {t("lastChecked")}: {formatDay(trust.lastReviewedAt, locale)}
              .{" "}
            </>
          )}
          {t("intro")} {t("disclaimer")}
        </p>
      </details>
      <span className="sr-only">{name}</span>
    </section>
  );
}

function Stars({ value, label }: { value: number; label: string }) {
  return (
    <span
      className="inline-flex items-center gap-0.5 text-gold"
      role="img"
      aria-label={label}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <svg key={n} viewBox="0 0 20 20" width="16" height="16" aria-hidden>
          <path
            d="M10 1.8l2.5 5.2 5.7.8-4.1 4 1 5.7L10 14.8l-5.1 2.7 1-5.7-4.1-4 5.7-.8z"
            fill={value >= n - 0.25 ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1"
            opacity={value >= n - 0.75 ? 1 : 0.45}
          />
        </svg>
      ))}
    </span>
  );
}

/** Freigegebene Bewertungen von VYCE69, ohne Verfasser:in. */
export async function ProfileReviews({
  reviews,
  name,
  locale,
}: {
  reviews: Reviews;
  name: string;
  locale: Locale;
}) {
  const t = await getTranslations({ locale, namespace: "trust" });
  return (
    <section aria-labelledby="reviews" className="mt-16 sm:mt-24">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">{t("reviewsLabel")}</p>
          <h2 id="reviews" className="mt-3 text-4xl text-ink sm:text-5xl">
            {t("reviewsHeading", { name })}
          </h2>
        </div>
        {reviews.average !== null && (
          <p className="flex items-center gap-3">
            <span className="font-display text-4xl text-gold italic">
              {reviews.average.toLocaleString(bcp47(locale))}
            </span>
            <Stars
              value={reviews.average}
              label={t("stars", { rating: reviews.average })}
            />
            <span className="text-sm text-muted">
              {t("reviewsCount", { count: reviews.count })}
            </span>
          </p>
        )}
      </div>
      <ul className="mt-8 grid gap-4 md:grid-cols-2">
        {reviews.items.map((r, i) => (
          <li key={i} className="panel panel-ornate p-7">
            <div className="flex flex-wrap items-center gap-3">
              <Stars
                value={r.rating}
                label={t("stars", { rating: r.rating })}
              />
              <time
                dateTime={r.createdAt}
                className="font-label text-xs text-muted"
              >
                {formatDay(r.createdAt, locale)}
              </time>
              {r.afterAppointment && (
                <span className="rounded-full border border-gold/40 px-2.5 py-0.5 font-label text-[0.62rem] tracking-[0.18em] text-gold uppercase">
                  {t("afterAppointment")}
                </span>
              )}
            </div>
            {r.body && (
              <p className="mt-4 leading-relaxed whitespace-pre-line text-ink">
                {r.body}
              </p>
            )}
            {r.reply && (
              <div className="mt-4 border-l border-gold/50 pl-4">
                <p className="font-label text-xs text-gold" translate="no">
                  {t("reply", { name })}
                </p>
                <p className="mt-1 text-sm text-muted">{r.reply}</p>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
