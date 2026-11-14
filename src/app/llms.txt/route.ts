import { getFaq, getPrices, getSettings, pick } from "@/lib/content";
import { SITE_URL } from "@/lib/site";

/**
 * /llms.txt – die wichtigsten Angaben zum Haus als Klartext (Markdown) für
 * KI-Suchen und Assistenten. Speist sich aus denselben Inhalten wie die
 * Seiten, bleibt also von selbst aktuell.
 */
export async function GET() {
  const [s, prices, general, priceFaq] = await Promise.all([
    getSettings(),
    getPrices(),
    getFaq("general"),
    getFaq("prices"),
  ]);
  const rows = prices.rows
    .filter((r) => r.minutes && r.priceEur)
    .map((r) => `- ${r.minutes} Minuten: ${r.priceEur} €`);
  const faq = [...general, ...priceFaq].map(
    (f) => `### ${pick(f.question, "de")}\n\n${pick(f.answer, "de")}`,
  );
  const body = [
    "# Mona Roses",
    "",
    "> Zimmervermietung mit Bar und Tabledance in Berlin-Steglitz. Rund um die Uhr geöffnet, an jedem Tag des Jahres.",
    "",
    "## Auf einen Blick",
    "",
    `- Adresse: ${s.street}, ${s.postalCode} ${s.city} (${s.district})`,
    `- Telefon: ${s.phone}`,
    s.email ? `- E-Mail: ${s.email}` : "",
    `- Öffnungszeiten: ${pick(s.openingHours, "de")}`,
    `- ${pick(s.foundedNote, "de")}`,
    "- Zutritt nur für Erwachsene ab 18 Jahren",
    "",
    "## Was Mona Roses ist",
    "",
    "Mona Roses vermietet Zimmer und Suiten an selbstständig arbeitende Mieterinnen und betreibt eine Bar mit Tabledance. Mona Roses bietet selbst keine sexuellen Dienstleistungen an und vermittelt sie nicht; Art, Umfang und Vergütung vereinbaren Gäste ausschließlich mit der jeweiligen Mieterin.",
    "",
    "## Zimmermiete",
    "",
    pick(prices.intro, "de"),
    "",
    ...rows,
    "",
    pick(prices.footnote, "de"),
    "",
    "## Seiten",
    "",
    `- [Jetzt da](${SITE_URL}/jetzt-da): wer gerade im Haus ist, laufend aktualisiert`,
    `- [Mieterinnen](${SITE_URL}/mieterinnen): alle Sedcards mit Sprachen, Zeiten und Services`,
    `- [Preise](${SITE_URL}/preise): Zimmermiete nach Dauer`,
    `- [Galerie](${SITE_URL}/galerie): Bar, Lounge und Zimmer`,
    `- [Events](${SITE_URL}/events)`,
    `- [Jobs](${SITE_URL}/jobs): Zimmer mieten als selbstständige Mieterin`,
    `- [Kontakt und Anfahrt](${SITE_URL}/kontakt)`,
    `- [English version](${SITE_URL}/en)`,
    "",
    faq.length ? "## Häufige Fragen" : "",
    "",
    ...faq.flatMap((f) => [f, ""]),
  ]
    .filter((line, i, all) => !(line === "" && all[i - 1] === ""))
    .join("\n");
  return new Response(body.trim() + "\n", {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
