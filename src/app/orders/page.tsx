import { AppShell } from "@/components/layout/AppShell";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/actions/current-user";
import { formatUSD } from "@/lib/format";
import type { OrderRowData, OrderRowStatus } from "@/lib/types/orders";
import { OrdersView } from "./OrdersView";

const ACTIVE_STATUSES: OrderRowStatus[] = ["PENDING", "PROCESSING", "IN_PROGRESS"];

export default async function OrdersPage() {
  const user = await getCurrentUser();

  const dbOrders = user
    ? await prisma.order.findMany({
        where: { userId: user.id },
        include: { service: true },
        orderBy: { createdAt: "desc" },
      })
    : [];

  const orders: OrderRowData[] = dbOrders.map((order) => ({
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
  }));

  const stats = {
    total: orders.length,
    active: dbOrders.filter((o) => ACTIVE_STATUSES.includes(o.status as OrderRowStatus))
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
