import type { PresentProfile } from "./index";
import type { PresenceResponse } from "./presence-dto";

/** Serverdaten → schlankes JSON für /api/presence und die Erstausgabe der Seiten. */
export function toPresenceResponse(
  present: PresentProfile[],
  now = new Date(),
): PresenceResponse {
  return {
    updatedAt: now.toISOString(),
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
}
