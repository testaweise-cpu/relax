import type { AbstractIntlMessages } from "next-intl";

/**
 * Namensräume, die Client-Komponenten über den useTranslations-Hook brauchen.
 * Nur diese Texte gehen an den Browser – der Rest wird serverseitig gerendert
 * und bläht sonst jede Seite um einige KB auf.
 * Ein Test (client-messages.test.ts) prüft, dass die Liste vollständig ist.
 */
export const CLIENT_NAMESPACES = [
  "ageGate",
  "common",
  "jobs",
  "nav",
  "now",
  "profile",
  "sedcard",
] as const;

export function clientMessages(
  messages: AbstractIntlMessages,
): AbstractIntlMessages {
  return Object.fromEntries(
    CLIENT_NAMESPACES.filter((ns) => ns in messages).map((ns) => [
      ns,
      messages[ns],
    ]),
  );
}
