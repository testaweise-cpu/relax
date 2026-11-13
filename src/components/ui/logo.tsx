import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";

type LogoProps = {
  size?: "sm" | "lg" | "xl";
  /** früher Einschalt-Animation der Neonschrift; ohne Wirkung, bleibt für Aufrufer */
  animated?: boolean;
  /** als Link zur Startseite rendern */
  link?: boolean;
  /** vor dem ersten Malen laden (Kopfzeile, Hero) */
  priority?: boolean;
  className?: string;
};

// Seitenverhältnis der Bildmarke (2075 × 698)
const RATIO = 2075 / 698;

// Höhe steuert die Größe; die Breite folgt dem Seitenverhältnis.
const sizes = {
  sm: "h-12 sm:h-14",
  lg: "h-20 sm:h-24",
  xl: "h-[clamp(6.5rem,24vw,15rem)]",
};

/** Bildmarke Mona Roses: Schriftzug in Gold mit roter Rose. */
export function Logo({
  size = "sm",
  link = true,
  priority = false,
  className,
}: LogoProps) {
  const t = useTranslations("nav");
  const large = size !== "sm";
  const mark = (
    <Image
      src={large ? "/logo/mona-roses.webp" : "/logo/mona-roses-640.webp"}
      alt="Mona Roses"
      width={large ? 1600 : 640}
      height={Math.round((large ? 1600 : 640) / RATIO)}
      // fertig aufbereitete Dateien: keine weitere Umrechnung nötig
      unoptimized
      priority={priority}
      className={cn("w-auto max-w-full", sizes[size], className)}
    />
  );
  if (!link) return mark;
  return (
    <Link
      href="/"
      className="inline-block rounded-md no-underline"
      aria-label={t("homeLabel")}
    >
      {mark}
    </Link>
  );
}
