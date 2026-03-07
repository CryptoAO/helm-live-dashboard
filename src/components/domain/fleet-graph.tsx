"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import * as d3 from "d3";
import type { AgentInfo } from "@/lib/data/types";
import { AGENT_RPG_PROFILES } from "@/lib/data/agent-profiles";

type GraphNode = {
  id: string;
  label: string;
  emoji: string;
  color: string;
  glow: string;
  role: string;
  tier: string;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
};

type GraphLink = {
  source: string | GraphNode;
  target: string | GraphNode;
  label: string;
  type: "command" | "data" | "delegate" | "reports";
};

const GRAPH_NODES: GraphNode[] = [
  // DOO (external node)
  { id: "doo", label: "DOO", emoji: "👤", color: "#f59e0b", glow: "rgba(245,158,11,0.4)", role: "Director of Operations", tier: "HUMAN" },
  // Core agents
  { id: "main", label: "HELM", emoji: "⚓", color: "#3b82f6", glow: "rgba(59,130,246,0.4)", role: "Command & Coordination", tier: "S" },
  { id: "eagle", label: "EAGLE", emoji: "🦅", color: "#eab308", glow: "rgba(234,179,8,0.4)", role: "Intelligence & Monitoring", tier: "A" },
  { id: "anchor", label: "ANCHOR", emoji: "⚓", color: "#06b6d4", glow: "rgba(6,182,212,0.4)", role: "Crewing Operations", tier: "A" },
  { id: "beacon", label: "BEACON", emoji: "🔔", color: "#ef4444", glow: "rgba(239,68,68,0.4)", role: "Legal & P&I", tier: "A" },
  { id: "compass", label: "COMPASS", emoji: "📊", color: "#8b5cf6", glow: "rgba(139,92,246,0.4)", role: "Data & Reporting", tier: "A" },
  { id: "signal", label: "SIGNAL", emoji: "📡", color: "#10b981", glow: "rgba(16,185,129,0.4)", role: "Communications", tier: "A" },
  { id: "spark", label: "SPARK", emoji: "⚡", color: "#f97316", glow: "rgba(249,115,22,0.4)", role: "Content & Growth", tier: "B" },
];

const GRAPH_LINKS: GraphLink[] = [
  // DOO ↔ HELM
  { source: "doo", target: "main", label: "T3 approval", type: "command" },
  // HELM → all agents (command)
  { source: "main", target: "eagle", label: "delegates", type: "delegate" },
  { source: "main", target: "anchor", label: "delegates", type: "delegate" },
  { source: "main", target: "beacon", label: "delegates", type: "delegate" },
  { source: "main", target: "compass", label: "delegates", type: "delegate" },
  { source: "main", target: "signal", label: "delegates", type: "delegate" },
  { source: "main", target: "spark", label: "delegates", type: "delegate" },
  // Agents report back
  { source: "eagle", target: "main", label: "intel feed", type: "reports" },
  { source: "anchor", target: "main", label: "crew status", type: "reports" },
  { source: "beacon", target: "main", label: "legal alerts", type: "reports" },
  { source: "compass", target: "main", label: "KPI reports", type: "reports" },
  // Cross-agent data flows
  { source: "eagle", target: "anchor", label: "vessel risk", type: "data" },
  { source: "eagle", target: "beacon", label: "legal intel", type: "data" },
  { source: "anchor", target: "beacon", label: "crew cases", type: "data" },
  { source: "compass", target: "signal", label: "report data", type: "data" },
  { source: "beacon", target: "signal", label: "legal drafts", type: "data" },
  { source: "spark", target: "signal", label: "content", type: "data" },
];

const LINK_COLORS: Record<string, string> = {
  command: "#f59e0b",
  delegate: "#3b82f6",
  reports: "#10b981",
  data: "#6b7280",
};

type SelectedNode = GraphNode & {
  agent?: AgentInfo;
  cronCount: number;
  model: string;
  lastPulse: string;
};

export function FleetGraph({ agents, cronJobs }: { agents: AgentInfo[]; cronJobs: { agentId: string; enabled: boolean }[] }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const simulationRef = useRef<d3.Simulation<GraphNode, GraphLink> | null>(null);
  const [selected, setSelected] = useState<SelectedNode | null>(null);
  const [dimensions, setDimensions] = useState({ w: 800, h: 500 });

  const getNodeInfo = useCallback((nodeId: string): SelectedNode => {
    const node = GRAPH_NODES.find(n => n.id === nodeId)!;
    const agent = agents.find(a => a.id === nodeId);
    const cronCount = cronJobs.filter(j => j.agentId === nodeId && j.enabled).length;
    const rpg = AGENT_RPG_PROFILES[nodeId];
    return {
      ...node,
      agent,
      cronCount,
      model: rpg ? (nodeId === "beacon" ? "claude-opus-4-6" : nodeId === "main" ? "claude-sonnet-4-6" : "claude-sonnet-4-6") : "—",
      lastPulse: agent?.lastActionTime ? new Date(agent.lastActionTime).toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" }) : "Unknown",
    };
  }, [agents, cronJobs]);

  useEffect(() => {
    const obs = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setDimensions({ w: width, h: Math.max(height, 420) });
    });
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!svgRef.current) return;
    const { w, h } = dimensions;

    // Clear
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("width", w)
      .attr("height", h)
      .attr("viewBox", `0 0 ${w} ${h}`);

    // Defs: glows + arrowheads
    const defs = svg.append("defs");
    GRAPH_NODES.forEach(n => {
      const filter = defs.append("filter").attr("id", `glow-${n.id}`).attr("x", "-50%").attr("y", "-50%").attr("width", "200%").attr("height", "200%");
      filter.append("feGaussianBlur").attr("stdDeviation", "4").attr("result", "coloredBlur");
      const merge = filter.append("feMerge");
      merge.append("feMergeNode").attr("in", "coloredBlur");
      merge.append("feMergeNode").attr("in", "SourceGraphic");
    });

    // Arrowhead marker
    Object.entries(LINK_COLORS).forEach(([type, color]) => {
      defs.append("marker")
        .attr("id", `arrow-${type}`)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 28)
        .attr("refY", 0)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M0,-5L10,0L0,5")
        .attr("fill", color)
        .attr("opacity", 0.7);
    });

    // Background grid
    const grid = svg.append("g").attr("class", "grid").attr("opacity", 0.05);
    for (let x = 0; x < w; x += 40) {
      grid.append("line").attr("x1", x).attr("y1", 0).attr("x2", x).attr("y2", h).attr("stroke", "#fff");
    }
    for (let y = 0; y < h; y += 40) {
      grid.append("line").attr("x1", 0).attr("y1", y).attr("x2", w).attr("y2", y).attr("stroke", "#fff");
    }

    const nodes: GraphNode[] = GRAPH_NODES.map(n => ({ ...n }));
    const links: GraphLink[] = GRAPH_LINKS.map(l => ({ ...l }));

    // Pin DOO top-center and HELM center
    const helmNode = nodes.find(n => n.id === "main")!;
    const dooNode = nodes.find(n => n.id === "doo")!;
    helmNode.fx = w / 2;
    helmNode.fy = h / 2;
    dooNode.fx = w / 2;
    dooNode.fy = 60;

    const simulation = d3.forceSimulation<GraphNode>(nodes)
      .force("link", d3.forceLink<GraphNode, GraphLink>(links).id(d => d.id).distance(d => {
        if ((d.source as GraphNode).id === "doo" || (d.target as GraphNode).id === "doo") return 110;
        if ((d.source as GraphNode).id === "main" || (d.target as GraphNode).id === "main") return 150;
        return 180;
      }).strength(0.6))
      .force("charge", d3.forceManyBody().strength(-400))
      .force("center", d3.forceCenter(w / 2, h / 2))
      .force("collision", d3.forceCollide(50));

    simulationRef.current = simulation;

    // Draw links
    const linkGroup = svg.append("g");
    const linkEl = linkGroup.selectAll("line")
      .data(links)
      .enter().append("line")
      .attr("stroke", d => LINK_COLORS[d.type] || "#6b7280")
      .attr("stroke-width", d => d.type === "command" ? 2 : 1.2)
      .attr("stroke-opacity", d => d.type === "data" ? 0.3 : 0.55)
      .attr("stroke-dasharray", d => d.type === "data" ? "4,3" : d.type === "reports" ? "2,2" : "none")
      .attr("marker-end", d => `url(#arrow-${d.type})`);

    // Draw nodes
    const nodeGroup = svg.append("g");
    const nodeEl = nodeGroup.selectAll("g")
      .data(nodes)
      .enter().append("g")
      .attr("cursor", "pointer")
      .call(d3.drag<SVGGElement, GraphNode>()
        .on("start", (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x; d.fy = d.y;
        })
        .on("drag", (event, d) => {
          if (d.id !== "main" && d.id !== "doo") { d.fx = event.x; d.fy = event.y; }
        })
        .on("end", (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          if (d.id !== "main" && d.id !== "doo") { d.fx = null; d.fy = null; }
        })
      )
      .on("click", (event, d) => {
        event.stopPropagation();
        setSelected(getNodeInfo(d.id));
      });

    // Node glow circle
    nodeEl.append("circle")
      .attr("r", d => d.id === "main" ? 36 : d.id === "doo" ? 26 : 28)
      .attr("fill", d => d.color)
      .attr("fill-opacity", 0.12)
      .attr("stroke", d => d.color)
      .attr("stroke-width", d => d.id === "main" ? 2.5 : 1.8)
      .attr("filter", d => `url(#glow-${d.id})`);

    // Agent status dot (outer ring pulse for active)
    nodeEl.each(function(d) {
      const agent = agents.find(a => a.id === d.id);
      if (agent?.activityStatus === "active") {
        d3.select(this).append("circle")
          .attr("r", d.id === "main" ? 38 : 30)
          .attr("fill", "none")
          .attr("stroke", d.color)
          .attr("stroke-width", 1)
          .attr("stroke-opacity", 0.3)
          .attr("stroke-dasharray", "3,3");
      }
    });

    // Emoji label
    nodeEl.append("text")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .attr("font-size", d => d.id === "main" ? "22px" : "18px")
      .attr("dy", "-4")
      .text(d => d.emoji);

    // Name label below
    nodeEl.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", d => d.id === "main" ? "20" : "18")
      .attr("font-size", "10px")
      .attr("font-weight", "bold")
      .attr("fill", d => d.color)
      .text(d => d.label);

    // Tier badge
    nodeEl.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", d => d.id === "main" ? "30" : "28")
      .attr("font-size", "8px")
      .attr("fill", "#6b7280")
      .text(d => d.tier !== "HUMAN" ? `[${d.tier}]` : "");

    // Cron count badge (top-right of node)
    nodeEl.each(function(d) {
      const count = cronJobs.filter(j => j.agentId === d.id && j.enabled).length;
      if (count > 0) {
        const g = d3.select(this);
        const r = d.id === "main" ? 36 : 28;
        g.append("circle")
          .attr("cx", r * 0.7)
          .attr("cy", -(r * 0.7))
          .attr("r", 8)
          .attr("fill", "#1e293b")
          .attr("stroke", d.color)
          .attr("stroke-width", 1);
        g.append("text")
          .attr("x", r * 0.7)
          .attr("y", -(r * 0.7))
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "central")
          .attr("font-size", "7px")
          .attr("font-weight", "bold")
          .attr("fill", d.color)
          .text(count);
      }
    });

    // Click background to deselect
    svg.on("click", () => setSelected(null));

    simulation.on("tick", () => {
      linkEl
        .attr("x1", d => (d.source as GraphNode).x ?? 0)
        .attr("y1", d => (d.source as GraphNode).y ?? 0)
        .attr("x2", d => (d.target as GraphNode).x ?? 0)
        .attr("y2", d => (d.target as GraphNode).y ?? 0);

      nodeEl.attr("transform", d => `translate(${d.x ?? 0},${d.y ?? 0})`);
    });

    return () => { simulation.stop(); };
  }, [dimensions, agents, cronJobs, getNodeInfo]);

  const statusColor = (s?: string) => s === "active" ? "text-emerald-400" : s === "recent" ? "text-blue-400" : s === "overdue" ? "text-amber-400" : "text-slate-500";
  const statusDot = (s?: string) => s === "active" ? "bg-emerald-400 animate-pulse" : s === "recent" ? "bg-blue-400" : s === "overdue" ? "bg-amber-400" : "bg-slate-600";

  return (
    <div className="relative w-full rounded-xl border border-slate-700/50 bg-slate-900/80 overflow-hidden">
      {/* Legend */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
        {[
          { color: LINK_COLORS.command, label: "command", dash: false },
          { color: LINK_COLORS.delegate, label: "delegate", dash: false },
          { color: LINK_COLORS.reports, label: "reports", dash: true },
          { color: LINK_COLORS.data, label: "data flow", dash: true },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5">
            <svg width="20" height="8">
              <line x1="0" y1="4" x2="20" y2="4"
                stroke={l.color} strokeWidth="1.5"
                strokeDasharray={l.dash ? "3,2" : undefined}
                opacity={0.8}
              />
            </svg>
            <span className="text-[9px] text-slate-500">{l.label}</span>
          </div>
        ))}
      </div>

      {/* Graph */}
      <div ref={containerRef} className="w-full" style={{ height: 480 }}>
        <svg ref={svgRef} className="w-full h-full" />
      </div>

      {/* Selected node panel */}
      {selected && (
        <div
          className="absolute bottom-3 right-3 w-64 rounded-xl border border-slate-700/60 bg-slate-900/95 p-4 backdrop-blur-sm shadow-xl"
          style={{ borderColor: selected.color + "40" }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{selected.emoji}</span>
              <div>
                <div className="text-sm font-bold" style={{ color: selected.color }}>{selected.label}</div>
                <div className="text-[9px] text-slate-500">{selected.role}</div>
              </div>
            </div>
            <button onClick={() => setSelected(null)} className="text-slate-600 hover:text-slate-400 text-xs">✕</button>
          </div>

          <div className="space-y-1.5 text-[10px]">
            <div className="flex justify-between">
              <span className="text-slate-500">Tier</span>
              <span className="font-bold" style={{ color: selected.color }}>[{selected.tier}]</span>
            </div>
            {selected.agent && (
              <>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status</span>
                  <span className={statusColor(selected.agent.activityStatus)}>
                    <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${statusDot(selected.agent.activityStatus)}`} />
                    {selected.agent.activityStatus}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Last action</span>
                  <span className="text-slate-300 truncate ml-2 max-w-[140px]">{selected.agent.lastAction || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Last ping</span>
                  <span className="text-slate-300">{selected.lastPulse}</span>
                </div>
              </>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500">Active crons</span>
              <span className="text-slate-300">{selected.cronCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Model</span>
              <span className="text-slate-300 font-mono">{selected.model}</span>
            </div>

            {/* Connections from this node */}
            <div className="pt-2 border-t border-slate-800 mt-2">
              <div className="text-slate-500 mb-1 uppercase tracking-wider text-[9px]">Connections</div>
              <div className="space-y-0.5">
                {GRAPH_LINKS.filter(l => {
                  const src = typeof l.source === "string" ? l.source : (l.source as GraphNode).id;
                  const tgt = typeof l.target === "string" ? l.target : (l.target as GraphNode).id;
                  return src === selected.id || tgt === selected.id;
                }).slice(0, 5).map((l, i) => {
                  const src = typeof l.source === "string" ? l.source : (l.source as GraphNode).id;
                  const tgt = typeof l.target === "string" ? l.target : (l.target as GraphNode).id;
                  const other = src === selected.id ? tgt : src;
                  const otherNode = GRAPH_NODES.find(n => n.id === other);
                  const dir = src === selected.id ? "→" : "←";
                  return (
                    <div key={i} className="flex items-center gap-1">
                      <span style={{ color: LINK_COLORS[l.type] }} className="text-[9px]">{dir}</span>
                      <span className="text-slate-400">{otherNode?.label || other}</span>
                      <span className="text-slate-600 text-[8px] ml-auto">{l.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hint */}
      <div className="absolute bottom-3 left-3 text-[9px] text-slate-600">
        Click a node to inspect · Drag to reposition
      </div>
    </div>
  );
}
