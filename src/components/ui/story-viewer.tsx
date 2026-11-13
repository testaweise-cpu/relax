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
  type PointerEvent as ReactPointerEvent,
} from "react";
import { cn } from "@/lib/cn";
import { setScrollLock } from "@/lib/scroll-lock";
import { CloseIcon } from "./icons";

export type StoryImage = { url: string; alt: string };
export type StoryViewerHandle = { open: (index: number) => void };

/** Anzeigedauer pro Bild im Story-Modus */
export const STORY_MS = 5000;
const DOUBLE_TAP_MS = 260;
const HOLD_MS = 220;
const SWIPE_PX = 50;
const CLOSE_PX = 120;

type Zoom = { scale: number; x: number; y: number };
const NO_ZOOM: Zoom = { scale: 1, x: 0, y: 0 };

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Vollbild-Galerie im Story-Stil.
 * - Fortschrittsbalken, automatisches Weiterblättern (nicht bei reduzierter Bewegung)
 * - Tippen rechts/links: weiter/zurück · Halten: Pause · Doppeltippen: Zoom
 * - Wischen seitlich: blättern · nach unten: schließen
 * - Tastatur: ←/→, Leertaste (Pause), Esc (über <dialog>)
 */
export const StoryViewer = forwardRef<
  StoryViewerHandle,
  {
    images: StoryImage[];
    label: string;
    title?: string;
    onClose?: (index: number) => void;
  }
>(function StoryViewer({ images, label, title, onClose }, ref) {
  const t = useTranslations("sedcard");
  const dialog = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState(0);
  const [opened, setOpened] = useState(false);
  const [paused, setPaused] = useState(false);
  const [autoplay, setAutoplay] = useState(true);
  const [zoom, setZoom] = useState<Zoom>(NO_ZOOM);
  const [dragY, setDragY] = useState(0);
  const total = images.length;

  const gesture = useRef<{
    x: number;
    y: number;
    t: number;
    zoom: Zoom;
    held: boolean;
  } | null>(null);
  const holdTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const tapTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const lastTap = useRef(0);

  const go = useCallback(
    (i: number) => {
      setZoom(NO_ZOOM);
      setIndex(Math.min(total - 1, Math.max(0, i)));
    },
    [total],
  );

  const close = useCallback(() => dialog.current?.close(), []);

  useImperativeHandle(ref, () => ({
    open(i: number) {
      setOpened(true);
      setIndex(i);
      setZoom(NO_ZOOM);
      setPaused(false);
      setAutoplay(!prefersReducedMotion());
      dialog.current?.showModal();
      setScrollLock(true);
    },
  }));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!dialog.current?.open) return;
      if (e.key === "ArrowRight") go(index + 1);
      else if (e.key === "ArrowLeft") go(index - 1);
      else if (e.key === " ") {
        e.preventDefault();
        setPaused((p) => !p);
      } else return;
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, index]);

  // Nach dem letzten Bild bleibt die Story stehen
  const advance = () => {
    if (index < total - 1) go(index + 1);
    else setAutoplay(false);
  };

  const zoomed = zoom.scale > 1;
  const running = opened && autoplay && !paused && !zoomed && total > 1;

  function onPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    gesture.current = {
      x: e.clientX,
      y: e.clientY,
      t: Date.now(),
      zoom,
      held: false,
    };
    holdTimer.current = setTimeout(() => {
      if (gesture.current) {
        gesture.current.held = true;
        setPaused(true);
      }
    }, HOLD_MS);
  }

  function onPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    const g = gesture.current;
    if (!g) return;
    const dx = e.clientX - g.x;
    const dy = e.clientY - g.y;
    if (Math.abs(dx) > 8 || Math.abs(dy) > 8) clearTimeout(holdTimer.current);
    if (g.zoom.scale > 1) {
      setZoom({ ...g.zoom, x: g.zoom.x + dx, y: g.zoom.y + dy });
    } else if (dy > 0 && Math.abs(dy) > Math.abs(dx)) {
      setDragY(dy);
    }
  }

  function onPointerUp(e: ReactPointerEvent<HTMLDivElement>) {
    clearTimeout(holdTimer.current);
    const g = gesture.current;
    gesture.current = null;
    if (!g) return;
    const dx = e.clientX - g.x;
    const dy = e.clientY - g.y;
    setDragY(0);
    if (g.held) {
      setPaused(false);
      return;
    }
    if (g.zoom.scale > 1) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) handleTap(e);
      return;
    }
    if (dy > CLOSE_PX && dy > Math.abs(dx)) return close();
    if (Math.abs(dx) > SWIPE_PX && Math.abs(dx) > Math.abs(dy))
      return go(index + (dx < 0 ? 1 : -1));
    if (Math.abs(dx) < 10 && Math.abs(dy) < 10) handleTap(e);
  }

  function handleTap(e: ReactPointerEvent<HTMLDivElement>) {
    const now = Date.now();
    const rect = e.currentTarget.getBoundingClientRect();
    if (now - lastTap.current < DOUBLE_TAP_MS) {
      clearTimeout(tapTimer.current);
      lastTap.current = 0;
      // Doppeltipp: auf die angetippte Stelle zoomen bzw. zurück
      setZoom((z) =>
        z.scale > 1
          ? NO_ZOOM
          : {
              scale: 2.2,
              x: (rect.left + rect.width / 2 - e.clientX) * 1.2,
              y: (rect.top + rect.height / 2 - e.clientY) * 1.2,
            },
      );
      return;
    }
    lastTap.current = now;
    if (zoomed) return;
    const left = e.clientX - rect.left < rect.width * 0.3;
    tapTimer.current = setTimeout(
      () => go(index + (left ? -1 : 1)),
      DOUBLE_TAP_MS,
    );
  }

  const current = images[index];

  return (
    <dialog
      ref={dialog}
      onClose={() => {
        setScrollLock(false);
        setZoom(NO_ZOOM);
        clearTimeout(tapTimer.current);
        onClose?.(index);
      }}
      aria-label={label}
      className="story m-0 h-dvh max-h-none w-full max-w-none overflow-hidden bg-night p-0 text-ink backdrop:bg-night"
    >
      {opened && current && (
        <div
          className="relative flex h-full flex-col"
          style={{
            transform: dragY ? `translateY(${dragY}px)` : undefined,
            opacity: dragY ? Math.max(0.4, 1 - dragY / 600) : undefined,
          }}
        >
          {/* Unscharfes Abbild als Raumlicht hinter dem Bild */}
          <div aria-hidden className="story-ambient">
            <Image
              src={current.url}
              alt=""
              fill
              sizes="64px"
              className="object-cover"
            />
          </div>

          <div className="relative z-10 px-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
            {total > 1 && (
              <div className="flex gap-1" aria-hidden>
                {images.map((img, i) => (
                  <span key={img.url} className="story-bar">
                    <span
                      key={`${i}-${index}-${autoplay}`}
                      className={cn(
                        "story-bar-fill",
                        (i < index || (i === index && !autoplay)) && "is-done",
                        i === index && running && "is-running",
                        i === index && !running && autoplay && "is-paused",
                      )}
                      style={{ animationDuration: `${STORY_MS}ms` }}
                      onAnimationEnd={i === index ? advance : undefined}
                    />
                  </span>
                ))}
              </div>
            )}
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="min-w-0 truncate">
                {title && (
                  <span className="mr-3 font-display text-2xl text-ink italic">
                    {title}
                  </span>
                )}
                <span
                  className="font-label text-xs tracking-[0.2em] text-ink/70 uppercase"
                  aria-live="polite"
                >
                  {t("imageOf", { n: index + 1, total })}
                </span>
              </p>
              <div className="flex shrink-0 gap-2">
                {total > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (!autoplay) {
                        setAutoplay(true);
                        setPaused(false);
                      } else setPaused((p) => !p);
                    }}
                    className="glass-chip inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-ink/20 font-label text-xs"
                    aria-label={running ? t("pause") : t("play")}
                  >
                    {running ? "❚❚" : "▶"}
                  </button>
                )}
                <button
                  type="button"
                  onClick={close}
                  className="glass-chip inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-ink/20"
                  autoFocus
                >
                  <CloseIcon />
                  <span className="sr-only">{t("close")}</span>
                </button>
              </div>
            </div>
          </div>

          <div
            className="relative z-0 flex-1 touch-none overflow-hidden select-none"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={() => {
              clearTimeout(holdTimer.current);
              gesture.current = null;
              setDragY(0);
              setPaused(false);
            }}
            onContextMenu={(e) => e.preventDefault()}
          >
            <div
              key={current.url}
              className={cn("story-frame", !zoomed && "story-enter")}
              style={{
                transform: `translate(${zoom.x}px, ${zoom.y}px) scale(${zoom.scale})`,
                cursor: zoomed ? "grab" : "pointer",
              }}
            >
              <Image
                src={current.url}
                alt={current.alt}
                fill
                sizes="100vw"
                loading="eager"
                draggable={false}
                className="object-contain"
              />
            </div>
            {/* nächstes Bild vorladen */}
            {images[index + 1] && (
              <Image
                src={images[index + 1].url}
                alt=""
                fill
                sizes="100vw"
                loading="eager"
                className="pointer-events-none invisible"
                aria-hidden
              />
            )}
          </div>

          {total > 1 && (
            <div className="pointer-events-none absolute inset-x-0 top-1/2 z-10 hidden -translate-y-1/2 justify-between px-4 sm:flex">
              <button
                type="button"
                onClick={() => go(index - 1)}
                disabled={index === 0}
                className="glass-chip pointer-events-auto min-h-12 min-w-12 rounded-full border border-ink/20 text-2xl disabled:opacity-0"
                aria-label={t("prev")}
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => go(index + 1)}
                disabled={index === total - 1}
                className="glass-chip pointer-events-auto min-h-12 min-w-12 rounded-full border border-ink/20 text-2xl disabled:opacity-0"
                aria-label={t("next")}
              >
                ›
              </button>
            </div>
          )}

          <p className="relative z-10 pb-[max(0.75rem,env(safe-area-inset-bottom))] text-center font-label text-[0.65rem] tracking-[0.2em] text-ink/50 uppercase">
            {t("storyHint")}
          </p>
        </div>
      )}
    </dialog>
  );
});
