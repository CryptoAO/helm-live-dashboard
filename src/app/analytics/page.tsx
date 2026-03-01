"use client";
import { useState, useEffect } from "react";
import { useDashboard } from "@/hooks/use-dashboard";
import { useGateway } from "@/hooks/use-gateway";
import { PageHeader } from "@/components/layout/page-header";
import { Card, Badge, MetricBox, ProgressBar } from "@/components/shared";
import { MiniChart, Heatmap } from "@/components/domain";
import type { AnalyticsData } from "@/lib/data/types";

export default function AnalyticsPage() {
  const { data, loading, refresh } = useDashboard();
  const gateway = useGateway();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

  useEffect(() => {
    const fetchAnalytics = () => {
      fetch("/api/analytics")
        .then(r => r.json())
        .then(d => { setAnalytics(d); setLoadingAnalytics(false); })
        .catch(() => setLoadingAnalytics(false));
    };
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 60_000); // refresh every 60s
    return () => clearInterval(interval);
  }, []);

  if ((loading && !data) || loadingAnalytics) {
    return <div className="flex items-center justify-center h-full text-slate-500 text-sm">Loading analytics...</div>;
  }
  if (!data) return null;

  const budgetPerDay = 3.33;

  // Parse revenue strings like "PHP 1,200" → 1200, "PHP 5,600/month" → 5600
  const parseRevenue = (s: string): number => {
    const m = s.match(/[\d,]+/);
    return m ? parseFloat(m[0].replace(/,/g, "")) : 0;
  };
  const currentRev = parseRevenue(data.incomePipeline.monthlyRevenue);
  const targetRev = parseRevenue(data.incomePipeline.targetRevenue);
  const revenuePct = targetRev > 0 ? Math.min((currentRev / targetRev) * 100, 100) : 0;
  // SVG circle circumference for r=16: 2*π*16 ≈ 100.53
  const circumference = 2 * Math.PI * 16;
  const revenueDash = (revenuePct / 100) * circumference;

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Analytics & Intelligence" subtitle="Token usage, pipeline velocity, agent performance" icon="📊"
        gatewayState={gateway.connectionState}
        actions={<button onClick={refresh} className="text-xs px-3 py-1.5 rounded-lg border border-card-border text-slate-400 hover:text-slate-200 transition-colors">Refresh</button>}
      />

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {/* Top KPI Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="!p-0">
            <MetricBox label="Today's Cost" value={analytics ? `$${analytics.estimatedCostToday.toFixed(2)}` : "—"} sub={`of $${budgetPerDay}/day`} color={analytics && analytics.estimatedCostToday > budgetPerDay ? "text-red-400" : "text-emerald-400"} icon="💵" />
          </Card>
          <Card className="!p-0">
            <MetricBox label="Today's Tokens" value={analytics ? `${(analytics.totalTokensToday / 1000).toFixed(0)}k` : "—"} color="text-blue-400" icon="🎯" />
          </Card>
          <Card className="!p-0">
            <MetricBox label="Budget Used" value={analytics ? `${analytics.budgetPct.toFixed(0)}%` : "—"} color={analytics && analytics.budgetPct > 80 ? "text-amber-400" : "text-emerald-400"} icon="⛽" />
          </Card>
          <Card className="!p-0">
            <MetricBox label="Revenue" value={data.incomePipeline.monthlyRevenue} sub={`Goal: ${data.incomePipeline.targetRevenue}`} color="text-amber-400" icon="📈" />
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Token Usage Chart */}
          <Card title="TOKEN BUDGET" badge={<Badge variant="blue">Last 7 days</Badge>}>
            {analytics && analytics.tokenUsage.length > 0 ? (
              <MiniChart
                data={analytics.tokenUsage.map(d => ({
                  label: d.date.slice(5),
                  value: d.estimatedCost,
                  color: d.estimatedCost > budgetPerDay ? "bg-red-400" : d.estimatedCost > budgetPerDay * 0.8 ? "bg-amber-400" : "bg-blue-400",
                }))}
                height={140}
                budgetLine={budgetPerDay}
              />
            ) : (
              <div className="text-xs text-slate-600 py-8 text-center">No token usage data available</div>
            )}
          </Card>

          {/* Pipeline Velocity */}
          <Card title="PIPELINE VELOCITY" badge={<Badge variant="amber">Avg hours per stage</Badge>}>
            {analytics && analytics.pipelineVelocity.length > 0 ? (
              <div className="space-y-2">
                {analytics.pipelineVelocity.map((stage) => (
                  <div key={stage.stageName} className="flex items-center gap-3">
                    <span className="text-[10px] text-slate-500 w-28 truncate font-mono">{stage.stageName}</span>
                    <div className="flex-1">
                      <ProgressBar value={Math.min((stage.avgHours / 24) * 100, 100)} color={stage.avgHours > 12 ? "bg-amber-400" : "bg-emerald-400"} height="h-3" />
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono w-10 text-right">{stage.avgHours.toFixed(1)}h</span>
                    <span className="text-[9px] text-slate-600">{stage.ideaCount} ideas</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-slate-600 py-8 text-center">Not enough review data yet</div>
            )}
          </Card>

          {/* Agent Activity Heatmap */}
          <Card title="AGENT ACTIVITY HEATMAP" badge={<Badge variant="blue">Actions per hour</Badge>} span={2}>
            {analytics && analytics.agentHeatmap.length > 0 ? (
              <Heatmap rows={analytics.agentHeatmap.map(r => ({ label: r.agentName, cells: r.hours }))} />
            ) : (
              <div className="text-xs text-slate-600 py-8 text-center">No activity data available</div>
            )}
          </Card>

          {/* Cron Health */}
          <Card title="CRON HEALTH" badge={<Badge variant="green">Last 7 days</Badge>}>
            {analytics && analytics.cronHealth.length > 0 ? (
              <div className="space-y-1.5">
                {analytics.cronHealth.map(job => {
                  const successPct = job.totalRuns > 0 ? (job.successCount / job.totalRuns) * 100 : 0;
                  return (
                    <div key={job.jobId} className="flex items-center gap-2">
                      <span className="text-[9px] text-slate-500 w-32 truncate">{job.jobName}</span>
                      <div className="flex-1 h-2.5 rounded-full bg-slate-700/50 overflow-hidden flex">
                        <div className="h-full bg-emerald-400 rounded-l" style={{ width: `${successPct}%` }} />
                        <div className="h-full bg-red-400 rounded-r" style={{ width: `${100 - successPct}%` }} />
                      </div>
                      <span className="text-[9px] text-slate-600 font-mono w-8 text-right">{job.totalRuns}</span>
                      <span className="text-[9px] text-slate-600">{(job.avgDurationMs / 1000).toFixed(0)}s</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-xs text-slate-600 py-8 text-center">No cron run data available</div>
            )}
          </Card>

          {/* Revenue Tracker */}
          <Card title="REVENUE TRACKER" badge={<Badge variant="amber">Monthly goal</Badge>}>
            <div className="flex flex-col items-center py-4">
              <div className="relative w-32 h-32">
                <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                  <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(30,41,59,0.5)" strokeWidth="3" />
                  <circle cx="18" cy="18" r="16" fill="none" stroke="#f59e0b" strokeWidth="3" strokeDasharray={`${revenueDash} ${circumference}`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold text-slate-200">{data.incomePipeline.monthlyRevenue}</span>
                  <span className="text-[9px] text-slate-500">of {data.incomePipeline.targetRevenue}</span>
                </div>
              </div>
              <div className="mt-4 text-xs text-slate-500 text-center">
                {data.incomePipeline.reviewCount} ideas in review pipeline
              </div>
            </div>
          </Card>

          {/* Fleet Health Score */}
          <Card title="FLEET HEALTH SCORE" badge={<Badge variant={data.safety.level === "green" ? "green" : data.safety.level === "amber" ? "amber" : "red"}>{data.safety.label}</Badge>}>
            <div className="space-y-3">
              {(() => {
                const activeAgents = data.agents.filter(a => a.activityStatus === "active").length;
                const totalAgents = data.agents.length;
                const agentHealth = Math.round((activeAgents / totalAgents) * 100);
                const activeCrons = data.cronJobs.filter(j => j.enabled).length;
                const errorCrons = data.cronJobs.filter(j => j.consecutiveErrors > 0).length;
                const cronHealth = activeCrons > 0 ? Math.round(((activeCrons - errorCrons) / activeCrons) * 100) : 100;
                const flywheelActive = data.flywheel.items.filter((f: { stage: number; isStuck: boolean }) => f.stage >= 3 && !f.isStuck).length;
                const overallHealth = Math.round((agentHealth + cronHealth + (data.resourceMode.pct > 30 ? 100 : data.resourceMode.pct * 3)) / 3);
                return (
                  <>
                    <div className="flex items-center justify-center">
                      <div className={`text-4xl font-bold ${overallHealth >= 80 ? "text-emerald-400" : overallHealth >= 50 ? "text-amber-400" : "text-red-400"}`}>
                        {overallHealth}%
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500 w-24">Agents Online</span>
                        <div className="flex-1"><ProgressBar value={agentHealth} color={agentHealth >= 80 ? "bg-emerald-500" : "bg-amber-500"} /></div>
                        <span className="text-[10px] text-slate-400 w-12 text-right">{activeAgents}/{totalAgents}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500 w-24">Cron Health</span>
                        <div className="flex-1"><ProgressBar value={cronHealth} color={cronHealth >= 80 ? "bg-emerald-500" : "bg-amber-500"} /></div>
                        <span className="text-[10px] text-slate-400 w-12 text-right">{errorCrons > 0 ? `${errorCrons} err` : "OK"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500 w-24">Token Budget</span>
                        <div className="flex-1"><ProgressBar value={data.resourceMode.pct} color={data.resourceMode.pct > 60 ? "bg-emerald-500" : data.resourceMode.pct > 30 ? "bg-amber-500" : "bg-red-500"} /></div>
                        <span className="text-[10px] text-slate-400 w-12 text-right">{data.resourceMode.pct}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500 w-24">Active Builds</span>
                        <span className="text-[10px] text-emerald-400 font-medium">{flywheelActive} items in S3+ sprint</span>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </Card>

          {/* Pipeline Conversion Funnel */}
          <Card title="PIPELINE FUNNEL" badge={<Badge variant="blue">Conversion</Badge>}>
            {(() => {
              const ideas = data.incomePipeline.ideas;
              const proposed = ideas.filter(i => i.status === "PROPOSED" || i.status === "NEW").length;
              const inReview = ideas.filter(i => i.status === "REVIEW").length;
              const planning = ideas.filter(i => i.status === "PLANNING" || i.status === "APPROVED").length;
              const building = ideas.filter(i => i.status === "GO" || i.status === "IN_PROGRESS").length;
              const shipped = ideas.filter(i => i.status === "SHIPPED").length;
              const killed = ideas.filter(i => i.status === "KILLED" || i.status === "REJECTED").length;
              const stages = [
                { name: "Proposed", count: proposed, color: "bg-blue-500", total: ideas.length },
                { name: "Validating", count: inReview, color: "bg-amber-500", total: ideas.length },
                { name: "Planning", count: planning, color: "bg-purple-500", total: ideas.length },
                { name: "Building", count: building, color: "bg-emerald-500", total: ideas.length },
                { name: "Shipped", count: shipped, color: "bg-green-500", total: ideas.length },
              ];
              return (
                <div className="space-y-2">
                  {stages.map(s => (
                    <div key={s.name} className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500 w-16">{s.name}</span>
                      <div className="flex-1 h-5 bg-slate-800/50 rounded overflow-hidden">
                        <div className={`h-full ${s.color}/60 rounded flex items-center pl-2`} style={{ width: `${Math.max((s.count / Math.max(s.total, 1)) * 100, 8)}%` }}>
                          <span className="text-[9px] text-white font-bold">{s.count}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="text-[10px] text-slate-600 pt-1 flex items-center gap-3">
                    <span>Kill rate: <span className="text-red-400 font-medium">{ideas.length > 0 ? Math.round((killed / ideas.length) * 100) : 0}%</span></span>
                    <span>Conversion: <span className="text-emerald-400 font-medium">{ideas.length > 0 ? Math.round(((building + shipped) / ideas.length) * 100) : 0}%</span></span>
                  </div>
                </div>
              );
            })()}
          </Card>

          {/* Agent Productivity Ranking */}
          <Card title="AGENT PRODUCTIVITY" badge={<Badge variant="green">7-Day Ranking</Badge>}>
            {data.agentGrowth && data.agentGrowth.length > 0 ? (
              <div className="space-y-1.5">
                {[...data.agentGrowth].sort((a, b) => b.totalRuns - a.totalRuns).map((g, idx) => {
                  const maxRuns = Math.max(...data.agentGrowth.map(ag => ag.totalRuns), 1);
                  const pct = (g.totalRuns / maxRuns) * 100;
                  return (
                    <div key={g.agentId} className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500 w-4 font-bold">#{idx + 1}</span>
                      <span className="text-[10px] text-slate-300 w-16 font-medium">{g.agentName}</span>
                      <div className="flex-1 h-3 bg-slate-800/50 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${idx === 0 ? "bg-amber-400" : idx === 1 ? "bg-slate-300" : idx === 2 ? "bg-orange-600" : "bg-slate-600"}`}
                          style={{ width: `${Math.max(pct, 4)}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono w-8 text-right">{g.totalRuns}</span>
                      <span className={`text-[9px] w-10 text-right ${g.trend === "rising" ? "text-emerald-400" : g.trend === "declining" ? "text-red-400" : "text-slate-600"}`}>
                        {g.trend === "rising" ? "↑" : g.trend === "declining" ? "↓" : "—"}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-xs text-slate-600 py-8 text-center">No agent data available</div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
