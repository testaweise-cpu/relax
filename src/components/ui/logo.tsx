import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import { NeonText } from "./neon-text";

type LogoProps = {
  size?: "sm" | "lg" | "xl";
  /** Einschalt-Animation (nur beim Hero bzw. ersten Laden) */
  animated?: boolean;
  /** als Link zur Startseite rendern */
  link?: boolean;
  className?: string;
};

const sizes = {
  sm: "text-[2rem]",
  lg: "text-6xl",
  xl: "text-[clamp(3.75rem,17vw,9rem)]",
};

// TODO(Kunde): Bestehendes Logo als Neon-Variante oder neues Logo?
// Bis dahin ein reiner Neon-Schriftzug.
export function Logo({
  size = "sm",
  animated = false,
  link = true,
  className,
}: LogoProps) {
  const mark = (
    <NeonText
      tilt
      flicker={animated}
      ignite={animated}
      className={cn(sizes[size], "whitespace-nowrap", className)}
    >
      Mona Roses
    </NeonText>
  );
  if (!link) return mark;
  return (
    <Link
      href="/"
      className="inline-block rounded-md px-1 no-underline"
      aria-label="Mona Roses – Startseite"
    >
      {mark}
    </Link>
  );
}
