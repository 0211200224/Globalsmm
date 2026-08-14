"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ensureApiKey, regenerateApiKey } from "@/lib/actions/api-key";

const ACTIONS = [
  {
    action: "services",
    desc: "List all active services with id, category, type, rate/1k, min/max, and refill guarantee.",
    params: "key, action=services",
  },
  {
    action: "add",
    desc: "Place an order. Returns the new order id.",
    params: "key, action=add, service, link, quantity",
  },
  {
    action: "status",
    desc: "Check one order (order=<id>) or many at once (orders=<id1>,<id2>,...).",
    params: "key, action=status, order (or orders)",
  },
  {
    action: "balance",
    desc: "Current wallet balance.",
    params: "key, action=balance",
  },
];

export function ApiView({ initialApiKey }: { initialApiKey: string | null }) {
  const router = useRouter();
  const [apiKey, setApiKey] = useState(initialApiKey);
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    const result = await ensureApiKey();
    setLoading(false);
    if (result.success) {
      setApiKey(result.apiKey);
      setRevealed(true);
      router.refresh();
    }
  }

  async function handleRegenerate() {
    if (!confirm("Regenerate your API key? Any tools using the old key will stop working.")) return;
    setLoading(true);
    const result = await regenerateApiKey();
    setLoading(false);
    if (result.success) {
      setApiKey(result.apiKey);
      setRevealed(true);
      router.refresh();
    }
  }

  async function handleCopy() {
    if (!apiKey) return;
    try {
      await navigator.clipboard.writeText(apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable — fail silently.
    }
  }

  const endpoint =
    typeof window !== "undefined" ? `${window.location.origin}/api/v2` : "/api/v2";

  return (
    <div className="space-y-gutter">
      {/* API key */}
      <section className="glass-panel rounded-xl p-stack-lg space-y-4">
        <h3 className="text-headline-md text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">key</span>
          Your API key
        </h3>

        {apiKey ? (
          <>
            <div className="flex items-center gap-2 bg-surface-container-lowest p-1 rounded-lg border border-outline-variant/30">
              <input
                readOnly
                type={revealed ? "text" : "password"}
                value={apiKey}
                className="flex-1 bg-transparent border-none text-body-md font-mono text-on-surface focus:ring-0 px-3"
              />
              <button
                type="button"
                onClick={() => setRevealed((v) => !v)}
                aria-label={revealed ? "Hide" : "Show"}
                className="p-2 text-on-surface-variant hover:text-on-surface rounded-md transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {revealed ? "visibility_off" : "visibility"}
                </span>
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className="relative p-2 bg-primary-container text-primary rounded-md hover:bg-primary/20 transition-all active:scale-90"
                aria-label="Copy API key"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {copied ? "check" : "content_copy"}
                </span>
              </button>
            </div>
            <button
              type="button"
              onClick={handleRegenerate}
              disabled={loading}
              className="text-label-sm text-error hover:underline disabled:opacity-60"
            >
              {loading ? "Regenerating..." : "Regenerate key"}
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading}
            className="px-6 py-3 rounded-lg bg-primary text-on-primary font-bold hover:brightness-110 active:scale-95 transition-all disabled:opacity-60"
          >
            {loading ? "Generating..." : "Generate API key"}
          </button>
        )}
      </section>

      {/* Docs */}
      <section className="glass-panel rounded-xl p-stack-lg space-y-4">
        <h3 className="text-headline-md text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">
            description
          </span>
          Documentation
        </h3>
        <p className="text-body-sm text-on-surface-variant">
          One endpoint, POST only, form-encoded or JSON body. Compatible with
          the standard SMM-panel API shape used by most reseller tools.
        </p>
        <div className="bg-surface-container-lowest rounded-lg p-4 font-mono text-body-sm text-on-surface overflow-x-auto">
          POST {endpoint}
        </div>

        <div className="space-y-3">
          {ACTIONS.map((a) => (
            <div
              key={a.action}
              className="border border-outline-variant/20 rounded-lg p-4"
            >
              <p className="font-mono text-label-md font-bold text-secondary mb-1">
                action={a.action}
              </p>
              <p className="text-body-sm text-on-surface-variant mb-2">
                {a.desc}
              </p>
              <p className="font-mono text-label-sm text-on-surface-variant/70">
                {a.params}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-surface-container-lowest rounded-lg p-4 font-mono text-label-sm text-on-surface-variant overflow-x-auto whitespace-pre">
{`curl -X POST ${endpoint} \\
  -d key=${apiKey ?? "YOUR_API_KEY"} \\
  -d action=services`}
        </div>
      </section>
    </div>
  );
}
