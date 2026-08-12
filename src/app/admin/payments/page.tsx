import { AdminShell } from "@/components/admin/AdminShell";
import { prisma } from "@/lib/prisma";
import { formatUSD } from "@/lib/format";
import { PaymentsView, type AdminTransactionRow } from "./PaymentsView";

export default async function AdminPaymentsPage() {
  const dbTransactions = await prisma.transaction.findMany({
    include: { wallet: { include: { user: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const transactions: AdminTransactionRow[] = dbTransactions.map((t) => ({
    id: t.id,
    customerName: t.wallet.user.name || t.wallet.user.email,
    type: t.type,
    method: t.method,
    amount: formatUSD(t.amount.toNumber()),
    status: t.status,
    createdAtLabel: t.createdAt.toLocaleDateString("en-US", {
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
        <h2 className="text-headline-lg text-on-surface">Payments</h2>
        <p className="text-body-md text-on-surface-variant mt-1">
          Full wallet transaction ledger (deposits, debits, refunds, manual
          adjustments). Deposit approval will apply here once Stripe is
          connected — see PLANO.md.
        </p>
      </div>

      <PaymentsView transactions={transactions} />
    </AdminShell>
  );
}
