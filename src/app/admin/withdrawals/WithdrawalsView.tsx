"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { Pill } from "@/components/ui/Pill";
import { setWithdrawalStatus } from "@/lib/actions/admin-withdrawals";
import type { WithdrawalStatus } from "@/generated/prisma/client";
import { useTranslations } from "@/lib/i18n/I18nProvider";
import { formatMessage } from "@/lib/i18n/format-message";

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
  const t = useTranslations().admin.withdrawals;
  const [isPending, startTransition] = useTransition();

  const statusLabels: Record<WithdrawalStatus, string> = {
    PENDING: t.statusPending,
    APPROVED: t.statusApproved,
    PAID: t.statusPaid,
    REJECTED: t.statusRejected,
  };

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
      header: t.colAffiliate,
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
    { header: t.colRequested, render: (row) => row.createdAtLabel },
    {
      header: t.colAmount,
      align: "right",
      render: (row) => (
        <span className="font-mono font-bold text-on-surface">{row.amount}</span>
      ),
    },
    {
      header: t.colStatus,
      render: (row) => <Pill tone={statusTone[row.status]}>{statusLabels[row.status]}</Pill>,
    },
    {
      header: t.colActions,
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
                {t.approve}
              </button>
            )}
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleAction(row.id, "PAID")}
              className="px-3 py-1.5 rounded-lg border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 text-label-sm transition-colors disabled:opacity-50"
            >
              {t.markPaid}
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleAction(row.id, "REJECTED")}
              className="px-3 py-1.5 rounded-lg border border-error/30 text-error hover:bg-error/10 text-label-sm transition-colors disabled:opacity-50"
            >
              {t.reject}
            </button>
          </div>
        ) : (
          <span className="text-label-sm text-on-surface-variant/50">{t.dash}</span>
        ),
    },
  ];

  return (
    <DataTable
      title={formatMessage(t.tableTitle, { count: withdrawals.length })}
      columns={columns}
      rows={withdrawals}
      rowKey={(row) => row.id}
      emptyMessage={t.noWithdrawals}
    />
  );
}
