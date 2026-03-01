"use client";
import { useState } from "react";
import { useDashboard } from "@/hooks/use-dashboard";
import { useGateway } from "@/hooks/use-gateway";
import { PageHeader } from "@/components/layout/page-header";
import { Card, Badge, Modal } from "@/components/shared";
import { PipelineCard, ReviewDots } from "@/components/domain";
import { REVIEW_STAGES, REVIEW_STAGE_AGENT, AGENT_NAMES } from "@/lib/data/types";
import type { IncomePipelineIdea } from "@/lib/data/types";

/*
 * Tesla/SpaceX Inspired Stage-Gate Pipeline
 * ==========================================
 * Musk's 5-Step Process:
 *   1. Make requirements less dumb (Question everything)
 *   2. Delete the part or process (Simplify ruthlessly)
 *   3. Simplify & optimize
 *   4. Accelerate cycle time
 *   5. Automate last
 *
 * Pipeline → Project Graduation:
 *   PIPELINE = Ideas being validated (not yet a project)
 *   PROJECT  = Graduated idea in active build phase
 *
 * Stage-Gate Flow:
 *   GATE 0: IDEATION    → Capture raw ideas (anyone can submit)
 *   GATE 1: VALIDATION  → 7-stage review (does it make sense? first principles)
 *   GATE 2: PLANNING    → Delete the unnecessary, simplify scope, plan MVP
 *   GATE 3: GO          → Idea graduates to PROJECT → flywheel S3 Build
 *   GATE 4: SHIPPED     → Revenue/impact confirmed
 *
 * "If you're not deleting 10% of things back in, you're not deleting enough."
 */

const GATE_LABELS = [
  { key: "IDEATION", label: "Gate 0: Ideation", icon: "💡", desc: "Raw ideas captured from scans, intel, or team input", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  { key: "VALIDATION", label: "Gate 1: Validation", icon: "🔬", desc: "7-stage review — first principles check by each agent", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  { key: "PLANNING", label: "Gate 2: Planning", icon: "📐", desc: "Scope reduction, MVP definition, feasibility — delete the unnecessary", color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  { key: "GO", label: "Gate 3: Build", icon: "🚀", desc: "Graduated to PROJECT — active development sprint", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  { key: "SHIPPED", label: "Gate 4: Shipped", icon: "✅", desc: "Live in market — revenue or impact confirmed", color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20" },
];

const statusVariant: Record<string, "green" | "amber" | "blue" | "gray" | "red" | "orange"> = {
  PROPOSED: "blue", REVIEW: "amber", IN_PROGRESS: "blue", SHIPPED: "green",
  APPROVED: "green", GO: "green", MERGED: "blue", PLANNING: "amber",
  REJECTED: "red", DEFERRED: "gray", PARKED: "orange", DEPRIORITIZED: "gray",
  KILLED: "red", NEW: "amber",
};

function mapIdeaToGate(idea: IncomePipelineIdea): string {
  if (idea.status === "GO" || idea.status === "IN_PROGRESS") return "GO";
  if (idea.status === "PLANNING" || idea.status === "APPROVED") return "PLANNING";
  if (idea.status === "REVIEW") return "VALIDATION";
  if (idea.status === "SHIPPED") return "SHIPPED";
  // Killed/Rejected/Parked/Deferred/Merged go to their own sections — NOT ideation
  if (idea.status === "KILLED" || idea.status === "REJECTED") return "KILLED";
  if (idea.status === "PARKED" || idea.status === "DEFERRED" || idea.status === "DEPRIORITIZED") return "PARKED";
  if (idea.status === "MERGED") return "MERGED";
  // Items marked NEW/PROPOSED but with a review stage or current holder are actually in review
  if ((idea.status === "NEW" || idea.status === "PROPOSED") && (idea.reviewStage || idea.currentHolder)) {
    return "VALIDATION";
  }
  return "IDEATION"; // Only truly raw PROPOSED/NEW with no review progress stay in Ideation
}

export default function PipelinePage() {
  const { data, loading, refresh } = useDashboard();
  const gateway = useGateway();
  const [selectedIdea, setSelectedIdea] = useState<IncomePipelineIdea | null>(null);
  const [filter, setFilter] = useState<string>("ALL");
  const [advancing, setAdvancing] = useState(false);

  if (loading && !data) {
    return <div className="flex items-center justify-center h-full text-slate-500 text-sm">Loading pipeline...</div>;
  }
  if (!data) return null;

  const ideas = data.incomePipeline.ideas;

  // Classify by gate
  const ideation = ideas.filter(i => mapIdeaToGate(i) === "IDEATION");
  const validation = ideas.filter(i => mapIdeaToGate(i) === "VALIDATION");
  const planning = ideas.filter(i => mapIdeaToGate(i) === "PLANNING");
  const goIdeas = ideas.filter(i => mapIdeaToGate(i) === "GO");
  const shipped = ideas.filter(i => mapIdeaToGate(i) === "SHIPPED");
  const killed = ideas.filter(i => i.status === "KILLED" || i.status === "REJECTED");
  const merged = ideas.filter(i => i.status === "MERGED");
  const parked = ideas.filter(i => i.status === "PARKED" || i.status === "DEFERRED" || i.status === "DEPRIORITIZED");

  // Review pipeline Kanban
  const reviewIdeas = ideas.filter(i => i.status === "REVIEW");
  const kanbanColumns = REVIEW_STAGES.map((stage, i) => ({
    stage, stageNum: i + 1,
    agentId: REVIEW_STAGE_AGENT[stage],
    agentName: AGENT_NAMES[REVIEW_STAGE_AGENT[stage]] || stage,
    ideas: reviewIdeas.filter(idea => idea.reviewStageName === stage),
  }));

  // Filter logic
  const getFiltered = () => {
    if (filter === "ALL") return ideas;
    if (filter === "IDEATION") return ideation;
    if (filter === "VALIDATION") return validation;
    if (filter === "PLANNING") return planning;
    if (filter === "GO") return goIdeas;
    if (filter === "KILLED") return killed;
    if (filter === "MERGED") return merged;
    return ideas.filter(i => i.status === filter);
  };
  const filtered = getFiltered();

  const handleAdvance = async (ideaId: string) => {
    setAdvancing(true);
    try {
      await fetch("/api/pipeline", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ideaId, action: "advance" }) });
      refresh();
    } catch (e) { console.error("Failed to advance:", e); }
    finally { setAdvancing(false); }
  };

  const handleBounce = async (ideaId: string) => {
    setAdvancing(true);
    try {
      await fetch("/api/pipeline", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ideaId, action: "bounce" }) });
      refresh();
    } catch (e) { console.error("Failed to bounce:", e); }
    finally { setAdvancing(false); }
  };

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Income Pipeline"
        subtitle={`${ideas.length} ideas · ${goIdeas.length} in build · ${validation.length} validating · Revenue: ${data.incomePipeline.monthlyRevenue} / ${data.incomePipeline.targetRevenue}`}
        icon="💰"
        gatewayState={gateway.connectionState}
        actions={<button onClick={refresh} className="text-xs px-3 py-1.5 rounded-lg border border-card-border text-slate-400 hover:text-slate-200 transition-colors">Refresh</button>}
      />

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {/* Stage-Gate Visual Pipeline */}
        <Card>
          <div className="mb-3 flex items-center gap-2">
            <span className="text-xs font-bold text-slate-300">STAGE-GATE PIPELINE</span>
            <span className="text-[9px] text-slate-600">Inspired by Musk&apos;s 5-Step Process</span>
          </div>
          <div className="flex items-center gap-1">
            {GATE_LABELS.map((gate, idx) => {
              const count = gate.key === "IDEATION" ? ideation.length
                : gate.key === "VALIDATION" ? validation.length
                : gate.key === "PLANNING" ? planning.length
                : gate.key === "GO" ? goIdeas.length
                : shipped.length;
              const isActive = count > 0;
              return (
                <div key={gate.key} className="flex items-center flex-1">
                  <button
                    onClick={() => setFilter(gate.key)}
                    className={`flex-1 rounded-lg border p-3 transition-all text-center ${
                      filter === gate.key
                        ? `${gate.bg} ${gate.border} ring-1 ring-offset-0 ${gate.border}`
                        : isActive
                          ? `${gate.bg} ${gate.border} hover:brightness-125`
                          : "bg-slate-800/30 border-slate-800 opacity-50"
                    }`}
                  >
                    <div className="text-lg">{gate.icon}</div>
                    <div className={`text-xl font-bold ${isActive ? gate.color : "text-slate-600"}`}>{count}</div>
                    <div className="text-[9px] text-slate-500 mt-0.5">{gate.label.split(": ")[1]}</div>
                  </button>
                  {idx < GATE_LABELS.length - 1 && (
                    <div className="text-slate-700 px-0.5 text-xs">&rarr;</div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-2 flex items-center justify-between text-[9px] text-slate-600">
            <span>{killed.length} killed · {merged.length} merged · {parked.length} parked</span>
            <span>&ldquo;Delete the unnecessary. Simplify. Then accelerate.&rdquo;</span>
          </div>
        </Card>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { key: "ALL", label: "All", count: ideas.length },
            { key: "IDEATION", label: "Ideation", count: ideation.length },
            { key: "VALIDATION", label: "Validation", count: validation.length },
            { key: "PLANNING", label: "Planning", count: planning.length },
            { key: "GO", label: "Build (GO)", count: goIdeas.length },
            { key: "KILLED", label: "Killed", count: killed.length },
            { key: "MERGED", label: "Merged", count: merged.length },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`text-[10px] px-2.5 py-1 rounded-full border transition-colors ${
                filter === f.key ? "bg-blue-500/15 text-blue-400 border-blue-500/30" : "border-card-border text-slate-500 hover:text-slate-300"
              }`}
            >
              {f.label} ({f.count})
            </button>
          ))}
        </div>

        {/* Main View */}
        {filter === "ALL" ? (
          /* Kanban columns by gate */
          <div className="overflow-x-auto">
            <div className="flex gap-3 min-w-[1100px] pb-4">
              {[
                { title: "IDEATION", color: "text-blue-500", items: ideation, variant: "blue" as const },
                { title: "VALIDATION", color: "text-amber-500", items: validation, variant: "amber" as const },
                { title: "PLANNING", color: "text-purple-500", items: planning, variant: "amber" as const },
                { title: "BUILD (GO)", color: "text-emerald-500", items: goIdeas, variant: "green" as const },
                { title: "MERGED", color: "text-blue-400", items: merged, variant: "blue" as const },
              ].map(col => (
                <div key={col.title} className="w-56 shrink-0">
                  <div className="flex items-center gap-2 mb-2 px-2">
                    <span className={`text-[10px] font-bold ${col.color} uppercase tracking-wider`}>{col.title}</span>
                    <Badge variant={col.variant}>{col.items.length}</Badge>
                  </div>
                  <div className="space-y-2">
                    {col.items.map((idea, idx) => (
                      <PipelineCard key={`${idea.id}-${idx}`} idea={idea} onClick={() => setSelectedIdea(idea)} />
                    ))}
                    {col.items.length === 0 && (
                      <div className="rounded-lg border border-dashed border-slate-800 p-4 text-center text-[10px] text-slate-700">Empty</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <Card title={`${filter} Ideas`} badge={<Badge variant={statusVariant[filter] || "blue"}>{filtered.length}</Badge>}>
            {filtered.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filtered.map(idea => (
                  <PipelineCard key={idea.id} idea={idea} onClick={() => setSelectedIdea(idea)} />
                ))}
              </div>
            ) : (
              <div className="text-center text-sm text-slate-600 py-8">No ideas in this gate</div>
            )}
          </Card>
        )}

        {/* 7-Stage Review Kanban (Gate 1 detail) */}
        {reviewIdeas.length > 0 && (
          <Card title="GATE 1: VALIDATION PIPELINE" badge={<Badge variant="amber" pulse>{reviewIdeas.length} in review</Badge>}>
            <div className="mb-2 text-[10px] text-slate-500">Each idea passes through 7 agent checkpoints. First principles: does this make sense?</div>
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
                        <PipelineCard key={idea.id} idea={idea} onClick={() => setSelectedIdea(idea)} showActions onAdvance={handleAdvance} onBounce={handleBounce} />
                      ))}
                      {col.ideas.length === 0 && (
                        <div className="rounded-lg border border-dashed border-slate-800 p-3 text-center text-[10px] text-slate-700">&mdash;</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* How it works — collapsed explainer */}
        <Card>
          <details className="group">
            <summary className="cursor-pointer text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-2">
              <span>HOW PIPELINE &rarr; PROJECT WORKS</span>
              <span className="text-[10px] text-slate-600 font-normal">(click to expand)</span>
            </summary>
            <div className="mt-3 space-y-3 text-xs text-slate-400">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="font-bold text-slate-300">Pipeline (Ideas)</div>
                  <div className="space-y-1.5">
                    <div className="flex gap-2"><span className="text-blue-400 shrink-0">Gate 0:</span> <span>Raw idea captured — anyone (agent or human) can submit</span></div>
                    <div className="flex gap-2"><span className="text-amber-400 shrink-0">Gate 1:</span> <span>7-agent validation — HELM, COMPASS, ANCHOR, SIGNAL, BEACON, SPARK, HELM</span></div>
                    <div className="flex gap-2"><span className="text-purple-400 shrink-0">Gate 2:</span> <span>Scope reduction and MVP planning — delete the unnecessary</span></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="font-bold text-slate-300">Project (Execution)</div>
                  <div className="space-y-1.5">
                    <div className="flex gap-2"><span className="text-emerald-400 shrink-0">Gate 3:</span> <span>Idea graduates to <strong className="text-white">Project</strong> — enters Flywheel at S3 (Build)</span></div>
                    <div className="flex gap-2"><span className="text-green-400 shrink-0">Gate 4:</span> <span>Shipped and validated — revenue or impact confirmed</span></div>
                  </div>
                  <div className="mt-2 text-[10px] text-slate-500 italic">
                    Make requirements less dumb. Delete. Simplify. Accelerate. Automate.
                  </div>
                </div>
              </div>
              <div className="border-t border-slate-800 pt-2 text-[10px] text-slate-600">
                <strong className="text-slate-400">When does an idea become a project?</strong> When it passes Gate 2 (Planning) and gets GO status.
                It is then assigned to BEACON for build (S3), enters the Flywheel, and appears on the Projects page with milestones and deadlines.
                Ideas that fail validation get KILLED. Ideas too early get PARKED. Overlapping ideas get MERGED.
              </div>
            </div>
          </details>
        </Card>

        {/* Killed & Parked at bottom */}
        {(killed.length > 0 || parked.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {killed.length > 0 && (
              <Card title="KILLED" badge={<Badge variant="red">{killed.length}</Badge>}>
                <div className="space-y-2">
                  {killed.map(idea => (
                    <PipelineCard key={idea.id} idea={idea} onClick={() => setSelectedIdea(idea)} />
                  ))}
                </div>
              </Card>
            )}
            {parked.length > 0 && (
              <Card title="PARKED / DEFERRED" badge={<Badge variant="gray">{parked.length}</Badge>}>
                <div className="space-y-2">
                  {parked.map(idea => (
                    <PipelineCard key={idea.id} idea={idea} onClick={() => setSelectedIdea(idea)} />
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Idea Detail Modal */}
      <Modal open={!!selectedIdea} onClose={() => setSelectedIdea(null)} title={selectedIdea?.title} width="max-w-3xl">
        {selectedIdea && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <Badge variant="blue">{selectedIdea.id}</Badge>
              <Badge variant={statusVariant[selectedIdea.status] || "gray"}>{selectedIdea.status}</Badge>
              {selectedIdea.mergedInto && <Badge variant="blue">Merged into {selectedIdea.mergedInto}</Badge>}
              {selectedIdea.deadline && <Badge variant="amber">Due: {selectedIdea.deadline}</Badge>}
              {selectedIdea.reviewStage && (
                <ReviewDots currentStage={selectedIdea.reviewStage} stageName={selectedIdea.reviewStageName} />
              )}
              <Badge variant="gray">Gate: {GATE_LABELS.find(g => g.key === mapIdeaToGate(selectedIdea))?.label || "Unknown"}</Badge>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              {selectedIdea.market && <div><span className="text-slate-500">Market:</span> <span className="text-slate-300">{selectedIdea.market}</span></div>}
              {selectedIdea.potential && <div><span className="text-slate-500">Potential:</span> <span className="text-slate-300">{selectedIdea.potential}</span></div>}
              {selectedIdea.effort && <div><span className="text-slate-500">Effort:</span> <span className="text-slate-300">{selectedIdea.effort}</span></div>}
              {selectedIdea.timeToFirst && <div><span className="text-slate-500">Time to $:</span> <span className="text-slate-300">{selectedIdea.timeToFirst}</span></div>}
              {selectedIdea.nextStep && <div className="col-span-2"><span className="text-slate-500">Next step:</span> <span className="text-slate-300">{selectedIdea.nextStep}</span></div>}
              {selectedIdea.currentHolder && <div><span className="text-slate-500">Holder:</span> <span className="text-slate-300">{selectedIdea.currentHolder}</span></div>}
              {selectedIdea.addedDate && <div><span className="text-slate-500">Added:</span> <span className="text-slate-300">{selectedIdea.addedDate} by {selectedIdea.addedBy}</span></div>}
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
