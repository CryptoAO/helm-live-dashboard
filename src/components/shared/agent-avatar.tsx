"use client";
import { AGENT_COLORS, AGENT_NAMES } from "@/lib/data/types";

interface AgentAvatarProps {
  agentId: string;
  size?: "sm" | "md" | "lg";
  showName?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "w-5 h-5 text-[9px]",
  md: "w-7 h-7 text-[11px]",
  lg: "w-9 h-9 text-sm",
};

export function AgentAvatar({ agentId, size = "md", showName = false, className = "" }: AgentAvatarProps) {
  const colors = AGENT_COLORS[agentId] || AGENT_COLORS.main;
  const name = AGENT_NAMES[agentId] || agentId.toUpperCase();

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <div className={`agent-avatar ${sizeClasses[size]} rounded-full ${colors.bg} border ${colors.border} flex items-center justify-center font-bold ${colors.text}`}>
        {colors.letter}
      </div>
      {showName && <span className={`text-xs font-medium ${colors.text}`}>{name}</span>}
    </div>
  );
}
