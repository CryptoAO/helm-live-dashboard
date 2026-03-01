"use client";
import { useState, useCallback, useEffect } from "react";
import { useDashboard } from "@/hooks/use-dashboard";
import { useGateway } from "@/hooks/use-gateway";
import { PageHeader } from "@/components/layout/page-header";
import { Card, Badge, Modal, AgentAvatar } from "@/components/shared";
import { CronJobRow, Sparkline } from "@/components/domain";
import type { AgentInfo, AgentGrowthMetrics } from "@/lib/data/types";
import { AGENT_COLORS } from "@/lib/data/types";
import { AGENT_RPG_PROFILES, getCapabilityBarColor, getTierColor } from "@/lib/data/agent-profiles";

const AGENT_ORDER = ["main", "eagle", "anchor", "beacon", "compass", "signal", "spark"];

export default function FleetPage() {
  const { data, loading, refresh } = useDashboard();
  const gateway = useGateway();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAgent, setSelectedAgent] = useState<AgentInfo | null>(null);
  const [messageAgent, setMessageAgent] = useState<string>("");
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);

  const goNext = useCallback(() => setCurrentIdx(i => (i + 1) % 7), []);
  const goPrev = useCallback(() => setCurrentIdx(i => (i - 1 + 7) % 7), []);

  // Keyboard nav
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goNext, goPrev]);

  if (loading && !data) {
    return <div className="flex items-center justify-center h-full text-slate-500 text-sm">Loading fleet...</div>;
  }
  if (!data) return null;

  const agents = data.agents;
  const growth = data.agentGrowth || [];
  const currentAgent = agents.find(a => a.id === AGENT_ORDER[currentIdx]) || agents[0];
  const currentGrowth = growth.find(g => g.agentId === currentAgent.id);
  const rpg = AGENT_RPG_PROFILES[currentAgent.id];
  const sparkData = data.agentSparklines?.find(s => s.agentId === currentAgent.id);
  const colors = AGENT_COLORS[currentAgent.id];

  const handleToggleCron = async (jobId: string, enabled: boolean) => {
    try {
      await fetch("/api/cron", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "toggle", jobId, enabled }) });
      refresh();
    } catch (e) { console.error("Failed to toggle:", e); }
  };

  const handleTriggerCron = async (jobId: string) => {
    try {
      await fetch("/api/cron", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "trigger", jobId }) });
    } catch (e) { console.error("Failed to trigger:", e); }
  };

  const handleSendMessage = async () => {
    if (!messageAgent || !messageText.trim()) return;
    setSending(true);
    try {
      await fetch("/api/agents", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ agentId: messageAgent, message: messageText }) });
      setMessageText("");
      setMessageAgent("");
    } catch (e) { console.error("Failed to send:", e); }
    finally { setSending(false); }
  };

  const agentCrons = data.cronJobs.filter(j => j.agentId === currentAgent.id).sort((a, b) => (a.nextRunAt || "").localeCompare(b.nextRunAt || ""));

  // Compute level from growth metrics (real data) or fallback to RPG profile
  const level = currentGrowth ? currentGrowth.level : (rpg?.level || 0);
  const xp = currentGrowth ? currentGrowth.xp : 0;
  const xpToNext = currentGrowth ? currentGrowth.xpToNextLevel : 100;

  const trendIcon = (t: string) => t === "rising" ? "+" : t === "declining" ? "-" : "=";
  const trendColor = (t: string) => t === "rising" ? "text-emerald-400" : t === "declining" ? "text-red-400" : "text-slate-500";

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Fleet Command"
        subtitle={`7 Agents · ${agents.filter(a => a.activityStatus === "active").length} active · ${data.cronJobs.filter(j => j.enabled).length} cron jobs`}
        icon="🤖"
        gatewayState={gateway.connectionState}
        gatewayPid={data.gateway.pid}
        actions={<button onClick={refresh} className="text-xs px-3 py-1.5 rounded-lg border border-card-border text-slate-400 hover:text-slate-200 transition-colors">Refresh</button>}
      />

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {/* Agent Selector Strip — click any agent or use arrows */}
        <div className="flex items-center gap-2">
          <button onClick={goPrev} className="w-8 h-8 flex items-center justify-center rounded-lg border border-card-border text-slate-400 hover:text-white hover:border-slate-500 transition-colors text-lg">&larr;</button>
          <div className="flex-1 flex items-center gap-1.5 overflow-x-auto">
            {AGENT_ORDER.map((agentId, idx) => {
              const a = agents.find(ag => ag.id === agentId);
              if (!a) return null;
              const c = AGENT_COLORS[agentId];
              const isActive = idx === currentIdx;
              return (
                <button
                  key={agentId}
                  onClick={() => setCurrentIdx(idx)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-all shrink-0 ${
                    isActive
                      ? `${c?.bg || "bg-blue-500/20"} ${c?.text || "text-blue-400"} ${c?.border || "border-blue-500/30"} ring-1 ring-blue-500/20`
                      : "border-card-border text-slate-500 hover:text-slate-300 hover:border-slate-600"
                  }`}
                >
                  <AgentAvatar agentId={agentId} size="sm" />
                  <span className="hidden sm:inline">{a.name}</span>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    a.activityStatus === "active" ? "bg-emerald-400 animate-pulse" :
                    a.activityStatus === "recent" ? "bg-blue-400" :
                    a.activityStatus === "overdue" ? "bg-amber-400" :
                    "bg-slate-600"
                  }`} />
                </button>
              );
            })}
          </div>
          <button onClick={goNext} className="w-8 h-8 flex items-center justify-center rounded-lg border border-card-border text-slate-400 hover:text-white hover:border-slate-500 transition-colors text-lg">&rarr;</button>
        </div>

        {/* Main Agent Spotlight */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left: Agent Profile Card */}
          <div className="lg:col-span-1">
            <div className={`relative rounded-xl border border-slate-700/50 bg-slate-900/80 overflow-hidden`}>
              <div className={`absolute inset-0 bg-gradient-to-br ${rpg?.avatar || "from-slate-500 to-blue-600"} opacity-[0.08]`} />
              <div className="relative p-5 space-y-4">
                {/* Header */}
                <div className="flex items-center gap-3">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${rpg?.avatar || "from-slate-500 to-blue-600"} flex items-center justify-center text-3xl shadow-lg`}>
                    {rpg?.emoji || "🤖"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-white">{rpg?.callsign || currentAgent.name}</span>
                      {rpg && <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getTierColor(rpg.tier)}`}>{rpg.tier}</span>}
                    </div>
                    <div className="text-xs text-slate-400">{rpg?.class || "Agent"}</div>
                    <div className="text-[10px] text-slate-500 italic mt-0.5">{rpg?.persona} mindset</div>
                  </div>
                </div>

                {/* Level & XP */}
                <div className="bg-slate-800/60 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white">Level {level}</span>
                    <span className="text-[10px] text-slate-400">{xp}/{xp + xpToNext} XP</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${rpg?.avatar || "from-blue-500 to-cyan-500"} transition-all duration-700`}
                      style={{ width: `${xpToNext > 0 ? (xp / (xp + xpToNext)) * 100 : 0}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-slate-500">1 cron run = 10 XP · Level up every 100 XP</div>
                </div>

                {/* Capabilities (replaces RPG stats with meaningful operational metrics) */}
                {rpg?.capabilities && (
                  <div className="space-y-1.5">
                    {rpg.capabilities.map(cap => (
                      <div key={cap.label} className="flex items-center gap-2" title={`${cap.fullName}: ${cap.description}`}>
                        <span className="text-[10px] font-mono text-slate-500 w-12">{cap.label}</span>
                        <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${getCapabilityBarColor(cap.value)}`} style={{ width: `${cap.value}%` }} />
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 w-5 text-right">{cap.value}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Skills Unlocked */}
                {rpg?.skillUnlocks && (
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1.5 font-medium">
                      Skills Unlocked ({rpg.skillUnlocks.filter(s => s.unlocked).length}/{rpg.skillUnlocks.length})
                    </div>
                    <div className="space-y-1">
                      {rpg.skillUnlocks.map(skill => (
                        <div key={skill.name} className={`flex items-center gap-2 px-2 py-1 rounded text-[10px] ${
                          skill.unlocked ? "bg-slate-800/50" : "bg-slate-800/20 opacity-40"
                        }`}>
                          <span className={skill.unlocked ? "text-emerald-400" : "text-slate-600"}>
                            {skill.unlocked ? "✓" : "🔒"}
                          </span>
                          <span className={skill.unlocked ? "text-slate-300" : "text-slate-600"}>{skill.name}</span>
                          <span className="ml-auto text-[9px] text-slate-600">{skill.unlockedAt}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Core Skills Tags */}
                {rpg && (
                  <div className="flex flex-wrap gap-1">
                    {rpg.skills.map(skill => (
                      <span key={skill} className="text-[9px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700/50">{skill}</span>
                    ))}
                  </div>
                )}

                {/* Quote */}
                {rpg && <div className="text-[10px] text-slate-500 italic">&ldquo;{rpg.statusQuote}&rdquo;</div>}
              </div>
            </div>
          </div>

          {/* Right: Growth Metrics & Activity */}
          <div className="lg:col-span-2 space-y-4">
            {/* Performance Dashboard */}
            <Card title="PERFORMANCE METRICS" badge={
              currentGrowth ? <Badge variant={currentGrowth.trend === "rising" ? "green" : currentGrowth.trend === "declining" ? "red" : "gray"}>{currentGrowth.trend.toUpperCase()}</Badge> : undefined
            }>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-slate-800/40 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-white">{currentGrowth?.totalRuns ?? 0}</div>
                  <div className="text-[10px] text-slate-500">Total Runs</div>
                </div>
                <div className="bg-slate-800/40 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-emerald-400">{currentGrowth?.successRate.toFixed(0) ?? 0}%</div>
                  <div className="text-[10px] text-slate-500">Success Rate</div>
                </div>
                <div className="bg-slate-800/40 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-blue-400">{currentGrowth?.avgResponseTime.toFixed(0) ?? 0}s</div>
                  <div className="text-[10px] text-slate-500">Avg Duration</div>
                </div>
                <div className="bg-slate-800/40 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-amber-400">{currentGrowth ? Math.round(currentGrowth.totalTokens / 1000) : 0}K</div>
                  <div className="text-[10px] text-slate-500">Tokens Used</div>
                </div>
              </div>
            </Card>

            {/* 7-Day Activity Trend */}
            <Card title="7-DAY ACTIVITY" badge={
              currentGrowth && currentGrowth.weekOverWeekChange !== 0 ? (
                <Badge variant={currentGrowth.weekOverWeekChange > 0 ? "green" : "red"}>
                  {currentGrowth.weekOverWeekChange > 0 ? "+" : ""}{currentGrowth.weekOverWeekChange.toFixed(0)}% WoW
                </Badge>
              ) : undefined
            }>
              <div className="flex items-end gap-1 h-24">
                {(currentGrowth?.dailyRuns || [0,0,0,0,0,0,0]).map((val, i) => {
                  const maxVal = Math.max(...(currentGrowth?.dailyRuns || [1]), 1);
                  const pct = (val / maxVal) * 100;
                  const label = currentGrowth?.dailyLabels[i] || "";
                  const isToday = i === 6;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[9px] font-mono text-slate-400">{val}</span>
                      <div className="w-full bg-slate-800 rounded-t relative" style={{ height: "64px" }}>
                        <div
                          className={`absolute bottom-0 w-full rounded-t transition-all duration-500 ${
                            isToday ? (colors?.bg?.replace("/20", "/60") || "bg-blue-500/60") : "bg-slate-600/60"
                          }`}
                          style={{ height: `${Math.max(pct, 4)}%` }}
                        />
                      </div>
                      <span className={`text-[9px] ${isToday ? "text-white font-bold" : "text-slate-600"}`}>{label}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between mt-3 text-[10px] text-slate-500">
                <span>This week: <span className="text-white font-bold">{currentGrowth?.runsThisWeek ?? 0}</span> runs</span>
                <span>Last week: <span className="text-slate-300">{currentGrowth?.runsLastWeek ?? 0}</span> runs</span>
              </div>
            </Card>

            {/* Status & Next Actions */}
            <Card title="STATUS">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Activity Status</span>
                    <Badge variant={currentAgent.activityStatus === "active" ? "green" : currentAgent.activityStatus === "recent" ? "blue" : currentAgent.activityStatus === "overdue" ? "amber" : "gray"}>
                      {currentAgent.activityStatus.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Cron Jobs</span>
                    <span className="text-slate-300">{agentCrons.length} ({agentCrons.filter(j => j.enabled).length} active)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Last Action</span>
                    <span className="text-slate-300 truncate ml-4 max-w-[200px]">{currentAgent.lastAction || "—"}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Next Scheduled</span>
                    <span className="text-slate-300">{currentAgent.nextScheduledName || "None"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Growth Trend</span>
                    <span className={currentGrowth ? trendColor(currentGrowth.trend) : "text-slate-500"}>
                      {currentGrowth ? `${trendIcon(currentGrowth.trend)} ${currentGrowth.trend}` : "No data"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Level Progress</span>
                    <span className="text-slate-300">LVL {level} · {xpToNext} XP to next</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Fleet Overview — All Agents Summary */}
        <Card title="FLEET OVERVIEW" badge={<Badge variant="blue">Growth Monitor</Badge>}>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500">
                  <th className="text-left py-2 px-2">Agent</th>
                  <th className="text-center py-2 px-2">Level</th>
                  <th className="text-center py-2 px-2">Runs</th>
                  <th className="text-center py-2 px-2">Success</th>
                  <th className="text-center py-2 px-2">7-Day</th>
                  <th className="text-center py-2 px-2">WoW</th>
                  <th className="text-center py-2 px-2">Trend</th>
                  <th className="text-center py-2 px-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {AGENT_ORDER.map(agentId => {
                  const a = agents.find(ag => ag.id === agentId);
                  const g = growth.find(gm => gm.agentId === agentId);
                  const sp = data.agentSparklines?.find(s => s.agentId === agentId);
                  if (!a) return null;
                  return (
                    <tr key={agentId} className="border-b border-slate-800/50 hover:bg-slate-800/30 cursor-pointer" onClick={() => setCurrentIdx(AGENT_ORDER.indexOf(agentId))}>
                      <td className="py-2 px-2">
                        <div className="flex items-center gap-2">
                          <AgentAvatar agentId={agentId} size="sm" />
                          <span className="font-medium text-slate-300">{a.name}</span>
                        </div>
                      </td>
                      <td className="text-center py-2 px-2 text-white font-bold">{g?.level ?? 0}</td>
                      <td className="text-center py-2 px-2 text-slate-300">{g?.totalRuns ?? 0}</td>
                      <td className="text-center py-2 px-2">
                        <span className={`${(g?.successRate ?? 0) >= 90 ? "text-emerald-400" : (g?.successRate ?? 0) >= 70 ? "text-amber-400" : "text-red-400"}`}>
                          {g?.successRate.toFixed(0) ?? 0}%
                        </span>
                      </td>
                      <td className="text-center py-2 px-2">
                        {sp && sp.daily.some(v => v > 0) ? (
                          <Sparkline data={sp.daily} labels={sp.labels} width={60} height={16} color={a.activityStatus === "active" ? "#10b981" : "#3b82f6"} />
                        ) : <span className="text-slate-600">—</span>}
                      </td>
                      <td className="text-center py-2 px-2">
                        {g && g.weekOverWeekChange !== 0 ? (
                          <span className={g.weekOverWeekChange > 0 ? "text-emerald-400" : "text-red-400"}>
                            {g.weekOverWeekChange > 0 ? "+" : ""}{g.weekOverWeekChange.toFixed(0)}%
                          </span>
                        ) : <span className="text-slate-600">—</span>}
                      </td>
                      <td className="text-center py-2 px-2">
                        <span className={g ? trendColor(g.trend) : "text-slate-600"}>
                          {g?.trend || "—"}
                        </span>
                      </td>
                      <td className="text-center py-2 px-2">
                        <span className={`w-2 h-2 rounded-full inline-block ${
                          a.activityStatus === "active" ? "bg-emerald-400" :
                          a.activityStatus === "recent" ? "bg-blue-400" :
                          a.activityStatus === "overdue" ? "bg-amber-400" :
                          "bg-slate-600"
                        }`} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Sub-Agent Spawning Center v2 */}
        {data.spawning && (
          <div className="space-y-4">
            <Card title="UNIT COMMAND CENTER" badge={
              <div className="flex items-center gap-2">
                <Badge variant={data.spawning.meta.activeSubAgents > 0 ? "green" : "gray"}>
                  {data.spawning.meta.activeSubAgents}/{data.spawning.meta.maxFleetSubAgents} subs
                </Badge>
                <Badge variant="blue">
                  {((data.spawning.meta.dailyUsed / data.spawning.meta.dailyBudget) * 100).toFixed(0)}% budget
                </Badge>
              </div>
            }>
              {/* Fleet Hierarchy Tree */}
              <div className="mb-4">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2 font-medium">Fleet Hierarchy</div>
                <div className="bg-slate-800/30 rounded-lg p-3 space-y-1">
                  {/* DOO Level */}
                  <div className="flex items-center gap-2 text-[10px]">
                    <span className="text-amber-400">👤</span>
                    <span className="text-amber-400 font-bold">DOO (Rizaldo)</span>
                    <span className="text-slate-600">— T3 Approvals</span>
                  </div>
                  <div className="ml-3 border-l border-slate-700 pl-3 space-y-1">
                    {/* HELM Level */}
                    <div className="flex items-center gap-2 text-[10px]">
                      <span>⚓</span>
                      <span className="text-white font-bold">HELM</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-300 border border-yellow-500/30">S</span>
                      <span className="text-slate-600">War Council</span>
                    </div>
                    <div className="ml-3 border-l border-slate-700/50 pl-3 space-y-1">
                      {/* Each Parent Agent + Their Sub-Agents */}
                      {AGENT_ORDER.filter(id => id !== "main").map(agentId => {
                        const r = AGENT_RPG_PROFILES[agentId];
                        const agentSpawns = data.spawning.spawns.filter(
                          s => s.parentId === agentId && !["completed", "recalled", "failed"].includes(s.status)
                        );
                        const maxSubs = r?.tier === "S" ? 3 : r?.tier === "A" ? 2 : 1;
                        return (
                          <div key={agentId}>
                            <div className="flex items-center gap-2 text-[10px]">
                              <span>{r?.emoji || "🤖"}</span>
                              <span className="text-slate-300 font-bold">{r?.callsign}</span>
                              <span className={`text-[9px] px-1 py-0.5 rounded ${r?.tier === "A" ? "bg-blue-500/10 text-blue-300 border border-blue-500/30" : "bg-slate-500/10 text-slate-400 border border-slate-500/30"}`}>{r?.tier}</span>
                              <span className="text-slate-600 text-[9px]">{agentSpawns.length}/{maxSubs} subs</span>
                              {agentSpawns.length > 0 && <span className="text-emerald-400 text-[9px] animate-pulse">●</span>}
                            </div>
                            {agentSpawns.length > 0 && (
                              <div className="ml-4 border-l border-dashed border-slate-700/30 pl-3 space-y-0.5 mt-0.5">
                                {agentSpawns.map(spawn => {
                                  const statusIcon = spawn.status === "active" ? "🟢" : spawn.status === "approved" ? "🟡" : spawn.status === "queued" ? "⏳" : spawn.status === "paused" ? "⏸️" : "⚪";
                                  return (
                                    <div key={spawn.spawnId} className="flex items-center gap-2 text-[9px]">
                                      <span>{statusIcon}</span>
                                      <span className="text-slate-400">{spawn.name}</span>
                                      <span className="text-slate-600">·</span>
                                      <span className="text-slate-600">{spawn.status}</span>
                                      {spawn.progressPct !== undefined && spawn.progressPct !== 0 && (
                                        <span className="text-blue-400">{spawn.progressPct}%</span>
                                      )}
                                      {spawn.autonomyLevel && (
                                        <span className="text-[8px] px-1 py-0.5 rounded bg-slate-700/50 text-slate-500">{spawn.autonomyLevel}</span>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Spawning Budget Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                  <span>Daily Sub-Agent Token Budget</span>
                  <span>{(data.spawning.meta.dailyUsed / 1000).toFixed(0)}K / {(data.spawning.meta.dailyBudget / 1000).toFixed(0)}K tokens</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      data.spawning.meta.dailyUsed / data.spawning.meta.dailyBudget > 0.8 ? "bg-red-500" :
                      data.spawning.meta.dailyUsed / data.spawning.meta.dailyBudget > 0.5 ? "bg-amber-500" : "bg-emerald-500"
                    }`}
                    style={{ width: `${Math.max(Math.min((data.spawning.meta.dailyUsed / data.spawning.meta.dailyBudget) * 100, 100), 1)}%` }}
                  />
                </div>
              </div>

              {/* Spawn Queue with Controls */}
              {data.spawning.spawns.length > 0 ? (
                <div className="space-y-2">
                  {data.spawning.spawns.map(spawn => {
                    const parentRpg = AGENT_RPG_PROFILES[spawn.parentId];
                    const statusColors: Record<string, string> = {
                      approved: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
                      active: "text-blue-400 bg-blue-500/10 border-blue-500/30",
                      queued: "text-amber-400 bg-amber-500/10 border-amber-500/30",
                      booting: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
                      paused: "text-orange-400 bg-orange-500/10 border-orange-500/30",
                      completed: "text-slate-400 bg-slate-500/10 border-slate-500/30",
                      recalled: "text-slate-500 bg-slate-500/10 border-slate-500/30",
                      requested: "text-purple-400 bg-purple-500/10 border-purple-500/30",
                      failed: "text-red-400 bg-red-500/10 border-red-500/30",
                    };
                    const budgetPct = spawn.tokenBudget > 0 ? (spawn.tokensUsed / spawn.tokenBudget) * 100 : 0;
                    const isActionable = ["requested", "queued", "approved", "active", "paused"].includes(spawn.status);
                    return (
                      <div key={spawn.spawnId} className="bg-slate-800/40 rounded-lg p-3 border border-slate-700/30">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{parentRpg?.emoji || "🤖"}</span>
                            <div>
                              <span className="text-xs font-bold text-white">{spawn.name}</span>
                              <span className="text-[10px] text-slate-500 ml-2">← {parentRpg?.callsign || spawn.parentId}</span>
                              {spawn.autonomyLevel && (
                                <span className="text-[9px] ml-2 px-1 py-0.5 rounded bg-slate-700/50 text-slate-500">
                                  {spawn.autonomyLevel}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[10px] px-2 py-0.5 rounded border ${statusColors[spawn.status] || statusColors.queued}`}>
                              {spawn.status.toUpperCase()}
                            </span>
                          </div>
                        </div>

                        <div className="text-[10px] text-slate-400 mb-2 line-clamp-1">{spawn.task}</div>

                        {/* Progress bar (if active) */}
                        {spawn.progressPct !== undefined && spawn.progressPct > 0 && (
                          <div className="mb-2">
                            <div className="flex items-center justify-between text-[9px] text-slate-500 mb-0.5">
                              <span>Progress</span>
                              <span>{spawn.progressPct}%</span>
                            </div>
                            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                              <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${spawn.progressPct}%` }} />
                            </div>
                            {spawn.lastProgressNote && (
                              <div className="text-[9px] text-slate-600 mt-0.5 italic">{spawn.lastProgressNote}</div>
                            )}
                          </div>
                        )}

                        <div className="flex items-center gap-3 text-[10px]">
                          <div className="flex items-center gap-1">
                            <span className="text-slate-600">Model:</span>
                            <span className="text-slate-400">{spawn.model.split("/")[1]}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-slate-600">Budget:</span>
                            <span className="text-slate-400">{(spawn.tokensUsed / 1000).toFixed(0)}K/{(spawn.tokenBudget / 1000).toFixed(0)}K</span>
                          </div>
                          <div className="flex-1 h-1 bg-slate-700 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${budgetPct > 80 ? "bg-red-500" : "bg-blue-500"}`} style={{ width: `${budgetPct}%` }} />
                          </div>
                        </div>

                        {/* Fallback Chain */}
                        {spawn.fallbackModels && spawn.fallbackModels.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-slate-700/20">
                            <div className="text-[9px] text-slate-600 mb-1">Fallback Chain:</div>
                            <div className="flex flex-wrap items-center gap-1">
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/20 font-mono">
                                {spawn.model.split("/")[1]}
                              </span>
                              {spawn.fallbackModels.map((fb, fi) => {
                                const prov = fb.split("/")[0];
                                const provIcon = prov === "openai" ? "🟢" : prov === "google" ? "🔵" : prov === "anthropic" ? "🟠" : "⚪";
                                return (
                                  <div key={fb} className="flex items-center gap-1">
                                    <span className="text-slate-700 text-[9px]">→</span>
                                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800/50 text-slate-500 border border-slate-700/30 font-mono">
                                      {provIcon} {fb.split("/")[1]}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {spawn.skillset.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {spawn.skillset.map(s => (
                              <span key={s} className="text-[9px] px-1.5 py-0.5 rounded-full bg-slate-700/50 text-slate-500">{s}</span>
                            ))}
                          </div>
                        )}

                        {/* Spawn Controls */}
                        {isActionable && (
                          <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-slate-700/30">
                            {(spawn.status === "requested" || spawn.status === "queued") && (
                              <button
                                onClick={async () => {
                                  await fetch("/api/spawn", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "approve_spawn", spawnId: spawn.spawnId, approvedBy: "helm" }) });
                                  refresh();
                                }}
                                className="text-[9px] px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors"
                              >Approve</button>
                            )}
                            {spawn.status === "approved" && (
                              <button
                                onClick={async () => {
                                  await fetch("/api/spawn", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "boot_spawn", spawnId: spawn.spawnId }) });
                                  refresh();
                                }}
                                className="text-[9px] px-2 py-1 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30 transition-colors"
                              >Boot</button>
                            )}
                            {spawn.status === "active" && (
                              <button
                                onClick={async () => {
                                  await fetch("/api/spawn", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "pause_spawn", spawnId: spawn.spawnId }) });
                                  refresh();
                                }}
                                className="text-[9px] px-2 py-1 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30 hover:bg-orange-500/30 transition-colors"
                              >Pause</button>
                            )}
                            {spawn.status === "paused" && (
                              <button
                                onClick={async () => {
                                  await fetch("/api/spawn", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "resume_spawn", spawnId: spawn.spawnId }) });
                                  refresh();
                                }}
                                className="text-[9px] px-2 py-1 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30 transition-colors"
                              >Resume</button>
                            )}
                            <button
                              onClick={async () => {
                                await fetch("/api/spawn", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "recall_spawn", spawnId: spawn.spawnId, reason: "manual recall from dashboard" }) });
                                refresh();
                              }}
                              className="text-[9px] px-2 py-1 rounded bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors"
                            >Recall</button>
                            {spawn.operation && (
                              <span className="text-[9px] ml-auto px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30">
                                OP: {spawn.operation}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-xs text-slate-600 py-4 text-center">No sub-agents spawned. Agents can spawn when task queue exceeds capacity.</div>
              )}

              {/* Per-Agent Spawn Capacity */}
              <div className="mt-4 pt-3 border-t border-slate-800">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2 font-medium">Fleet Spawn Capacity</div>
                <div className="grid grid-cols-7 gap-1">
                  {AGENT_ORDER.map(agentId => {
                    const r = AGENT_RPG_PROFILES[agentId];
                    const parentSpawns = data.spawning.spawns.filter(s => s.parentId === agentId && ["approved", "active", "queued", "booting"].includes(s.status));
                    const maxSubs = r?.tier === "S" ? 3 : r?.tier === "A" ? 2 : 1;
                    const canSpawn = (r?.level || 0) >= 5;
                    return (
                      <div key={agentId} className="text-center bg-slate-800/30 rounded-lg p-2">
                        <div className="text-sm mb-0.5">{r?.emoji || "🤖"}</div>
                        <div className="text-[9px] font-bold text-slate-400">{r?.callsign || agentId}</div>
                        <div className={`text-[10px] font-mono mt-1 ${parentSpawns.length > 0 ? "text-emerald-400" : "text-slate-600"}`}>
                          {parentSpawns.length}/{maxSubs}
                        </div>
                        <div className={`text-[8px] mt-0.5 ${canSpawn ? "text-emerald-500" : "text-red-400"}`}>
                          {canSpawn ? "READY" : "LVL <5"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Governance Info */}
              <div className="mt-4 pt-3 border-t border-slate-800">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2 font-medium">Autonomy Governance</div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px]">
                  <div className="bg-slate-800/30 rounded p-2 text-center">
                    <div className="text-slate-400 font-bold">A0</div>
                    <div className="text-[9px] text-slate-600">Locked</div>
                  </div>
                  <div className="bg-blue-500/10 rounded p-2 text-center border border-blue-500/20">
                    <div className="text-blue-400 font-bold">A1</div>
                    <div className="text-[9px] text-slate-500">Scoped</div>
                  </div>
                  <div className="bg-slate-800/30 rounded p-2 text-center">
                    <div className="text-emerald-400 font-bold">A2</div>
                    <div className="text-[9px] text-slate-600">Extended</div>
                  </div>
                  <div className="bg-slate-800/30 rounded p-2 text-center">
                    <div className="text-purple-400 font-bold">A3</div>
                    <div className="text-[9px] text-slate-600">Delegator</div>
                  </div>
                </div>
                <div className="text-[9px] text-slate-600 mt-2 space-y-0.5">
                  <div>Budget enforcement: 80% warning → 95% wrap-up → 100% auto-recall</div>
                  <div>Stall detection: No progress 1h → parent alert · 2h → HELM escalation · 3h → auto-recall</div>
                  <div>Max depth: 1 (sub-agents cannot spawn their own subs)</div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Cron Schedule for Current Agent */}
        <Card title={`${currentAgent.name} CRON SCHEDULE`} badge={<Badge variant="green">{agentCrons.filter(j => j.enabled).length} active</Badge>}>
          <div className="divide-y divide-slate-800">
            {agentCrons.map((job, idx) => (
              <CronJobRow key={job.jobId || `cron-${idx}`} job={job} showActions onToggle={handleToggleCron} onTrigger={handleTriggerCron} />
            ))}
            {agentCrons.length === 0 && <div className="text-xs text-slate-600 py-4 text-center">No cron jobs assigned to {currentAgent.name}</div>}
          </div>
        </Card>

        {/* Agent Command Console */}
        <Card title="AGENT COMMAND CONSOLE" badge={<Badge variant="blue">Direct Message</Badge>}>
          <div className="flex items-center gap-3">
            <select
              value={messageAgent}
              onChange={e => setMessageAgent(e.target.value)}
              className="bg-slate-800 border border-card-border rounded-lg px-3 py-2 text-xs text-slate-300 flex-shrink-0"
            >
              <option value="">Select agent...</option>
              {agents.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
            <input
              type="text"
              value={messageText}
              onChange={e => setMessageText(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSendMessage()}
              placeholder="Type a command for the agent..."
              className="flex-1 bg-slate-800 border border-card-border rounded-lg px-3 py-2 text-xs text-slate-300 placeholder-slate-600"
            />
            <button
              onClick={handleSendMessage}
              disabled={!messageAgent || !messageText.trim() || sending}
              className="px-4 py-2 rounded-lg text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30 disabled:opacity-30 transition-colors"
            >
              {sending ? "Sending..." : "Send"}
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
