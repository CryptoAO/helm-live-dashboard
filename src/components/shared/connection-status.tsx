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

function isCloudDeploy(): boolean {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return host !== "localhost" && host !== "127.0.0.1";
}

export function ConnectionStatus({ state, pid, className = "" }: ConnectionStatusProps) {
  const cloud = isCloudDeploy();

  // Cloud deploy: gateway WS is never reachable — show green "Live" indicator
  if (cloud && (state === "disconnected" || state === "error" || state === "connecting")) {
    return (
      <div className={`flex items-center gap-2 text-xs ${className}`}>
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-emerald-400">Live</span>
      </div>
    );
  }

  // If gateway PID exists but WS is disconnected (e.g. remote access), show "Running" not "Offline"
  const hasProcess = !!pid;
  const effectiveState = (state === "disconnected" && hasProcess) ? "running" : state;
  const dotStatus = effectiveState === "connected" || effectiveState === "running" ? "connected" : "disconnected";
  const label = effectiveState === "running" ? "Running" : stateLabels[state];
  const labelColor = (effectiveState === "connected" || effectiveState === "running") ? "text-emerald-400" : "text-red-400";

  return (
    <div className={`flex items-center gap-2 text-xs ${className}`}>
      <StatusDot status={dotStatus} size="sm" />
      <span className="text-slate-400">Gateway</span>
      <span className={labelColor}>{label}</span>
      {pid && <span className="text-slate-600 font-mono">PID {pid}</span>}
    </div>
  );
}
