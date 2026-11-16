import { useTranslations } from "next-intl";
import { cn } from "@/lib/cn";
import { LiveRose } from "./live-rose";

/** Erklärt die Rose: leuchtend = jetzt verfügbar, glimmend = im Haus. */
export function RoseLegend({ className }: { className?: string }) {
  const t = useTranslations("profile");
  return (
    <p
      className={cn(
        "flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-muted",
        className,
      )}
    >
      <span className="inline-flex items-center gap-1.5">
        <LiveRose ready size={15} />
        {t("roseReady")}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <LiveRose size={15} />
        {t("roseBusy")}
      </span>
    </p>
  );
}
