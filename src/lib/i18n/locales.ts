export const SUPPORTED_LOCALES = ["en", "pt", "es", "fr"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  pt: "Português",
  es: "Español",
  fr: "Français",
};

// Languages the interface doesn't speak yet, but the picker lists so users
// know they're coming and can register interest. Urdu needs RTL layout
// mirroring (a separate structural project, not just a dictionary) before
// it can ship, so it's deliberately not in SUPPORTED_LOCALES yet.
export const PLANNED_LOCALES = [
  { code: "nl", label: "Nederlands" },
  { code: "de", label: "Deutsch" },
  { code: "ur", label: "اردو" },
];

export const LOCALE_COOKIE = "gsmm-locale";

export function isSupportedLocale(value: string | undefined | null): value is Locale {
  return !!value && (SUPPORTED_LOCALES as readonly string[]).includes(value);
}
