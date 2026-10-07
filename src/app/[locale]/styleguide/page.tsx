import type { Metadata } from "next";
import Image from "next/image";
import { setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";
import { DataPreview } from "@/components/data-preview";
import { LegalNotice } from "@/components/legal-notice";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonAnchor, ButtonLink } from "@/components/ui/button";
import { HeroBackdrop } from "@/components/ui/hero";
import { ArrowRightIcon, PhoneIcon } from "@/components/ui/icons";
import { Logo } from "@/components/ui/logo";
import { NeonText } from "@/components/ui/neon-text";
import { SedcardTile } from "@/components/ui/sedcard-tile";
import type { Locale } from "@/i18n/routing";
import { getGallery, pick } from "@/lib/content";

// Interne Seite: zeigt alle Bausteine des Designsystems. Nicht indexieren.
export const metadata: Metadata = {
  title: "Styleguide",
  robots: { index: false, follow: false },
};

const COLORS = [
  ["night", "Seitenhintergrund"],
  ["night-2", "Abschnitte"],
  ["panel", "Karten"],
  ["line", "Rahmen"],
  ["ink", "Text"],
  ["muted", "Nebentext"],
  ["pink", "Hauptakzent"],
  ["cyan", "Live, Links"],
  ["sunset", "Verläufe, Hinweise"],
  ["violet", "Verläufe"],
  ["mint", "Erfolg, Preise"],
] as const;

// Fiktive Beispiele – keine echten Personen.
const SAMPLE_TILES = [
  {
    slug: "aurora",
    name: "Aurora",
    languages: ["DE", "EN"],
    timeLabel: "heute bis 24 Uhr",
    isLive: true,
    seed: 0,
  },
  {
    slug: "bella",
    name: "Bella",
    languages: ["RO", "EN"],
    timeLabel: "heute 16–24 Uhr",
    isLive: true,
    isNew: true,
    seed: 1,
  },
  {
    slug: "carmen",
    name: "Carmen",
    languages: ["ES", "DE"],
    timeLabel: "morgen ab 10 Uhr",
    isBack: true,
    seed: 2,
  },
  {
    slug: "dalia",
    name: "Dalia",
    languages: ["PL"],
    timeLabel: "ab 24.10.",
    seed: 3,
  },
];

function Block({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: ReactNode;
}) {
  return (
    <section className="border-t border-line py-12" aria-label={title}>
      <h2 className="heading-glow text-3xl text-ink">{title}</h2>
      {note && <p className="mt-3 max-w-2xl text-muted">{note}</p>}
      <div className="mt-8">{children}</div>
    </section>
  );
}

export default async function StyleguidePage({
  params,
}: PageProps<"/[locale]/styleguide">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const gallery = await getGallery();

  return (
    <div className="container-page py-12">
      <p className="eyebrow">Intern · Designsystem</p>
      <h1 className="mt-3 text-5xl text-ink sm:text-6xl">Styleguide</h1>
      <p className="mt-4 max-w-2xl text-lg text-muted">
        „Miami Nights“: nächtliches Violett, pinke und türkise Leuchtschrift,
        Sonnenuntergangs-Verläufe. Neon nur als Akzent, Fließtext ruhig.
      </p>

      <Block
        title="Farben"
        note="Nur über Tokens verwenden. Violett nicht als Textfarbe (Kontrast unter 4,5:1)."
      >
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {COLORS.map(([name, use]) => (
            <li key={name} className="panel overflow-hidden">
              <div
                className="h-14"
                style={{ background: `var(--${name})` }}
                aria-hidden
              />
              <div className="px-3 py-2">
                <p className="font-mono text-sm text-ink">{name}</p>
                <p className="text-xs text-muted">{use}</p>
              </div>
            </li>
          ))}
        </ul>
      </Block>

      <Block title="Typografie">
        <div className="space-y-6">
          <div>
            <p className="eyebrow">Eyebrow · IBM Plex Mono 500</p>
            <p className="mt-2 font-display text-6xl font-extrabold tracking-[0.04em] text-ink uppercase">
              Überschrift H1
            </p>
            <p className="font-display text-4xl font-extrabold tracking-[0.04em] text-ink uppercase">
              Überschrift H2
            </p>
            <p className="font-display text-2xl font-semibold tracking-[0.08em] text-ink uppercase">
              Überschrift H3 · 600
            </p>
          </div>
          <p className="max-w-prose text-lg text-ink">
            Fließtext in IBM Plex Sans. Ruhig und gut lesbar, mit großzügiger
            Zeilenhöhe – auch für längere Absätze auf dem Handy.{" "}
            <a href="#">Links sind türkis</a>.
          </p>
          <p className="max-w-prose text-muted">
            Nebentext in „muted“ für ergänzende Hinweise.
          </p>
          <p className="font-mono text-sm text-cyan">
            heute 16–24 Uhr · morgen ab 10 Uhr · ab 24.10.
          </p>
        </div>
      </Block>

      <Block
        title="Neon-Schriftzug"
        note="Mehrlagiger text-shadow mit weißem Kern, leicht schräg. Flackern selten; bei reduzierter Bewegung aus."
      >
        <div className="flex flex-wrap items-center gap-x-12 gap-y-6">
          <Logo size="lg" animated link={false} />
          <NeonText tilt color="cyan" className="text-5xl">
            Jetzt da
          </NeonText>
          <NeonText tilt color="sunset" className="text-5xl">
            Tabledance
          </NeonText>
          <NeonText className="text-5xl">ohne Neigung</NeonText>
        </div>
      </Block>

      <Block
        title="Buttons"
        note="Mindesthöhe 44 px. Primär mit dunkler Schrift auf Pink (5,6:1)."
      >
        <div className="flex flex-wrap items-center gap-3">
          <ButtonLink href="/jetzt-da">
            Wer ist jetzt da? <ArrowRightIcon />
          </ButtonLink>
          <ButtonLink href="/preise" variant="secondary">
            Preise
          </ButtonLink>
          <Button variant="ghost">Ghost</Button>
          <ButtonAnchor href="tel:+49" size="lg">
            <PhoneIcon />
            Anrufen
          </ButtonAnchor>
          <Button disabled>Deaktiviert</Button>
        </div>
      </Block>

      <Block title="Badges">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="live">Jetzt da</Badge>
          <Badge variant="new">Neu</Badge>
          <Badge variant="back">Wieder da</Badge>
          <Badge>DE · EN</Badge>
        </div>
      </Block>

      <Block
        title="Sedcard-Kachel"
        note="Bild 3:4 (hier Platzhalter in Markenfarben), Name in Neon-Schrift, Sprachen und Zeiten in Mono. Hover: stärkeres Glühen, leicht angehoben."
      >
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {SAMPLE_TILES.map((tile) => (
            <li key={tile.slug}>
              <SedcardTile {...tile} />
            </li>
          ))}
        </ul>
      </Block>

      <Block
        title="Hero"
        note="Gestreifte Sonne über perspektivischem Raster, Horizont mit Glühen – nur CSS."
      >
        <HeroBackdrop
          className="h-80 rounded-card border border-line sm:h-96"
          horizon="38%"
        >
          <div className="relative flex h-full items-start justify-center pt-10">
            <Logo size="lg" link={false} />
          </div>
        </HeroBackdrop>
      </Block>

      <Block
        title="Datenschicht (live)"
        note="Echte Daten der aktiven Quelle (DATA_SOURCE). Im Mock-Modus fiktive Profile mit Platzhalterbildern; Schichten relativ zur aktuellen Uhrzeit, alle Zeiten in Europe/Berlin."
      >
        <DataPreview locale={locale === "en" ? "en" : "de"} />
      </Block>

      <Block
        title="Medien aus der Altseite"
        note="Raumfotos (Feb. 2025) in Keystatic unter „Galerie“, Metadaten entfernt. Das Werbevideo startet erst per Klick; der Hero nutzt nur einen 10-s-Ausschnitt mit Bar- und Raumszenen."
      >
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {gallery.map((g) => (
            <li
              key={g.slug}
              className="relative aspect-[3/4] overflow-hidden rounded-card border border-line"
            >
              <Image
                src={g.image!}
                alt={pick(g.alt, locale as Locale)}
                fill
                sizes="(min-width: 640px) 25vw, 50vw"
                className="object-cover"
              />
            </li>
          ))}
        </ul>
        <video
          className="panel mt-6 aspect-[3/2] w-full max-w-2xl"
          controls
          preload="none"
          playsInline
          poster="/media/mona-roses-werbevideo-poster.webp"
        >
          <source src="/media/mona-roses-werbevideo.mp4" type="video/mp4" />
        </video>
      </Block>

      <Block
        title="Rechtlicher Hinweis"
        note="Ein Text in Keystatic („Rechtlicher Hinweis“), eingebunden über die Komponente <LegalNotice>."
      >
        <div className="space-y-4">
          <LegalNotice />
          <LegalNotice variant="long" />
        </div>
      </Block>

      <Block
        title="Navigation & Footer"
        note="Header oben (Desktop-Navigation ab 1280 px, darunter Vollbild-Menü), Footer und Sticky-Anruf-Button (nur Handy) sind auf jeder Seite aktiv."
      >
        <p className="text-muted">Siehe Seitenkopf und -fuß.</p>
      </Block>
    </div>
  );
}
