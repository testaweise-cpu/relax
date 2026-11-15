"use client";

import { useLocale, useTranslations } from "next-intl";
import { SedcardTile } from "@/components/ui/sedcard-tile";
import { ArrowRightIcon } from "@/components/ui/icons";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import type { PresenceResponse, PresentEntry } from "@/lib/data/presence-dto";
import { formatClock, presenceLabel } from "@/lib/time/shifts";
import { usePresence } from "./use-presence";

type Props = { initial: PresenceResponse };

function Tile({
  p,
  locale,
  priority,
  sizes,
}: {
  p: PresentEntry;
  locale: "de" | "en";
  priority?: boolean;
  sizes?: string;
}) {
  return (
    <SedcardTile
      slug={p.slug}
      name={p.name}
      languages={p.languages.map((l) => l.toUpperCase())}
      isLive
      liveState={p.state}
      isNew={p.isNew}
      isBack={p.isBack}
      timeLabel={presenceLabel(p, locale)}
      image={p.image ?? undefined}
      priority={priority}
      sizes={sizes}
    />
  );
}

const GRID = "grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4";

/** Raster aller Anwesenden – Seite /jetzt-da, getrennt nach Zustand. */
export function LivePresenceGrid({ initial }: Props) {
  const t = useTranslations("now");
  const locale = useLocale() === "en" ? "en" : "de";
  const { data, stale } = usePresence(initial);
  const hasStates = data.present.some((p) => p.state);
  const ready = data.present.filter((p) => p.state !== "on_site");
  const onSite = data.present.filter((p) => p.state === "on_site");

  return (
    <div>
      <p className="mb-6 font-label text-sm text-muted" aria-live="polite">
        <span className="live-dot mr-2 inline-block align-middle" aria-hidden />
        {t("updated", { time: formatClock(new Date(data.updatedAt), locale) })}
        {stale && <span className="ml-3 text-sunset">{t("stale")}</span>}
      </p>
      {data.present.length === 0 ? (
        <div className="panel p-8 text-center">
          <p className="text-lg text-ink">{t("empty")}</p>
          <p className="mt-2 text-muted">{t("emptyHint")}</p>
          <p className="mt-4">
            <Link href="/mieterinnen">{t("allProfiles")} →</Link>
          </p>
        </div>
      ) : hasStates ? (
        <div className="space-y-12">
          {[
            { key: "ready", title: t("groupReady"), list: ready },
            { key: "on_site", title: t("groupOnSite"), list: onSite },
          ]
            .filter((g) => g.list.length > 0)
            .map((g, gi) => (
              <section key={g.key} aria-labelledby={`group-${g.key}`}>
                <h2
                  id={`group-${g.key}`}
                  className="mb-6 flex items-baseline gap-4 text-3xl text-ink sm:text-4xl"
                >
                  {g.title}
                  <span className="font-display text-2xl text-gold italic">
                    {g.list.length}
                  </span>
                  <span
                    aria-hidden
                    className="h-px flex-1 self-center bg-gradient-to-r from-gold/45 to-transparent"
                  />
                </h2>
                <ul className={GRID}>
                  {g.list.map((p, i) => (
                    <li key={p.slug} className="reveal">
                      <Tile
                        p={p}
                        locale={locale}
                        priority={gi === 0 && i < 2}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            ))}
        </div>
      ) : (
        <ul className={GRID}>
          {data.present.map((p, i) => (
            <li key={p.slug} className="reveal">
              <Tile p={p} locale={locale} priority={i < 2} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Live-Anzeige im Hero der Startseite: aktualisiert sich selbst. */
export function LivePill({ initial }: Props) {
  const t = useTranslations("now");
  const { data } = usePresence(initial);
  const total = data.present.length;
  const ready = data.present.filter((p) => p.state === "ready").length;
  return (
    <Link
      href="/jetzt-da"
      className="live-pill glass-chip group inline-flex min-h-11 items-center gap-3 rounded-[var(--radius)] border border-gold/35 px-4 py-2 font-label text-xs tracking-[0.18em] text-ink uppercase no-underline"
      aria-live="polite"
    >
      <span
        className={cn("live-dot", ready > 0 && "live-dot-ready")}
        aria-hidden
      />
      <span>{t("heroPill", { count: total })}</span>
      {ready > 0 && (
        <span className="text-mint">· {t("heroReady", { count: ready })}</span>
      )}
      <ArrowRightIcon
        width={14}
        height={14}
        className="transition-transform group-hover:translate-x-0.5"
      />
    </Link>
  );
}

/** Horizontal wischbare Leiste – Startseite. */
export function NowStrip({
  initial,
  className,
}: Props & { className?: string }) {
  const t = useTranslations("now");
  const locale = useLocale() === "en" ? "en" : "de";
  const { data } = usePresence(initial);

  return (
    <section
      aria-labelledby="now-strip"
      className={cn("py-16 sm:py-24", className)}
    >
      <div className="container-page flex items-end justify-between gap-4">
        <h2
          id="now-strip"
          className="flex items-center gap-4 text-5xl text-ink sm:text-6xl"
        >
          {t("stripTitle")}
          <span className="glass-chip inline-flex items-center gap-2 rounded-[var(--radius)] border border-gold/40 px-3 py-1 font-label text-sm font-normal tracking-normal text-gold">
            <span className="live-dot" aria-hidden />
            {data.present.length}
          </span>
        </h2>
        <Link
          href="/jetzt-da"
          className="inline-flex min-h-11 items-center gap-1 font-label text-sm"
        >
          {t("stripAll")} <ArrowRightIcon width={16} height={16} />
        </Link>
      </div>
      {data.present.length > 0 ? (
        <ul className="container-page mt-8 flex snap-x snap-mandatory scroll-px-4 [scrollbar-width:none] gap-3 overflow-x-auto pb-4 sm:scroll-px-8 sm:gap-4">
          {data.present.map((p) => (
            <li
              key={p.slug}
              className="w-[44%] shrink-0 snap-start sm:w-[30%] lg:w-[22%]"
            >
              <Tile
                p={p}
                locale={locale}
                sizes="(min-width: 1024px) 22vw, (min-width: 640px) 30vw, 44vw"
              />
            </li>
          ))}
        </ul>
      ) : (
        <p className="container-page mt-6 text-muted">
          {t("empty")} <Link href="/mieterinnen">{t("allProfiles")} →</Link>
        </p>
      )}
    </section>
  );
}
