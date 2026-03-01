"use client";
import { useState } from "react";
import type { SafetyLevel, SafetyAction } from "@/lib/data/types";
import { Badge } from "../shared/badge";

interface SafetyBannerProps {
  safety: SafetyLevel;
  reviewCount?: number;
  contentCount?: number;
}

const levelStyles = {
  green: "border-emerald-500/30 bg-emerald-500/5",
  amber: "border-amber-500/30 bg-amber-500/5",
  red: "border-red-500/30 bg-red-500/5 safety-blink",
};

const levelIcons = { green: "✓", amber: "⚠", red: "🚨" };

const actionStyles: Record<string, string> = {
  retry_cron: "bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30",
  reset_errors: "bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/30",
  delegate_helm: "bg-slate-500/20 text-slate-300 border-slate-500/30 hover:bg-slate-500/30",
  escalate: "bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30",
};

export function SafetyBanner({ safety, reviewCount = 0, contentCount = 0 }: SafetyBannerProps) {
  const [actionStatus, setActionStatus] = useState<Record<string, "pending" | "loading" | "done" | "error">>({});
  const [expanded, setExpanded] = useState(false);

  const hasActions = safety.actions && safety.actions.length > 0;

  async function handleAction(action: SafetyAction) {
    setActionStatus(s => ({ ...s, [action.id]: "loading" }));
    try {
      const body: Record<string, string> = { action: action.type };
      if (action.cronJobId) body.jobId = action.cronJobId;

      const res = await fetch("/api/cron", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setActionStatus(s => ({ ...s, [action.id]: "done" }));
      } else {
        setActionStatus(s => ({ ...s, [action.id]: "error" }));
      }
    } catch {
      setActionStatus(s => ({ ...s, [action.id]: "error" }));
    }
  }

  return (
    <div className={`rounded-xl border p-3 ${levelStyles[safety.level]}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${safety.level === "green" ? "bg-emerald-500/20 text-emerald-400" : safety.level === "amber" ? "bg-amber-500/20 text-amber-400" : "bg-red-500/20 text-red-400"}`}>
            {levelIcons[safety.level]}
          </div>
          <div>
            <div className={`text-sm font-bold ${safety.level === "green" ? "text-emerald-400" : safety.level === "amber" ? "text-amber-400" : "text-red-400"}`}>
              {safety.label}
            </div>
            <div className="text-xs text-slate-400">{safety.message}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {reviewCount > 0 && <Badge variant="blue">{reviewCount} in review</Badge>}
          {contentCount > 0 && <Badge variant="orange">{contentCount} content</Badge>}
          {hasActions && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-[10px] px-2.5 py-1 rounded-lg border border-slate-600 text-slate-300 hover:text-white hover:border-slate-400 transition-colors font-medium"
            >
              {expanded ? "Hide Actions" : `${safety.actions!.length} Actions`}
            </button>
          )}
        </div>
      </div>

      {/* Expandable remediation action panel — per SOUL.md §8.3 Proactive Behaviors */}
      {expanded && hasActions && (
        <div className="mt-3 pt-3 border-t border-slate-700/50 space-y-2">
          <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mb-2">
            Remediation Actions (Fleet Captain Authority)
          </div>
          {safety.actions!.map(action => {
            const status = actionStatus[action.id];
            return (
              <div key={action.id} className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-slate-300">{action.label}</div>
                  <div className="text-[10px] text-slate-500 truncate">{action.description}</div>
                </div>
                <button
                  onClick={() => handleAction(action)}
                  disabled={status === "loading" || status === "done"}
                  className={`text-[10px] px-3 py-1.5 rounded-lg border font-medium transition-all whitespace-nowrap ${
                    status === "done" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" :
                    status === "loading" ? "opacity-50 cursor-wait " + (actionStyles[action.type] || "") :
                    status === "error" ? "bg-red-500/20 text-red-400 border-red-500/30" :
                    (actionStyles[action.type] || "bg-slate-500/20 text-slate-300 border-slate-500/30")
                  }`}
                >
                  {status === "done" ? "Done" : status === "loading" ? "..." : status === "error" ? "Failed" : "Execute"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
