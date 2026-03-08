// HELM Dashboard v3.0 — Shared Type Definitions
// These types match the exact output of getDashboardData() in data.ts

export interface AgentInfo {
  id: string;
  name: string;
  workspace: string;
  telegramGroup: string;
  lastMemoryUpdate: string | null;
  memorySnippet: string | null;
  lastAction: string | null;
  lastActionTime: string | null;
  nextScheduledName: string | null;
  nextScheduledTime: string | null;
  activityStatus: "active" | "recent" | "overdue" | "idle";
  cronJobCount: number;
}

export interface WarRoomEntry {
  id: string;
  agentId: string;
  agentName: string;
  summary: string;
  timestamp: string;
  durationMs: number;
  tokensUsed: number;
  status: string;
  category: "INTEL" | "CREWING" | "LEGAL" | "FLYWHEEL" | "HEALTH" | "INCOME" | "COMMS" | "STRATEGY";
}

export interface CronJob {
  jobId: string;
  name: string;
  enabled: boolean;
  agentId: string;
  schedule: string;
  timezone: string;
  nextRunAt: string | null;
  lastRunAt: string | null;
  lastStatus: string | null;
  lastDurationMs: number | null;
  consecutiveErrors: number;
  deliveryTo: string | null;
}

export interface DeadlineEntry {
  date: string;
  dayLabel: string;
  caseId: string;
  action: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  daysUntil: number;
}

export interface WeekPrepItem {
  day: string;
  items: string[];
  priority: "HIGH" | "MEDIUM" | "LOW" | null;
}

export interface FlywheelItem {
  id: string;
  title: string;
  stage: number;
  stageName: string;
  priority: string;
  assignedAgents: string;
  leadAgent: string;
  deadline: string | null;
  created: string | null;
  lastAdvanced: string | null;
  daysUntilDeadline: number | null;
  isStuck: boolean;
  statusNotes: string[];
  allStatusNotes: string[];
  stalenessHours: number | null;
  project: string;
  projectName: string; // Parsed from **Project:** field (e.g. "MaritimeHub")
}

export interface ActivityEntry {
  time: string;
  agent: string;
  agentId: string;
  action: string;
  sortKey: number;
}

export interface ProjectDomain {
  domain: string;
  priority: string;
  leadAgent: string;
  supportingAgents: string[];
}

export interface ProjectMilestone {
  name: string;
  deadline: string | null;
  status: "pending" | "in_progress" | "completed" | "overdue";
  assignedAgent: string | null;
}

export interface ProjectInfo {
  name: string;
  slug: string;
  status: string;
  priority: string;
  role: string;
  itemCount: number;
  domains: ProjectDomain[];
  flywheelItems: string[];
  taskboardTasks: string[];
  linkedIdeaIds: string[];
  hasAppDirectory: boolean;
  milestones: ProjectMilestone[];
  completedTasks: number;
  totalTasks: number;
  progressPct: number;
  description: string;
  // Staleness detection
  nextDeadline?: string;
  daysToDeadline?: number;
  isStale?: boolean;
  staleReason?: string;
  lastActivity?: string;
  // Process phase tracking
  processPhase?: string; // e.g. "P4: Development"
  processGate?: string;  // e.g. "Gate 3 passed"
  // Deployment links
  liveUrl?: string;      // e.g. "https://maritimehub-web.vercel.app"
  repoUrl?: string;      // e.g. "https://github.com/CryptoAO/maritimehub-web"
  version?: string;      // e.g. "v1.0-alpha"
}

export interface ReviewHistoryEntry {
  timestamp: string;
  agent: string;
  action: string;
}

export interface IncomePipelineIdea {
  id: string;
  title: string;
  addedBy: string;
  addedDate: string;
  status: "PROPOSED" | "REVIEW" | "IN_PROGRESS" | "SHIPPED" | "APPROVED" | "REJECTED" | "DEFERRED" | "PARKED" | "DEPRIORITIZED" | "GO" | "MERGED" | "PLANNING" | "KILLED" | "NEW";
  market: string;
  potential: string;
  effort: string;
  timeToFirst: string;
  nextStep: string;
  thesis: string;
  reviewStage: number | null;
  reviewStageName: string | null;
  currentHolder: string | null;
  reviewHistory: ReviewHistoryEntry[];
  section: "active" | "new" | "parked";
  mergedInto: string | null;
  deadline: string | null;
  responsibleAgent: string | null;
  taskboardTasks: string[];
}

export interface IntelFinding {
  priority: "HIGH" | "MEDIUM" | "LOW";
  title: string;
  summary: string;
  impact: string;
  recommendedAction: string;
  isNew: boolean;
  isCarried: boolean;
}

export interface ContentPlanItem {
  id: number;
  platform: string;
  title: string;
  format: string;
  hook: string;
  effort: string;
  revenueAngle: string;
}

export interface FounderInboxItem {
  type: "income" | "intel" | "content";
  priority: "HIGH" | "MEDIUM" | "LOW";
  title: string;
  subtitle: string;
  source: string;
  sourceAgent: string;
  timestamp: string | null;
  actionNeeded: string;
  detail: string;
  refId: string;
}

// Taskboard types (parsed from agent inbox files)
export interface TaskboardTask {
  id: string;
  agentId: string;
  agentName: string;
  description: string;
  priority: string;
  status: "PENDING" | "APPROVAL_PENDING" | "DONE";
  deadline: string | null;
  from: string | null;
}

// Agent sparkline data (7-day activity trends)
export interface AgentSparklineData {
  agentId: string;
  agentName: string;
  daily: number[]; // last 7 days of action counts
  labels: string[]; // day labels
}

// Agent growth/leveling metrics
export interface AgentGrowthMetrics {
  agentId: string;
  agentName: string;
  // XP system - based on actual cron runs
  totalRuns: number;        // lifetime total cron runs
  totalTokens: number;      // lifetime total tokens used
  successRate: number;      // percentage of successful runs (0-100)
  avgResponseTime: number;  // average duration in seconds
  // 7-day trends
  runsThisWeek: number;
  runsLastWeek: number;
  weekOverWeekChange: number; // percentage change
  // Daily activity for the last 7 days
  dailyRuns: number[];      // 7 numbers
  dailyLabels: string[];    // day names
  // Computed level (1 run = 10 XP, level up every 100 XP)
  level: number;
  xp: number;
  xpToNextLevel: number;
  // Growth trend
  trend: "rising" | "stable" | "declining" | "inactive";
}

// Dashboard improvement backlog (parsed from improvement-log.md)
export interface ImprovementItem {
  id: number;
  idea: string;
  priority: string;
  status: "BACKLOG" | "IN_PROGRESS" | "DONE";
  logged: string;
  completed: string | null;
}

export interface DashboardReview {
  date: string;
  reviewer: string;
  dataFreshness: string;
  layoutScore: string;
  ideas: string[];
  priorityFix: string;
  status: string;
}

export interface DashboardMonitoring {
  version: string;
  improvements: ImprovementItem[];
  reviews: DashboardReview[];
  lastReviewDate: string | null;
  nextReviewTime: string;
  backlogCount: number;
  doneCount: number;
  feedbackCount: number;
  monitoringAgents: { agentId: string; role: string; cronJob: string; schedule: string }[];
  codeProposals: CodeProposal[];
  activeProposalCount: number;
  completedProposalCount: number;
}

// Code proposal types (parsed from code-proposals directory)
export interface CodeProposal {
  id: string;              // "CODE-IMPROVE-001"
  title: string;
  date: string;
  backlogItemId: number;
  priority: string;
  status: "PROPOSED" | "APPROVED" | "REJECTED" | "DEFERRED" | "DONE" | "REVERTED";
  filesToModify: string[];
  filesToCreate: string[];
  estimatedTokens: string;
  risk: "LOW" | "MEDIUM";
  completedDate: string | null;
  gitCommit: string | null;
  actualTokens: string | null;
}

// Analytics types (computed from cron runs JSONL)
export interface TokenUsageDay {
  date: string;
  totalTokens: number;
  estimatedCost: number;
  cronRuns: number;
  byAgent: Record<string, number>;
}

export interface PipelineVelocity {
  stageName: string;
  avgHours: number;
  ideaCount: number;
}

export interface AgentHeatmapRow {
  agentId: string;
  agentName: string;
  hours: number[];
}

export interface CronHealthEntry {
  jobId: string;
  jobName: string;
  totalRuns: number;
  successCount: number;
  failCount: number;
  avgDurationMs: number;
}

export interface AnalyticsData {
  tokenUsage: TokenUsageDay[];
  pipelineVelocity: PipelineVelocity[];
  agentHeatmap: AgentHeatmapRow[];
  cronHealth: CronHealthEntry[];
  totalTokensToday: number;
  estimatedCostToday: number;
  budgetPct: number;
}

export interface SafetyAction {
  id: string;
  label: string;
  description: string;
  severity: "info" | "warn" | "critical";
  cronJobId?: string;
  agentId?: string;
  type: "retry_cron" | "reset_errors" | "delegate_helm" | "escalate";
}

export interface SafetyLevel {
  level: "green" | "amber" | "red";
  label: string;
  message: string;
  actions?: SafetyAction[];
}

// AI Redundancy types
export interface ProviderHealth {
  provider: string;
  label: string;
  status: "online" | "degraded" | "offline" | "unknown";
  hasCredentials: boolean;
  models: { id: string; label: string; default?: boolean }[];
  lastChecked: string | null;
  lastError: string | null;
  rateLimitHits24h: number;
}

export interface AgentFallbackChain {
  agentId: string;
  agentName: string;
  primaryModel: string;
  primaryProvider: string;
  fallbacks: string[];
  currentModel: string;
  isOnFallback: boolean;
  lastFailoverAt: string | null;
  lastFailoverReason: string | null;
}

export interface FailoverEvent {
  timestamp: string;
  agentId: string;
  agentName: string;
  fromModel: string;
  toModel: string;
  reason: string;
  automatic: boolean;
}

export interface RedundancyData {
  providers: ProviderHealth[];
  agentChains: AgentFallbackChain[];
  failoverHistory: FailoverEvent[];
  autoFailoverEnabled: boolean;
  globalFallbackChain: string[];
  totalProvidersOnline: number;
  totalModelsAvailable: number;
}

// Agent Spawning types
export interface SpawnRequest {
  spawnId: string;
  parentId: string;
  name: string;
  fullName?: string;
  task: string;
  skillset: string[];
  model: string;
  fallbackModels?: string[];
  autonomyLevel?: "A0" | "A1" | "A2" | "A3";
  tokenBudget: number;
  tokensUsed: number;
  deadline: string;
  status: "requested" | "approved" | "queued" | "booting" | "active" | "paused" | "completed" | "recalled" | "failed" | "stalled";
  progressPct?: number;
  lastProgressNote?: string | null;
  requestedAt: string;
  approvedAt: string | null;
  approvedBy: string | null;
  bootedAt?: string | null;
  completedAt?: string | null;
  recalledAt?: string | null;
  deliverables?: string[];
  operation?: string | null;
}

export interface SpawnMeta {
  dailyBudget: number;
  dailyUsed: number;
  maxFleetSubAgents: number;
  activeSubAgents: number;
}

export interface SpawningData {
  meta: SpawnMeta;
  spawns: SpawnRequest[];
  byParent: Record<string, { activeSpawns: number; totalTokensToday: number }>;
}

export interface DashboardData {
  timestamp: string;
  gateway: { running: boolean; pid: number | null; uptime: string | null; lastLogEntry: string | null };
  safety: SafetyLevel;
  agents: AgentInfo[];
  cronJobs: CronJob[];
  cases: {
    total: number; high: number; medium: number; low: number; content: string | null;
    activeCases: { id: string; title: string; deadline: string | null; daysUntil: number | null; risk: string; claims: string | null; status: string; weakness: string | null; }[];
  };
  manning: {
    fillRate: string | null; vessels: number | null; content: string | null;
    crewAlerts: { code: string; issue: string; severity: "CRITICAL" | "HIGH" | "MEDIUM"; daysUntil: number | null; detail: string; }[];
  };
  intel: { lastDigest: string | null; lastUpdate: string | null; content: string | null };
  deadlines: { entries: DeadlineEntry[]; totalNext7: number; totalNext30: number; content: string | null };
  weekPrep: { weekLabel: string | null; items: WeekPrepItem[]; content: string | null };
  flywheel: { totalActive: number; items: FlywheelItem[] };
  activity: ActivityEntry[];
  warRoom: WarRoomEntry[];
  watchdog: { lastRun: string | null; lastEntries: string[] };
  projects: ProjectInfo[];
  fleetIdleMinutes: number;
  incomePipeline: {
    ideas: IncomePipelineIdea[];
    totalIdeas: number;
    proposedCount: number;
    reviewCount: number;
    inProgressCount: number;
    shippedCount: number;
    activeCount: number;
    newIdeaCount: number;
    mergedCount: number;
    monthlyRevenue: string;
    targetRevenue: string;
  };
  intelFindings: IntelFinding[];
  contentPlan: ContentPlanItem[];
  founderInbox: FounderInboxItem[];
  resourceMode: { mode: string; pct: number; todayCrons: number };
  nightWatch: boolean;
  taskboard: TaskboardTask[];
  agentSparklines: AgentSparklineData[];
  agentGrowth: AgentGrowthMetrics[];
  dashboardMonitoring: DashboardMonitoring;
  redundancy: RedundancyData;
  spawning: SpawningData;
}

// Agent color/config constants
export const AGENT_COLORS: Record<string, { text: string; bg: string; border: string; letter: string }> = {
  main:    { text: "text-slate-300",   bg: "bg-slate-500/20",   border: "border-slate-500/30",   letter: "H" },
  eagle:   { text: "text-amber-400",   bg: "bg-amber-500/20",   border: "border-amber-500/30",   letter: "E" },
  anchor:  { text: "text-cyan-400",    bg: "bg-cyan-500/20",    border: "border-cyan-500/30",    letter: "A" },
  beacon:  { text: "text-purple-400",  bg: "bg-purple-500/20",  border: "border-purple-500/30",  letter: "B" },
  compass: { text: "text-emerald-400", bg: "bg-emerald-500/20", border: "border-emerald-500/30", letter: "C" },
  signal:  { text: "text-yellow-400",  bg: "bg-yellow-500/20",  border: "border-yellow-500/30",  letter: "S" },
  spark:   { text: "text-orange-400",  bg: "bg-orange-500/20",  border: "border-orange-500/30",  letter: "K" },
};

export const AGENT_NAMES: Record<string, string> = {
  main: "HELM", eagle: "EAGLE", anchor: "ANCHOR", beacon: "BEACON",
  compass: "COMPASS", signal: "SIGNAL", spark: "SPARK",
};

export const REVIEW_STAGES = [
  "HELM_REVIEW", "COMPASS_CHECK", "ANCHOR_RISK", "SIGNAL_MARKET",
  "BEACON_PLAN", "SPARK_GTM", "HELM_FINAL"
] as const;

export const REVIEW_STAGE_AGENT: Record<string, string> = {
  HELM_REVIEW: "main", COMPASS_CHECK: "compass", ANCHOR_RISK: "anchor",
  SIGNAL_MARKET: "signal", BEACON_PLAN: "beacon", SPARK_GTM: "spark", HELM_FINAL: "main"
};

export const WAR_ROOM_CATEGORIES = [
  "ALL", "INTEL", "CREWING", "LEGAL", "FLYWHEEL", "HEALTH", "INCOME", "COMMS", "STRATEGY"
] as const;
