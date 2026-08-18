import { AdminShell } from "@/components/admin/AdminShell";
import { StatCard } from "@/components/ui/StatCard";
import { Pill } from "@/components/ui/Pill";
import { prisma } from "@/lib/prisma";
import { formatUSD } from "@/lib/format";
import { ACTIVE_ORDER_STATUSES } from "@/lib/types/orders";

const LOW_BALANCE_THRESHOLD_USD = 20;

export default async function AdminOverviewPage() {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [totalUsers, revenueAgg, activeOrders, pendingApprovals, lowBalanceProviders] =
    await Promise.all([
      prisma.user.count(),
      prisma.transaction.aggregate({
        where: { type: "DEPOSIT", status: "COMPLETED", createdAt: { gte: startOfMonth } },
        _sum: { amount: true },
      }),
      prisma.order.count({ where: { status: { in: ACTIVE_ORDER_STATUSES } } }),
      prisma.order.count({ where: { status: "PENDING_ADMIN" } }),
      prisma.provider.findMany({
        where: { active: true, balance: { lt: LOW_BALANCE_THRESHOLD_USD } },
        select: { id: true, name: true, balance: true },
      }),
    ]);

  const attentionQueue = [
    ...(pendingApprovals > 0
      ? [
          {
            id: "pending-approvals",
            label: `${pendingApprovals} order${pendingApprovals === 1 ? "" : "s"} waiting for approval`,
            href: "/admin/orders",
            icon: "pending_actions",
          },
        ]
      : []),
    ...lowBalanceProviders.map((p) => ({
      id: `low-balance-${p.id}`,
      label: `${p.name} balance is low (${formatUSD(p.balance?.toNumber() ?? 0)})`,
      href: "/admin/providers",
      icon: "account_balance_wallet",
    })),
  ];

  return (
    <AdminShell>
      <div>
        <h2 className="text-headline-lg text-on-surface">Admin Overview</h2>
        <p className="text-body-md text-on-surface-variant mt-1">
          Live operational numbers.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-gutter">
        <StatCard label="Total Users" value={totalUsers.toLocaleString("en-US")} icon="group" accent="primary" />
        <StatCard
          label="Revenue (month)"
          value={formatUSD(revenueAgg._sum.amount?.toNumber() ?? 0)}
          icon="payments"
          accent="secondary"
        />
        <StatCard label="Active Orders" value={activeOrders.toLocaleString("en-US")} icon="shopping_cart" accent="tertiary" />
        <StatCard
          label="Pending Approvals"
          value={pendingApprovals.toLocaleString("en-US")}
          icon="pending_actions"
          accent="primary"
        />
      </div>

      <div className="glass-panel rounded-xl p-stack-lg">
        <h3 className="text-headline-md text-on-surface mb-stack-md">Needs Attention</h3>
        {attentionQueue.length === 0 ? (
          <p className="text-body-sm text-on-surface-variant">Nothing needs attention right now.</p>
        ) : (
          <div className="space-y-3">
            {attentionQueue.map((item) => (
              <a
                key={item.id}
                href={item.href}
                className="flex items-center justify-between p-4 rounded-lg border border-outline-variant/20 hover:border-tertiary/40 hover:bg-surface-container-high transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-tertiary">{item.icon}</span>
                  <span className="text-body-sm text-on-surface">{item.label}</span>
                </div>
                <Pill tone="warning">Review</Pill>
              </a>
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
