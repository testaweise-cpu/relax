import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Abschnitt mit einheitlichen Abständen und optionaler Überschrift. */
export function Section({
  id,
  eyebrow,
  title,
  intro,
  tone = "night",
  children,
  className,
}: {
  id?: string;
  eyebrow?: string;
  title?: string;
  intro?: ReactNode;
  tone?: "night" | "night-2";
  children?: ReactNode;
  className?: string;
}) {
  const headingId = id ? `${id}-title` : undefined;
  return (
    <section
      id={id}
      aria-labelledby={title ? headingId : undefined}
      className={cn(
        "py-14 sm:py-20",
        tone === "night-2" && "bg-night-2",
        className,
      )}
    >
      <div className="container-page">
        {(eyebrow || title) && (
          <header className="mb-8 max-w-2xl">
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            {title && (
              <h2
                id={headingId}
                className="heading-glow mt-2 text-4xl text-ink sm:text-5xl"
              >
                {title}
              </h2>
            )}
            {intro && <div className="mt-4 text-lg text-muted">{intro}</div>}
          </header>
        )}
        {children}
      </div>
    </section>
  );
}
