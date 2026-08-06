import { AppShell } from "@/components/layout/AppShell";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { CopyField } from "@/components/affiliate/CopyField";
import { GrowthChart } from "@/components/affiliate/GrowthChart";
import { ReferralStatusBadge } from "@/components/affiliate/ReferralStatusBadge";
import {
  affiliateStats,
  leaderboard,
  referralHistory,
  topCountries,
  type ReferralEntry,
} from "./data";

const columns: DataTableColumn<ReferralEntry>[] = [
  {
    header: "Client",
    render: (row) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-surface-container-highest flex items-center justify-center text-label-md font-bold text-on-surface">
          {row.initials}
        </div>
        <div>
          <p className="text-body-sm font-medium text-on-surface">
            {row.clientName}
          </p>
          <p className="text-[11px] text-on-surface-variant/60">
            ID: {row.clientId}
          </p>
        </div>
      </div>
    ),
  },
  { header: "Date", render: (row) => row.date },
  { header: "Amount", render: (row) => row.amount },
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

export default function AffiliatePage() {
  return (
    <AppShell>
      <section className="flex flex-col md:flex-row justify-between items-end gap-stack-lg">
        <div>
          <h2 className="text-headline-lg text-on-surface">
            Ambassador Performance
          </h2>
          <p className="text-body-md text-on-surface-variant mt-2 max-w-2xl">
            Track your referral impact, monitor real-time commissions, and
            grow your global network through the GlobalSMM partner ecosystem.
          </p>
        </div>
        <button
          type="button"
          className="px-6 py-2.5 rounded-lg border border-outline-variant/30 text-on-surface hover:bg-surface-variant transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">download</span>
          Export Report
        </button>
      </section>

      {/* Bento Grid Top Row */}
      <div className="grid grid-cols-12 gap-gutter">
        {/* Referral Link */}
        <div className="col-span-12 lg:col-span-8 glass-panel rounded-xl p-stack-lg">
          <div className="flex justify-between items-start mb-8">
            <div>
              <span className="text-primary text-label-sm uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full">
                Active Campaign
              </span>
              <h3 className="text-headline-md text-on-surface mt-4">
                Your Referral Link
              </h3>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-stack-lg">
            <CopyField label="Unique Referral URL" value="globalsmm.com/ref/rivera88" />
            <CopyField label="Promo Code (10% Off)" value="RIVERA_VIP" monospace />
          </div>
        </div>

        {/* Wallet / Commission */}
        <div className="col-span-12 lg:col-span-4 mesh-gradient rounded-xl p-stack-lg flex flex-col justify-between shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex justify-between items-start">
              <span className="material-symbols-outlined text-on-surface/40 text-4xl">
                payments
              </span>
              <span className="text-label-sm bg-white/10 px-3 py-1 rounded-full backdrop-blur-md">
                Available for Payout
              </span>
            </div>
            <div className="mt-8">
              <p className="text-label-md text-on-surface/70">
                Current Commission Balance
              </p>
              <h4 className="text-display-xl text-on-surface mt-1">
                $4,822<span className="text-headline-md opacity-60">.50</span>
              </h4>
            </div>
          </div>
          <div className="relative z-10 pt-8">
            <button
              type="button"
              className="w-full py-4 bg-white text-secondary-container rounded-xl font-bold text-body-md hover:shadow-lg hover:-translate-y-0.5 transition-all active:translate-y-0 active:scale-[0.98]"
            >
              Withdraw Funds
            </button>
            <p className="text-center text-label-sm text-on-surface/40 mt-4">
              Next scheduled payout: Oct 24th
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
        {affiliateStats.map((stat) => (
          <div
            key={stat.label}
            className="glass-panel p-stack-md rounded-xl hover:bg-surface-container-high transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-on-surface-variant text-label-md">
                {stat.label}
              </span>
              <span
                className={`material-symbols-outlined p-1.5 rounded-lg ${stat.colorClass} ${stat.bgClass}`}
              >
                {stat.icon}
              </span>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-headline-md text-on-surface">
                {stat.value}
              </span>
              <span className={`text-label-sm ${stat.colorClass}`}>
                {stat.trend}
              </span>
            </div>
            <div className="h-1 bg-surface-container-lowest mt-4 rounded-full overflow-hidden">
              <div
                className={`h-full ${stat.barClass}`}
                style={{ width: stat.barWidth }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-12 gap-gutter">
        <div className="col-span-12 lg:col-span-8 glass-panel rounded-xl p-stack-lg">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-headline-md text-on-surface">
              Growth Performance
            </h3>
            <div className="flex gap-2">
              <button
                type="button"
                className="px-4 py-1.5 rounded-full text-label-sm bg-primary/10 text-primary border border-primary/20"
              >
                Signups
              </button>
              <button
                type="button"
                className="px-4 py-1.5 rounded-full text-label-sm text-on-surface-variant hover:bg-surface-container-highest/20 transition-all"
              >
                Revenue
              </button>
            </div>
          </div>
          <GrowthChart />
        </div>

        <div className="col-span-12 lg:col-span-4 glass-panel rounded-xl p-stack-lg">
          <h3 className="text-headline-md text-on-surface mb-6">
            Top Countries
          </h3>
          <div className="space-y-6">
            {topCountries.map((country) => (
              <div key={country.name} className="space-y-2">
                <div className="flex justify-between text-label-md">
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-6 h-4 rounded-sm ${country.flagClass}`}
                    />
                    <span className="text-on-surface">{country.name}</span>
                  </div>
                  <span className="text-on-surface-variant">
                    {country.percent}%
                  </span>
                </div>
                <div className="w-full bg-surface-container-lowest h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-primary h-full"
                    style={{ width: `${country.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Leaderboard & Referral History */}
      <div className="grid grid-cols-12 gap-gutter">
        <div className="col-span-12 xl:col-span-4 glass-panel rounded-xl p-stack-lg h-full">
          <div className="flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-tertiary">
              workspace_premium
            </span>
            <h3 className="text-headline-md text-on-surface">Leaderboard</h3>
          </div>
          <div className="space-y-4">
            {leaderboard.map((entry) => (
              <div
                key={entry.rank}
                className={
                  entry.isTop
                    ? "flex items-center justify-between p-3 rounded-lg bg-tertiary/5 border border-tertiary/20"
                    : entry.isCurrentUser
                      ? "flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20"
                      : "flex items-center justify-between p-3 rounded-lg bg-surface-container-lowest border border-outline-variant/10"
                }
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`text-label-md font-bold w-6 ${
                      entry.isTop
                        ? "text-tertiary"
                        : entry.isCurrentUser
                          ? "text-primary"
                          : "text-on-surface-variant"
                    }`}
                  >
                    {String(entry.rank).padStart(2, "0")}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-[11px] font-bold text-on-surface-variant">
                    {entry.name.charAt(0)}
                  </div>
                  <span
                    className={`text-label-md ${
                      entry.isCurrentUser ? "font-bold text-on-surface" : "font-medium text-on-surface"
                    }`}
                  >
                    {entry.name}
                  </span>
                </div>
                <span
                  className={`text-label-sm font-bold ${
                    entry.isTop
                      ? "text-tertiary"
                      : entry.isCurrentUser
                        ? "text-primary"
                        : "text-on-surface-variant"
                  }`}
                >
                  {entry.amount}
                </span>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="w-full mt-6 py-2 text-label-sm text-primary hover:bg-primary/5 transition-all rounded-lg"
          >
            View Full Leaderboard
          </button>
        </div>

        <div className="col-span-12 xl:col-span-8">
          <DataTable
            title="Referral History"
            action={
              <input
                className="bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-label-sm px-4 py-1.5 focus:ring-1 focus:ring-primary w-48"
                placeholder="Filter referrals..."
                type="text"
              />
            }
            columns={columns}
            rows={referralHistory}
            rowKey={(row) => row.id}
          />
        </div>
      </div>
    </AppShell>
  );
}
