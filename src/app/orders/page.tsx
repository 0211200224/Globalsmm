import { AppShell } from "@/components/layout/AppShell";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/actions/current-user";
import { formatUSD } from "@/lib/format";
import { ACTIVE_ORDER_STATUSES, type OrderRowData, type OrderRowStatus } from "@/lib/types/orders";
import { OrdersView } from "./OrdersView";

export default async function OrdersPage() {
  const user = await getCurrentUser();

  const dbOrders = user
    ? await prisma.order.findMany({
        where: { userId: user.id },
        include: { service: true, refillRequests: true },
        orderBy: { createdAt: "desc" },
      })
    : [];

  const now = new Date();

  const orders: OrderRowData[] = dbOrders.map((order) => {
    const refillDeadline = new Date(order.createdAt);
    refillDeadline.setDate(refillDeadline.getDate() + order.service.refillDays);

    const canRefill =
      (order.status === "COMPLETED" || order.status === "PARTIAL") &&
      order.service.refillDays > 0 &&
      order.refillRequests.length === 0 &&
      now <= refillDeadline;

    return {
      id: order.id,
      orderCode: `#GS-${90000 + order.orderNumber}`,
      serviceName: order.service.name,
      serviceIcon: order.service.icon,
      quantity: order.quantity,
      deliveredQuantity: order.deliveredQuantity,
      status: order.status as OrderRowStatus,
      chargedAmount: formatUSD(order.chargedAmount.toNumber()),
      createdAtLabel: order.createdAt.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      canCancel: order.status === "PENDING_ADMIN",
      canRefill,
      refillDays: order.service.refillDays,
    };
  });

  const stats = {
    total: orders.length,
    active: dbOrders.filter((o) => ACTIVE_ORDER_STATUSES.includes(o.status as OrderRowStatus))
      .length,
    completed: dbOrders.filter((o) => o.status === "COMPLETED").length,
    totalSpending: formatUSD(
      dbOrders.reduce((sum, o) => sum + o.chargedAmount.toNumber(), 0),
    ),
  };

  return (
    <AppShell>
      <OrdersView orders={orders} stats={stats} />
    </AppShell>
  );
}
