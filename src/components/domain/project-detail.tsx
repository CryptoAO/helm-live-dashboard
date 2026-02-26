"use client";
import type { ProjectInfo, FlywheelItem, TaskboardTask, IncomePipelineIdea, DashboardMonitoring } from "@/lib/data/types";
import { Badge } from "../shared/badge";
import { AgentAvatar } from "../shared/agent-avatar";
import { ProgressBar } from "../shared/progress-bar";
import { MilestoneTracker } from "./milestone-tracker";
import { CodeProposalsPanel } from "./code-proposals-panel";

interface ProjectDetailProps {
  project: ProjectInfo;
  flywheelItems: FlywheelItem[];
  taskboard: TaskboardTask[];
  ideas: IncomePipelineIdea[];
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

export function ProjectDetail({ project, flywheelItems, taskboard, ideas, dashboardMonitoring }: ProjectDetailProps) {
  const isSystem = project.slug === "SYSTEM";
  const mon = isSystem ? dashboardMonitoring : undefined;

  // Get linked flywheel items
  const linkedFw = flywheelItems.filter(fw => project.flywheelItems.includes(fw.id));
  // Get linked taskboard tasks
  const linkedTasks = taskboard.filter(t => project.taskboardTasks.includes(t.id));
  // Get linked pipeline ideas
  const linkedIdeas = ideas.filter(i => project.linkedIdeaIds.includes(i.id));

  return (
    <div className="space-y-5">
      {/* Header badges */}
      <div className="flex items-center gap-3 flex-wrap">
        <Badge variant={statusVariant[project.status] || "gray"}>{project.status}</Badge>
        <Badge variant="gray">{project.priority}</Badge>
        {mon && <Badge variant="blue">v{mon.version}</Badge>}
        {project.hasAppDirectory && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">HAS CODE</span>
        )}
        {project.role && <Badge variant="blue">{project.role}</Badge>}
      </div>

      {/* Description */}
      {project.description && (
        <p className="text-xs text-slate-400 leading-relaxed">{project.description}</p>
      )}

      {/* === SYSTEM Project: Dashboard Monitoring Section === */}
      {mon && (
        <>
          {/* Monitoring Agents */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 mb-2">Monitoring Agents</h4>
            <div className="space-y-2">
              {mon.monitoringAgents.map(agent => (
                <div key={agent.agentId} className="flex items-start gap-3 py-2 px-3 rounded-lg bg-slate-800/30">
                  <AgentAvatar agentId={agent.agentId} size="sm" showName />
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] text-slate-400">{agent.role}</div>
                    <div className="text-[10px] text-slate-600 font-mono mt-0.5">
                      Cron: {agent.cronJob} &middot; {agent.schedule}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {mon.lastReviewDate && (
              <div className="mt-2 text-[10px] text-slate-600">
                Last review: <span className="text-slate-400 font-mono">{mon.lastReviewDate}</span>
                {" "}&middot; Next: <span className="text-slate-400 font-mono">{mon.nextReviewTime}</span>
              </div>
            )}
            <div className="mt-1 text-[10px] text-emerald-500/70">
              COMPASS proposes and implements code improvements with HELM approval. Daily: propose at 14:00, execute at 15:00 PHT.
            </div>
          </div>

          {/* Code Proposals */}
          {mon.codeProposals && (
            <div>
              <h4 className="text-xs font-bold text-slate-400 mb-1">
                Code Proposals
                <span className="ml-2 text-[10px] font-normal text-slate-600">
                  {mon.activeProposalCount} active &middot; {mon.completedProposalCount} completed
                </span>
              </h4>
              <CodeProposalsPanel proposals={mon.codeProposals} />
            </div>
          )}

          {/* Improvement Backlog */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 mb-1">
              Improvement Backlog
              <span className="ml-2 text-[10px] font-normal text-slate-600">
                {mon.backlogCount} pending &middot; {mon.doneCount} done &middot; {mon.feedbackCount} feedback
              </span>
            </h4>
            <div className="space-y-1">
              {mon.improvements.map(item => (
                <div key={item.id} className={`flex items-center gap-2 py-1.5 px-3 rounded-lg text-xs ${
                  item.status === "DONE" ? "bg-emerald-500/5 border border-emerald-500/10" :
                  item.status === "IN_PROGRESS" ? "bg-blue-500/5 border border-blue-500/10" :
                  "bg-slate-800/30"
                }`}>
                  <span className="text-slate-600 font-mono text-[10px] w-5 shrink-0">#{item.id}</span>
                  {item.status === "DONE" ? (
                    <span className="text-emerald-500 text-[10px] shrink-0">&#x2713;</span>
                  ) : item.status === "IN_PROGRESS" ? (
                    <span className="text-blue-400 text-[10px] animate-pulse shrink-0">&#9679;</span>
                  ) : (
                    <span className="text-slate-700 text-[10px] shrink-0">&#9675;</span>
                  )}
                  <span className={`flex-1 truncate ${
                    item.status === "DONE" ? "text-slate-500 line-through" : "text-slate-300"
                  }`}>{item.idea}</span>
                  {item.priority !== "—" && (
                    <Badge variant={
                      item.priority === "P1" ? "red" :
                      item.priority === "P2" ? "amber" :
                      item.priority === "P3" ? "blue" : "gray"
                    }>{item.priority}</Badge>
                  )}
                  <Badge variant={
                    item.status === "DONE" ? "green" :
                    item.status === "IN_PROGRESS" ? "blue" : "gray"
                  }>{item.status}</Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Review History */}
          {mon.reviews.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-400 mb-2">Review History</h4>
              <div className="space-y-3">
                {mon.reviews.map((review, i) => (
                  <div key={i} className="rounded-lg border border-slate-800 p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-mono text-slate-400">{review.date}</span>
                      <span className="text-[10px] text-slate-500">&mdash; {review.reviewer}</span>
                      <Badge variant={review.status === "DONE" ? "green" : "gray"}>{review.status}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div>
                        <span className="text-slate-600">Data Freshness:</span>{" "}
                        <span className="text-slate-400">{review.dataFreshness.substring(0, 60)}{review.dataFreshness.length > 60 ? "..." : ""}</span>
                      </div>
                      <div>
                        <span className="text-slate-600">Layout Score:</span>{" "}
                        <span className="text-slate-400">{review.layoutScore}</span>
                      </div>
                    </div>
                    {review.priorityFix !== "None" && (
                      <div className="text-[10px] mt-1">
                        <span className="text-red-400/70">Priority Fix:</span>{" "}
                        <span className="text-slate-400">{review.priorityFix}</span>
                      </div>
                    )}
                    {review.ideas.length > 0 && (
                      <div className="mt-1.5 space-y-0.5">
                        {review.ideas.map((idea, j) => (
                          <div key={j} className="text-[10px] text-slate-500 pl-3 border-l border-slate-800">
                            {idea}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Progress */}
      {project.totalTasks > 0 && (
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-500 font-medium">Overall Progress</span>
            <span className="text-slate-300 font-mono">{project.completedTasks}/{project.totalTasks} tasks ({project.progressPct}%)</span>
          </div>
          <ProgressBar value={project.progressPct} color={project.progressPct >= 80 ? "bg-emerald-500" : project.progressPct >= 40 ? "bg-blue-500" : "bg-amber-500"} />
        </div>
      )}

      {/* Milestones */}
      {project.milestones.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-slate-400 mb-2">Milestones</h4>
          <MilestoneTracker milestones={project.milestones} />
        </div>
      )}

      {/* Domains Table */}
      {project.domains.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-slate-400 mb-2">Domains</h4>
          <div className="space-y-1.5">
            {project.domains.map((domain, i) => (
              <div key={i} className="flex items-center gap-3 py-1.5 px-3 rounded-lg bg-slate-800/30 text-xs">
                <span className="text-slate-300 font-medium flex-1">{domain.domain}</span>
                <Badge variant={domain.priority === "HIGH" ? "red" : domain.priority === "MEDIUM" ? "amber" : "gray"}>
                  {domain.priority}
                </Badge>
                {domain.leadAgent && <AgentAvatar agentId={domain.leadAgent} size="sm" showName />}
                {domain.supportingAgents.length > 0 && (
                  <div className="flex -space-x-1">
                    {domain.supportingAgents.filter(Boolean).map(a => (
                      <AgentAvatar key={a} agentId={a} size="sm" />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Linked Pipeline Ideas */}
      {linkedIdeas.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-slate-400 mb-2">Linked Pipeline Ideas</h4>
          <div className="space-y-1.5">
            {linkedIdeas.map(idea => (
              <div key={idea.id} className="flex items-center gap-3 py-1.5 px-3 rounded-lg bg-slate-800/30 text-xs">
                <span className="text-blue-400 font-mono text-[10px]">{idea.id}</span>
                <span className="text-slate-300 flex-1 truncate">{idea.title}</span>
                <Badge variant={idea.status === "GO" ? "green" : idea.status === "MERGED" ? "blue" : "gray"}>{idea.status}</Badge>
                {idea.responsibleAgent && <AgentAvatar agentId={idea.responsibleAgent} size="sm" />}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Flywheel Items */}
      {linkedFw.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-slate-400 mb-2">Flywheel Items</h4>
          <div className="space-y-1.5">
            {linkedFw.map(fw => (
              <div key={fw.id} className="flex items-center gap-3 py-1.5 px-3 rounded-lg bg-slate-800/30 text-xs">
                <span className="text-amber-400 font-mono text-[10px]">{fw.id}</span>
                <span className="text-slate-300 flex-1 truncate">{fw.title}</span>
                <Badge variant={fw.isStuck ? "red" : fw.stage >= 4 ? "green" : "amber"}>
                  Stage {fw.stage}
                </Badge>
                {fw.leadAgent && <AgentAvatar agentId={fw.leadAgent.toLowerCase()} size="sm" />}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Taskboard Tasks */}
      {linkedTasks.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-slate-400 mb-2">Taskboard Tasks</h4>
          <div className="space-y-1.5">
            {linkedTasks.map(task => (
              <div key={task.id} className="flex items-center gap-3 py-1.5 px-3 rounded-lg bg-slate-800/30 text-xs">
                <span className="text-purple-400 font-mono text-[10px]">{task.id}</span>
                <span className="text-slate-300 flex-1 truncate">{task.description}</span>
                <Badge variant={task.status === "DONE" ? "green" : task.status === "APPROVAL_PENDING" ? "amber" : "gray"}>
                  {task.status}
                </Badge>
                <AgentAvatar agentId={task.agentId} size="sm" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty states (only for non-SYSTEM projects) */}
      {!isSystem && linkedFw.length === 0 && linkedTasks.length === 0 && linkedIdeas.length === 0 && project.domains.length === 0 && (
        <div className="text-center text-sm text-slate-600 py-6">
          No linked items yet. Tasks, flywheel items, and pipeline ideas will appear here as they get connected.
        </div>
      )}
    </div>
  );
}
