"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { TransactionStatusBadge } from "@/components/wallet/TransactionStatusBadge";
import { paymentMethods, type WalletTransactionRow } from "./data";
import { useTranslations } from "@/lib/i18n/I18nProvider";
import { createDepositCheckoutSession } from "@/lib/actions/wallet";

const presetAmounts = [50, 100, 500];

export function WalletView({
  balance,
  transactions,
}: {
  balance: string;
  transactions: WalletTransactionRow[];
}) {
  const t = useTranslations().wallet;
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("stripe");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    // Read directly from the URL (see the same pattern/rationale in
    // src/app/login/page.tsx) instead of useSearchParams(), then strip the
    // param so a refresh doesn't re-show the banner.
    const params = new URLSearchParams(window.location.search);
    const deposit = params.get("deposit");
    if (deposit === "success") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setNotice(t.depositPending);
      router.replace("/wallet");
    } else if (deposit === "canceled") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError(t.depositCanceled);
      router.replace("/wallet");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columns: DataTableColumn<WalletTransactionRow>[] = [
    {
      header: "Transaction ID",
      render: (row) => (
        <span className="font-mono text-sm text-on-surface-variant">
          {row.txId}
        </span>
      ),
    },
    { header: "Date", render: (row) => row.date },
    {
      header: "Method",
      render: (row) => (
        <div className="flex items-center gap-2">
          <span className={`material-symbols-outlined text-lg ${row.iconColorClass}`}>
            {row.icon}
          </span>
          <span>{row.method}</span>
        </div>
      ),
    },
    {
      header: "Amount",
      render: (row) => (
        <span className="font-mono font-bold text-on-surface">
          {row.amount}
        </span>
      ),
    },
    {
      header: "Status",
      render: (row) => <TransactionStatusBadge status={row.status} />,
    },
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const result = await createDepositCheckoutSession(Number(amount));
    if (!result.success) {
      setError(result.error);
      setSubmitting(false);
      return;
    }

    window.location.href = result.url;
  }

  return (
    <>
      <div>
        <h2 className="text-headline-lg text-on-background">
          {t.title}
        </h2>
        <p className="text-body-md text-on-surface-variant">
          {t.subtitle}
        </p>
      </div>

      {notice && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-body-sm rounded-lg px-4 py-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-lg">check_circle</span>
          {notice}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Left Column: Balance & Deposit Form */}
        <div className="lg:col-span-7 space-y-gutter">
          <div className="mesh-gradient rounded-xl p-8 shadow-xl relative overflow-hidden border border-white/5 group transition-all duration-300 hover:shadow-secondary/10">
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex justify-between items-start mb-8">
                <span className="material-symbols-outlined text-primary scale-125">
                  account_balance_wallet
                </span>
                <div className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/10">
                  <span className="text-label-sm text-white flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />{" "}
                    {t.verifiedAccount}
                  </span>
                </div>
              </div>
              <p className="text-label-md text-primary/70 uppercase tracking-[0.2em] mb-2">
                {t.availableBalance}
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-display-xl text-white font-mono">
                  {balance}
                </span>
                <span className="text-body-lg text-primary/60">USD</span>
              </div>
            </div>
            <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-secondary/10 rounded-full blur-3xl group-hover:bg-secondary/20 transition-colors" />
          </div>

          <div className="bg-surface-container-low border border-white/5 rounded-xl p-stack-lg shadow-sm">
            <h3 className="text-headline-md text-on-surface mb-stack-md flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">
                add_circle
              </span>
              {t.addFunds}
            </h3>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-label-md text-on-surface-variant mb-2">
                  {t.amountToAdd}
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-mono font-bold">
                    $
                  </span>
                  <input
                    className="w-full bg-background border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg py-4 pl-10 pr-4 font-mono text-xl text-on-background transition-all outline-none"
                    placeholder="0.00"
                    type="number"
                    min="1"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {presetAmounts.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmount(String(preset))}
                    className={
                      amount === String(preset)
                        ? "py-3 bg-secondary/20 border border-secondary text-on-surface transition-all rounded-lg text-label-md"
                        : "py-3 bg-surface-container-high border border-outline-variant text-on-surface hover:bg-secondary/10 hover:border-secondary transition-all rounded-lg text-label-md"
                    }
                  >
                    ${preset}
                  </button>
                ))}
              </div>
              {error && (
                <p className="text-center text-body-sm text-error">{error}</p>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-gradient-to-r from-secondary-container to-secondary/80 text-white font-bold rounded-lg shadow-lg shadow-secondary/10 hover:shadow-secondary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <span>{submitting ? t.submitting : t.proceedToPayment}</span>
                <span className="material-symbols-outlined">
                  arrow_forward
                </span>
              </button>
              <p className="text-center text-body-sm text-on-surface-variant flex items-center justify-center gap-1">
                <span className="material-symbols-outlined text-sm">
                  lock
                </span>
                {t.secureTransaction}
              </p>
            </form>
          </div>
        </div>

        {/* Right Column: Payment Methods */}
        <div className="lg:col-span-5 space-y-gutter">
          <div className="bg-surface-container-low border border-white/5 rounded-xl p-stack-lg shadow-sm h-full">
            <h3 className="text-headline-md text-on-surface mb-stack-md">
              {t.paymentMethods}
            </h3>
            <div className="space-y-3">
              {paymentMethods.map((method) => {
                const isActive = selectedMethod === method.id;
                return (
                  <button
                    key={method.id}
                    type="button"
                    disabled={!method.enabled}
                    onClick={() => method.enabled && setSelectedMethod(method.id)}
                    className={
                      "w-full p-4 rounded-xl border flex items-center justify-between transition-all " +
                      (isActive
                        ? "border-primary bg-primary/5"
                        : method.enabled
                          ? "border-outline-variant hover:border-primary/30 hover:bg-surface-container-highest"
                          : "border-outline-variant opacity-50 cursor-not-allowed")
                    }
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-lg flex items-center justify-center ${method.iconBgClass}`}
                      >
                        <span
                          className={`material-symbols-outlined ${method.iconColorClass}`}
                        >
                          {method.icon}
                        </span>
                      </div>
                      <div className="text-left">
                        <p className="text-label-md text-on-surface font-semibold">
                          {method.name}
                        </p>
                        <p className="text-[11px] text-on-surface-variant uppercase">
                          {method.description}
                        </p>
                      </div>
                    </div>
                    {isActive && (
                      <span className="material-symbols-outlined text-primary">
                        check_circle
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="mt-8 p-4 rounded-xl bg-primary-container border border-primary/10">
              <p className="text-label-sm text-on-primary-container leading-relaxed">
                <span className="font-bold text-primary">{t.paymentNote}</span>{" "}
                {t.paymentNoteBody}
              </p>
            </div>
          </div>
        </div>

        {/* Full Width: Transaction History */}
        <div className="lg:col-span-12">
          <DataTable
            title={t.transactionHistory}
            action={
              <div className="flex gap-2">
                <button
                  type="button"
                  className="px-4 py-2 bg-surface-container-high text-on-surface-variant text-sm rounded-lg hover:text-on-surface transition-colors flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">
                    filter_list
                  </span>
                  {t.filter}
                </button>
                <button
                  type="button"
                  className="px-4 py-2 bg-surface-container-high text-on-surface-variant text-sm rounded-lg hover:text-on-surface transition-colors flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">
                    download
                  </span>
                  {t.export}
                </button>
              </div>
            }
            columns={columns}
            rows={transactions}
            rowKey={(row) => row.id}
            emptyMessage={t.noTransactions}
          />
        </div>
      </div>
    </>
  );
}
