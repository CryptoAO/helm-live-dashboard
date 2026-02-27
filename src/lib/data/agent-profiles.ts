// RPG-style Agent Profiles — VoxYZ-inspired visualization

export interface AgentRPGProfile {
  id: string;
  callsign: string;
  class: string;
  title: string;
  persona: string;
  emoji: string;
  avatar: string;
  tier: "S" | "A" | "B";
  stats: { INT: number; STR: number; DEF: number; SPD: number; CHA: number; WIS: number };
  skills: string[];
  xp: number;
  level: number;
  statusQuote: string;
}

export const AGENT_RPG_PROFILES: Record<string, AgentRPGProfile> = {
  main: {
    id: "main", callsign: "HELM", class: "Fleet Commander", title: "Coordination & Oversight",
    persona: "Steve Jobs", emoji: "⚓", avatar: "from-slate-500 to-blue-600", tier: "S",
    stats: { INT: 90, STR: 85, DEF: 80, SPD: 75, CHA: 95, WIS: 92 },
    skills: ["Fleet Orchestration", "Flywheel Engine", "Decision Synthesis"],
    xp: 820, level: 12, statusQuote: "Simplify ruthlessly. Ship relentlessly.",
  },
  eagle: {
    id: "eagle", callsign: "EAGLE", class: "Intelligence Officer", title: "Intel & Monitoring",
    persona: "Elon Musk", emoji: "🦅", avatar: "from-amber-500 to-orange-600", tier: "A",
    stats: { INT: 95, STR: 70, DEF: 60, SPD: 88, CHA: 72, WIS: 85 },
    skills: ["SOTA Research", "Sanctions Scanning", "Opportunity Detection"],
    xp: 650, level: 9, statusQuote: "First principles. Always first principles.",
  },
  anchor: {
    id: "anchor", callsign: "ANCHOR", class: "Operations Guardian", title: "Crewing & Validation",
    persona: "Charlie Munger", emoji: "⚓", avatar: "from-cyan-500 to-teal-600", tier: "A",
    stats: { INT: 82, STR: 88, DEF: 95, SPD: 65, CHA: 60, WIS: 90 },
    skills: ["Risk Assessment", "Crew Compliance", "Data Validation"],
    xp: 580, level: 8, statusQuote: "Invert, always invert.",
  },
  beacon: {
    id: "beacon", callsign: "BEACON", class: "Legal Architect", title: "Legal & P&I / Builder",
    persona: "Nikola Tesla", emoji: "🔔", avatar: "from-purple-500 to-violet-600", tier: "A",
    stats: { INT: 88, STR: 80, DEF: 92, SPD: 70, CHA: 65, WIS: 86 },
    skills: ["Deadline Tracking", "Compliance Engine", "Code Building"],
    xp: 520, level: 7, statusQuote: "The present is theirs; the future is mine.",
  },
  compass: {
    id: "compass", callsign: "COMPASS", class: "Data Sage", title: "Data & Reporting",
    persona: "Ray Dalio", emoji: "📊", avatar: "from-emerald-500 to-green-600", tier: "A",
    stats: { INT: 92, STR: 75, DEF: 78, SPD: 72, CHA: 68, WIS: 94 },
    skills: ["KPI Analysis", "Principled Evaluation", "Self-Improvement"],
    xp: 600, level: 8, statusQuote: "Pain + Reflection = Progress.",
  },
  signal: {
    id: "signal", callsign: "SIGNAL", class: "Delivery Captain", title: "Communications & Delivery",
    persona: "Jeff Bezos", emoji: "📡", avatar: "from-yellow-500 to-amber-600", tier: "A",
    stats: { INT: 78, STR: 82, DEF: 70, SPD: 85, CHA: 95, WIS: 80 },
    skills: ["Stakeholder Comms", "Market Validation", "Day-1 Quality"],
    xp: 540, level: 7, statusQuote: "It's always Day 1.",
  },
  spark: {
    id: "spark", callsign: "SPARK", class: "Growth Hacker", title: "Content & Growth",
    persona: "Gary Vaynerchuk", emoji: "🔥", avatar: "from-orange-500 to-red-600", tier: "B",
    stats: { INT: 72, STR: 78, DEF: 55, SPD: 92, CHA: 98, WIS: 65 },
    skills: ["Content Creation", "GTM Strategy", "Revenue Acceleration"],
    xp: 380, level: 5, statusQuote: "Document, don't create.",
  },
};

export function getStatBarColor(value: number): string {
  if (value >= 90) return "bg-emerald-500";
  if (value >= 80) return "bg-blue-500";
  if (value >= 70) return "bg-yellow-500";
  return "bg-slate-500";
}

export function getTierColor(tier: "S" | "A" | "B"): string {
  if (tier === "S") return "text-yellow-300 border-yellow-500/50 bg-yellow-500/10";
  if (tier === "A") return "text-blue-300 border-blue-500/50 bg-blue-500/10";
  return "text-slate-400 border-slate-500/50 bg-slate-500/10";
}
