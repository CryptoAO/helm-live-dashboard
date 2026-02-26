"use client";
import type { CodeProposal } from "@/lib/data/types";
import { Badge } from "../shared/badge";
import { AgentAvatar } from "../shared/agent-avatar";

interface CodeProposalsPanelProps {
  proposals: CodeProposal[];
}

const statusVariant: Record<string, "green" | "amber" | "blue" | "gray" | "red" | "orange"> = {
  PROPOSED: "amber",
  APPROVED: "blue",
  DONE: "green",
  REJECTED: "red",
  DEFERRED: "gray",
  REVERTED: "red",
};

const statusIcon: Record<string, string> = {
  PROPOSED: "\u23F3", // hourglass
  APPROVED: "\u2705", // check
  DONE: "\u2705",     // check
  REJECTED: "\u274C", // cross
  DEFERRED: "\u23F8", // pause
  REVERTED: "\u26A0", // warning
};

export function CodeProposalsPanel({ proposals }: CodeProposalsPanelProps) {
  if (proposals.length === 0) {
    return (
      <div className="rounded-lg border border-slate-800 bg-slate-800/20 p-4 text-center">
        <div className="text-2xl mb-2">{"\uD83D\uDEE0\uFE0F"}</div>
        <div className="text-xs text-slate-500">
          No code proposals yet. COMPASS will propose improvements from the backlog daily at 14:00 PHT.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {proposals.map(proposal => (
        <div
          key={proposal.id}
          className={`rounded-lg border p-3 ${
            proposal.status === "APPROVED"
              ? "border-blue-500/30 bg-blue-500/5"
              : proposal.status === "DONE"
              ? "border-emerald-500/20 bg-emerald-500/5"
              : proposal.status === "REJECTED" || proposal.status === "REVERTED"
              ? "border-red-500/20 bg-red-500/5"
              : "border-card-border bg-slate-800/30"
          }`}
        >
          {/* Header row */}
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <AgentAvatar agentId="compass" size="sm" />
            <span className="text-[10px] font-mono text-slate-500">{proposal.id}</span>
            <Badge variant={statusVariant[proposal.status] || "gray"}>
              {statusIcon[proposal.status] || ""} {proposal.status}
            </Badge>
            <Badge variant={proposal.priority === "P1" ? "red" : "amber"}>{proposal.priority}</Badge>
            <Badge variant={proposal.risk === "MEDIUM" ? "orange" : "gray"}>
              {proposal.risk} risk
            </Badge>
          </div>

          {/* Title + date */}
          <div className="text-xs text-slate-300 font-medium mb-1">{proposal.title}</div>
          {proposal.date && (
            <div className="text-[10px] text-slate-600 font-mono mb-1.5">{proposal.date}</div>
          )}

          {/* Stats row */}
          <div className="flex items-center gap-3 text-[10px] text-slate-500 flex-wrap">
            <span>
              <span className="text-slate-400">{proposal.filesToModify.length}</span> file{proposal.filesToModify.length !== 1 ? "s" : ""} to modify
            </span>
            {proposal.filesToCreate.length > 0 && (
              <span>
                <span className="text-slate-400">{proposal.filesToCreate.length}</span> to create
              </span>
            )}
            <span>Est: <span className="text-slate-400 font-mono">{proposal.estimatedTokens}</span></span>
            {proposal.backlogItemId > 0 && (
              <span>Backlog <span className="text-slate-400 font-mono">#{proposal.backlogItemId}</span></span>
            )}
          </div>

          {/* Completion info (for DONE proposals) */}
          {proposal.status === "DONE" && (
            <div className="flex items-center gap-3 text-[10px] text-emerald-400/70 mt-1.5 flex-wrap">
              {proposal.completedDate && <span>Completed: <span className="font-mono">{proposal.completedDate}</span></span>}
              {proposal.gitCommit && <span>Commit: <span className="font-mono">{proposal.gitCommit.substring(0, 8)}</span></span>}
              {proposal.actualTokens && (
                <span>Actual: <span className="font-mono">{proposal.actualTokens}</span></span>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
