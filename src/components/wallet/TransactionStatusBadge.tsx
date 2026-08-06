import type { TransactionStatus } from "@/app/wallet/data";

const config: Record<
  TransactionStatus,
  { label: string; className: string; dotClass: string; pulse?: boolean }
> = {
  completed: {
    label: "Completed",
    className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    dotClass: "bg-emerald-400",
  },
  processing: {
    label: "Processing",
    className: "bg-tertiary-container text-tertiary border-tertiary/20",
    dotClass: "bg-tertiary",
    pulse: true,
  },
  declined: {
    label: "Declined",
    className: "bg-error-container text-error border-error/20",
    dotClass: "bg-error",
  },
};

export function TransactionStatusBadge({
  status,
}: {
  status: TransactionStatus;
}) {
  const c = config[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-label-sm border ${c.className}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${c.dotClass} ${c.pulse ? "animate-pulse" : ""}`}
      />
      {c.label}
    </span>
  );
}
