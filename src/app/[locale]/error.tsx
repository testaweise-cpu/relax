"use client"; // Fehlergrenzen müssen Client-Komponenten sein

import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { Button, ButtonLink } from "@/components/ui/button";

/** Unerwarteter Fehler in einer Seite: Kopf und Fuß bleiben stehen. */
export default function PageError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const t = useTranslations("errors");
  useEffect(() => {
    console.error("[seite]", error.digest ?? error.message);
  }, [error]);

  return (
    <section className="container-page flex min-h-[70vh] flex-col items-center justify-center py-20 text-center">
      <h1 className="text-5xl text-ink sm:text-6xl">{t("errorTitle")}</h1>
      <p className="mt-4 max-w-md text-lg text-muted">{t("errorText")}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button onClick={() => retry()}>{t("retry")}</Button>
        <ButtonLink href="/" variant="secondary">
          {t("toHome")}
        </ButtonLink>
      </div>
    </section>
  );
}
