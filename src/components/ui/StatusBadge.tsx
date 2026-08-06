export type OrderStatus =
  | "pending"
  | "processing"
  | "completed"
  | "error"
  | "canceled";

const statusStyles: Record<OrderStatus, string> = {
  pending: "bg-outline-variant/20 text-on-surface-variant",
  processing: "bg-secondary-container/20 text-secondary",
  completed: "bg-green-500/10 text-green-400",
  error: "bg-error-container/20 text-error",
  canceled: "bg-outline-variant/20 text-outline",
};

const statusLabels: Record<OrderStatus, string> = {
  pending: "Pending",
  processing: "Processing",
  completed: "Completed",
  error: "Error",
  canceled: "Canceled",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`px-3 py-1 rounded-full text-[11px] font-bold ${statusStyles[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}
