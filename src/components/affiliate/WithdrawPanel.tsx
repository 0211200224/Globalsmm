"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { requestWithdrawalAction } from "@/lib/actions/withdraw";
import { formatUSD } from "@/lib/format";
import { MIN_WITHDRAWAL_USD } from "@/lib/constants";

export function WithdrawPanel({ available }: { available: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(String(Math.min(available, MIN_WITHDRAWAL_USD)));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await requestWithdrawalAction(Number(amount));

    setLoading(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setSuccess(true);
    router.refresh();
  }

  return (
    <div className="relative z-10 pt-8">
      {open ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          {success ? (
            <p className="text-center text-body-sm text-white">
              Withdrawal requested! Our team will process it shortly.
            </p>
          ) : (
            <>
              {error && (
                <p className="text-center text-label-sm text-red-200 bg-red-950/40 rounded-lg py-2 px-3">
                  {error}
                </p>
              )}
              <input
                className="w-full bg-white/10 border border-white/20 rounded-lg py-3 px-4 text-white placeholder:text-white/50 outline-none focus:ring-2 focus:ring-white/40"
                type="number"
                min={MIN_WITHDRAWAL_USD}
                max={available}
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={`Min ${formatUSD(MIN_WITHDRAWAL_USD)}`}
              />
              <button
                type="submit"
                disabled={loading || available < MIN_WITHDRAWAL_USD}
                className="w-full py-4 bg-white text-secondary-container rounded-xl font-bold text-body-md hover:shadow-lg hover:-translate-y-0.5 transition-all active:translate-y-0 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Requesting..." : "Confirm Withdrawal"}
              </button>
            </>
          )}
        </form>
      ) : (
        <>
          <button
            type="button"
            onClick={() => setOpen(true)}
            disabled={available < MIN_WITHDRAWAL_USD}
            className="w-full py-4 bg-white text-secondary-container rounded-xl font-bold text-body-md hover:shadow-lg hover:-translate-y-0.5 transition-all active:translate-y-0 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Withdraw Funds
          </button>
          <p className="text-center text-label-sm text-on-surface/40 mt-4">
            {available < MIN_WITHDRAWAL_USD
              ? `Minimum withdrawal is ${formatUSD(MIN_WITHDRAWAL_USD)}`
              : "Requests are reviewed and paid out manually."}
          </p>
        </>
      )}
    </div>
  );
}
