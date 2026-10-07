import type { Locale } from "@/i18n/routing";
import { pick, type Localized } from "@/lib/content";

type FaqItem = { question: Localized; answer: Localized };

/** FAQ als Akkordeon (details/summary – funktioniert ohne JavaScript). */
export function Faq({ items, locale }: { items: FaqItem[]; locale: Locale }) {
  return (
    <div className="panel divide-y divide-line">
      {items.map((item, i) => (
        <details key={i} className="group px-5 py-1 open:bg-night-2/40">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 text-lg text-ink marker:hidden [&::-webkit-details-marker]:hidden">
            {pick(item.question, locale)}
            <span
              aria-hidden
              className="font-mono text-2xl text-pink transition-transform duration-200 group-open:rotate-45"
            >
              +
            </span>
          </summary>
          <p className="pb-5 text-muted">{pick(item.answer, locale)}</p>
        </details>
      ))}
    </div>
  );
}
