// Lighthouse (mobil, Erstbesuch) für die Hauptseiten – Ergebnis als Tabelle.
//
//   pnpm lighthouse                       # gegen http://localhost:3000
//   pnpm lighthouse https://mona-roses.com
//
// Chrome/Chromium wird über CHROME_PATH gefunden, falls nicht im Standardpfad.
// Hinweis: Canonical/hreflang zeigen auf NEXT_PUBLIC_SITE_URL. Lokal also mit
// passender NEXT_PUBLIC_SITE_URL bauen, sonst meldet der SEO-Teil Fehler.
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const base = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "");
const pages = [
  "/",
  "/jetzt-da",
  "/mieterinnen",
  "/preise",
  "/galerie",
  "/jobs",
  "/kontakt",
  "/en",
];
const dir = mkdtempSync(join(tmpdir(), "lh-"));
const pct = (c) => String(Math.round(c.score * 100)).padStart(3);

console.log("Seite                 Perf A11y  BP  SEO   LCP     CLS    TBT");
try {
  for (const path of pages) {
    const out = join(dir, "report.json");
    execFileSync(
      "pnpm",
      [
        "exec",
        "lighthouse",
        base + path,
        "--quiet",
        "--output=json",
        `--output-path=${out}`,
        "--chrome-flags=--headless=new --no-sandbox",
      ],
      { stdio: "ignore" },
    );
    const { categories: c, audits: a } = JSON.parse(readFileSync(out, "utf8"));
    console.log(
      path.padEnd(20),
      pct(c.performance),
      pct(c.accessibility),
      pct(c["best-practices"]),
      pct(c.seo),
      " ",
      a["largest-contentful-paint"].displayValue.padEnd(7),
      a["cumulative-layout-shift"].displayValue.padEnd(6),
      a["total-blocking-time"].displayValue,
    );
  }
} finally {
  rmSync(dir, { recursive: true, force: true });
}
