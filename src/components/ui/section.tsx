import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { HeroMedia } from "@/lib/media/hero";
import { HeroBackdrop } from "./hero";

/**
 * Abschnitt mit einheitlichen Abständen und optionaler Überschrift.
 * Der erste Abschnitt einer Unterseite trägt den Seitentitel: `level={1}`.
 * Mit `media` steht die Überschrift in einem Kopfbereich mit Hintergrundvideo.
 */
export function Section({
  id,
  level = 2,
  eyebrow,
  title,
  intro,
  tone = "night",
  media,
  children,
  className,
}: {
  id?: string;
  /** Überschriftenebene des Titels (1 = Seitentitel) */
  level?: 1 | 2;
  eyebrow?: string;
  title?: string;
  intro?: ReactNode;
  tone?: "night" | "night-2";
  /** Hintergrundvideo hinter der Überschrift (Kopfbereich der Seite) */
  media?: HeroMedia;
  children?: ReactNode;
  className?: string;
}) {
  const headingId = id ? `${id}-title` : undefined;
  const Heading = level === 1 ? "h1" : "h2";
  const header = (eyebrow || title) && (
    <header className="mb-10 max-w-2xl sm:mb-14">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      {title && (
        <Heading
          id={headingId}
          className="mt-5 text-5xl text-ink sm:text-[4.2rem]"
        >
          {title}
        </Heading>
      )}
      {intro && (
        <div className="mt-5 text-lg leading-relaxed text-muted">{intro}</div>
      )}
    </header>
  );

  if (media) {
    return (
      <section
        id={id}
        aria-labelledby={title ? headingId : undefined}
        className={cn("pb-20 sm:pb-28", className)}
      >
        <HeroBackdrop media={media} className="hero-sky-soft mb-12 sm:mb-16">
          <div className="container-page relative pt-24 pb-6 sm:pt-32 sm:pb-10">
            {header}
          </div>
        </HeroBackdrop>
        <div className="container-page">{children}</div>
      </section>
    );
  }

  return (
    <section
      id={id}
      aria-labelledby={title ? headingId : undefined}
      className={cn(
        "py-20 sm:py-28",
        tone === "night-2" &&
          "bg-[linear-gradient(180deg,var(--night)_0%,var(--night-2)_18%,var(--night-2)_82%,var(--night)_100%)]",
        className,
      )}
    >
      <div className="container-page">
        {header}
        {children}
      </div>
    </section>
  );
}
