import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getSettings, pick } from "@/lib/content";
import { telHref } from "@/lib/phone";
import { LegalNotice } from "../legal-notice";
import { ClockIcon, MapPinIcon, PhoneIcon } from "../ui/icons";
import { NeonText } from "../ui/neon-text";
import { NAV_ITEMS } from "./nav-items";

export async function Footer() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("nav");
  const tf = await getTranslations("footer");
  const s = await getSettings();

  return (
    <footer className="bg-night-2 pb-24 md:pb-0">
      {/* Goldlinie mit Raute statt einfacher Trennlinie */}
      <div className="ornament container-page text-[0.6rem]" aria-hidden>
        ◆
      </div>
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.3fr_1fr_1fr]">
        <div>
          <NeonText tilt className="text-5xl">
            Mona Roses
          </NeonText>
          <p className="mt-4 max-w-sm text-muted">{tf("tagline")}</p>
          <LegalNotice className="mt-6 max-w-md" />
        </div>

        <div>
          <h2 className="font-label text-[0.7rem] font-medium tracking-[0.3em] text-gold uppercase">
            {tf("visit")}
          </h2>
          <ul className="mt-4 space-y-3 text-ink">
            <li className="flex gap-3">
              <MapPinIcon className="mt-1 shrink-0 text-gold" />
              <address className="not-italic">
                {s.street}
                <br />
                {s.postalCode} {s.city}
                {s.district ? `-${s.district}` : ""}
              </address>
            </li>
            <li className="flex gap-3">
              <PhoneIcon className="mt-1 shrink-0 text-gold" />
              <a href={telHref(s.phoneE164)}>{s.phone}</a>
            </li>
            <li className="flex gap-3">
              <ClockIcon className="mt-1 shrink-0 text-gold" />
              <span>{pick(s.openingHours, locale)}</span>
            </li>
          </ul>
        </div>

        <nav aria-label={t("footer")}>
          <h2 className="font-label text-[0.7rem] font-medium tracking-[0.3em] text-gold uppercase">
            {tf("explore")}
          </h2>
          <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-muted hover:text-gold">
                  {t(item.key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-line">
        <div className="container-page flex flex-col gap-3 py-6 font-label text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} Mona Roses · {tf("adultsOnly")}
          </p>
          <ul className="flex gap-5">
            <li>
              <Link href="/impressum" className="text-muted hover:text-gold">
                {t("imprint")}
              </Link>
            </li>
            <li>
              <Link href="/datenschutz" className="text-muted hover:text-gold">
                {t("privacy")}
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
