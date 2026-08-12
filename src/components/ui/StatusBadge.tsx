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

const statusLabels: Record<OrderRowStatus, string> = {
  PENDING: "Pending",
  PROCESSING: "Processing",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  PARTIAL: "Partial",
  CANCELED: "Canceled",
  REFUNDED: "Refunded",
};

export function StatusBadge({ status }: { status: OrderRowStatus }) {
  return (
    <span
      className={`px-3 py-1 rounded-full text-[11px] font-bold ${statusStyles[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}
