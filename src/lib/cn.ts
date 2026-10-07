/** Verbindet Klassennamen und lässt leere Werte weg. */
export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}
