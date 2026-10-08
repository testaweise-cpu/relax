import { fields } from "@keystatic/core";

// Hilfsfunktionen für zweisprachige Felder: DE ist Pflicht, EN optional –
// fehlt EN, zeigt die englische Seite den deutschen Text.

export const text = (label: string, opts: { multiline?: boolean } = {}) =>
  fields.object(
    {
      de: fields.text({
        label: `${label} (DE)`,
        multiline: opts.multiline,
        validation: { isRequired: true },
      }),
      en: fields.text({ label: `${label} (EN)`, multiline: opts.multiline }),
    },
    { label, layout: [6, 6] },
  );

export const richText = (label: string) =>
  fields.object(
    {
      de: fields.markdoc.inline({ label: `${label} (DE)` }),
      en: fields.markdoc.inline({ label: `${label} (EN)` }),
    },
    { label },
  );

/** Optionaler zweisprachiger Kurztext (z. B. Uhrzeit eines Events). */
export const optionalText = (label: string) =>
  fields.object(
    {
      de: fields.text({ label: `${label} (DE)` }),
      en: fields.text({ label: `${label} (EN)` }),
    },
    { label, layout: [6, 6] },
  );
