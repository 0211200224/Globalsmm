"use client";

import { createContext, useContext, type ReactNode } from "react";
import { formatMoney } from "./format-money";
import type { CurrencyCode } from "./currencies";

type CurrencyContextValue = {
  currency: CurrencyCode;
  rates: Record<CurrencyCode, number>;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({
  currency,
  rates,
  children,
}: CurrencyContextValue & { children: ReactNode }) {
  return (
    <CurrencyContext.Provider value={{ currency, rates }}>{children}</CurrencyContext.Provider>
  );
}

/**
 * `format(usdAmount)` bundles the current currency + rates so client
 * components doing raw-USD arithmetic (see VipTierCard, OrderModal) can
 * swap a `formatUSD(x)` call for `format(x)` with no other change.
 */
export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return {
    ...ctx,
    format: (usdAmount: number | string) => formatMoney(usdAmount, ctx.currency, ctx.rates),
  };
}
