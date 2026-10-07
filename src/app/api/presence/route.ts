import { getPresentProfiles } from "@/lib/data";
import type { PresenceResponse } from "@/lib/data/presence-dto";

// Die Daten selbst sind 60 s gecacht (fetch-Cache in der VyceON-Quelle);
// die Route läuft pro Anfrage, damit "jetzt" immer stimmt.
export const dynamic = "force-dynamic";

export async function GET() {
  const present = await getPresentProfiles();
  const body: PresenceResponse = {
    updatedAt: new Date().toISOString(),
    present: present.map(({ profile, presence }) => ({
      slug: profile.slug,
      name: profile.name,
      languages: profile.languages,
      isNew: profile.isNew,
      isBack: profile.isBack,
      image: profile.images[0] ?? null,
      since: presence.since,
      until: presence.until ?? null,
    })),
  };
  return Response.json(body, {
    headers: {
      "Cache-Control":
        "public, max-age=30, s-maxage=60, stale-while-revalidate=120",
    },
  });
}
