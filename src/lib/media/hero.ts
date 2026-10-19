/**
 * Hintergrundvideos von der Originalseite (ohne Ton, als Loop mit kurzer
 * Blende). Das Werbevideo liegt unter /media/mona-roses-werbevideo.mp4
 * (Galerie, Start per Klick).
 */

/** Startseite: Stock-Video (Frau vor Backsteinwand im Spot). */
export const HERO_VIDEO = {
  poster: "/media/hero-home-poster.webp",
  posterWidth: 1280,
  posterHeight: 720,
  // Person steht rechts der Mitte – im Hochformat nicht abschneiden
  position: "58% 50%",
  sources: [
    { src: "/media/hero-home.webm", type: "video/webm" },
    { src: "/media/hero-home.mp4", type: "video/mp4" },
  ],
} as const;

/** Kopfbereich von Jetzt da, Events und Jobs: tanzende Silhouetten vor Rotlicht. */
export const PAGE_VIDEO = {
  poster: "/media/seiten-tanz-poster.webp",
  posterWidth: 854,
  posterHeight: 480,
  sources: [
    { src: "/media/seiten-tanz.webm", type: "video/webm" },
    { src: "/media/seiten-tanz.mp4", type: "video/mp4" },
  ],
} as const;

export type HeroMedia = {
  poster: string;
  posterWidth: number;
  posterHeight: number;
  /** Bildausschnitt (CSS object-position), Standard: Mitte */
  position?: string;
  sources: ReadonlyArray<{ src: string; type: string }>;
};
