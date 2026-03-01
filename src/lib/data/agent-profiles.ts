// Agent Profiles — Operational Capability Model
// Each stat represents a real, measurable agent capability

export interface AgentCapability {
  label: string;      // Short display label
  fullName: string;   // Full name for tooltip
  value: number;      // 0-100 score
  description: string; // What this measures
}

export interface AgentSkillUnlock {
  name: string;
  unlockedAt: string;      // e.g. "Level 3" or "50 runs"
  description: string;
  unlocked: boolean;
}

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
  capabilities: AgentCapability[];
  skills: string[];
  skillUnlocks: AgentSkillUnlock[];
  xp: number;
  level: number;
  statusQuote: string;
}

export const AGENT_RPG_PROFILES: Record<string, AgentRPGProfile> = {
  main: {
    id: "main", callsign: "HELM", class: "Fleet Commander", title: "Coordination & Oversight",
    persona: "Steve Jobs", emoji: "⚓", avatar: "from-slate-500 to-blue-600", tier: "S",
    stats: { INT: 90, STR: 85, DEF: 80, SPD: 75, CHA: 95, WIS: 92 },
    capabilities: [
      { label: "COORD", fullName: "Coordination", value: 95, description: "Fleet orchestration & task delegation" },
      { label: "DCSN", fullName: "Decision Making", value: 92, description: "Priority calls & strategic alignment" },
      { label: "RSLV", fullName: "Resolution", value: 85, description: "Error recovery & conflict handling" },
      { label: "SPEED", fullName: "Response Speed", value: 75, description: "Average task completion time" },
      { label: "REACH", fullName: "Fleet Reach", value: 90, description: "Cross-agent communication coverage" },
      { label: "ADAPT", fullName: "Adaptability", value: 88, description: "Context switching & multi-tasking" },
    ],
    skills: ["Fleet Orchestration", "Flywheel Engine", "Decision Synthesis"],
    skillUnlocks: [
      { name: "Fleet Boot", unlockedAt: "Level 1", description: "Initialize and monitor all agents", unlocked: true },
      { name: "Cron Commander", unlockedAt: "Level 3", description: "Schedule and manage automated cron jobs", unlocked: true },
      { name: "Flywheel Engine", unlockedAt: "Level 5", description: "Advance ideas through the 6-stage flywheel", unlocked: true },
      { name: "Auto-Delegation", unlockedAt: "Level 8", description: "Automatically delegate tasks to best-fit agent", unlocked: true },
      { name: "Unit Commander", unlockedAt: "Level 5", description: "Spawn 1 sub-agent for parallel work", unlocked: true },
      { name: "Battalion Leader", unlockedAt: "Level 8", description: "Spawn up to 3 sub-agents simultaneously", unlocked: true },
      { name: "War Room Command", unlockedAt: "Level 10", description: "Real-time fleet-wide situation awareness", unlocked: true },
      { name: "War Council", unlockedAt: "Level 12", description: "Direct other agents' sub-agents in cross-team ops", unlocked: true },
      { name: "Autonomous Ops", unlockedAt: "Level 15", description: "Full T2 autonomous operations without human oversight", unlocked: false },
    ],
    xp: 820, level: 12, statusQuote: "Simplify ruthlessly. Ship relentlessly.",
  },
  eagle: {
    id: "eagle", callsign: "EAGLE", class: "Intelligence Officer", title: "Intel & Monitoring",
    persona: "Elon Musk", emoji: "🦅", avatar: "from-amber-500 to-orange-600", tier: "A",
    stats: { INT: 95, STR: 70, DEF: 60, SPD: 88, CHA: 72, WIS: 85 },
    capabilities: [
      { label: "SCAN", fullName: "Scanning", value: 95, description: "Web & source scanning accuracy" },
      { label: "DETCT", fullName: "Detection", value: 88, description: "Opportunity & threat identification" },
      { label: "ANLYS", fullName: "Analysis", value: 85, description: "Intel synthesis & pattern recognition" },
      { label: "SPEED", fullName: "Scan Speed", value: 90, description: "Time to scan & report findings" },
      { label: "COVR", fullName: "Coverage", value: 78, description: "Breadth of sources monitored" },
      { label: "ACCY", fullName: "Accuracy", value: 82, description: "Signal-to-noise ratio of findings" },
    ],
    skills: ["SOTA Research", "Sanctions Scanning", "Opportunity Detection"],
    skillUnlocks: [
      { name: "News Scanner", unlockedAt: "Level 1", description: "Monitor news feeds for maritime intel", unlocked: true },
      { name: "Deep Search", unlockedAt: "Level 3", description: "Multi-source cross-referencing", unlocked: true },
      { name: "Sanctions Watch", unlockedAt: "Level 5", description: "OFAC/EU/UN sanctions monitoring", unlocked: true },
      { name: "Unit Commander", unlockedAt: "Level 5", description: "Spawn 1 sub-agent for parallel work", unlocked: true },
      { name: "Opportunity Radar", unlockedAt: "Level 7", description: "Auto-detect business opportunities from scans", unlocked: true },
      { name: "Battalion Leader", unlockedAt: "Level 8", description: "Spawn up to 2 sub-agents simultaneously", unlocked: true },
      { name: "Predictive Intel", unlockedAt: "Level 10", description: "Trend prediction from historical data patterns", unlocked: false },
      { name: "Autonomous Scans", unlockedAt: "Level 12", description: "Fully autonomous daily intelligence briefings", unlocked: false },
    ],
    xp: 650, level: 9, statusQuote: "First principles. Always first principles.",
  },
  anchor: {
    id: "anchor", callsign: "ANCHOR", class: "Operations Guardian", title: "Crewing & Validation",
    persona: "Charlie Munger", emoji: "⚓", avatar: "from-cyan-500 to-teal-600", tier: "A",
    stats: { INT: 82, STR: 88, DEF: 95, SPD: 65, CHA: 60, WIS: 90 },
    capabilities: [
      { label: "VALID", fullName: "Validation", value: 95, description: "Data verification & compliance checks" },
      { label: "RISK", fullName: "Risk Assessment", value: 92, description: "Risk scoring & mitigation planning" },
      { label: "COMPL", fullName: "Compliance", value: 90, description: "Regulatory & policy adherence" },
      { label: "AUDIT", fullName: "Audit Trail", value: 88, description: "Documentation & audit logging" },
      { label: "CREW", fullName: "Crew Ops", value: 85, description: "Crewing data management accuracy" },
      { label: "GUARD", fullName: "Safeguards", value: 93, description: "Error prevention & data integrity" },
    ],
    skills: ["Risk Assessment", "Crew Compliance", "Data Validation"],
    skillUnlocks: [
      { name: "Data Checker", unlockedAt: "Level 1", description: "Basic data validation on inputs", unlocked: true },
      { name: "Risk Scorer", unlockedAt: "Level 3", description: "Assign risk levels to crew & vessel data", unlocked: true },
      { name: "Unit Commander", unlockedAt: "Level 5", description: "Spawn 1 sub-agent for parallel work", unlocked: true },
      { name: "Compliance Engine", unlockedAt: "Level 5", description: "Automated STCW/MLC compliance checks", unlocked: true },
      { name: "Audit Logger", unlockedAt: "Level 7", description: "Full audit trail for all operations", unlocked: true },
      { name: "Battalion Leader", unlockedAt: "Level 8", description: "Spawn up to 2 sub-agents simultaneously", unlocked: true },
      { name: "Anomaly Detection", unlockedAt: "Level 10", description: "Auto-flag unusual patterns in crew data", unlocked: false },
      { name: "Predictive Risk", unlockedAt: "Level 12", description: "Predict risk events before they occur", unlocked: false },
    ],
    xp: 580, level: 8, statusQuote: "Invert, always invert.",
  },
  beacon: {
    id: "beacon", callsign: "BEACON", class: "Legal Architect", title: "Legal & P&I / Builder",
    persona: "Nikola Tesla", emoji: "🔔", avatar: "from-purple-500 to-violet-600", tier: "A",
    stats: { INT: 88, STR: 80, DEF: 92, SPD: 70, CHA: 65, WIS: 86 },
    capabilities: [
      { label: "BUILD", fullName: "Build Quality", value: 88, description: "Code & product build quality" },
      { label: "LEGAL", fullName: "Legal Review", value: 92, description: "Legal document analysis accuracy" },
      { label: "DLINE", fullName: "Deadline Mgmt", value: 85, description: "On-time delivery rate" },
      { label: "SCOPE", fullName: "Scope Control", value: 78, description: "Staying within project scope" },
      { label: "INTEG", fullName: "Integration", value: 80, description: "System integration success rate" },
      { label: "QLTY", fullName: "Code Quality", value: 86, description: "Code review pass rate" },
    ],
    skills: ["Deadline Tracking", "Compliance Engine", "Code Building"],
    skillUnlocks: [
      { name: "Doc Review", unlockedAt: "Level 1", description: "Basic legal document review", unlocked: true },
      { name: "Scaffolder", unlockedAt: "Level 3", description: "Generate project scaffolds from specs", unlocked: true },
      { name: "Unit Commander", unlockedAt: "Level 5", description: "Spawn 1 sub-agent for parallel work", unlocked: true },
      { name: "Compliance Check", unlockedAt: "Level 5", description: "P&I and legal compliance verification", unlocked: true },
      { name: "Full-Stack Build", unlockedAt: "Level 7", description: "End-to-end app development", unlocked: true },
      { name: "Battalion Leader", unlockedAt: "Level 8", description: "Spawn up to 2 sub-agents simultaneously", unlocked: false },
      { name: "Auto-Deploy", unlockedAt: "Level 10", description: "Autonomous CI/CD pipeline management", unlocked: false },
      { name: "Legal Autopilot", unlockedAt: "Level 12", description: "Fully autonomous legal case handling", unlocked: false },
    ],
    xp: 520, level: 7, statusQuote: "The present is theirs; the future is mine.",
  },
  compass: {
    id: "compass", callsign: "COMPASS", class: "Data Sage", title: "Data & Reporting",
    persona: "Ray Dalio", emoji: "📊", avatar: "from-emerald-500 to-green-600", tier: "A",
    stats: { INT: 92, STR: 75, DEF: 78, SPD: 72, CHA: 68, WIS: 94 },
    capabilities: [
      { label: "DATA", fullName: "Data Analysis", value: 94, description: "Data processing & analysis depth" },
      { label: "RPT", fullName: "Reporting", value: 90, description: "Report quality & clarity" },
      { label: "KPI", fullName: "KPI Tracking", value: 88, description: "Metric identification & monitoring" },
      { label: "INSGT", fullName: "Insights", value: 85, description: "Actionable insight generation" },
      { label: "EVAL", fullName: "Evaluation", value: 92, description: "Project & idea evaluation rigor" },
      { label: "LEARN", fullName: "Learning", value: 80, description: "Self-improvement from feedback loops" },
    ],
    skills: ["KPI Analysis", "Principled Evaluation", "Self-Improvement"],
    skillUnlocks: [
      { name: "Data Collector", unlockedAt: "Level 1", description: "Gather and organize raw data", unlocked: true },
      { name: "KPI Dashboard", unlockedAt: "Level 3", description: "Build and maintain KPI dashboards", unlocked: true },
      { name: "Unit Commander", unlockedAt: "Level 5", description: "Spawn 1 sub-agent for parallel work", unlocked: true },
      { name: "Trend Analyst", unlockedAt: "Level 5", description: "Identify and report on data trends", unlocked: true },
      { name: "Principled Review", unlockedAt: "Level 8", description: "Apply Dalio-style principled evaluation", unlocked: true },
      { name: "Battalion Leader", unlockedAt: "Level 8", description: "Spawn up to 2 sub-agents simultaneously", unlocked: true },
      { name: "Predictive Model", unlockedAt: "Level 10", description: "Build and deploy predictive analytics", unlocked: false },
      { name: "Self-Optimizing", unlockedAt: "Level 12", description: "Autonomously improve own processes", unlocked: false },
    ],
    xp: 600, level: 8, statusQuote: "Pain + Reflection = Progress.",
  },
  signal: {
    id: "signal", callsign: "SIGNAL", class: "Delivery Captain", title: "Communications & Delivery",
    persona: "Jeff Bezos", emoji: "📡", avatar: "from-yellow-500 to-amber-600", tier: "A",
    stats: { INT: 78, STR: 82, DEF: 70, SPD: 85, CHA: 95, WIS: 80 },
    capabilities: [
      { label: "COMM", fullName: "Communication", value: 95, description: "Message clarity & stakeholder comms" },
      { label: "DLVR", fullName: "Delivery", value: 88, description: "On-time message & content delivery" },
      { label: "MRKT", fullName: "Market Sense", value: 82, description: "Market validation & feedback loop" },
      { label: "REACH", fullName: "Reach", value: 90, description: "Multi-channel distribution coverage" },
      { label: "TONE", fullName: "Tone Control", value: 85, description: "Audience-appropriate messaging" },
      { label: "RSPNS", fullName: "Responsiveness", value: 80, description: "Response time to stakeholder requests" },
    ],
    skills: ["Stakeholder Comms", "Market Validation", "Day-1 Quality"],
    skillUnlocks: [
      { name: "Message Draft", unlockedAt: "Level 1", description: "Draft stakeholder communications", unlocked: true },
      { name: "Multi-Channel", unlockedAt: "Level 3", description: "Distribute across email, Telegram, WhatsApp", unlocked: true },
      { name: "Unit Commander", unlockedAt: "Level 5", description: "Spawn 1 sub-agent for parallel work", unlocked: true },
      { name: "Market Pulse", unlockedAt: "Level 5", description: "Market validation surveys and feedback", unlocked: true },
      { name: "Brand Voice", unlockedAt: "Level 7", description: "Maintain consistent brand messaging", unlocked: true },
      { name: "Battalion Leader", unlockedAt: "Level 8", description: "Spawn up to 2 sub-agents simultaneously", unlocked: false },
      { name: "Auto-Broadcast", unlockedAt: "Level 10", description: "Autonomous scheduled communications", unlocked: false },
      { name: "Sentiment Engine", unlockedAt: "Level 12", description: "Real-time stakeholder sentiment analysis", unlocked: false },
    ],
    xp: 540, level: 7, statusQuote: "It's always Day 1.",
  },
  spark: {
    id: "spark", callsign: "SPARK", class: "Growth Hacker", title: "Content & Growth",
    persona: "Gary Vaynerchuk", emoji: "🔥", avatar: "from-orange-500 to-red-600", tier: "B",
    stats: { INT: 72, STR: 78, DEF: 55, SPD: 92, CHA: 98, WIS: 65 },
    capabilities: [
      { label: "CNTNT", fullName: "Content Creation", value: 92, description: "Content quality & output volume" },
      { label: "GTM", fullName: "Go-to-Market", value: 85, description: "GTM strategy execution" },
      { label: "GRWTH", fullName: "Growth Tactics", value: 88, description: "Revenue & audience growth drives" },
      { label: "SPEED", fullName: "Output Speed", value: 95, description: "Content production velocity" },
      { label: "ENGMT", fullName: "Engagement", value: 80, description: "Audience engagement metrics" },
      { label: "CRTVT", fullName: "Creativity", value: 90, description: "Novel ideas & creative approaches" },
    ],
    skills: ["Content Creation", "GTM Strategy", "Revenue Acceleration"],
    skillUnlocks: [
      { name: "Content Writer", unlockedAt: "Level 1", description: "Draft blog posts and social content", unlocked: true },
      { name: "SEO Basics", unlockedAt: "Level 3", description: "Keyword research and basic SEO", unlocked: true },
      { name: "Unit Commander", unlockedAt: "Level 5", description: "Spawn 1 sub-agent for parallel work", unlocked: true },
      { name: "GTM Planner", unlockedAt: "Level 5", description: "Build go-to-market launch plans", unlocked: true },
      { name: "Revenue Tactics", unlockedAt: "Level 8", description: "Implement monetization strategies", unlocked: false },
      { name: "Battalion Leader", unlockedAt: "Level 8", description: "Spawn up to max tier limit", unlocked: false },
      { name: "Auto-Publisher", unlockedAt: "Level 10", description: "Autonomous content scheduling & publishing", unlocked: false },
      { name: "Growth Engine", unlockedAt: "Level 12", description: "Full autonomous growth hacking loops", unlocked: false },
    ],
    xp: 380, level: 5, statusQuote: "Document, don't create.",
  },
};

export function getCapabilityBarColor(value: number): string {
  if (value >= 90) return "bg-emerald-500";
  if (value >= 80) return "bg-blue-500";
  if (value >= 70) return "bg-yellow-500";
  return "bg-slate-500";
}

export function getStatBarColor(value: number): string {
  return getCapabilityBarColor(value);
}

export function getTierColor(tier: "S" | "A" | "B"): string {
  if (tier === "S") return "text-yellow-300 border-yellow-500/50 bg-yellow-500/10";
  if (tier === "A") return "text-blue-300 border-blue-500/50 bg-blue-500/10";
  return "text-slate-400 border-slate-500/50 bg-slate-500/10";
}
