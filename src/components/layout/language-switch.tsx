"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useId, useRef, useState } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { LOCALE_META, locales, toLocale } from "@/i18n/locales";
import { cn } from "@/lib/cn";

/**
 * Sprachwahl: Knopf mit dem Kürzel der aktuellen Sprache, darunter (bzw. im
 * mobilen Menü darüber) die zehn Sprachen in ihrer eigenen Schreibweise.
 * Jede Zeile führt auf dieselbe Seite in der gewählten Sprache.
 */
export function LanguageSwitch({
  className,
  direction = "down",
}: {
  className?: string;
  /** Richtung, in die die Liste aufklappt */
  direction?: "down" | "up";
}) {
  const t = useTranslations("nav");
  const locale = toLocale(useLocale());
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!box.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={box} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={listId}
        className="inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-card border border-line px-3 font-label text-sm text-ink transition-colors hover:border-gold hover:text-gold"
      >
        <span className="sr-only">
          {t("language")}: {LOCALE_META[locale].label}
        </span>
        <span aria-hidden>{locale.toUpperCase()}</span>
        <svg
          aria-hidden
          viewBox="0 0 10 6"
          width="9"
          height="6"
          className={cn("transition-transform", open && "rotate-180")}
        >
          <path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" />
        </svg>
      </button>
      {open && (
        <ul
          id={listId}
          className={cn(
            "lang-menu absolute right-0 z-50 w-52 overflow-hidden rounded-[var(--radius-lg)] border border-line bg-night-2 py-1.5 shadow-[0_24px_60px_-20px_rgb(0_0_0/0.9)]",
            direction === "up" ? "bottom-full mb-2" : "top-full mt-2",
          )}
        >
          {locales.map((l) => (
            <li key={l}>
              <Link
                href={pathname}
                locale={l}
                hrefLang={l}
                lang={l}
                onClick={() => setOpen(false)}
                aria-current={l === locale ? "true" : undefined}
                className={cn(
                  "flex min-h-11 items-center justify-between gap-3 px-4 text-sm no-underline transition-colors hover:bg-panel hover:text-gold",
                  l === locale ? "text-gold" : "text-ink",
                )}
              >
                <span translate="no">{LOCALE_META[l].label}</span>
                <span className="font-label text-[0.65rem] tracking-[0.2em] text-muted uppercase">
                  {l}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
