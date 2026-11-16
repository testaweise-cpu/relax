import { ROSE_PATH, ROSE_VIEWBOX } from "@/assets/rose-mark";
import { cn } from "@/lib/cn";

/**
 * Leuchtende Rose aus dem Logo: steht für „jetzt im Haus“. Verfügbar leuchtet
 * sie voll und atmet, im Haus (gerade beschäftigt) glimmt sie nur.
 * Rein schmückend – den Zustand nennt immer ein Text daneben.
 */
export function LiveRose({
  ready = false,
  size = 18,
  className,
}: {
  ready?: boolean;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${ROSE_VIEWBOX.width} ${ROSE_VIEWBOX.height}`}
      width={size}
      height={Math.round((size * ROSE_VIEWBOX.height) / ROSE_VIEWBOX.width)}
      className={cn("live-rose", ready && "is-ready", className)}
    >
      <path fill="currentColor" fillRule="evenodd" d={ROSE_PATH} />
    </svg>
  );
}
