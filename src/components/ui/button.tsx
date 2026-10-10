import type { ComponentProps, ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-3 rounded-card font-label font-medium uppercase tracking-[0.26em] no-underline transition-[box-shadow,background-color,color,border-color] duration-500 disabled:cursor-not-allowed disabled:opacity-50 select-none";

const variants: Record<ButtonVariant, string> = {
  // Tiefes Rot mit Goldkante, helle Schrift (Kontrast ≥ 6:1)
  primary:
    "border border-gold/45 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--red)_72%,black),var(--wine))] text-ink shadow-[inset_0_1px_0_rgb(255_255_255/0.14)] hover:border-gold hover:shadow-[inset_0_1px_0_rgb(255_255_255/0.14),0_0_32px_color-mix(in_oklab,var(--red)_35%,transparent)]",
  secondary:
    "border border-gold/35 bg-night/40 text-ink hover:border-gold hover:text-gold",
  ghost: "text-ink hover:text-gold",
};

const sizes: Record<ButtonSize, string> = {
  md: "min-h-11 px-6 text-[0.72rem]",
  lg: "min-h-13 px-9 text-[0.78rem]",
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
