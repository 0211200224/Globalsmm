import { AdminShell } from "@/components/admin/AdminShell";
import { prisma } from "@/lib/prisma";
import { formatUSD } from "@/lib/format";
import type { OrderRowStatus } from "@/lib/types/orders";
import { AdminOrdersView, type AdminOrderRow } from "./AdminOrdersView";
import { PendingApprovalQueue, type PendingApprovalRow } from "@/components/admin/PendingApprovalQueue";

export default async function AdminOrdersPage() {
  const [dbOrders, pendingOrders, providers] = await Promise.all([
    prisma.order.findMany({
      where: { status: { not: "PENDING_ADMIN" } },
      include: { service: true, user: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.order.findMany({
      where: { status: "PENDING_ADMIN" },
      include: { service: true, user: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.provider.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);

  const orders: AdminOrderRow[] = dbOrders.map((order) => ({
    id: order.id,
    orderCode: `#GS-${90000 + order.orderNumber}`,
    customerName: order.user.name || order.user.email,
    service: order.service.name,
    amount: formatUSD(order.chargedAmount.toNumber()),
    status: order.status as OrderRowStatus,
    createdAtLabel: order.createdAt.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
  }));

  const pendingRows: PendingApprovalRow[] = pendingOrders.map((order) => {
    const estimatedCost =
      order.service.costPer1000 != null
        ? formatUSD((order.quantity / 1000) * order.service.costPer1000.toNumber())
        : null;

    return {
      id: order.id,
      orderCode: `#GS-${90000 + order.orderNumber}`,
      customerName: order.user.name || order.user.email,
      serviceName: order.service.name,
      quantity: order.quantity,
      targetLink: order.targetLink,
      customerPrice: formatUSD(order.chargedAmount.toNumber()),
      estimatedCost,
      defaultProviderId: order.service.providerId,
      createdAtLabel: order.createdAt.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  });

  return (
    <AdminShell>
      <div>
        <h2 className="text-headline-lg text-on-surface">Orders</h2>
        <p className="text-body-md text-on-surface-variant mt-1">
          Approve pending orders below to dispatch them to a provider (or mark them
          Processing for manual fulfillment). Canceling or refunding credits the
          customer&apos;s wallet automatically.
        </p>
      </div>

      <PendingApprovalQueue
        orders={pendingRows}
        providers={providers.map((p) => ({ id: p.id, name: p.name }))}
      />

      <AdminOrdersView orders={orders} />
    </AdminShell>
  );
}
