import { Cormorant_Garamond, Jost } from "next/font/google";

// next/font lädt die Schriften beim Build herunter und liefert sie selbst aus:
// Im Browser entstehen keine Requests zu Google.

/**
 * Überschriften, Namen, Preise: klassische Antiqua mit hohem Kontrast –
 * wirkt hochwertig, auch kursiv. Variable Schrift (300–700).
 * Nur der aufrechte Schnitt wird vorab geladen; die Kursive kommt nach,
 * sobald sie gebraucht wird (sie steht nirgends im ersten Bildschirm).
 */
export const fontDisplay = Cormorant_Garamond({
  subsets: ["latin"],
  style: ["normal"],
  variable: "--nf-display",
  display: "swap",
  fallback: ["Georgia", "serif"],
});

export const fontDisplayItalic = Cormorant_Garamond({
  subsets: ["latin"],
  style: ["italic"],
  variable: "--nf-display-italic",
  display: "swap",
  preload: false,
  fallback: ["Georgia", "serif"],
});

/**
 * Fließtext und Labels: geometrische Grotesk im Art-déco-Geist.
 * Variable Schrift; Labels als Versalien mit weiter Laufweite.
 */
export const fontSans = Jost({
  subsets: ["latin"],
  variable: "--nf-sans",
  display: "swap",
});

export const fontVariables = [
  fontDisplay.variable,
  fontDisplayItalic.variable,
  fontSans.variable,
].join(" ");
