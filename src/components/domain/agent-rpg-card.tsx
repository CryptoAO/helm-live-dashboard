"use client";
import type { AgentInfo } from "@/lib/data/types";
import { AGENT_RPG_PROFILES, getStatBarColor, getTierColor } from "@/lib/data/agent-profiles";
import { StatusDot } from "../shared/status-dot";
import { Badge } from "../shared/badge";

interface AgentRPGCardProps {
  agent: AgentInfo;
  onClick?: () => void;
}

const STAT_LABELS = ["INT", "STR", "DEF", "SPD", "CHA", "WIS"] as const;

export function AgentRPGCard({ agent, onClick }: AgentRPGCardProps) {
  const rpg = AGENT_RPG_PROFILES[agent.id];
  if (!rpg) return null;

  const xpPct = (rpg.xp % 100);
  const statusBadge: Record<string, { variant: "green" | "amber" | "red" | "blue" | "gray"; label: string }> = {
    active: { variant: "green", label: "ONLINE" },
    recent: { variant: "blue", label: "RECENT" },
    overdue: { variant: "amber", label: "OVERDUE" },
    idle: { variant: "gray", label: "IDLE" },
  };
  const s = statusBadge[agent.activityStatus] || statusBadge.idle;

  return (
    <div
      onClick={onClick}
      className="relative group cursor-pointer rounded-xl border border-slate-700/50 bg-slate-900/80 hover:border-slate-600 transition-all duration-300 overflow-hidden"
    >
      {/* Glow effect */}
      <div className={`absolute inset-0 bg-gradient-to-br ${rpg.avatar} opacity-[0.06] group-hover:opacity-[0.12] transition-opacity duration-300`} />

      <div className="relative p-4 space-y-3">
        {/* Header: emoji + name + tier + status */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${rpg.avatar} flex items-center justify-center text-2xl shadow-lg`}>
              {rpg.emoji}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">{rpg.callsign}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getTierColor(rpg.tier)}`}>
                  {rpg.tier}
                </span>
              </div>
              <div className="text-[11px] text-slate-400">{rpg.class}</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Badge variant={s.variant}>{s.label}</Badge>
            <StatusDot status={agent.activityStatus} size="sm" />
          </div>
        </div>

        {/* Persona + quote */}
        <div className="text-[10px] text-slate-500 italic truncate">&ldquo;{rpg.statusQuote}&rdquo;</div>

        {/* Level + XP bar */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-400">LVL {rpg.level}</span>
          <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${rpg.avatar} transition-all duration-500`}
              style={{ width: `${xpPct}%` }}
            />
          </div>
          <span className="text-[9px] text-slate-500">{rpg.xp} XP</span>
        </div>

        {/* Stat bars */}
        <div className="grid grid-cols-3 gap-x-3 gap-y-1">
          {STAT_LABELS.map(stat => {
            const val = rpg.stats[stat];
            return (
              <div key={stat} className="flex items-center gap-1.5">
                <span className="text-[9px] font-mono text-slate-500 w-6">{stat}</span>
                <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${getStatBarColor(val)}`} style={{ width: `${val}%` }} />
                </div>
                <span className="text-[9px] font-mono text-slate-500 w-4 text-right">{val}</span>
              </div>
            );
          })}
        </div>

        {/* Skills */}
        <div className="flex flex-wrap gap-1">
          {rpg.skills.map(skill => (
            <span key={skill} className="text-[9px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700/50">
              {skill}
            </span>
          ))}
        </div>

        {/* Footer: last action + crons */}
        <div className="flex items-center justify-between text-[10px] text-slate-600 pt-1 border-t border-slate-800/50">
          <span className="truncate max-w-[60%]">{agent.lastAction || "No recent activity"}</span>
          <span>{agent.cronJobCount} crons</span>
        </div>
      </div>
    </div>
  );
}
