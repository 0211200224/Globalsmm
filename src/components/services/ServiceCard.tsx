import type { MockService } from "@/app/services/data";

const badgeStyles: Record<NonNullable<MockService["badge"]>, string> = {
  Hot: "bg-tertiary-container text-on-tertiary-container",
  Stable: "bg-surface-container-highest text-on-surface-variant",
  Elite: "bg-secondary-container text-on-secondary-container",
};

export function ServiceCard({ service }: { service: MockService }) {
  return (
    <div className="glass-card p-6 rounded-xl flex flex-col justify-between group hover:shadow-xl hover:border-secondary/20 transition-all duration-300">
      <div>
        <div className="flex justify-between items-start mb-4">
          <div className="p-2 rounded-lg bg-surface-container-highest text-secondary">
            <span className="material-symbols-outlined">{service.icon}</span>
          </div>
          {service.badge && (
            <span
              className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase ${badgeStyles[service.badge]}`}
            >
              {service.badge}
            </span>
          )}
        </div>
        <h3 className="text-headline-md mb-2 group-hover:text-secondary transition-colors">
          {service.name}
        </h3>
        <p className="text-body-sm text-on-surface-variant line-clamp-2 mb-6">
          {service.description}
        </p>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between py-3 border-y border-white/5">
          <div className="flex flex-col">
            <span className="text-[10px] text-outline uppercase tracking-wider font-bold">
              Price / 1k
            </span>
            <span className="text-headline-md text-secondary">
              {service.pricePer1000}
            </span>
          </div>
          <div className="flex flex-col text-right">
            <span className="text-[10px] text-outline uppercase tracking-wider font-bold">
              Avg. Speed
            </span>
            <span className="text-label-md text-on-surface">
              {service.speed}
            </span>
          </div>
        </div>
        <button
          type="button"
          className="w-full py-3 rounded-lg border border-outline-variant text-on-surface text-label-md hover:bg-surface-container-high active:scale-[0.98] transition-all"
        >
          Details
        </button>
      </div>
    </div>
  );
}
