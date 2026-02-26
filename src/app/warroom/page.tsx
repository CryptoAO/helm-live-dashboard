"use client";
import { useState, useMemo } from "react";
import { useDashboard } from "@/hooks/use-dashboard";
import { useGateway } from "@/hooks/use-gateway";
import { PageHeader } from "@/components/layout/page-header";
import { Card, Badge } from "@/components/shared";
import { WarRoomBubble } from "@/components/domain";
import { WAR_ROOM_CATEGORIES, AGENT_NAMES, AGENT_COLORS } from "@/lib/data/types";

export default function WarRoomPage() {
  const { data, loading, refresh } = useDashboard();
  const gateway = useGateway();
  const [category, setCategory] = useState<string>("ALL");
  const [agentFilter, setAgentFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(50);

  const warRoom = data?.warRoom ?? [];

  const entries = useMemo(() => {
    let filtered = warRoom;
    if (category !== "ALL") filtered = filtered.filter(e => e.category === category);
    if (agentFilter !== "ALL") filtered = filtered.filter(e => e.agentId === agentFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(e => e.summary.toLowerCase().includes(q) || e.agentName.toLowerCase().includes(q));
    }
    return filtered;
  }, [warRoom, category, agentFilter, search]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: warRoom.length };
    warRoom.forEach(e => { counts[e.category] = (counts[e.category] || 0) + 1; });
    return counts;
  }, [warRoom]);

  if (loading && !data) {
    return <div className="flex items-center justify-center h-full text-slate-500 text-sm">Loading war room...</div>;
  }
  if (!data) return null;

  const activeAgents = gateway.activeAgents;

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="The War Room"
        subtitle={`${warRoom.length} entries · Fleet activity log`}
        icon="🏛️"
        gatewayState={gateway.connectionState}
        actions={<button onClick={refresh} className="text-xs px-3 py-1.5 rounded-lg border border-card-border text-slate-400 hover:text-slate-200 transition-colors">Refresh</button>}
      />

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {/* Active Build Indicators */}
        {activeAgents.length > 0 && (
          <div className="flex items-center gap-2 p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-emerald-400 font-semibold">LIVE</span>
            <span className="text-xs text-slate-400">Active now:</span>
            <div className="flex items-center gap-2 flex-wrap">
              {activeAgents.map(agentId => {
                const colors = AGENT_COLORS[agentId];
                const name = AGENT_NAMES[agentId] || agentId.toUpperCase();
                return (
                  <span
                    key={agentId}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      colors
                        ? `${colors.bg} ${colors.text} ${colors.border}`
                        : "bg-slate-800 text-slate-300 border-slate-700"
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {name}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search entries..."
            className="bg-slate-800 border border-card-border rounded-lg px-3 py-1.5 text-xs text-slate-300 placeholder-slate-600 w-48"
          />

          {/* Category tabs */}
          <div className="flex items-center gap-1 flex-wrap">
            {WAR_ROOM_CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`text-[10px] px-2 py-1 rounded-full border transition-colors ${
                  category === cat
                    ? "bg-blue-500/15 text-blue-400 border-blue-500/30"
                    : "border-card-border text-slate-500 hover:text-slate-300"
                }`}
              >
                {cat} {categoryCounts[cat] ? `(${categoryCounts[cat]})` : ""}
              </button>
            ))}
          </div>

          {/* Agent filter */}
          <select
            value={agentFilter}
            onChange={e => setAgentFilter(e.target.value)}
            className="bg-slate-800 border border-card-border rounded-lg px-2 py-1.5 text-[10px] text-slate-400"
          >
            <option value="ALL">All Agents</option>
            {Object.entries(AGENT_NAMES).map(([id, name]) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </select>
        </div>

        {/* Results count */}
        <div className="text-[10px] text-slate-600">
          Showing {Math.min(visibleCount, entries.length)} of {entries.length} entries
        </div>

        {/* Entries */}
        <Card>
          <div className="divide-y divide-slate-800/50">
            {entries.slice(0, visibleCount).map((entry, i) => (
              <WarRoomBubble key={`${entry.id}-${i}`} entry={entry} isLive={activeAgents.includes(entry.agentId)} />
            ))}
            {entries.length === 0 && (
              <div className="text-xs text-slate-600 py-8 text-center">No entries match your filters</div>
            )}
          </div>
          {entries.length > visibleCount && (
            <button
              onClick={() => setVisibleCount(v => v + 50)}
              className="w-full text-xs text-slate-500 hover:text-slate-300 py-3 border-t border-slate-800"
            >
              Load more ({entries.length - visibleCount} remaining)
            </button>
          )}
        </Card>
      </div>
    </div>
  );
}
