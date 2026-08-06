import { AppShell } from "@/components/layout/AppShell";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge, type OrderStatus } from "@/components/ui/StatusBadge";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { getCurrentUser } from "@/lib/actions/current-user";
import { formatUSD } from "@/lib/format";

type RecentOrder = {
  id: string;
  service: string;
  orderId: string;
  status: OrderStatus;
  amount: string;
};

const recentOrders: RecentOrder[] = [
  {
    id: "1",
    service: "YouTube High Retention Views",
    orderId: "#GS-92831",
    status: "processing",
    amount: "$124.50",
  },
  {
    id: "2",
    service: "Instagram Real Active Followers",
    orderId: "#GS-92755",
    status: "completed",
    amount: "$85.00",
  },
  {
    id: "3",
    service: "Twitter X Global Retweets",
    orderId: "#GS-92612",
    status: "error",
    amount: "$42.15",
  },
];

const columns: DataTableColumn<RecentOrder>[] = [
  { header: "Service", render: (row) => row.service },
  { header: "Order ID", render: (row) => row.orderId },
  { header: "Status", render: (row) => <StatusBadge status={row.status} /> },
  {
    header: "Amount",
    align: "right",
    render: (row) => <span className="font-bold">{row.amount}</span>,
  },
];

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const firstName = (user?.name || user?.email || "there").split(" ")[0];
  const balance = formatUSD(user?.wallet?.balance.toNumber() ?? 0);

  return (
    <AppShell>
      <div>
        <h2 className="text-headline-lg text-on-surface">
          Welcome back, {firstName}
        </h2>
        <p className="text-body-md text-on-surface-variant mt-1">
          Saldo da carteira é real. Pedidos, serviços ativos e gastos abaixo
          ainda são placeholders (fluxo de pedidos vem na próxima etapa).
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-gutter">
        <StatCard label="Wallet Balance" value={balance} icon="account_balance_wallet" accent="secondary" />
        <StatCard label="Total Orders" value="2,415" icon="shopping_cart" accent="primary" />
        <StatCard label="Active Services" value="15" icon="bolt" accent="tertiary" />
        <StatCard label="Total Spending" value="$1,200.85" icon="payments" accent="primary" />
      </div>

      <DataTable
        title="Recent Orders"
        columns={columns}
        rows={recentOrders}
        rowKey={(row) => row.id}
      />
    </AppShell>
  );
}
