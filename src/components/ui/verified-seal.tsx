import { cn } from "@/lib/cn";

/**
 * Siegel „Geprüft“ (VYCE69 Trust): massives Gold mit Häkchen, damit es sich
 * auf Fotos und neben anderen Marken klar abhebt.
 */
export function VerifiedSeal({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <span className={cn("verified-seal", className)}>
      <svg aria-hidden viewBox="0 0 16 16" width="12" height="12">
        <path
          d="M8 .8l1.7 1.3 2.1-.2.7 2 1.9 1-.5 2.1L15 8.8l-1.1 1.8.5 2.1-1.9 1-.7 2-2.1-.2L8 16.8 6.3 15.5l-2.1.2-.7-2-1.9-1 .5-2.1L1 8.8 2.1 7l-.5-2.1 1.9-1 .7-2 2.1.2z"
          fill="currentColor"
          transform="translate(0 -.8)"
        />
        <path
          d="M5 8.2l2 2 4-4.2"
          fill="none"
          stroke="var(--night)"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {label}
    </span>
  );
}
