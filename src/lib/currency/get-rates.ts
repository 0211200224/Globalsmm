import "server-only";
import { SUPPORTED_CURRENCIES, type CurrencyCode } from "./currencies";

const PRIMARY_URL =
  "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json";
const FALLBACK_URL = "https://latest.currency-api.pages.dev/v1/currencies/usd.json";

// Last-known-good snapshot (2026-08-20, confirmed live against the API
// above) -- used only if both the primary CDN and its official Cloudflare
// mirror are unreachable, so a display feature never breaks page loads.
// Rates go stale in this path, never absent.
const HARDCODED_FALLBACK: Record<CurrencyCode, number> = {
  USD: 1,
  EUR: 0.856,
  GBP: 0.735,
  BRL: 5.178,
  XAF: 561.54,
  XOF: 561.54,
  MZN: 63.81,
  AOA: 912,
  NGN: 1550,
  GHS: 15.5,
  KES: 129,
  ZAR: 18.3,
  UGX: 3700,
  INR: 83.5,
  MXN: 17.5,
  ARS: 1050,
  COP: 4050,
  CAD: 1.36,
  AUD: 1.52,
};

async function fetchRates(url: string): Promise<Record<CurrencyCode, number> | null> {
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;

    const data = (await res.json()) as { usd?: Record<string, number> };
    const table = data.usd;
    if (!table) return null;

    const rates = {} as Record<CurrencyCode, number>;
    for (const code of SUPPORTED_CURRENCIES) {
      const value = code === "USD" ? 1 : table[code.toLowerCase()];
      if (typeof value !== "number" || !Number.isFinite(value)) return null;
      rates[code] = value;
    }
    return rates;
  } catch {
    return null;
  }
}

/**
 * USD-based exchange rates for every SUPPORTED_CURRENCIES entry (e.g.
 * rates.XAF = how many XAF equal 1 USD). Cached for an hour via Next's
 * fetch cache -- the upstream data only updates daily anyway. Three-tier
 * fallback (primary CDN -> Cloudflare mirror -> hardcoded snapshot).
 */
export async function getRates(): Promise<Record<CurrencyCode, number>> {
  return (await fetchRates(PRIMARY_URL)) ?? (await fetchRates(FALLBACK_URL)) ?? HARDCODED_FALLBACK;
}
