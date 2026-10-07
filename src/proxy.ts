import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Next.js 16: "proxy" ersetzt die frühere "middleware"-Konvention.
// Weiterleitungen alter WordPress-URLs folgen in Phase 7.
export default createMiddleware(routing);

export const config = {
  // Alles außer API, Keystatic-Admin, Next-Interna und Dateien mit Endung.
  matcher: ["/((?!api|keystatic|_next|_vercel|.*\\..*).*)"],
};
