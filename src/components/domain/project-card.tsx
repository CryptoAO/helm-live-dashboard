"use client";
import type { ProjectInfo, DashboardMonitoring } from "@/lib/data/types";
import { Badge } from "../shared/badge";
import { AgentAvatar } from "../shared/agent-avatar";
import { ProgressBar } from "../shared/progress-bar";
import { MilestoneTracker } from "./milestone-tracker";

interface ProjectCardProps {
  project: ProjectInfo;
  onClick?: () => void;
  dashboardMonitoring?: DashboardMonitoring;
}

const statusVariant: Record<string, "green" | "amber" | "blue" | "gray" | "red" | "orange"> = {
  ACTIVE: "green",
  BUILDING: "blue",
  APPROVED: "amber",
  SHIPPED: "green",
  UNKNOWN: "gray",
  PAUSED: "orange",
};

export function ProjectCard({ project, onClick, dashboardMonitoring }: ProjectCardProps) {
  const isSystem = project.slug === "SYSTEM";
  const mon = isSystem ? dashboardMonitoring : undefined;

  // Collect unique agents from domains
  const agents = new Set<string>();
  if (isSystem && mon) {
    // Show monitoring agents for SYSTEM
    mon.monitoringAgents.forEach(a => agents.add(a.agentId));
  } else {
    for (const domain of project.domains) {
      if (domain.leadAgent) agents.add(domain.leadAgent);
      for (const sa of domain.supportingAgents) {
        if (sa) agents.add(sa);
      }
    }
  }
  const agentList = Array.from(agents).slice(0, 4);

  return (
    <div
      className="rounded-lg border border-card-border bg-card-bg/80 p-4 hover:border-slate-600 transition-colors cursor-pointer"
      onClick={onClick}
    >
      {/* Staleness alert — surfaces when project is approaching deadline with no progress */}
      {project.isStale && (
        <div className="mb-3 rounded-lg bg-red-500/10 border border-red-500/30 p-2">
          <div className="flex items-center gap-2 text-[10px]">
            <span className="text-red-400 font-bold">STALE</span>
            {project.daysToDeadline !== undefined && (
              <Badge variant="red">{project.daysToDeadline <= 0 ? "OVERDUE" : `${project.daysToDeadline}d left`}</Badge>
            )}
          </div>
          <div className="text-[9px] text-red-300/70 mt-1">{project.staleReason}</div>
        </div>
      )}

      {/* Process Phase Banner */}
      {project.processPhase && !project.isStale && (
        <div className="mb-3 rounded-lg bg-blue-500/10 border border-blue-500/30 p-2">
          <div className="flex items-center gap-2 text-[10px]">
            <span className="text-blue-400 font-bold">{project.processPhase}</span>
            {project.processGate && (
              <span className="text-blue-300/60">{project.processGate}</span>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Badge variant={statusVariant[project.status] || "gray"}>{project.status}</Badge>
            <Badge variant="gray">{project.priority}</Badge>
            {mon && <Badge variant="blue">v{mon.version}</Badge>}
            {project.hasAppDirectory && (
              <span className="text-[9px] px-1.5 py-0 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">HAS CODE</span>
            )}
            {project.daysToDeadline !== undefined && project.daysToDeadline <= 14 && !project.isStale && (
              <Badge variant="amber">{project.daysToDeadline}d to deadline</Badge>
            )}
          </div>
          <h3 className="text-sm font-semibold text-slate-200 truncate">{project.name}</h3>
          {project.role && (
            <div className="text-[10px] text-slate-500 mt-0.5">{project.role}</div>
          )}
        </div>
        {/* Agent avatars */}
        {agentList.length > 0 && (
          <div className="flex -space-x-1.5">
            {agentList.map(agentId => (
              <AgentAvatar key={agentId} agentId={agentId} size="sm" />
            ))}
          </div>
        )}
      </div>

      {/* Description */}
      {project.description && (
        <p className="text-[10px] text-slate-500 mb-3 line-clamp-2">{project.description}</p>
      )}

      {/* SYSTEM monitoring stats */}
      {mon && (
        <div className="flex items-center gap-3 text-[10px] text-slate-500 mb-3 flex-wrap">
          <span><span className="text-amber-400 font-medium">{mon.backlogCount}</span> backlog</span>
          <span><span className="text-emerald-400 font-medium">{mon.doneCount}</span> done</span>
          <span><span className="text-blue-400 font-medium">{mon.reviews.length}</span> reviews</span>
          <span><span className="text-purple-400 font-medium">{mon.activeProposalCount + mon.completedProposalCount}</span> proposals</span>
          {mon.lastReviewDate && (
            <span className="text-slate-600">Last: <span className="font-mono text-slate-500">{mon.lastReviewDate}</span></span>
          )}
        </div>
      )}

      {/* Regular stats row */}
      {!isSystem && (
        <div className="flex items-center gap-3 text-[10px] text-slate-500 mb-3 flex-wrap">
          {project.itemCount > 0 && (
            <span><span className="text-slate-400 font-medium">{project.itemCount}</span> flywheel</span>
          )}
          {project.taskboardTasks.length > 0 && (
            <span><span className="text-purple-400 font-medium">{project.taskboardTasks.length}</span> tasks</span>
          )}
          {project.linkedIdeaIds.length > 0 && (
            <span><span className="text-blue-400 font-medium">{project.linkedIdeaIds.length}</span> idea{project.linkedIdeaIds.length !== 1 ? "s" : ""}</span>
          )}
          {project.domains.length > 0 && (
            <span><span className="text-amber-400 font-medium">{project.domains.length}</span> domain{project.domains.length !== 1 ? "s" : ""}</span>
          )}
        </div>
      )}

      {/* Progress bar */}
      {project.totalTasks > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-[10px] mb-1">
            <span className="text-slate-500">Progress</span>
            <span className="text-slate-400 font-mono">{project.completedTasks}/{project.totalTasks} ({project.progressPct}%)</span>
          </div>
          <ProgressBar value={project.progressPct} color={project.progressPct >= 80 ? "bg-emerald-500" : project.progressPct >= 40 ? "bg-blue-500" : "bg-amber-500"} />
        </div>
      )}

      {/* Milestones */}
      {project.milestones.length > 0 && (
        <div className="border-t border-slate-800 pt-2 mt-2">
          <MilestoneTracker milestones={project.milestones} />
        </div>
      )}
    </div>
  );
}
