"use client";
import { ConnectionStatus } from "../shared/connection-status";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: string;
  actions?: React.ReactNode;
  gatewayState?: "connecting" | "connected" | "disconnected" | "error";
  gatewayPid?: number | null;
  timestamp?: string;
}

export function PageHeader({ title, subtitle, icon, actions, gatewayState = "disconnected", gatewayPid, timestamp }: PageHeaderProps) {
  return (
    <header className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-card-border bg-card-bg/30">
      <div className="flex items-center gap-3">
        {icon && <span className="text-xl">{icon}</span>}
        <div>
          <h1 className="text-base font-bold text-slate-200">{title}</h1>
          {subtitle && <p className="text-[10px] text-slate-500">{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center gap-4">
        {timestamp && <span className="text-[10px] text-slate-600 font-mono">{timestamp}</span>}
        <ConnectionStatus state={gatewayState} pid={gatewayPid} />
        {actions}
      </div>
    </header>
  );
}
