import type { ReferralStatus } from "@/app/affiliate/data";

const config: Record<
  ReferralStatus,
  { label: string; className: string; dotClass: string; pulse?: boolean }
> = {
  completed: {
    label: "Completed",
    className: "bg-green-500/10 text-green-400",
    dotClass: "bg-green-400",
  },
  pending: {
    label: "Pending",
    className: "bg-yellow-500/10 text-yellow-400",
    dotClass: "bg-yellow-400",
    pulse: true,
  },
};

export function ReferralStatusBadge({ status }: { status: ReferralStatus }) {
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
