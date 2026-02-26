"use client";

interface ProgressBarProps {
  value: number; // 0-100
  color?: string;
  height?: string;
  showLabel?: boolean;
  className?: string;
}

export function ProgressBar({ value, color = "bg-blue-500", height = "h-2", showLabel = false, className = "" }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className={`w-full ${className}`}>
      <div className={`${height} rounded-full bg-slate-700/50 overflow-hidden`}>
        <div
          className={`${height} rounded-full ${color} transition-all duration-500 flywheel-bar`}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && <span className="text-[10px] text-slate-500 mt-0.5">{clamped}%</span>}
    </div>
  );
}
