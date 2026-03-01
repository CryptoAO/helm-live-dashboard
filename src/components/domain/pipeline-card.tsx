"use client";
import type { IncomePipelineIdea } from "@/lib/data/types";
import { AgentAvatar } from "../shared/agent-avatar";
import { Badge } from "../shared/badge";
import { ReviewDots } from "./review-dots";
import { REVIEW_STAGE_AGENT } from "@/lib/data/types";

interface PipelineCardProps {
  idea: IncomePipelineIdea;
  onAdvance?: (ideaId: string) => void;
  onBounce?: (ideaId: string) => void;
  onClick?: () => void;
  showActions?: boolean;
}

const statusVariant: Record<string, "green" | "amber" | "blue" | "gray" | "red" | "orange"> = {
  PROPOSED: "blue",
  REVIEW: "amber",
  IN_PROGRESS: "blue",
  SHIPPED: "green",
  APPROVED: "green",
  GO: "green",
  MERGED: "blue",
  PLANNING: "amber",
  REJECTED: "red",
  DEFERRED: "gray",
  PARKED: "orange",
  DEPRIORITIZED: "gray",
  KILLED: "red",
  NEW: "amber",
};

const effortColor: Record<string, string> = {
  LOW: "text-emerald-400",
  MEDIUM: "text-amber-400",
  HIGH: "text-red-400",
  "MEDIUM-HIGH": "text-orange-400",
  "LOW-MEDIUM": "text-yellow-400",
};

export function PipelineCard({ idea, onAdvance, onBounce, onClick, showActions = false }: PipelineCardProps) {
  // Determine which agent to show — use responsibleAgent (enriched in data layer) with fallback to review stage holder
  const displayAgent = idea.responsibleAgent || (idea.currentHolder ? REVIEW_STAGE_AGENT[idea.reviewStageName || ""] || idea.currentHolder.toLowerCase() : null);
  const latestReview = idea.reviewHistory.length > 0 ? idea.reviewHistory[0] : null;

  return (
    <div
      className="rounded-lg border border-card-border bg-card-bg/80 p-3 hover:border-slate-600 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-mono text-blue-400">{idea.id}</span>
            <Badge variant={statusVariant[idea.status] || "gray"}>{idea.status}</Badge>
          </div>
          <h4 className="text-sm font-semibold text-slate-200 truncate">{idea.title}</h4>
        </div>
        {displayAgent && <AgentAvatar agentId={displayAgent} size="sm" showName />}
      </div>

      {/* Info row — show what's available */}
      <div className="flex items-center gap-2 text-[10px] text-slate-500 mb-2 flex-wrap">
        {idea.potential && <span>{idea.potential}</span>}
        {idea.potential && idea.effort && <span className="text-slate-700">|</span>}
        {idea.effort && <span className={effortColor[idea.effort] || "text-slate-400"}>{idea.effort} effort</span>}
        {idea.timeToFirst && <><span className="text-slate-700">|</span><span>{idea.timeToFirst}</span></>}
        {idea.market && <><span className="text-slate-700">|</span><span className="text-slate-400">{idea.market}</span></>}
      </div>

      {/* Deadline */}
      {idea.deadline && (
        <div className="text-[10px] text-slate-500 mb-2">
          <span className="text-slate-600">Deadline:</span> <span className="font-mono text-amber-400">{idea.deadline}</span>
        </div>
      )}

      {/* Merged into indicator */}
      {idea.status === "MERGED" && idea.mergedInto && (
        <div className="text-[10px] text-blue-400/70 mb-2">
          Merged into <span className="font-mono">{idea.mergedInto}</span>
        </div>
      )}
      {idea.status === "MERGED" && !idea.mergedInto && (
        <div className="text-[10px] text-blue-400/70 mb-2">Merged</div>
      )}

      {/* Linked tasks indicator */}
      {idea.taskboardTasks && idea.taskboardTasks.length > 0 && (
        <div className="text-[10px] text-purple-400/70 mb-2">
          <span className="font-mono">{idea.taskboardTasks.length}</span> task{idea.taskboardTasks.length !== 1 ? "s" : ""} linked
        </div>
      )}

      {/* Next step */}
      {idea.nextStep && (
        <div className="text-[10px] text-slate-500 mb-2 truncate">
          <span className="text-slate-600">Next:</span> {idea.nextStep}
        </div>
      )}

      {idea.reviewStage && (
        <div className="mb-2">
          <ReviewDots currentStage={idea.reviewStage} stageName={idea.reviewStageName} size="sm" />
        </div>
      )}

      {latestReview && (
        <div className="text-[10px] text-slate-500 truncate border-t border-slate-800 pt-1.5 mt-1.5">
          <span className="font-medium text-slate-400">{latestReview.agent}</span>: {latestReview.action}
        </div>
      )}

      {showActions && idea.status === "REVIEW" && (
        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-800">
          <button
            onClick={(e) => { e.stopPropagation(); onAdvance?.(idea.id); }}
            className="text-[10px] px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
          >
            Advance &rarr;
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onBounce?.(idea.id); }}
            className="text-[10px] px-2 py-1 rounded bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors"
          >
            &larr; Bounce
          </button>
        </div>
      )}
    </div>
  );
}
