import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";

type NeonTextProps = {
  children: ReactNode;
  as?: ElementType;
  color?: "pink" | "cyan" | "sunset";
  /** leicht schräg gestellt (rotate -4deg) */
  tilt?: boolean;
  /** seltenes Flackern */
  flicker?: boolean;
  /** "schaltet sich ein" beim ersten Rendern */
  ignite?: boolean;
  className?: string;
};

/** Leuchtschrift in der Neon-Schreibschrift. Sparsam einsetzen. */
export function NeonText({
  children,
  as: Tag = "span",
  color = "pink",
  tilt = false,
  flicker = false,
  ignite = false,
  className,
}: NeonTextProps) {
  return (
    <Tag
      className={cn(
        "neon",
        color === "cyan" && "neon-cyan",
        color === "sunset" && "neon-sunset",
        tilt && "neon-tilt",
        flicker && "neon-flicker",
        ignite && "neon-ignite",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
