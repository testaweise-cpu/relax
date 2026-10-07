import { getTranslations, setRequestLocale } from "next-intl/server";
import { ButtonLink } from "@/components/ui/button";
import { ArrowRightIcon } from "@/components/ui/icons";
import { HeroBackdrop } from "@/components/ui/hero";
import { Logo } from "@/components/ui/logo";
import { HERO_VIDEO } from "@/lib/media/hero";

// Auf schmalen Handys kompaktere Buttons, damit beide in eine Zeile passen.
const compact = "max-sm:min-h-12 max-sm:px-4 max-sm:text-base";

// Startseite – in Phase 2 nur der Hero. Jetzt-da-Leiste, Highlights, Preise
// und Anfahrt folgen in Phase 4/5.
export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");

  return (
    <HeroBackdrop className="min-h-[calc(100svh-4rem)]" media={HERO_VIDEO}>
      <div className="container-page hero-clearance relative flex min-h-[calc(100svh-4rem)] flex-col items-center justify-center pt-8 text-center sm:pt-12">
        <p className="eyebrow">{t("heroEyebrow")}</p>
        <h1 className="mt-4">
          <Logo size="xl" link={false} animated />
        </h1>
        <p className="mt-4 max-w-md text-lg text-ink sm:mt-6 sm:text-xl">
          {t("heroLead")}
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/jetzt-da" size="lg" className={compact}>
            {t("ctaNow")}
            <ArrowRightIcon />
          </ButtonLink>
          <ButtonLink
            href="/preise"
            size="lg"
            variant="secondary"
            className={compact}
          >
            {t("ctaPrices")}
          </ButtonLink>
        </div>
      </div>
    </HeroBackdrop>
  );
}
