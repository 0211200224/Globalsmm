import { AppShell } from "@/components/layout/AppShell";
import { getCurrentUser } from "@/lib/actions/current-user";
import { prisma } from "@/lib/prisma";
import { getCurrency } from "@/lib/currency/get-currency";
import { getRates } from "@/lib/currency/get-rates";
import { formatMoney } from "@/lib/currency/format-money";
import { WalletView } from "./WalletView";
import type { WalletTransactionRow, TransactionStatus } from "./data";

const STATUS_MAP: Record<string, TransactionStatus> = {
  PENDING: "processing",
  COMPLETED: "completed",
  FAILED: "declined",
};

const METHOD_LABELS: Record<string, string> = {
  stripe: "Card (Stripe)",
  wallet: "Wallet",
  admin_adjustment: "Admin Adjustment",
};

const TYPE_ICON: Record<string, { icon: string; iconColorClass: string; sign: "+" | "-" }> = {
  DEPOSIT: { icon: "add_circle", iconColorClass: "text-indigo-500", sign: "+" },
  DEBIT: { icon: "shopping_cart", iconColorClass: "text-on-surface-variant", sign: "-" },
  REFUND: { icon: "undo", iconColorClass: "text-emerald-500", sign: "+" },
  COMMISSION_PAYOUT: { icon: "payments", iconColorClass: "text-tertiary", sign: "+" },
};

export default async function WalletPage() {
  const user = await getCurrentUser();
  const currency = await getCurrency();
  const rates = await getRates();
  const money = (usd: number | string) => formatMoney(usd, currency, rates);
  const balance = money(user?.wallet?.balance.toNumber() ?? 0);

  const dbTransactions = user?.wallet
    ? await prisma.transaction.findMany({
        where: { walletId: user.wallet.id },
        orderBy: { createdAt: "desc" },
        take: 50,
      })
    : [];

  const transactions: WalletTransactionRow[] = dbTransactions.map((tx) => {
    const typeInfo = TYPE_ICON[tx.type] ?? TYPE_ICON.DEPOSIT;
    return {
      id: tx.id,
      txId: `#TX-${tx.id.slice(-6).toUpperCase()}`,
      date: tx.createdAt.toLocaleString("en-US"),
      method: METHOD_LABELS[tx.method] ?? tx.method,
      icon: typeInfo.icon,
      iconColorClass: typeInfo.iconColorClass,
      amount: `${typeInfo.sign}${money(tx.amount.toNumber())}`,
      status: STATUS_MAP[tx.status] ?? "processing",
    };
  });

  return (
    <AppShell>
      <WalletView balance={balance} currency={currency} transactions={transactions} />
    </AppShell>
  );
}
