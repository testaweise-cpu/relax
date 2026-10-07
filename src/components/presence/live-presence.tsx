"use client";

import { useLocale, useTranslations } from "next-intl";
import { SedcardTile } from "@/components/ui/sedcard-tile";
import { ArrowRightIcon } from "@/components/ui/icons";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import type { PresenceResponse } from "@/lib/data/presence-dto";
import { formatClock, presenceLabel } from "@/lib/time/shifts";
import { usePresence } from "./use-presence";

type Props = { initial: PresenceResponse };

/** Raster aller Anwesenden – Seite /jetzt-da. */
export function LivePresenceGrid({ initial }: Props) {
  const t = useTranslations("now");
  const locale = useLocale() === "en" ? "en" : "de";
  const { data, stale } = usePresence(initial);

  return (
    <div>
      <p className="mb-4 font-mono text-sm text-muted" aria-live="polite">
        <span className="live-dot mr-2 inline-block align-middle" aria-hidden />
        {t("updated", { time: formatClock(new Date(data.updatedAt), locale) })}
        {stale && <span className="ml-3 text-sunset">{t("stale")}</span>}
      </p>
      {data.present.length > 0 ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {data.present.map((p, i) => (
            <li key={p.slug}>
              <SedcardTile
                slug={p.slug}
                name={p.name}
                languages={p.languages.map((l) => l.toUpperCase())}
                isLive
                isNew={p.isNew}
                isBack={p.isBack}
                timeLabel={presenceLabel(p, locale)}
                image={p.image ?? undefined}
                priority={i < 2}
              />
            </li>
          ))}
        </ul>
      ) : (
        <div className="panel p-8 text-center">
          <p className="text-lg text-ink">{t("empty")}</p>
          <p className="mt-2 text-muted">{t("emptyHint")}</p>
          <p className="mt-4">
            <Link href="/mieterinnen">{t("allProfiles")} →</Link>
          </p>
        </div>
      )}
    </div>
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
      className={cn("py-16 sm:py-20", className)}
    >
      <div className="container-page flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Live</p>
          <h2
            id="now-strip"
            className="mt-3 flex items-center gap-4 text-3xl text-ink sm:text-4xl"
          >
            {t("stripTitle")}
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan/40 px-3 py-1 font-mono text-sm font-normal tracking-normal text-cyan">
              <span className="live-dot" aria-hidden />
              {data.present.length}
            </span>
          </h2>
        </div>
        <Link
          href="/jetzt-da"
          className="inline-flex min-h-11 items-center gap-1 font-mono text-sm"
        >
          {t("stripAll")} <ArrowRightIcon width={16} height={16} />
        </Link>
      </div>
      {data.present.length > 0 ? (
        <ul className="container-page mt-6 flex snap-x snap-mandatory scroll-px-4 [scrollbar-width:thin] gap-3 overflow-x-auto pb-4 sm:scroll-px-8 sm:gap-4">
          {data.present.map((p, i) => (
            <li
              key={p.slug}
              className="w-[44%] shrink-0 snap-start sm:w-[30%] lg:w-[22%]"
            >
              <SedcardTile
                slug={p.slug}
                name={p.name}
                languages={p.languages.map((l) => l.toUpperCase())}
                isLive
                isNew={p.isNew}
                isBack={p.isBack}
                timeLabel={presenceLabel(p, locale)}
                image={p.image ?? undefined}
                priority={i < 2}
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
