"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { updateDisplayName } from "@/lib/actions/profile";
import { useTheme } from "@/lib/theme";

const LANGUAGE_STORAGE_KEY = "gsmm-language";

const languages = [
  { code: "en", label: "English" },
  { code: "pt", label: "Português" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
];

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

  const [nameInput, setNameInput] = useState(name);
  const [savingName, setSavingName] = useState(false);
  const [nameSaved, setNameSaved] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  const [language, setLanguage] = useState("en");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (stored) setLanguage(stored);
    } catch {
      // Storage unavailable — default to English.
    }
  }, []);

  function handleLanguageChange(code: string) {
    setLanguage(code);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, code);
    } catch {
      // Preference just won't persist across visits.
    }
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
          Profile
        </h3>

        <form onSubmit={handleSaveName} className="space-y-4">
          <div className="space-y-2">
            <label className="text-label-md text-on-surface-variant">
              Display name
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
              Email
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
                {savingName ? "Saving..." : "Save"}
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
          Appearance
        </h3>
        <p className="text-body-sm text-on-surface-variant">
          Choose how GlobalSMM looks on this device.
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
            <span className="text-label-md font-medium">Dark</span>
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
            <span className="text-label-md font-medium">Light</span>
          </button>
        </div>
      </section>

      {/* Language */}
      <section className="glass-panel rounded-xl p-stack-lg space-y-4 lg:col-span-2">
        <h3 className="text-headline-md text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">
            translate
          </span>
          Language
        </h3>
        <p className="text-body-sm text-on-surface-variant">
          Pick your preferred language. We&apos;re rolling translations out
          gradually — the interface stays in English until yours is ready,
          but your choice is saved for when it launches.
        </p>

        <div className="flex flex-wrap gap-2">
          {languages.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => handleLanguageChange(lang.code)}
              className={
                language === lang.code
                  ? "px-4 py-2 rounded-full bg-primary/20 text-primary border border-primary/30 text-label-sm"
                  : "px-4 py-2 rounded-full border border-outline-variant/50 text-on-surface-variant hover:text-on-surface text-label-sm transition-all"
              }
            >
              {lang.label}
              {lang.code !== "en" && language === lang.code && (
                <span className="ml-1.5 text-on-surface-variant/60">
                  (coming soon)
                </span>
              )}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
