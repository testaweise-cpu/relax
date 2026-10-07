import { getTranslations, setRequestLocale } from "next-intl/server";
import NextLink from "next/link";
import { Link } from "@/i18n/navigation";
import { keystaticEnabled } from "@/keystatic/enabled";

// Platzhalter-Startseite für Phase 1: zeigt, dass Tokens, Schriften und
// Zweisprachigkeit greifen. Wird in Phase 5 durch die echte Startseite ersetzt.

const TOKENS = [
  ["night", "#0D0B1E", "bg-night"],
  ["night-2", "#15122E", "bg-night-2"],
  ["panel", "#1B1738", "bg-panel"],
  ["line", "#2E2856", "bg-line"],
  ["ink", "#ECE8FF", "bg-ink"],
  ["muted", "#A39DC9", "bg-muted"],
  ["pink", "#FF2E97", "bg-pink"],
  ["cyan", "#22E4FF", "bg-cyan"],
  ["sunset", "#FF8A3D", "bg-sunset"],
  ["violet", "#8A5CFF", "bg-violet"],
  ["mint", "#6BFFC8", "bg-mint"],
] as const;

export default async function SetupPage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("setup");
  const tNav = await getTranslations("nav");
  const otherLocale = locale === "de" ? "en" : "de";

  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-8 sm:py-20">
      <div className="flex items-center justify-between gap-4">
        <p className="font-mono text-sm tracking-widest text-cyan uppercase">
          {t("eyebrow")}
        </p>
        <Link
          href="/"
          locale={otherLocale}
          className="rounded-full border border-line px-4 py-2 font-mono text-sm text-ink no-underline hover:border-cyan"
        >
          {tNav("switchTo")}
        </Link>
      </div>

      <h1 className="mt-6 text-5xl text-ink sm:text-7xl">{t("title")}</h1>
      <p className="mt-6 max-w-2xl text-lg text-muted">{t("lead")}</p>

      <section className="mt-14" aria-labelledby="tokens">
        <h2 id="tokens" className="text-2xl text-ink">
          {t("tokens")}
        </h2>
        <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {TOKENS.map(([name, hex, bg]) => (
            <li
              key={name}
              className="overflow-hidden rounded-card border border-line bg-panel"
            >
              <div className={`h-16 ${bg}`} aria-hidden />
              <div className="px-3 py-2">
                <p className="font-mono text-sm text-ink">{name}</p>
                <p className="font-mono text-xs text-muted">{hex}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-14" aria-labelledby="fonts">
        <h2 id="fonts" className="text-2xl text-ink">
          {t("fonts")}
        </h2>
        <dl className="mt-6 grid gap-4">
          <div className="rounded-card border border-line bg-panel p-5">
            <dt className="font-mono text-xs tracking-widest text-muted uppercase">
              Mr Dafoe
            </dt>
            <dd className="mt-2 font-script text-5xl text-pink">Mona Roses</dd>
            <dd className="mt-1 text-sm text-muted">{t("fontScript")}</dd>
          </div>
          <div className="rounded-card border border-line bg-panel p-5">
            <dt className="font-mono text-xs tracking-widest text-muted uppercase">
              Big Shoulders · 600 / 800
            </dt>
            <dd className="mt-2 font-display text-4xl font-semibold tracking-wider text-ink uppercase">
              Bar · Tabledance
            </dd>
            <dd className="font-display text-4xl font-extrabold tracking-wider text-ink uppercase">
              Berlin-Steglitz
            </dd>
            <dd className="mt-1 text-sm text-muted">{t("fontDisplay")}</dd>
          </div>
          <div className="rounded-card border border-line bg-panel p-5">
            <dt className="font-mono text-xs tracking-widest text-muted uppercase">
              IBM Plex Sans · 400 / 500 / 600
            </dt>
            <dd className="mt-2 text-ink">{t("fontBody")}</dd>
          </div>
          <div className="rounded-card border border-line bg-panel p-5">
            <dt className="font-mono text-xs tracking-widest text-muted uppercase">
              IBM Plex Mono · 400 / 500
            </dt>
            <dd className="mt-2 font-mono text-cyan">{t("fontMono")}</dd>
          </div>
        </dl>
      </section>

      {keystaticEnabled && (
        <p className="mt-14">
          <NextLink
            href="/keystatic"
            prefetch={false}
            className="font-mono text-sm"
          >
            {t("admin")} →
          </NextLink>
        </p>
      )}
    </main>
  );
}
