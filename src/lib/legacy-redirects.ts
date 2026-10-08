import products from "../../redirects/products.json";

/**
 * Weiterleitungen von alten WordPress/WooCommerce-URLs (mona-roses.com, alt).
 * Rückgabe: Ziel + Statuscode, oder null (kein Altpfad).
 */
export type LegacyResult =
  { status: 301; location: string } | { status: 410 } | null;

const STATIC_301: Record<string, string> = {
  "/m/mieterinnen": "/mieterinnen",
  "/m/miet": "/mieterinnen",
  "/shop": "/mieterinnen",
  "/anwesenheit": "/jetzt-da",
  "/events-news": "/events",
  "/warenkorb": "/",
  "/kasse": "/",
  "/mein-konto": "/",
  "/dolls": "/",
  "/mona-roses": "/",
};

const productMap: Record<string, string> = (
  products as { map: Record<string, string> }
).map;

export function resolveLegacy(pathname: string): LegacyResult {
  // WordPress nutzte abschließende Schrägstriche: /anwesenheit/ = /anwesenheit
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;

  // Feeds und WordPress-Interna gibt es nicht mehr
  if (
    path === "/feed" ||
    path.startsWith("/feed/") ||
    /^\/wp-/.test(path) ||
    /\/feed$/.test(path)
  ) {
    return { status: 410 };
  }

  if (path.startsWith("/product/")) {
    const slug = decodeURIComponent(
      path.slice("/product/".length).split("/")[0] ?? "",
    );
    const target = productMap[slug];
    return {
      status: 301,
      location: target ? `/mieterinnen/${target}` : "/mieterinnen",
    };
  }
  if (path === "/product-category" || path.startsWith("/product-category/")) {
    return { status: 301, location: "/mieterinnen" };
  }

  const target = STATIC_301[path];
  if (target) return { status: 301, location: target };

  // Übrige Altadressen mit Schrägstrich am Ende → ohne Schrägstrich (z. B. /preise/)
  if (pathname !== path) return { status: 301, location: path };

  return null;
}
