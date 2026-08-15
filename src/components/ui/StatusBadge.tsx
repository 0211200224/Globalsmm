"use client";

import { useTranslations } from "@/lib/i18n/I18nProvider";
import type { Dictionary } from "@/lib/i18n/dictionary-type";
import type { OrderRowStatus } from "@/lib/types/orders";

const statusStyles: Record<OrderRowStatus, string> = {
  PENDING: "bg-outline-variant/20 text-on-surface-variant",
  PROCESSING: "bg-secondary-container/20 text-secondary",
  IN_PROGRESS: "bg-primary/10 text-primary",
  COMPLETED: "bg-green-500/10 text-green-400",
  PARTIAL: "bg-tertiary-container text-tertiary",
  CANCELED: "bg-outline-variant/20 text-outline",
  REFUNDED: "bg-error-container/20 text-error",
};

const statusLabelKeys: Record<OrderRowStatus, keyof Dictionary["orders"]> = {
  PENDING: "statusPending",
  PROCESSING: "statusProcessing",
  IN_PROGRESS: "statusInProgress",
  COMPLETED: "statusCompleted",
  PARTIAL: "statusPartial",
  CANCELED: "statusCanceled",
  REFUNDED: "statusRefunded",
};

export function StatusBadge({ status }: { status: OrderRowStatus }) {
  const t = useTranslations().orders;
  return (
    <span
      className={`px-3 py-1 rounded-full text-[11px] font-bold ${statusStyles[status]}`}
    >
      {t[statusLabelKeys[status]]}
    </span>
  );
}
