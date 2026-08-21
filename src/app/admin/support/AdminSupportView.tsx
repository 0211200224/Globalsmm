"use client";

import { useState } from "react";
import Link from "next/link";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { TicketStatusBadge } from "@/components/support/TicketStatusBadge";
import type { TicketListRow } from "@/lib/types/support";
import { useTranslations } from "@/lib/i18n/I18nProvider";
import { formatMessage } from "@/lib/i18n/format-message";

export type AdminTicketRow = TicketListRow & {
  customerName: string;
};

export function AdminSupportView({ tickets }: { tickets: AdminTicketRow[] }) {
  const t = useTranslations().admin.support;
  const [query, setQuery] = useState("");

  const filtered = tickets.filter(
    (row) =>
      row.subject.toLowerCase().includes(query.toLowerCase()) ||
      row.customerName.toLowerCase().includes(query.toLowerCase()),
  );

  const columns: DataTableColumn<AdminTicketRow>[] = [
    {
      header: t.colTicket,
      render: (row) => (
        <Link href={`/admin/support/${row.id}`} className="group">
          <p className="text-body-sm font-medium text-on-surface group-hover:text-tertiary transition-colors">
            {row.subject}
          </p>
          <p className="text-label-sm text-on-surface-variant font-mono">
            {row.ticketCode}
            {row.orderCode && formatMessage(t.orderSuffix, { code: row.orderCode })}
          </p>
        </Link>
      ),
    },
    { header: t.colCustomer, render: (row) => row.customerName },
    { header: t.colDate, render: (row) => row.createdAtLabel },
    { header: t.colMessages, render: (row) => row.messageCount },
    {
      header: t.colStatus,
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
          {t.openLink}
        </Link>
      ),
    },
  ];

  return (
    <DataTable
      title={formatMessage(t.tableTitle, { count: filtered.length })}
      action={
        <input
          className="bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-label-sm px-4 py-1.5 focus:ring-1 focus:ring-tertiary w-56"
          placeholder={t.searchPlaceholder}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      }
      columns={columns}
      rows={filtered}
      rowKey={(row) => row.id}
      emptyMessage={t.noTickets}
    />
  );
}
