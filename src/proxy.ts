import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { resolveLegacy } from "./lib/legacy-redirects";
import { isPreviewAuthorized, PREVIEW_REALM } from "./lib/preview-auth";

// Next.js 16: "proxy" ersetzt die frühere "middleware"-Konvention.
const intl = createMiddleware(routing);

// Pfade, die Weiterleitungen und Sprachrouting durchlaufen: alles außer API,
// Keystatic-Admin, Next-Interna und Dateien mit Endung – plus alte
// WordPress-Pfade mit Endung (wp-login.php, Uploads).
// apple-icon: Metadaten-Route ohne Dateiendung, darf nicht ins Sprach-Routing
const ROUTED = /^\/(?!api|keystatic|_next|_vercel|apple-icon|.*\..*).*$/;
const LEGACY_WP = /^\/wp-/;

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 0. Vorschau-Passwort (nur wenn PREVIEW_PASSWORD gesetzt ist): schützt die
  //    ganze Seite samt Bildern und API. /api/health bleibt für den
  //    Healthcheck des Servers offen.
  const password = process.env.PREVIEW_PASSWORD;
  if (password && pathname !== "/api/health") {
    const user = process.env.PREVIEW_USER || "mona";
    if (
      !isPreviewAuthorized(request.headers.get("authorization"), user, password)
    ) {
      return new NextResponse("Anmeldung erforderlich", {
        status: 401,
        headers: {
          "WWW-Authenticate": `Basic realm="${PREVIEW_REALM}", charset="UTF-8"`,
          "X-Robots-Tag": "noindex",
          "Cache-Control": "no-store",
        },
      });
    }
  }
  if (!ROUTED.test(pathname) && !LEGACY_WP.test(pathname))
    return NextResponse.next();

  // 1. Alte WordPress-URLs: 301 bzw. 410
  const legacy = resolveLegacy(request.nextUrl.pathname);
  if (legacy?.status === 410) {
    return new NextResponse("Gone", {
      status: 410,
      headers: { "X-Robots-Tag": "noindex" },
    });
  }
  if (legacy?.status === 301) {
    // Frische URL (NextURL würde den Schrägstrich am Ende wieder anhängen)
    return NextResponse.redirect(new URL(legacy.location, request.url), 301);
  }
  // 2. Sprachrouting (DE ohne Präfix, EN unter /en)
  return intl(request);
}

export const config = {
  // Läuft für alles außer den statischen Next-Dateien (JS, CSS, Schriften);
  // welche Pfade ins Sprachrouting gehen, entscheidet ROUTED oben.
  matcher: ["/((?!_next/static).*)"],
};
