"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProvider, updateProvider, type ProviderInput } from "@/lib/actions/admin-providers";
import { useTranslations } from "@/lib/i18n/I18nProvider";

export type EditableProvider = {
  id: string;
  name: string;
  apiUrl: string;
};

export function ProviderFormModal({
  existing,
  onClose,
}: {
  existing: EditableProvider | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const t = useTranslations().admin.providers;
  const [form, setForm] = useState<ProviderInput>({
    name: existing?.name ?? "",
    apiUrl: existing?.apiUrl ?? "",
    // Never pre-filled from the server — editing leaves this blank to keep
    // the existing key (see updateProvider in admin-providers.ts).
    apiKey: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = existing
      ? await updateProvider(existing.id, form)
      : await createProvider(form);

    setLoading(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    router.refresh();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="glass-panel bg-surface-container-low border border-white/10 rounded-2xl w-full max-w-lg p-6 md:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <h3 className="text-headline-md text-on-surface">
            {existing ? t.editTitle : t.newTitle}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.close}
            className="p-2 text-on-surface-variant hover:text-on-surface rounded-full hover:bg-surface-container-high transition-all"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {error && (
          <div className="bg-error-container/20 border border-error/30 text-error text-body-sm rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-gutter">
          <div className="space-y-2">
            <label className="text-label-sm text-on-surface-variant">{t.nameLabel}</label>
            <input
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-2.5 px-3 text-on-surface outline-none focus:ring-2 focus:ring-tertiary/40"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder={t.namePlaceholder}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-label-sm text-on-surface-variant">{t.apiUrlLabel}</label>
            <input
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-2.5 px-3 text-on-surface outline-none focus:ring-2 focus:ring-tertiary/40 font-mono text-sm"
              value={form.apiUrl}
              onChange={(e) => setForm({ ...form, apiUrl: e.target.value })}
              placeholder={t.apiUrlPlaceholder}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-label-sm text-on-surface-variant">
              {t.apiKeyLabel} {existing && t.apiKeyKeepHint}
            </label>
            <input
              type="password"
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-2.5 px-3 text-on-surface outline-none focus:ring-2 focus:ring-tertiary/40 font-mono text-sm"
              value={form.apiKey}
              onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
              placeholder={existing ? "••••••••" : ""}
              required={!existing}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-on-surface-variant hover:text-on-surface transition-colors"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 rounded-lg bg-tertiary text-on-tertiary font-bold hover:opacity-90 active:scale-95 transition-all disabled:opacity-60"
            >
              {loading ? t.saving : existing ? t.saveChanges : t.createProvider}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
