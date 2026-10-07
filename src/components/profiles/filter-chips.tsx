import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import { languageName, regionName } from "@/lib/display-names";
import {
  filtersToQuery,
  hasActiveFilters,
  toggle,
  type ProfileFilters,
} from "@/lib/profiles/cards";

function Chip({
  href,
  active,
  children,
  activeLabel,
  tone = "pink",
}: {
  href: { pathname: "/mieterinnen"; query: Record<string, string> };
  active: boolean;
  children: ReactNode;
  activeLabel: string;
  tone?: "pink" | "cyan";
}) {
  return (
    <Link
      href={href}
      scroll={false}
      className={cn(
        "inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-4 font-mono text-sm whitespace-nowrap no-underline transition-colors",
        active
          ? tone === "cyan"
            ? "border-cyan bg-cyan/15 text-cyan"
            : "border-pink bg-pink/15 text-pink"
          : "border-line bg-panel text-ink hover:border-cyan",
      )}
    >
      {children}
      {active && <span className="sr-only">({activeLabel})</span>}
    </Link>
  );
}

export async function FilterChips({
  filters,
  options,
  locale,
}: {
  filters: ProfileFilters;
  options: {
    languages: [string, number][];
    origins: [string, number][];
    live: number;
    isNew: number;
  };
  locale: string;
}) {
  const t = await getTranslations("profiles");
  const href = (next: Partial<ProfileFilters>) => ({
    pathname: "/mieterinnen" as const,
    query: filtersToQuery({ ...filters, ...next }),
  });
  const active = t("active");

  return (
    <div className="space-y-4" role="group" aria-label={t("filters")}>
      <div className="flex flex-wrap gap-2">
        <Chip
          href={href({ now: !filters.now })}
          active={filters.now}
          activeLabel={active}
          tone="cyan"
        >
          <span className="live-dot" aria-hidden />
          {t("onlyNow")} <span className="text-muted">{options.live}</span>
        </Chip>
        <Chip
          href={href({ isNew: !filters.isNew })}
          active={filters.isNew}
          activeLabel={active}
        >
          {t("onlyNew")} <span className="text-muted">{options.isNew}</span>
        </Chip>
      </div>

      <fieldset className="min-w-0">
        <legend className="eyebrow mb-2">{t("language")}</legend>
        <div className="-mx-4 flex [scrollbar-width:none] gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          {options.languages.map(([code, n]) => (
            <Chip
              key={code}
              href={href({ languages: toggle(filters.languages, code) })}
              active={filters.languages.includes(code)}
              activeLabel={active}
            >
              {languageName(code, locale)}{" "}
              <span className="text-muted">{n}</span>
            </Chip>
          ))}
        </div>
      </fieldset>

      <fieldset className="min-w-0">
        <legend className="eyebrow mb-2">{t("origin")}</legend>
        <div className="-mx-4 flex [scrollbar-width:none] gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          {options.origins.map(([code, n]) => (
            <Chip
              key={code}
              href={href({ origins: toggle(filters.origins, code) })}
              active={filters.origins.includes(code)}
              activeLabel={active}
            >
              {regionName(code, locale)} <span className="text-muted">{n}</span>
            </Chip>
          ))}
        </div>
      </fieldset>

      {hasActiveFilters(filters) && (
        <Link
          href="/mieterinnen"
          scroll={false}
          className="inline-block font-mono text-sm"
        >
          {t("reset")}
        </Link>
      )}
    </div>
  );
}
