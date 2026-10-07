/**
 * Einfaches Rate-Limit im Arbeitsspeicher (gleitendes Fenster).
 * Reicht für eine einzelne Server-Instanz; IPs werden nach Ablauf verworfen.
 */
export function createRateLimiter({
  limit,
  windowMs,
}: {
  limit: number;
  windowMs: number;
}) {
  const hits = new Map<string, number[]>();
  return {
    /** true = erlaubt (und gezählt), false = Limit erreicht */
    check(key: string, now = Date.now()): boolean {
      const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
      if (recent.length >= limit) {
        hits.set(key, recent);
        return false;
      }
      recent.push(now);
      hits.set(key, recent);
      // Aufräumen, damit die Map nicht wächst
      if (hits.size > 5000) {
        for (const [k, v] of hits)
          if (v.every((t) => now - t >= windowMs)) hits.delete(k);
      }
      return true;
    },
  };
}
