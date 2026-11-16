/**
 * Hintergrundvideos von der Originalseite (ohne Ton, als Loop mit kurzer
 * Blende). Das Werbevideo liegt unter /media/mona-roses-werbevideo.mp4
 * (Galerie, Start per Klick).
 */

/**
 * Startseite: „Salon noir“ – Bar-Lounge in Samtrot und Gold, ohne Personen
 * (Higgsfield, 16.11.2026: Standbild gpt_image_2_6, Bewegung kling3_0 mit
 * gleichem Anfangs- und Endbild, daher nahtlose Schleife). 10 s, 1280 px,
 * H.264 ohne Ton (rund 0,35 MB) – spielt in allen Browsern.
 */
export const HERO_VIDEO = {
  poster: "/media/hero-salon-poster.webp",
  posterWidth: 1280,
  posterHeight: 720,
  // Hochformat: Ausschnitt auf Lounge, Rose und Kerzen statt der dunklen Mitte
  position: "20% 50%",
  sources: [{ src: "/media/hero-salon.mp4", type: "video/mp4" }],
} as const;

/**
 * Kopfbereich von Jetzt da: eine elegant tanzende Frau als
 * Silhouette vor einer roten LED-Wand, im Stil des früheren Stockvideos
 * (Higgsfield, 16.11.2026: gpt_image_2_6 + kling3_0, gleiches Anfangs- und
 * Endbild für die Schleife). 10 s, 1280 px, H.264 ohne Ton (rund 0,4 MB).
 */
export const PAGE_VIDEO = {
  poster: "/media/tanz-silhouette-poster.webp",
  posterWidth: 1280,
  posterHeight: 720,
  // Tänzerin rechts der Mitte; im flachen Kopf am Desktop Kopf und Arm zeigen
  position: "62% 22%",
  sources: [{ src: "/media/tanz-silhouette.mp4", type: "video/mp4" }],
} as const;

/** Events: Bühne mit Spot und Goldstaub, Champagner an der Bar (Higgsfield, 16.11.2026). */
export const EVENTS_VIDEO = {
  poster: "/media/events-buehne-poster.webp",
  posterWidth: 1280,
  posterHeight: 720,
  position: "65% 40%",
  sources: [{ src: "/media/events-buehne.mp4", type: "video/mp4" }],
} as const;

/** Jobs: gepflegte Suite mit Schminkspiegel und Stadtblick (Higgsfield, 16.11.2026). */
export const JOBS_VIDEO = {
  poster: "/media/jobs-suite-poster.webp",
  posterWidth: 1280,
  posterHeight: 720,
  position: "70% 50%",
  sources: [{ src: "/media/jobs-suite.mp4", type: "video/mp4" }],
} as const;

export type HeroMedia = {
  poster: string;
  posterWidth: number;
  posterHeight: number;
  /** Bildausschnitt (CSS object-position), Standard: Mitte */
  position?: string;
  sources: ReadonlyArray<{ src: string; type: string }>;
};
