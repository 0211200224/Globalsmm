"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTicket } from "@/lib/actions/support";
import { useTranslations } from "@/lib/i18n/I18nProvider";

export function NewTicketModal({
  orders,
  onClose,
}: {
  orders: { id: string; label: string }[];
  onClose: () => void;
}) {
  const router = useRouter();
  const dict = useTranslations();
  const t = dict.support;
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [orderId, setOrderId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await createTicket({ subject, message, orderId: orderId || null });

    setLoading(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    router.push(`/support/${result.ticketId}`);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="glass-panel bg-surface-container-low border border-white/10 rounded-2xl w-full max-w-lg p-6 md:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <h3 className="text-headline-md text-on-surface">{t.newTicketTitle}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label={dict.common.close}
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

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-label-md text-on-surface-variant">{t.subject}</label>
            <input
              className="w-full bg-surface-container border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg py-3 px-4 text-on-surface outline-none transition-all"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>

          {orders.length > 0 && (
            <div className="space-y-2">
              <label className="text-label-md text-on-surface-variant">
                {t.relatedOrder}
              </label>
              <select
                className="w-full bg-surface-container border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg py-3 px-4 text-on-surface outline-none transition-all"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
              >
                <option value="">{t.noOrderOption}</option>
                {orders.map((order) => (
                  <option key={order.id} value={order.id}>
                    {order.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-label-md text-on-surface-variant">{t.message}</label>
            <textarea
              className="w-full bg-surface-container border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg py-3 px-4 text-on-surface outline-none transition-all"
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t.messagePlaceholder}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-primary text-on-primary font-bold rounded-lg hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? t.submitting : t.submitTicket}
          </button>
        </form>
      </div>
    </div>
  );
}
