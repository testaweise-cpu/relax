import { getTranslations } from "next-intl/server";
import { getSettings } from "@/lib/content";
import { telHref } from "@/lib/phone";
import { buttonClasses } from "../ui/button";
import { PhoneIcon } from "../ui/icons";
import { Logo } from "../ui/logo";
import { LanguageSwitch } from "./language-switch";
import { MobileMenu } from "./mobile-menu";
import { NavLinks } from "./nav-links";

export async function Header() {
  const t = await getTranslations("nav");
  const tc = await getTranslations("common");
  const settings = await getSettings();
  const phoneHref = telHref(settings.phoneE164);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-night/95">
      {/* Lesefortschritt als Neonlinie (CSS Scroll Timeline, ohne JavaScript) */}
      <div className="scroll-progress" aria-hidden />
      <div className="container-page flex h-16 items-center justify-between gap-4 sm:h-[4.5rem]">
        <Logo priority />

        <nav aria-label={t("main")} className="hidden xl:block">
          <NavLinks />
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 md:flex">
            <a href={phoneHref} className={buttonClasses({ size: "md" })}>
              <PhoneIcon />
              {tc("call")}
            </a>
            <LanguageSwitch />
          </div>
          <div className="xl:hidden">
            <MobileMenu phoneHref={phoneHref} />
          </div>
        </div>
      </div>
    </header>
  );
}
