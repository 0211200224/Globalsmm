"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { Pill } from "@/components/ui/Pill";
import { setWithdrawalStatus } from "@/lib/actions/admin-withdrawals";
import type { WithdrawalStatus } from "@/generated/prisma/client";

export type AdminWithdrawalRow = {
  id: string;
  affiliateName: string;
  affiliateEmail: string;
  amount: string;
  status: WithdrawalStatus;
  createdAtLabel: string;
};

const statusTone: Record<WithdrawalStatus, "warning" | "positive" | "negative" | "info"> = {
  PENDING: "warning",
  APPROVED: "info",
  PAID: "positive",
  REJECTED: "negative",
};

export function WithdrawalsView({ withdrawals }: { withdrawals: AdminWithdrawalRow[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleAction(id: string, status: WithdrawalStatus) {
    startTransition(async () => {
      const result = await setWithdrawalStatus(id, status);
      if (!result.success) {
        alert(result.error);
        return;
      }
      router.refresh();
    });
  }

  const columns: DataTableColumn<AdminWithdrawalRow>[] = [
    {
      header: "Affiliate",
      render: (row) => (
        <div>
          <p className="text-body-sm font-medium text-on-surface">
            {row.affiliateName}
          </p>
          <p className="text-label-sm text-on-surface-variant">
            {row.affiliateEmail}
          </p>
        </div>
      ),
    },
    { header: "Requested", render: (row) => row.createdAtLabel },
    {
      header: "Amount",
      align: "right",
      render: (row) => (
        <span className="font-mono font-bold text-on-surface">{row.amount}</span>
      ),
    },
    {
      header: "Status",
      render: (row) => <Pill tone={statusTone[row.status]}>{row.status}</Pill>,
    },
    {
      header: "Actions",
      align: "right",
      render: (row) =>
        row.status === "PENDING" || row.status === "APPROVED" ? (
          <div className="flex justify-end gap-2">
            {row.status === "PENDING" && (
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleAction(row.id, "APPROVED")}
                className="px-3 py-1.5 rounded-lg border border-primary/30 text-primary hover:bg-primary/10 text-label-sm transition-colors disabled:opacity-50"
              >
                Approve
              </button>
            )}
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleAction(row.id, "PAID")}
              className="px-3 py-1.5 rounded-lg border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 text-label-sm transition-colors disabled:opacity-50"
            >
              Mark Paid
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleAction(row.id, "REJECTED")}
              className="px-3 py-1.5 rounded-lg border border-error/30 text-error hover:bg-error/10 text-label-sm transition-colors disabled:opacity-50"
            >
              Reject
            </button>
          </div>
        ) : (
          <span className="text-label-sm text-on-surface-variant/50">—</span>
        ),
    },
  ];

  return (
    <DataTable
      title={`${withdrawals.length} withdrawal requests`}
      columns={columns}
      rows={withdrawals}
      rowKey={(row) => row.id}
      emptyMessage="No withdrawal requests yet."
    />
  );
}
