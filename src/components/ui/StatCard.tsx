type StatCardProps = {
  label: string;
  value: string;
  icon: string;
  accent?: "primary" | "secondary" | "tertiary";
};

const accentClasses = {
  primary: "border-l-primary text-primary bg-primary/10",
  secondary: "border-l-secondary text-secondary bg-secondary/10",
  tertiary: "border-l-tertiary text-tertiary bg-tertiary/10",
} as const;

export function StatCard({ label, value, icon, accent = "primary" }: StatCardProps) {
  const [borderColor, iconColor, iconBg] = accentClasses[accent].split(" ");

  return (
    <div
      className={`stat-card-container glass-card p-4 md:p-5 rounded-2xl border-l-4 ${borderColor} flex items-center justify-between gap-2`}
    >
      <div className="min-w-0">
        <div className="stat-card-value text-on-surface font-bold mb-1">
          {value}
        </div>
        <div className="stat-card-label text-on-surface-variant font-medium">{label}</div>
      </div>
      <div
        className={`w-10 h-10 shrink-0 rounded-lg flex items-center justify-center ${iconBg} ${iconColor}`}
      >
        <span className="material-symbols-outlined text-[20px]">{icon}</span>
      </div>
    </div>
  );
}
