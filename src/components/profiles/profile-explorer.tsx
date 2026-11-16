"use client";

import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  useMemo,
  useRef,
  useState,
  useTransition,
  ViewTransition,
  type MouseEvent,
  type ReactNode,
} from "react";
import { CloseIcon, FilterIcon, SearchIcon } from "@/components/ui/icons";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import { languageName, regionName } from "@/lib/display-names";
import {
  applyFilters,
  EMPTY_FILTERS,
  FILTER_PARAMS,
  filterOptions,
  filtersToQuery,
  hasActiveFilters,
  SORTS,
  toggle,
  type ExplorerCard,
  type ProfileFilters,
  type Sort,
} from "@/lib/profiles/explore";
import { ProfileGrid } from "./profile-grid";

/** So viele Services sind ohne „Alle anzeigen“ sichtbar */
const TOP_SERVICES = 10;

function isPlainClick(e: MouseEvent) {
  return !(e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0);
}

type ChipHref = { pathname: "/mieterinnen"; query: Record<string, string> };

function Chip({
  href,
  onSelect,
  active,
  children,
  tone = "gold",
  activeLabel,
}: {
  activeLabel: string;
  href: ChipHref;
  onSelect: () => void;
  active: boolean;
  children: ReactNode;
  tone?: "gold" | "mint";
}) {
  return (
    <Link
      href={href}
      scroll={false}
      onClick={(e) => {
        if (!isPlainClick(e)) return;
        e.preventDefault();
        onSelect();
      }}
      className={cn(
        "chip",
        active && (tone === "mint" ? "chip-active-mint" : "chip-active"),
      )}
    >
      {children}
      {active && <span className="sr-only">({activeLabel})</span>}
    </Link>
  );
}

/**
 * Mieterinnen-Übersicht mit Sofortsuche, Filtern und Sortierung.
 * Jeder Chip ist ein echter Link (funktioniert ohne JavaScript und lässt sich
 * teilen); mit JavaScript wird ohne Neuladen gefiltert und die URL ersetzt.
 */
export function ProfileExplorer({
  cards,
  initial,
}: {
  cards: ExplorerCard[];
  initial: ProfileFilters;
}) {
  const t = useTranslations("profiles");
  const locale = useLocale();
  const pathname = usePathname();
  const [filters, setFilters] = useState(initial);
  const [, startTransition] = useTransition();
  const [allServices, setAllServices] = useState(false);
  // Alles außer der Suche liegt eingeklappt hinter einem Knopf
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  const options = useMemo(() => filterOptions(cards, locale), [cards, locale]);
  const visible = useMemo(
    () => applyFilters(cards, filters, locale),
    [cards, filters, locale],
  );

  function apply(next: ProfileFilters) {
    const qs = new URLSearchParams(filtersToQuery(next)).toString();
    window.history.replaceState(null, "", qs ? `${pathname}?${qs}` : pathname);
    // In einer Transition, damit die View Transition das Raster überblendet
    startTransition(() => setFilters(next));
    // Weit unten in der Liste: an den Anfang der Treffer, sonst schrumpft die
    // Seite unter dem Leser weg und Leiste samt Fach rutschen aus dem Bild
    const top = root.current?.getBoundingClientRect().top ?? 0;
    if (top < 0) {
      const header = parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue(
          "--header-h",
        ),
      );
      window.scrollTo({
        top:
          window.scrollY +
          top -
          (Number.isFinite(header) ? header * 16 : 64) -
          8,
        behavior: "instant",
      });
    }
  }

  const href = (next: Partial<ProfileFilters>): ChipHref => ({
    pathname: "/mieterinnen",
    query: filtersToQuery({ ...filters, ...next }),
  });
  /** Link-Ziel (ohne JavaScript) und Sofort-Filter für einen Chip */
  const pick = (next: Partial<ProfileFilters>) => ({
    activeLabel: t("active"),
    href: href(next),
    onSelect: () => apply({ ...filters, ...next }),
  });

  const shownServices = allServices
    ? options.services
    : options.services.slice(0, TOP_SERVICES);
  // Gewählte Services immer sichtbar halten
  const hiddenActive = options.services.filter(
    (s) =>
      filters.services.includes(s.key) &&
      !shownServices.some((x) => x.key === s.key),
  );
  // Zahl der gesetzten Filter (ohne Suche und Sortierung) für die Marke am Knopf
  const activeCount =
    (filters.now ? 1 : 0) +
    (filters.isNew ? 1 : 0) +
    filters.languages.length +
    filters.origins.length +
    filters.services.length;
  const sortLabels: Record<Sort, string> = {
    live: t("sortLive"),
    new: t("sortNew"),
    az: t("sortAz"),
  };
  // Übrige Filter für das Suchformular ohne JavaScript
  const hidden = Object.entries(filtersToQuery({ ...filters, q: "" }));

  const resetLink = hasActiveFilters(filters) && (
    <Link
      href="/mieterinnen"
      scroll={false}
      onClick={(e) => {
        if (!isPlainClick(e)) return;
        e.preventDefault();
        apply({ ...EMPTY_FILTERS, sort: filters.sort });
      }}
      className="inline-flex min-h-11 items-center font-label text-sm whitespace-nowrap"
    >
      {t("resetShort")}
    </Link>
  );

  return (
    <div ref={root}>
      {/* Leiste und Filterfach laufen gemeinsam mit: so öffnet sich das Fach
          immer direkt unter dem Knopf, auch weit unten in der Liste */}
      <div className="explorer-head">
        {/* Eine Zeile: Suche, Filterknopf, Trefferzahl. Alles Weitere klappt auf. */}
        <div className="explorer-bar">
          <form
            role="search"
            action={pathname}
            method="get"
            onSubmit={(e) => e.preventDefault()}
            className="relative min-w-0 flex-1"
          >
            <label htmlFor="profile-search" className="sr-only">
              {t("searchLabel")}
            </label>
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted" />
            <input
              id="profile-search"
              name={FILTER_PARAMS.q}
              type="search"
              value={filters.q}
              onChange={(e) => apply({ ...filters, q: e.target.value })}
              placeholder={t("searchPlaceholder")}
              autoComplete="off"
              enterKeyHint="search"
              className="search-input"
            />
            {hidden.map(([k, v]) => (
              <input key={k} type="hidden" name={k} value={v} />
            ))}
            {filters.q && (
              <button
                type="button"
                onClick={() => apply({ ...filters, q: "" })}
                className="absolute top-1/2 right-1 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-muted hover:text-ink"
              >
                <CloseIcon width={16} height={16} />
                <span className="sr-only">{t("clearSearch")}</span>
              </button>
            )}
            <noscript>
              <button type="submit" className="sr-only">
                {t("submitSearch")}
              </button>
            </noscript>
          </form>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="filter-panel"
            className={cn("chip filter-toggle", open && "is-open")}
          >
            <FilterIcon width={16} height={16} />
            {t("filterButton")}
            {activeCount > 0 && (
              <span className="filter-badge">{activeCount}</span>
            )}
          </button>

          <div className="hidden items-center gap-4 pr-2 sm:flex">
            {resetLink}
            <p className="explorer-count" aria-live="polite">
              {t("count", { count: visible.length })}
            </p>
          </div>
        </div>

        {/* Ohne JavaScript bleibt das Fach offen, die Chips sind echte Links */}
        <noscript>
          <style>{"#filter-panel{display:grid!important}"}</style>
        </noscript>
        <div
          id="filter-panel"
          hidden={!open}
          role="group"
          aria-label={t("filters")}
          className="filter-panel"
        >
          <div className="flex flex-wrap items-end gap-x-10 gap-y-5">
            <fieldset className="min-w-0">
              <legend className="eyebrow mb-2.5">{t("show")}</legend>
              <div className="flex flex-wrap gap-2">
                <Chip
                  {...pick({ now: !filters.now })}
                  active={filters.now}
                  tone="mint"
                >
                  <span className="live-dot live-dot-ready" aria-hidden />
                  {t("onlyNow")}{" "}
                  <span className="chip-count">{options.live}</span>
                </Chip>
                {(options.isNew > 0 || filters.isNew) && (
                  <Chip
                    {...pick({ isNew: !filters.isNew })}
                    active={filters.isNew}
                  >
                    {t("onlyNew")}{" "}
                    <span className="chip-count">{options.isNew}</span>
                  </Chip>
                )}
              </div>
            </fieldset>

            <div className="min-w-0">
              <p className="eyebrow mb-2.5 flex" id="sort-label">
                {t("sortLabel")}
              </p>
              <div
                role="group"
                aria-labelledby="sort-label"
                className="segmented"
              >
                {SORTS.map((s) => (
                  <Link
                    key={s}
                    href={href({ sort: s })}
                    scroll={false}
                    onClick={(e) => {
                      if (!isPlainClick(e)) return;
                      e.preventDefault();
                      apply({ ...filters, sort: s });
                    }}
                    aria-current={filters.sort === s ? "true" : undefined}
                    className="segmented-item"
                  >
                    {sortLabels[s]}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {options.languages.length > 0 && (
            <fieldset className="min-w-0">
              <legend className="eyebrow mb-2.5">{t("language")}</legend>
              <div className="chip-row">
                {options.languages.map(([code, n]) => (
                  <Chip
                    key={code}
                    {...pick({ languages: toggle(filters.languages, code) })}
                    active={filters.languages.includes(code)}
                  >
                    {languageName(code, locale)}{" "}
                    <span className="chip-count">{n}</span>
                  </Chip>
                ))}
              </div>
            </fieldset>
          )}

          {options.origins.length > 0 && (
            <fieldset className="min-w-0">
              <legend className="eyebrow mb-2.5">{t("origin")}</legend>
              <div className="chip-row">
                {options.origins.map(([code, n]) => (
                  <Chip
                    key={code}
                    {...pick({ origins: toggle(filters.origins, code) })}
                    active={filters.origins.includes(code)}
                  >
                    {regionName(code, locale)}{" "}
                    <span className="chip-count">{n}</span>
                  </Chip>
                ))}
              </div>
            </fieldset>
          )}

          {options.services.length > 0 && (
            <fieldset className="min-w-0">
              <legend className="eyebrow mb-2.5">{t("services")}</legend>
              <div className="flex flex-wrap gap-2">
                {[...shownServices, ...hiddenActive].map((s) => (
                  <Chip
                    key={s.key}
                    {...pick({ services: toggle(filters.services, s.key) })}
                    active={filters.services.includes(s.key)}
                  >
                    {s.label} <span className="chip-count">{s.n}</span>
                  </Chip>
                ))}
                {options.services.length > TOP_SERVICES && (
                  <button
                    type="button"
                    onClick={() => setAllServices((v) => !v)}
                    aria-expanded={allServices}
                    className="chip chip-ghost"
                  >
                    {allServices
                      ? t("fewerServices")
                      : t("moreServices", { count: options.services.length })}
                  </button>
                )}
              </div>
            </fieldset>
          )}
        </div>
      </div>

      {/* Handy: Trefferzahl nur, wenn gefiltert wird – sonst bleibt es bei einer Zeile */}
      {hasActiveFilters(filters) && (
        <div className="mt-2 flex items-center justify-between gap-4 sm:hidden">
          <p className="explorer-count">
            {t("count", { count: visible.length })}
          </p>
          {resetLink}
        </div>
      )}

      <div className="mt-6" />
      <ViewTransition>
        {visible.length > 0 ? (
          <ProfileGrid cards={visible} />
        ) : (
          <div className="panel p-8 text-center">
            <p className="text-lg text-ink">{t("empty")}</p>
            <p className="mt-2 text-muted">{t("emptyHint")}</p>
          </div>
        )}
      </ViewTransition>
    </div>
  );
}
