"use client";

interface MiniChartProps {
  data: { label: string; value: number; color?: string }[];
  maxValue?: number;
  height?: number;
  type?: "bar" | "stacked";
  budgetLine?: number;
}

export function MiniChart({ data, maxValue, height = 120, type = "bar", budgetLine }: MiniChartProps) {
  const max = maxValue || Math.max(...data.map(d => d.value), 1);

  return (
    <div className="relative w-full" style={{ height }}>
      {budgetLine !== undefined && (
        <div
          className="absolute left-0 right-0 border-t border-dashed border-red-400/40 z-10"
          style={{ bottom: `${(budgetLine / max) * 100}%` }}
        >
          <span className="absolute right-0 -top-3 text-[8px] text-red-400/60">budget</span>
        </div>
      )}
      <div className="flex items-end justify-between gap-1 h-full">
        {data.map((d, i) => {
          const pct = Math.max(2, (d.value / max) * 100);
          const barColor = d.color || (d.value > (budgetLine || Infinity) ? "bg-red-400" : "bg-blue-400");
          return (
            <div key={i} className="flex flex-col items-center flex-1" style={{ height: "100%" }}>
              <div className="flex-1 w-full flex items-end justify-center">
                <div
                  className={`w-full max-w-[24px] rounded-t ${barColor} transition-all duration-300`}
                  style={{ height: `${pct}%` }}
                  title={`${d.label}: ${d.value.toFixed(2)}`}
                />
              </div>
              <span className="text-[8px] text-slate-600 mt-1 truncate w-full text-center">{d.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Heatmap variant for agent activity
interface HeatmapProps {
  rows: { label: string; cells: number[] }[];
  maxValue?: number;
}

export function Heatmap({ rows, maxValue }: HeatmapProps) {
  const max = maxValue || Math.max(...rows.flatMap(r => r.cells), 1);
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-0.5 ml-16">
        {Array.from({ length: 24 }, (_, i) => (
          <span key={i} className="text-[7px] text-slate-700 w-3 text-center">{i}</span>
        ))}
      </div>
      {rows.map((row) => (
        <div key={row.label} className="flex items-center gap-0.5">
          <span className="text-[9px] text-slate-500 w-16 text-right pr-2 truncate">{row.label}</span>
          {row.cells.map((val, i) => {
            const intensity = val / max;
            return (
              <div
                key={i}
                className="w-3 h-3 rounded-sm"
                style={{
                  backgroundColor: val === 0
                    ? "rgba(30, 41, 59, 0.5)"
                    : `rgba(59, 130, 246, ${0.15 + intensity * 0.7})`,
                }}
                title={`${row.label} ${i}:00 — ${val} actions`}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
