import { headers } from "next/headers";
import { AppShell } from "@/components/layout/AppShell";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { CopyField } from "@/components/affiliate/CopyField";
import { ReferralStatusBadge } from "@/components/affiliate/ReferralStatusBadge";
import { WithdrawPanel } from "@/components/affiliate/WithdrawPanel";
import { getCurrentUser } from "@/lib/actions/current-user";
import { getAffiliateSummary } from "@/lib/actions/affiliate";
import { formatUSD } from "@/lib/format";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { formatMessage } from "@/lib/i18n/format-message";

type HistoryRow = {
  id: string;
  clientName: string;
  clientInitials: string;
  date: string;
  amount: string;
  commission: string;
  status: "PENDING" | "AVAILABLE" | "PAID" | "VOID";
};

const columns: DataTableColumn<HistoryRow>[] = [
  {
    header: "Client",
    render: (row) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-surface-container-highest flex items-center justify-center text-label-md font-bold text-on-surface">
          {row.clientInitials}
        </div>
        <p className="text-body-sm font-medium text-on-surface">
          {row.clientName}
        </p>
      </div>
    ),
  },
  { header: "Date", render: (row) => row.date },
  { header: "Order Amount", render: (row) => row.amount },
  {
    header: "Commission",
    render: (row) => (
      <span className="font-bold text-primary">{row.commission}</span>
    ),
  },
  {
    header: "Status",
    render: (row) => <ReferralStatusBadge status={row.status} />,
  },
];

export default async function AffiliatePage() {
  const { affiliate: t } = await getDictionary();
  const user = await getCurrentUser();
  const summary = user ? await getAffiliateSummary(user.id) : null;

  const headersList = await headers();
  const host = headersList.get("host") ?? "globalsmm.com";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  const referralUrl = summary
    ? `${protocol}://${host}/register?ref=${summary.referralCode}`
    : "";

  const history: HistoryRow[] = (summary?.history ?? []).map((commission) => ({
    id: commission.id,
    clientName: commission.order.user.name || commission.order.user.email,
    clientInitials: (commission.order.user.name || commission.order.user.email)
      .charAt(0)
      .toUpperCase(),
    date: commission.createdAt.toLocaleDateString("en-US"),
    amount: formatUSD(commission.order.chargedAmount.toNumber()),
    commission: formatUSD(commission.amount.toNumber()),
    status: commission.status,
  }));

  return (
    <AppShell>
      <section className="flex flex-col md:flex-row justify-between items-end gap-stack-lg">
        <div>
          <h2 className="text-headline-lg text-on-surface">
            {t.title}
          </h2>
          <p className="text-body-md text-on-surface-variant mt-2 max-w-2xl">
            {formatMessage(t.subtitle, {
              rate: summary ? (summary.commissionRate * 100).toFixed(0) : "5",
            })}
          </p>
        </div>
      </section>

      {/* Bento Grid Top Row */}
      <div className="grid grid-cols-12 gap-gutter">
        {/* Referral Link */}
        <div className="col-span-12 lg:col-span-8 glass-panel rounded-xl p-stack-lg">
          <div className="flex justify-between items-start mb-8">
            <div>
              <span className="text-primary text-label-sm uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full">
                {t.activeCampaign}
              </span>
              <h3 className="text-headline-md text-on-surface mt-4">
                {t.yourReferralLink}
              </h3>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-stack-lg">
            <CopyField label={t.referralUrl} value={referralUrl} />
            <CopyField
              label={t.referralCode}
              value={summary?.referralCode ?? ""}
              monospace
            />
          </div>
        </div>

        {/* Commission Balance */}
        <div className="col-span-12 lg:col-span-4 mesh-gradient rounded-xl p-stack-lg flex flex-col justify-between shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex justify-between items-start">
              <span className="material-symbols-outlined text-on-surface/40 text-4xl">
                payments
              </span>
              <span className="text-label-sm bg-white/10 px-3 py-1 rounded-full backdrop-blur-md">
                {t.availableForPayout}
              </span>
            </div>
            <div className="mt-8">
              <p className="text-label-md text-on-surface/70">
                {t.availableCommission}
              </p>
              <h4 className="text-display-xl text-on-surface mt-1">
                {formatUSD(summary?.available ?? 0)}
              </h4>
              <p className="text-label-sm text-on-surface/50 mt-2">
                + {formatUSD(summary?.pending ?? 0)} {t.pendingSuffix}
              </p>
            </div>
          </div>
          <WithdrawPanel available={summary?.available ?? 0} />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
        <div className="glass-panel p-stack-md rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-on-surface-variant text-label-md">
              {t.totalReferrals}
            </span>
            <span className="material-symbols-outlined text-primary bg-primary/10 p-1.5 rounded-lg">
              group_add
            </span>
          </div>
          <div className="mt-4 text-headline-md text-on-surface">
            {summary?.totalReferrals ?? 0}
          </div>
        </div>
        <div className="glass-panel p-stack-md rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-on-surface-variant text-label-md">
              {t.activeReferrals}
            </span>
            <span className="material-symbols-outlined text-tertiary bg-tertiary/10 p-1.5 rounded-lg">
              bolt
            </span>
          </div>
          <div className="mt-4 text-headline-md text-on-surface">
            {summary?.activeReferrals ?? 0}
          </div>
        </div>
        <div className="glass-panel p-stack-md rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-on-surface-variant text-label-md">
              {t.pendingEarnings}
            </span>
            <span className="material-symbols-outlined text-secondary bg-secondary/10 p-1.5 rounded-lg">
              hourglass_top
            </span>
          </div>
          <div className="mt-4 text-headline-md text-on-surface">
            {formatUSD(summary?.pending ?? 0)}
          </div>
        </div>
        <div className="glass-panel p-stack-md rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-on-surface-variant text-label-md">
              {t.totalPaidOut}
            </span>
            <span className="material-symbols-outlined text-on-tertiary-container bg-tertiary-container p-1.5 rounded-lg">
              monetization_on
            </span>
          </div>
          <div className="mt-4 text-headline-md text-on-surface">
            {formatUSD(summary?.totalPaid ?? 0)}
          </div>
        </div>
      </div>

      <DataTable
        title={t.referralHistory}
        columns={columns}
        rows={history}
        rowKey={(row) => row.id}
        emptyMessage={t.noCommissions}
      />
    </AppShell>
  );
}
