import { getLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { getLegalNotice, pick } from "@/lib/content";
import { cn } from "@/lib/cn";

/**
 * Rechtlicher Hinweis: Mona Roses bietet selbst keine sexuellen
 * Dienstleistungen an. Der Text wird ausschließlich in Keystatic gepflegt
 * ("Rechtlicher Hinweis") und überall über diese Komponente eingebunden.
 */
export async function LegalNotice({
  variant = "short",
  className,
}: {
  variant?: "short" | "long";
  className?: string;
}) {
  const locale = (await getLocale()) as Locale;
  const notice = await getLegalNotice();
  const text = pick(notice[variant], locale);

  return (
    <p
      className={cn(
        variant === "long"
          ? "rounded-card border-l border-gold/50 bg-panel/60 py-4 pr-4 pl-5 text-sm leading-relaxed text-ink/90 sm:py-5 sm:pr-5 sm:pl-6"
          : "text-sm text-muted",
        className,
      )}
    >
      {text}
    </p>
  );
}
