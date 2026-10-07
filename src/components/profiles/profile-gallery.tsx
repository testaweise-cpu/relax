"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { setScrollLock } from "@/lib/scroll-lock";
import type { ProfileImage } from "@/lib/data/types";
import { CloseIcon } from "../ui/icons";

/**
 * Bildergalerie der Sedcard.
 * - Seite: Wisch-Karussell (scroll-snap) mit Vorschaubildern.
 * - Lightbox: Vollbild-<dialog>, wischen (scroll-snap), Pfeiltasten, Escape.
 */
export function ProfileGallery({
  images,
  name,
}: {
  images: ProfileImage[];
  name: string;
}) {
  const t = useTranslations("sedcard");
  const track = useRef<HTMLDivElement>(null);
  const boxTrack = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState(0);
  const [boxIndex, setBoxIndex] = useState(0);
  const total = images.length;

  const scrollTo = (el: HTMLDivElement | null, i: number, smooth = true) => {
    if (!el) return;
    el.scrollTo({
      left: i * el.clientWidth,
      behavior: smooth ? "smooth" : "instant",
    });
  };

  // Aktuellen Index aus der Scrollposition ableiten
  const onScroll = (el: HTMLDivElement | null, set: (i: number) => void) => {
    if (!el) return;
    set(Math.round(el.scrollLeft / Math.max(1, el.clientWidth)));
  };

  const open = (i: number) => {
    dialog.current?.showModal();
    setScrollLock(true);
    setBoxIndex(i);
    requestAnimationFrame(() => scrollTo(boxTrack.current, i, false));
  };

  const step = useCallback(
    (dir: 1 | -1) => {
      const next = Math.min(total - 1, Math.max(0, boxIndex + dir));
      scrollTo(boxTrack.current, next);
    },
    [boxIndex, total],
  );

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    const onKey = (e: KeyboardEvent) => {
      if (!d.open) return;
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step]);

  if (total === 0) return null;

  return (
    <div>
      <div
        ref={track}
        onScroll={() => onScroll(track.current, setIndex)}
        className="flex snap-x snap-mandatory [scrollbar-width:none] overflow-x-auto rounded-card border border-pink/60 shadow-[0_0_18px_color-mix(in_oklab,var(--pink)_35%,transparent)]"
        aria-label={t("gallery", { name })}
        role="region"
        tabIndex={0}
      >
        {images.map((img, i) => (
          <button
            key={img.url}
            type="button"
            onClick={() => open(i)}
            className="relative aspect-[3/4] w-full shrink-0 cursor-zoom-in snap-center"
            aria-label={t("openImage", { n: i + 1, total })}
          >
            <Image
              src={img.url}
              alt={img.alt}
              fill
              priority={i === 0}
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover"
            />
          </button>
        ))}
      </div>

      {total > 1 && (
        <div className="mt-3 flex gap-2" aria-hidden={false}>
          {images.map((img, i) => (
            <button
              key={img.url}
              type="button"
              onClick={() => scrollTo(track.current, i)}
              aria-label={t("imageOf", { n: i + 1, total })}
              aria-current={i === index ? "true" : undefined}
              className={cn(
                "relative aspect-[3/4] w-16 overflow-hidden rounded-md border transition-colors",
                i === index
                  ? "border-pink"
                  : "border-line opacity-70 hover:opacity-100",
              )}
            >
              <Image
                src={img.url}
                alt=""
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      <dialog
        ref={dialog}
        onClose={() => {
          setScrollLock(false);
          scrollTo(track.current, boxIndex, false);
        }}
        aria-label={t("gallery", { name })}
        className="m-0 h-dvh max-h-none w-full max-w-none bg-night/95 p-0 text-ink backdrop:bg-night/90"
      >
        <div className="relative flex h-full flex-col">
          <div className="flex items-center justify-between px-4 py-3">
            <p className="font-mono text-sm text-muted" aria-live="polite">
              {t("imageOf", { n: boxIndex + 1, total })}
            </p>
            <button
              type="button"
              onClick={() => dialog.current?.close()}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-line hover:border-cyan"
              autoFocus
            >
              <CloseIcon />
              <span className="sr-only">{t("close")}</span>
            </button>
          </div>
          <div
            ref={boxTrack}
            onScroll={() => onScroll(boxTrack.current, setBoxIndex)}
            className="flex flex-1 snap-x snap-mandatory [scrollbar-width:none] overflow-x-auto"
          >
            {images.map((img) => (
              <div
                key={img.url}
                className="relative h-full w-full shrink-0 snap-center"
              >
                <Image
                  src={img.url}
                  alt={img.alt}
                  fill
                  sizes="100vw"
                  className="object-contain"
                />
              </div>
            ))}
          </div>
          {total > 1 && (
            <div className="pointer-events-none absolute inset-x-0 top-1/2 hidden -translate-y-1/2 justify-between px-4 sm:flex">
              <button
                type="button"
                onClick={() => step(-1)}
                disabled={boxIndex === 0}
                className="pointer-events-auto min-h-12 min-w-12 rounded-full border border-line bg-night/80 text-2xl disabled:opacity-30"
                aria-label={t("prev")}
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => step(1)}
                disabled={boxIndex === total - 1}
                className="pointer-events-auto min-h-12 min-w-12 rounded-full border border-line bg-night/80 text-2xl disabled:opacity-30"
                aria-label={t("next")}
              >
                ›
              </button>
            </div>
          )}
        </div>
      </dialog>
    </div>
  );
}
