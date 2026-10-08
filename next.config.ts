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
    // ANNAHME: VyceON liefert Profilbilder von einer eigenen Domain (Build-Zeit-Variable).
    remotePatterns: process.env.VYCEON_IMAGE_HOST
      ? [{ protocol: "https", hostname: process.env.VYCEON_IMAGE_HOST }]
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
    // Bilder/Videos aus /public: einen Tag frisch, eine Woche "stale" erlaubt
    const media = [
      {
        key: "Cache-Control",
        value: "public, max-age=86400, stale-while-revalidate=604800",
      },
    ];
    return [
      { source: "/:path*", headers: security },
      { source: "/media/:path*", headers: media },
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
