"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const NAV_ITEMS = [
  { href: "/", label: "Bridge", icon: "🚢", shortcut: "1" },
  { href: "/fleet", label: "Fleet", icon: "🤖", shortcut: "2" },
  { href: "/decisions", label: "Decisions", icon: "🎯", shortcut: "3", badge: true },
  { href: "/pipeline", label: "Pipeline", icon: "💰", shortcut: "4" },
  { href: "/projects", label: "Projects", icon: "📦", shortcut: "5" },
  { href: "/analytics", label: "Analytics", icon: "📊", shortcut: "6" },
  { href: "/warroom", label: "War Room", icon: "🏛️", shortcut: "7" },
  { href: "/redundancy", label: "Redundancy", icon: "🛡️", shortcut: "8" },
];

export function Nav() {
  const pathname = usePathname();
  const [pendingCount, setPendingCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/decisions").then(r => r.json()).then(d => {
      setPendingCount(d.pending ?? null);
    }).catch(() => {});
    // Refresh every 2 min
    const t = setInterval(() => {
      fetch("/api/decisions").then(r => r.json()).then(d => {
        setPendingCount(d.pending ?? null);
      }).catch(() => {});
    }, 120000);
    return () => clearInterval(t);
  }, []);

  return (
    <>
      {/* Desktop sidebar */}
      <nav className="hidden md:flex flex-col w-14 lg:w-48 border-r border-card-border bg-card-bg/50 shrink-0">
        <div className="p-3 border-b border-card-border">
          <span className="hidden lg:block text-sm font-bold text-slate-300">HELM</span>
          <span className="lg:hidden text-lg text-center block">⚓</span>
        </div>
        <div className="flex flex-col gap-0.5 p-2 flex-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs transition-colors ${
                  active
                    ? "bg-blue-500/15 text-blue-400 border border-blue-500/20"
                    : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 border border-transparent"
                }`}
              >
                <span className="text-base relative">
                  {item.icon}
                  {item.badge && pendingCount !== null && pendingCount > 0 && (
                    <span className="absolute -top-1 -right-1 text-[8px] font-bold bg-red-500 text-white rounded-full w-3.5 h-3.5 flex items-center justify-center leading-none">
                      {pendingCount > 9 ? "9+" : pendingCount}
                    </span>
                  )}
                </span>
                <span className="hidden lg:block font-medium">{item.label}</span>
                {item.badge && pendingCount !== null && pendingCount > 0 && (
                  <span className="hidden lg:block ml-auto text-[9px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 px-1 rounded-full">
                    {pendingCount}
                  </span>
                )}
                {(!item.badge || !pendingCount) && (
                  <span className="hidden lg:block ml-auto text-[9px] text-slate-700 font-mono">{item.shortcut}</span>
                )}
              </Link>
            );
          })}
        </div>
        <div className="p-3 border-t border-card-border">
          <span className="hidden lg:block text-[9px] text-slate-700 text-center">v3.0</span>
        </div>
      </nav>

      {/* Mobile bottom bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-card-border bg-card-bg/95 backdrop-blur-sm">
        <div className="flex items-center justify-around py-2">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg ${
                  active ? "text-blue-400" : "text-slate-600"
                }`}
              >
                <span className="text-lg relative">
                  {item.icon}
                  {item.badge && pendingCount !== null && pendingCount > 0 && (
                    <span className="absolute -top-1 -right-1 text-[8px] font-bold bg-red-500 text-white rounded-full w-3.5 h-3.5 flex items-center justify-center leading-none">
                      {pendingCount > 9 ? "9+" : pendingCount}
                    </span>
                  )}
                </span>
                <span className="text-[9px]">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
