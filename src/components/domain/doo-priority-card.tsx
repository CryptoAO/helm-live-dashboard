"use client";
import type { DashboardData } from "@/lib/data/types";

interface Props {
  cases: DashboardData["cases"];
  manning: DashboardData["manning"];
  deadlines: DashboardData["deadlines"];
  flywheel: DashboardData["flywheel"];
}

function getDaysLabel(days: number | null): string {
  if (days === null) return "No deadline";
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return "TODAY";
  if (days === 1) return "Tomorrow";
  return `${days}d left`;
}

export function DOOPriorityCard({ cases, manning, deadlines, flywheel }: Props) {
  // Build priority list from all data sources
  const priorities: {
    label: string;
    detail: string;
    urgency: "P0" | "P1" | "P2";
    days: number | null;
    tag: string;
    link?: string;
  }[] = [];

  // From cases
  for (const c of cases.activeCases) {
    if (c.daysUntil !== null && c.daysUntil <= 3) {
      priorities.push({
        label: c.title.length > 60 ? c.title.substring(0, 60) + "…" : c.title,
        detail: `${c.claims || "Active case"} · ${c.risk} risk`,
        urgency: c.daysUntil <= 1 ? "P0" : "P1",
        days: c.daysUntil,
        tag: "LEGAL",
      });
    }
  }

  // From crewing alerts
  for (const a of (manning.crewAlerts || [])) {
    if (a.severity === "CRITICAL" || a.severity === "HIGH") {
      priorities.push({
        label: `${a.code}: ${a.issue.substring(0, 60)}`,
        detail: a.daysUntil !== null ? `Expires in ${a.daysUntil}d` : "Action required",
        urgency: a.severity === "CRITICAL" ? "P0" : "P1",
        days: a.daysUntil,
        tag: "CREW",
      });
    }
  }

  // From flywheel — overdue or near deadline
  for (const fw of flywheel.items) {
    if (fw.deadline && fw.stage < 4) {
      const dlMatch = fw.deadline.match(/(\d{4}-\d{2}-\d{2})/);
      if (dlMatch) {
        const days = Math.ceil((new Date(dlMatch[1]).getTime() - Date.now()) / 86400000);
        if (days <= 2) {
          priorities.push({
            label: fw.title.length > 60 ? fw.title.substring(0, 60) + "…" : fw.title,
            detail: `Stage ${fw.stage}/6 · ${fw.leadAgent || "HELM"}`,
            urgency: days <= 0 ? "P0" : "P1",
            days,
            tag: "FLYWHEEL",
          });
        }
      }
    }
  }

  // Sort: P0 first, then by days
  priorities.sort((a, b) => {
    if (a.urgency !== b.urgency) return a.urgency.localeCompare(b.urgency);
    return (a.days ?? 999) - (b.days ?? 999);
  });

  const top = priorities.slice(0, 5);

  const urgencyColors: Record<string, string> = {
    P0: "text-red-400 bg-red-500/10 border-red-500/30",
    P1: "text-amber-400 bg-amber-500/10 border-amber-500/30",
    P2: "text-blue-400 bg-blue-500/10 border-blue-500/30",
  };

  const tagColors: Record<string, string> = {
    LEGAL: "text-red-400 bg-red-500/10",
    CREW: "text-cyan-400 bg-cyan-500/10",
    FLYWHEEL: "text-purple-400 bg-purple-500/10",
    DEADLINE: "text-amber-400 bg-amber-500/10",
  };

  const today = new Date().toLocaleDateString("en-PH", { weekday: "long", month: "long", day: "numeric", timeZone: "Asia/Manila" });

  return (
    <div className="rounded-xl border border-slate-700/50 bg-gradient-to-br from-slate-900 to-slate-800/80 overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-slate-800 flex items-center justify-between">
        <div>
          <div className="text-xs font-bold text-white tracking-wide">🎯 DOO PRIORITY BRIEF</div>
          <div className="text-[10px] text-slate-500 mt-0.5">{today}</div>
        </div>
        <div className="text-[10px] px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
          {top.length} actions
        </div>
      </div>

      {/* Priority List */}
      <div className="divide-y divide-slate-800/60">
        {top.length === 0 ? (
          <div className="px-4 py-5 text-center">
            <div className="text-2xl mb-2">✅</div>
            <div className="text-xs text-slate-400 font-medium">No critical items today</div>
            <div className="text-[10px] text-slate-600 mt-1">Fleet is clear. Focus on strategic work.</div>
          </div>
        ) : top.map((p, i) => (
          <div key={i} className="px-4 py-3 flex items-start gap-3">
            {/* Priority badge */}
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border shrink-0 mt-0.5 ${urgencyColors[p.urgency]}`}>
              {p.urgency}
            </span>
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-semibold text-white leading-tight">{p.label}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">{p.detail}</div>
            </div>
            {/* Right side */}
            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className={`text-[9px] px-1.5 py-0.5 rounded ${tagColors[p.tag] || "text-slate-500 bg-slate-800"}`}>
                {p.tag}
              </span>
              <span className={`text-[9px] font-mono font-bold ${
                p.days !== null && p.days <= 0 ? "text-red-400" :
                p.days !== null && p.days <= 1 ? "text-red-300" :
                p.days !== null && p.days <= 3 ? "text-amber-400" : "text-slate-500"
              }`}>
                {getDaysLabel(p.days)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer — quick stats */}
      <div className="px-4 py-2.5 bg-slate-800/30 flex items-center gap-4 text-[10px]">
        <span className="text-red-400"><span className="font-bold">{cases.high}</span> HIGH risk cases</span>
        <span className="text-cyan-400"><span className="font-bold">{manning.crewAlerts?.filter(a => a.severity === "CRITICAL").length ?? 0}</span> CRITICAL crew</span>
        <span className="text-purple-400"><span className="font-bold">{flywheel.items.length}</span> flywheel active</span>
      </div>
    </div>
  );
}
