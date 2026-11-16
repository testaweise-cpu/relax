"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useRef } from "react";
import {
  StoryViewer,
  type StoryViewerHandle,
} from "@/components/ui/story-viewer";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import { setScrollLock } from "@/lib/scroll-lock";
import { ROSE_PATH, ROSE_VIEWBOX } from "@/assets/rose-mark";

export type StoryRingGroup = {
  slug: string | null;
  name: string | null;
  avatar: { url: string } | null;
  stories: {
    id: string;
    image: { url: string } | null;
    video: string | null;
    caption: string | null;
  }[];
};

function Ring({ group, large }: { group: StoryRingGroup; large?: boolean }) {
  const t = useTranslations("profile");
  const viewer = useRef<StoryViewerHandle>(null);
  const name = group.name ?? t("storyHouse");
  return (
    <>
      <button
        type="button"
        onClick={() => viewer.current?.open(0)}
        className="story-ring-button group"
        aria-label={t("storyOpen", { name })}
      >
        <span className={cn("story-ring", large && "story-ring-lg")}>
          <span className="story-ring-inner">
            {/* Stories des Hauses: die Rose aus dem Logo statt eines Fotoausschnitts */}
            {!group.slug ? (
              <span className="story-ring-house" aria-hidden>
                <svg
                  viewBox={`0 0 ${ROSE_VIEWBOX.width} ${ROSE_VIEWBOX.height}`}
                >
                  <path fill="currentColor" fillRule="evenodd" d={ROSE_PATH} />
                </svg>
              </span>
            ) : group.avatar ? (
              <Image
                src={group.avatar.url}
                alt=""
                fill
                sizes={large ? "112px" : "88px"}
                className="object-cover object-top"
              />
            ) : (
              <span className="story-ring-empty" aria-hidden />
            )}
          </span>
        </span>
        {/* Auf der Sedcard steht der Name direkt daneben */}
        <span className="story-ring-name">{large ? "Story" : name}</span>
      </button>
      <StoryViewer
        ref={viewer}
        label={t("storyOpen", { name })}
        title={name}
        images={group.stories.map((s, i) => ({
          url: s.image?.url ?? "",
          video: s.video,
          alt: `${name} – Story ${i + 1}`,
          caption: s.caption,
        }))}
        action={
          group.slug ? (
            <Link
              href={`/mieterinnen/${group.slug}`}
              // Der Dialog verschwindet mit der Seite: Scrollsperre selbst lösen
              onClick={() => setScrollLock(false)}
              className="glass-chip inline-flex min-h-11 items-center rounded-full border border-gold/50 px-5 font-label text-xs tracking-[0.2em] text-ink uppercase no-underline"
            >
              {t("toSedcard")} →
            </Link>
          ) : undefined
        }
      />
    </>
  );
}

/** Leiste der laufenden Stories: runde Bilder mit leuchtendem Ring. */
export function StoryRail({
  groups,
  className,
}: {
  groups: StoryRingGroup[];
  className?: string;
}) {
  const t = useTranslations("profile");
  if (groups.length === 0) return null;
  return (
    <section aria-label={t("stories")} className={cn("story-rail", className)}>
      <div className="container-page story-rail-inner">
        <div className="story-rail-label">
          <p className="eyebrow">{t("stories")}</p>
          <p className="mt-2 text-sm text-muted">{t("storiesLead")}</p>
        </div>
        <ul className="story-rail-list">
          {groups.map((g) => (
            <li key={g.slug ?? "haus"}>
              <Ring group={g} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Einzelner Ring, z. B. neben dem Namen auf der Sedcard. */
export function StoryBadge({ group }: { group: StoryRingGroup }) {
  return <Ring group={group} large />;
}
