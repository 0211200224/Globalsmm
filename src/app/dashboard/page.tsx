import { AppShell } from "@/components/layout/AppShell";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { VipTierCard } from "@/components/dashboard/VipTierCard";
import { getCurrentUser } from "@/lib/actions/current-user";
import { getAffiliateSummary } from "@/lib/actions/affiliate";
import { prisma } from "@/lib/prisma";
import { getCurrency } from "@/lib/currency/get-currency";
import { getRates } from "@/lib/currency/get-rates";
import { formatMoney } from "@/lib/currency/format-money";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { formatMessage } from "@/lib/i18n/format-message";
import { ACTIVE_ORDER_STATUSES, type OrderRowData, type OrderRowStatus } from "@/lib/types/orders";

export default async function DashboardPage() {
  const { dashboard: t } = await getDictionary();
  const user = await getCurrentUser();
  const firstName = (user?.name || user?.email || "there").split(" ")[0];
  const currency = await getCurrency();
  const rates = await getRates();
  const money = (usd: number | string) => formatMoney(usd, currency, rates);

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
  const balance = money(user?.wallet?.balance.toNumber() ?? 0);

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
    chargedAmount: money(order.chargedAmount.toNumber()),
    createdAtLabel: order.createdAt.toLocaleDateString("en-US"),
  }));

  const [totalOrders, activeOrders, completedOrders, qualifyingSpendAgg, affiliateSummary] = user
    ? await Promise.all([
        prisma.order.count({ where: { userId: user.id } }),
        prisma.order.count({
          where: { userId: user.id, status: { in: ACTIVE_ORDER_STATUSES } },
        }),
        prisma.order.count({ where: { userId: user.id, status: "COMPLETED" } }),
        prisma.order.aggregate({
          where: { userId: user.id, status: { notIn: ["CANCELED", "REFUNDED"] } },
          _sum: { chargedAmount: true },
        }),
        getAffiliateSummary(user.id),
      ])
    : [0, 0, 0, { _sum: { chargedAmount: null } }, null];

  const lifetimeSpend = qualifyingSpendAgg._sum.chargedAmount?.toNumber() ?? 0;
  const referralBalance = money(affiliateSummary?.available ?? 0);

  return (
    <AppShell>
      <div>
        <h2 className="text-headline-lg text-on-surface">
          {formatMessage(t.welcomeBack, { name: firstName })}
        </h2>
        <p className="text-body-md text-on-surface-variant mt-1">
          {t.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-gutter">
        <StatCard label={t.walletBalance} value={balance} icon="account_balance_wallet" accent="secondary" />
        <StatCard label={t.referralBalance} value={referralBalance} icon="group_add" accent="tertiary" />
        <StatCard label={t.totalOrders} value={String(totalOrders)} icon="shopping_cart" accent="primary" />
        <StatCard label={t.activeOrders} value={String(activeOrders)} icon="bolt" accent="tertiary" />
        <StatCard label={t.completedOrders} value={String(completedOrders)} icon="check_circle" accent="primary" />
      </div>

      <VipTierCard lifetimeSpend={lifetimeSpend} />

      <DataTable
        title={t.recentOrders}
        columns={columns}
        rows={recentOrders}
        rowKey={(row) => row.id}
        emptyMessage={t.noOrders}
      />
    </AppShell>
  );
}
