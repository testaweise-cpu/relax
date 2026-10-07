import { getPresentProfiles } from "@/lib/data";
import { toPresenceResponse } from "@/lib/data/presence-map";

// Die Daten selbst sind 60 s gecacht (fetch-Cache in der VyceON-Quelle);
// die Route läuft pro Anfrage, damit "jetzt" immer stimmt.
export const dynamic = "force-dynamic";

export async function GET() {
  const body = toPresenceResponse(await getPresentProfiles());
  return Response.json(body, {
    headers: {
      "Cache-Control":
        "public, max-age=30, s-maxage=60, stale-while-revalidate=120",
    },
  });
}
