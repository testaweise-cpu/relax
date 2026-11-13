import { cn } from "@/lib/cn";

/**
 * Laufband in großer Kontur-Schrift (reines CSS). Der Inhalt steht einmal
 * für Screenreader im DOM; die laufenden Kopien sind versteckt. Bei
 * reduzierter Bewegung steht das Band still.
 */
export function Marquee({
  items,
  className,
}: {
  items: string[];
  className?: string;
}) {
  const row = (hidden: boolean) => (
    <ul className="marquee-row" aria-hidden={hidden || undefined}>
      {items.map((item, i) => (
        <li key={i} className={i % 2 ? "marquee-solid" : undefined}>
          {item}
        </li>
      ))}
    </ul>
  );
  return (
    <div className={cn("marquee", className)}>
      <ul className="sr-only">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
      <div className="marquee-track" aria-hidden>
        {row(true)}
        {row(true)}
      </div>
    </div>
  );
}
