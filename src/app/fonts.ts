import { Cormorant_Garamond, Jost, Mr_Dafoe } from "next/font/google";

// next/font lädt die Schriften beim Build herunter und liefert sie selbst aus:
// Im Browser entstehen keine Requests zu Google.

/** Neon-Schreibschrift – nur für das Logo. */
export const fontScript = Mr_Dafoe({
  weight: "400",
  subsets: ["latin"],
  variable: "--nf-script",
  display: "swap",
});

/**
 * Überschriften, Namen, Preise: klassische Antiqua mit hohem Kontrast –
 * wirkt hochwertig, auch kursiv. Variable Schrift (300–700).
 */
export const fontDisplay = Cormorant_Garamond({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--nf-display",
  display: "swap",
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
  fontScript.variable,
  fontDisplay.variable,
  fontSans.variable,
].join(" ");
