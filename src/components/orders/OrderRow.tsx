import type { MockOrder } from "@/app/orders/data";

const statusConfig: Record<
  MockOrder["status"],
  {
    label: string;
    badgeClass: string;
    barClass: string;
    valueClass: string;
    labelClass: string;
    dot?: boolean;
    icon?: string;
  }
> = {
  processing: {
    label: "Processing",
    badgeClass:
      "bg-secondary-container/30 border-secondary-container text-on-secondary-container",
    barClass: "bg-secondary",
    valueClass: "text-secondary",
    labelClass: "text-on-surface-variant",
    dot: true,
  },
  completed: {
    label: "Completed",
    badgeClass: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
    barClass: "bg-emerald-500",
    valueClass: "text-emerald-400",
    labelClass: "text-on-surface-variant",
    icon: "check_circle",
  },
  pending: {
    label: "Active",
    badgeClass: "bg-surface-container-highest border-white/10 text-on-surface-variant",
    barClass: "bg-secondary/30",
    valueClass: "text-on-surface-variant",
    labelClass: "text-on-surface-variant",
  },
  error: {
    label: "Error",
    badgeClass: "bg-error/10 border-error/30 text-error",
    barClass: "bg-error",
    valueClass: "text-error",
    labelClass: "text-error",
  },
};

export function OrderRow({ order }: { order: MockOrder }) {
  const config = statusConfig[order.status];

  return (
    <div className="bg-surface-container border border-white/5 p-4 md:p-6 rounded-xl flex flex-col md:flex-row md:items-center gap-6 group transition-all duration-300 hover:-translate-y-0.5 hover:border-outline-variant">
      <div className="flex items-center gap-4 md:w-1/4">
        <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center text-on-surface-variant group-hover:text-secondary transition-colors border border-white/5">
          <span className="material-symbols-outlined text-3xl">
            {order.icon}
          </span>
        </div>
        <div>
          <h4 className="text-label-md text-on-surface">{order.service}</h4>
          <p className="text-body-sm text-on-surface-variant">
            Order {order.orderId}
          </p>
        </div>
      </div>

      <div className="flex-1 space-y-2">
        <div className="flex justify-between items-end mb-1">
          <span className={`text-label-sm ${config.labelClass}`}>
            {order.progressLabel}
          </span>
          <span className={`text-label-md font-bold ${config.valueClass}`}>
            {order.progressValueLabel}
          </span>
        </div>
        <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${config.barClass}`}
            style={{ width: `${order.progressPercent}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between md:justify-end gap-6 md:w-1/3">
        <div className="text-right hidden sm:block">
          <p className="text-label-sm text-on-surface-variant">Quantity</p>
          <p className="text-label-md text-on-surface">
            {order.quantity.toLocaleString("en-US")}
          </p>
        </div>
        <div
          className={`px-3 py-1 rounded-full border text-[11px] font-bold flex items-center gap-1.5 uppercase tracking-wider ${config.badgeClass}`}
        >
          {config.dot && (
            <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
          )}
          {config.icon && (
            <span className="material-symbols-outlined text-[14px]">
              {config.icon}
            </span>
          )}
          {config.label}
        </div>
        {order.status === "completed" && (
          <button
            type="button"
            className="p-2 bg-surface-container-highest hover:bg-surface-bright rounded-lg text-on-surface-variant transition-colors border border-white/5 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">refresh</span>
            <span className="text-label-sm hidden lg:inline">Refill</span>
          </button>
        )}
        {order.status === "pending" && (
          <button
            type="button"
            disabled
            className="p-2 opacity-30 cursor-not-allowed bg-surface-container-highest rounded-lg text-on-surface-variant border border-white/5 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">refresh</span>
            <span className="text-label-sm hidden lg:inline">Refill</span>
          </button>
        )}
        {order.status === "error" && (
          <button
            type="button"
            className="p-2 bg-secondary/10 hover:bg-secondary/20 text-secondary rounded-lg transition-colors border border-secondary/20 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">
              support_agent
            </span>
            <span className="text-label-sm hidden lg:inline">Help</span>
          </button>
        )}
      </div>
    </div>
  );
}
