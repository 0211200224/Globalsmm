import type { ReactNode } from "react";

type PillTone = "neutral" | "positive" | "warning" | "negative" | "info";

const toneClasses: Record<PillTone, string> = {
  neutral: "bg-surface-container-highest text-on-surface-variant",
  positive: "bg-emerald-500/10 text-emerald-400",
  warning: "bg-tertiary-container text-tertiary",
  negative: "bg-error-container/40 text-error",
  info: "bg-secondary-container/30 text-secondary",
};

export function Pill({
  tone = "neutral",
  children,
}: {
  tone?: PillTone;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${toneClasses[tone]}`}
    >
      {children}
    </span>
  );
}
