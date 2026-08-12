"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createOrder } from "@/lib/actions/orders";
import { formatUSD } from "@/lib/format";
import type { CatalogService } from "@/lib/types/catalog";

export function OrderModal({
  service,
  onClose,
}: {
  service: CatalogService;
  onClose: () => void;
}) {
  const router = useRouter();
  const [targetLink, setTargetLink] = useState("");
  const [quantity, setQuantity] = useState(service.minQuantity);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successOrderNumber, setSuccessOrderNumber] = useState<number | null>(null);

  const total = (quantity / 1000) * service.pricePer1000Raw;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await createOrder({
      serviceId: service.id,
      quantity,
      targetLink,
    });

    setLoading(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setSuccessOrderNumber(result.orderNumber);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="glass-panel bg-surface-container-low border border-white/10 rounded-2xl w-full max-w-lg p-6 md:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        {successOrderNumber !== null ? (
          <div className="text-center py-6 space-y-4">
            <span className="material-symbols-outlined text-secondary text-5xl">
              check_circle
            </span>
            <h3 className="text-headline-md text-on-surface">Order placed!</h3>
            <p className="text-body-md text-on-surface-variant">
              Your order ID is{" "}
              <span className="font-mono font-bold text-on-surface">
                #GS-{90000 + successOrderNumber}
              </span>
              . You can track its status in Orders.
            </p>
            <div className="flex gap-3 justify-center pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container-high transition-all"
              >
                Keep Browsing
              </button>
              <button
                type="button"
                onClick={() => router.push("/orders")}
                className="px-6 py-3 rounded-lg bg-primary text-on-primary font-bold hover:brightness-110 transition-all"
              >
                View Orders
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-[11px] text-on-surface-variant/70 uppercase tracking-wider font-bold mb-1">
                  {service.categoryName} · {service.serviceType}
                </p>
                <h3 className="text-headline-md text-on-surface">{service.name}</h3>
              </div>
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

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="block text-label-md text-on-surface-variant mb-2">
                  Link or Username
                </label>
                <input
                  className="w-full bg-surface-container border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg py-3 px-4 text-on-surface transition-all outline-none"
                  placeholder="https://instagram.com/youraccount"
                  type="text"
                  required
                  value={targetLink}
                  onChange={(e) => setTargetLink(e.target.value)}
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-label-md text-on-surface-variant">
                    Quantity
                  </label>
                  <span className="text-label-sm text-on-surface-variant">
                    Min {service.minQuantity.toLocaleString("en-US")} · Max{" "}
                    {service.maxQuantity.toLocaleString("en-US")}
                  </span>
                </div>
                <input
                  className="w-full bg-surface-container border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg py-3 px-4 font-mono text-on-surface transition-all outline-none"
                  type="number"
                  required
                  min={service.minQuantity}
                  max={service.maxQuantity}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                />
                {(quantity < service.minQuantity || quantity > service.maxQuantity) && (
                  <p className="text-label-sm text-error mt-2">
                    Quantity must be between {service.minQuantity.toLocaleString("en-US")} and{" "}
                    {service.maxQuantity.toLocaleString("en-US")}.
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between py-4 border-y border-white/5">
                <span className="text-label-md text-on-surface-variant">Total Price</span>
                <span className="text-headline-md text-secondary font-mono">
                  {formatUSD(Number.isFinite(total) ? total : 0)}
                </span>
              </div>

              <button
                type="submit"
                disabled={
                  loading ||
                  quantity < service.minQuantity ||
                  quantity > service.maxQuantity
                }
                className="w-full py-4 bg-primary text-on-primary font-bold rounded-lg hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Placing order..." : "Place Order"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
