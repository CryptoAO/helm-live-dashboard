"use client";
import type { TaskboardTask } from "@/lib/data/types";
import { AgentAvatar } from "../shared/agent-avatar";
import { Badge } from "../shared/badge";

interface TaskboardPanelProps {
  tasks: TaskboardTask[];
}

const priorityBadge: Record<string, { variant: "red" | "amber" | "blue" | "gray"; label: string }> = {
  HIGH: { variant: "red", label: "HIGH" },
  P0: { variant: "red", label: "P0" },
  P1: { variant: "amber", label: "P1" },
  P2: { variant: "blue", label: "P2" },
  MEDIUM: { variant: "amber", label: "MED" },
  LOW: { variant: "gray", label: "LOW" },
};

export function TaskboardPanel({ tasks }: TaskboardPanelProps) {
  const pending = tasks.filter(t => t.status === "PENDING" || t.status === "APPROVAL_PENDING");
  const done = tasks.filter(t => t.status === "DONE");

  if (tasks.length === 0) {
    return (
      <div className="text-xs text-slate-600 py-4 text-center">No taskboard items</div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Pending tasks */}
      {pending.length > 0 && (
        <div className="space-y-2">
          {pending.map((task) => {
            const badge = priorityBadge[task.priority] || { variant: "gray" as const, label: task.priority };
            return (
              <div key={task.id} className="flex items-start gap-2 p-2 rounded-lg bg-slate-800/40 border border-slate-700/50 hover:border-slate-600/60 transition-colors">
                <AgentAvatar agentId={task.agentId} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-mono text-slate-500">{task.id}</span>
                    <Badge variant={badge.variant}>{badge.label}</Badge>
                    {task.status === "APPROVAL_PENDING" && (
                      <Badge variant="amber" pulse>NEEDS APPROVAL</Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5 line-clamp-2">{task.description}</p>
                  {task.deadline && (
                    <span className="text-[9px] text-slate-500 font-mono mt-0.5 block">Due: {task.deadline}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Done count */}
      {done.length > 0 && (
        <div className="text-[10px] text-slate-600 text-center border-t border-slate-800 pt-2">
          {done.length} task{done.length !== 1 ? "s" : ""} completed
        </div>
      )}
    </div>
  );
}
