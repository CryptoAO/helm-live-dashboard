"use client";
import type { ProjectMilestone } from "@/lib/data/types";

interface MilestoneTrackerProps {
  milestones: ProjectMilestone[];
}

const statusColor: Record<string, { dot: string; line: string; text: string }> = {
  completed: { dot: "bg-emerald-500", line: "bg-emerald-500/40", text: "text-emerald-400" },
  in_progress: { dot: "bg-blue-500 animate-pulse", line: "bg-blue-500/40", text: "text-blue-400" },
  pending: { dot: "bg-slate-600", line: "bg-slate-700", text: "text-slate-500" },
  overdue: { dot: "bg-red-500 animate-pulse", line: "bg-red-500/40", text: "text-red-400" },
};

export function MilestoneTracker({ milestones }: MilestoneTrackerProps) {
  if (milestones.length === 0) {
    return <div className="text-[10px] text-slate-700 italic">No milestones set</div>;
  }

  return (
    <div className="flex items-center gap-0 overflow-x-auto">
      {milestones.map((ms, i) => {
        const colors = statusColor[ms.status] || statusColor.pending;
        return (
          <div key={i} className="flex items-center shrink-0">
            {/* Milestone dot + label */}
            <div className="flex flex-col items-center gap-1">
              <div className={`w-3 h-3 rounded-full border-2 border-slate-900 ${colors.dot}`} />
              <div className="text-center max-w-[100px]">
                <div className={`text-[9px] font-medium truncate ${colors.text}`}>{ms.name}</div>
                {ms.deadline && (
                  <div className="text-[8px] text-slate-600 font-mono">{ms.deadline}</div>
                )}
              </div>
            </div>
            {/* Connecting line */}
            {i < milestones.length - 1 && (
              <div className={`h-0.5 w-8 mx-1 mt-[-18px] ${colors.line}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
