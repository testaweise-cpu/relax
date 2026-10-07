import { SedcardTile } from "@/components/ui/sedcard-tile";
import type { ProfileCard } from "@/lib/profiles/cards";

export function ProfileGrid({ cards }: { cards: ProfileCard[] }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
      {cards.map(({ profile, isLive, timeLabel }, i) => (
        <li key={profile.id}>
          <SedcardTile
            slug={profile.slug}
            name={profile.name}
            languages={profile.languages.map((l) => l.toUpperCase())}
            isLive={isLive}
            isNew={profile.isNew}
            isBack={profile.isBack}
            timeLabel={timeLabel}
            image={profile.images[0]}
            priority={i < 2}
          />
        </li>
      ))}
    </ul>
  );
}
