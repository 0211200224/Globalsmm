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
      className={`glass-card p-6 rounded-2xl border-l-4 ${borderColor} flex items-center justify-between`}
    >
      <div>
        <div className="text-headline-lg text-on-surface font-bold mb-1">
          {value}
        </div>
        <div className="text-label-md text-on-surface-variant">{label}</div>
      </div>
      <div
        className={`w-12 h-12 rounded-lg flex items-center justify-center ${iconBg} ${iconColor}`}
      >
        <span className="material-symbols-outlined">{icon}</span>
      </div>
    </div>
  );
}
