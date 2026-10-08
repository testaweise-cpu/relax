import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { HeroMedia } from "@/lib/media/hero";
import { HeroVideo } from "./hero-video";

/**
 * Hero-Kulisse im Rotlicht: rotes Raumlicht, unscharfe Lichtpunkte, Horizont
 * mit Glühen und perspektivisches Raster. Reines CSS, optional mit Video.
 *
 * Inhalte über der Szene: Abstand unten mit `.hero-clearance` freihalten,
 * damit Text nicht auf dem Boden liegt.
 */
export function HeroBackdrop({
  children,
  className,
  horizon,
  media,
}: {
  children?: ReactNode;
  className?: string;
  /** Höhe des Bodens (Raster), CSS-Länge – bestimmt die Lage des Horizonts */
  horizon?: string;
  /** optionaler Video-Hintergrund (abgedunkelt, unter der Neon-Szene) */
  media?: HeroMedia;
}) {
  const style = {
    ...(horizon && { "--horizon": horizon }),
  } as CSSProperties;
  return (
    <div className={cn("hero-sky", className)} style={style}>
      {media && <HeroVideo media={media} />}
      {media && <div className="hero-tint" aria-hidden />}
      <div className="hero-glow" aria-hidden />
      <div className="hero-floor" aria-hidden>
        <div className="hero-grid" />
      </div>
      <div className="hero-horizon" aria-hidden />
      {children}
    </div>
  );
}
