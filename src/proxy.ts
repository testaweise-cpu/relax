import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { resolveLegacy } from "./lib/legacy-redirects";

// Next.js 16: "proxy" ersetzt die frühere "middleware"-Konvention.
const intl = createMiddleware(routing);

export default function proxy(request: NextRequest) {
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
  // Alles außer API, Keystatic-Admin, Next-Interna und Dateien mit Endung –
  // plus alte WordPress-Pfade mit Endung (wp-login.php, Uploads).
  matcher: ["/((?!api|keystatic|_next|_vercel|.*\\..*).*)", "/(wp-.*)"],
};
