"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useRef } from "react";
import { Lightbox, type LightboxHandle } from "./ui/lightbox";

export type GalleryItem = { url: string; alt: string; portrait: boolean };

/** Raster mit Lightbox für die Galerie-Seite. */
export function GalleryGrid({
  items,
  label,
}: {
  items: GalleryItem[];
  label: string;
}) {
  const t = useTranslations("sedcard");
  const box = useRef<LightboxHandle>(null);
  return (
    <>
      <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {items.map((item, i) => (
          <li key={item.url} className={item.portrait ? "" : "col-span-2"}>
            <button
              type="button"
              onClick={() => box.current?.open(i)}
              className="group relative block w-full cursor-zoom-in overflow-hidden rounded-card border border-line transition-[border-color,box-shadow] hover:border-red hover:shadow-[0_0_18px_color-mix(in_oklab,var(--red)_45%,transparent)]"
              style={{ aspectRatio: item.portrait ? "3 / 4" : "3 / 2" }}
              aria-label={t("openImage", { n: i + 1, total: items.length })}
            >
              <Image
                src={item.url}
                alt={item.alt}
                fill
                sizes={
                  item.portrait
                    ? "(min-width: 1024px) 25vw, 50vw"
                    : "(min-width: 1024px) 50vw, 100vw"
                }
                className="object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-[1.03]"
              />
            </button>
          </li>
        ))}
      </ul>
      <Lightbox ref={box} images={items} label={label} />
    </>
  );
}
