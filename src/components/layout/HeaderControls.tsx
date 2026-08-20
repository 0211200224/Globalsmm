"use client";

import { useRouter } from "next/navigation";
import { useTheme } from "@/lib/theme";
import { useLocale } from "@/lib/i18n/I18nProvider";
import { SUPPORTED_LOCALES, LOCALE_LABELS, type Locale } from "@/lib/i18n/locales";
import { setLocale } from "@/lib/actions/locale";
import { useCurrency } from "@/lib/currency/CurrencyProvider";
import { SUPPORTED_CURRENCIES, CURRENCY_LABELS, type CurrencyCode } from "@/lib/currency/currencies";
import { setCurrency } from "@/lib/actions/currency";

/**
 * Theme + language + currency controls, meant to live in the header on
 * every screen — including pre-login (login/register), which is why this
 * doesn't assume an authenticated shell. Locale and currency are cookies
 * (see setLocale/get-dictionary.ts and setCurrency/get-currency.ts) so they
 * round-trip correctly even before signing in; theme is localStorage-only
 * (see src/lib/theme.ts), same as the settings page.
 */
export function HeaderControls() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const locale = useLocale();
  const { currency } = useCurrency();

  async function handleLanguageChange(next: Locale) {
    await setLocale(next);
    router.refresh();
  }

  async function handleCurrencyChange(next: CurrencyCode) {
    await setCurrency(next);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="p-2 text-on-surface-variant hover:bg-surface-container-highest/20 rounded-full transition-colors"
      >
        <span className="material-symbols-outlined text-[20px]">
          {theme === "dark" ? "light_mode" : "dark_mode"}
        </span>
      </button>
      <div className="relative flex items-center">
        <span className="material-symbols-outlined text-[18px] text-on-surface-variant pointer-events-none absolute left-2">
          language
        </span>
        <select
          aria-label="Language"
          value={locale}
          onChange={(e) => handleLanguageChange(e.target.value as Locale)}
          className="bg-transparent border-none text-label-sm text-on-surface-variant focus:ring-0 cursor-pointer appearance-none pl-8 pr-2 py-2 hover:bg-surface-container-highest/20 rounded-full transition-colors"
        >
          {SUPPORTED_LOCALES.map((code) => (
            <option key={code} value={code} className="text-on-surface bg-surface-container">
              {LOCALE_LABELS[code]}
            </option>
          ))}
        </select>
      </div>
      <div className="relative flex items-center">
        <span className="material-symbols-outlined text-[18px] text-on-surface-variant pointer-events-none absolute left-2">
          payments
        </span>
        <select
          aria-label="Currency"
          value={currency}
          onChange={(e) => handleCurrencyChange(e.target.value as CurrencyCode)}
          className="bg-transparent border-none text-label-sm text-on-surface-variant focus:ring-0 cursor-pointer appearance-none pl-8 pr-2 py-2 hover:bg-surface-container-highest/20 rounded-full transition-colors"
        >
          {SUPPORTED_CURRENCIES.map((code) => (
            <option key={code} value={code} className="text-on-surface bg-surface-container">
              {code} — {CURRENCY_LABELS[code]}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
