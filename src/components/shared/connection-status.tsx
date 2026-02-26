"use client";
import { StatusDot } from "./status-dot";

interface ConnectionStatusProps {
  state: "connecting" | "connected" | "disconnected" | "error";
  pid?: number | null;
  className?: string;
}

const stateLabels = {
  connecting: "Connecting...",
  connected: "Live",
  disconnected: "Offline",
  error: "Error",
};

export function ConnectionStatus({ state, pid, className = "" }: ConnectionStatusProps) {
  const dotStatus = state === "connected" ? "connected" : "disconnected";
  return (
    <div className={`flex items-center gap-2 text-xs ${className}`}>
      <StatusDot status={dotStatus} size="sm" />
      <span className="text-slate-400">Gateway</span>
      <span className={state === "connected" ? "text-emerald-400" : "text-red-400"}>
        {stateLabels[state]}
      </span>
      {pid && <span className="text-slate-600 font-mono">PID {pid}</span>}
    </div>
  );
}
