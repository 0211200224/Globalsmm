"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cancelMyOrder, requestRefill } from "@/lib/actions/orders";
import { useTranslations } from "@/lib/i18n/I18nProvider";
import { formatMessage } from "@/lib/i18n/format-message";
import type { Dictionary } from "@/lib/i18n/dictionary-type";
import type { OrderRowData, OrderRowStatus } from "@/lib/types/orders";

const statusStyles: Record<
  OrderRowStatus,
  {
    labelKey: keyof Dictionary["orders"];
    badgeClass: string;
    barClass: string;
    valueClass: string;
    labelClass: string;
    dot?: boolean;
    icon?: string;
  }
> = {
  PENDING: {
    labelKey: "statusPending",
    badgeClass: "bg-surface-container-highest border-white/10 text-on-surface-variant",
    barClass: "bg-secondary/30",
    valueClass: "text-on-surface-variant",
    labelClass: "text-on-surface-variant",
  },
  PENDING_ADMIN: {
    labelKey: "statusPendingAdmin",
    badgeClass: "bg-tertiary-container/40 border-tertiary/30 text-tertiary",
    barClass: "bg-tertiary/40",
    valueClass: "text-tertiary",
    labelClass: "text-on-surface-variant",
    dot: true,
  },
  PROCESSING: {
    labelKey: "statusProcessing",
    badgeClass:
      "bg-secondary-container/30 border-secondary-container text-on-secondary-container",
    barClass: "bg-secondary",
    valueClass: "text-secondary",
    labelClass: "text-on-surface-variant",
    dot: true,
  },
  IN_PROGRESS: {
    labelKey: "statusInProgress",
    badgeClass: "bg-primary/10 border-primary/30 text-primary",
    barClass: "bg-primary",
    valueClass: "text-primary",
    labelClass: "text-on-surface-variant",
    dot: true,
  },
  COMPLETED: {
    labelKey: "statusCompleted",
    badgeClass: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
    barClass: "bg-emerald-500",
    valueClass: "text-emerald-400",
    labelClass: "text-on-surface-variant",
    icon: "check_circle",
  },
  PARTIAL: {
    labelKey: "statusPartial",
    badgeClass: "bg-tertiary-container border-tertiary/30 text-tertiary",
    barClass: "bg-tertiary",
    valueClass: "text-tertiary",
    labelClass: "text-tertiary",
  },
  CANCELED: {
    labelKey: "statusCanceled",
    badgeClass: "bg-surface-container-highest border-white/10 text-outline",
    barClass: "bg-outline/40",
    valueClass: "text-outline",
    labelClass: "text-outline",
  },
  REFUNDED: {
    labelKey: "statusRefunded",
    badgeClass: "bg-error/10 border-error/30 text-error",
    barClass: "bg-error/60",
    valueClass: "text-error",
    labelClass: "text-error",
    icon: "undo",
  },
};

export function OrderRow({ order }: { order: OrderRowData }) {
  const router = useRouter();
  const t = useTranslations().orders;
  const config = statusStyles[order.status];
  const progressPercent =
    order.quantity > 0
      ? Math.min(100, Math.round((order.deliveredQuantity / order.quantity) * 100))
      : 0;

  const [loading, setLoading] = useState<"cancel" | "refill" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCancel() {
    if (!confirm(t.cancelConfirm)) return;
    setError(null);
    setLoading("cancel");
    const result = await cancelMyOrder(order.id);
    setLoading(null);
    if (!result.success) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  async function handleRefill() {
    setError(null);
    setLoading("refill");
    const result = await requestRefill(order.id);
    setLoading(null);
    if (!result.success) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="bg-surface-container border border-white/5 p-4 md:p-6 rounded-xl flex flex-col gap-4 group transition-all duration-300 hover:-translate-y-0.5 hover:border-outline-variant">
      <div className="flex flex-col md:flex-row md:items-center gap-6">
        <div className="flex items-center gap-4 md:w-1/4">
          <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center text-on-surface-variant group-hover:text-secondary transition-colors border border-white/5">
            <span className="material-symbols-outlined text-3xl">
              {order.serviceIcon}
            </span>
          </div>
          <div>
            <h4 className="text-label-md text-on-surface">{order.serviceName}</h4>
            <p className="text-body-sm text-on-surface-variant">
              {t.orderLabel} {order.orderCode} · {order.createdAtLabel}
            </p>
          </div>
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex justify-between items-end mb-1">
            <span className={`text-label-sm ${config.labelClass}`}>{t.progress}</span>
            <span className={`text-label-md font-bold ${config.valueClass}`}>
              {order.deliveredQuantity.toLocaleString("en-US")} /{" "}
              {order.quantity.toLocaleString("en-US")}
            </span>
          </div>
          <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${config.barClass}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between md:justify-end gap-6 md:w-1/4">
          <div className="text-right hidden sm:block">
            <p className="text-label-sm text-on-surface-variant">{t.charged}</p>
            <p className="text-label-md text-on-surface">{order.chargedAmount}</p>
          </div>
          <div
            className={`px-3 py-1 rounded-full border text-[11px] font-bold flex items-center gap-1.5 uppercase tracking-wider ${config.badgeClass}`}
          >
            {config.dot && (
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            )}
            {config.icon && (
              <span className="material-symbols-outlined text-[14px]">
                {config.icon}
              </span>
            )}
            {t[config.labelKey]}
          </div>
        </div>
      </div>

      {(order.canCancel || order.canRefill || error) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-white/5">
          {error ? (
            <p className="text-label-sm text-error">{error}</p>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-2 shrink-0">
            {order.canCancel && (
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading !== null}
                className="px-4 py-2 rounded-lg border border-error/30 text-error hover:bg-error/10 text-label-sm transition-colors disabled:opacity-50"
              >
                {loading === "cancel" ? t.canceling : t.cancelOrder}
              </button>
            )}
            {order.canRefill && (
              <button
                type="button"
                onClick={handleRefill}
                disabled={loading !== null}
                className="px-4 py-2 rounded-lg bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 text-label-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">
                  autorenew
                </span>
                {loading === "refill"
                  ? t.requestingRefill
                  : formatMessage(t.requestRefill, { days: order.refillDays ?? 0 })}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
