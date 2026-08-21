"use client";

import { useState } from "react";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { Pill } from "@/components/ui/Pill";
import { useTranslations } from "@/lib/i18n/I18nProvider";
import { formatMessage } from "@/lib/i18n/format-message";

export type AdminTransactionRow = {
  id: string;
  customerName: string;
  type: string;
  method: string;
  amount: string;
  status: string;
  createdAtLabel: string;
};

const statusTone: Record<string, "warning" | "positive" | "negative"> = {
  PENDING: "warning",
  COMPLETED: "positive",
  FAILED: "negative",
};

export function PaymentsView({ transactions }: { transactions: AdminTransactionRow[] }) {
  const t = useTranslations().admin.payments;
  const [query, setQuery] = useState("");

  const typeLabels: Record<string, string> = {
    DEPOSIT: t.typeDeposit,
    DEBIT: t.typeDebit,
    REFUND: t.typeRefund,
    COMMISSION_PAYOUT: t.typeCommissionPayout,
  };
  const statusLabels: Record<string, string> = {
    PENDING: t.statusPending,
    COMPLETED: t.statusCompleted,
    FAILED: t.statusFailed,
  };

  const filtered = transactions.filter((row) =>
    row.customerName.toLowerCase().includes(query.toLowerCase()),
  );

  const columns: DataTableColumn<AdminTransactionRow>[] = [
    { header: t.colCustomer, render: (row) => row.customerName },
    { header: t.colType, render: (row) => <Pill tone="info">{typeLabels[row.type] ?? row.type}</Pill> },
    { header: t.colMethod, render: (row) => row.method },
    { header: t.colDate, render: (row) => row.createdAtLabel },
    {
      header: t.colAmount,
      align: "right",
      render: (row) => (
        <span className="font-mono font-bold text-on-surface">{row.amount}</span>
      ),
    },
    {
      header: t.colStatus,
      render: (row) => (
        <Pill tone={statusTone[row.status] ?? "info"}>{statusLabels[row.status] ?? row.status}</Pill>
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
      emptyMessage={t.noTransactions}
    />
  );
}
