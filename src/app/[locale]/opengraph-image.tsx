import { ogImage, OG_SIZE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Mona Roses – Berlin-Steglitz";

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return ogImage({
    eyebrow: "Berlin-Steglitz · 24/7",
    title:
      locale === "en"
        ? "Bar · Table dance · Rooms"
        : "Bar · Tabledance · Zimmer",
    footer: "mona-roses.com",
  });
}
