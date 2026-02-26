"use client";
import { useState, useEffect } from "react";
import { useDashboard } from "@/hooks/use-dashboard";
import { PageHeader } from "@/components/layout/page-header";
import { Card, Badge, MetricBox, ProgressBar } from "@/components/shared";
import { MiniChart, Heatmap } from "@/components/domain";
import type { AnalyticsData } from "@/lib/data/types";

export default function AnalyticsPage() {
  const { data, loading, refresh } = useDashboard();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

  useEffect(() => {
    fetch("/api/analytics")
      .then(r => r.json())
      .then(d => { setAnalytics(d); setLoadingAnalytics(false); })
      .catch(() => setLoadingAnalytics(false));
  }, []);

  if ((loading && !data) || loadingAnalytics) {
    return <div className="flex items-center justify-center h-full text-slate-500 text-sm">Loading analytics...</div>;
  }
  if (!data) return null;

  const budgetPerDay = 3.33;

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Analytics & Intelligence" subtitle="Token usage, pipeline velocity, agent performance" icon="📊"
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
                  <circle cx="18" cy="18" r="16" fill="none" stroke="#f59e0b" strokeWidth="3" strokeDasharray={`${0} 100`} strokeLinecap="round" />
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
        </div>
      </div>
    </div>
  );
}
