import { weeklySignups } from "@/app/affiliate/data";

export function GrowthChart() {
  return (
    <div>
      <div className="h-[300px] relative w-full flex items-end gap-2 pb-4">
        {weeklySignups.map((day) => (
          <div
            key={day.label}
            className={`flex-1 rounded-t-sm transition-all cursor-pointer relative group ${
              day.highlight
                ? "bg-primary hover:bg-primary/80"
                : "bg-primary/20 hover:bg-primary/40"
            }`}
            style={{ height: `${day.heightPercent}%` }}
          >
            <div
              className={`absolute -top-10 left-1/2 -translate-x-1/2 bg-surface p-2 rounded shadow-lg text-label-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap ${
                day.highlight ? "font-bold" : ""
              }`}
            >
              {day.day}: {day.value}
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between text-label-sm text-on-surface-variant pt-4 border-t border-outline-variant/10 mt-2">
        {weeklySignups.map((day) => (
          <span
            key={day.label}
            className={day.highlight ? "text-primary font-bold" : ""}
          >
            {day.label}
          </span>
        ))}
      </div>
    </div>
  );
}
