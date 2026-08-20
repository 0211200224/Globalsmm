export const SUPPORTED_CURRENCIES = ["USD", "XAF", "MZN", "EUR", "GBP", "BRL"] as const;
export type CurrencyCode = (typeof SUPPORTED_CURRENCIES)[number];
export const DEFAULT_CURRENCY: CurrencyCode = "USD";

export const CURRENCY_LABELS: Record<CurrencyCode, string> = {
  USD: "US Dollar",
  XAF: "Franc CFA (XAF)",
  MZN: "Metical (MZN)",
  EUR: "Euro",
  GBP: "British Pound",
  BRL: "Real (BRL)",
};

export const CURRENCY_COOKIE = "gsmm-currency";

export function isSupportedCurrency(value: string | undefined | null): value is CurrencyCode {
  return !!value && (SUPPORTED_CURRENCIES as readonly string[]).includes(value);
}
