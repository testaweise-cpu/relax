import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { HeroMedia } from "@/lib/media/hero";
import { HeroVideo } from "./hero-video";

/**
 * Hero-Kulisse "Miami Nights": Sternenhimmel, gestreifte Sonne, Horizont mit
 * Glühen und perspektivisches Raster. Reines CSS – keine Bilder, kein Video.
 *
 * Inhalte über der Szene: Abstand unten mit `.hero-clearance` freihalten,
 * damit Text nicht auf der Sonne liegt.
 */
export function HeroBackdrop({
  children,
  className,
  horizon,
  sun,
  media,
}: {
  children?: ReactNode;
  className?: string;
  /** Höhe des Bodens (Raster), CSS-Länge – bestimmt die Lage des Horizonts */
  horizon?: string;
  /** Sonnendurchmesser, CSS-Länge */
  sun?: string;
  /** optionaler Video-Hintergrund (abgedunkelt, unter der Neon-Szene) */
  media?: HeroMedia;
}) {
  const style = {
    ...(horizon && { "--horizon": horizon }),
    ...(sun && { "--sun": sun }),
  } as CSSProperties;
  return (
    <div className={cn("hero-sky", className)} style={style}>
      {media && <HeroVideo media={media} />}
      {media && <div className="hero-tint" aria-hidden />}
      <div className="hero-stars" aria-hidden />
      <div className="hero-sun" aria-hidden />
      <div className="hero-floor" aria-hidden>
        <div className="hero-grid" />
      </div>
      <div className="hero-horizon" aria-hidden />
      {children}
    </div>
  );
}
