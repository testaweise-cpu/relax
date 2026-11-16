"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import { setScrollLock } from "@/lib/scroll-lock";
import { CloseIcon, MenuIcon, PhoneIcon } from "../ui/icons";
import { Logo } from "../ui/logo";
import { buttonClasses } from "../ui/button";
import { LanguageSwitch } from "./language-switch";
import { NAV_ITEMS } from "./nav-items";
import { isActive } from "./nav-links";

const ITEM = "flex max-h-20 min-h-9 flex-1";
const LINK =
  "w-full items-center border-b border-line font-display text-[clamp(1.3rem,4.4dvh,2.25rem)] leading-none font-medium no-underline";

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
        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-card border border-line text-ink hover:border-gold hover:text-gold"
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
            <Logo link={false} />
            <button
              type="button"
              onClick={close}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-card border border-line text-ink hover:border-gold hover:text-gold"
              autoFocus
            >
              <CloseIcon />
              <span className="sr-only">{t("closeMenu")}</span>
            </button>
          </div>

          {/* Die Einträge teilen sich die freie Höhe, die Schrift folgt der
              Bildschirmhöhe: das Menü passt ohne Scrollen auf den Bildschirm */}
          <nav
            aria-label={t("main")}
            className="container-page mt-1 flex flex-1 flex-col"
          >
            <ul className="flex flex-1 flex-col">
              <li className={ITEM}>
                <Link
                  href="/"
                  onClick={close}
                  aria-current={pathname === "/" ? "page" : undefined}
                  className={cn(
                    "flex",
                    LINK,
                    pathname === "/" ? "text-gold" : "text-ink",
                  )}
                >
                  {t("home")}
                </Link>
              </li>
              {NAV_ITEMS.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <li key={item.href} className={ITEM}>
                    <Link
                      href={item.href}
                      onClick={close}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex gap-3",
                        LINK,
                        active ? "text-gold" : "text-ink",
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

          <div className="container-page flex items-center gap-3 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <a
              href={phoneHref}
              className={buttonClasses({ size: "lg", className: "flex-1" })}
            >
              <PhoneIcon />
              {tc("call")}
            </a>
            <LanguageSwitch direction="up" />
          </div>
        </div>
      </dialog>
    </>
  );
}
