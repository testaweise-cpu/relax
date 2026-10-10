"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import { NAV_ITEMS } from "./nav-items";

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Desktop-Navigation (ab lg). */
export function NavLinks() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  return (
    <ul className="flex items-center gap-1">
      {NAV_ITEMS.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative inline-flex min-h-11 items-center px-3 font-label text-[0.7rem] font-medium tracking-[0.28em] uppercase no-underline transition-colors",
                // aktive Seite: Gold mit feiner Linie darunter
                active
                  ? "text-gold after:absolute after:inset-x-3 after:bottom-2 after:h-px after:bg-gold/60"
                  : "text-ink/80 hover:text-ink",
              )}
            >
              {item.key === "now" && (
                <span className="live-dot mr-2" aria-hidden />
              )}
              {t(item.key)}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export { isActive };
