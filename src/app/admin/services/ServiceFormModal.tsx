"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createService, updateService, type ServiceInput } from "@/lib/actions/admin-catalog";
import { useTranslations } from "@/lib/i18n/I18nProvider";

export type EditableService = {
  id: string;
  categoryId: string;
  serviceType: string;
  name: string;
  description: string | null;
  icon: string;
  badge: string | null;
  speedLabel: string;
  pricePer1000: number;
  minQuantity: number;
  maxQuantity: number;
  qualityScore: number | null;
  retentionPercent: number | null;
  refillDays: number;
  providerId: string | null;
  externalServiceId: string | null;
  costPer1000: number | null;
};

export function ServiceFormModal({
  categories,
  providers,
  existing,
  onClose,
}: {
  categories: { id: string; name: string }[];
  providers: { id: string; name: string }[];
  existing: EditableService | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const t = useTranslations().admin.services;
  const [form, setForm] = useState<ServiceInput>(
    existing ?? {
      categoryId: categories[0]?.id ?? "",
      serviceType: "",
      name: "",
      description: "",
      icon: "bolt",
      badge: null,
      speedLabel: "Instant",
      pricePer1000: 1,
      minQuantity: 100,
      maxQuantity: 10000,
      qualityScore: null,
      retentionPercent: null,
      refillDays: 30,
      providerId: null,
      externalServiceId: null,
      costPer1000: null,
    },
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = existing
      ? await updateService(existing.id, form)
      : await createService(form);

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
      <div className="glass-panel bg-surface-container-low border border-white/10 rounded-2xl w-full max-w-2xl p-6 md:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <h3 className="text-headline-md text-on-surface">
            {existing ? t.formTitleEdit : t.formTitleNew}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.closeAria}
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

        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-gutter">
          <div className="md:col-span-2 space-y-2">
            <label className="text-label-sm text-on-surface-variant">{t.nameLabel}</label>
            <input
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-2.5 px-3 text-on-surface outline-none focus:ring-2 focus:ring-tertiary/40"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-label-sm text-on-surface-variant">{t.platformLabel}</label>
            <select
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-2.5 px-3 text-on-surface outline-none focus:ring-2 focus:ring-tertiary/40"
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-label-sm text-on-surface-variant">
              {t.serviceTypeLabel}
            </label>
            <input
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-2.5 px-3 text-on-surface outline-none focus:ring-2 focus:ring-tertiary/40"
              value={form.serviceType}
              onChange={(e) => setForm({ ...form, serviceType: e.target.value })}
              required
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="text-label-sm text-on-surface-variant">{t.descriptionLabel}</label>
            <textarea
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-2.5 px-3 text-on-surface outline-none focus:ring-2 focus:ring-tertiary/40"
              rows={2}
              value={form.description ?? ""}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-label-sm text-on-surface-variant">{t.priceLabel}</label>
            <input
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-2.5 px-3 text-on-surface outline-none focus:ring-2 focus:ring-tertiary/40"
              type="number"
              step="0.0001"
              min="0.0001"
              value={form.pricePer1000}
              onChange={(e) => setForm({ ...form, pricePer1000: Number(e.target.value) })}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-label-sm text-on-surface-variant">{t.speedLabel}</label>
            <input
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-2.5 px-3 text-on-surface outline-none focus:ring-2 focus:ring-tertiary/40"
              value={form.speedLabel}
              onChange={(e) => setForm({ ...form, speedLabel: e.target.value })}
              placeholder={t.speedPlaceholder}
            />
          </div>

          <div className="space-y-2">
            <label className="text-label-sm text-on-surface-variant">{t.minQtyLabel}</label>
            <input
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-2.5 px-3 text-on-surface outline-none focus:ring-2 focus:ring-tertiary/40"
              type="number"
              min="1"
              value={form.minQuantity}
              onChange={(e) => setForm({ ...form, minQuantity: Number(e.target.value) })}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-label-sm text-on-surface-variant">{t.maxQtyLabel}</label>
            <input
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-2.5 px-3 text-on-surface outline-none focus:ring-2 focus:ring-tertiary/40"
              type="number"
              min="1"
              value={form.maxQuantity}
              onChange={(e) => setForm({ ...form, maxQuantity: Number(e.target.value) })}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-label-sm text-on-surface-variant">
              {t.iconLabel}
            </label>
            <input
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-2.5 px-3 text-on-surface outline-none focus:ring-2 focus:ring-tertiary/40"
              value={form.icon}
              onChange={(e) => setForm({ ...form, icon: e.target.value })}
              placeholder={t.iconPlaceholder}
            />
          </div>

          <div className="space-y-2">
            <label className="text-label-sm text-on-surface-variant">{t.badgeLabel}</label>
            <select
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-2.5 px-3 text-on-surface outline-none focus:ring-2 focus:ring-tertiary/40"
              value={form.badge ?? ""}
              onChange={(e) => setForm({ ...form, badge: e.target.value || null })}
            >
              <option value="">{t.badgeNone}</option>
              <option value="Hot">{t.badgeHot}</option>
              <option value="Stable">{t.badgeStable}</option>
              <option value="Elite">{t.badgeElite}</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-label-sm text-on-surface-variant">
              {t.qualityLabel}
            </label>
            <input
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-2.5 px-3 text-on-surface outline-none focus:ring-2 focus:ring-tertiary/40"
              type="number"
              step="0.1"
              min="0"
              max="10"
              value={form.qualityScore ?? ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  qualityScore: e.target.value === "" ? null : Number(e.target.value),
                })
              }
              placeholder={t.qualityPlaceholder}
            />
          </div>

          <div className="space-y-2">
            <label className="text-label-sm text-on-surface-variant">
              {t.retentionLabel}
            </label>
            <input
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-2.5 px-3 text-on-surface outline-none focus:ring-2 focus:ring-tertiary/40"
              type="number"
              min="0"
              max="100"
              value={form.retentionPercent ?? ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  retentionPercent: e.target.value === "" ? null : Number(e.target.value),
                })
              }
              placeholder={t.retentionPlaceholder}
            />
          </div>

          <div className="space-y-2">
            <label className="text-label-sm text-on-surface-variant">
              {t.refillLabel}
            </label>
            <input
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-2.5 px-3 text-on-surface outline-none focus:ring-2 focus:ring-tertiary/40"
              type="number"
              min="0"
              value={form.refillDays}
              onChange={(e) => setForm({ ...form, refillDays: Number(e.target.value) })}
              required
            />
            <p className="text-label-sm text-on-surface-variant/60">
              {t.refillHint}
            </p>
          </div>

          <div className="md:col-span-2 border-t border-outline-variant/20 pt-4 mt-2">
            <p className="text-label-sm text-on-surface-variant font-bold uppercase tracking-wide mb-1">
              {t.fulfillmentSection}
            </p>
            <p className="text-label-sm text-on-surface-variant/60">
              {t.fulfillmentHint}
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-label-sm text-on-surface-variant">{t.providerLabel}</label>
            <select
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-2.5 px-3 text-on-surface outline-none focus:ring-2 focus:ring-tertiary/40"
              value={form.providerId ?? ""}
              onChange={(e) => setForm({ ...form, providerId: e.target.value || null })}
            >
              <option value="">{t.providerNone}</option>
              {providers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-label-sm text-on-surface-variant">
              {t.externalIdLabel}
            </label>
            <input
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-2.5 px-3 text-on-surface outline-none focus:ring-2 focus:ring-tertiary/40"
              value={form.externalServiceId ?? ""}
              onChange={(e) => setForm({ ...form, externalServiceId: e.target.value || null })}
              placeholder={t.externalIdPlaceholder}
            />
          </div>

          <div className="space-y-2">
            <label className="text-label-sm text-on-surface-variant">
              {t.costLabel}
            </label>
            <input
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-2.5 px-3 text-on-surface outline-none focus:ring-2 focus:ring-tertiary/40"
              type="number"
              step="0.0001"
              min="0"
              value={form.costPer1000 ?? ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  costPer1000: e.target.value === "" ? null : Number(e.target.value),
                })
              }
              placeholder={t.costPlaceholder}
            />
          </div>

          <div className="md:col-span-2 flex justify-end gap-2 pt-2">
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
              {loading ? t.saving : existing ? t.saveChanges : t.createService}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
