"use server";

import { cookies } from "next/headers";
import { LOCALE_COOKIE, isSupportedLocale } from "@/lib/i18n/locales";

export async function setLocale(locale: string) {
  if (!isSupportedLocale(locale)) {
    return { success: false as const, error: "Unsupported language." };
  }

  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE, locale, {
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
    sameSite: "lax",
  });

  return { success: true as const };
}
