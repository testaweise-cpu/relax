import { connection } from "next/server";
import { getDataSource } from "@/lib/data";
import {
  isShiftActive,
  profileTimeLabel,
  weekPlan,
  type TimeLocale,
} from "@/lib/time/shifts";
import { SedcardTile } from "./ui/sedcard-tile";

/**
 * Vorschau der Datenschicht für den Styleguide: zeigt, was die Quelle
 * (Mock oder VyceON) gerade liefert, inklusive Zeit-Labels und Wochenplan.
 */
export async function DataPreview({ locale }: { locale: TimeLocale }) {
  await connection(); // pro Anfrage rendern – "jetzt" muss stimmen
  const ds = getDataSource();
  const now = new Date();
  const [profiles, presence, shifts] = await Promise.all([
    ds.listProfiles(),
    ds.getPresence(),
    ds.listShifts(now, new Date(now.getTime() + 8 * 86400000)),
  ]);
  const presentIds = new Set(presence.map((p) => p.profileId));
  const shiftsOf = (id: string) => shifts.filter((s) => s.profileId === id);
  const sorted = [...profiles].sort(
    (a, b) => Number(presentIds.has(b.id)) - Number(presentIds.has(a.id)),
  );
  const sample = sorted.find((p) => presentIds.has(p.id)) ?? sorted[0];
  const plan = sample ? weekPlan(shiftsOf(sample.id), now, locale) : [];

  return (
    <div>
      <p className="font-mono text-sm text-muted">
        Quelle: <span className="text-cyan">{ds.name}</span> · {profiles.length}{" "}
        Profile · {presence.length} jetzt da · {shifts.length} Schichten (8
        Tage)
      </p>
      <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {sorted.slice(0, 8).map((p, i) => (
          <li key={p.id}>
            <SedcardTile
              slug={p.slug}
              name={p.name}
              languages={p.languages.map((l) => l.toUpperCase())}
              isNew={p.isNew}
              isBack={p.isBack}
              isLive={presentIds.has(p.id)}
              timeLabel={profileTimeLabel(shiftsOf(p.id), now, locale)}
              image={p.images[0]}
              priority={i < 2}
            />
          </li>
        ))}
      </ul>

      {sample && (
        <div className="mt-10 max-w-md rounded-card border border-line bg-panel p-5">
          <h3 className="font-display text-xl text-ink">
            Wochenplan {sample.name}
          </h3>
          <dl className="mt-4 divide-y divide-line font-mono text-sm">
            {plan.map((d) => (
              <div key={d.key} className="flex justify-between gap-4 py-2">
                <dt className={d.isToday ? "text-cyan" : "text-muted"}>
                  {d.weekday} {d.date}
                </dt>
                <dd className="text-right text-ink">
                  {d.slots.length === 0
                    ? "–"
                    : d.slots.map((s) => (
                        <span
                          key={s.range}
                          className={s.active ? "block text-cyan" : "block"}
                        >
                          {s.range}
                        </span>
                      ))}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-xs text-muted">
            Aktiv jetzt:{" "}
            {shiftsOf(sample.id).some((s) => isShiftActive(s, now))
              ? "ja"
              : "nein"}
          </p>
        </div>
      )}
    </div>
  );
}
