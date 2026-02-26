"use client";

interface MetricBoxProps {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
  icon?: string;
}

export function MetricBox({ label, value, sub, color = "text-slate-200", icon }: MetricBoxProps) {
  return (
    <div className="flex flex-col items-center text-center px-2 py-3">
      {icon && <span className="text-lg mb-1">{icon}</span>}
      <span className={`text-2xl font-bold font-mono ${color}`}>{value}</span>
      <span className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">{label}</span>
      {sub && <span className="text-[10px] text-slate-600 mt-0.5">{sub}</span>}
    </div>
  );
}
