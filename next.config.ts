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
    // ANNAHME: VyceON liefert Bilder von einer eigenen Domain; wird in Phase 3 ergänzt.
    remotePatterns: [],
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
