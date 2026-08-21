"use client";

import { useTranslations } from "@/lib/i18n/I18nProvider";

/**
 * The service's quality score, surfaced as its own pill at the top of the
 * card/modal instead of buried inside the 2x2 stat grid (see
 * ServiceQualityStats) — so it's the first thing a buyer sees, matching
 * how the best SMM panels lead with trust signals. Renders nothing for a
 * service that hasn't been rated yet, same "no fake number" rule as before.
 */
export function QualityBadge({ qualityScore }: { qualityScore: number | null }) {
  const t = useTranslations().marketplace;
  if (qualityScore == null) return null;

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-tertiary-container text-on-tertiary-container text-[11px] font-bold">
      <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>
        star
      </span>
      {t.quality} {qualityScore.toFixed(1)}
    </span>
  );
}
