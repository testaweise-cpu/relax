import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type BadgeVariant = "live" | "new" | "back" | "neutral";

const variants: Record<BadgeVariant, string> = {
  live: "border-cyan/70 bg-night/80 text-cyan shadow-[0_0_10px_color-mix(in_oklab,var(--cyan)_45%,transparent)]",
  new: "border-pink/80 bg-night/80 text-pink shadow-[0_0_10px_color-mix(in_oklab,var(--pink)_45%,transparent)]",
  back: "border-sunset/70 bg-night/80 text-sunset",
  neutral: "border-line bg-panel text-muted",
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
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-xs font-medium tracking-wider uppercase backdrop-blur-sm",
        variants[variant],
        className,
      )}
    >
      {variant === "live" && <span className="live-dot" aria-hidden />}
      {children}
    </span>
  );
}
