import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Eigenbetrieb per Docker (z. B. Hetzner + Coolify), nicht Vercel/Netlify.
  output: "standalone",
  // Keystatic-Inhalte werden zur Laufzeit gelesen und müssen ins Image.
  outputFileTracingIncludes: { "/**/*": ["./src/content/**/*"] },
  poweredByHeader: false,
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
