import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

const DISALLOW = ["/api/", "/keystatic", "/styleguide", "/en/styleguide"];

// Crawler von KI-Suchen und -Assistenten: ausdrücklich zugelassen, damit das
// Haus dort mit korrekten Angaben (Adresse, Zeiten, Preise) gefunden wird.
const AI_AGENTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "Bingbot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: DISALLOW },
      { userAgent: AI_AGENTS, allow: "/", disallow: DISALLOW },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
