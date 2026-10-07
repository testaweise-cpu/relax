import { collection, config, fields, singleton } from "@keystatic/core";
import { richText, text } from "./src/keystatic/fields";

// Speicherort:
// - lokal (Standard): Änderungen landen direkt als Dateien in src/content.
// - github: Änderungen werden als Commits ins Repository geschrieben, das
//   Deployment (z. B. Coolify) baut danach neu. Siehe README.
const storage =
  process.env.NEXT_PUBLIC_KEYSTATIC_STORAGE === "github"
    ? ({
        kind: "github",
        repo: (process.env.NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO ??
          "owner/repo") as `${string}/${string}`,
      } as const)
    : ({ kind: "local" } as const);

export default config({
  storage,
  ui: {
    brand: { name: "Mona Roses" },
    navigation: {
      Allgemein: ["settings", "legalNotice"],
      Inhalte: ["prices", "faq", "events", "gallery"],
      Rechtstexte: ["imprint", "privacy"],
    },
  },
  singletons: {
    settings: singleton({
      label: "Kontakt & Öffnungszeiten",
      path: "src/content/settings",
      format: { data: "json" },
      schema: {
        phone: fields.text({
          label: "Telefon (Anzeige)",
          validation: { isRequired: true },
        }),
        phoneE164: fields.text({
          label: "Telefon für tel:-Links (+49…)",
          validation: { isRequired: true },
        }),
        email: fields.text({ label: "E-Mail (öffentlich)" }),
        street: fields.text({
          label: "Straße und Hausnummer",
          validation: { isRequired: true },
        }),
        postalCode: fields.text({
          label: "PLZ",
          validation: { isRequired: true },
        }),
        city: fields.text({ label: "Ort", validation: { isRequired: true } }),
        district: fields.text({ label: "Ortsteil" }),
        mapsUrl: fields.url({ label: "Link zu Google Maps" }),
        openingHours: text("Öffnungszeiten"),
        foundedNote: text("Seit … Jahren (Kurztext)"),
      },
    }),
    legalNotice: singleton({
      label: "Rechtlicher Hinweis",
      path: "src/content/legal-notice",
      format: { data: "json" },
      schema: {
        short: text("Kurzfassung (Footer, Kacheln)", { multiline: true }),
        long: text("Langfassung (Preise, Jobs)", { multiline: true }),
      },
    }),
    prices: singleton({
      label: "Zimmerpreise",
      path: "src/content/prices",
      format: { data: "json" },
      schema: {
        intro: text("Einleitung", { multiline: true }),
        rows: fields.array(
          fields.object({
            minutes: fields.integer({
              label: "Dauer (Minuten)",
              validation: { isRequired: true, min: 1 },
            }),
            priceEur: fields.number({
              label: "Preis (EUR)",
              validation: { isRequired: true, min: 0 },
            }),
          }),
          {
            label: "Preise",
            itemLabel: (p) => `${p.fields.minutes.value ?? "?"} Min`,
          },
        ),
        footnote: text("Hinweis unter der Tabelle", { multiline: true }),
      },
    }),
    imprint: singleton({
      label: "Impressum",
      path: "src/content/legal/imprint",
      format: { data: "json" },
      schema: { body: richText("Text") },
    }),
    privacy: singleton({
      label: "Datenschutzerklärung",
      path: "src/content/legal/privacy",
      format: { data: "json" },
      schema: { body: richText("Text") },
    }),
  },
  collections: {
    faq: collection({
      label: "FAQ",
      path: "src/content/faq/*",
      slugField: "key",
      format: { data: "json" },
      schema: {
        key: fields.slug({ name: { label: "Interner Name" } }),
        page: fields.select({
          label: "Seite",
          options: [
            { label: "Preise", value: "prices" },
            { label: "Jobs", value: "jobs" },
          ],
          defaultValue: "prices",
        }),
        order: fields.integer({ label: "Reihenfolge", defaultValue: 0 }),
        question: text("Frage"),
        answer: text("Antwort", { multiline: true }),
      },
    }),
    events: collection({
      label: "Events & News",
      path: "src/content/events/*",
      slugField: "slug",
      format: { data: "json" },
      schema: {
        slug: fields.slug({ name: { label: "URL-Name" } }),
        date: fields.date({ label: "Datum", validation: { isRequired: true } }),
        title: text("Titel"),
        body: text("Text", { multiline: true }),
        image: fields.image({
          label: "Bild (optional)",
          directory: "public/images/events",
          publicPath: "/images/events/",
        }),
      },
    }),
    gallery: collection({
      label: "Galerie",
      path: "src/content/gallery/*",
      slugField: "slug",
      format: { data: "json" },
      schema: {
        slug: fields.slug({ name: { label: "Interner Name" } }),
        order: fields.integer({ label: "Reihenfolge", defaultValue: 0 }),
        category: fields.select({
          label: "Bereich",
          options: [
            { label: "Zimmer & Suiten", value: "rooms" },
            { label: "Bar & Club", value: "club" },
          ],
          defaultValue: "rooms",
        }),
        image: fields.image({
          label: "Bild",
          directory: "public/images/gallery",
          publicPath: "/images/gallery/",
          validation: { isRequired: true },
        }),
        alt: text("Bildbeschreibung (Alt-Text)"),
      },
    }),
  },
});
