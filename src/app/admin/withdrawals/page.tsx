import { AdminShell } from "@/components/admin/AdminShell";
import { prisma } from "@/lib/prisma";
import { formatUSD } from "@/lib/format";
import { WithdrawalsView, type AdminWithdrawalRow } from "./WithdrawalsView";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export default async function AdminWithdrawalsPage() {
  const { admin: t } = await getDictionary();
  const dbWithdrawals = await prisma.referralWithdrawal.findMany({
    include: { affiliate: { include: { user: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const withdrawals: AdminWithdrawalRow[] = dbWithdrawals.map((w) => ({
    id: w.id,
    affiliateName: w.affiliate.user.name || w.affiliate.user.email,
    affiliateEmail: w.affiliate.user.email,
    amount: formatUSD(w.amount.toNumber()),
    status: w.status,
    createdAtLabel: w.createdAt.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
  }));

  return (
    <AdminShell>
      <div>
        <h2 className="text-headline-lg text-on-surface">{t.withdrawals.title}</h2>
        <p className="text-body-md text-on-surface-variant mt-1">
          {t.withdrawals.subtitle}
        </p>
      </div>

      <WithdrawalsView withdrawals={withdrawals} />
    </AdminShell>
  );
}
