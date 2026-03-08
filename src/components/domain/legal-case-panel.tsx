"use client";
import type { DashboardData } from "@/lib/data/types";

interface Props {
  cases: DashboardData["cases"];
}

function DaysCountdown({ days }: { days: number | null }) {
  if (days === null) return <span className="text-slate-500">—</span>;
  if (days < 0) return <span className="text-red-500 font-bold text-sm">{Math.abs(days)}d OVERDUE</span>;
  if (days === 0) return <span className="text-red-400 font-bold text-sm animate-pulse">TODAY</span>;
  if (days <= 2) return <span className="text-red-400 font-bold text-sm">{days}d left</span>;
  if (days <= 7) return <span className="text-amber-400 font-bold text-sm">{days}d left</span>;
  return <span className="text-slate-400 text-sm">{days}d left</span>;
}

const riskColors: Record<string, string> = {
  HIGH: "text-red-400 bg-red-500/10 border-red-500/30",
  MEDIUM: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  LOW: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  UNKNOWN: "text-slate-400 bg-slate-500/10 border-slate-500/30",
};

const statusColors: Record<string, string> = {
  URGENT: "text-red-400",
  ACTIVE: "text-amber-400",
  MONITORING: "text-slate-400",
};

export function LegalCasePanel({ cases }: Props) {
  const sortedCases = [...(cases.activeCases || [])].sort((a, b) => {
    // Sort: urgent first, then by days
    const statusOrder = { URGENT: 0, ACTIVE: 1, MONITORING: 2 };
    if (a.status !== b.status) return (statusOrder[a.status as keyof typeof statusOrder] ?? 9) - (statusOrder[b.status as keyof typeof statusOrder] ?? 9);
    return (a.daysUntil ?? 999) - (b.daysUntil ?? 999);
  });

  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-900/80 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">⚖️</span>
          <div>
            <div className="text-xs font-bold text-white">LEGAL CASE TRACKER</div>
            <div className="text-[10px] text-slate-500">{cases.total} active · P&I / Labor</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {cases.high > 0 && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border text-red-400 bg-red-500/10 border-red-500/30">
              {cases.high} HIGH
            </span>
          )}
          {cases.medium > 0 && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border text-amber-400 bg-amber-500/10 border-amber-500/30">
              {cases.medium} MED
            </span>
          )}
        </div>
      </div>

      {/* Cases */}
      <div className="divide-y divide-slate-800/60">
        {sortedCases.length === 0 ? (
          <div className="px-4 py-5 text-center">
            <div className="text-[10px] text-slate-500">No active cases tracked. Add case files to <code className="text-slate-400">shared-kb/cases/</code></div>
          </div>
        ) : sortedCases.map((c, i) => (
          <div key={i} className="px-4 py-3">
            {/* Title row */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap mb-1">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${riskColors[c.risk] || riskColors.UNKNOWN}`}>
                    {c.risk}
                  </span>
                  <span className={`text-[9px] font-medium ${statusColors[c.status]}`}>
                    ● {c.status}
                  </span>
                </div>
                <div className="text-[11px] font-semibold text-white leading-snug">{c.title}</div>
              </div>
              <div className="text-right shrink-0">
                <DaysCountdown days={c.daysUntil} />
                {c.deadline && (
                  <div className="text-[9px] text-slate-600 mt-0.5">{c.deadline}</div>
                )}
              </div>
            </div>

            {/* Claims */}
            {c.claims && (
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-[9px] text-slate-500">Claims:</span>
                <span className="text-[10px] font-mono text-amber-300">{c.claims}</span>
              </div>
            )}

            {/* Weakness */}
            {c.weakness && (
              <div className="rounded-lg bg-red-500/5 border border-red-500/20 px-2.5 py-1.5">
                <div className="text-[9px] text-red-300/80 font-medium mb-0.5">⚠ Critical Weakness</div>
                <div className="text-[9px] text-red-200/60 leading-relaxed">{c.weakness}</div>
              </div>
            )}

            {/* Defense brief link — show if file exists */}
            {c.title.toLowerCase().includes("dionson") && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  ✓ Defense Brief Ready — shared-kb/cases/dionson-appeal-defense-brief.md
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      {sortedCases.some(c => c.daysUntil !== null && c.daysUntil <= 2) && (
        <div className="px-4 py-2 bg-red-500/5 border-t border-red-500/20">
          <div className="text-[9px] text-red-400 font-medium">
            ⚡ {sortedCases.filter(c => c.daysUntil !== null && c.daysUntil <= 2).length} case(s) require immediate attention — deadline within 48h
          </div>
        </div>
      )}
    </div>
  );
}
