import { getDataSource } from "@/lib/data";
import { ogImage, OG_SIZE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Sedcard – Mona Roses";

/** Vorschaubild einer Sedcard: Name im Neon-Schriftzug, Live-Status. */
export default async function Image({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const ds = getDataSource();
  const [profile, presence] = await Promise.all([
    ds.getProfile(slug),
    ds.getPresence(),
  ]);
  if (!profile)
    return ogImage({ eyebrow: "Mona Roses", footer: "mona-roses.com" });
  const here = presence.some((p) => p.profileId === profile.id);
  return ogImage({
    eyebrow: "Mona Roses · Berlin-Steglitz",
    script: profile.name,
    title: profile.languages.map((l) => l.toUpperCase()).join(" · "),
    badge: here ? (locale === "en" ? "Here now" : "Jetzt da") : undefined,
    footer: "mona-roses.com",
  });
}
