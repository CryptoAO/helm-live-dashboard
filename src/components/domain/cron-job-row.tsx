"use client";
import type { CronJob } from "@/lib/data/types";
import { AgentAvatar } from "../shared/agent-avatar";
import { Badge } from "../shared/badge";

interface CronJobRowProps {
  job: CronJob;
  onToggle?: (jobId: string, enabled: boolean) => void;
  onTrigger?: (jobId: string) => void;
  showActions?: boolean;
}

function formatNextRun(nextRunAt: string | null): string {
  if (!nextRunAt) return "—";
  const ts = parseInt(nextRunAt);
  if (isNaN(ts)) return nextRunAt;
  const d = new Date(ts);
  return d.toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Manila" });
}

export function CronJobRow({ job, onToggle, onTrigger, showActions = false }: CronJobRowProps) {
  return (
    <div className={`flex items-center gap-3 py-2 px-2 rounded hover:bg-slate-800/30 ${!job.enabled ? "opacity-40" : ""}`}>
      <AgentAvatar agentId={job.agentId} size="sm" />
      <div className="flex-1 min-w-0">
        <div className="text-xs text-slate-300 truncate">{job.name}</div>
        <div className="text-[10px] text-slate-600 font-mono">{job.schedule}</div>
      </div>
      <div className="flex items-center gap-2">
        {job.lastStatus && (
          <Badge variant={job.lastStatus === "ok" ? "green" : "red"}>
            {job.lastStatus}
          </Badge>
        )}
        {job.consecutiveErrors > 0 && (
          <Badge variant="red">{job.consecutiveErrors} err</Badge>
        )}
        <span className="text-[10px] text-slate-500 font-mono w-12 text-right">{formatNextRun(job.nextRunAt)}</span>
        {showActions && (
          <>
            <button
              onClick={() => onToggle?.(job.jobId, !job.enabled)}
              className={`text-[9px] px-1.5 py-0.5 rounded ${job.enabled ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-600/20 text-slate-500"}`}
            >
              {job.enabled ? "ON" : "OFF"}
            </button>
            <button
              onClick={() => onTrigger?.(job.jobId)}
              className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
            >
              Run
            </button>
          </>
        )}
      </div>
    </div>
  );
}
