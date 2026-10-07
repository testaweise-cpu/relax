/** Sprach- und Ländernamen aus ISO-Codes, lokalisiert über Intl. */
const cache = new Map<string, Intl.DisplayNames>();

function names(locale: string, type: "language" | "region") {
  const key = `${locale}:${type}`;
  let dn = cache.get(key);
  if (!dn) {
    dn = new Intl.DisplayNames([locale], { type, fallback: "code" });
    cache.set(key, dn);
  }
  return dn;
}

export function languageName(code: string, locale: string) {
  try {
    return names(locale, "language").of(code.toLowerCase()) ?? code;
  } catch {
    return code;
  }
}

export function regionName(code: string, locale: string) {
  try {
    return names(locale, "region").of(code.toUpperCase()) ?? code;
  } catch {
    return code;
  }
}
