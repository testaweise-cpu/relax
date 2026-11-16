import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { LiveRose } from "./live-rose";

type BadgeVariant = "live" | "ready" | "new" | "back" | "neutral";

/** Chips: dunkel hinterlegt, Rahmen in Champagner; helles Gold für „verfügbar“. */
const variants: Record<BadgeVariant, string> = {
  live: "border-gold/40 text-ink",
  ready: "border-mint/45 text-mint",
  new: "border-gold/40 text-gold",
  back: "border-gold/40 text-gold",
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
        "glass-chip inline-flex items-center gap-1.5 rounded-[var(--radius)] border px-2.5 py-1 font-label text-[0.6rem] leading-none font-medium tracking-[0.2em] uppercase",
        variants[variant],
        className,
      )}
    >
      {(variant === "live" || variant === "ready") && (
        <LiveRose ready={variant === "ready"} size={13} />
      )}
      {children}
    </span>
  );
}
