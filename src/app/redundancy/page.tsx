"use client";
import { useState, useEffect, useCallback } from "react";
import type {
  RedundancyData,
  ProviderHealth,
  AgentFallbackChain,
  FailoverEvent,
} from "@/lib/data/types";
import { AGENT_COLORS, AGENT_NAMES } from "@/lib/data/types";

const PROVIDER_ICONS: Record<string, string> = {
  anthropic: "🟠",
  openai: "🟢",
  google: "🔵",
};

const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  online: { bg: "bg-emerald-500/10", text: "text-emerald-400", dot: "bg-emerald-400" },
  degraded: { bg: "bg-amber-500/10", text: "text-amber-400", dot: "bg-amber-400" },
  offline: { bg: "bg-red-500/10", text: "text-red-400", dot: "bg-red-400" },
  unknown: { bg: "bg-slate-500/10", text: "text-slate-400", dot: "bg-slate-400" },
};

export default function RedundancyPage() {
  const [data, setData] = useState<RedundancyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoFailover, setAutoFailover] = useState(true);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" | "info" } | null>(null);
  const [isCloudMode, setIsCloudMode] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard");
      const dash = await res.json();
      if (dash.redundancy) {
        setData(dash.redundancy);
        setAutoFailover(dash.redundancy.autoFailoverEnabled);
      }
    } catch { /* */ }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
    const iv = setInterval(fetchData, 15000);
    return () => clearInterval(iv);
  }, [fetchData]);

  function showToast(msg: string, type: "ok" | "err" | "info" = "ok") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  }

  function handleCloudMode(r: { cloudMode?: boolean; error?: string }) {
    if (r.cloudMode) {
      setIsCloudMode(true);
      showToast("Cloud mode — read-only view. Use local dashboard for live controls.", "info");
      return true;
    }
    return false;
  }

  async function toggleAutoFailover() {
    if (isCloudMode) { showToast("Read-only in cloud mode", "info"); return; }
    setActionInProgress("toggle");
    try {
      const res = await fetch("/api/failover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle_auto_failover" }),
      });
      const r = await res.json();
      if (handleCloudMode(r)) { setActionInProgress(null); return; }
      if (r.ok) {
        setAutoFailover(r.autoFailoverEnabled);
        showToast(`Auto-failover ${r.autoFailoverEnabled ? "ENABLED" : "DISABLED"}`);
      } else showToast(r.error, "err");
    } catch (e) { showToast(String(e), "err"); }
    setActionInProgress(null);
  }

  async function manualFailover(agentId: string, toModel: string) {
    if (isCloudMode) { showToast("Read-only in cloud mode", "info"); return; }
    setActionInProgress(`failover-${agentId}`);
    try {
      const res = await fetch("/api/failover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "manual_failover", agentId, toModel }),
      });
      const r = await res.json();
      if (handleCloudMode(r)) { setActionInProgress(null); return; }
      if (r.ok) {
        showToast(`${agentId.toUpperCase()} → ${toModel.split("/")[1]}`);
        fetchData();
      } else showToast(r.error, "err");
    } catch (e) { showToast(String(e), "err"); }
    setActionInProgress(null);
  }

  async function restorePrimary(agentId: string) {
    if (isCloudMode) { showToast("Read-only in cloud mode", "info"); return; }
    setActionInProgress(`restore-${agentId}`);
    try {
      const res = await fetch("/api/failover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "restore_primary", agentId }),
      });
      const r = await res.json();
      if (handleCloudMode(r)) { setActionInProgress(null); return; }
      if (r.ok) {
        showToast(`${agentId.toUpperCase()} restored to ${r.toModel.split("/")[1]}`);
        fetchData();
      } else showToast(r.error, "err");
    } catch (e) { showToast(String(e), "err"); }
    setActionInProgress(null);
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-slate-500 text-sm animate-pulse">Loading redundancy data...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-red-400 text-sm">Failed to load redundancy data</div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-4 md:p-6 space-y-6 pb-24 md:pb-6">
      {/* Cloud Mode Banner */}
      {isCloudMode && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg px-4 py-2.5 flex items-center gap-2 text-xs text-blue-300">
          <span>☁️</span>
          <span><strong>Cloud Mode</strong> — Viewing snapshot data. Failover controls require the local dashboard with gateway running.</span>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg text-sm font-medium shadow-lg ${
          toast.type === "ok" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
            : toast.type === "info" ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
            : "bg-red-500/20 text-red-300 border border-red-500/30"
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-200 flex items-center gap-2">
            🛡️ AI Redundancy Center
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {data.totalProvidersOnline} provider{data.totalProvidersOnline !== 1 ? "s" : ""} online · {data.totalModelsAvailable} models available · {data.globalFallbackChain.length} models in fallback chain
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleAutoFailover}
            disabled={actionInProgress === "toggle"}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              autoFailover
                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25"
                : "bg-red-500/15 text-red-400 border-red-500/30 hover:bg-red-500/25"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${autoFailover ? "bg-emerald-400 animate-pulse" : "bg-red-400"}`} />
            Auto-Failover: {autoFailover ? "ON" : "OFF"}
          </button>
        </div>
      </div>

      {/* Provider Health Cards */}
      <section>
        <h2 className="text-xs uppercase tracking-wider text-slate-500 mb-3 font-medium">Provider Health</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {data.providers.map((p) => (
            <ProviderCard key={p.provider} provider={p} />
          ))}
        </div>
      </section>

      {/* Global Fallback Chain */}
      <section>
        <h2 className="text-xs uppercase tracking-wider text-slate-500 mb-3 font-medium">Global Fallback Chain</h2>
        <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-4">
          <div className="flex flex-wrap items-center gap-1.5">
            {data.globalFallbackChain.map((model, i) => {
              const prov = model.split("/")[0];
              const modelName = model.split("/")[1];
              const icon = PROVIDER_ICONS[prov] || "⚪";
              const providerOnline = data.providers.find(p => p.provider === prov)?.status === "online";
              return (
                <div key={model} className="flex items-center gap-1.5">
                  {i > 0 && <span className="text-slate-700 text-xs">→</span>}
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono border ${
                      i === 0
                        ? "bg-blue-500/15 border-blue-500/30 text-blue-300"
                        : providerOnline
                          ? "bg-slate-800/50 border-slate-700/50 text-slate-400"
                          : "bg-red-500/10 border-red-500/20 text-red-400 line-through opacity-50"
                    }`}
                  >
                    <span>{icon}</span>
                    {modelName}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="text-[10px] text-slate-600 mt-2">
            When a provider hits rate limits or errors, the system automatically tries the next model in the chain.
          </p>
        </div>
      </section>

      {/* Agent Fallback Matrix */}
      <section>
        <h2 className="text-xs uppercase tracking-wider text-slate-500 mb-3 font-medium">Agent Fallback Matrix</h2>
        <div className="space-y-2">
          {data.agentChains.map((chain) => (
            <AgentChainRow
              key={chain.agentId}
              chain={chain}
              providers={data.providers}
              globalChain={data.globalFallbackChain}
              onFailover={manualFailover}
              onRestore={restorePrimary}
              actionInProgress={actionInProgress}
            />
          ))}
        </div>
      </section>

      {/* Failover History */}
      <section>
        <h2 className="text-xs uppercase tracking-wider text-slate-500 mb-3 font-medium">
          Failover History ({data.failoverHistory.length})
        </h2>
        {data.failoverHistory.length === 0 ? (
          <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6 text-center">
            <p className="text-slate-600 text-xs">No failover events recorded yet.</p>
            <p className="text-slate-700 text-[10px] mt-1">Events will appear here when providers are switched — automatically or manually.</p>
          </div>
        ) : (
          <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl overflow-hidden">
            <div className="divide-y divide-slate-800/50">
              {data.failoverHistory.slice(0, 20).map((event, i) => (
                <FailoverEventRow key={i} event={event} />
              ))}
            </div>
          </div>
        )}
      </section>

      {/* How It Works */}
      <section>
        <details className="bg-slate-900/30 border border-slate-800/40 rounded-xl">
          <summary className="px-4 py-3 text-xs text-slate-400 cursor-pointer hover:text-slate-300 font-medium">
            HOW AUTO-FAILOVER WORKS
          </summary>
          <div className="px-4 pb-4 text-[11px] text-slate-500 space-y-2">
            <p>
              <strong className="text-slate-400">Rate Limit Detection:</strong> When any agent receives a 429 (rate limit) or 503 (service unavailable) error from its primary provider, the failover system activates.
            </p>
            <p>
              <strong className="text-slate-400">Cascade Logic:</strong> The system walks through the agent&apos;s fallback chain. If the agent has a custom chain, that&apos;s used. Otherwise, the global fallback chain applies. The first model from an online provider is selected.
            </p>
            <p>
              <strong className="text-slate-400">Cooldown Period:</strong> After a failover, there&apos;s a 60-second cooldown before another failover can trigger for the same agent. This prevents rapid oscillation.
            </p>
            <p>
              <strong className="text-slate-400">Auto-Restore:</strong> Every 5 minutes, the system checks if the primary provider is back online. If so, agents are automatically restored to their primary model.
            </p>
            <p>
              <strong className="text-slate-400">Manual Override:</strong> You can manually switch any agent to any available model at any time, or restore it to its default primary.
            </p>
          </div>
        </details>
      </section>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────

function ProviderCard({ provider: p }: { provider: ProviderHealth }) {
  const sc = STATUS_COLORS[p.status];
  const icon = PROVIDER_ICONS[p.provider] || "⚪";

  return (
    <div className={`rounded-xl border p-4 ${sc.bg} border-slate-800/50`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <div>
            <div className="text-sm font-medium text-slate-200">{p.label}</div>
            <div className="text-[10px] text-slate-500">{p.models.length} model{p.models.length !== 1 ? "s" : ""}</div>
          </div>
        </div>
        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium ${sc.bg} ${sc.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot} ${p.status === "online" ? "animate-pulse" : ""}`} />
          {p.status.toUpperCase()}
        </div>
      </div>

      {/* Credentials */}
      <div className="flex items-center gap-1.5 mb-2">
        <span className={`text-[10px] ${p.hasCredentials ? "text-emerald-400" : "text-red-400"}`}>
          {p.hasCredentials ? "✓ Credentials configured" : "✗ No credentials"}
        </span>
      </div>

      {/* Models */}
      <div className="space-y-1">
        {p.models.map((m) => (
          <div
            key={m.id}
            className="flex items-center justify-between px-2 py-1 rounded bg-slate-800/30 text-[10px]"
          >
            <span className="text-slate-300 font-mono">{m.label}</span>
            {m.default && <span className="text-blue-400 text-[9px]">DEFAULT</span>}
          </div>
        ))}
      </div>

      {/* Rate limit info */}
      {p.rateLimitHits24h > 0 && (
        <div className="mt-2 px-2 py-1 rounded bg-amber-500/10 text-[10px] text-amber-400">
          ⚠ {p.rateLimitHits24h} rate limit hit{p.rateLimitHits24h !== 1 ? "s" : ""} in 24h
        </div>
      )}
    </div>
  );
}

function AgentChainRow({
  chain,
  providers,
  globalChain,
  onFailover,
  onRestore,
  actionInProgress,
}: {
  chain: AgentFallbackChain;
  providers: ProviderHealth[];
  globalChain: string[];
  onFailover: (agentId: string, toModel: string) => void;
  onRestore: (agentId: string) => void;
  actionInProgress: string | null;
}) {
  const [expanded, setExpanded] = useState(false);
  const ac = AGENT_COLORS[chain.agentId] || AGENT_COLORS.main;
  const agentName = AGENT_NAMES[chain.agentId] || chain.agentName;
  const currentProv = chain.currentModel.split("/")[0];
  const currentModelName = chain.currentModel.split("/")[1];
  const provIcon = PROVIDER_ICONS[currentProv] || "⚪";
  const fallbacks = chain.fallbacks.length > 0 ? chain.fallbacks : globalChain;

  // Find next available fallback that isn't the current model
  const onlineProviders = new Set(providers.filter(p => p.status === "online" || p.status === "degraded").map(p => p.provider));
  const nextFallback = fallbacks.find(m => m !== chain.currentModel && onlineProviders.has(m.split("/")[0]));

  return (
    <div className={`rounded-xl border ${ac.border} bg-slate-900/40 overflow-hidden`}>
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-slate-800/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${ac.bg} ${ac.text}`}>
            {ac.letter}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${ac.text}`}>{agentName}</span>
              {chain.isOnFallback && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-amber-500/15 text-amber-400 border border-amber-500/20">
                  FALLBACK
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
              <span>{provIcon}</span>
              <span className="font-mono">{currentModelName}</span>
              {chain.isOnFallback && (
                <span className="text-slate-600">
                  (primary: {chain.primaryModel.split("/")[1]})
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {chain.isOnFallback && (
            <button
              onClick={(e) => { e.stopPropagation(); onRestore(chain.agentId); }}
              disabled={!!actionInProgress}
              className="px-2 py-1 rounded text-[10px] font-medium bg-blue-500/15 text-blue-400 border border-blue-500/20 hover:bg-blue-500/25 transition-colors cursor-pointer"
            >
              Restore Primary
            </button>
          )}
          {nextFallback && !chain.isOnFallback && (
            <button
              onClick={(e) => { e.stopPropagation(); onFailover(chain.agentId, nextFallback); }}
              disabled={!!actionInProgress}
              className="px-2 py-1 rounded text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors cursor-pointer"
            >
              Failover →
            </button>
          )}
          <span className="text-slate-600 text-xs">{expanded ? "▴" : "▾"}</span>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-3 border-t border-slate-800/50">
          <div className="mt-2 mb-1 text-[10px] text-slate-500 uppercase tracking-wider">Fallback Chain</div>
          <div className="flex flex-wrap items-center gap-1">
            {fallbacks.map((model, i) => {
              const mp = model.split("/")[0];
              const mn = model.split("/")[1];
              const mIcon = PROVIDER_ICONS[mp] || "⚪";
              const isOnline = onlineProviders.has(mp);
              const isCurrent = model === chain.currentModel;
              return (
                <div key={model} className="flex items-center gap-1">
                  {i > 0 && <span className="text-slate-700 text-[10px]">→</span>}
                  <button
                    onClick={() => !isCurrent && isOnline && onFailover(chain.agentId, model)}
                    disabled={isCurrent || !isOnline || !!actionInProgress}
                    className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono border transition-colors ${
                      isCurrent
                        ? "bg-blue-500/20 border-blue-500/30 text-blue-300"
                        : isOnline
                          ? "bg-slate-800/50 border-slate-700/50 text-slate-400 hover:bg-slate-700/50 cursor-pointer"
                          : "bg-red-500/10 border-red-500/20 text-red-400 line-through opacity-40 cursor-not-allowed"
                    }`}
                  >
                    <span>{mIcon}</span>{mn}
                    {isCurrent && <span className="text-[8px] text-blue-400">●</span>}
                  </button>
                </div>
              );
            })}
          </div>

          {chain.lastFailoverAt && (
            <div className="mt-2 text-[10px] text-slate-600">
              Last failover: {chain.lastFailoverAt.replace("T", " ").slice(0, 19)} — {chain.lastFailoverReason}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FailoverEventRow({ event }: { event: FailoverEvent }) {
  const fromProv = event.fromModel.split("/")[0];
  const toProv = event.toModel.split("/")[0];
  const ac = AGENT_COLORS[event.agentId] || AGENT_COLORS.main;

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 text-[11px]">
      <div className={`w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold ${ac.bg} ${ac.text}`}>
        {ac.letter}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`font-medium ${ac.text}`}>{event.agentName}</span>
          <span className="text-slate-600 font-mono text-[10px]">
            {PROVIDER_ICONS[fromProv]} {event.fromModel.split("/")[1]} → {PROVIDER_ICONS[toProv]} {event.toModel.split("/")[1]}
          </span>
        </div>
        <div className="text-slate-600 text-[10px] truncate">{event.reason}</div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className={`px-1.5 py-0.5 rounded text-[9px] ${
          event.automatic ? "bg-blue-500/10 text-blue-400" : "bg-slate-800 text-slate-400"
        }`}>
          {event.automatic ? "AUTO" : "MANUAL"}
        </span>
        <span className="text-slate-600 text-[10px]">
          {event.timestamp.replace("T", " ").slice(0, 19)}
        </span>
      </div>
    </div>
  );
}
