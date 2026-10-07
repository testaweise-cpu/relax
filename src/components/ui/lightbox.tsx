"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { setScrollLock } from "@/lib/scroll-lock";
import { CloseIcon } from "./icons";

export type LightboxImage = { url: string; alt: string };
export type LightboxHandle = { open: (index: number) => void };

/**
 * Vollbild-Lightbox: <dialog> (Fokus bleibt drin, Escape schließt),
 * wischen per scroll-snap, Pfeiltasten und Buttons am Desktop.
 */
export const Lightbox = forwardRef<
  LightboxHandle,
  { images: LightboxImage[]; label: string; onClose?: (index: number) => void }
>(function Lightbox({ images, label, onClose }, ref) {
  const t = useTranslations("sedcard");
  const dialog = useRef<HTMLDialogElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const total = images.length;

  const go = (i: number, smooth = true) => {
    const el = track.current;
    if (el)
      el.scrollTo({
        left: i * el.clientWidth,
        behavior: smooth ? "smooth" : "instant",
      });
  };

  useImperativeHandle(ref, () => ({
    open(i: number) {
      dialog.current?.showModal();
      setScrollLock(true);
      setIndex(i);
      requestAnimationFrame(() => go(i, false));
    },
  }));

  const step = useCallback(
    (dir: 1 | -1) => go(Math.min(total - 1, Math.max(0, index + dir))),
    [index, total],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!dialog.current?.open) return;
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step]);

  return (
    <dialog
      ref={dialog}
      onClose={() => {
        setScrollLock(false);
        onClose?.(index);
      }}
      aria-label={label}
      className="m-0 h-dvh max-h-none w-full max-w-none bg-night/95 p-0 text-ink backdrop:bg-night/90"
    >
      <div className="relative flex h-full flex-col">
        <div className="flex items-center justify-between px-4 py-3">
          <p className="font-mono text-sm text-muted" aria-live="polite">
            {t("imageOf", { n: index + 1, total })}
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
          ref={track}
          onScroll={(e) => {
            const el = e.currentTarget;
            setIndex(Math.round(el.scrollLeft / Math.max(1, el.clientWidth)));
          }}
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
              disabled={index === 0}
              className="pointer-events-auto min-h-12 min-w-12 rounded-full border border-line bg-night/80 text-2xl disabled:opacity-30"
              aria-label={t("prev")}
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              disabled={index === total - 1}
              className="pointer-events-auto min-h-12 min-w-12 rounded-full border border-line bg-night/80 text-2xl disabled:opacity-30"
              aria-label={t("next")}
            >
              ›
            </button>
          </div>
        )}
      </div>
    </dialog>
  );
});
