import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { HeroMedia } from "@/lib/media/hero";
import { HeroVideo } from "./hero-video";

/**
 * Hero-Kulisse im Rotlicht: rotes Raumlicht und unscharfe Lichtpunkte.
 * Reines CSS, optional mit Video.
 */
export function HeroBackdrop({
  children,
  className,
  media,
}: {
  children?: ReactNode;
  className?: string;
  /** optionaler Video-Hintergrund (abgedunkelt, unter der Neon-Szene) */
  media?: HeroMedia;
}) {
  return (
    <div className={cn("hero-sky", className)}>
      {media && <HeroVideo media={media} />}
      {media && <div className="hero-tint" aria-hidden />}
      <div className="hero-glow" aria-hidden />
      {children}
    </div>
  );
}
