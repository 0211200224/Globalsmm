"use client";

import { useCurrency } from "@/lib/currency/CurrencyProvider";
import { getVipTier, getNextVipTier } from "@/lib/vip";

export function VipTierCard({ lifetimeSpend }: { lifetimeSpend: number }) {
  const { format } = useCurrency();
  const tier = getVipTier(lifetimeSpend);
  const next = getNextVipTier(lifetimeSpend);
  const progressPercent = next
    ? Math.min(100, Math.round((lifetimeSpend / next.minSpend) * 100))
    : 100;

  return (
    <div className="glass-card p-6 rounded-2xl flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg bg-tertiary/10 text-tertiary flex items-center justify-center">
            <span className="material-symbols-outlined">{tier.icon}</span>
          </div>
          <div>
            <p className="text-headline-md text-on-surface font-bold">
              {tier.name} Tier
            </p>
            <p className="text-label-sm text-on-surface-variant">
              {tier.discountPercent > 0
                ? `${tier.discountPercent}% off every order`
                : "Order more to unlock discounts"}
            </p>
          </div>
        </div>
      </div>

      {next ? (
        <div className="space-y-1.5">
          <div className="flex justify-between text-label-sm text-on-surface-variant">
            <span>{format(lifetimeSpend)} spent</span>
            <span>
              {format(Math.max(0, next.minSpend - lifetimeSpend))} to {next.name}
            </span>
          </div>
          <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-tertiary"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      ) : (
        <p className="text-label-sm text-tertiary font-medium">
          You&apos;ve reached the highest tier.
        </p>
      )}
    </div>
  );
}
