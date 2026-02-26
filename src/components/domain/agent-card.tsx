"use client";
import type { AgentInfo } from "@/lib/data/types";
import { AgentAvatar } from "../shared/agent-avatar";
import { StatusDot } from "../shared/status-dot";
import { Badge } from "../shared/badge";

interface AgentCardProps {
  agent: AgentInfo;
  onClick?: () => void;
  compact?: boolean;
}

const statusBadge: Record<string, { variant: "green" | "amber" | "red" | "blue" | "gray"; label: string }> = {
  active: { variant: "green", label: "ACTIVE" },
  recent: { variant: "blue", label: "RECENT" },
  overdue: { variant: "amber", label: "OVERDUE" },
  idle: { variant: "gray", label: "IDLE" },
};

export function AgentCard({ agent, onClick, compact = false }: AgentCardProps) {
  const s = statusBadge[agent.activityStatus] || statusBadge.idle;

  if (compact) {
    return (
      <div className="flex items-center gap-2 py-1 cursor-pointer hover:bg-slate-800/30 px-2 rounded" onClick={onClick}>
        <AgentAvatar agentId={agent.id} size="sm" />
        <span className="text-xs text-slate-300 font-medium">{agent.name}</span>
        <StatusDot status={agent.activityStatus} size="sm" />
      </div>
    );
  }

  return (
    <div
      className="agent-card rounded-lg border border-card-border bg-card-bg/80 p-3 cursor-pointer hover:border-slate-600 transition-colors"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <AgentAvatar agentId={agent.id} size="md" />
          <div>
            <span className="text-sm font-bold text-slate-200">{agent.name}</span>
            <Badge variant={s.variant} className="ml-2">{s.label}</Badge>
          </div>
        </div>
        <StatusDot status={agent.activityStatus} />
      </div>
      <div className="text-[10px] text-slate-500 mb-1">{agent.cronJobCount} cron jobs</div>
      <div className="text-xs text-slate-400 truncate">
        <span className="text-slate-500">Last:</span> {agent.lastAction || "No recent activity"}
      </div>
      {agent.nextScheduledName && (
        <div className="text-[10px] text-slate-600 mt-1">
          <span className="text-slate-500">Next:</span> {agent.nextScheduledName}
        </div>
      )}
    </div>
  );
}
