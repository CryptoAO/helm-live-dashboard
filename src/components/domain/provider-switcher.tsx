"use client";
import { useState, useEffect, useRef } from "react";

interface ProviderState {
  activeProvider: string;
  activeModel: string;
  lastSwitchedAt: string | null;
  availableProviders: Record<
    string,
    { label: string; models: Record<string, { label: string; default?: boolean }> }
  >;
}

const PROVIDER_ICONS: Record<string, string> = {
  anthropic: "🟠",
  openai: "🟢",
  google: "🔵",
};

export function ProviderSwitcher() {
  const [state, setState] = useState<ProviderState | null>(null);
  const [switching, setSwitching] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/switch-ai")
      .then((r) => r.json())
      .then(setState)
      .catch(() => {});
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function switchTo(model: string) {
    setSwitching(true);
    setError(null);
    try {
      const res = await fetch("/api/switch-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model }),
      });
      const data = await res.json();
      if (data.ok === false) {
        setError(data.error || "Switch failed");
      } else {
        setState(data.state || { ...state, activeModel: model, activeProvider: model.split("/")[0] });
        setOpen(false);
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setSwitching(false);
    }
  }

  if (!state) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-800/50 text-[10px] text-slate-500">
        AI: loading...
      </div>
    );
  }

  const icon = PROVIDER_ICONS[state.activeProvider] || "⚪";
  const providerLabel =
    state.availableProviders?.[state.activeProvider]?.label || state.activeProvider;
  const modelLabel =
    state.availableProviders?.[state.activeProvider]?.models?.[state.activeModel]?.label ||
    state.activeModel.split("/")[1] ||
    state.activeModel;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        disabled={switching}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/50 hover:border-slate-600 text-[11px] text-slate-300 transition-colors cursor-pointer"
      >
        <span>{icon}</span>
        <span className="font-medium">{modelLabel}</span>
        <span className="text-slate-600 ml-1">{switching ? "⏳" : "▾"}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-64 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden">
          <div className="px-3 py-2 border-b border-slate-800 text-[10px] text-slate-500 uppercase tracking-wider">
            Switch AI Provider
          </div>
          {error && (
            <div className="px-3 py-1.5 text-[10px] text-red-400 bg-red-500/10">
              {error}
            </div>
          )}
          {Object.entries(state.availableProviders || {}).map(([pid, p]) => (
            <div key={pid}>
              <div className="px-3 py-1.5 text-[10px] text-slate-500 font-medium bg-slate-800/30">
                {PROVIDER_ICONS[pid] || "⚪"} {p.label}
              </div>
              {Object.entries(p.models).map(([mid, m]) => {
                const active = mid === state.activeModel;
                return (
                  <button
                    key={mid}
                    onClick={() => !active && switchTo(mid)}
                    disabled={switching || active}
                    className={`w-full text-left px-4 py-2 text-xs transition-colors ${
                      active
                        ? "bg-blue-500/10 text-blue-400 cursor-default"
                        : "text-slate-400 hover:bg-slate-800 hover:text-slate-200 cursor-pointer"
                    }`}
                  >
                    <span>{m.label}</span>
                    {active && <span className="ml-2 text-[9px] text-blue-500">● ACTIVE</span>}
                  </button>
                );
              })}
            </div>
          ))}
          <div className="px-3 py-1.5 border-t border-slate-800 text-[9px] text-slate-600">
            Switches config + restarts gateway (~10s)
          </div>
        </div>
      )}
    </div>
  );
}
