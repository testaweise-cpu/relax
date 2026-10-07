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
                "inline-flex min-h-11 items-center rounded-full px-3 font-display text-[0.95rem] font-semibold tracking-[0.12em] uppercase no-underline transition-colors",
                active
                  ? "text-pink [text-shadow:0_0_10px_var(--pink)]"
                  : "text-ink hover:text-cyan",
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
