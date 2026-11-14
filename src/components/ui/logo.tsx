import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";

type LogoProps = {
  size?: "sm" | "lg" | "xl";
  /** als Link zur Startseite rendern */
  link?: boolean;
  /** vor dem ersten Malen laden (Kopfzeile, Hero) */
  priority?: boolean;
  className?: string;
};

// Seitenverhältnis der Bildmarke (2075 × 698)
const RATIO = 2075 / 698;

// Höhe steuert die Größe; die Breite folgt dem Seitenverhältnis.
const heights = {
  sm: "h-12 sm:h-14",
  lg: "h-20 sm:h-24",
  xl: "h-[clamp(6.5rem,24vw,15rem)]",
};

// Dargestellte Breite je Größe – daraus wählt der Browser die passende Datei,
// statt immer das große Original zu laden.
const widths = {
  sm: "(min-width: 640px) 167px, 143px",
  lg: "(min-width: 640px) 286px, 238px",
  xl: "(min-width: 1000px) 714px, 72vw",
};

/** Bildmarke Mona Roses: Schriftzug in Gold mit roter Rose. */
export function Logo({
  size = "sm",
  link = true,
  priority = false,
  className,
}: LogoProps) {
  const t = useTranslations("nav");
  const mark = (
    <Image
      src="/logo/mona-roses.webp"
      alt="Mona Roses"
      width={1600}
      height={Math.round(1600 / RATIO)}
      sizes={widths[size]}
      quality={90}
      priority={priority}
      className={cn("w-auto max-w-full", heights[size], className)}
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
