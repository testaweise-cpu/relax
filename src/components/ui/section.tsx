import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Abschnitt mit einheitlichen Abständen und optionaler Überschrift.
 * Der erste Abschnitt einer Unterseite trägt den Seitentitel: `level={1}`.
 */
export function Section({
  id,
  level = 2,
  eyebrow,
  title,
  intro,
  tone = "night",
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
  children?: ReactNode;
  className?: string;
}) {
  const headingId = id ? `${id}-title` : undefined;
  const Heading = level === 1 ? "h1" : "h2";
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
        {(eyebrow || title) && (
          <header className="mb-10 max-w-2xl sm:mb-14">
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            {title && (
              <Heading
                id={headingId}
                className="mt-4 text-4xl text-ink sm:text-[3.4rem]"
              >
                {title}
              </Heading>
            )}
            {intro && (
              <div className="mt-5 text-lg leading-relaxed text-muted">
                {intro}
              </div>
            )}
          </header>
        )}
        {children}
      </div>
    </section>
  );
}
