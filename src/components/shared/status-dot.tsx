"use client";

interface StatusDotProps {
  status: "active" | "recent" | "overdue" | "idle" | "connected" | "disconnected";
  size?: "sm" | "md" | "lg";
}

const statusColors: Record<string, string> = {
  active: "bg-emerald-400 activity-pulse",
  recent: "bg-blue-400",
  overdue: "bg-amber-400 activity-overdue",
  idle: "bg-slate-500 fleet-idle-pulse",
  connected: "bg-emerald-400 pulse-dot",
  disconnected: "bg-red-400",
};

const sizeClasses = { sm: "w-2 h-2", md: "w-2.5 h-2.5", lg: "w-3 h-3" };

export function StatusDot({ status, size = "md" }: StatusDotProps) {
  return <span className={`inline-block rounded-full ${statusColors[status]} ${sizeClasses[size]}`} />;
}
