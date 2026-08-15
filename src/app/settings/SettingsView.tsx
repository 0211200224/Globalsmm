"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateDisplayName } from "@/lib/actions/profile";
import { setLocale } from "@/lib/actions/locale";
import { useTheme } from "@/lib/theme";
import { useTranslations, useLocale } from "@/lib/i18n/I18nProvider";
import { SUPPORTED_LOCALES, LOCALE_LABELS, PLANNED_LOCALES, type Locale } from "@/lib/i18n/locales";

export function SettingsView({
  name,
  email,
  tier,
}: {
  name: string;
  email: string;
  tier: string;
}) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const t = useTranslations();
  const locale = useLocale();

  const [nameInput, setNameInput] = useState(name);
  const [savingName, setSavingName] = useState(false);
  const [nameSaved, setNameSaved] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [changingLanguage, setChangingLanguage] = useState(false);

  async function handleLanguageChange(code: Locale) {
    setChangingLanguage(true);
    await setLocale(code);
    router.refresh();
    setChangingLanguage(false);
  }

  async function handleSaveName(e: React.FormEvent) {
    e.preventDefault();
    setNameError(null);
    setNameSaved(false);
    setSavingName(true);

    const result = await updateDisplayName(nameInput);

    setSavingName(false);
    if (!result.success) {
      setNameError(result.error);
      return;
    }
    setNameSaved(true);
    router.refresh();
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
      {/* Profile */}
      <section className="glass-panel rounded-xl p-stack-lg space-y-4">
        <h3 className="text-headline-md text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">
            person
          </span>
          {t.settings.profile}
        </h3>

        <form onSubmit={handleSaveName} className="space-y-4">
          <div className="space-y-2">
            <label className="text-label-md text-on-surface-variant">
              {t.settings.displayName}
            </label>
            <input
              className="w-full bg-surface-container border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg py-3 px-4 text-on-surface outline-none transition-all"
              value={nameInput}
              onChange={(e) => {
                setNameInput(e.target.value);
                setNameSaved(false);
              }}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-label-md text-on-surface-variant">
              {t.settings.email}
            </label>
            <input
              className="w-full bg-surface-container-high border border-outline-variant/50 rounded-lg py-3 px-4 text-on-surface-variant outline-none cursor-not-allowed"
              value={email}
              disabled
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-label-sm text-on-surface-variant uppercase tracking-wider">
              {tier} tier
            </span>
            <div className="flex items-center gap-3">
              {nameError && (
                <span className="text-label-sm text-error">{nameError}</span>
              )}
              {nameSaved && (
                <span className="text-label-sm text-secondary">Saved</span>
              )}
              <button
                type="submit"
                disabled={savingName}
                className="px-5 py-2.5 rounded-lg bg-primary text-on-primary font-bold hover:brightness-110 active:scale-95 transition-all disabled:opacity-60"
              >
                {savingName ? t.common.saving : t.common.save}
              </button>
            </div>
          </div>
        </form>
      </section>

      {/* Appearance */}
      <section className="glass-panel rounded-xl p-stack-lg space-y-4">
        <h3 className="text-headline-md text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">
            palette
          </span>
          {t.settings.appearance}
        </h3>
        <p className="text-body-sm text-on-surface-variant">
          {t.settings.appearanceSubtitle}
        </p>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setTheme("dark")}
            className={
              theme === "dark"
                ? "flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-primary bg-primary/5"
                : "flex flex-col items-center gap-2 p-4 rounded-xl border border-outline-variant hover:border-primary/40 transition-colors"
            }
          >
            <span className="material-symbols-outlined text-2xl">
              dark_mode
            </span>
            <span className="text-label-md font-medium">{t.settings.dark}</span>
          </button>
          <button
            type="button"
            onClick={() => setTheme("light")}
            className={
              theme === "light"
                ? "flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-primary bg-primary/5"
                : "flex flex-col items-center gap-2 p-4 rounded-xl border border-outline-variant hover:border-primary/40 transition-colors"
            }
          >
            <span className="material-symbols-outlined text-2xl">
              light_mode
            </span>
            <span className="text-label-md font-medium">{t.settings.light}</span>
          </button>
        </div>
      </section>

      {/* Language */}
      <section className="glass-panel rounded-xl p-stack-lg space-y-4 lg:col-span-2">
        <h3 className="text-headline-md text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">
            translate
          </span>
          {t.settings.language}
        </h3>
        <p className="text-body-sm text-on-surface-variant">
          {t.settings.languageSubtitle}
        </p>

        <div className="flex flex-wrap gap-2">
          {SUPPORTED_LOCALES.map((code) => (
            <button
              key={code}
              type="button"
              disabled={changingLanguage}
              onClick={() => handleLanguageChange(code)}
              className={
                locale === code
                  ? "px-4 py-2 rounded-full bg-primary/20 text-primary border border-primary/30 text-label-sm disabled:opacity-60"
                  : "px-4 py-2 rounded-full border border-outline-variant/50 text-on-surface-variant hover:text-on-surface text-label-sm transition-all disabled:opacity-60"
              }
            >
              {LOCALE_LABELS[code]}
            </button>
          ))}
          {PLANNED_LOCALES.map((lang) => (
            <span
              key={lang.code}
              className="px-4 py-2 rounded-full border border-dashed border-outline-variant/40 text-on-surface-variant/50 text-label-sm cursor-not-allowed"
              title={t.settings.comingSoon}
            >
              {lang.label}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
