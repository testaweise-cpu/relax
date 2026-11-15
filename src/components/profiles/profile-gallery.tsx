"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { ProfileClip } from "@/components/ui/profile-clip";
import { useRef, useState, ViewTransition } from "react";
import {
  SEDCARD_SIZES,
  sedcardTransitionName,
} from "@/components/ui/sedcard-tile";
import { cn } from "@/lib/cn";
import type { ProfileImage } from "@/lib/data/types";
import { StoryViewer, type StoryViewerHandle } from "../ui/story-viewer";

/**
 * Bildergalerie der Sedcard: Wisch-Karussell mit Vorschaubildern; Antippen
 * öffnet die Bilder im Story-Modus. Das erste Bild übernimmt per View
 * Transition die Kachel aus der Liste.
 */
export function ProfileGallery({
  images,
  video,
  name,
  slug,
}: {
  images: ProfileImage[];
  /** kurzes Video, das über dem ersten Bild läuft */
  video?: string | null;
  name: string;
  slug: string;
}) {
  const t = useTranslations("sedcard");
  const track = useRef<HTMLDivElement>(null);
  const story = useRef<StoryViewerHandle>(null);
  const [index, setIndex] = useState(0);
  const total = images.length;

  const scrollTo = (i: number, smooth = true) => {
    const el = track.current;
    if (el)
      el.scrollTo({
        left: i * el.clientWidth,
        behavior: smooth ? "smooth" : "instant",
      });
  };

  if (total === 0) return null;

  return (
    <div>
      <div className="profile-stage relative">
        <div
          ref={track}
          onScroll={(e) => {
            const el = e.currentTarget;
            setIndex(Math.round(el.scrollLeft / Math.max(1, el.clientWidth)));
          }}
          className="flex snap-x snap-mandatory [scrollbar-width:none] overflow-x-auto rounded-[var(--radius-lg)] border border-line/80 shadow-[0_40px_80px_-40px_rgb(0_0_0/0.95)]"
          aria-label={t("gallery", { name })}
          role="region"
          tabIndex={0}
        >
          {images.map((img, i) => {
            const picture = (
              <Image
                src={img.url}
                alt={img.alt || t("imageAlt", { name, n: i + 1 })}
                fill
                loading={i === 0 ? "eager" : undefined}
                fetchPriority={i === 0 ? "high" : undefined}
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover"
              />
            );
            return (
              <button
                key={img.url}
                type="button"
                onClick={() => story.current?.open(i)}
                className="relative aspect-[3/4] w-full shrink-0 cursor-zoom-in snap-center"
                aria-label={t("openImage", { n: i + 1, total })}
              >
                {i === 0 ? (
                  <ViewTransition
                    name={sedcardTransitionName(slug)}
                    share="morph"
                    default="none"
                  >
                    <div className="absolute inset-0">
                      {/* gleiche Variante wie in der Kachel: liegt schon im
                          Cache und füllt den Übergang, bis das große Bild da ist */}
                      <Image
                        src={img.url}
                        alt=""
                        fill
                        sizes={SEDCARD_SIZES}
                        className="object-cover"
                        aria-hidden
                      />
                      {picture}
                      {video && <ProfileClip src={video} mode="visible" />}
                    </div>
                  </ViewTransition>
                ) : (
                  picture
                )}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => story.current?.open(index)}
          className="glass-chip absolute right-3 bottom-3 inline-flex min-h-11 items-center gap-2 rounded-[var(--radius)] border border-ink/25 px-4 font-label text-[0.68rem] tracking-[0.2em] text-ink uppercase"
        >
          <span aria-hidden>▶</span>
          {t("story")}
        </button>

        {total > 1 && (
          <div
            className="pointer-events-none absolute inset-x-3 top-3 flex gap-1"
            aria-hidden
          >
            {images.map((img, i) => (
              <span
                key={img.url}
                className={cn(
                  "h-0.5 flex-1 rounded-full transition-colors",
                  i === index ? "bg-ink" : "bg-ink/30",
                )}
              />
            ))}
          </div>
        )}
      </div>

      {total > 1 && (
        <div className="mt-3 flex [scrollbar-width:none] gap-2 overflow-x-auto">
          {images.map((img, i) => (
            <button
              key={img.url}
              type="button"
              onClick={() => scrollTo(i)}
              aria-label={t("imageOf", { n: i + 1, total })}
              aria-current={i === index ? "true" : undefined}
              className={cn(
                "relative aspect-[3/4] w-16 shrink-0 overflow-hidden rounded-md border transition-[opacity,border-color]",
                i === index
                  ? "border-gold"
                  : "border-line opacity-60 hover:opacity-100",
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

      <StoryViewer
        ref={story}
        images={images}
        title={name}
        label={t("gallery", { name })}
        onClose={(i) => scrollTo(i, false)}
      />
    </div>
  );
}
