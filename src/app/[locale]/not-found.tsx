import { useTranslations } from "next-intl";
import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  const t = useTranslations("errors");
  return (
    <section className="container-page flex min-h-[70vh] flex-col items-center justify-center py-20 text-center">
      <p
        className="visit-mark-number text-8xl text-gold sm:text-9xl"
        aria-hidden
      >
        404
      </p>
      <h1 className="mt-12 text-5xl text-ink sm:text-6xl">
        {t("notFoundTitle")}
      </h1>
      <p className="mt-4 max-w-md text-lg text-muted">{t("notFoundText")}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/jetzt-da">{t("toNow")}</ButtonLink>
        <ButtonLink href="/mieterinnen" variant="secondary">
          {t("toProfiles")}
        </ButtonLink>
        <ButtonLink href="/" variant="ghost">
          {t("toHome")}
        </ButtonLink>
      </div>
    </section>
  );
}
