import Image from "next/image";
import { useTranslations } from "next-intl";
import { ViewTransition } from "react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import { Badge } from "./badge";
import { PlaceholderArt } from "./placeholder-art";
import { ProfileClip } from "./profile-clip";

export type SedcardTileProps = {
  slug: string;
  name: string;
  languages: string[];
  /** z. B. "heute 16–24 Uhr" oder "jetzt verfügbar" */
  timeLabel?: string;
  isLive?: boolean;
  /** Zustand im Haus: verfügbar oder gerade beschäftigt */
  liveState?: "ready" | "on_site" | null;
  isNew?: boolean;
  isBack?: boolean;
  image?: { url: string; width: number; height: number; alt: string };
  /** kurzes Video als bewegtes Profilbild */
  video?: string | null;
  /** für Platzhalter-Varianz */
  seed?: number;
  /** erstes sichtbares Bild bevorzugt laden (LCP) */
  priority?: boolean;
  sizes?: string;
  className?: string;
};

/** Bildgrößen der Kachel im Raster (auch für den Übergang zum Profil genutzt) */
export const SEDCARD_SIZES =
  "(min-width: 1024px) 22vw, (min-width: 640px) 31vw, 46vw";

/** Gemeinsamer Name für den Übergang Kachel → Profilbild. */
export const sedcardTransitionName = (slug: string) => `sedcard-${slug}`;

export function SedcardTile({
  slug,
  name,
  languages,
  timeLabel,
  isLive,
  liveState,
  isNew,
  isBack,
  image,
  video,
  seed = 0,
  priority,
  sizes = SEDCARD_SIZES,
  className,
}: SedcardTileProps) {
  const t = useTranslations("profile");
  const ready = isLive && liveState === "ready";

  return (
    <Link
      href={`/mieterinnen/${slug}`}
      className={cn(
        "sedcard group no-underline",
        ready && "sedcard-ready",
        className,
      )}
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        <ViewTransition
          name={sedcardTransitionName(slug)}
          share="morph"
          default="none"
        >
          <div className="absolute inset-0">
            {image ? (
              <Image
                src={image.url}
                alt={image.alt || name}
                fill
                sizes={sizes}
                loading={priority ? "eager" : undefined}
                fetchPriority={priority ? "high" : undefined}
                className="sedcard-img object-cover"
              />
            ) : (
              <PlaceholderArt seed={seed} />
            )}
          </div>
        </ViewTransition>
        {video && <ProfileClip src={video} />}
        <div className="sedcard-shade" aria-hidden />

        <div className="absolute inset-x-2.5 top-2.5 flex flex-wrap gap-1.5">
          {isLive &&
            (liveState ? (
              <Badge variant={ready ? "ready" : "live"}>
                {ready ? t("available") : t("onSite")}
              </Badge>
            ) : (
              <Badge variant="live">{t("live")}</Badge>
            ))}
          {video && <Badge>Video</Badge>}
          {isNew && <Badge variant="new">{t("new")}</Badge>}
          {isBack && !isNew && <Badge variant="back">{t("back")}</Badge>}
        </div>

        <div className="absolute inset-x-0 bottom-0 px-3.5 pb-3.5">
          <p className="sedcard-name max-w-full text-2xl break-words sm:text-[1.9rem]">
            {name}
          </p>
          {languages.length > 0 && (
            <p className="mt-2 truncate font-label text-[0.62rem] tracking-[0.24em] text-ink/85 uppercase">
              <span className="sr-only">{t("languages")}: </span>
              {languages.join(" · ")}
            </p>
          )}
          {timeLabel && (
            <p
              className={cn(
                "mt-1 truncate font-label text-xs tracking-wide",
                ready ? "text-mint" : isLive ? "text-gold" : "text-muted",
              )}
            >
              {timeLabel}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
