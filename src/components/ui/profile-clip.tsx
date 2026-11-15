"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * Kurzes Video über dem Profilbild: stumm, in Schleife, ohne Bedienelemente.
 * Geladen wird erst, wenn es gebraucht wird – am Rechner beim Überfahren, auf
 * dem Handy, sobald die Kachel gut sichtbar ist. Bei „Bewegung reduzieren“
 * oder Datensparmodus bleibt das Bild stehen.
 */
export function ProfileClip({
  src,
  mode = "auto",
  className,
}: {
  src: string;
  /** auto: Hover bzw. Sichtbarkeit · visible: immer, sobald sichtbar */
  mode?: "auto" | "visible";
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const el = ref.current;
    const host = el?.parentElement;
    if (!el || !host) return;
    const saveData = (
      navigator as Navigator & { connection?: { saveData?: boolean } }
    ).connection?.saveData;
    if (
      saveData ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;

    const hover =
      mode === "auto" && window.matchMedia("(hover: hover)").matches;
    if (hover) {
      const on = () => setActive(true);
      const off = () => setActive(false);
      host.addEventListener("pointerenter", on);
      host.addEventListener("pointerleave", off);
      return () => {
        host.removeEventListener("pointerenter", on);
        host.removeEventListener("pointerleave", off);
      };
    }
    const io = new IntersectionObserver(
      ([entry]) => setActive(entry.intersectionRatio >= 0.7),
      { threshold: [0, 0.7, 1] },
    );
    io.observe(host);
    return () => io.disconnect();
  }, [mode]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (active) el.play().catch(() => {});
    else el.pause();
  }, [active]);

  return (
    <video
      ref={ref}
      // erst laden, wenn das Video gebraucht wird
      src={active || playing ? src : undefined}
      muted
      loop
      playsInline
      preload="none"
      disablePictureInPicture
      aria-hidden
      tabIndex={-1}
      onPlaying={() => setPlaying(true)}
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-500",
        playing && active ? "opacity-100" : "opacity-0",
        className,
      )}
    />
  );
}
