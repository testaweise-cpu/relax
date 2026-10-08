"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { AGE_COOKIE_MAX_AGE, AGE_GATE, isExemptPath } from "@/lib/age-gate";
import { buttonClasses } from "../ui/button";
import { NeonText } from "../ui/neon-text";

const CONTENT_ID = "seite";

function setInert(on: boolean) {
  const el = document.getElementById(CONTENT_ID);
  if (!el) return;
  if (on) el.setAttribute("inert", "");
  else el.removeAttribute("inert");
}

/**
 * Altersabfrage als Vollbild-Overlay. Inhalte bleiben serverseitig gerendert
 * (für Suchmaschinen); das Overlay liegt darüber. Sichtbarkeit steuert die
 * Klasse "age-ok" am <html> (siehe AGE_GATE_HEAD_SCRIPT).
 */
export function AgeGate() {
  const t = useTranslations("ageGate");
  const pathname = usePathname();
  const confirmRef = useRef<HTMLButtonElement>(null);
  const exempt = isExemptPath(pathname);

  useEffect(() => {
    if (exempt) return;
    const ok = document.documentElement.classList.contains("age-ok");
    setInert(!ok);
    if (!ok) confirmRef.current?.focus();
    return () => setInert(false);
  }, [exempt]);

  if (exempt) return null;

  const confirm = (e: React.FormEvent) => {
    e.preventDefault();
    const secure = location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${AGE_GATE.cookieName}=${AGE_GATE.cookieValue}; Max-Age=${AGE_COOKIE_MAX_AGE}; Path=/; SameSite=Lax${secure}`;
    document.documentElement.classList.add("age-ok");
    setInert(false);
  };

  return (
    <div
      className="age-gate fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-night/80 p-4 backdrop-blur-xl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-title"
      aria-describedby="age-text"
    >
      <div className="panel panel-accent w-full max-w-lg p-8 text-center sm:p-12">
        <p className="eyebrow eyebrow-center">
          {t("eyebrow", { age: AGE_GATE.minAge })}
        </p>
        <div className="mt-6">
          <NeonText tilt ignite className="text-6xl sm:text-7xl">
            Mona Roses
          </NeonText>
        </div>
        <h2 id="age-title" className="mt-8 text-3xl text-ink">
          {t("title")}
        </h2>
        <p id="age-text" className="mx-auto mt-4 max-w-sm text-muted">
          {t("text", { age: AGE_GATE.minAge })}
        </p>
        <form
          method="post"
          action="/api/age"
          onSubmit={confirm}
          className="mt-8 flex flex-col gap-3"
        >
          <input type="hidden" name="return" value={pathname} />
          <button
            ref={confirmRef}
            type="submit"
            className={buttonClasses({ size: "lg" })}
          >
            {t("confirm", { age: AGE_GATE.minAge })}
          </button>
          <a
            href={AGE_GATE.leaveUrl}
            className={buttonClasses({ variant: "secondary", size: "lg" })}
          >
            {t("leave")}
          </a>
        </form>
        <p className="mt-8 flex justify-center gap-5 font-mono text-xs text-muted">
          <Link href="/impressum" className="text-muted hover:text-cyan">
            {t("imprint")}
          </Link>
          <Link href="/datenschutz" className="text-muted hover:text-cyan">
            {t("privacy")}
          </Link>
        </p>
      </div>
    </div>
  );
}
