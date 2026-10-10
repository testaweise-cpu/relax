"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/cn";

/** Wechselt auf dieselbe Seite in der anderen Sprache. */
export function LanguageSwitch({ className }: { className?: string }) {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const other = locale === "de" ? "en" : "de";

  return (
    <Link
      href={pathname}
      locale={other}
      hrefLang={other}
      className={cn(
        "inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-line px-3 font-mono text-sm text-ink no-underline transition-colors hover:border-gold hover:text-gold",
        className,
      )}
    >
      <span className="sr-only">{t("switchTo")}</span>
      <span aria-hidden>{other.toUpperCase()}</span>
    </Link>
  );
}
