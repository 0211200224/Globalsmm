"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { approveOrder, updateOrderStatus } from "@/lib/actions/admin-orders";

export type PendingApprovalRow = {
  id: string;
  orderCode: string;
  customerName: string;
  serviceName: string;
  quantity: number;
  targetLink: string;
  customerPrice: string;
  /** null when the service has no costPer1000 configured yet. */
  estimatedCost: string | null;
  defaultProviderId: string | null;
  createdAtLabel: string;
};

type ProviderOption = { id: string; name: string };

export function PendingApprovalQueue({
  orders,
  providers,
}: {
  orders: PendingApprovalRow[];
  providers: ProviderOption[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<Record<string, string>>({});

  function providerFor(row: PendingApprovalRow) {
    return selectedProvider[row.id] ?? row.defaultProviderId ?? "";
  }

  function handleApprove(row: PendingApprovalRow) {
    setBusyId(row.id);
    startTransition(async () => {
      const providerId = providerFor(row) || null;
      const result = await approveOrder(row.id, providerId);
      setBusyId(null);
      if (!result.success) {
        alert(result.error);
      }
      router.refresh();
    });
  }

  function handleReject(row: PendingApprovalRow) {
    if (!confirm(`Reject order ${row.orderCode} and refund the customer?`)) return;
    setBusyId(row.id);
    startTransition(async () => {
      const result = await updateOrderStatus(row.id, "CANCELED");
      setBusyId(null);
      if (!result.success) alert(result.error ?? "Failed to reject order.");
      router.refresh();
    });
  }

  if (orders.length === 0) {
    return (
      <div className="glass-panel rounded-xl p-stack-lg border border-outline-variant/20">
        <h3 className="text-headline-md text-on-surface mb-1 flex items-center gap-2">
          <span className="material-symbols-outlined text-tertiary">pending_actions</span>
          Approval Queue
        </h3>
        <p className="text-body-sm text-on-surface-variant">
          Nothing waiting for review right now.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-xl p-stack-lg border border-tertiary/30 space-y-stack-md">
      <div className="flex items-center justify-between">
        <h3 className="text-headline-md text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-tertiary">pending_actions</span>
          Approval Queue
        </h3>
        <span className="px-3 py-1 rounded-full text-label-sm font-bold bg-tertiary-container/40 text-tertiary">
          {orders.length} waiting
        </span>
      </div>

      <div className="space-y-3">
        {orders.map((row) => {
          const busy = isPending && busyId === row.id;
          return (
            <div
              key={row.id}
              className="rounded-lg border border-outline-variant/20 bg-surface-container-low p-4 grid gap-4 md:grid-cols-[1fr_auto] md:items-center"
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-sm text-on-surface-variant">{row.orderCode}</span>
                  <span className="text-body-sm text-on-surface font-medium">{row.serviceName}</span>
                  <span className="text-label-sm text-on-surface-variant">
                    × {row.quantity.toLocaleString("en-US")}
                  </span>
                </div>
                <p className="text-label-sm text-on-surface-variant">
                  {row.customerName} · {row.createdAtLabel}
                </p>
                <p className="text-label-sm text-on-surface-variant font-mono truncate max-w-md">
                  {row.targetLink}
                </p>
                <div className="flex items-center gap-4 pt-1">
                  <span className="text-body-sm">
                    <span className="text-on-surface-variant">Charged: </span>
                    <span className="font-bold text-secondary">{row.customerPrice}</span>
                  </span>
                  <span className="text-body-sm">
                    <span className="text-on-surface-variant">Est. cost: </span>
                    <span className="font-bold text-on-surface">
                      {row.estimatedCost ?? "—"}
                    </span>
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 justify-start md:justify-end">
                <select
                  className="bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-label-sm px-2 py-2 text-on-surface-variant focus:ring-1 focus:ring-tertiary outline-none disabled:opacity-50"
                  value={providerFor(row)}
                  disabled={busy}
                  onChange={(e) =>
                    setSelectedProvider((prev) => ({ ...prev, [row.id]: e.target.value }))
                  }
                >
                  <option value="">Manual (no provider)</option>
                  {providers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => handleApprove(row)}
                  className="px-3 py-2 rounded-lg border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 text-label-sm transition-colors disabled:opacity-50"
                >
                  {busy ? "Working…" : "Approve"}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => handleReject(row)}
                  className="px-3 py-2 rounded-lg border border-error/30 text-error hover:bg-error/10 text-label-sm transition-colors disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
