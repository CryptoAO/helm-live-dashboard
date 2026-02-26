"use client";
import { useState } from "react";
import { useDashboard } from "@/hooks/use-dashboard";
import { useGateway } from "@/hooks/use-gateway";
import { PageHeader } from "@/components/layout/page-header";
import { Card, Badge, Modal, AgentAvatar } from "@/components/shared";
import { AgentCard, CronJobRow } from "@/components/domain";
import type { AgentInfo, CronJob } from "@/lib/data/types";
import { AGENT_COLORS } from "@/lib/data/types";

const AGENT_PROFILES: Record<string, { persona: string; description: string; strengths: string[] }> = {
  main:    { persona: "Steve Jobs", description: "Commander & Refiner — orchestrates the fleet, refines ideas into executable plans", strengths: ["Strategic vision", "Product refinement", "Fleet coordination", "Decision making"] },
  eagle:   { persona: "Elon Musk", description: "The Visionary — scans for opportunities, identifies market gaps, generates intelligence", strengths: ["Intelligence gathering", "Opportunity spotting", "Income ideation", "Regulatory monitoring"] },
  anchor:  { persona: "Charlie Munger", description: "The Checker — validates everything, assesses risks, manages crew operations", strengths: ["Risk assessment", "Operational validation", "Crew management", "Compliance checking"] },
  beacon:  { persona: "Ruth Bader Ginsburg", description: "The Builder — legal compliance, deadline tracking, implementation feasibility", strengths: ["Legal compliance", "Deadline management", "Implementation planning", "Regulatory analysis"] },
  compass: { persona: "Ray Dalio", description: "The Learner — analytics, performance scoring, self-improvement protocols", strengths: ["Data analysis", "Performance scoring", "Principle-based evaluation", "Self-improvement"] },
  signal:  { persona: "Jeff Bezos", description: "The Shipper — communications, delivery, stakeholder management", strengths: ["Communication packaging", "Stakeholder delivery", "Market validation", "Template management"] },
  spark:   { persona: "Gary Vaynerchuk", description: "Growth Hacker — content creation, GTM strategy, revenue acceleration", strengths: ["Content creation", "Go-to-market strategy", "Growth hacking", "Revenue acceleration"] },
};

export default function FleetPage() {
  const { data, loading, refresh } = useDashboard();
  const gateway = useGateway();
  const [selectedAgent, setSelectedAgent] = useState<AgentInfo | null>(null);
  const [messageAgent, setMessageAgent] = useState<string>("");
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);

  if (loading && !data) {
    return <div className="flex items-center justify-center h-full text-slate-500 text-sm">Loading fleet...</div>;
  }
  if (!data) return null;

  const handleToggleCron = async (jobId: string, enabled: boolean) => {
    try {
      await fetch("/api/cron", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle", jobId, enabled }),
      });
      refresh();
    } catch (e) {
      console.error("Failed to toggle:", e);
    }
  };

  const handleTriggerCron = async (jobId: string) => {
    try {
      await fetch("/api/cron", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "trigger", jobId }),
      });
    } catch (e) {
      console.error("Failed to trigger:", e);
    }
  };

  const handleSendMessage = async () => {
    if (!messageAgent || !messageText.trim()) return;
    setSending(true);
    try {
      await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId: messageAgent, message: messageText }),
      });
      setMessageText("");
      setMessageAgent("");
    } catch (e) {
      console.error("Failed to send:", e);
    } finally {
      setSending(false);
    }
  };

  const agentCrons = (agentId: string) =>
    data.cronJobs.filter(j => j.agentId === agentId).sort((a, b) => (a.nextRunAt || "").localeCompare(b.nextRunAt || ""));

  const profile = selectedAgent ? AGENT_PROFILES[selectedAgent.id] : null;

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Fleet Command"
        subtitle={`7 Agents · ${data.agents.filter(a => a.activityStatus === "active").length} active · ${data.cronJobs.filter(j => j.enabled).length} cron jobs`}
        icon="🤖"
        gatewayState={gateway.connectionState}
        gatewayPid={data.gateway.pid}
        actions={<button onClick={refresh} className="text-xs px-3 py-1.5 rounded-lg border border-card-border text-slate-400 hover:text-slate-200 transition-colors">Refresh</button>}
      />

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {/* Agent Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {data.agents.map(agent => (
            <AgentCard key={agent.id} agent={agent} onClick={() => setSelectedAgent(agent)} />
          ))}
        </div>

        {/* Agent Command Console */}
        <Card title="AGENT COMMAND CONSOLE" badge={<Badge variant="blue">Direct Message</Badge>}>
          <div className="flex items-center gap-3">
            <select
              value={messageAgent}
              onChange={e => setMessageAgent(e.target.value)}
              className="bg-slate-800 border border-card-border rounded-lg px-3 py-2 text-xs text-slate-300 flex-shrink-0"
            >
              <option value="">Select agent...</option>
              {data.agents.map(a => (
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

        {/* Cron Manager */}
        <Card title="CRON SCHEDULE" badge={<Badge variant="green">{data.cronJobs.filter(j => j.enabled).length} active</Badge>}>
          <div className="divide-y divide-slate-800">
            {data.cronJobs
              .sort((a, b) => (a.nextRunAt || "z").localeCompare(b.nextRunAt || "z"))
              .map((job, idx) => (
                <CronJobRow
                  key={job.jobId || `cron-${idx}`}
                  job={job}
                  showActions
                  onToggle={handleToggleCron}
                  onTrigger={handleTriggerCron}
                />
              ))}
          </div>
        </Card>
      </div>

      {/* Agent Detail Modal */}
      <Modal open={!!selectedAgent} onClose={() => setSelectedAgent(null)} title={selectedAgent?.name} width="max-w-3xl">
        {selectedAgent && profile && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <AgentAvatar agentId={selectedAgent.id} size="lg" />
              <div>
                <div className="text-sm text-slate-300">{profile.persona} persona</div>
                <div className="text-xs text-slate-500">{profile.description}</div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-400 mb-2">Strengths</h4>
              <div className="flex flex-wrap gap-1.5">
                {profile.strengths.map(s => (
                  <Badge key={s} variant="blue">{s}</Badge>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div><span className="text-slate-500">Status:</span> <Badge variant={selectedAgent.activityStatus === "active" ? "green" : "gray"}>{selectedAgent.activityStatus}</Badge></div>
              <div><span className="text-slate-500">Cron Jobs:</span> <span className="text-slate-300">{selectedAgent.cronJobCount}</span></div>
              <div><span className="text-slate-500">Last Action:</span> <span className="text-slate-300">{selectedAgent.lastAction || "—"}</span></div>
              <div><span className="text-slate-500">Next:</span> <span className="text-slate-300">{selectedAgent.nextScheduledName || "—"}</span></div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-400 mb-2">Assigned Cron Jobs</h4>
              <div className="divide-y divide-slate-800">
                {agentCrons(selectedAgent.id).map(job => (
                  <CronJobRow key={job.jobId} job={job} showActions onToggle={handleToggleCron} onTrigger={handleTriggerCron} />
                ))}
                {agentCrons(selectedAgent.id).length === 0 && (
                  <div className="text-xs text-slate-600 py-2">No cron jobs assigned</div>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
