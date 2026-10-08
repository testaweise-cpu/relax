/** Hauptseiten für Smoke- und Barrierefreiheitstests (DE ohne Präfix). */
export const MAIN_PAGES = [
  "/",
  "/jetzt-da",
  "/mieterinnen",
  "/mieterinnen/aurora",
  "/preise",
  "/galerie",
  "/events",
  "/jobs",
  "/kontakt",
  "/impressum",
  "/datenschutz",
] as const;

export const en = (path: string) => (path === "/" ? "/en" : `/en${path}`);
