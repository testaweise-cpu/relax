import { getTranslations } from "next-intl/server";
import { cn } from "@/lib/cn";

type Row = { minutes: number | null; priceEur: number | null };

export async function PriceTable({
  rows,
  locale,
  compact = false,
}: {
  rows: readonly Row[];
  locale: string;
  compact?: boolean;
}) {
  const t = await getTranslations("prices");
  const money = new Intl.NumberFormat(locale === "en" ? "en-GB" : "de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });
  return (
    <table className="w-full border-separate border-spacing-0 [font-variant-numeric:lining-nums_tabular-nums]">
      <caption className="sr-only">{t("tableCaption")}</caption>
      <thead className="sr-only">
        <tr>
          <th scope="col">{t("duration")}</th>
          <th scope="col">{t("roomRent")}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.minutes ?? 0} className="group">
            <th
              scope="row"
              className={cn(
                "border-b border-line/70 text-left font-display font-medium text-ink group-last:border-b-0",
                compact ? "py-3.5 text-2xl" : "py-5 text-2xl sm:text-3xl",
              )}
            >
              <span className="flex items-baseline gap-3">
                {t("minutes", { count: r.minutes ?? 0 })}
                <span
                  aria-hidden
                  className="mb-1.5 flex-1 border-b border-dotted border-gold/30"
                />
              </span>
            </th>
            <td
              className={cn(
                "border-b border-line/70 pl-3 text-right font-display font-medium text-gold tabular-nums group-last:border-b-0",
                compact ? "py-3.5 text-2xl" : "py-5 text-2xl sm:text-3xl",
              )}
            >
              {money.format(r.priceEur ?? 0)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
