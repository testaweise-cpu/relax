import type { ComponentProps, ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-display font-semibold uppercase tracking-[0.12em] no-underline transition-[box-shadow,background-color,color,border-color] duration-200 disabled:cursor-not-allowed disabled:opacity-50 select-none";

const variants: Record<ButtonVariant, string> = {
  // Dunkle Schrift auf Pink: Kontrast 5,6:1
  primary:
    "bg-pink text-night shadow-[0_0_14px_color-mix(in_oklab,var(--pink)_55%,transparent)] hover:shadow-[0_0_26px_var(--pink)] hover:bg-[color-mix(in_oklab,var(--pink)_88%,white)]",
  secondary:
    "border border-cyan bg-night/70 text-cyan backdrop-blur-sm shadow-[0_0_10px_color-mix(in_oklab,var(--cyan)_30%,transparent)] hover:bg-cyan/10 hover:shadow-[0_0_20px_color-mix(in_oklab,var(--cyan)_60%,transparent)]",
  ghost: "text-ink hover:text-cyan",
};

const sizes: Record<ButtonSize, string> = {
  md: "min-h-11 px-5 text-base",
  lg: "min-h-13 px-7 text-lg",
};

export function buttonClasses({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  return cn(base, variants[variant], sizes[size], className);
}

type Common = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
};

export function Button({
  variant,
  size,
  className,
  type = "button",
  ...props
}: Common & ComponentProps<"button">) {
  return (
    <button
      type={type}
      className={buttonClasses({ variant, size, className })}
      {...props}
    />
  );
}

/** Interner Link im Button-Stil (sprachbewusst). */
export function ButtonLink({
  variant,
  size,
  className,
  ...props
}: Common & ComponentProps<typeof Link>) {
  return (
    <Link className={buttonClasses({ variant, size, className })} {...props} />
  );
}

/** Externer Link oder tel:/mailto: im Button-Stil. */
export function ButtonAnchor({
  variant,
  size,
  className,
  ...props
}: Common & ComponentProps<"a">) {
  return (
    <a className={buttonClasses({ variant, size, className })} {...props} />
  );
}
