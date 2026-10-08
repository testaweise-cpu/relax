"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { cn } from "@/lib/cn";
import type { ProfileImage } from "@/lib/data/types";
import { Lightbox, type LightboxHandle } from "../ui/lightbox";

/** Bildergalerie der Sedcard: Wisch-Karussell mit Vorschaubildern + Lightbox. */
export function ProfileGallery({
  images,
  name,
}: {
  images: ProfileImage[];
  name: string;
}) {
  const t = useTranslations("sedcard");
  const track = useRef<HTMLDivElement>(null);
  const box = useRef<LightboxHandle>(null);
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
      <div
        ref={track}
        onScroll={(e) => {
          const el = e.currentTarget;
          setIndex(Math.round(el.scrollLeft / Math.max(1, el.clientWidth)));
        }}
        className="flex snap-x snap-mandatory [scrollbar-width:none] overflow-x-auto rounded-card border border-line/80 shadow-[0_32px_60px_-36px_rgb(0_0_0/0.9)]"
        aria-label={t("gallery", { name })}
        role="region"
        tabIndex={0}
      >
        {images.map((img, i) => (
          <button
            key={img.url}
            type="button"
            onClick={() => box.current?.open(i)}
            className="relative aspect-[3/4] w-full shrink-0 cursor-zoom-in snap-center"
            aria-label={t("openImage", { n: i + 1, total })}
          >
            <Image
              src={img.url}
              alt={img.alt}
              fill
              loading={i === 0 ? "eager" : undefined}
              fetchPriority={i === 0 ? "high" : undefined}
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover"
            />
          </button>
        ))}
      </div>

      {total > 1 && (
        <div className="mt-3 flex gap-2">
          {images.map((img, i) => (
            <button
              key={img.url}
              type="button"
              onClick={() => scrollTo(i)}
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

      <Lightbox
        ref={box}
        images={images}
        label={t("gallery", { name })}
        onClose={(i) => scrollTo(i, false)}
      />
    </div>
  );
}
