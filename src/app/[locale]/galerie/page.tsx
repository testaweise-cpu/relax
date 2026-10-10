import { pageMetadata } from "@/lib/site";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { imageSize } from "@/lib/image-size";
import { GalleryGrid } from "@/components/gallery-grid";
import { Section } from "@/components/ui/section";
import type { Locale } from "@/i18n/routing";
import { getGallery, pick } from "@/lib/content";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/galerie">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "gallery" });
  return pageMetadata({
    locale: locale as Locale,
    path: "/galerie",
    title: t("title"),
    description: t("metaDescription"),
  });
}

export default async function GalleryPage({
  params,
}: PageProps<"/[locale]/galerie">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const l = locale as Locale;
  const t = await getTranslations("gallery");
  const entries = await getGallery();
  const items = (category: string) =>
    entries
      .filter((e) => e.category === category && e.image)
      .map((e) => {
        const size = imageSize(e.image!);
        return {
          url: e.image!,
          alt: pick(e.alt, l),
          portrait: size.height > size.width,
        };
      });

  return (
    <>
      <Section
        level={1}
        eyebrow={t("eyebrow")}
        title={t("title")}
        intro={t("intro")}
      >
        <h2 className="mb-6 font-display text-3xl text-ink italic">
          {t("club")}
        </h2>
        <GalleryGrid items={items("club")} label={t("club")} />
        <h2 className="mt-14 mb-6 font-display text-3xl text-ink italic">
          {t("rooms")}
        </h2>
        <GalleryGrid items={items("rooms")} label={t("rooms")} />
      </Section>
      <Section tone="night-2" title={t("video")} intro={t("videoNote")}>
        <video
          className="panel aspect-[3/2] w-full max-w-4xl"
          controls
          preload="none"
          playsInline
          poster="/media/mona-roses-werbevideo-poster.webp"
          aria-label={t("videoLabel")}
        >
          <source src="/media/mona-roses-werbevideo.mp4" type="video/mp4" />
        </video>
      </Section>
    </>
  );
}
