/**
 * Hero-Hintergrund: kurzer Ambiente-Loop (ca. 7 s, ohne Ton, leicht verlangsamt)
 * aus dem Werbevideo der Altseite – nur Raumszenen ohne erkennbare Personen
 * (Spiegelrahmen, Kamin, Zimmer). Standbild: Kamin. Das vollständige Video
 * liegt unter /media/mona-roses-werbevideo.mp4 (Galerie, Start per Klick).
 */
export const HERO_VIDEO = {
  poster: "/media/hero-ambiente-poster.webp",
  posterWidth: 960,
  posterHeight: 540,
  sources: [
    { src: "/media/hero-ambiente.webm", type: "video/webm" },
    { src: "/media/hero-ambiente.mp4", type: "video/mp4" },
  ],
} as const;

export type HeroMedia = {
  poster: string;
  posterWidth: number;
  posterHeight: number;
  sources: ReadonlyArray<{ src: string; type: string }>;
};
