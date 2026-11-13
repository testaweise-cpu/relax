import { getTranslations } from "next-intl/server";
import { getSettings } from "@/lib/content";
import { telHref } from "@/lib/phone";
import { buttonClasses } from "../ui/button";
import { MapPinIcon, PhoneIcon } from "../ui/icons";

/** Routenplanung zu Google Maps; das Ziel ist die Adresse aus den Einstellungen. */
function routeHref(s: { street: string; postalCode: string; city: string }) {
  const destination = `Mona Roses, ${s.street}, ${s.postalCode} ${s.city}`;
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
}

/** Feste Leiste am unteren Rand – nur auf dem Handy: Anrufen und Route. */
export async function StickyCall() {
  const t = await getTranslations("common");
  const s = await getSettings();
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 flex gap-3 border-t border-line/70 bg-night/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden">
      <a
        href={telHref(s.phoneE164)}
        className={buttonClasses({ size: "lg", className: "flex-1 px-4" })}
      >
        <PhoneIcon />
        {t("call")}
      </a>
      <a
        href={routeHref(s)}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonClasses({
          variant: "secondary",
          size: "lg",
          className: "flex-1 px-4",
        })}
      >
        <MapPinIcon />
        {t("route")}
      </a>
    </div>
  );
}
