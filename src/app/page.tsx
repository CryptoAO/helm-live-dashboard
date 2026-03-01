"use client";
import { useState } from "react";
import { useDashboard } from "@/hooks/use-dashboard";
import { useGateway } from "@/hooks/use-gateway";
import { PageHeader } from "@/components/layout/page-header";
import { Card, Badge, MetricBox, Modal } from "@/components/shared";
import { SafetyBanner, AgentCard, CronJobRow, PipelineCard, FlywheelStage, ActivityItem, FlywheelDetail, TaskboardPanel, Sparkline, ProviderSwitcher } from "@/components/domain";

const STAGE_NAMES = ["Ideate", "Refine", "Build", "Ship", "Validate", "Learn"];

export default function BridgePage() {
  const { data, loading, error, lastRefresh, refresh, dataSource, snapshotAge } = useDashboard();
  const gateway = useGateway();
  const [selectedStage, setSelectedStage] = useState<number | null>(null);
  const [selectedItemIdx, setSelectedItemIdx] = useState<number | null>(null);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-slate-500 text-sm">Loading operations data...</div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-400 text-sm">Error: {error}</div>
      </div>
    );
  }

  if (!data) return null;

  const nextCron = data.cronJobs
    .filter(j => j.enabled && j.nextRunAt)
    .sort((a, b) => (a.nextRunAt || "").localeCompare(b.nextRunAt || ""))
    .slice(0, 5);

  const topIdeas = data.incomePipeline.ideas
    .filter(i => i.status === "REVIEW" || i.status === "PROPOSED")
    .slice(0, 3);

  const stageCounts = STAGE_NAMES.map((_, i) =>
    data.flywheel.items.filter(f => f.stage === i + 1).length
  );

  const activeAgentCount = data.agents.filter(a => a.activityStatus === "active" || a.activityStatus === "recent").length;

  // Flywheel modal data
  const stageItems = selectedStage !== null
    ? data.flywheel.items.filter(f => f.stage === selectedStage)
    : [];
  const selectedItem = selectedItemIdx !== null ? stageItems[selectedItemIdx] : null;

  // Taskboard pending count
  const pendingTasks = data.taskboard?.filter(t => t.status === "PENDING" || t.status === "APPROVAL_PENDING") || [];

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="HELM Operations Center"
        subtitle="Personal AI Operations Fleet · 7 Agents · The Flywheel Never Stops"
        icon="⚓"
        gatewayState={gateway.connectionState}
        gatewayPid={data.gateway.pid}
        timestamp={`${lastRefresh} PHT`}
        actions={
          <div className="flex items-center gap-2">
            {dataSource === "snapshot" && snapshotAge && (
              <span className="text-[10px] px-2 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Snapshot {snapshotAge}
              </span>
            )}
            {dataSource === "live" && (
              <span className="text-[10px] px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                LIVE
              </span>
            )}
            <ProviderSwitcher />
            <button onClick={refresh} className="text-xs px-3 py-1.5 rounded-lg border border-card-border text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-colors">
              Refresh
            </button>
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {/* Safety Banner */}
        <SafetyBanner
          safety={data.safety}
          reviewCount={data.incomePipeline.reviewCount}
          contentCount={data.contentPlan.length}
        />

        {/* KPI Strip */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          <Card className="!p-0"><MetricBox label="Agents" value={`${activeAgentCount}/7`} color="text-emerald-400" icon="🤖" /></Card>
          <Card className="!p-0"><MetricBox label="Cron Jobs" value={data.cronJobs.filter(j => j.enabled).length} color="text-blue-400" icon="⏰" /></Card>
          <Card className="!p-0"><MetricBox label="Pipeline" value={data.incomePipeline.reviewCount} sub="in review" color="text-amber-400" icon="💰" /></Card>
          <Card className="!p-0"><MetricBox label="Token Budget" value={`${data.resourceMode.pct}%`} color={data.resourceMode.pct > 70 ? "text-emerald-400" : data.resourceMode.pct > 30 ? "text-amber-400" : "text-red-400"} icon="⛽" /></Card>
          <Card className="!p-0"><MetricBox label="Revenue" value={data.incomePipeline.monthlyRevenue} sub={`/ ${data.incomePipeline.targetRevenue}`} color="text-slate-300" icon="📈" /></Card>
          <Card className="!p-0"><MetricBox label="Fleet Idle" value={data.fleetIdleMinutes < 60 ? `${data.fleetIdleMinutes}m` : `${Math.floor(data.fleetIdleMinutes / 60)}h`} color={data.fleetIdleMinutes > 120 ? "text-amber-400" : "text-emerald-400"} icon="💤" /></Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left — Flywheel + Taskboard + Pipeline + Crons */}
          <div className="lg:col-span-2 space-y-4">
            <Card title="THE FLYWHEEL" badge={<Badge variant="blue">{data.flywheel.totalActive} active</Badge>}>
              <div className="flex items-center justify-between gap-2">
                {STAGE_NAMES.map((name, i) => (
                  <FlywheelStage
                    key={name}
                    number={i + 1}
                    name={name}
                    count={stageCounts[i]}
                    isActive={stageCounts[i] > 0}
                    onClick={() => { setSelectedStage(i + 1); setSelectedItemIdx(null); }}
                  />
                ))}
              </div>
            </Card>

            {/* Taskboard — pending tasks across fleet */}
            <Card
              title="TASKBOARD"
              badge={
                pendingTasks.length > 0
                  ? <Badge variant="amber" pulse>{pendingTasks.length} pending</Badge>
                  : <Badge variant="green">clear</Badge>
              }
            >
              <TaskboardPanel tasks={data.taskboard || []} />
            </Card>

            <Card title="INCOME PIPELINE" badge={<Badge variant="amber" pulse>{data.incomePipeline.reviewCount} in review</Badge>}>
              <div className="space-y-2">
                {topIdeas.length > 0 ? topIdeas.map(idea => (
                  <PipelineCard key={idea.id} idea={idea} />
                )) : <div className="text-xs text-slate-600 py-4 text-center">No ideas in pipeline</div>}
              </div>
            </Card>

            <Card title="NEXT CRON JOBS">
              <div className="divide-y divide-slate-800">
                {nextCron.map((job, i) => <CronJobRow key={job.jobId || `cron-${i}`} job={job} />)}
              </div>
            </Card>
          </div>

          {/* Right — Agents + Activity Sparklines + Feed */}
          <div className="space-y-4">
            <Card title="AGENT FLEET" badge={<Badge variant="gray">7-day trends</Badge>}>
              <div className="space-y-2">
                {data.agents.slice(0, 7).map(agent => {
                  const sparkData = data.agentSparklines?.find(s => s.agentId === agent.id);
                  return (
                    <div key={agent.id} className="flex items-center gap-2">
                      <div className="flex-1">
                        <AgentCard agent={agent} compact />
                      </div>
                      {sparkData && sparkData.daily.some(v => v > 0) && (
                        <Sparkline
                          data={sparkData.daily}
                          labels={sparkData.labels}
                          width={72}
                          height={20}
                          color={agent.activityStatus === "active" ? "#10b981" : agent.activityStatus === "recent" ? "#3b82f6" : "#475569"}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card title="ACTIVITY FEED" badge={
              gateway.activeAgents.length > 0 ? <Badge variant="green" pulse>{gateway.activeAgents.length} running</Badge> : undefined
            }>
              <div className="space-y-0 max-h-64 overflow-y-auto">
                {data.activity.slice(0, 15).map((entry, i) => (
                  <ActivityItem key={`${entry.time}-${entry.agentId}-${i}`} entry={entry} />
                ))}
                {data.activity.length === 0 && <div className="text-xs text-slate-600 py-4 text-center">No activity yet today</div>}
              </div>
            </Card>

            <Card title="TODAY">
              <div className="space-y-2 text-xs">
                {data.cases.total > 0 && (
                  <div className="flex justify-between text-slate-400"><span>Cases</span><span className="font-mono">{data.cases.total} ({data.cases.high}H/{data.cases.medium}M/{data.cases.low}L)</span></div>
                )}
                {(data.manning.fillRate || data.manning.vessels) && (data.manning.vessels ?? 0) > 0 && (
                  <div className="flex justify-between text-slate-400"><span>Manning</span><span className="font-mono">{data.manning.fillRate || "—"} fill · {data.manning.vessels ?? "—"} vessels</span></div>
                )}
                {data.deadlines.totalNext7 > 0 && (
                  <div className="flex justify-between text-slate-400"><span>Deadlines</span><span className="font-mono">{data.deadlines.totalNext7} this week</span></div>
                )}
                <div className="flex justify-between text-slate-400"><span>Crons today</span><span className="font-mono">{data.resourceMode.todayCrons}</span></div>
                {data.cases.total === 0 && data.deadlines.totalNext7 === 0 && (
                  <div className="text-[10px] text-slate-600 italic">No active cases or deadlines — feed real data to shared-kb/</div>
                )}
              </div>
            </Card>
          </div>
        </div>

        <footer className="text-center text-[10px] text-slate-700 py-2">
          HELM Operations Center v3.0 | Income Review Pipeline | The War Room | 24/7 Flywheel
        </footer>
      </div>

      {/* Flywheel Stage Detail Modal */}
      <Modal
        open={selectedStage !== null}
        onClose={() => { setSelectedStage(null); setSelectedItemIdx(null); }}
        title={selectedStage ? `Stage ${selectedStage} — ${STAGE_NAMES[selectedStage - 1]}` : ""}
        width="max-w-3xl"
      >
        {selectedStage !== null && (
          <div className="space-y-3">
            {stageItems.length === 0 ? (
              <div className="text-xs text-slate-500 py-4 text-center">No items in this stage</div>
            ) : selectedItem ? (
              <div>
                <button
                  onClick={() => setSelectedItemIdx(null)}
                  className="text-[10px] text-blue-400 hover:text-blue-300 mb-3 flex items-center gap-1"
                >
                  <span>&larr;</span> Back to stage items
                </button>
                <FlywheelDetail item={selectedItem} />
              </div>
            ) : (
              stageItems.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedItemIdx(idx)}
                  className="w-full text-left p-3 rounded-lg bg-slate-800/40 border border-slate-700/50 hover:border-blue-500/30 hover:bg-slate-800/60 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="blue">{item.id}</Badge>
                      <span className="text-xs text-slate-300 group-hover:text-slate-200">{item.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.isStuck && <Badge variant="red" pulse>STUCK</Badge>}
                      <span className={`text-[10px] font-bold ${
                        item.priority === "P0" ? "text-red-400" :
                        item.priority === "P1" ? "text-amber-400" :
                        "text-slate-500"
                      }`}>{item.priority}</span>
                      <Badge variant="gray">{item.leadAgent}</Badge>
                      <span className="text-slate-600 text-xs group-hover:text-slate-400">&rsaquo;</span>
                    </div>
                  </div>
                  {item.statusNotes[0] && (
                    <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">{item.statusNotes[0]}</p>
                  )}
                </button>
              ))
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
