/**
 * Client-IP hinter einem Reverse-Proxy (Coolify/Traefik).
 * Der Proxy HÄNGT die echte Adresse an X-Forwarded-For an; alles davor kann der
 * Besucher selbst mitschicken. Deshalb zählt der letzte Eintrag.
 */
export function clientIpFrom(
  get: (name: string) => string | null,
  trustProxy: boolean,
): string {
  if (trustProxy) {
    const chain = get("x-forwarded-for")
      ?.split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (chain?.length) return chain[chain.length - 1];
    const real = get("x-real-ip")?.trim();
    if (real) return real;
  }
  return "unknown";
}
