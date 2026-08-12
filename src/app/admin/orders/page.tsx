import { AdminShell } from "@/components/admin/AdminShell";
import { prisma } from "@/lib/prisma";
import { formatUSD } from "@/lib/format";
import type { OrderRowStatus } from "@/lib/types/orders";
import { AdminOrdersView, type AdminOrderRow } from "./AdminOrdersView";

export default async function AdminOrdersPage() {
  const dbOrders = await prisma.order.findMany({
    include: { service: true, user: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

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

  return (
    <AdminShell>
      <div>
        <h2 className="text-headline-lg text-on-surface">Orders</h2>
        <p className="text-body-md text-on-surface-variant mt-1">
          All platform orders. Change status manually while fulfillment is
          handled by hand (see PLANO.md, section 6). Canceling or refunding
          credits the customer&apos;s wallet automatically.
        </p>
      </div>

      <AdminOrdersView orders={orders} />
    </AdminShell>
  );
}
