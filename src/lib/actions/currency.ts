"use server";

import { cookies } from "next/headers";
import { CURRENCY_COOKIE, isSupportedCurrency } from "@/lib/currency/currencies";

export async function setCurrency(currency: string) {
  if (!isSupportedCurrency(currency)) {
    return { success: false as const, error: "Unsupported currency." };
  }

  const cookieStore = await cookies();
  cookieStore.set(CURRENCY_COOKIE, currency, {
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
    sameSite: "lax",
  });

  return { success: true as const };
}
