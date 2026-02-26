"use client";
import { useState } from "react";
import { useDashboard } from "@/hooks/use-dashboard";
import { PageHeader } from "@/components/layout/page-header";
import { Card, Badge, Modal } from "@/components/shared";
import { PipelineCard, ReviewDots } from "@/components/domain";
import { REVIEW_STAGES, REVIEW_STAGE_AGENT, AGENT_NAMES } from "@/lib/data/types";
import type { IncomePipelineIdea } from "@/lib/data/types";

const statusVariant: Record<string, "green" | "amber" | "blue" | "gray" | "red" | "orange"> = {
  PROPOSED: "gray",
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
};

export default function PipelinePage() {
  const { data, loading, refresh } = useDashboard();
  const [selectedIdea, setSelectedIdea] = useState<IncomePipelineIdea | null>(null);
  const [filter, setFilter] = useState<string>("ALL");
  const [advancing, setAdvancing] = useState(false);

  if (loading && !data) {
    return <div className="flex items-center justify-center h-full text-slate-500 text-sm">Loading pipeline...</div>;
  }
  if (!data) return null;

  const ideas = data.incomePipeline.ideas;

  // Categorize ideas by current state
  const goIdeas = ideas.filter(i => i.status === "GO" || i.status === "IN_PROGRESS");
  const planningIdeas = ideas.filter(i => i.status === "PLANNING");
  const proposedIdeas = ideas.filter(i => i.status === "PROPOSED");
  const mergedIdeas = ideas.filter(i => i.status === "MERGED");
  const approvedIdeas = ideas.filter(i => i.status === "APPROVED" || i.status === "SHIPPED");
  const parkedIdeas = ideas.filter(i => i.status === "PARKED" || i.status === "DEPRIORITIZED" || i.status === "DEFERRED" || i.status === "REJECTED");

  // Ideas in the 7-stage review process
  const reviewIdeas = ideas.filter(i => i.status === "REVIEW");
  const kanbanColumns = REVIEW_STAGES.map((stage, i) => ({
    stage,
    stageNum: i + 1,
    agentId: REVIEW_STAGE_AGENT[stage],
    agentName: AGENT_NAMES[REVIEW_STAGE_AGENT[stage]] || stage,
    ideas: reviewIdeas.filter(idea => idea.reviewStageName === stage),
  }));

  // Filtered view
  const getFiltered = () => {
    if (filter === "ALL") return ideas;
    if (filter === "ACTIVE") return ideas.filter(i => i.section === "active");
    if (filter === "NEW") return ideas.filter(i => i.section === "new");
    return ideas.filter(i => i.status === filter);
  };
  const filtered = getFiltered();

  const handleAdvance = async (ideaId: string) => {
    setAdvancing(true);
    try {
      await fetch("/api/pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ideaId, action: "advance" }),
      });
      refresh();
    } catch (e) {
      console.error("Failed to advance:", e);
    } finally {
      setAdvancing(false);
    }
  };

  const handleBounce = async (ideaId: string) => {
    setAdvancing(true);
    try {
      await fetch("/api/pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ideaId, action: "bounce" }),
      });
      refresh();
    } catch (e) {
      console.error("Failed to bounce:", e);
    } finally {
      setAdvancing(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Income Pipeline"
        subtitle={`${ideas.length} ideas · ${goIdeas.length} active · ${proposedIdeas.length} proposed · Revenue: ${data.incomePipeline.monthlyRevenue} / ${data.incomePipeline.targetRevenue}`}
        icon="💰"
        actions={
          <button onClick={refresh} className="text-xs px-3 py-1.5 rounded-lg border border-card-border text-slate-400 hover:text-slate-200 transition-colors">
            Refresh
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {/* Filter Bar */}
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { key: "ALL", label: "All", count: ideas.length },
            { key: "ACTIVE", label: "Active", count: ideas.filter(i => i.section === "active").length },
            { key: "NEW", label: "New Ideas", count: ideas.filter(i => i.section === "new").length },
            { key: "GO", label: "GO", count: goIdeas.length },
            { key: "PLANNING", label: "Planning", count: planningIdeas.length },
            { key: "MERGED", label: "Merged", count: mergedIdeas.length },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`text-[10px] px-2.5 py-1 rounded-full border transition-colors ${
                filter === f.key
                  ? "bg-blue-500/15 text-blue-400 border-blue-500/30"
                  : "border-card-border text-slate-500 hover:text-slate-300"
              }`}
            >
              {f.label} ({f.count})
            </button>
          ))}
        </div>

        {/* Pipeline Board — Status-based columns (ALL) or filtered grid */}
        {filter === "ALL" ? (
          <div className="overflow-x-auto">
            <div className="flex gap-3 min-w-[900px] pb-4">
              {/* GO / Active Column */}
              <div className="w-64 shrink-0">
                <div className="flex items-center gap-2 mb-2 px-2">
                  <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">GO / Active</span>
                  <Badge variant="green">{goIdeas.length}</Badge>
                </div>
                <div className="space-y-2">
                  {goIdeas.map(idea => (
                    <PipelineCard key={idea.id} idea={idea} onClick={() => setSelectedIdea(idea)} />
                  ))}
                  {goIdeas.length === 0 && (
                    <div className="rounded-lg border border-dashed border-slate-800 p-4 text-center text-[10px] text-slate-700">No active ideas</div>
                  )}
                </div>
              </div>

              {/* PLANNING Column */}
              <div className="w-64 shrink-0">
                <div className="flex items-center gap-2 mb-2 px-2">
                  <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">Planning</span>
                  <Badge variant="amber">{planningIdeas.length}</Badge>
                </div>
                <div className="space-y-2">
                  {planningIdeas.map(idea => (
                    <PipelineCard key={idea.id} idea={idea} onClick={() => setSelectedIdea(idea)} />
                  ))}
                  {planningIdeas.length === 0 && (
                    <div className="rounded-lg border border-dashed border-slate-800 p-4 text-center text-[10px] text-slate-700">Empty</div>
                  )}
                </div>
              </div>

              {/* PROPOSED / New Ideas Column */}
              <div className="w-64 shrink-0">
                <div className="flex items-center gap-2 mb-2 px-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Proposed</span>
                  <Badge variant="gray">{proposedIdeas.length}</Badge>
                </div>
                <div className="space-y-2">
                  {proposedIdeas.map(idea => (
                    <PipelineCard key={idea.id} idea={idea} onClick={() => setSelectedIdea(idea)} />
                  ))}
                  {proposedIdeas.length === 0 && (
                    <div className="rounded-lg border border-dashed border-slate-800 p-4 text-center text-[10px] text-slate-700">No proposals</div>
                  )}
                </div>
              </div>

              {/* MERGED Column */}
              <div className="w-64 shrink-0">
                <div className="flex items-center gap-2 mb-2 px-2">
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Merged</span>
                  <Badge variant="blue">{mergedIdeas.length}</Badge>
                </div>
                <div className="space-y-2">
                  {mergedIdeas.map(idea => (
                    <PipelineCard key={idea.id} idea={idea} onClick={() => setSelectedIdea(idea)} />
                  ))}
                  {mergedIdeas.length === 0 && (
                    <div className="rounded-lg border border-dashed border-slate-800 p-4 text-center text-[10px] text-slate-700">None</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <Card title={`${filter === "ACTIVE" ? "Active" : filter === "NEW" ? "New Ideas" : filter} Ideas`} badge={<Badge variant={statusVariant[filter] || "blue"}>{filtered.length}</Badge>}>
            {filtered.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filtered.map(idea => (
                  <PipelineCard key={idea.id} idea={idea} onClick={() => setSelectedIdea(idea)} />
                ))}
              </div>
            ) : (
              <div className="text-center text-sm text-slate-600 py-8">No ideas match this filter</div>
            )}
          </Card>
        )}

        {/* 7-Stage Review Kanban (shown when ideas are in review) */}
        {reviewIdeas.length > 0 && (
          <Card title="REVIEW PIPELINE (7-Stage)" badge={<Badge variant="amber" pulse>{reviewIdeas.length} in review</Badge>}>
            <div className="overflow-x-auto">
              <div className="flex gap-3 min-w-[1200px] pb-2">
                {kanbanColumns.map(col => (
                  <div key={col.stage} className="w-48 shrink-0">
                    <div className="flex items-center gap-2 mb-2 px-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{col.agentName}</span>
                      <Badge variant={col.ideas.length > 0 ? "amber" : "gray"}>{col.ideas.length}</Badge>
                      <span className="text-[8px] text-slate-700 font-mono">{col.stageNum}/7</span>
                    </div>
                    <div className="space-y-2">
                      {col.ideas.map(idea => (
                        <PipelineCard
                          key={idea.id}
                          idea={idea}
                          onClick={() => setSelectedIdea(idea)}
                          showActions
                          onAdvance={handleAdvance}
                          onBounce={handleBounce}
                        />
                      ))}
                      {col.ideas.length === 0 && (
                        <div className="rounded-lg border border-dashed border-slate-800 p-3 text-center text-[10px] text-slate-700">—</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Parked/Deprioritized Section */}
        {parkedIdeas.length > 0 && (
          <Card title="PARKED / DEPRIORITIZED" badge={<Badge variant="gray">{parkedIdeas.length}</Badge>}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {parkedIdeas.map(idea => (
                <PipelineCard key={idea.id} idea={idea} onClick={() => setSelectedIdea(idea)} />
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Idea Detail Modal */}
      <Modal open={!!selectedIdea} onClose={() => setSelectedIdea(null)} title={selectedIdea?.title} width="max-w-3xl">
        {selectedIdea && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <Badge variant="blue">{selectedIdea.id}</Badge>
              <Badge variant={statusVariant[selectedIdea.status] || "gray"}>{selectedIdea.status}</Badge>
              {selectedIdea.section === "new" && <Badge variant="amber">NEW IDEA</Badge>}
              {selectedIdea.mergedInto && <Badge variant="blue">Merged into {selectedIdea.mergedInto}</Badge>}
              {selectedIdea.deadline && <Badge variant="amber">Due: {selectedIdea.deadline}</Badge>}
              {selectedIdea.reviewStage && (
                <ReviewDots currentStage={selectedIdea.reviewStage} stageName={selectedIdea.reviewStageName} />
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              {selectedIdea.market && (
                <div><span className="text-slate-500">Market:</span> <span className="text-slate-300">{selectedIdea.market}</span></div>
              )}
              {selectedIdea.potential && (
                <div><span className="text-slate-500">Potential:</span> <span className="text-slate-300">{selectedIdea.potential}</span></div>
              )}
              {selectedIdea.effort && (
                <div><span className="text-slate-500">Effort:</span> <span className="text-slate-300">{selectedIdea.effort}</span></div>
              )}
              {selectedIdea.timeToFirst && (
                <div><span className="text-slate-500">Time to $:</span> <span className="text-slate-300">{selectedIdea.timeToFirst}</span></div>
              )}
              {selectedIdea.nextStep && (
                <div className="col-span-2"><span className="text-slate-500">Next step:</span> <span className="text-slate-300">{selectedIdea.nextStep}</span></div>
              )}
              {selectedIdea.currentHolder && (
                <div><span className="text-slate-500">Holder:</span> <span className="text-slate-300">{selectedIdea.currentHolder}</span></div>
              )}
              {selectedIdea.addedDate && (
                <div><span className="text-slate-500">Added:</span> <span className="text-slate-300">{selectedIdea.addedDate} by {selectedIdea.addedBy}</span></div>
              )}
            </div>

            {selectedIdea.thesis && (
              <div>
                <h4 className="text-xs font-bold text-slate-400 mb-1">Notes</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{selectedIdea.thesis}</p>
              </div>
            )}

            {selectedIdea.reviewHistory.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-400 mb-2">Review History</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedIdea.reviewHistory.map((entry, i) => (
                    <div key={i} className="text-xs border-l-2 border-slate-700 pl-3 py-1">
                      <span className="text-[10px] text-slate-600 font-mono">{entry.timestamp}</span>
                      <div className="text-slate-300">
                        <span className="font-medium text-slate-400">{entry.agent}</span>: {entry.action}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
