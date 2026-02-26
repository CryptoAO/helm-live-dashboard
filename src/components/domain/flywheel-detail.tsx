"use client";
import type { FlywheelItem } from "@/lib/data/types";
import { Badge } from "../shared/badge";
import { AgentAvatar } from "../shared/agent-avatar";

interface FlywheelDetailProps {
  item: FlywheelItem;
}

const priorityColors: Record<string, string> = {
  P0: "text-red-400",
  P1: "text-amber-400",
  P2: "text-blue-400",
  P3: "text-slate-400",
  P4: "text-slate-500",
};

export function FlywheelDetail({ item }: FlywheelDetailProps) {
  const leadId = item.leadAgent.toLowerCase();

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-center gap-3 flex-wrap">
        <Badge variant="blue">{item.id}</Badge>
        <Badge variant={item.isStuck ? "amber" : "green"}>
          Stage {item.stage} — {item.stageName}
        </Badge>
        <span className={`text-xs font-bold ${priorityColors[item.priority] || "text-slate-400"}`}>
          {item.priority}
        </span>
        <Badge variant="gray">{item.project}</Badge>
        {item.isStuck && <Badge variant="red" pulse>STUCK</Badge>}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <span className="text-slate-500">Lead Agent</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <AgentAvatar agentId={leadId} size="sm" />
            <span className="text-slate-300">{item.leadAgent}</span>
          </div>
        </div>
        <div>
          <span className="text-slate-500">Assigned</span>
          <div className="text-slate-300 mt-0.5">{item.assignedAgents || "—"}</div>
        </div>
        <div>
          <span className="text-slate-500">Deadline</span>
          <div className={`mt-0.5 font-mono ${item.daysUntilDeadline !== null && item.daysUntilDeadline <= 3 ? "text-red-400" : "text-slate-300"}`}>
            {item.deadline || "None"}
            {item.daysUntilDeadline !== null && (
              <span className="text-slate-500 ml-1">({item.daysUntilDeadline}d)</span>
            )}
          </div>
        </div>
        <div>
          <span className="text-slate-500">Staleness</span>
          <div className={`mt-0.5 font-mono ${item.stalenessHours !== null && item.stalenessHours > 24 ? "text-amber-400" : "text-slate-300"}`}>
            {item.stalenessHours !== null ? `${item.stalenessHours}h since last advance` : "—"}
          </div>
        </div>
        <div>
          <span className="text-slate-500">Created</span>
          <div className="text-slate-400 mt-0.5 font-mono">{item.created || "—"}</div>
        </div>
        <div>
          <span className="text-slate-500">Last Advanced</span>
          <div className="text-slate-400 mt-0.5 font-mono">{item.lastAdvanced || "—"}</div>
        </div>
      </div>

      {/* Status Notes */}
      {item.allStatusNotes.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-slate-400 mb-2">Status Notes</h4>
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {item.allStatusNotes.map((note, i) => (
              <div key={i} className="text-xs text-slate-300 border-l-2 border-slate-700 pl-3 py-0.5">
                {note}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stage Progress Bar */}
      <div>
        <h4 className="text-xs font-bold text-slate-400 mb-2">Stage Progress</h4>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5, 6].map((s) => (
            <div
              key={s}
              className={`flex-1 h-2 rounded-full transition-colors ${
                s < item.stage
                  ? "bg-emerald-500/60"
                  : s === item.stage
                  ? "bg-blue-500 stage-glow-anim"
                  : "bg-slate-700/50"
              }`}
            />
          ))}
        </div>
        <div className="flex justify-between mt-1 text-[8px] text-slate-600">
          <span>Ideate</span>
          <span>Refine</span>
          <span>Build</span>
          <span>Ship</span>
          <span>Validate</span>
          <span>Learn</span>
        </div>
      </div>
    </div>
  );
}
