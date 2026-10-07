import { getTranslations } from "next-intl/server";
import { cn } from "@/lib/cn";
import type { WeekPlanDay } from "@/lib/time/shifts";

export async function WeekPlan({ days }: { days: WeekPlanDay[] }) {
  const t = await getTranslations("sedcard");
  return (
    <table className="w-full font-mono text-sm">
      <caption className="sr-only">{t("week")}</caption>
      <tbody className="divide-y divide-line">
        {days.map((d) => (
          <tr key={d.key} className={cn(d.isToday && "text-cyan")}>
            <th scope="row" className="py-2.5 pr-4 text-left font-normal">
              <span className={d.isToday ? "text-cyan" : "text-ink"}>
                {d.weekday}
              </span>{" "}
              <span className="text-muted">{d.date}</span>
              {(d.isToday || d.isTomorrow) && (
                <span className="ml-2 text-xs text-muted uppercase">
                  {d.isToday ? t("today") : t("tomorrow")}
                </span>
              )}
            </th>
            <td className="py-2.5 text-right">
              {d.slots.length === 0 ? (
                <span className="text-muted">{t("off")}</span>
              ) : (
                d.slots.map((s) => (
                  <span
                    key={s.range}
                    className={cn("block", s.active ? "text-cyan" : "text-ink")}
                  >
                    {s.active && (
                      <span
                        className="live-dot mr-2 inline-block align-middle"
                        aria-hidden
                      />
                    )}
                    {s.range}
                  </span>
                ))
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
