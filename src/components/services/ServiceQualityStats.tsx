"use client";

import type { CatalogService } from "@/lib/types/catalog";
import { useTranslations } from "@/lib/i18n/I18nProvider";
import { formatMessage } from "@/lib/i18n/format-message";

type Props = {
  service: Pick<CatalogService, "qualityScore" | "retentionPercent" | "refillDays" | "speedLabel">;
};

/**
 * The "trust box" shown on service cards and in the order modal so buyers
 * can see quality/speed/retention/refill before they pay — matches the
 * transparency competitors like 5SMM lead with. qualityScore and
 * retentionPercent are optional (admin-set); a service that hasn't been
 * rated yet just shows fewer tiles instead of a fake number.
 */
export function ServiceQualityStats({ service }: Props) {
  const t = useTranslations().marketplace;
  const stats: { icon: string; label: string; value: string }[] = [];

  if (service.qualityScore != null) {
    stats.push({ icon: "star", label: t.quality, value: `${service.qualityScore.toFixed(1)}/10` });
  }
  stats.push({ icon: "bolt", label: t.avgStart, value: service.speedLabel });
  if (service.retentionPercent != null) {
    stats.push({ icon: "trending_up", label: t.retention, value: `${service.retentionPercent}%` });
  }
  stats.push({
    icon: "autorenew",
    label: t.refill,
    value:
      service.refillDays > 0
        ? formatMessage(t.refillDaysValue, { days: service.refillDays })
        : t.refillNone,
  });

  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-2 py-3 border-y border-white/5">
      {stats.map((s) => (
        <div key={s.label} className="flex items-center gap-1.5 min-w-0">
          <span className="material-symbols-outlined text-[15px] text-secondary shrink-0">
            {s.icon}
          </span>
          <span className="text-[11px] text-on-surface-variant truncate">
            {s.label}:{" "}
            <span className="text-on-surface font-semibold">{s.value}</span>
          </span>
        </div>
      ))}
    </div>
  );
}
