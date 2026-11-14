import { ROSE_PATH, ROSE_VIEWBOX } from "@/assets/rose-mark";
import { cn } from "@/lib/cn";

/**
 * Zierlinie mit der Rose aus dem Logo: Haarlinie – Rose – Haarlinie.
 * Rein dekorativ; trennt Überschrift und Inhalt bei mittig gesetzten Köpfen.
 */
export function Ornament({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("ornament-rose", className)}
      role="presentation"
    >
      <svg
        viewBox={`0 0 ${ROSE_VIEWBOX.width} ${ROSE_VIEWBOX.height}`}
        width="26"
        height={Math.round((26 * ROSE_VIEWBOX.height) / ROSE_VIEWBOX.width)}
      >
        <path fill="currentColor" fillRule="evenodd" d={ROSE_PATH} />
      </svg>
    </div>
  );
}
