type CommissionStatus = "PENDING" | "AVAILABLE" | "PAID" | "VOID";

const config: Record<
  CommissionStatus,
  { label: string; className: string; dotClass: string; pulse?: boolean }
> = {
  AVAILABLE: {
    label: "Available",
    className: "bg-green-500/10 text-green-400",
    dotClass: "bg-green-400",
  },
  PENDING: {
    label: "Pending",
    className: "bg-yellow-500/10 text-yellow-400",
    dotClass: "bg-yellow-400",
    pulse: true,
  },
  PAID: {
    label: "Paid Out",
    className: "bg-primary/10 text-primary",
    dotClass: "bg-primary",
  },
  VOID: {
    label: "Void",
    className: "bg-outline-variant/20 text-outline",
    dotClass: "bg-outline",
  },
};

export function ReferralStatusBadge({ status }: { status: CommissionStatus }) {
  const c = config[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${c.className}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${c.dotClass} ${c.pulse ? "animate-pulse" : ""}`}
      />
      {c.label}
    </span>
  );
}
