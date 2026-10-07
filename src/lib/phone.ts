/** tel:-Link aus einer Nummer im E.164-Format (Leerzeichen werden entfernt). */
export function telHref(e164: string) {
  return `tel:${e164.replace(/[^\d+]/g, "")}`;
}
