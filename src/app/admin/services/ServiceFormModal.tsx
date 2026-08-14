"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createService, updateService, type ServiceInput } from "@/lib/actions/admin-catalog";

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
};

export function ServiceFormModal({
  categories,
  existing,
  onClose,
}: {
  categories: { id: string; name: string }[];
  existing: EditableService | null;
  onClose: () => void;
}) {
  const router = useRouter();
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
            {existing ? "Edit Service" : "New Service"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
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
            <label className="text-label-sm text-on-surface-variant">Service name</label>
            <input
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-2.5 px-3 text-on-surface outline-none focus:ring-2 focus:ring-tertiary/40"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-label-sm text-on-surface-variant">Platform</label>
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
              Service type (e.g. Followers, Likes, Views)
            </label>
            <input
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-2.5 px-3 text-on-surface outline-none focus:ring-2 focus:ring-tertiary/40"
              value={form.serviceType}
              onChange={(e) => setForm({ ...form, serviceType: e.target.value })}
              required
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="text-label-sm text-on-surface-variant">Description</label>
            <textarea
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-2.5 px-3 text-on-surface outline-none focus:ring-2 focus:ring-tertiary/40"
              rows={2}
              value={form.description ?? ""}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-label-sm text-on-surface-variant">Price per 1000 (USD)</label>
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
            <label className="text-label-sm text-on-surface-variant">Delivery speed label</label>
            <input
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-2.5 px-3 text-on-surface outline-none focus:ring-2 focus:ring-tertiary/40"
              value={form.speedLabel}
              onChange={(e) => setForm({ ...form, speedLabel: e.target.value })}
              placeholder="Instant, 10m / 1k, 24 hours..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-label-sm text-on-surface-variant">Min quantity</label>
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
            <label className="text-label-sm text-on-surface-variant">Max quantity</label>
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
              Material icon name
            </label>
            <input
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-2.5 px-3 text-on-surface outline-none focus:ring-2 focus:ring-tertiary/40"
              value={form.icon}
              onChange={(e) => setForm({ ...form, icon: e.target.value })}
              placeholder="group, favorite, visibility..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-label-sm text-on-surface-variant">Badge (optional)</label>
            <select
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-2.5 px-3 text-on-surface outline-none focus:ring-2 focus:ring-tertiary/40"
              value={form.badge ?? ""}
              onChange={(e) => setForm({ ...form, badge: e.target.value || null })}
            >
              <option value="">None</option>
              <option value="Hot">Hot</option>
              <option value="Stable">Stable</option>
              <option value="Elite">Elite</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-label-sm text-on-surface-variant">
              Quality score (0-10, optional)
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
              placeholder="e.g. 9.4"
            />
          </div>

          <div className="space-y-2">
            <label className="text-label-sm text-on-surface-variant">
              Avg. retention % (0-100, optional)
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
              placeholder="e.g. 90"
            />
          </div>

          <div className="space-y-2">
            <label className="text-label-sm text-on-surface-variant">
              Refill guarantee (days, 0 = none)
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
              Customers can self-serve one auto-approved refill within this window.
            </p>
          </div>

          <div className="md:col-span-2 flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-on-surface-variant hover:text-on-surface transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 rounded-lg bg-tertiary text-on-tertiary font-bold hover:opacity-90 active:scale-95 transition-all disabled:opacity-60"
            >
              {loading ? "Saving..." : existing ? "Save Changes" : "Create Service"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
