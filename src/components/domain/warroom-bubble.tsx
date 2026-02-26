"use client";
import type { WarRoomEntry } from "@/lib/data/types";
import { AgentAvatar } from "../shared/agent-avatar";

interface WarRoomBubbleProps {
  entry: WarRoomEntry;
  isLive?: boolean;
}

const catClass: Record<string, string> = {
  INTEL: "war-cat-intel",
  CREWING: "war-cat-crewing",
  LEGAL: "war-cat-legal",
  FLYWHEEL: "war-cat-flywheel",
  HEALTH: "war-cat-health",
  INCOME: "war-cat-income",
  COMMS: "war-cat-comms",
  STRATEGY: "war-cat-strategy",
};

export function WarRoomBubble({ entry, isLive }: WarRoomBubbleProps) {
  return (
    <div className={`flex items-start gap-3 py-2.5 px-3 rounded-lg hover:bg-slate-800/30 war-room-bubble ${isLive ? "border-l-2 border-emerald-500/50" : ""}`}>
      <div className="relative">
        <AgentAvatar agentId={entry.agentId} size="md" />
        {isLive && (
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse border border-slate-900" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold text-slate-300">{entry.agentName}</span>
          {isLive && (
            <span className="text-[9px] px-1.5 py-0 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">LIVE</span>
          )}
          <span className={`inline-block px-1.5 py-0 text-[9px] font-bold rounded border ${catClass[entry.category] || "war-cat-strategy"}`}>
            {entry.category}
          </span>
          <span className="text-[10px] text-slate-600 font-mono">{entry.timestamp}</span>
          {entry.durationMs > 0 && (
            <span className="text-[9px] text-slate-700">{(entry.durationMs / 1000).toFixed(1)}s</span>
          )}
        </div>
        <div className="text-xs text-slate-400 leading-relaxed">{entry.summary}</div>
      </div>
    </div>
  );
}
