"use client";

import { useEffect, useState } from "react";
import { listProviderCatalog } from "@/lib/actions/admin-providers";

type CatalogEntry = {
  id: string;
  name: string;
  rate: number;
  min: number;
  max: number;
  category?: string;
};

export function ProviderCatalogModal({
  providerId,
  providerName,
  onClose,
}: {
  providerId: string;
  providerName: string;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [services, setServices] = useState<CatalogEntry[]>([]);
  const [query, setQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = await listProviderCatalog(providerId);
      if (cancelled) return;
      if (!result.success) {
        setError(result.error);
      } else {
        setServices(result.services);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [providerId]);

  const filtered = services.filter(
    (s) =>
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.id.includes(query) ||
      (s.category ?? "").toLowerCase().includes(query.toLowerCase()),
  );

  async function handleCopy(id: string) {
    try {
      await navigator.clipboard.writeText(id);
      setCopiedId(id);
      setTimeout(() => setCopiedId((current) => (current === id ? null : current)), 1500);
    } catch {
      // Clipboard API unavailable — the id is still selectable/visible in the row.
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="glass-panel bg-surface-container-low border border-white/10 rounded-2xl w-full max-w-2xl p-6 md:p-8 shadow-2xl max-h-[85vh] flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-headline-md text-on-surface">{providerName} catalog</h3>
            <p className="text-label-sm text-on-surface-variant mt-1">
              Copy the ID you need into the service&apos;s &quot;Provider&apos;s service ID&quot; field.
            </p>
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

        {!loading && !error && (
          <input
            className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-2.5 px-3 text-on-surface outline-none focus:ring-2 focus:ring-tertiary/40 mb-4"
            placeholder="Search by name, ID, or category..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        )}

        <div className="overflow-y-auto flex-1 -mx-2 px-2">
          {loading && (
            <p className="text-body-sm text-on-surface-variant py-8 text-center">
              Fetching catalog…
            </p>
          )}
          {error && (
            <div className="bg-error-container/20 border border-error/30 text-error text-body-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}
          {!loading && !error && filtered.length === 0 && (
            <p className="text-body-sm text-on-surface-variant py-8 text-center">
              No services match &quot;{query}&quot;.
            </p>
          )}
          {!loading && !error && filtered.length > 0 && (
            <table className="w-full text-body-sm">
              <thead className="sticky top-0 bg-surface-container-low">
                <tr className="text-left text-label-sm text-on-surface-variant border-b border-outline-variant/20">
                  <th className="py-2 pr-2">ID</th>
                  <th className="py-2 pr-2">Name</th>
                  <th className="py-2 pr-2">Rate/1k</th>
                  <th className="py-2 pr-2">Min / Max</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id} className="border-b border-outline-variant/10">
                    <td className="py-2 pr-2 font-mono text-on-surface-variant">{s.id}</td>
                    <td className="py-2 pr-2 text-on-surface">
                      {s.name}
                      {s.category && (
                        <span className="block text-label-sm text-on-surface-variant">
                          {s.category}
                        </span>
                      )}
                    </td>
                    <td className="py-2 pr-2 font-mono text-secondary">${s.rate.toFixed(4)}</td>
                    <td className="py-2 pr-2 text-on-surface-variant">
                      {s.min.toLocaleString("en-US")} / {s.max.toLocaleString("en-US")}
                    </td>
                    <td className="py-2 text-right">
                      <button
                        type="button"
                        onClick={() => handleCopy(s.id)}
                        className="px-2 py-1 rounded-lg border border-outline-variant text-label-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
                      >
                        {copiedId === s.id ? "Copied!" : "Copy ID"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
