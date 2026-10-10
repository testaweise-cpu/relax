import { getTranslations } from "next-intl/server";
import { getSettings } from "@/lib/content";
import { telHref } from "@/lib/phone";
import { buttonClasses } from "../ui/button";
import { PhoneIcon } from "../ui/icons";

/** Fester Anruf-Button am unteren Rand – nur auf dem Handy. */
export async function StickyCall() {
  const t = await getTranslations("common");
  const s = await getSettings();
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line/70 bg-night/90 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md md:hidden">
      <a
        href={telHref(s.phoneE164)}
        className={buttonClasses({ size: "lg", className: "w-full" })}
      >
        <PhoneIcon />
        {t("call")}
        <span className="font-mono text-sm font-medium tracking-normal normal-case">
          · {t("open247")}
        </span>
      </a>
    </div>
  );
}
