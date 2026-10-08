/**
 * Altersabfrage – zentral gekapselt, damit sie später gegen eine strengere
 * Lösung (z. B. ein anerkanntes Altersverifikationssystem) austauschbar ist.
 *
 * TODO(Recht): Rechtliche Prüfung nach JMStV steht aus. Ein einfaches
 * "Ich bin 18"-Overlay ist für Telemedien mit pornografischen Inhalten NICHT
 * ausreichend (geschlossene Benutzergruppe nötig). Ob die Inhalte dieser Seite
 * darunter fallen oder "nur" entwicklungsbeeinträchtigend sind, muss geprüft werden.
 */
export const AGE_GATE = {
  /** Mindestalter, das bestätigt wird */
  minAge: 18,
  /** Technisch notwendiges Cookie (siehe Datenschutzerklärung) */
  cookieName: "age_ok",
  cookieValue: "1",
  maxAgeDays: 30,
  /** Seiten, die ohne Bestätigung erreichbar bleiben müssen */
  exemptPaths: ["/impressum", "/datenschutz"],
  /** Ziel für "Verlassen" */
  leaveUrl: "https://www.google.com/",
} as const;

export const AGE_COOKIE_MAX_AGE = AGE_GATE.maxAgeDays * 24 * 60 * 60;

export function isExemptPath(pathname: string) {
  // pathname ohne Sprachpräfix (next-intl usePathname)
  return AGE_GATE.exemptPaths.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

/**
 * Inline-Skript für <head>: setzt vor dem ersten Malen die Klasse "age-ok",
 * wenn das Cookie existiert – so blitzt das Overlay nicht kurz auf.
 */
export const AGE_GATE_HEAD_SCRIPT = `try{if(document.cookie.split("; ").indexOf("${AGE_GATE.cookieName}=${AGE_GATE.cookieValue}")>-1)document.documentElement.classList.add("age-ok")}catch(e){}`;

/** Im Browser: Ist die Altersbestätigung als Cookie gesetzt? (einzige Quelle der Wahrheit) */
export function hasAgeConsent(cookie: string) {
  return cookie
    .split("; ")
    .includes(`${AGE_GATE.cookieName}=${AGE_GATE.cookieValue}`);
}
