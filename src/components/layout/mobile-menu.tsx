"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import { setScrollLock } from "@/lib/scroll-lock";
import { CloseIcon, MenuIcon, PhoneIcon } from "../ui/icons";
import { NeonText } from "../ui/neon-text";
import { buttonClasses } from "../ui/button";
import { LanguageSwitch } from "./language-switch";
import { NAV_ITEMS } from "./nav-items";
import { isActive } from "./nav-links";

/**
 * Vollbild-Menü für das Handy. Nutzt <dialog> mit showModal(): Fokus bleibt im
 * Menü, Escape schließt, der Rest der Seite ist inert.
 */
export function MobileMenu({ phoneHref }: { phoneHref: string }) {
  const t = useTranslations("nav");
  const tc = useTranslations("common");
  const ref = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();

  // Nach einer Navigation schließen.
  useEffect(() => {
    ref.current?.close();
  }, [pathname]);

  const open = () => {
    ref.current?.showModal();
    setScrollLock(true);
  };
  const close = () => ref.current?.close();

  return (
    <>
      <button
        type="button"
        onClick={open}
        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-line text-ink hover:border-gold hover:text-gold"
        aria-haspopup="dialog"
      >
        <MenuIcon />
        <span className="sr-only">{t("openMenu")}</span>
      </button>

      <dialog
        ref={ref}
        onClose={() => {
          setScrollLock(false);
        }}
        aria-label={t("menu")}
        className="m-0 h-dvh max-h-none w-full max-w-none bg-night p-0 text-ink backdrop:bg-night/80 open:flex open:flex-col"
      >
        <div className="hero-sky flex flex-1 flex-col overflow-y-auto">
          <div className="container-page flex items-center justify-between py-3">
            <NeonText tilt className="text-[2rem]">
              Mona Roses
            </NeonText>
            <button
              type="button"
              onClick={close}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-line text-ink hover:border-gold hover:text-gold"
              autoFocus
            >
              <CloseIcon />
              <span className="sr-only">{t("closeMenu")}</span>
            </button>
          </div>

          <nav aria-label={t("main")} className="container-page mt-6 flex-1">
            <ul className="flex flex-col">
              <li>
                <Link
                  href="/"
                  onClick={close}
                  aria-current={pathname === "/" ? "page" : undefined}
                  className={cn(
                    "block border-b border-line py-3 font-display text-3xl font-extrabold tracking-[0.06em] uppercase no-underline",
                    pathname === "/" ? "text-red" : "text-ink",
                  )}
                >
                  {t("home")}
                </Link>
              </li>
              {NAV_ITEMS.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={close}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-3 border-b border-line py-3 font-display text-3xl font-extrabold tracking-[0.06em] uppercase no-underline",
                        active
                          ? "text-red [text-shadow:0_0_12px_var(--red)]"
                          : "text-ink",
                      )}
                    >
                      {item.key === "now" && (
                        <span className="live-dot" aria-hidden />
                      )}
                      {t(item.key)}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="container-page flex items-center gap-3 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
            <a
              href={phoneHref}
              className={buttonClasses({ size: "lg", className: "flex-1" })}
            >
              <PhoneIcon />
              {tc("call")}
            </a>
            <LanguageSwitch />
          </div>
        </div>
      </dialog>
    </>
  );
}
