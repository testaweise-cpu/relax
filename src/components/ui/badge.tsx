import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type BadgeVariant = "live" | "new" | "back" | "neutral";

const variants: Record<BadgeVariant, string> = {
  live: "border-cyan/40 bg-night/85 text-cyan",
  new: "border-pink/50 bg-night/85 text-pink",
  back: "border-sunset/45 bg-night/85 text-sunset",
  neutral: "border-line bg-night/80 text-muted",
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
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[0.68rem] font-medium tracking-[0.14em] uppercase",
        variants[variant],
        className,
      )}
    >
      {variant === "live" && <span className="live-dot" aria-hidden />}
      {children}
    </span>
  );
}
