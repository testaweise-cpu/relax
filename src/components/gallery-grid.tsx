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
      {/* Zeilen füllen die ganze Breite: jedes Bild wächst im Verhältnis
          seines Seitenformats (Hochformat 3:4, Querformat 3:2) */}
      <ul className="justified">
        {items.map((item, i) => {
          const ratio = item.portrait ? 3 / 4 : 3 / 2;
          return (
            <li
              key={item.url}
              className="reveal"
              style={{
                flexGrow: ratio,
                flexBasis: `calc(var(--row-h) * ${ratio})`,
                // letzte Zeile nicht übermäßig aufblasen
                maxWidth: `calc(var(--row-h) * ${ratio} * 1.75)`,
              }}
            >
              <button
                type="button"
                onClick={() => box.current?.open(i)}
                className="frame-ornate group relative block h-full w-full cursor-zoom-in overflow-hidden rounded-[var(--radius-lg)] border border-white/10 transition-[border-color] hover:border-gold/60"
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
                  className="object-cover motion-safe:transition-transform motion-safe:duration-700 motion-safe:group-hover:scale-[1.04]"
                />
              </button>
            </li>
          );
        })}
      </ul>
      <Lightbox ref={box} images={items} label={label} />
    </>
  );
}
