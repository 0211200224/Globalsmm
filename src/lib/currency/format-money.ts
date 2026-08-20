import type { CurrencyCode } from "./currencies";

/**
 * Converts a USD amount (the internal ledger unit everywhere -- Wallet,
 * Service.pricePer1000, Order.chargedAmount, Transaction.amount all stay
 * USD Decimal columns, this is display-only) into the target currency and
 * formats it. Intl.NumberFormat already applies the correct decimal digits
 * per ISO 4217 currency (e.g. XAF has none), so no need to hardcode that.
 */
export function formatMoney(
  usdAmount: number | string,
  currency: CurrencyCode,
  rates: Record<CurrencyCode, number>,
) {
  const converted = Number(usdAmount) * (rates[currency] ?? 1);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(converted);
}
