"use client";
import type { SafetyLevel } from "@/lib/data/types";
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

export function SafetyBanner({ safety, reviewCount = 0, contentCount = 0 }: SafetyBannerProps) {
  return (
    <div className={`rounded-xl border p-3 flex items-center justify-between ${levelStyles[safety.level]}`}>
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
        {contentCount > 0 && <Badge variant="orange">⚡ {contentCount} content</Badge>}
      </div>
    </div>
  );
}
