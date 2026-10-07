/** Hauptnavigation – Reihenfolge = Wichtigkeit für mobile Besucher. */
export const NAV_ITEMS = [
  { href: "/jetzt-da", key: "now" },
  { href: "/mieterinnen", key: "profiles" },
  { href: "/preise", key: "prices" },
  { href: "/galerie", key: "gallery" },
  { href: "/events", key: "events" },
  { href: "/jobs", key: "jobs" },
  { href: "/kontakt", key: "contact" },
] as const;

export type NavKey = (typeof NAV_ITEMS)[number]["key"];
