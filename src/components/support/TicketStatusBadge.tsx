import type { TicketStatus } from "@/lib/types/support";

const config: Record<TicketStatus, { label: string; className: string }> = {
  OPEN: { label: "Open", className: "bg-secondary/10 text-secondary" },
  IN_PROGRESS: { label: "In Progress", className: "bg-primary/10 text-primary" },
  RESOLVED: { label: "Resolved", className: "bg-emerald-500/10 text-emerald-400" },
  CLOSED: { label: "Closed", className: "bg-outline-variant/20 text-outline" },
};

export function TicketStatusBadge({ status }: { status: TicketStatus }) {
  const c = config[status];
  return (
    <span
      className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${c.className}`}
    >
      {c.label}
    </span>
  );
}
