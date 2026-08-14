import { AppShell } from "@/components/layout/AppShell";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { VipTierCard } from "@/components/dashboard/VipTierCard";
import { getCurrentUser } from "@/lib/actions/current-user";
import { getAffiliateSummary } from "@/lib/actions/affiliate";
import { prisma } from "@/lib/prisma";
import { formatUSD } from "@/lib/format";
import type { OrderRowData, OrderRowStatus } from "@/lib/types/orders";

const ACTIVE_STATUSES: OrderRowStatus[] = ["PENDING", "PROCESSING", "IN_PROGRESS"];

const columns: DataTableColumn<OrderRowData>[] = [
  { header: "Service", render: (row) => row.serviceName },
  { header: "Order ID", render: (row) => row.orderCode },
  { header: "Status", render: (row) => <StatusBadge status={row.status} /> },
  {
    header: "Amount",
    align: "right",
    render: (row) => <span className="font-bold">{row.chargedAmount}</span>,
  },
];

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const firstName = (user?.name || user?.email || "there").split(" ")[0];
  const balance = formatUSD(user?.wallet?.balance.toNumber() ?? 0);

  const dbOrders = user
    ? await prisma.order.findMany({
        where: { userId: user.id },
        include: { service: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      })
    : [];

  const recentOrders: OrderRowData[] = dbOrders.map((order) => ({
    id: order.id,
    orderCode: `#GS-${90000 + order.orderNumber}`,
    serviceName: order.service.name,
    serviceIcon: order.service.icon,
    quantity: order.quantity,
    deliveredQuantity: order.deliveredQuantity,
    status: order.status as OrderRowStatus,
    chargedAmount: formatUSD(order.chargedAmount.toNumber()),
    createdAtLabel: order.createdAt.toLocaleDateString("en-US"),
  }));

  const [totalOrders, activeOrders, completedOrders, spendingAgg, qualifyingSpendAgg, affiliateSummary] = user
    ? await Promise.all([
        prisma.order.count({ where: { userId: user.id } }),
        prisma.order.count({
          where: { userId: user.id, status: { in: ACTIVE_STATUSES } },
        }),
        prisma.order.count({ where: { userId: user.id, status: "COMPLETED" } }),
        prisma.order.aggregate({
          where: { userId: user.id },
          _sum: { chargedAmount: true },
        }),
        prisma.order.aggregate({
          where: { userId: user.id, status: { notIn: ["CANCELED", "REFUNDED"] } },
          _sum: { chargedAmount: true },
        }),
        getAffiliateSummary(user.id),
      ])
    : [0, 0, 0, { _sum: { chargedAmount: null } }, { _sum: { chargedAmount: null } }, null];

  const totalSpending = formatUSD(spendingAgg._sum.chargedAmount?.toNumber() ?? 0);
  const lifetimeSpend = qualifyingSpendAgg._sum.chargedAmount?.toNumber() ?? 0;
  const referralBalance = formatUSD(affiliateSummary?.available ?? 0);

  return (
    <AppShell>
      <div>
        <h2 className="text-headline-lg text-on-surface">
          Welcome back, {firstName}
        </h2>
        <p className="text-body-md text-on-surface-variant mt-1">
          Here&apos;s what&apos;s happening with your account.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-gutter">
        <StatCard label="Wallet Balance" value={balance} icon="account_balance_wallet" accent="secondary" />
        <StatCard label="Referral Balance" value={referralBalance} icon="group_add" accent="tertiary" />
        <StatCard label="Total Orders" value={String(totalOrders)} icon="shopping_cart" accent="primary" />
        <StatCard label="Active Orders" value={String(activeOrders)} icon="bolt" accent="tertiary" />
        <StatCard label="Completed Orders" value={String(completedOrders)} icon="check_circle" accent="primary" />
        <StatCard label="Total Spending" value={totalSpending} icon="payments" accent="primary" />
      </div>

      <VipTierCard lifetimeSpend={lifetimeSpend} />

      <DataTable
        title="Recent Orders"
        columns={columns}
        rows={recentOrders}
        rowKey={(row) => row.id}
        emptyMessage="No orders yet — head to the Marketplace to place your first one."
      />
    </AppShell>
  );
}
