import { cn } from "@/lib/cn";

/**
 * Platzhalter in Markenfarben statt echter Fotos (Mock-Daten, fehlende
 * Raumfotos). Der Farbton variiert über `seed`, damit Raster nicht gleich aussehen.
 */
export function PlaceholderArt({
  seed = 0,
  label,
  className,
}: {
  seed?: number;
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={cn("placeholder-art absolute inset-0", className)}
      // leichte Variation um Rot herum, nicht in fremde Farbtöne
      style={{ filter: `hue-rotate(${((seed * 13) % 40) - 20}deg)` }}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  );
}
