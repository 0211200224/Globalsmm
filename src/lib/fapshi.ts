import "server-only";

const BASE_URLS = {
  sandbox: "https://sandbox.fapshi.com",
  live: "https://live.fapshi.com",
} as const;

function baseUrl() {
  return BASE_URLS[process.env.FAPSHI_ENV === "live" ? "live" : "sandbox"];
}

function authHeaders() {
  return {
    apiuser: process.env.FAPSHI_API_USER!,
    apikey: process.env.FAPSHI_API_KEY!,
    "Content-Type": "application/json",
  };
}

export type FapshiPaymentStatus = "CREATED" | "PENDING" | "SUCCESSFUL" | "FAILED" | "EXPIRED";

/**
 * Fapshi charges in XAF (amount is an integer, minimum 100) -- callers
 * convert from USD themselves using src/lib/currency/get-rates.ts, same
 * source the multi-currency display feature uses. `link` is a hosted
 * checkout page (same shape as Stripe Checkout); `externalId` is echoed
 * back on the webhook/status payload, so the caller should pass its own
 * internal Transaction.id there to look the row up later without relying
 * on a non-unique field.
 */
export async function initiatePay(input: {
  amount: number;
  email?: string;
  redirectUrl?: string;
  externalId?: string;
  message?: string;
}): Promise<{ link: string; transId: string }> {
  const res = await fetch(`${baseUrl()}/initiate-pay`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Fapshi initiate-pay failed (HTTP ${res.status}): ${body}`);
  }

  const data = (await res.json()) as { link?: string; transId?: string; message?: string };
  if (!data.link || !data.transId) {
    throw new Error(data.message ?? "Fapshi initiate-pay returned an unexpected response");
  }
  return { link: data.link, transId: data.transId };
}

export async function getPaymentStatus(transId: string) {
  const res = await fetch(`${baseUrl()}/payment-status/${transId}`, {
    method: "GET",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`Fapshi payment-status failed (HTTP ${res.status})`);
  return res.json() as Promise<{
    transId: string;
    status: FapshiPaymentStatus;
    amount: number;
    externalId?: string;
  }>;
}
