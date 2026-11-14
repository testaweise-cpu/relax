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

/**
 * Beide Knöpfe teilen sich die Breite genau hälftig und dürfen schrumpfen –
 * sonst ragt der zweite auf schmalen Handys über den Rand. Die Abstände sind
 * mit "!" gesetzt, weil die Größenklasse des Buttons sonst gewinnt.
 */
const STICKY_BUTTON =
  "min-w-0 flex-1 basis-0 !px-3 max-[380px]:!gap-2 max-[380px]:!tracking-[0.1em]";

/** Feste Leiste am unteren Rand – nur auf dem Handy: Anrufen und Route. */
export async function StickyCall() {
  const t = await getTranslations("common");
  const s = await getSettings();
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 flex gap-2 border-t border-line/70 bg-night/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden">
      <a
        href={telHref(s.phoneE164)}
        className={buttonClasses({ size: "lg", className: STICKY_BUTTON })}
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
          className: STICKY_BUTTON,
        })}
      >
        <MapPinIcon />
        {t("route")}
      </a>
    </div>
  );
}
