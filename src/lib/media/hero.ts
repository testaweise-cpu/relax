/**
 * Hero-Hintergrund: kurzer Ambiente-Loop (10 s, ohne Ton) aus dem Werbevideo
 * der Altseite – nur Bar-, Lounge- und Raumszenen. Das vollständige Video
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
