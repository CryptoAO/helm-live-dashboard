"use client";
import type { DashboardData } from "@/lib/data/types";

interface Props {
  manning: DashboardData["manning"];
}

const severityConfig = {
  CRITICAL: {
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    text: "text-red-400",
    badge: "text-red-400 bg-red-500/10 border-red-500/30",
    dot: "bg-red-400 animate-pulse",
    icon: "🚨",
  },
  HIGH: {
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    text: "text-amber-400",
    badge: "text-amber-400 bg-amber-500/10 border-amber-500/30",
    dot: "bg-amber-400",
    icon: "⚠️",
  },
  MEDIUM: {
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    text: "text-blue-400",
    badge: "text-blue-400 bg-blue-500/10 border-blue-500/30",
    dot: "bg-blue-400",
    icon: "ℹ️",
  },
};

function DaysLabel({ days }: { days: number | null }) {
  if (days === null) return null;
  if (days <= 0) return <span className="text-red-400 font-bold text-[11px]">EXPIRED</span>;
  if (days === 1) return <span className="text-red-400 font-bold text-[11px]">Tomorrow</span>;
  if (days <= 3) return <span className="text-red-300 font-bold text-[11px]">{days}d left</span>;
  if (days <= 7) return <span className="text-amber-400 font-bold text-[11px]">{days}d left</span>;
  return <span className="text-slate-400 text-[11px]">{days}d left</span>;
}

export function CrewingAlertsPanel({ manning }: Props) {
  const alerts = manning.crewAlerts || [];
  const criticalCount = alerts.filter(a => a.severity === "CRITICAL").length;
  const highCount = alerts.filter(a => a.severity === "HIGH").length;

  // Sort: CRITICAL first
  const sorted = [...alerts].sort((a, b) => {
    const order = { CRITICAL: 0, HIGH: 1, MEDIUM: 2 };
    return order[a.severity] - order[b.severity];
  });

  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-900/80 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">⚓</span>
          <div>
            <div className="text-xs font-bold text-white">CREWING ALERTS</div>
            <div className="text-[10px] text-slate-500">
              {manning.fillRate ? `Fill rate: ${manning.fillRate}` : "Document compliance"}
              {manning.vessels ? ` · ${manning.vessels} vessels` : ""}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {criticalCount > 0 && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border text-red-400 bg-red-500/10 border-red-500/30 animate-pulse">
              {criticalCount} CRITICAL
            </span>
          )}
          {highCount > 0 && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border text-amber-400 bg-amber-500/10 border-amber-500/30">
              {highCount} HIGH
            </span>
          )}
          {alerts.length === 0 && (
            <span className="text-[9px] px-1.5 py-0.5 rounded border text-emerald-400 bg-emerald-500/10 border-emerald-500/20">
              ALL CLEAR
            </span>
          )}
        </div>
      </div>

      {/* Alerts */}
      <div className="divide-y divide-slate-800/60">
        {sorted.length === 0 ? (
          <div className="px-4 py-5 text-center">
            <div className="text-2xl mb-2">✅</div>
            <div className="text-[10px] text-slate-400">No crewing alerts. All crew documents in order.</div>
          </div>
        ) : sorted.map((alert, i) => {
          const cfg = severityConfig[alert.severity];
          return (
            <div key={i} className={`px-4 py-3 ${cfg.bg} border-l-2 ${cfg.border}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 flex-1 min-w-0">
                  <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${cfg.dot}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${cfg.badge}`}>
                        {alert.severity}
                      </span>
                      <span className={`text-[10px] font-bold ${cfg.text}`}>{alert.code}</span>
                    </div>
                    <div className="text-[10px] text-slate-300 leading-relaxed">{alert.issue}</div>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <DaysLabel days={alert.daysUntil} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Compliance report link */}
      {alerts.length > 0 && (
        <div className="px-4 py-2.5 bg-slate-800/30 border-t border-slate-800">
          <div className="text-[9px] text-slate-500">
            📋 Full action report: <span className="text-slate-400 font-mono">shared-kb/crewing/MARINA-2026-08-compliance-report.md</span>
          </div>
        </div>
      )}
    </div>
  );
}
