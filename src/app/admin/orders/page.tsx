"use client";

import { useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { StatusBadge, type OrderStatus } from "@/components/ui/StatusBadge";
import { adminOrders as initialOrders, type AdminOrder } from "./data";

const statusOptions: OrderStatus[] = [
  "pending",
  "processing",
  "completed",
  "error",
  "canceled",
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>(initialOrders);

  function updateStatus(id: string, status: OrderStatus) {
    setOrders((prev) =>
      prev.map((order) => (order.id === id ? { ...order, status } : order)),
    );
  }

  const columns: DataTableColumn<AdminOrder>[] = [
    {
      header: "Order",
      render: (row) => (
        <div>
          <p className="font-mono text-sm text-on-surface-variant">
            {row.orderId}
          </p>
          <p className="text-body-sm text-on-surface">{row.service}</p>
        </div>
      ),
    },
    { header: "Customer", render: (row) => row.customerName },
    { header: "Date", render: (row) => row.createdAt },
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
            className="bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-label-sm px-2 py-1 text-on-surface-variant focus:ring-1 focus:ring-tertiary outline-none"
            value={row.status}
            onChange={(e) =>
              updateStatus(row.id, e.target.value as OrderStatus)
            }
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      ),
    },
  ];

  return (
    <AdminShell>
      <div>
        <h2 className="text-headline-lg text-on-surface">Orders</h2>
        <p className="text-body-md text-on-surface-variant mt-1">
          Todos os pedidos da plataforma. Ajuste o status manualmente
          enquanto o fulfillment é feito à mão (ver PLANO.md, seção 6).
        </p>
      </div>

      <DataTable
        title={`${orders.length} orders`}
        columns={columns}
        rows={orders}
        rowKey={(row) => row.id}
      />
    </AdminShell>
  );
}
