// Curated global set: majors (USD/EUR/GBP/CAD/AUD) plus a currency for
// every market the site's 4 languages already serve -- PT: Brazil/Portugal/
// Angola/Mozambique, FR: Francophone Africa, ES: Latin America/Spain,
// EN: US/UK/Anglophone Africa/India.
export const SUPPORTED_CURRENCIES = [
  "USD",
  "EUR",
  "GBP",
  "BRL",
  "XAF",
  "XOF",
  "MZN",
  "AOA",
  "NGN",
  "GHS",
  "KES",
  "ZAR",
  "UGX",
  "INR",
  "MXN",
  "ARS",
  "COP",
  "CAD",
  "AUD",
] as const;
export type CurrencyCode = (typeof SUPPORTED_CURRENCIES)[number];
export const DEFAULT_CURRENCY: CurrencyCode = "USD";

export const CURRENCY_LABELS: Record<CurrencyCode, string> = {
  USD: "US Dollar",
  EUR: "Euro",
  GBP: "British Pound",
  BRL: "Real (BRL)",
  XAF: "Franc CFA — Central Africa (XAF)",
  XOF: "Franc CFA — West Africa (XOF)",
  MZN: "Metical (MZN)",
  AOA: "Kwanza (AOA)",
  NGN: "Naira (NGN)",
  GHS: "Cedi (GHS)",
  KES: "Kenyan Shilling (KES)",
  ZAR: "Rand (ZAR)",
  UGX: "Ugandan Shilling (UGX)",
  INR: "Indian Rupee (INR)",
  MXN: "Mexican Peso (MXN)",
  ARS: "Argentine Peso (ARS)",
  COP: "Colombian Peso (COP)",
  CAD: "Canadian Dollar (CAD)",
  AUD: "Australian Dollar (AUD)",
};

export const CURRENCY_COOKIE = "gsmm-currency";

export function isSupportedCurrency(value: string | undefined | null): value is CurrencyCode {
  return !!value && (SUPPORTED_CURRENCIES as readonly string[]).includes(value);
}
