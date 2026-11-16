import { connection } from "next/server";
import { getEvents, getFaq, getPrices, getSettings, pick } from "@/lib/content";
import { getDataSource } from "@/lib/data";
import { languageName } from "@/lib/display-names";
import { berlinDayKey } from "@/lib/time/berlin";
import { SITE_URL } from "@/lib/site";

/**
 * /llms.txt – die wichtigsten Angaben zum Haus als Klartext (Markdown) für
 * KI-Suchen und Assistenten. Speist sich aus denselben Inhalten wie die
 * Seiten, bleibt also von selbst aktuell.
 */
export async function GET() {
  // Pro Abruf: Zahl der Sedcards und Anwesenden kommen aus der Datenquelle
  await connection();
  const ds = getDataSource();
  const [s, prices, general, priceFaq, events, profiles, presence] =
    await Promise.all([
      getSettings(),
      getPrices(),
      getFaq("general"),
      getFaq("prices"),
      getEvents(),
      ds.listProfiles().catch(() => []),
      ds.getPresence().catch(() => []),
    ]);
  const today = berlinDayKey(new Date());
  const upcoming = events
    .filter((e) => e.date >= today)
    .reverse()
    .map(
      (e) =>
        `- ${e.date}${pick(e.time, "de") ? `, ${pick(e.time, "de")}` : ""}: ${pick(e.title, "de")} – ${pick(e.body, "de")}`,
    );
  // Sprachen, die im Haus gesprochen werden (häufigste zuerst)
  const langCount = new Map<string, number>();
  for (const p of profiles)
    for (const code of p.languages)
      langCount.set(code, (langCount.get(code) ?? 0) + 1);
  const langs = [...langCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([code]) => languageName(code, "de"));
  const cheapest = prices.rows
    .filter((r) => r.minutes && r.priceEur)
    .sort((a, b) => (a.priceEur ?? 0) - (b.priceEur ?? 0))[0];
  const rows = prices.rows
    .filter((r) => r.minutes && r.priceEur)
    .map((r) => `- ${r.minutes} Minuten: ${r.priceEur} €`);
  const faq = [...general, ...priceFaq].map(
    (f) => `### ${pick(f.question, "de")}\n\n${pick(f.answer, "de")}`,
  );
  const body = [
    "# Mona Roses",
    "",
    "> Bordell in Berlin-Steglitz seit 1993: Zimmervermietung mit Bar und Tabledance. Rund um die Uhr geöffnet, an jedem Tag des Jahres.",
    "",
    "## Auf einen Blick",
    "",
    `- Adresse: ${s.street}, ${s.postalCode} ${s.city} (${s.district})`,
    `- Telefon: ${s.phone}`,
    s.email ? `- E-Mail: ${s.email}` : "",
    `- Öffnungszeiten: ${pick(s.openingHours, "de")}`,
    `- ${pick(s.foundedNote, "de")}`,
    "- Zutritt nur für Erwachsene ab 18 Jahren",
    cheapest
      ? `- Zimmermiete ab ${cheapest.priceEur} € für ${cheapest.minutes} Minuten`
      : "",
    profiles.length ? `- Mieterinnen mit Sedcard: ${profiles.length}` : "",
    profiles.length
      ? `- Gerade im Haus: ${presence.length} (Stand ${new Intl.DateTimeFormat(
          "de-DE",
          { dateStyle: "long", timeStyle: "short", timeZone: "Europe/Berlin" },
        ).format(new Date())} Uhr, ändert sich laufend)`
      : "",
    langs.length ? `- Sprachen im Haus: ${langs.join(", ")}` : "",
    "",
    "## Anfahrt",
    "",
    pick(s.directions, "de"),
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
    upcoming.length ? "## Kommende Events" : "",
    "",
    ...upcoming,
    "",
    profiles.length ? "## Mieterinnen (Sedcards)" : "",
    "",
    // Nur, was auf den Sedcards ohnehin öffentlich steht: Name, Sprachen, Adresse
    ...[...profiles]
      .sort((a, b) => a.name.localeCompare(b.name, "de"))
      .map((p) => {
        const live = presence.some((x) => x.profileId === p.id);
        const langList = p.languages.map((c) => languageName(c, "de"));
        return `- [${p.name}](${SITE_URL}/mieterinnen/${p.slug})${langList.length ? ` – spricht ${langList.join(", ")}` : ""}${live ? " – gerade im Haus" : ""}`;
      }),
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
    "## In English",
    "",
    `Mona Roses is a brothel (room rental with a bar and table dancing) at ${s.street}, ${s.postalCode} ${s.city}-${s.district}, Germany. ${pick(s.openingHours, "en")}. Adults aged 18 and over only. Phone: ${s.phone}.`,
    "",
    "Mona Roses rents rooms and suites to self-employed tenants and runs a bar with table dancing. Mona Roses does not offer or arrange sexual services itself; guests agree on type, scope and payment solely with the respective tenant.",
    "",
    cheapest
      ? `Room rent starts at €${cheapest.priceEur} for ${cheapest.minutes} minutes; the prices cover the room rent only.`
      : "",
    "",
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
