"use client";

import { useState } from "react";

type CopyFieldProps = {
  label: string;
  value: string;
  monospace?: boolean;
};

export function CopyField({ label, value, monospace }: CopyFieldProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable (e.g. insecure context) — fail silently.
    }
  }

  return (
    <div className="space-y-stack-sm">
      <label className="text-label-sm text-on-surface-variant">{label}</label>
      <div className="flex items-center gap-2 bg-surface-container-lowest p-1 rounded-lg border border-outline-variant/30">
        <input
          className={`flex-1 bg-transparent border-none text-body-md text-on-surface focus:ring-0 px-3 ${
            monospace ? "font-bold tracking-widest" : ""
          }`}
          readOnly
          type="text"
          value={value}
        />
        <button
          type="button"
          onClick={handleCopy}
          className="relative p-2 bg-primary-container text-primary rounded-md hover:bg-primary/20 transition-all active:scale-90"
          aria-label={`Copy ${label}`}
        >
          <span className="material-symbols-outlined text-[20px]">
            {copied ? "check" : "content_copy"}
          </span>
          {copied && (
            <span className="absolute -top-9 right-0 bg-on-surface text-inverse-on-surface text-label-sm px-2 py-1 rounded-md whitespace-nowrap">
              Copied!
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
