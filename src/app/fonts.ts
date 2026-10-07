import {
  Big_Shoulders,
  IBM_Plex_Mono,
  IBM_Plex_Sans,
  Mr_Dafoe,
} from "next/font/google";

// next/font lädt die Schriften beim Build herunter und liefert sie selbst aus:
// Im Browser entstehen keine Requests zu Google.

/** Neon-Schreibschrift für Logo und Namen auf Sedcards – sparsam einsetzen. */
export const fontScript = Mr_Dafoe({
  weight: "400",
  subsets: ["latin"],
  variable: "--nf-script",
  display: "swap",
});

/**
 * Überschriften. Google führt "Big Shoulders Display" inzwischen als
 * "Big Shoulders" mit optischer Größenachse (opsz); bei großen Größen ergibt
 * das automatisch den Display-Schnitt. Genutzt werden 600 und 800.
 */
export const fontDisplay = Big_Shoulders({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--nf-display",
  display: "swap",
});

/** Fließtext. */
export const fontSans = IBM_Plex_Sans({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--nf-sans",
  display: "swap",
});

/** Labels, Zeiten, Badges. */
export const fontMono = IBM_Plex_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--nf-mono",
  display: "swap",
});

export const fontVariables = [
  fontScript.variable,
  fontDisplay.variable,
  fontSans.variable,
  fontMono.variable,
].join(" ");
