"use client";

import { useState } from "react";
import Link from "next/link";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { TicketStatusBadge } from "@/components/support/TicketStatusBadge";
import type { TicketListRow } from "@/lib/types/support";

export type AdminTicketRow = TicketListRow & {
  customerName: string;
};

export function AdminSupportView({ tickets }: { tickets: AdminTicketRow[] }) {
  const [query, setQuery] = useState("");

  const filtered = tickets.filter(
    (t) =>
      t.subject.toLowerCase().includes(query.toLowerCase()) ||
      t.customerName.toLowerCase().includes(query.toLowerCase()),
  );

  const columns: DataTableColumn<AdminTicketRow>[] = [
    {
      header: "Ticket",
      render: (row) => (
        <Link href={`/admin/support/${row.id}`} className="group">
          <p className="text-body-sm font-medium text-on-surface group-hover:text-tertiary transition-colors">
            {row.subject}
          </p>
          <p className="text-label-sm text-on-surface-variant font-mono">
            {row.ticketCode}
            {row.orderCode && ` · Order ${row.orderCode}`}
          </p>
        </Link>
      ),
    },
    { header: "Customer", render: (row) => row.customerName },
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
          href={`/admin/support/${row.id}`}
          className="text-tertiary text-label-sm font-bold hover:underline"
        >
          Open →
        </Link>
      ),
    },
  ];

  return (
    <DataTable
      title={`${filtered.length} tickets`}
      action={
        <input
          className="bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-label-sm px-4 py-1.5 focus:ring-1 focus:ring-tertiary w-56"
          placeholder="Search by subject or customer..."
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      }
      columns={columns}
      rows={filtered}
      rowKey={(row) => row.id}
      emptyMessage="No support tickets yet."
    />
  );
}
