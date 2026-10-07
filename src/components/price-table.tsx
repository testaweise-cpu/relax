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
    <table className="w-full border-separate border-spacing-0">
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
                "border-b border-line text-left font-display font-semibold tracking-[0.08em] text-ink uppercase group-last:border-b-0",
                compact ? "py-3 text-xl" : "py-4 text-2xl sm:text-3xl",
              )}
            >
              {t("minutes", { count: r.minutes ?? 0 })}
            </th>
            <td
              className={cn(
                "border-b border-line text-right font-mono text-mint [text-shadow:0_0_12px_color-mix(in_oklab,var(--mint)_45%,transparent)] group-last:border-b-0",
                compact ? "py-3 text-xl" : "py-4 text-2xl sm:text-3xl",
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
