// Plain constants/helpers shared between server and client code — no
// "server-only" guard here on purpose.

export type VipTier = {
  name: string;
  /// Lifetime qualifying spend (USD) required to reach this tier.
  minSpend: number;
  discountPercent: number;
  icon: string;
};

// Ordered lowest to highest. Tune freely — nothing else in the codebase
// hardcodes these names or thresholds.
export const VIP_TIERS: VipTier[] = [
  { name: "Standard", minSpend: 0, discountPercent: 0, icon: "person" },
  { name: "Silver", minSpend: 100, discountPercent: 3, icon: "workspace_premium" },
  { name: "Gold", minSpend: 500, discountPercent: 6, icon: "military_tech" },
  { name: "VIP", minSpend: 2000, discountPercent: 10, icon: "diamond" },
];

export const RESELLER_DISCOUNT_PERCENT = 15;

export function getVipTier(totalSpend: number): VipTier {
  let current = VIP_TIERS[0];
  for (const tier of VIP_TIERS) {
    if (totalSpend >= tier.minSpend) current = tier;
  }
  return current;
}

export function getNextVipTier(totalSpend: number): VipTier | null {
  return VIP_TIERS.find((tier) => tier.minSpend > totalSpend) ?? null;
}

/**
 * The discount actually applied at checkout: resellers get the flat
 * reseller rate OR their VIP rate, whichever is better — not both stacked.
 */
export function getEffectiveDiscountPercent(totalSpend: number, isReseller: boolean) {
  const vipDiscount = getVipTier(totalSpend).discountPercent;
  return isReseller ? Math.max(vipDiscount, RESELLER_DISCOUNT_PERCENT) : vipDiscount;
}
