"use client";

import { useState } from "react";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { Pill } from "@/components/ui/Pill";

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
  const [query, setQuery] = useState("");

  const filtered = transactions.filter((t) =>
    t.customerName.toLowerCase().includes(query.toLowerCase()),
  );

  const columns: DataTableColumn<AdminTransactionRow>[] = [
    { header: "Customer", render: (row) => row.customerName },
    { header: "Type", render: (row) => <Pill tone="info">{row.type}</Pill> },
    { header: "Method", render: (row) => row.method },
    { header: "Date", render: (row) => row.createdAtLabel },
    {
      header: "Amount",
      align: "right",
      render: (row) => (
        <span className="font-mono font-bold text-on-surface">{row.amount}</span>
      ),
    },
    {
      header: "Status",
      render: (row) => (
        <Pill tone={statusTone[row.status] ?? "info"}>{row.status}</Pill>
      ),
    },
  ];

  return (
    <DataTable
      title={`${filtered.length} transactions`}
      action={
        <input
          className="bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-label-sm px-4 py-1.5 focus:ring-1 focus:ring-tertiary w-56"
          placeholder="Search by customer..."
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      }
      columns={columns}
      rows={filtered}
      rowKey={(row) => row.id}
      emptyMessage="No transactions yet."
    />
  );
}
