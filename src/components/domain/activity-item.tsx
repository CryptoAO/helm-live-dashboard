"use client";
import type { ActivityEntry } from "@/lib/data/types";
import { AgentAvatar } from "../shared/agent-avatar";

interface ActivityItemProps {
  entry: ActivityEntry;
}

export function ActivityItem({ entry }: ActivityItemProps) {
  return (
    <div className="flex items-start gap-2 py-1.5 war-room-bubble">
      <AgentAvatar agentId={entry.agentId} size="sm" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-slate-600">{entry.time}</span>
          <span className="text-[10px] font-medium text-slate-400">{entry.agent}</span>
        </div>
        <div className="text-xs text-slate-300 truncate">{entry.action}</div>
      </div>
    </div>
  );
}
