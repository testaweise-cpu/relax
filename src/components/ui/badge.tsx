import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type BadgeVariant = "live" | "ready" | "new" | "back" | "neutral";

/** Glas-Chips: halbtransparent mit Unschärfe, damit sie auf jedem Foto lesbar bleiben. */
const variants: Record<BadgeVariant, string> = {
  live: "border-gold/45 text-gold",
  ready: "border-mint/45 text-mint",
  new: "border-red/55 text-[color-mix(in_oklab,var(--red)_55%,white)]",
  back: "border-sunset/50 text-sunset",
  neutral: "border-line text-muted",
};

export function Badge({
  variant = "neutral",
  children,
  className,
}: {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "glass-chip inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-label text-[0.6rem] leading-none font-medium tracking-[0.2em] uppercase",
        variants[variant],
        className,
      )}
    >
      {(variant === "live" || variant === "ready") && (
        <span
          className={cn("live-dot", variant === "ready" && "live-dot-ready")}
          aria-hidden
        />
      )}
      {children}
    </span>
  );
}
