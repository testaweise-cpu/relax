import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Eigenbetrieb per Docker (z. B. Hetzner + Coolify), nicht Vercel/Netlify.
  output: "standalone",
  // Keystatic-Inhalte werden zur Laufzeit gelesen und müssen ins Image.
  outputFileTracingIncludes: {
    "/**/*": ["./src/content/**/*", "./src/assets/**/*"],
  },
  poweredByHeader: false,
  // Schrägstriche am Ende behandelt src/proxy.ts (einmalige 301 statt 308-Kette)
  skipTrailingSlashRedirect: true,
  reactStrictMode: true,
  // Bewusst das klassische Caching-Modell (fetch + Cache-Tags + revalidate),
  // siehe Datenschicht in src/lib/data.
  cacheComponents: false,
  images: {
    formats: ["image/avif", "image/webp"],
    // VYCE69 liefert Profilbilder unter https://<host>/api/img?key=…
    // (Build-Zeit-Variable; bei `next start` auch zur Laufzeit setzen).
    remotePatterns: process.env.VYCEON_IMAGE_HOST
      ? [
          {
            protocol: "https",
            hostname: process.env.VYCEON_IMAGE_HOST,
            pathname: "/api/img",
          },
        ]
      : [],
  },
  experimental: {
    // Der Build-Cache übernahm neue Klassen aus dem Tailwind-Loader nicht
    // zuverlässig (veraltetes CSS). Docker-Builds starten ohnehin kalt.
    turbopackFileSystemCacheForBuild: false,
    // Bewerbungen mit bis zu 3 Fotos à 8 MB
    serverActions: { bodySizeLimit: "26mb" },
    proxyClientMaxBodySize: "26mb",
  },
  async headers() {
    const security = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-Frame-Options", value: "DENY" },
      {
        key: "Permissions-Policy",
        value:
          "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
      },
      // Wirkt nur über HTTPS (Coolify/Traefik terminiert TLS)
      {
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains",
      },
    ];
    // Content-Security-Policy: Die Seite lädt nichts von fremden Servern –
    // die Regel erzwingt das technisch. Inline-Skripte bleiben erlaubt, weil
    // Next.js seine Startdaten inline ausliefert (Nonces würden jede Seite
    // dynamisch machen). Nur in Produktion; die Redaktion (/keystatic) ist
    // ausgenommen.
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self'",
      "media-src 'self'",
      "connect-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join("; ");
    // Bilder/Videos aus /public: einen Tag frisch, eine Woche "stale" erlaubt
    const media = [
      {
        key: "Cache-Control",
        value: "public, max-age=86400, stale-while-revalidate=604800",
      },
    ];
    // Logo, Muster und Videos ändern sich praktisch nie: 30 Tage
    const longLived = [
      {
        key: "Cache-Control",
        value: "public, max-age=2592000, stale-while-revalidate=604800",
      },
    ];
    return [
      { source: "/:path*", headers: security },
      ...(process.env.NODE_ENV === "production"
        ? [
            {
              source: "/((?!keystatic|api/keystatic).*)",
              headers: [{ key: "Content-Security-Policy", value: csp }],
            },
          ]
        : []),
      { source: "/media/:path*", headers: longLived },
      { source: "/logo/:path*", headers: longLived },
      { source: "/pattern/:path*", headers: longLived },
      { source: "/images/:path*", headers: media },
      { source: "/mock/:path*", headers: media },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default withNextIntl(nextConfig);
