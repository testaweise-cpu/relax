import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import { Badge } from "./badge";
import { PlaceholderArt } from "./placeholder-art";

export type SedcardTileProps = {
  slug: string;
  name: string;
  languages: string[];
  /** z. B. "heute 16–24 Uhr" – kommt aus der Zeitlogik (Phase 3) */
  timeLabel?: string;
  isLive?: boolean;
  isNew?: boolean;
  isBack?: boolean;
  image?: { url: string; width: number; height: number; alt: string };
  /** für Platzhalter-Varianz */
  seed?: number;
  /** erstes sichtbares Bild bevorzugt laden (LCP) */
  priority?: boolean;
  sizes?: string;
  className?: string;
};

export function SedcardTile({
  slug,
  name,
  languages,
  timeLabel,
  isLive,
  isNew,
  isBack,
  image,
  seed = 0,
  priority,
  sizes = "(min-width: 1024px) 22vw, (min-width: 640px) 31vw, 46vw",
  className,
}: SedcardTileProps) {
  const t = useTranslations("profile");

  return (
    <Link
      href={`/mieterinnen/${slug}`}
      className={cn("sedcard group no-underline", className)}
    >
      <div className="relative aspect-[3/4]">
        {image ? (
          <Image
            src={image.url}
            alt={image.alt}
            fill
            sizes={sizes}
            loading={priority ? "eager" : undefined}
            fetchPriority={priority ? "high" : undefined}
            className="object-cover"
          />
        ) : (
          <PlaceholderArt seed={seed} />
        )}
        <div className="sedcard-shade" aria-hidden />

        <div className="absolute inset-x-2 top-2 flex flex-wrap gap-1.5">
          {isLive && <Badge variant="live">{t("live")}</Badge>}
          {isNew && <Badge variant="new">{t("new")}</Badge>}
          {isBack && !isNew && <Badge variant="back">{t("back")}</Badge>}
        </div>

        <div className="absolute inset-x-0 bottom-0 px-3 pb-3">
          <p className="max-w-full font-display text-[1.9rem] leading-none font-medium break-words text-ink italic [text-shadow:0_2px_18px_rgb(0_0_0/0.6)] sm:text-[2.2rem]">
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
                isLive ? "text-gold" : "text-muted",
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
