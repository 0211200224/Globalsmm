"use client";

import { useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { Pill } from "@/components/ui/Pill";
import {
  adminPayments as initialPayments,
  type AdminPayment,
  type AdminPaymentStatus,
} from "./data";

const statusTone: Record<AdminPaymentStatus, "warning" | "positive" | "negative"> = {
  pending_review: "warning",
  approved: "positive",
  rejected: "negative",
};

const statusLabel: Record<AdminPaymentStatus, string> = {
  pending_review: "Pending Review",
  approved: "Approved",
  rejected: "Rejected",
};

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<AdminPayment[]>(initialPayments);

  function setStatus(id: string, status: AdminPaymentStatus) {
    setPayments((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status } : p)),
    );
  }

  const pendingCount = payments.filter(
    (p) => p.status === "pending_review",
  ).length;

  const columns: DataTableColumn<AdminPayment>[] = [
    {
      header: "Transaction",
      render: (row) => (
        <span className="font-mono text-sm text-on-surface-variant">
          {row.txId}
        </span>
      ),
    },
    { header: "Customer", render: (row) => row.customerName },
    { header: "Method", render: (row) => row.method },
    { header: "Date", render: (row) => row.createdAt },
    {
      header: "Amount",
      align: "right",
      render: (row) => (
        <span className="font-mono font-bold text-on-surface">
          {row.amount}
        </span>
      ),
    },
    {
      header: "Status",
      render: (row) => (
        <Pill tone={statusTone[row.status]}>{statusLabel[row.status]}</Pill>
      ),
    },
    {
      header: "Actions",
      align: "right",
      render: (row) =>
        row.status === "pending_review" ? (
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setStatus(row.id, "approved")}
              className="px-3 py-1.5 rounded-lg border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 text-label-sm transition-colors"
            >
              Approve
            </button>
            <button
              type="button"
              onClick={() => setStatus(row.id, "rejected")}
              className="px-3 py-1.5 rounded-lg border border-error/30 text-error hover:bg-error/10 text-label-sm transition-colors"
            >
              Reject
            </button>
          </div>
        ) : (
          <span className="text-label-sm text-on-surface-variant/50">
            —
          </span>
        ),
    },
  ];

  return (
    <AdminShell>
      <div>
        <h2 className="text-headline-lg text-on-surface">Payments</h2>
        <p className="text-body-md text-on-surface-variant mt-1">
          {pendingCount > 0
            ? `${pendingCount} pagamento(s) aguardando aprovação manual.`
            : "Nenhum pagamento pendente de revisão."}
        </p>
      </div>

      <DataTable
        title={`${payments.length} transactions`}
        columns={columns}
        rows={payments}
        rowKey={(row) => row.id}
      />
    </AdminShell>
  );
}
