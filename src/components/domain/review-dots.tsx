"use client";
import { REVIEW_STAGES } from "@/lib/data/types";

interface ReviewDotsProps {
  currentStage: number | null; // 1-7, null if not in review
  stageName?: string | null;
  size?: "sm" | "md";
}

export function ReviewDots({ currentStage, stageName, size = "md" }: ReviewDotsProps) {
  const dotSize = size === "sm" ? "w-2 h-2" : "w-2.5 h-2.5";
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1">
        {REVIEW_STAGES.map((stage, i) => {
          const stageNum = i + 1;
          const isCompleted = currentStage !== null && stageNum < currentStage;
          const isCurrent = currentStage !== null && stageNum === currentStage;
          const isPending = currentStage === null || stageNum > currentStage;
          return (
            <div
              key={stage}
              className={`${dotSize} rounded-full transition-all ${
                isCompleted ? "bg-emerald-400" :
                isCurrent ? "bg-amber-400 review-pulse" :
                "bg-slate-600"
              }`}
              title={`${stageNum}/7 — ${stage}`}
            />
          );
        })}
      </div>
      {stageName && <span className="text-[9px] text-amber-400/80 font-mono">{stageName}</span>}
    </div>
  );
}
