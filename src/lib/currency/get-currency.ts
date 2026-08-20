import "server-only";

import { cookies } from "next/headers";
import { CURRENCY_COOKIE, DEFAULT_CURRENCY, isSupportedCurrency, type CurrencyCode } from "./currencies";

export async function getCurrency(): Promise<CurrencyCode> {
  const cookieStore = await cookies();
  const value = cookieStore.get(CURRENCY_COOKIE)?.value;
  return isSupportedCurrency(value) ? value : DEFAULT_CURRENCY;
}
