"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { updateOrderStatus, checkOrderStatus } from "@/lib/actions/admin-orders";
import type { OrderRowStatus } from "@/lib/types/orders";

export type AdminOrderRow = {
  id: string;
  orderCode: string;
  customerName: string;
  service: string;
  amount: string;
  status: OrderRowStatus;
  createdAtLabel: string;
  /** Was this order actually dispatched to a provider (has providerId + externalOrderId)? */
  dispatchedToProvider: boolean;
};

const statusOptions: OrderRowStatus[] = [
  "PENDING",
  "PROCESSING",
  "IN_PROGRESS",
  "COMPLETED",
  "PARTIAL",
  "CANCELED",
  "REFUNDED",
];

export function AdminOrdersView({ orders: initialOrders }: { orders: AdminOrderRow[] }) {
  const router = useRouter();
  const [orders, setOrders] = useState(initialOrders);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleStatusChange(id: string, status: OrderRowStatus) {
    const previous = orders;
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    setPendingId(id);

    startTransition(async () => {
      const result = await updateOrderStatus(id, status);
      setPendingId(null);
      if (!result.success) {
        setOrders(previous);
        alert(result.error ?? "Failed to update order status.");
        return;
      }
      router.refresh();
    });
  }

  function handleCheckStatus(id: string) {
    setPendingId(id);
    startTransition(async () => {
      const result = await checkOrderStatus(id);
      setPendingId(null);
      if (!result.success) {
        alert(result.error);
        return;
      }
      alert(`Provider reports: ${result.providerStatus}`);
      router.refresh();
    });
  }

  const columns: DataTableColumn<AdminOrderRow>[] = [
    {
      header: "Order",
      render: (row) => (
        <div>
          <p className="font-mono text-sm text-on-surface-variant">
            {row.orderCode}
          </p>
          <p className="text-body-sm text-on-surface">{row.service}</p>
        </div>
      ),
    },
    { header: "Customer", render: (row) => row.customerName },
    { header: "Date", render: (row) => row.createdAtLabel },
    {
      header: "Amount",
      align: "right",
      render: (row) => <span className="font-bold">{row.amount}</span>,
    },
    {
      header: "Status",
      render: (row) => (
        <div className="flex items-center gap-3">
          <StatusBadge status={row.status} />
          <select
            className="bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-label-sm px-2 py-1 text-on-surface-variant focus:ring-1 focus:ring-tertiary outline-none disabled:opacity-50"
            value={row.status}
            disabled={isPending && pendingId === row.id}
            onChange={(e) =>
              handleStatusChange(row.id, e.target.value as OrderRowStatus)
            }
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          {row.dispatchedToProvider && (
            <button
              type="button"
              disabled={isPending && pendingId === row.id}
              onClick={() => handleCheckStatus(row.id)}
              title="Fetch the live status from the provider"
              className="p-1.5 rounded-lg border border-outline-variant text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">sync</span>
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <DataTable
      title={`${orders.length} orders`}
      columns={columns}
      rows={orders}
      rowKey={(row) => row.id}
      emptyMessage="No orders placed yet."
    />
  );
}
