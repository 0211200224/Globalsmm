"use client";

import { useState } from "react";
import Link from "next/link";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { TicketStatusBadge } from "@/components/support/TicketStatusBadge";
import { NewTicketModal } from "@/components/support/NewTicketModal";
import type { TicketListRow } from "@/lib/types/support";

export function SupportView({
  tickets,
  orders,
}: {
  tickets: TicketListRow[];
  orders: { id: string; label: string }[];
}) {
  const [showNew, setShowNew] = useState(false);

  const columns: DataTableColumn<TicketListRow>[] = [
    {
      header: "Ticket",
      render: (row) => (
        <Link href={`/support/${row.id}`} className="group">
          <p className="text-body-sm font-medium text-on-surface group-hover:text-primary transition-colors">
            {row.subject}
          </p>
          <p className="text-label-sm text-on-surface-variant font-mono">
            {row.ticketCode}
            {row.orderCode && ` · Order ${row.orderCode}`}
          </p>
        </Link>
      ),
    },
    { header: "Date", render: (row) => row.createdAtLabel },
    { header: "Messages", render: (row) => row.messageCount },
    {
      header: "Status",
      render: (row) => <TicketStatusBadge status={row.status} />,
    },
    {
      header: "",
      align: "right",
      render: (row) => (
        <Link
          href={`/support/${row.id}`}
          className="text-primary text-label-sm font-bold hover:underline"
        >
          View →
        </Link>
      ),
    },
  ];

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-gutter">
        <div>
          <h2 className="text-headline-lg text-on-surface">Support</h2>
          <p className="text-body-md text-on-surface-variant mt-1">
            Need help with an order or your account? Open a ticket and we&apos;ll get back to you.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowNew(true)}
          className="px-6 py-2.5 rounded-lg bg-primary text-on-primary font-bold flex items-center gap-2 hover:brightness-110 active:scale-95 transition-all w-fit"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          New Ticket
        </button>
      </div>

      <DataTable
        title={`${tickets.length} tickets`}
        columns={columns}
        rows={tickets}
        rowKey={(row) => row.id}
        emptyMessage="You haven't opened any support tickets yet."
      />

      {showNew && <NewTicketModal orders={orders} onClose={() => setShowNew(false)} />}
    </>
  );
}
