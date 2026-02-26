"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Bridge", icon: "🚢", shortcut: "1" },
  { href: "/pipeline", label: "Pipeline", icon: "💰", shortcut: "2" },
  { href: "/projects", label: "Projects", icon: "📦", shortcut: "3" },
  { href: "/fleet", label: "Fleet", icon: "🤖", shortcut: "4" },
  { href: "/analytics", label: "Analytics", icon: "📊", shortcut: "5" },
  { href: "/warroom", label: "War Room", icon: "🏛️", shortcut: "6" },
];

export function Nav() {
  const pathname = usePathname();

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
                <span className="text-base">{item.icon}</span>
                <span className="hidden lg:block font-medium">{item.label}</span>
                <span className="hidden lg:block ml-auto text-[9px] text-slate-700 font-mono">{item.shortcut}</span>
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
                <span className="text-lg">{item.icon}</span>
                <span className="text-[9px]">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
