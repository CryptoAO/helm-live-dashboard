"use client";
import { useState, useEffect, useCallback } from "react";
import { useGateway } from "@/hooks/use-gateway";
import { PageHeader } from "@/components/layout/page-header";

interface DecisionOption {
  label: string;
  value: string;
  style: "primary" | "danger" | "warning" | "default";
}

interface Decision {
  id: string;
  title: string;
  description: string;
  priority: "P0" | "P1" | "P2" | "P3";
  category: string;
  options: DecisionOption[];
  context: string | null;
  deadline: string | null;
  daysUntil: number | null;
  status: string;
  createdAt: string | null;
  agentSource: string;
  documentPath: string | null;
}

interface DecisionsData {
  decisions: Decision[];
  total: number;
  pending: number;
  p0Count: number;
}

const priorityColors: Record<string, string> = {
  P0: "text-red-400 bg-red-500/15 border-red-500/40",
  P1: "text-amber-400 bg-amber-500/15 border-amber-500/40",
  P2: "text-blue-400 bg-blue-500/15 border-blue-500/40",
  P3: "text-slate-400 bg-slate-500/15 border-slate-500/40",
};

const categoryIcons: Record<string, string> = {
  LEGAL: "⚖️", COMMS: "📡", CREW: "⚓", INCOME: "💰", TECH: "🔧", STRATEGIC: "🎯",
};

const categoryColors: Record<string, string> = {
  LEGAL: "text-red-300 bg-red-500/10",
  COMMS: "text-emerald-300 bg-emerald-500/10",
  CREW: "text-cyan-300 bg-cyan-500/10",
  INCOME: "text-amber-300 bg-amber-500/10",
  TECH: "text-purple-300 bg-purple-500/10",
  STRATEGIC: "text-blue-300 bg-blue-500/10",
};

const optionStyles: Record<string, string> = {
  primary: "bg-blue-500/20 text-blue-300 border-blue-500/40 hover:bg-blue-500/35 active:scale-95",
  danger: "bg-red-500/20 text-red-300 border-red-500/40 hover:bg-red-500/35 active:scale-95",
  warning: "bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/35 active:scale-95",
  default: "bg-slate-700/40 text-slate-300 border-slate-600/40 hover:bg-slate-700/60 active:scale-95",
};

function DaysLabel({ days }: { days: number | null }) {
  if (days === null) return null;
  if (days < 0) return <span className="text-red-400 font-bold text-[10px]">{Math.abs(days)}d OVERDUE</span>;
  if (days === 0) return <span className="text-red-400 font-bold text-[10px] animate-pulse">DUE TODAY</span>;
  if (days === 1) return <span className="text-red-300 font-bold text-[10px]">Tomorrow</span>;
  if (days <= 3) return <span className="text-amber-400 font-bold text-[10px]">{days}d left</span>;
  return <span className="text-slate-500 text-[10px]">{days}d left</span>;
}

function DecisionCard({
  d,
  onDecide,
  decided,
}: {
  d: Decision;
  onDecide: (id: string, value: string, label: string) => void;
  decided: Record<string, string>;
}) {
  const [expanded, setExpanded] = useState(d.priority === "P0");
  const [note, setNote] = useState("");
  const myDecision = decided[d.id];

  return (
    <div
      className={`rounded-xl border overflow-hidden transition-all duration-200 ${
        myDecision ? "opacity-60 border-slate-700/30 bg-slate-900/40" :
        d.priority === "P0" ? "border-red-500/30 bg-slate-900/90 shadow-lg shadow-red-500/5" :
        d.priority === "P1" ? "border-amber-500/20 bg-slate-900/80" :
        "border-slate-700/40 bg-slate-900/60"
      }`}
    >
      {/* Header */}
      <div
        className="px-4 py-3 flex items-start gap-3 cursor-pointer"
        onClick={() => setExpanded(e => !e)}
      >
        {/* Priority + Category */}
        <div className="flex flex-col items-center gap-1 shrink-0 pt-0.5">
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${priorityColors[d.priority]}`}>
            {d.priority}
          </span>
          <span className={`text-[9px] px-1.5 py-0.5 rounded ${categoryColors[d.category] || "text-slate-400 bg-slate-800"}`}>
            {categoryIcons[d.category] || "📋"} {d.category}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="text-[12px] font-semibold text-white leading-snug">{d.title}</div>
            <div className="shrink-0 flex flex-col items-end gap-1">
              <DaysLabel days={d.daysUntil} />
              {myDecision && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-medium">
                  ✓ {myDecision}
                </span>
              )}
            </div>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">{d.description}</div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[9px] text-slate-600">by {d.agentSource}</span>
            {d.createdAt && <span className="text-[9px] text-slate-700">{d.createdAt}</span>}
          </div>
        </div>

        {/* Expand toggle */}
        <span className="text-slate-600 text-xs shrink-0 mt-1">{expanded ? "▲" : "▼"}</span>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-slate-800/60 pt-3 space-y-3">
          {/* Context */}
          {d.context && (
            <div className="rounded-lg bg-slate-800/60 border border-slate-700/40 px-3 py-2.5">
              <div className="text-[9px] text-slate-500 uppercase tracking-wider mb-1 font-medium">Context / Risk</div>
              <div className="text-[10px] text-slate-300 leading-relaxed">{d.context}</div>
            </div>
          )}

          {/* Document link */}
          {d.documentPath && (
            <div className="text-[9px] text-slate-600">
              📋 Full doc: <span className="text-slate-500 font-mono">{d.documentPath}</span>
            </div>
          )}

          {/* Note input */}
          {!myDecision && (
            <div>
              <input
                type="text"
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Optional note (e.g. 'call lawyer first', 'DFA appointment at 10am')…"
                className="w-full bg-slate-800/60 border border-slate-700/40 rounded-lg px-3 py-2 text-[10px] text-slate-300 placeholder-slate-600 focus:outline-none focus:border-blue-500/40"
              />
            </div>
          )}

          {/* Action buttons */}
          {!myDecision ? (
            <div className="flex flex-wrap gap-2">
              {d.options.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => onDecide(d.id, opt.value, note)}
                  className={`text-[11px] font-medium px-3 py-1.5 rounded-lg border transition-all ${optionStyles[opt.style]}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-[10px] text-emerald-400 font-medium">
              ✅ Decision recorded: <strong>{myDecision}</strong> — logged to decision-log.md
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function DecisionsPage() {
  const gateway = useGateway();
  const [data, setData] = useState<DecisionsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [decided, setDecided] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<string>("ALL");
  const [submitting, setSubmitting] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/decisions");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDecide = async (id: string, value: string, note: string) => {
    setSubmitting(id);
    try {
      const res = await fetch("/api/decisions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, decision: value, note }),
      });
      if (res.ok) {
        setDecided(prev => ({ ...prev, [id]: value }));
      }
    } catch { /* ignore */ }
    setSubmitting(null);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full text-slate-500 text-sm">Loading decisions…</div>;
  }

  const decisions = data?.decisions || [];
  const categories = ["ALL", ...Array.from(new Set(decisions.map(d => d.category)))];
  const filtered = filter === "ALL" ? decisions : decisions.filter(d => d.category === filter);
  const pendingFiltered = filtered.filter(d => !decided[d.id]);
  const doneFiltered = filtered.filter(d => !!decided[d.id]);

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Decision Center"
        subtitle={`${data?.pending ?? 0} pending · ${Object.keys(decided).length} decided this session`}
        icon="🎯"
        gatewayState={gateway.connectionState}
        actions={
          <button onClick={load} className="text-xs px-3 py-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-slate-200 transition-colors">
            Refresh
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">

        {/* Stats bar */}
        {data && (
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "Pending", val: data.pending, color: "text-white" },
              { label: "P0 Urgent", val: data.p0Count, color: "text-red-400" },
              { label: "Decided", val: Object.keys(decided).length, color: "text-emerald-400" },
              { label: "Total", val: data.total, color: "text-slate-400" },
            ].map(s => (
              <div key={s.label} className="rounded-lg border border-slate-700/50 bg-slate-900/60 px-3 py-2.5 text-center">
                <div className={`text-lg font-bold ${s.color}`}>{s.val}</div>
                <div className="text-[9px] text-slate-600 uppercase tracking-wide">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Category filter */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`text-[10px] font-medium px-2.5 py-1 rounded-full border transition-colors ${
                filter === cat
                  ? "bg-blue-500/20 text-blue-400 border-blue-500/40"
                  : "border-slate-700/50 text-slate-500 hover:text-slate-300 hover:border-slate-600"
              }`}
            >
              {categoryIcons[cat] || ""} {cat}
            </button>
          ))}
        </div>

        {/* Pending decisions */}
        {pendingFiltered.length > 0 && (
          <div className="space-y-3">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">
              ⏳ Pending ({pendingFiltered.length})
            </div>
            {pendingFiltered.map(d => (
              <DecisionCard
                key={d.id}
                d={d}
                onDecide={handleDecide}
                decided={decided}
              />
            ))}
          </div>
        )}

        {/* Decided this session */}
        {doneFiltered.length > 0 && (
          <div className="space-y-3">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider font-medium mt-4">
              ✅ Decided this session ({doneFiltered.length})
            </div>
            {doneFiltered.map(d => (
              <DecisionCard
                key={d.id}
                d={d}
                onDecide={handleDecide}
                decided={decided}
              />
            ))}
          </div>
        )}

        {filtered.length === 0 && (
          <div className="rounded-xl border border-slate-700/40 bg-slate-900/60 p-8 text-center">
            <div className="text-3xl mb-3">✅</div>
            <div className="text-sm font-semibold text-slate-400">Decision inbox is clear</div>
            <div className="text-[10px] text-slate-600 mt-1">No pending decisions. Fleet is executing autonomously.</div>
          </div>
        )}

        {/* Help text */}
        <div className="rounded-lg bg-slate-800/30 border border-slate-700/30 px-4 py-3">
          <div className="text-[9px] text-slate-600 leading-relaxed">
            <strong className="text-slate-500">How it works:</strong> Tap any card to expand. Read context, add an optional note, then tap your decision. All decisions are logged to <span className="font-mono">shared-kb/taskboard/decision-log.md</span> with timestamp and propagated to source files.
          </div>
        </div>
      </div>
    </div>
  );
}
