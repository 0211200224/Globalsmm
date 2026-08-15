"use client";

import type { CatalogService } from "@/lib/types/catalog";
import { ServiceQualityStats } from "./ServiceQualityStats";
import { useTranslations } from "@/lib/i18n/I18nProvider";

const badgeStyles: Record<string, string> = {
  Hot: "bg-tertiary-container text-on-tertiary-container",
  Stable: "bg-surface-container-highest text-on-surface-variant",
  Elite: "bg-secondary-container text-on-secondary-container",
};

export function ServiceCard({
  service,
  onOrder,
}: {
  service: CatalogService;
  onOrder: (service: CatalogService) => void;
}) {
  const t = useTranslations().marketplace;

  return (
    <div className="glass-card p-6 rounded-xl flex flex-col justify-between group hover:shadow-xl hover:border-secondary/20 transition-all duration-300">
      <div>
        <div className="flex justify-between items-start mb-4">
          <div className="p-2 rounded-lg bg-surface-container-highest text-secondary">
            <span className="material-symbols-outlined">{service.icon}</span>
          </div>
          {service.badge && (
            <span
              className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase ${badgeStyles[service.badge] ?? badgeStyles.Stable}`}
            >
              {service.badge}
            </span>
          )}
        </div>
        <p className="text-[11px] text-on-surface-variant/70 uppercase tracking-wider font-bold mb-1">
          {service.categoryName} · {service.serviceType}
        </p>
        <h3 className="text-headline-md mb-2 group-hover:text-secondary transition-colors">
          {service.name}
        </h3>
        <p className="text-body-sm text-on-surface-variant line-clamp-2 mb-6">
          {service.description}
        </p>
      </div>
      <div className="space-y-4">
        <div className="flex flex-col">
          <span className="text-[10px] text-outline uppercase tracking-wider font-bold">
            {t.pricePer1k}
          </span>
          <span className="text-headline-md text-secondary">
            {service.pricePer1000}
          </span>
        </div>
        <ServiceQualityStats service={service} />
        <div className="flex items-center justify-between text-[11px] text-on-surface-variant">
          <span>{t.min}: {service.minQuantity.toLocaleString("en-US")}</span>
          <span>{t.max}: {service.maxQuantity.toLocaleString("en-US")}</span>
        </div>
        <button
          type="button"
          onClick={() => onOrder(service)}
          className="w-full py-3 rounded-lg border border-outline-variant text-on-surface text-label-md hover:bg-surface-container-high active:scale-[0.98] transition-all"
        >
          {t.orderNow}
        </button>
      </div>
    </div>
  );
}
