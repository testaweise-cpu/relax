import { SedcardTile } from "@/components/ui/sedcard-tile";
import type { ExplorerCard } from "@/lib/profiles/explore";

export function ProfileGrid({ cards }: { cards: ExplorerCard[] }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
      {cards.map((c, i) => (
        <li key={c.slug} className="reveal">
          <SedcardTile
            slug={c.slug}
            name={c.name}
            languages={c.languages.map((l) => l.toUpperCase())}
            isLive={c.isLive}
            liveState={c.liveState}
            isNew={c.isNew}
            isBack={c.isBack}
            timeLabel={c.timeLabel}
            image={c.image}
            priority={i < 2}
          />
        </li>
      ))}
    </ul>
  );
}
