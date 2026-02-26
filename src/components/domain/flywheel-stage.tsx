"use client";

interface FlywheelStageProps {
  number: number;
  name: string;
  count: number;
  isActive: boolean;
  onClick?: () => void;
}

export function FlywheelStage({ number, name, count, isActive, onClick }: FlywheelStageProps) {
  return (
    <div
      className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${
        isActive
          ? "bg-blue-500/15 border border-blue-500/30 cursor-pointer hover:bg-blue-500/25 hover:border-blue-400/40"
          : "bg-slate-800/30"
      }`}
      onClick={isActive ? onClick : undefined}
      role={isActive ? "button" : undefined}
      tabIndex={isActive ? 0 : undefined}
    >
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isActive ? "bg-blue-500/30 text-blue-300 stage-glow-anim" : "bg-slate-700 text-slate-500"}`}>
        S{number}
      </div>
      <span className={`text-[10px] font-medium ${isActive ? "text-blue-300" : "text-slate-500"}`}>
        {name}
      </span>
      {count > 0 && (
        <span className={`text-[9px] font-mono ${isActive ? "text-blue-400" : "text-slate-600"}`}>
          {count} {count === 1 ? "item" : "items"}
        </span>
      )}
    </div>
  );
}
