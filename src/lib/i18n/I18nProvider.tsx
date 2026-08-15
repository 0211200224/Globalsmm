"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Dictionary } from "./dictionary-type";
import type { Locale } from "./locales";

type I18nContextValue = { locale: Locale; dict: Dictionary };

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
  locale,
  dict,
  children,
}: {
  locale: Locale;
  dict: Dictionary;
  children: ReactNode;
}) {
  return (
    <I18nContext.Provider value={{ locale, dict }}>
      {children}
    </I18nContext.Provider>
  );
}

function useI18nContext() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useTranslations/useLocale must be used within I18nProvider");
  return ctx;
}

export function useTranslations() {
  return useI18nContext().dict;
}

export function useLocale() {
  return useI18nContext().locale;
}

/** Simple `{placeholder}` substitution — no plural rules, matches this app's needs. */
export function formatMessage(template: string, vars?: Record<string, string | number>) {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key] ?? ""));
}
