"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { HeroMedia } from "@/lib/media/hero";

/**
 * Video-Hintergrund für den Hero.
 * - Zuerst nur das Standbild (schnell, gut für LCP). Das Video bekommt kein
 *   eigenes poster – das Standbild liegt darunter, sonst würde es doppelt
 *   geladen und das Video zum späten LCP-Element.
 * - Das Video wird erst nach dem Laden der Seite nachgeladen und nur, wenn
 *   keine reduzierte Bewegung, kein Datensparmodus und kein langsames Netz.
 * - Pausiert, wenn der Hero nicht sichtbar oder der Tab im Hintergrund ist.
 */
export function HeroVideo({ media }: { media: HeroMedia }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (
      navigator as Navigator & {
        connection?: { saveData?: boolean; effectiveType?: string };
      }
    ).connection;
    // Datensparmodus oder langsames Netz (2G/3G): beim Standbild bleiben –
    // das Video ist Stimmung, kein Inhalt, und kostet rund 0,4 MB.
    const slow = /(^|-)(2g|3g)$/.test(connection?.effectiveType ?? "");
    if (reduce.matches || connection?.saveData === true || slow) return;

    const start = () => setEnabled(true);
    const idle = window.requestIdleCallback ?? ((cb) => setTimeout(cb, 1200));
    const id = idle(start);
    return () => {
      if (window.cancelIdleCallback) window.cancelIdleCallback(id as number);
      else clearTimeout(id as unknown as number);
    };
  }, []);

  useEffect(() => {
    const video = ref.current;
    if (!enabled || !video) return;
    const play = () => video.play().catch(() => {});
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !document.hidden) play();
      else video.pause();
    });
    observer.observe(video);
    const onVisibility = () => (document.hidden ? video.pause() : play());
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [enabled]);

  return (
    <div className="hero-media" aria-hidden>
      <Image
        src={media.poster}
        alt=""
        width={media.posterWidth}
        height={media.posterHeight}
        loading="eager"
        fetchPriority="high"
        sizes="100vw"
        className="hero-media-el"
        style={{ objectPosition: media.position }}
      />
      {enabled && (
        <video
          ref={ref}
          className="hero-media-el"
          style={{ objectPosition: media.position }}
          muted
          loop
          playsInline
          preload="auto"
          disablePictureInPicture
          tabIndex={-1}
        >
          {media.sources.map((s) => (
            <source key={s.src} src={s.src} type={s.type} />
          ))}
        </video>
      )}
    </div>
  );
}
