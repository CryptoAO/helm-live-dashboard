import fs from "fs";
import path from "path";

// Resolve OpenClaw dir: check multiple locations (native macOS, VM mount, fallback)
function resolveOpenClawDir(): string {
  const candidates = [
    path.join(process.env.HOME || "", ".openclaw"),
    "/Users/rizaldomadanlo/.openclaw",
    // VM/Cowork mount path (when running snapshot in sandboxed environment)
    path.join(process.env.HOME || "", "mnt", ".openclaw"),
  ];
  for (const c of candidates) {
    try {
      if (c && fs.existsSync(path.join(c, "openclaw.json"))) return c;
    } catch { /* skip */ }
  }
  return candidates[0] || "/Users/rizaldomadanlo/.openclaw";
}
const OPENCLAW_DIR = resolveOpenClawDir();
const SHARED_KB = path.join(OPENCLAW_DIR, "workspace", "shared-kb");
const CRON_FILE = path.join(OPENCLAW_DIR, "cron", "jobs.json");
const CONFIG_FILE = path.join(OPENCLAW_DIR, "openclaw.json");
const GATEWAY_LOG = path.join(OPENCLAW_DIR, "logs", "gateway.log");
const WATCHDOG_LOG = path.join(OPENCLAW_DIR, "logs", "watchdog.log");

function readFileOrNull(fp: string): string | null {
  try {
    return fs.readFileSync(fp, "utf-8");
  } catch {
    return null;
  }
}

function fileModTime(fp: string): string | null {
  try {
    return fs.statSync(fp).mtime.toISOString();
  } catch {
    return null;
  }
}

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
  projectName: string;
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
  nextDeadline?: string;
  daysToDeadline?: number;
  isStale?: boolean;
  staleReason?: string;
  lastActivity?: string;
  processPhase?: string;
  processGate?: string;
  liveUrl?: string;
  repoUrl?: string;
  version?: string;
}

export interface ActivityEntry {
  time: string;
  agent: string;
  agentId: string;
  action: string;
  sortKey: number;
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

// Code proposal types (parsed from code-proposals directory)
export interface CodeProposal {
  id: string;
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

// Dashboard improvement backlog types
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

export interface DashboardData {
  timestamp: string;
  gateway: {
    running: boolean;
    pid: number | null;
    uptime: string | null;
    lastLogEntry: string | null;
  };
  agents: AgentInfo[];
  cronJobs: CronJob[];
  cases: {
    total: number;
    high: number;
    medium: number;
    low: number;
    content: string | null;
  };
  manning: {
    fillRate: string | null;
    vessels: number | null;
    content: string | null;
  };
  intel: {
    lastDigest: string | null;
    lastUpdate: string | null;
    content: string | null;
  };
  deadlines: {
    entries: DeadlineEntry[];
    totalNext7: number;
    totalNext30: number;
    content: string | null;
  };
  weekPrep: {
    weekLabel: string | null;
    items: WeekPrepItem[];
    content: string | null;
  };
  flywheel: {
    totalActive: number;
    items: FlywheelItem[];
  };
  activity: ActivityEntry[];
  watchdog: {
    lastRun: string | null;
    lastEntries: string[];
  };
  projects: ProjectInfo[];
  warRoom: WarRoomEntry[];
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
  safety: { level: "green" | "amber" | "red"; label: string; message: string };
  resourceMode: { mode: string; pct: number; todayCrons: number };
  nightWatch: boolean;
  taskboard: TaskboardTask[];
  agentSparklines: AgentSparklineData[];
  agentGrowth: AgentGrowthMetrics[];
  dashboardMonitoring: DashboardMonitoring;
  redundancy: RedundancyData;
  spawning: SpawningData;
}

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

export interface AgentSparklineData {
  agentId: string;
  agentName: string;
  daily: number[];
  labels: string[];
}

function getGatewayStatus(): DashboardData["gateway"] {
  try {
    const { execSync } = require("child_process");
    const pids = execSync("pgrep -f openclaw-gateway 2>/dev/null || true", {
      encoding: "utf-8",
    }).trim();
    const pidList = pids.split("\n").filter(Boolean);
    const lastLog = readFileOrNull(GATEWAY_LOG);
    const lastLine = lastLog
      ? lastLog.trim().split("\n").pop() || null
      : null;

    return {
      running: pidList.length > 0,
      pid: pidList.length > 0 ? parseInt(pidList[0]) : null,
      uptime: null,
      lastLogEntry: lastLine,
    };
  } catch {
    return { running: false, pid: null, uptime: null, lastLogEntry: null };
  }
}

function getAgents(): AgentInfo[] {
  const config = readFileOrNull(CONFIG_FILE);
  if (!config) return [];

  try {
    const cfg = JSON.parse(config);
    const agents: AgentInfo[] = [];

    for (const agent of cfg.agents?.list || []) {
      const ws = agent.workspace || "";
      const today = new Date().toISOString().split("T")[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

      // Check today's memory file first, then yesterday's as fallback
      const todayFile = path.join(ws, "memory", `${today}.md`);
      const yesterdayFile = path.join(ws, "memory", `${yesterday}.md`);
      const memoryFile = fs.existsSync(todayFile) ? todayFile : yesterdayFile;
      const memContent = readFileOrNull(memoryFile);
      let lastUpdate = fileModTime(memoryFile);

      // Also check session file for most recent activity
      const agentId = agent.id === "main" ? "main" : agent.id;
      const sessionsFile = path.join(OPENCLAW_DIR, "agents", agentId, "sessions", "sessions.json");
      const sessData = readFileOrNull(sessionsFile);
      if (sessData) {
        try {
          const sessions = JSON.parse(sessData);
          // Find most recent session updatedAt
          let maxUpdated = 0;
          for (const sess of Object.values(sessions) as Array<{ updatedAt?: number }>) {
            if (sess.updatedAt && sess.updatedAt > maxUpdated) {
              maxUpdated = sess.updatedAt;
            }
          }
          if (maxUpdated > 0) {
            const sessTime = new Date(maxUpdated).toISOString();
            // Use the most recent of memory file or session
            if (!lastUpdate || sessTime > lastUpdate) {
              lastUpdate = sessTime;
            }
          }
        } catch { /* ignore parse errors */ }
      }

      let snippet: string | null = null;
      if (memContent) {
        const lines = memContent.split("\n").filter((l: string) => l.trim());
        snippet = lines.slice(0, 5).join("\n");
      }

      agents.push({
        id: agent.id,
        name: agent.name,
        workspace: ws,
        telegramGroup: agent.heartbeat?.to || "N/A",
        lastMemoryUpdate: lastUpdate,
        memorySnippet: snippet,
        lastAction: null,
        lastActionTime: null,
        nextScheduledName: null,
        nextScheduledTime: null,
        activityStatus: "idle",
        cronJobCount: 0,
      });
    }
    return agents;
  } catch {
    return [];
  }
}

function getCronJobs(): CronJob[] {
  const raw = readFileOrNull(CRON_FILE);
  if (!raw) return [];

  try {
    const data = JSON.parse(raw);
    return (data.jobs || []).map((j: Record<string, unknown>) => {
      const schedule = j.schedule as Record<string, string> | undefined;
      const state = j.state as Record<string, unknown> | undefined;
      const delivery = j.delivery as Record<string, string> | undefined;

      const nextMs = state?.nextRunAtMs as number | undefined;
      const lastMs = state?.lastRunAtMs as number | undefined;

      return {
        jobId: (j.jobId || j.id) as string,
        name: j.name,
        enabled: j.enabled,
        agentId: j.agentId,
        schedule: schedule?.expr || "?",
        timezone: schedule?.tz || "UTC",
        nextRunAt: nextMs ? new Date(nextMs).toISOString() : null,
        lastRunAt: lastMs ? new Date(lastMs).toISOString() : null,
        lastStatus: (state?.lastStatus as string) || null,
        lastDurationMs: (state?.lastDurationMs as number) || null,
        consecutiveErrors: (state?.consecutiveErrors as number) || 0,
        deliveryTo: delivery?.to || null,
      };
    });
  } catch {
    return [];
  }
}

function getCasesSummary() {
  const tracker = readFileOrNull(path.join(SHARED_KB, "cases", "case-tracker.md"));
  let total = 0, high = 0, medium = 0, low = 0;

  if (tracker) {
    // Format: **Total Active Cases:** 9 | **HIGH Risk:** 3 | **MEDIUM Risk:** 4 | **LOW Risk:** 2
    const totalMatch = tracker.match(/Total Active Cases[:\s*]+(\d+)/i);
    const highMatch = tracker.match(/\*\*HIGH Risk:\*\*\s*(\d+)/);
    const medMatch = tracker.match(/\*\*MEDIUM Risk:\*\*\s*(\d+)/);
    const lowMatch = tracker.match(/\*\*LOW Risk:\*\*\s*(\d+)/);

    if (totalMatch) total = parseInt(totalMatch[1]);
    if (highMatch) high = parseInt(highMatch[1]);
    if (medMatch) medium = parseInt(medMatch[1]);
    if (lowMatch) low = parseInt(lowMatch[1]);
  }

  return { total, high, medium, low, content: tracker };
}

function getManningStatus() {
  const manning = readFileOrNull(path.join(SHARED_KB, "crewing", "manning-status.md"));
  let fillRate: string | null = null;
  let vessels: number | null = null;

  if (manning) {
    // Format: | **Fill rate** | **94.9%** |  OR  | Total vessels | 14 |
    const frMatch = manning.match(/(\d+\.?\d*)%/);
    const vMatch = manning.match(/Total vessels\s*\|\s*(\d+)/i);
    if (frMatch) fillRate = frMatch[1] + "%";
    if (vMatch) vessels = parseInt(vMatch[1]);
  }

  return { fillRate, vessels, content: manning };
}

function getIntelStatus() {
  const today = new Date().toISOString().split("T")[0];
  const digestFile = path.join(SHARED_KB, "intel", `${today}-intel-digest.md`);
  const content = readFileOrNull(digestFile);
  const lastUpdate = fileModTime(digestFile);

  return {
    lastDigest: digestFile,
    lastUpdate,
    content,
  };
}

function getDeadlines(): DashboardData["deadlines"] {
  const today = new Date().toISOString().split("T")[0];
  const content = readFileOrNull(
    path.join(SHARED_KB, "cases", `${today}-deadline-calendar.md`)
  );

  const entries: DeadlineEntry[] = [];
  if (content) {
    // Parse markdown table rows: | **Feb 24 Tue** | CASE-ID | Action | Priority |
    const tableRows = content.match(/\|[^|]+\|[^|]+\|[^|]+\|[^|]+\|/g) || [];
    const now = new Date();
    const currentYear = now.getFullYear();

    for (const row of tableRows) {
      const cells = row.split("|").map((c) => c.trim()).filter(Boolean);
      if (cells.length < 4) continue;

      // Skip header rows
      if (cells[0].includes("Date") || cells[0].includes("---")) continue;

      const dateStr = cells[0].replace(/\*/g, "").trim();
      const caseId = cells[1].trim();
      const action = cells[2].trim();
      const priorityRaw = cells[3].trim();

      let priority: "HIGH" | "MEDIUM" | "LOW" = "LOW";
      if (priorityRaw.includes("HIGH")) priority = "HIGH";
      else if (priorityRaw.includes("MEDIUM")) priority = "MEDIUM";

      // Parse date like "Feb 24 Tue" to compute daysUntil
      const dateMatch = dateStr.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d+)/i);
      let daysUntil = 999;
      let dayLabel = dateStr;
      if (dateMatch) {
        const months: Record<string, number> = {
          Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
          Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
        };
        const monthNum = months[dateMatch[1]];
        const dayNum = parseInt(dateMatch[2]);
        if (monthNum !== undefined) {
          const deadlineDate = new Date(currentYear, monthNum, dayNum);
          daysUntil = Math.ceil((deadlineDate.getTime() - now.getTime()) / 86400000);
          dayLabel = dateStr;
        }
      }

      entries.push({ date: dateStr, dayLabel, caseId, action, priority, daysUntil });
    }
  }

  const totalNext7 = entries.filter((e) => e.daysUntil >= 0 && e.daysUntil <= 7).length;
  const totalNext30 = entries.filter((e) => e.daysUntil >= 0).length;

  return { entries, totalNext7, totalNext30, content };
}

function getWeekPrep(): DashboardData["weekPrep"] {
  // Find the most recent week-prep file
  try {
    const files = fs.readdirSync(SHARED_KB).filter((f: string) => f.includes("week-prep"));
    if (files.length > 0) {
      files.sort().reverse();
      const content = readFileOrNull(path.join(SHARED_KB, files[0]));

      // Parse week label from filename or heading
      let weekLabel: string | null = null;
      const items: WeekPrepItem[] = [];

      if (content) {
        // Extract week label: "# Week of Feb 24..." or from filename
        const headingMatch = content.match(/^#\s+(.+)/m);
        if (headingMatch) weekLabel = headingMatch[1].replace(/\*/g, "").trim();

        // Parse day sections: ## MONDAY Feb 23, ## TUESDAY Feb 24 — CRITICAL, etc.
        const dayPattern = /##\s+(MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY|SUNDAY|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\s+([^]*?)(?=\n##\s+(?:MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY|SUNDAY|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)|\n---|\n#[^#]|$)/gi;
        let dayMatch;
        while ((dayMatch = dayPattern.exec(content)) !== null) {
          const dayName = dayMatch[1];
          const dayContent = dayMatch[2];
          const dayItems: string[] = [];

          // Extract bullet points
          const bullets = dayContent.match(/[-*]\s+.+/g) || [];
          for (const bullet of bullets) {
            dayItems.push(bullet.replace(/^[-*]\s+/, "").replace(/\*/g, "").trim());
          }

          // Detect priority from content
          let priority: "HIGH" | "MEDIUM" | "LOW" | null = null;
          const rawContent = dayContent.toLowerCase();
          if (rawContent.includes("hearing") || rawContent.includes("nlrc") || rawContent.includes("critical") || rawContent.includes("high")) {
            priority = "HIGH";
          } else if (rawContent.includes("report") || rawContent.includes("deadline")) {
            priority = "MEDIUM";
          }

          if (dayItems.length > 0) {
            items.push({ day: dayName, items: dayItems, priority });
          }
        }
      }

      return { weekLabel, items, content };
    }
  } catch { /* ignore */ }
  return { weekLabel: null, items: [], content: null };
}

function getFlywheelItems(): DashboardData["flywheel"] {
  const content = readFileOrNull(
    path.join(SHARED_KB, "flywheel", "active-items.md")
  );
  const items: FlywheelItem[] = [];

  if (content) {
    const stageNames: Record<number, string> = {
      1: "Brilliant Idea",
      2: "Discussion",
      3: "Implementation",
      4: "Delivery",
      5: "Validation",
      6: "Learning",
    };

    // Match flywheel item blocks: ## FW-2026-XXXX — Title
    const itemPattern =
      /## (FW-\d{4}-\d{4})\s*—\s*([\s\S]+?)(?=\n## (?:FW-|Completed)|$)/g;
    let match;
    const now = new Date();

    while ((match = itemPattern.exec(content)) !== null) {
      const id = match[1];
      const block = match[2];

      // Skip completed/archived items — only skip if explicitly marked as CLOSED or has **Completed:** field
      // Do NOT skip items that merely have ✅ in status notes (active items can have completed sub-steps)
      const firstLine = block.split("\n")[0].trim();
      if (block.match(/\*\*(?:Stage|Status):\*\*\s*CLOSED/) || block.match(/\*\*Completed:\*\*/)) continue;
      if (firstLine.includes("✅") && !block.match(/\*\*Stage:\*\*\s*\d/)) continue;

      const rawTitle = block.split("\n")[0].trim();
      // Extract project tag from title: [MARLOW], [SYSTEM], [MULTI], etc.
      const projectTagMatch = rawTitle.match(/\[([A-Z]+)\]/);
      const project = projectTagMatch ? projectTagMatch[1] : "GENERAL";
      const title = rawTitle.replace(/\s*\[[A-Z]+\]\s*/g, "").trim();

      // Parse stage
      const stageMatch = block.match(
        /\*\*Stage:\*\*\s*(\d)\s*(?:—|–|-)\s*(.+)/
      );
      const stage = stageMatch ? parseInt(stageMatch[1]) : 0;
      const stageName =
        stageMatch ? stageMatch[2].trim() : stageNames[stage] || "Unknown";

      // Parse project name (from **Project:** field)
      const projectNameMatch = block.match(/\*\*Project:\*\*\s*(.+)/);
      const projectName = projectNameMatch ? projectNameMatch[1].trim() : "";

      // Parse priority
      const priorityMatch = block.match(/\*\*Priority:\*\*\s*(P\d)/);
      const priority = priorityMatch ? priorityMatch[1] : "P4";

      // Parse assigned agents
      const agentsMatch = block.match(/\*\*Assigned Agents:\*\*\s*(.+)/);
      const assignedAgents = agentsMatch ? agentsMatch[1].trim() : "";
      const leadMatch = assignedAgents.match(/(\w+)\s*\(lead\)/);
      const leadAgent = leadMatch ? leadMatch[1] : assignedAgents.split(",")[0]?.trim() || "";

      // Parse deadline
      const deadlineMatch = block.match(/\*\*Deadline:\*\*\s*(.+)/);
      const deadline = deadlineMatch ? deadlineMatch[1].trim() : null;

      // Compute days until deadline
      let daysUntilDeadline: number | null = null;
      if (deadline) {
        const dlMatch = deadline.match(/(\d{4})-(\d{2})-(\d{2})/);
        if (dlMatch) {
          const dlDate = new Date(
            parseInt(dlMatch[1]),
            parseInt(dlMatch[2]) - 1,
            parseInt(dlMatch[3])
          );
          daysUntilDeadline = Math.ceil(
            (dlDate.getTime() - now.getTime()) / 86400000
          );
        }
      }

      // Parse created
      const createdMatch = block.match(/\*\*Created:\*\*\s*(.+)/);
      const created = createdMatch ? createdMatch[1].trim() : null;

      // Parse last advanced
      const advancedMatch = block.match(/\*\*Last Advanced:\*\*\s*(.+)/);
      const lastAdvanced = advancedMatch ? advancedMatch[1].trim() : null;

      // Check if stuck (>24h at same stage)
      let isStuck = false;
      if (lastAdvanced) {
        const timeMatch = lastAdvanced.match(
          /(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})/
        );
        if (timeMatch) {
          const advDate = new Date(
            parseInt(timeMatch[1]),
            parseInt(timeMatch[2]) - 1,
            parseInt(timeMatch[3]),
            parseInt(timeMatch[4]),
            parseInt(timeMatch[5])
          );
          isStuck = now.getTime() - advDate.getTime() > 24 * 3600000;
        }
      }

      // Parse ALL status notes
      const notesMatch = block.match(/\*\*Status Notes:\*\*\n([\s\S]*?)$/);
      const allStatusNotes: string[] = [];
      if (notesMatch) {
        const noteLines = notesMatch[1]
          .split("\n")
          .filter((l: string) => l.trim().startsWith("-"))
          .map((l: string) => l.replace(/^-\s*/, "").trim());
        allStatusNotes.push(...noteLines);
      }
      const statusNotes = allStatusNotes.slice(0, 3);

      // Compute staleness (hours since last advanced)
      let stalenessHours: number | null = null;
      if (lastAdvanced) {
        const timeMatch = lastAdvanced.match(
          /(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})/
        );
        if (timeMatch) {
          const advDate = new Date(
            parseInt(timeMatch[1]),
            parseInt(timeMatch[2]) - 1,
            parseInt(timeMatch[3]),
            parseInt(timeMatch[4]),
            parseInt(timeMatch[5])
          );
          stalenessHours = Math.round((now.getTime() - advDate.getTime()) / 3600000);
        }
      }

      items.push({
        id,
        title,
        stage,
        stageName,
        priority,
        assignedAgents,
        leadAgent,
        deadline,
        created,
        lastAdvanced,
        daysUntilDeadline,
        isStuck,
        statusNotes,
        allStatusNotes,
        stalenessHours,
        project,
        projectName,
      });
    }
  }

  return { totalActive: items.length, items };
}

function getActivityTimeline(): ActivityEntry[] {
  const entries: ActivityEntry[] = [];
  const config = readFileOrNull(CONFIG_FILE);
  if (!config) return entries;

  try {
    const cfg = JSON.parse(config);
    const agentNames: Record<string, string> = {};
    for (const a of cfg.agents?.list || []) {
      agentNames[a.id] = a.name;
    }

    const today = new Date().toISOString().split("T")[0];

    // Parse agent memory files for today's entries
    for (const agent of cfg.agents?.list || []) {
      const ws = agent.workspace || "";
      const memFile = path.join(ws, "memory", `${today}.md`);
      const mem = readFileOrNull(memFile);
      if (!mem) continue;

      // Extract timestamped entries: lines with time patterns like "07:00" or "[22 07:00]"
      const lines = mem.split("\n");
      for (const line of lines) {
        const timeMatch = line.match(
          /(?:\[?\d{2}\s+)?(\d{2}:\d{2})(?:\]?)/
        );
        if (timeMatch && line.trim().length > 10) {
          const time = timeMatch[1];
          const action = line
            .replace(/^[\s\-*#]+/, "")
            .replace(/\[?\d{2}\s+\d{2}:\d{2}\]?\s*/, "")
            .replace(/^\d{2}:\d{2}\s*/, "")
            .trim();
          if (action.length > 5) {
            const hourMin = time.split(":");
            const sortKey =
              parseInt(hourMin[0]) * 60 + parseInt(hourMin[1]);
            entries.push({
              time,
              agent: agentNames[agent.id] || agent.id,
              agentId: agent.id,
              action: action.substring(0, 120),
              sortKey,
            });
          }
        }
      }
    }

    // Also parse cron job states for recent runs
    const cronRaw = readFileOrNull(CRON_FILE);
    if (cronRaw) {
      const cronData = JSON.parse(cronRaw);
      for (const job of cronData.jobs || []) {
        if (job.state?.lastRunAtMs) {
          const runDate = new Date(job.state.lastRunAtMs);
          const runDateStr = runDate.toISOString().split("T")[0];
          if (runDateStr === today) {
            const time = runDate.toLocaleTimeString("en-PH", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
              timeZone: "Asia/Manila",
            });
            const status =
              job.state.lastStatus === "ok" ? "\u2705" : "\u274C";
            const hourMin = time.split(":");
            const sortKey =
              parseInt(hourMin[0]) * 60 + parseInt(hourMin[1]);
            entries.push({
              time,
              agent: agentNames[job.agentId] || job.agentId,
              agentId: job.agentId,
              action: `${status} ${job.name} (${job.state.lastDurationMs ? Math.round(job.state.lastDurationMs / 1000) + "s" : "?"})`,
              sortKey,
            });
          }
        }
      }
    }
  } catch {
    /* ignore parse errors */
  }

  // Sort by time descending (most recent first)
  entries.sort((a, b) => b.sortKey - a.sortKey);

  // Deduplicate and limit
  const seen = new Set<string>();
  const unique: ActivityEntry[] = [];
  for (const e of entries) {
    const key = `${e.time}-${e.agentId}-${e.action.substring(0, 30)}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(e);
    }
  }

  return unique.slice(0, 20);
}

function getWatchdogStatus() {
  const log = readFileOrNull(WATCHDOG_LOG);
  if (!log) return { lastRun: null, lastEntries: [] };

  const lines = log.trim().split("\n");
  const last20 = lines.slice(-20);
  const lastComplete = lines.filter((l) => l.includes("Watchdog Run Complete")).pop();
  const lastRun = lastComplete
    ? lastComplete.match(/\[(.*?)\]/)?.[1] || null
    : null;

  return { lastRun, lastEntries: last20 };
}

function getProjects(flywheelItems: FlywheelItem[], taskboard: TaskboardTask[], ideas: IncomePipelineIdea[]): ProjectInfo[] {
  const PROJECTS_DIR = path.join(SHARED_KB, "projects");
  const APPS_DIR = path.join(OPENCLAW_DIR, "workspace", "apps");
  const projects: ProjectInfo[] = [];
  const projectSlugs = new Set<string>();

  try {
    const files = fs.readdirSync(PROJECTS_DIR).filter(
      (f: string) => f.endsWith(".md") && f !== "PROJECT-TEMPLATE.md" && f !== "README.md"
    );

    for (const file of files) {
      const content = readFileOrNull(path.join(PROJECTS_DIR, file));
      if (!content) continue;

      // Parse frontmatter — support both YAML frontmatter (status: ACTIVE) and markdown bold (**Status:** ACTIVE)
      const nameMatch = content.match(/^project:\s*(.+)/m) || content.match(/^#\s+(?:Project:\s*)?(.+)/m);
      const statusMatch = content.match(/^status:\s*(.+)/m) || content.match(/\*\*Status:\*\*\s*(\w+)/);
      const priorityMatch = content.match(/^priority:\s*(.+)/m) || content.match(/\*\*Priority:\*\*\s*(\w+)/);
      const roleMatch = content.match(/^role:\s*(.+)/m) || content.match(/\*\*Lead Agent:\*\*\s*(.+)/m);
      const liveUrlMatch = content.match(/^liveUrl:\s*(.+)/m) || content.match(/\*\*Live:\*\*\s*(https?:\/\/\S+)/m) || content.match(/Live:\s*(https?:\/\/\S+)/m);
      const repoUrlMatch = content.match(/^repoUrl:\s*(.+)/m) || content.match(/\*\*Repo:\*\*\s*(https?:\/\/\S+)/m);
      const versionMatch = content.match(/^version:\s*(.+)/m) || content.match(/\*\*Version:\*\*\s*(.+)/m);

      // Extract flywheel tag
      const tagMatch = content.match(/All flywheel items for this project use the tag:\s*`(\w+)`/);
      const slug = tagMatch ? tagMatch[1] : file.replace(".md", "").toUpperCase();
      projectSlugs.add(slug);

      // Parse domain tables: | Domain | Priority | Lead Agent | Supporting |
      const domains: ProjectDomain[] = [];
      const domainTableMatch = content.match(/\|[^|]*Domain[^|]*\|[^|]*Priority[^|]*\|[^|]*Lead[^|]*\|[^|]*Support[^|]*\|([\s\S]*?)(?=\n\n|\n##|\n---)/i);
      if (domainTableMatch) {
        const rows = domainTableMatch[1].split("\n").filter((r: string) => r.trim().startsWith("|") && !r.includes("---"));
        for (const row of rows) {
          const cells = row.split("|").map((c: string) => c.trim()).filter(Boolean);
          if (cells.length >= 3) {
            domains.push({
              domain: cells[0].replace(/\*/g, ""),
              priority: cells[1]?.replace(/\*/g, "") || "MEDIUM",
              leadAgent: cells[2]?.replace(/\*/g, "").trim().toLowerCase() || "",
              supportingAgents: cells[3] ? cells[3].split(",").map((s: string) => s.trim().toLowerCase()) : [],
            });
          }
        }
      }

      // Count flywheel items for this project — match by tag, projectName, title, or slug
      const projectName = nameMatch ? nameMatch[1].trim() : file.replace(".md", "");
      const slugLower = slug.toLowerCase();
      const nameLower = projectName.toLowerCase().replace(/\s+/g, "");
      const projectFwItems = flywheelItems.filter((fw) => {
        if (fw.project.toLowerCase() === slugLower) return true;
        if (fw.projectName && fw.projectName.toLowerCase().replace(/\s+/g, "") === nameLower) return true;
        if (fw.projectName && slugLower.includes(fw.projectName.toLowerCase().replace(/\s+/g, ""))) return true;
        if (fw.title.toLowerCase().replace(/\s+/g, "").includes(nameLower)) return true;
        return false;
      });
      const itemCount = projectFwItems.length;
      const fwIds = projectFwItems.map(fw => fw.id);

      // Find linked pipeline ideas — match by project name in title or slug
      const linkedIdeas = ideas.filter(i => {
        const titleLower = i.title.toLowerCase();
        return titleLower.includes(slugLower) || titleLower.includes(nameLower);
      });
      const linkedIdeaIds = linkedIdeas.map(i => i.id);

      // Find linked taskboard tasks — match by idea prefix using robust multi-prefix strategy
      const linkedTasks: string[] = [];
      for (const ideaId of linkedIdeaIds) {
        const ideaPrefix = ideaId.replace("-", "").toUpperCase(); // "INC010"
        const numericPart = ideaId.replace(/^[A-Z]+-/, ""); // "010"
        const legacyPrefix = "IDEA" + numericPart; // "IDEA010"
        const matching = taskboard.filter(t => {
          const tid = t.id.toUpperCase();
          return tid.startsWith(ideaPrefix) || tid.startsWith(legacyPrefix) ||
                 t.description.includes(ideaId) || t.description.toUpperCase().includes(ideaPrefix);
        });
        linkedTasks.push(...matching.map(t => t.id));
      }

      // Also count [x] checkboxes from the project file itself as a fallback
      const checkboxTotal = (content.match(/^- \[[ x]\]/gm) || []).length;
      const checkboxDone = (content.match(/^- \[x\]/gm) || []).length;

      // Check for app directory
      const appSlug = slug.toLowerCase().replace(/_/g, "-");
      const hasAppDirectory = fs.existsSync(path.join(APPS_DIR, appSlug)) ||
                              fs.existsSync(path.join(APPS_DIR, projectName.toLowerCase().replace(/\s+/g, "-")));

      // Compute milestones from flywheel deadlines + idea deadlines
      const milestones: ProjectMilestone[] = [];
      const now = new Date();
      for (const fw of projectFwItems) {
        if (fw.deadline) {
          const dlMatch = fw.deadline.match(/(\d{4}-\d{2}-\d{2})/);
          let status: ProjectMilestone["status"] = "pending";
          if (dlMatch) {
            const dlDate = new Date(dlMatch[1]);
            if (dlDate < now) status = "overdue";
          }
          if (fw.stage >= 4) status = "completed";
          else if (fw.stage >= 2) status = "in_progress";
          milestones.push({ name: fw.title, deadline: fw.deadline, status, assignedAgent: fw.leadAgent });
        }
      }
      for (const idea of linkedIdeas) {
        if (idea.deadline) {
          let status: ProjectMilestone["status"] = "pending";
          const dlMatch = idea.deadline.match(/(\d{4}-\d{2}-\d{2})/);
          if (dlMatch) {
            const dlDate = new Date(dlMatch[1]);
            if (dlDate < now) status = "overdue";
          }
          if (idea.status === "SHIPPED") status = "completed";
          else if (idea.status === "GO" || idea.status === "IN_PROGRESS") status = "in_progress";
          milestones.push({ name: `MVP: ${idea.title}`, deadline: idea.deadline, status, assignedAgent: idea.responsibleAgent });
        }
      }

      // Compute progress from linked tasks (fallback to [x] checkboxes in project file)
      const allLinkedTasks = taskboard.filter(t => linkedTasks.includes(t.id));
      const completedTasks = allLinkedTasks.filter(t => t.status === "DONE").length;
      const totalTasks = allLinkedTasks.length;
      const progressPct = totalTasks > 0
        ? Math.round((completedTasks / totalTasks) * 100)
        : (checkboxTotal > 0 ? Math.round((checkboxDone / checkboxTotal) * 100) : 0);

      // Parse description (first paragraph after frontmatter)
      const descMatch = content.match(/(?:^|\n\n)([A-Z][\s\S]*?)(?=\n\n|\n##|$)/);
      const description = descMatch ? descMatch[1].replace(/\n/g, " ").trim().substring(0, 200) : "";

      projects.push({
        name: projectName,
        slug,
        status: statusMatch ? statusMatch[1].trim() : "UNKNOWN",
        priority: priorityMatch ? priorityMatch[1].trim() : "SECONDARY",
        role: roleMatch ? roleMatch[1].trim() : "",
        liveUrl: liveUrlMatch ? liveUrlMatch[1].trim() : undefined,
        repoUrl: repoUrlMatch ? repoUrlMatch[1].trim() : undefined,
        version: versionMatch ? versionMatch[1].trim() : undefined,
        itemCount,
        domains,
        flywheelItems: fwIds,
        taskboardTasks: linkedTasks,
        linkedIdeaIds,
        hasAppDirectory,
        milestones,
        completedTasks,
        totalTasks,
        progressPct,
        description,
      });
    }
  } catch { /* ignore */ }

  // Auto-create project entries for GO ideas that don't have a projects/*.md file
  for (const idea of ideas.filter(i => i.status === "GO" || i.status === "IN_PROGRESS")) {
    // Check if this idea is already linked to an existing project
    const alreadyLinked = projects.some(p => p.linkedIdeaIds.includes(idea.id));
    if (alreadyLinked) continue;

    // Create a project entry from the idea
    const appSlug = idea.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "");
    const hasAppDirectory = fs.existsSync(path.join(APPS_DIR, appSlug)) ||
                            fs.existsSync(path.join(APPS_DIR, idea.title.toLowerCase().replace(/\s+/g, "-")));

    // Find taskboard tasks linked to this idea
    // Match tasks using multiple prefix strategies:
    // INC-010 → INC010, but also IDEA010 (legacy format), and numeric part
    const ideaPrefix = idea.id.replace("-", "").toUpperCase(); // "INC010"
    const numericPart = idea.id.replace(/^[A-Z]+-/, ""); // "010"
    const legacyPrefix = "IDEA" + numericPart; // "IDEA010"
    const linkedTasks = taskboard.filter(t => {
      const tid = t.id.toUpperCase();
      return tid.startsWith(ideaPrefix) || tid.startsWith(legacyPrefix) || t.description.includes(idea.id) || t.description.toUpperCase().includes(ideaPrefix);
    });
    const linkedTaskIds = linkedTasks.map(t => t.id);
    const completedTasks = linkedTasks.filter(t => t.status === "DONE").length;
    const totalTasks = linkedTasks.length;

    const milestones: ProjectMilestone[] = [];
    if (idea.deadline) {
      const now = new Date();
      let status: ProjectMilestone["status"] = "in_progress";
      const dlMatch = idea.deadline.match(/(\d{4}-\d{2}-\d{2})/);
      if (dlMatch && new Date(dlMatch[1]) < now) status = "overdue";
      if (idea.status === "SHIPPED") status = "completed";
      milestones.push({ name: `Phase 1 MVP`, deadline: idea.deadline, status, assignedAgent: idea.responsibleAgent });
    }

    projects.push({
      name: idea.title,
      slug: appSlug.toUpperCase(),
      status: hasAppDirectory ? "BUILDING" : "APPROVED",
      priority: "PRIMARY",
      role: "",
      itemCount: 0,
      domains: [],
      flywheelItems: [],
      taskboardTasks: linkedTaskIds,
      linkedIdeaIds: [idea.id],
      hasAppDirectory,
      milestones,
      completedTasks,
      totalTasks,
      progressPct: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      description: idea.thesis || idea.nextStep || "",
    });
  }

  // Always add a SYSTEM project for infrastructure items
  const systemCount = flywheelItems.filter((fw) => fw.project === "SYSTEM").length;
  if (systemCount > 0 || projects.length > 0) {
    const systemFwIds = flywheelItems.filter(fw => fw.project === "SYSTEM").map(fw => fw.id);
    // HELM Fleet is SHIPPED (v3.0 live) with continuous improvement cycle
    // Active SYSTEM flywheel items = still iterating, but product is shipped
    const systemHasActiveFw = systemFwIds.length > 0 && flywheelItems.some(fw => fw.project === "SYSTEM" && fw.stage < 6);
    projects.push({
      name: "HELM Fleet (System)",
      slug: "SYSTEM",
      status: systemHasActiveFw ? "ACTIVE" : "SHIPPED",
      priority: "INFRASTRUCTURE",
      role: "Fleet Operations",
      itemCount: systemCount,
      domains: [],
      flywheelItems: systemFwIds,
      taskboardTasks: [],
      linkedIdeaIds: [],
      hasAppDirectory: false,
      milestones: [],
      completedTasks: 0,
      totalTasks: 0,
      progressPct: 0,
      description: "Fleet infrastructure, tooling, and operational systems — v3.0 live, continuous improvement",
    });
  }

  // Compute staleness for each project — flag projects approaching deadlines with no progress
  const now = new Date();
  for (const project of projects) {
    if (project.slug === "SYSTEM") continue; // System infra has its own monitoring

    // Find the nearest deadline across all milestones
    let nearestDeadline: string | undefined;
    let nearestDays = Infinity;
    for (const ms of project.milestones) {
      const dlMatch = ms.deadline?.match(/(\d{4}-\d{2}-\d{2})/);
      if (dlMatch) {
        const dlDate = new Date(dlMatch[1]);
        const days = Math.ceil((dlDate.getTime() - now.getTime()) / 86_400_000);
        if (days < nearestDays) {
          nearestDays = days;
          nearestDeadline = dlMatch[1];
        }
      }
    }

    if (nearestDeadline) {
      project.nextDeadline = nearestDeadline;
      project.daysToDeadline = nearestDays;
    }

    // Check file modification time for last activity
    const projectFile = path.join(PROJECTS_DIR, `${project.slug.toLowerCase()}.md`);
    const modTime = fileModTime(projectFile);
    if (modTime) {
      project.lastActivity = modTime;
    }

    // Staleness conditions (improved — considers flywheel activity):
    // 1. ACTIVE with no tasks, no flywheel items, and no linked ideas → truly stale
    // 2. ACTIVE with deadline < 14d AND progress < 25% AND no active flywheel items → at risk
    // 3. Project with overdue milestones
    // NOTE: If a flywheel item is actively at S3+ and not stuck, the project is IN SPRINT, not stale
    const isActiveProject = ["ACTIVE", "BUILDING", "APPROVED"].includes(project.status);
    const hasOverdueMilestones = project.milestones.some(m => m.status === "overdue");
    const activeFwItems = flywheelItems.filter(fw => project.flywheelItems.includes(fw.id) && fw.stage >= 3 && !fw.isStuck);
    const hasActiveSprint = activeFwItems.length > 0;

    if (isActiveProject && project.itemCount === 0 && project.totalTasks === 0 && project.linkedIdeaIds.length === 0) {
      project.isStale = true;
      project.staleReason = "No flywheel items, tasks, or linked ideas. Project has no active work stream.";
    } else if (isActiveProject && nearestDays < 14 && project.progressPct < 25 && !hasActiveSprint) {
      project.isStale = true;
      project.staleReason = `Deadline in ${nearestDays}d with only ${project.progressPct}% progress. Needs immediate sprint.`;
    } else if (hasOverdueMilestones && !hasActiveSprint) {
      project.isStale = true;
      project.staleReason = `Has overdue milestones. Needs HELM triage.`;
    }

    // Derive process phase from flywheel stage (per project-development-process.md)
    // S1 → P0/P1, S2 → P2/P3, S3 → P4, S4 → P6, S5 → P5, S6 → P7
    const projectFwItems = flywheelItems.filter(fw => project.flywheelItems.includes(fw.id));
    if (projectFwItems.length > 0) {
      const highestStage = Math.max(...projectFwItems.map(fw => fw.stage));
      const phaseMap: Record<number, string> = {
        1: "P0-P1: Ideation & Validation",
        2: "P2-P3: Refinement & Planning",
        3: "P4: Development",
        4: "P6: Launch & Delivery",
        5: "P5: Testing & Validation",
        6: "P7: Post-Launch & Learning",
      };
      const gateMap: Record<number, string> = {
        1: "Gate 0 passed",
        2: "Gate 1 passed",
        3: "Gate 3 passed — Building",
        4: "Gate 4 passed — Shipping",
        5: "Gate 4 — Validating",
        6: "Gate 5 passed — Live",
      };
      project.processPhase = phaseMap[highestStage] || undefined;
      project.processGate = gateMap[highestStage] || undefined;
    }
  }

  return projects;
}

const INCOME_PIPELINE_FILE = path.join(SHARED_KB, "income", "pipeline.md");
const CONTENT_PLAN_FILE = path.join(SHARED_KB, "content", "daily-plan.md");

const CRON_RUNS_DIR = path.join(OPENCLAW_DIR, "cron", "runs");

interface CronRunRecord {
  ts: number;
  action: string;
  status: string;
  summary: string;
  sessionKey: string;
  runAtMs: number;
  durationMs: number;
  nextRunAtMs?: number;
  usage?: { input_tokens: number; output_tokens: number; total_tokens: number };
}

// Cache parsed cron runs for the duration of a single request cycle
let _cronRunsCache: CronRunRecord[] | null = null;
let _cronRunsCacheTs = 0;
const CRON_RUNS_CACHE_TTL = 5_000; // 5 seconds

function getAllCronRunFiles(): string[] {
  try {
    return fs.readdirSync(CRON_RUNS_DIR)
      .filter(f => f.endsWith(".jsonl"))
      .map(f => path.join(CRON_RUNS_DIR, f));
  } catch {
    return [];
  }
}

function parseCronRuns(): CronRunRecord[] {
  // Return cached result if fresh
  const now = Date.now();
  if (_cronRunsCache && (now - _cronRunsCacheTs) < CRON_RUNS_CACHE_TTL) {
    return _cronRunsCache;
  }

  const files = getAllCronRunFiles();
  const records: CronRunRecord[] = [];
  for (const file of files) {
    const raw = readFileOrNull(file);
    if (!raw) continue;
    const lines = raw.trim().split("\n");
    // Only parse last 500 lines per file for performance
    const recentLines = lines.slice(-500);
    for (const line of recentLines) {
      if (!line.trim()) continue;
      try {
        const rec = JSON.parse(line);
        if (rec.action === "finished" && rec.sessionKey) {
          records.push(rec);
        }
      } catch { /* skip malformed lines */ }
    }
  }

  // Sort by timestamp descending
  records.sort((a, b) => (b.ts || 0) - (a.ts || 0));

  _cronRunsCache = records;
  _cronRunsCacheTs = now;
  return records;
}

function extractAgentFromSessionKey(sessionKey: string): string | null {
  // Format: agent:<agentId>:cron:undefined:run:<sessionId>
  const match = sessionKey.match(/^agent:([^:]+):/);
  return match ? match[1] : null;
}

function classifyWarRoomEntry(agentId: string, summary: string): WarRoomEntry["category"] {
  const lower = summary.toLowerCase();
  if (agentId === "eagle") return "INTEL";
  if (agentId === "anchor") return "CREWING";
  if (agentId === "beacon") {
    if (lower.includes("legal") || lower.includes("case") || lower.includes("nlrc") || lower.includes("compliance")) return "LEGAL";
    return "FLYWHEEL";
  }
  if (agentId === "compass") return "STRATEGY";
  if (agentId === "signal") return "COMMS";
  if (lower.includes("income") || lower.includes("revenue") || lower.includes("php")) return "INCOME";
  if (lower.includes("flywheel") || lower.includes("fw-")) return "FLYWHEEL";
  if (lower.includes("health") || lower.includes("watchdog") || lower.includes("gateway")) return "HEALTH";
  if (lower.includes("crew") || lower.includes("manning") || lower.includes("vessel")) return "CREWING";
  if (lower.includes("intel") || lower.includes("scan") || lower.includes("digest")) return "INTEL";
  return "FLYWHEEL";
}

function getWarRoomFeed(): { entries: WarRoomEntry[]; lastActivityMs: number } {
  const config = readFileOrNull(CONFIG_FILE);
  const agentNames: Record<string, string> = {};
  if (config) {
    try {
      const cfg = JSON.parse(config);
      for (const a of cfg.agents?.list || []) {
        agentNames[a.id] = a.name;
      }
    } catch { /* ignore */ }
  }

  const runs = parseCronRuns();
  let lastActivityMs = 0;

  const entries: WarRoomEntry[] = runs.map((run) => {
    const agentId = extractAgentFromSessionKey(run.sessionKey) || "main";
    if (run.ts > lastActivityMs) lastActivityMs = run.ts;

    // Truncate summary for display (first ~300 chars of first paragraph)
    let displaySummary = run.summary || "";
    // Get first meaningful paragraph (skip empty lines)
    const paragraphs = displaySummary.split("\n\n").filter(p => p.trim());
    if (paragraphs.length > 0) {
      displaySummary = paragraphs[0].replace(/\n/g, " ").trim();
      if (displaySummary.length > 300) {
        displaySummary = displaySummary.substring(0, 297) + "...";
      }
    }

    return {
      id: run.sessionKey,
      agentId,
      agentName: agentNames[agentId] || agentId.toUpperCase(),
      summary: displaySummary,
      timestamp: new Date(run.ts).toISOString(),
      durationMs: run.durationMs || 0,
      tokensUsed: run.usage?.total_tokens || 0,
      status: run.status,
      category: classifyWarRoomEntry(agentId, run.summary || ""),
    };
  });

  // Sort by timestamp descending, limit to 200 (show all agents, not just recent)
  entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return { entries: entries.slice(0, 200), lastActivityMs };
}

function getAgentActivityData(): {
  lastActions: Record<string, { action: string; time: string }>;
  nextScheduled: Record<string, { name: string; time: string }>;
} {
  // Get last action per agent from cron runs
  const runs = parseCronRuns();
  const lastActions: Record<string, { action: string; time: string }> = {};

  // Process runs in chronological order so the last one wins
  for (const run of runs) {
    const agentId = extractAgentFromSessionKey(run.sessionKey);
    if (!agentId) continue;
    // Extract first line of summary as the action description
    let action = run.summary?.split("\n")[0]?.replace(/\*\*/g, "").replace(/[🦅⚓🔔🧭📡💬⚡]/g, "").trim() || "Completed task";
    if (action.length > 80) action = action.substring(0, 77) + "...";
    lastActions[agentId] = {
      action,
      time: new Date(run.ts).toISOString(),
    };
  }

  // Get next scheduled action per agent from cron jobs
  const cronRaw = readFileOrNull(CRON_FILE);
  const nextScheduled: Record<string, { name: string; time: string }> = {};
  if (cronRaw) {
    try {
      const cronData = JSON.parse(cronRaw);
      for (const job of cronData.jobs || []) {
        if (!job.enabled || !job.state?.nextRunAtMs) continue;
        const agentId = job.agentId;
        const nextTime = new Date(job.state.nextRunAtMs).toISOString();
        // Keep the earliest next run per agent
        if (!nextScheduled[agentId] || nextTime < nextScheduled[agentId].time) {
          nextScheduled[agentId] = { name: job.name, time: nextTime };
        }
      }
    } catch { /* ignore */ }
  }

  return { lastActions, nextScheduled };
}

function extractField(block: string, fieldName: string): string {
  // Match both **Field:** value and - **Field:** value patterns, stripping markdown bold markers
  const patterns = [
    new RegExp(`\\*\\*${fieldName}:\\*\\*\\s*(.+)`),
    new RegExp(`-\\s*\\*\\*${fieldName}:\\*\\*\\s*(.+)`),
    new RegExp(`${fieldName}:\\s*(.+)`),
  ];
  for (const pattern of patterns) {
    const match = block.match(pattern);
    if (match) return match[1].replace(/\*\*/g, "").trim();
  }
  return "";
}

function mapPipelineStatus(raw: string): IncomePipelineIdea["status"] {
  const upper = raw.toUpperCase().trim();

  // Terminal states first (order matters)
  if (upper.startsWith("GO")) return "GO";
  if (upper.includes("KILLED") || upper.includes("KILL")) return "KILLED";
  if (upper.includes("MERGED") || upper.includes("FOLD")) return "MERGED";
  if (upper === "SHIPPED") return "SHIPPED";
  if (upper === "REJECTED") return "REJECTED";
  if (upper === "DEFERRED") return "DEFERRED";
  if (upper === "PARKED") return "PARKED";
  if (upper === "DEPRIORITIZED") return "DEPRIORITIZED";
  if (upper.includes("IN_PROGRESS") || upper.includes("IN PROGRESS")) return "IN_PROGRESS";
  if (upper.includes("APPROVED") || upper.includes("CLEARED")) return "APPROVED";

  // Review pipeline agent stages — check BEFORE "NEW"/"PROPOSED" since
  // items can be "NEW — COMPASS_CHECK" or "PROPOSED — Advancing through review pipeline"
  // These are actively IN REVIEW, not raw ideas sitting in Ideation.
  // BEACON_PLAN and SPARK_GTM are late-stage review = PLANNING gate
  if (upper.includes("BEACON_PLAN") || upper.includes("SPARK_GTM") || upper.includes("HELM_FINAL")) return "PLANNING";
  // COMPASS_CHECK, ANCHOR_RISK, SIGNAL_MARKET = mid-stage review = REVIEW gate
  if (upper.includes("COMPASS") || upper.includes("ANCHOR") || upper.includes("SIGNAL_MARKET")) return "REVIEW";
  // HELM_REVIEW = early review = REVIEW gate
  if (upper.includes("HELM_REVIEW") || upper === "REVIEW") return "REVIEW";
  // Planning keyword
  if (upper.includes("PLANNING")) return "PLANNING";
  // Review stage agent name patterns (BEACON, SIGNAL, SPARK in status text)
  if (upper.includes("BEACON") || upper.includes("SIGNAL") || upper.includes("SPARK")) return "PLANNING";
  // Underscore patterns like AGENT_STAGE (but not IN_PROGRESS, already handled)
  if (upper.includes("_") && !upper.includes("IN_PROGRESS")) return "PLANNING";

  // Truly new/unreviewed items stay in Ideation
  if (upper.includes("NEW") && !upper.includes("RENEW")) return "NEW";
  if (upper === "PROPOSED") return "PROPOSED";

  return "PROPOSED";
}

function getIncomePipeline(): DashboardData["incomePipeline"] {
  const content = readFileOrNull(INCOME_PIPELINE_FILE);
  const ideas: IncomePipelineIdea[] = [];

  if (content) {
    // Determine which section each heading falls under
    let currentSection: "active" | "new" | "parked" = "active";

    // Split content into all ### blocks
    const allBlocks = content.split(/(?=^### )/gm).filter(b => b.trim().startsWith("### "));

    for (const rawBlock of allBlocks) {
      // Check what section we're in by looking at the content before this block
      const blockIndex = content.indexOf(rawBlock);
      const beforeBlock = content.substring(0, blockIndex);

      // Match section headers — only look for ## headings (not inline mentions)
      // Pipeline.md uses: ## 🟢 GO / ACTIVE, ## 🟡 PLANNING, ## 🔵 PROPOSED, ## ⚪ DEFERRED, ## ❌ KILLED, ## Last Audit
      const sectionHeaders = beforeBlock.match(/^## .+$/gm) || [];
      const lastHeader = sectionHeaders.length > 0 ? sectionHeaders[sectionHeaders.length - 1].toLowerCase() : "";

      if (lastHeader.includes("killed") || lastHeader.includes("rejected")) {
        currentSection = "parked";
      } else if (lastHeader.includes("deferred") || lastHeader.includes("parked") || lastHeader.includes("deprioritized")) {
        currentSection = "parked";
      } else if (lastHeader.includes("new") || lastHeader.includes("unreviewed") || lastHeader.includes("last audit")) {
        currentSection = "new";
      } else if (lastHeader.includes("go") || lastHeader.includes("active") || lastHeader.includes("approved")) {
        currentSection = "active";
      } else if (lastHeader.includes("planning")) {
        currentSection = "active";
      } else if (lastHeader.includes("proposed")) {
        currentSection = "active";
      } else {
        currentSection = "active";
      }

      const lines = rawBlock.split("\n");
      const heading = lines[0].replace(/^###\s*/, "").trim();
      const block = lines.slice(1).join("\n");

      // Parse IDEA-XXX format: ### IDEA-010: MaritimeHub [GO — APPROVED ...]
      const ideaMatch = heading.match(/^(IDEA-\d{3}):\s*(.+)/);
      // Parse INC-XXX format: ### INC-010 — MaritimeHub: Maritime Intelligence Platform
      const incMatch = heading.match(/^(INC-\d{3}(?:-[A-Z]+)?)\s*(?:—|–|-)\s*(.+)/);
      // Parse date-titled new ideas: ### 2026-02-24 — STCW Phase 2 ...
      const dateMatch = heading.match(/^(\d{4}-\d{2}-\d{2})\s*(?:—|–|-)\s*(.+)/);

      let id: string;
      let title: string;
      let addedDate = "";

      if (ideaMatch) {
        id = ideaMatch[1];
        title = ideaMatch[2].trim();
      } else if (incMatch) {
        id = incMatch[1];
        title = incMatch[2].trim();
      } else if (dateMatch) {
        // Generate ID from title for new ideas
        addedDate = dateMatch[1];
        title = dateMatch[2].trim();
        id = `NEW-${title.substring(0, 20).replace(/[^A-Za-z0-9]/g, "-").toUpperCase()}`;
      } else {
        continue; // Skip non-matching blocks
      }

      // Extract fields with robust parsing (handles **Field:** patterns)
      const statusRaw = extractField(block, "Status");
      const market = extractField(block, "Market");
      const potential = extractField(block, "Potential") || extractField(block, "Revenue potential") || extractField(block, "Revenue Target");
      const effort = extractField(block, "Effort");
      const timeToFirst = extractField(block, "Time to first \\$");
      const nextStep = extractField(block, "Next step") || extractField(block, "Next Action");
      const brand = extractField(block, "Brand");
      const merges = extractField(block, "Merges");
      const deadline = extractField(block, "Phase 1 MVP deadline") || extractField(block, "MVP Deadline") || extractField(block, "Deadline");
      const source = extractField(block, "Source");
      const yearCost = extractField(block, "Year 1 cost estimate");

      // Determine status — check both status field and heading brackets
      const headingBracket = heading.match(/\[([^\]]+)\]/)?.[1] || "";
      const combinedStatus = statusRaw || headingBracket;
      let status: IncomePipelineIdea["status"];

      // Check for merged (in title, status, or heading bracket)
      if (title.toLowerCase().includes("merged") || statusRaw.toLowerCase().includes("merged") || headingBracket.toLowerCase().includes("merged")) {
        status = "MERGED";
      } else if (combinedStatus) {
        status = mapPipelineStatus(combinedStatus);
      } else if (currentSection === "new") {
        status = "PROPOSED";
      } else {
        status = "PROPOSED";
      }

      // Check for merged-into info from title, heading bracket, and block
      let mergedInto: string | null = null;
      if (status === "MERGED" || merges || title.toLowerCase().includes("merged into") || block.toLowerCase().includes("merged into") || block.toLowerCase().includes("folded into")) {
        const mergedMatch = title.match(/(?:[Mm]erged|[Ff]olded) into ((?:IDEA|INC)-\d{3})/) || heading.match(/(?:[Mm]erged|[Ff]olded) into ((?:IDEA|INC)-\d{3})/) || block.match(/(?:[Mm]erged|[Ff]olded) into ((?:IDEA|INC)-\d{3})/);
        if (mergedMatch) mergedInto = mergedMatch[1];
        // Also check for parent merge reference
        if (!mergedInto && merges) {
          const mergesIdea = merges.match(/((?:IDEA|INC)-\d{3})/);
          if (mergesIdea) mergedInto = null; // This idea is the parent, not the merged one
        }
      }

      // Parse review workflow fields
      const reviewStageMatch = block.match(/\*\*Review Stage:\*\*\s*(\d+)\/7\s*(?:—|–|-)\s*(\w+)/);
      const holderMatch = block.match(/\*\*Current Holder:\*\*\s*(\w+)/);
      const reviewHistory: ReviewHistoryEntry[] = [];
      const historySection = block.match(/\*\*Review History:\*\*\n([\s\S]*?)(?=\n\[INCOME\]|\n\*\*Thesis|\n---|\n###|$)/);
      if (historySection) {
        const histLines = historySection[1].split("\n").filter((l: string) => l.trim().startsWith("-"));
        for (const line of histLines) {
          const hMatch = line.match(/\[(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2})\]\s*(\w+)\s+(.*)/);
          if (hMatch) {
            reviewHistory.push({
              timestamp: hMatch[1],
              agent: hMatch[2],
              action: hMatch[3].replace(/^(?:—|–|-)\s*/, "").trim().substring(0, 200),
            });
          }
        }
      }

      // Build thesis from various sources
      let thesis = extractField(block, "Thesis");
      if (!thesis && source) thesis = `Source: ${source}`;
      if (!thesis && brand) thesis = `Brand: ${brand}`;
      if (yearCost && !thesis.includes("cost")) thesis += (thesis ? ". " : "") + `Year 1 cost: ${yearCost}`;

      const addedByMatch = block.match(/\*\*Added:\*\*\s*(\d{4}-\d{2}-\d{2})\s*by\s*(\w+)/);

      ideas.push({
        id,
        title: title.replace(/\[.*?\]/g, "").trim() || title,
        addedBy: addedByMatch ? addedByMatch[2] : (source ? source.split("—")[0].trim() : "HELM"),
        addedDate: addedByMatch ? addedByMatch[1] : addedDate,
        status,
        market,
        potential,
        effort: effort || "MEDIUM",
        timeToFirst,
        nextStep,
        thesis,
        reviewStage: reviewStageMatch ? parseInt(reviewStageMatch[1]) : null,
        reviewStageName: reviewStageMatch ? reviewStageMatch[2] : null,
        currentHolder: holderMatch ? holderMatch[1] : null,
        reviewHistory,
        section: currentSection,
        mergedInto,
        deadline: deadline || null,
        responsibleAgent: null,
        taskboardTasks: [],
      });
    }
  }

  // Parse summary metrics
  let monthlyRevenue = "PHP 0";
  let targetRevenue = "PHP 5,600/month";
  if (content) {
    const revMatch = content.match(/Monthly revenue\s*\|\s*(.+)/);
    const targetMatch = content.match(/Target\s*\|\s*(.+)/);
    if (revMatch) monthlyRevenue = revMatch[1].trim();
    if (targetMatch) targetRevenue = targetMatch[1].trim();
  }

  const proposedCount = ideas.filter(i => i.status === "PROPOSED").length;
  const reviewCount = ideas.filter(i => i.status === "REVIEW" || i.status === "PLANNING").length;
  const inProgressCount = ideas.filter(i => i.status === "IN_PROGRESS" || i.status === "GO").length;
  const shippedCount = ideas.filter(i => i.status === "SHIPPED").length;
  const activeCount = ideas.filter(i => i.section === "active").length;
  const newIdeaCount = ideas.filter(i => i.section === "new").length;
  const mergedCount = ideas.filter(i => i.status === "MERGED").length;

  // Deduplicate by id — last writer wins, but suffix duplicates with a counter
  const seenIds = new Map<string, number>();
  const deduped = ideas.map(idea => {
    const count = seenIds.get(idea.id) ?? 0;
    seenIds.set(idea.id, count + 1);
    if (count > 0) {
      return { ...idea, id: `${idea.id}-${count}` };
    }
    return idea;
  });

  return {
    ideas: deduped,
    totalIdeas: ideas.length,
    proposedCount,
    reviewCount,
    inProgressCount,
    shippedCount,
    activeCount,
    newIdeaCount,
    mergedCount,
    monthlyRevenue,
    targetRevenue,
  };
}

function getIntelFindings(): IntelFinding[] {
  const today = new Date().toISOString().split("T")[0];
  const digestFile = path.join(SHARED_KB, "intel", `${today}-intel-digest.md`);
  const content = readFileOrNull(digestFile);
  if (!content) return [];

  const findings: IntelFinding[] = [];

  // Parse findings sections: ### N. Title
  const findingPattern = /### \d+\.\s*(.+?)\n([\s\S]*?)(?=\n### \d+\.|---|\n## (?:🟢|🟡|🔴|Weather|Upcoming)|$)/g;
  let match;
  while ((match = findingPattern.exec(content)) !== null) {
    const rawTitle = match[1].trim();
    const block = match[2];

    // Determine priority from section context
    const beforeMatch = content.substring(0, match.index);
    let priority: IntelFinding["priority"] = "LOW";
    if (beforeMatch.lastIndexOf("HIGH PRIORITY") > beforeMatch.lastIndexOf("MEDIUM PRIORITY") &&
        beforeMatch.lastIndexOf("HIGH PRIORITY") > beforeMatch.lastIndexOf("LOW PRIORITY")) {
      priority = "HIGH";
    } else if (beforeMatch.lastIndexOf("MEDIUM PRIORITY") > beforeMatch.lastIndexOf("LOW PRIORITY")) {
      priority = "MEDIUM";
    }

    const isNew = rawTitle.includes("NEW") || block.includes("— NEW");
    const isCarried = rawTitle.includes("Carried") || block.includes("Carried Over") || block.includes("Previous cycle");

    const summaryMatch = block.match(/\*\*Summary:\*\*\s*([\s\S]*?)(?=\n\*\*|$)/);
    const impactMatch = block.match(/\*\*Impact:\*\*\s*([\s\S]*?)(?=\n\*\*|$)/);
    const actionMatch = block.match(/\*\*Recommended Action:\*\*\s*([\s\S]*?)(?=\n\*\*|\n###|$)/);

    findings.push({
      priority,
      title: rawTitle.replace(/\*\*/g, "").trim(),
      summary: summaryMatch ? summaryMatch[1].replace(/\n/g, " ").trim().substring(0, 300) : "",
      impact: impactMatch ? impactMatch[1].replace(/\n/g, " ").trim().substring(0, 200) : "",
      recommendedAction: actionMatch ? actionMatch[1].replace(/\n/g, " ").trim().substring(0, 200) : "",
      isNew,
      isCarried,
    });
  }

  return findings;
}

function getContentPlan(): ContentPlanItem[] {
  const content = readFileOrNull(CONTENT_PLAN_FILE);
  if (!content) return [];

  const items: ContentPlanItem[] = [];
  // Match: ## [CONTENT] — Platform — "Title" or ## Content Idea #N
  const contentPattern = /## \[CONTENT\]\s*—\s*(.+?)\s*—\s*"(.+?)"\n([\s\S]*?)(?=\n## \[(?:CONTENT|INCOME)\]|\n---\s*\n## |$)/g;
  let match;
  let idx = 1;
  while ((match = contentPattern.exec(content)) !== null) {
    const platform = match[1].trim();
    const title = match[2].trim();
    const block = match[3];

    const formatMatch = block.match(/\*\*Format:\*\*\s*(.+)/);
    const hookMatch = block.match(/\*\*Hook:\*\*\s*"?(.+?)"?\s*$/m);
    const effortMatch = block.match(/\*\*Effort:\*\*\s*(\w+)/);
    const revenueMatch = block.match(/\*\*Revenue Angle:\*\*\s*(.+)/);

    items.push({
      id: idx++,
      platform,
      title,
      format: formatMatch ? formatMatch[1].trim() : "",
      hook: hookMatch ? hookMatch[1].trim().substring(0, 200) : "",
      effort: effortMatch ? effortMatch[1].trim() : "MEDIUM",
      revenueAngle: revenueMatch ? revenueMatch[1].trim().substring(0, 150) : "",
    });
  }

  return items;
}

function buildFounderInbox(
  incomePipeline: DashboardData["incomePipeline"],
  intelFindings: IntelFinding[],
  contentPlan: ContentPlanItem[]
): FounderInboxItem[] {
  const items: FounderInboxItem[] = [];
  const now = new Date().toISOString();

  // Income ideas that need review (PROPOSED)
  for (const idea of incomePipeline.ideas.filter(i => i.status === "PROPOSED")) {
    items.push({
      type: "income",
      priority: "MEDIUM",
      title: `${idea.id}: ${idea.title}`,
      subtitle: `${idea.potential} · ${idea.effort} effort · ${idea.timeToFirst}`,
      source: "Income Pipeline",
      sourceAgent: idea.addedBy.toLowerCase(),
      timestamp: idea.addedDate || null,
      actionNeeded: "Review & decide: GO / KILL / REFINE",
      detail: idea.nextStep,
      refId: idea.id,
    });
  }

  // HIGH-priority intel findings
  for (const finding of intelFindings.filter(f => f.priority === "HIGH")) {
    items.push({
      type: "intel",
      priority: "HIGH",
      title: finding.title,
      subtitle: finding.isNew ? "🆕 NEW finding" : finding.isCarried ? "📌 Carried over" : "Intel finding",
      source: "EAGLE Intel Digest",
      sourceAgent: "eagle",
      timestamp: now,
      actionNeeded: finding.recommendedAction || "Review & acknowledge",
      detail: finding.impact,
      refId: `intel-${finding.title.substring(0, 20).replace(/\s/g, "-").toLowerCase()}`,
    });
  }

  // Content plan items that need approval
  for (const content of contentPlan) {
    items.push({
      type: "content",
      priority: "LOW",
      title: `${content.platform}: "${content.title}"`,
      subtitle: `${content.format} · ${content.effort} effort`,
      source: "SPARK Content Plan",
      sourceAgent: "spark",
      timestamp: now,
      actionNeeded: "Approve for publishing",
      detail: content.revenueAngle,
      refId: `content-${content.id}`,
    });
  }

  // Sort: HIGH first, then MEDIUM, then LOW
  const priorityOrder: Record<string, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };
  items.sort((a, b) => (priorityOrder[a.priority] || 3) - (priorityOrder[b.priority] || 3));

  return items;
}

const TASKBOARD_DIR = path.join(SHARED_KB, "taskboard");
const AGENT_NAME_MAP: Record<string, string> = {
  main: "HELM", eagle: "EAGLE", anchor: "ANCHOR", beacon: "BEACON",
  compass: "COMPASS", signal: "SIGNAL", spark: "SPARK",
};

function getTaskboard(): TaskboardTask[] {
  const tasks: TaskboardTask[] = [];
  const agentIds = Object.keys(AGENT_NAME_MAP);

  for (const agentId of agentIds) {
    const inboxFile = path.join(TASKBOARD_DIR, `${agentId === "main" ? "helm" : agentId}-inbox.md`);
    const raw = readFileOrNull(inboxFile);
    if (!raw) continue;

    const lines = raw.split("\n");
    let inPending = false;
    let inCompleted = false;
    let currentTask: Partial<TaskboardTask> | null = null;

    for (const line of lines) {
      const trimmed = line.trim();

      if (trimmed.match(/^##\s*Pending\s*Tasks/i)) { inPending = true; inCompleted = false; continue; }
      if (trimmed.match(/^##\s*Completed\s*Tasks/i)) {
        // Flush any pending heading-format task before transitioning
        if (currentTask?.id && inPending) { tasks.push(currentTask as TaskboardTask); currentTask = null; }
        inPending = false; inCompleted = true; continue;
      }
      if (trimmed.startsWith("## ")) {
        if (currentTask?.id && inPending) { tasks.push(currentTask as TaskboardTask); currentTask = null; }
        inPending = false; inCompleted = false; continue;
      }

      // Table-format tasks (used by BEACON, EAGLE, SPARK)
      if (trimmed.startsWith("|") && !trimmed.includes("---") && !trimmed.includes("Task ID")) {
        const cells = trimmed.split("|").map(c => c.trim()).filter(Boolean);
        if (cells.length >= 4) {
          const isDone = cells[3]?.includes("DONE") || cells[3]?.includes("✅");
          tasks.push({
            id: cells[0] || `${agentId}-task`,
            agentId,
            agentName: AGENT_NAME_MAP[agentId] || agentId.toUpperCase(),
            description: cells[1]?.substring(0, 120) || "",
            priority: cells[2] || "P2",
            status: isDone ? "DONE" : "PENDING",
            deadline: cells[5] || null,
            from: null,
          });
        }
        continue;
      }

      // Heading-format tasks (used by HELM inbox)
      if (inPending && trimmed.startsWith("### ")) {
        // Flush previous
        if (currentTask?.id) {
          tasks.push(currentTask as TaskboardTask);
        }
        const title = trimmed.replace(/^###\s*/, "").replace(/\[.*?\]\s*/, "");
        currentTask = {
          id: `${agentId}-${tasks.length}`,
          agentId,
          agentName: AGENT_NAME_MAP[agentId] || agentId.toUpperCase(),
          description: title.substring(0, 120),
          priority: "HIGH",
          status: "PENDING",
          deadline: null,
          from: null,
        };
        continue;
      }

      // Parse metadata lines within heading-format tasks
      if (currentTask && inPending) {
        if (trimmed.startsWith("**From:**")) currentTask.from = trimmed.replace("**From:**", "").trim();
        if (trimmed.startsWith("**Priority:**")) currentTask.priority = trimmed.replace("**Priority:**", "").trim();
        if (trimmed.startsWith("**Status:**")) {
          const status = trimmed.replace("**Status:**", "").trim();
          currentTask.status = status === "APPROVAL_PENDING" ? "APPROVAL_PENDING" : "PENDING";
        }
      }
    }

    // Flush last task
    if (currentTask?.id && inPending) {
      tasks.push(currentTask as TaskboardTask);
    }
  }

  // Sort: APPROVAL_PENDING first, then PENDING, then DONE
  const statusOrder: Record<string, number> = { APPROVAL_PENDING: 0, PENDING: 1, DONE: 2 };
  tasks.sort((a, b) => (statusOrder[a.status] || 3) - (statusOrder[b.status] || 3));

  return tasks;
}

function getAgentSparklines(): AgentSparklineData[] {
  const runs = parseCronRuns();
  const now = new Date();
  const agentIds = Object.keys(AGENT_NAME_MAP);
  const result: AgentSparklineData[] = [];

  for (const agentId of agentIds) {
    const daily: number[] = [];
    const labels: string[] = [];

    for (let d = 6; d >= 0; d--) {
      const date = new Date(now);
      date.setDate(date.getDate() - d);
      const dateStr = date.toISOString().split("T")[0];
      labels.push(date.toLocaleDateString("en", { weekday: "short" }));

      const count = runs.filter(r => {
        const rAgent = extractAgentFromSessionKey(r.sessionKey);
        const rDate = new Date(r.ts).toISOString().split("T")[0];
        return rAgent === agentId && rDate === dateStr;
      }).length;

      daily.push(count);
    }

    result.push({
      agentId,
      agentName: AGENT_NAME_MAP[agentId] || agentId.toUpperCase(),
      daily,
      labels,
    });
  }

  return result;
}

function getCodeProposals(): CodeProposal[] {
  const CODE_PROPOSALS_DIR = path.join(SHARED_KB, "dashboard", "code-proposals");
  const proposals: CodeProposal[] = [];

  try {
    const files = fs.readdirSync(CODE_PROPOSALS_DIR).filter(
      (f: string) => f.startsWith("CODE-IMPROVE-") && f.endsWith(".md") && f !== "CODE-IMPROVE-TEMPLATE.md"
    );

    for (const file of files) {
      const content = readFileOrNull(path.join(CODE_PROPOSALS_DIR, file));
      if (!content) continue;

      const id = file.replace(".md", "");
      const titleMatch = content.match(/^#\s*(?:CODE-IMPROVE-\d+)\s*(?:—|–|-)\s*(.+)/m) || content.match(/\*\*Title:\*\*\s*(.+)/);
      const dateMatch = content.match(/\*\*Date:\*\*\s*(.+)/) || content.match(/\*\*Proposed:\*\*\s*(.+)/);
      const backlogMatch = content.match(/\*\*Backlog Item:\*\*\s*#?(\d+)/);
      const priorityMatch = content.match(/\*\*Priority:\*\*\s*(P\d)/);
      const statusMatch = content.match(/\*\*Status:\*\*\s*(\w+)/);
      const riskMatch = content.match(/\*\*Risk:\*\*\s*(LOW|MEDIUM)/i);
      const tokensMatch = content.match(/\*\*Estimated (?:Tokens|tokens):\*\*\s*(.+)/);
      const commitMatch = content.match(/\*\*(?:Git )?Commit:\*\*\s*(.+)/);
      const actualTokensMatch = content.match(/\*\*Actual (?:Tokens|tokens):\*\*\s*(.+)/);
      const completedMatch = content.match(/\*\*Completed:\*\*\s*(.+)/) || content.match(/\*\*Completion Date:\*\*\s*(.+)/);

      // Parse files to modify
      const filesToModify: string[] = [];
      const filesToCreate: string[] = [];
      const modifySection = content.match(/\*\*Files to modify:\*\*\s*([\s\S]*?)(?=\n\*\*|\n##|$)/);
      if (modifySection) {
        const lines = modifySection[1].split("\n").filter((l: string) => l.trim().startsWith("-") || l.trim().startsWith("`"));
        for (const line of lines) {
          filesToModify.push(line.replace(/^[-*]\s*/, "").replace(/`/g, "").trim());
        }
      }
      const createSection = content.match(/\*\*Files to create:\*\*\s*([\s\S]*?)(?=\n\*\*|\n##|$)/);
      if (createSection) {
        const lines = createSection[1].split("\n").filter((l: string) => l.trim().startsWith("-") || l.trim().startsWith("`"));
        for (const line of lines) {
          filesToCreate.push(line.replace(/^[-*]\s*/, "").replace(/`/g, "").trim());
        }
      }

      // Map status string to valid type
      const rawStatus = statusMatch ? statusMatch[1].toUpperCase() : "PROPOSED";
      type ProposalStatus = CodeProposal["status"];
      const validStatuses: ProposalStatus[] = ["PROPOSED", "APPROVED", "REJECTED", "DEFERRED", "DONE", "REVERTED"];
      const status: ProposalStatus = validStatuses.includes(rawStatus as ProposalStatus)
        ? (rawStatus as ProposalStatus)
        : rawStatus.includes("APPROV") ? "APPROVED"
        : rawStatus.includes("DONE") || rawStatus.includes("COMPLETE") ? "DONE"
        : "PROPOSED";

      proposals.push({
        id,
        title: titleMatch ? titleMatch[1].trim() : file.replace(".md", ""),
        date: dateMatch ? dateMatch[1].trim() : "",
        backlogItemId: backlogMatch ? parseInt(backlogMatch[1]) : 0,
        priority: priorityMatch ? priorityMatch[1] : "P2",
        status,
        filesToModify,
        filesToCreate,
        estimatedTokens: tokensMatch ? tokensMatch[1].trim() : "—",
        risk: riskMatch && riskMatch[1].toUpperCase() === "MEDIUM" ? "MEDIUM" : "LOW",
        completedDate: completedMatch ? completedMatch[1].trim() : null,
        gitCommit: commitMatch ? commitMatch[1].trim() : null,
        actualTokens: actualTokensMatch ? actualTokensMatch[1].trim() : null,
      });
    }
  } catch { /* directory may not exist yet */ }

  // Sort: APPROVED first, then PROPOSED, then DONE, then rest
  const statusOrder: Record<string, number> = { APPROVED: 0, PROPOSED: 1, DONE: 2, REJECTED: 3, DEFERRED: 4, REVERTED: 5 };
  proposals.sort((a, b) => (statusOrder[a.status] ?? 6) - (statusOrder[b.status] ?? 6));

  return proposals;
}

function getDashboardMonitoring(cronJobs: CronJob[]): DashboardMonitoring {
  const IMPROVEMENT_LOG = path.join(SHARED_KB, "dashboard", "improvement-log.md");
  const FEEDBACK_LOG = path.join(SHARED_KB, "dashboard", "feedback-log.md");

  const improvements: ImprovementItem[] = [];
  const reviews: DashboardReview[] = [];

  // Parse improvement-log.md backlog table
  const logContent = readFileOrNull(IMPROVEMENT_LOG);
  if (logContent) {
    // Parse backlog table rows: | # | Idea | Priority | Status | Logged | Completed |
    const tableLines = logContent.split("\n").filter((line: string) =>
      line.startsWith("|") && /^\|\s*\d+\s*\|/.test(line)
    );
    for (const line of tableLines) {
      const cells = line.split("|").map((c: string) => c.trim()).filter(Boolean);
      if (cells.length >= 5) {
        const id = parseInt(cells[0]);
        const status = cells[3]?.toUpperCase() as "BACKLOG" | "IN_PROGRESS" | "DONE";
        improvements.push({
          id: isNaN(id) ? 0 : id,
          idea: cells[1] || "",
          priority: cells[2] || "—",
          status: status === "DONE" ? "DONE" : status === "IN_PROGRESS" ? "IN_PROGRESS" : "BACKLOG",
          logged: cells[4] || "",
          completed: cells[5] && cells[5] !== "—" ? cells[5] : null,
        });
      }
    }

    // Parse review history sections
    const reviewMatches = logContent.matchAll(/### (\d{4}-\d{2}-\d{2}[^—\n]*)\s*—\s*([^\n]+)/g);
    for (const match of reviewMatches) {
      const date = match[1].trim();
      const reviewer = match[2].trim();

      // Extract section content until next ### or end
      const startIdx = logContent.indexOf(match[0]);
      const nextSection = logContent.indexOf("\n### ", startIdx + 1);
      const sectionContent = logContent.substring(startIdx, nextSection > 0 ? nextSection : undefined);

      const freshnessMatch = sectionContent.match(/\*\*Data Freshness:\*\*\s*(.+)/);
      const layoutMatch = sectionContent.match(/\*\*Layout Score:\*\*\s*(.+)/);
      const priorityFixMatch = sectionContent.match(/\*\*Priority Fix:\*\*\s*(.+)/);
      const statusMatch = sectionContent.match(/\*\*Status:\*\*\s*(.+)/);

      // Extract ideas from numbered lists within Ideas section
      const ideas: string[] = [];
      const ideasSection = sectionContent.match(/\*\*Ideas:\*\*([\s\S]*?)(?=\*\*|$)/);
      if (ideasSection) {
        const numberedItems = ideasSection[1].matchAll(/\d+\.\s+(.+)/g);
        for (const item of numberedItems) {
          ideas.push(item[1].trim());
        }
      }

      reviews.push({
        date,
        reviewer,
        dataFreshness: freshnessMatch ? freshnessMatch[1].trim() : "—",
        layoutScore: layoutMatch ? layoutMatch[1].trim() : "—",
        ideas,
        priorityFix: priorityFixMatch ? priorityFixMatch[1].trim() : "None",
        status: statusMatch ? statusMatch[1].trim() : "LOGGED",
      });
    }
  }

  // Count feedback entries
  const feedbackContent = readFileOrNull(FEEDBACK_LOG);
  let feedbackCount = 0;
  if (feedbackContent) {
    const feedbackEntries = feedbackContent.matchAll(/### \d{4}-\d{2}-\d{2}/g);
    feedbackCount = Array.from(feedbackEntries).length;
  }

  // Find dashboard-related cron jobs for monitoring agents
  const dashboardCron = cronJobs.find((j: CronJob) => j.jobId === "helm-dashboard-review");
  const compassCron = cronJobs.find((j: CronJob) => j.jobId === "compass-self-improvement");

  const monitoringAgents = [
    {
      agentId: "main",
      role: "Dashboard steward — nightly review, logs improvements, coordinates fixes",
      cronJob: "helm-dashboard-review",
      schedule: dashboardCron?.schedule || "19:50 daily",
    },
    {
      agentId: "compass",
      role: "Quality gate — tracks owner feedback (P0), validates data integrity",
      cronJob: "compass-self-improvement",
      schedule: compassCron?.schedule || "11:15 Mondays",
    },
  ];

  const backlogCount = improvements.filter(i => i.status === "BACKLOG").length;
  const doneCount = improvements.filter(i => i.status === "DONE").length;
  const lastReviewDate = reviews.length > 0 ? reviews[0].date : null;

  // Parse code proposals
  const codeProposals = getCodeProposals();
  const activeProposalCount = codeProposals.filter(p => p.status === "PROPOSED" || p.status === "APPROVED").length;
  const completedProposalCount = codeProposals.filter(p => p.status === "DONE").length;

  return {
    version: "3.0",
    improvements,
    reviews,
    lastReviewDate,
    nextReviewTime: "19:50 PHT today",
    backlogCount,
    doneCount,
    feedbackCount,
    monitoringAgents,
    codeProposals,
    activeProposalCount,
    completedProposalCount,
  };
}

function getAgentGrowthMetrics(): AgentGrowthMetrics[] {
  const runs = parseCronRuns();
  const agentIds = Object.keys(AGENT_NAME_MAP);
  const now = Date.now();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayMs = today.getTime();

  // Define date ranges: Feb 15-21 (last week), Feb 22-28 (this week)
  const lastWeekStart = new Date(2026, 1, 15); // Feb 15
  const lastWeekEnd = new Date(2026, 1, 22);  // Feb 22 00:00 (exclusive)
  const thisWeekStart = new Date(2026, 1, 22); // Feb 22
  const thisWeekEnd = new Date(2026, 1, 29);  // Feb 29 00:00 (exclusive)

  const lastWeekStartMs = lastWeekStart.getTime();
  const lastWeekEndMs = lastWeekEnd.getTime();
  const thisWeekStartMs = thisWeekStart.getTime();
  const thisWeekEndMs = thisWeekEnd.getTime();

  const metrics: AgentGrowthMetrics[] = [];

  for (const agentId of agentIds) {
    // Filter runs for this agent
    const agentRuns = runs.filter(
      r => extractAgentFromSessionKey(r.sessionKey) === agentId
    );

    if (agentRuns.length === 0) {
      // Inactive agent
      metrics.push({
        agentId,
        agentName: AGENT_NAME_MAP[agentId] || agentId.toUpperCase(),
        totalRuns: 0,
        totalTokens: 0,
        successRate: 0,
        avgResponseTime: 0,
        runsThisWeek: 0,
        runsLastWeek: 0,
        weekOverWeekChange: 0,
        dailyRuns: [0, 0, 0, 0, 0, 0, 0],
        dailyLabels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        level: 0,
        xp: 0,
        xpToNextLevel: 100,
        trend: "inactive",
      });
      continue;
    }

    // Compute lifetime stats
    const totalRuns = agentRuns.length;
    const totalTokens = agentRuns.reduce((sum, r) => sum + (r.usage?.total_tokens || 0), 0);
    const successRuns = agentRuns.filter(r => r.status === "ok").length;
    const successRate = totalRuns > 0 ? Math.round((successRuns / totalRuns) * 100) : 0;
    const avgResponseTime = totalRuns > 0
      ? Math.round(agentRuns.reduce((sum, r) => sum + (r.durationMs || 0), 0) / totalRuns / 1000)
      : 0;

    // Count runs by week
    const runsLastWeek = agentRuns.filter(r => r.ts >= lastWeekStartMs && r.ts < lastWeekEndMs).length;
    const runsThisWeek = agentRuns.filter(r => r.ts >= thisWeekStartMs && r.ts < thisWeekEndMs).length;
    const weekOverWeekChange = runsLastWeek > 0
      ? Math.round(((runsThisWeek - runsLastWeek) / runsLastWeek) * 100)
      : (runsThisWeek > 0 ? 100 : 0);

    // Compute daily runs for last 7 days (Feb 22-28, which is this week)
    const dailyRuns: number[] = [];
    const dailyLabels: string[] = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 0; i < 7; i++) {
      const dayStart = new Date(thisWeekStart);
      dayStart.setDate(dayStart.getDate() + i);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const dayStartMs = dayStart.getTime();
      const dayEndMs = dayEnd.getTime();
      const dayRuns = agentRuns.filter(r => r.ts >= dayStartMs && r.ts < dayEndMs).length;

      dailyRuns.push(dayRuns);
      dailyLabels.push(dayNames[dayStart.getDay()]);
    }

    // Compute XP and level (1 run = 10 XP, level up every 100 XP)
    const xp = (totalRuns * 10) % 100;
    const level = Math.floor((totalRuns * 10) / 100);
    const xpToNextLevel = 100 - xp;

    // Determine trend based on week-over-week change
    let trend: "rising" | "stable" | "declining" | "inactive";
    if (runsThisWeek === 0) {
      trend = "inactive";
    } else if (weekOverWeekChange > 20) {
      trend = "rising";
    } else if (weekOverWeekChange < -20) {
      trend = "declining";
    } else {
      trend = "stable";
    }

    metrics.push({
      agentId,
      agentName: AGENT_NAME_MAP[agentId] || agentId.toUpperCase(),
      totalRuns,
      totalTokens,
      successRate,
      avgResponseTime,
      runsThisWeek,
      runsLastWeek,
      weekOverWeekChange,
      dailyRuns,
      dailyLabels,
      level,
      xp,
      xpToNextLevel,
      trend,
    });
  }

  return metrics;
}

export function getDashboardData(): DashboardData {
  const flywheel = getFlywheelItems();
  const { lastActions, nextScheduled } = getAgentActivityData();
  const warRoomData = getWarRoomFeed();
  const cronJobs = getCronJobs();

  // Compute fleet idle minutes
  const now = Date.now();
  const fleetIdleMinutes = warRoomData.lastActivityMs > 0
    ? Math.round((now - warRoomData.lastActivityMs) / 60000)
    : 9999;

  // Enhance agents with activity data
  const agents = getAgents();
  const enhancedAgents = agents.map((agent) => {
    const la = lastActions[agent.id];
    const ns = nextScheduled[agent.id];

    // Compute activity status — use most recent of lastAction or lastMemoryUpdate
    let activityStatus: AgentInfo["activityStatus"] = "idle";
    const memTime = agent.lastMemoryUpdate ? new Date(agent.lastMemoryUpdate).getTime() : 0;
    const actionTime = la ? new Date(la.time).getTime() : 0;
    const latestActivity = Math.max(memTime, actionTime);
    if (latestActivity > 0) {
      const hoursSince = (now - latestActivity) / 3600000;
      if (hoursSince < 1) activityStatus = "active";
      else if (hoursSince < 6) activityStatus = "recent";
      else {
        if (ns) activityStatus = "overdue";
        else activityStatus = "idle";
      }
    }

    return {
      ...agent,
      lastAction: la?.action || null,
      lastActionTime: la?.time || null,
      nextScheduledName: ns?.name || null,
      nextScheduledTime: ns?.time || null,
      activityStatus,
      cronJobCount: cronJobs.filter(j => j.agentId === agent.id).length,
    };
  });

  const cases = getCasesSummary();
  const incomePipeline = getIncomePipeline();
  const intelFindings = getIntelFindings();
  const contentPlan = getContentPlan();
  const founderInbox = buildFounderInbox(incomePipeline, intelFindings, contentPlan);
  const taskboard = getTaskboard();

  // Enrich pipeline ideas with responsible agent and linked taskboard tasks
  for (const idea of incomePipeline.ideas) {
    // Match both INC010 (new format) and IDEA010 (legacy format)
    const ideaPrefix = idea.id.replace("-", "").toUpperCase();
    const numericPart = idea.id.replace(/^[A-Z]+-/, "");
    const legacyPrefix = "IDEA" + numericPart;
    const linkedTasks = taskboard.filter(t => {
      const tid = t.id.toUpperCase();
      return tid.startsWith(ideaPrefix) || tid.startsWith(legacyPrefix) || t.description.includes(idea.id) || t.description.toUpperCase().includes(ideaPrefix);
    });
    idea.taskboardTasks = linkedTasks.map(t => t.id);

    // Determine responsible agent based on status
    if (idea.status === "GO" || idea.status === "IN_PROGRESS") {
      // For GO ideas, check taskboard for who has tasks
      if (linkedTasks.length > 0) {
        idea.responsibleAgent = linkedTasks[0].agentId;
      } else {
        idea.responsibleAgent = "beacon"; // BEACON handles builds by default
      }
    } else if (idea.status === "PLANNING") {
      // Extract agent from status text or default to beacon
      const statusLower = idea.thesis?.toLowerCase() || "";
      if (statusLower.includes("beacon")) idea.responsibleAgent = "beacon";
      else if (statusLower.includes("compass")) idea.responsibleAgent = "compass";
      else if (statusLower.includes("signal")) idea.responsibleAgent = "signal";
      else idea.responsibleAgent = "beacon";
    } else if (idea.status === "REVIEW") {
      // Use currentHolder from review stage
      idea.responsibleAgent = idea.currentHolder?.toLowerCase() || null;
    } else if (idea.status === "MERGED") {
      idea.responsibleAgent = null; // Merged ideas don't have an active owner
    } else if (idea.status === "PROPOSED") {
      // Show who proposed it
      const addedByLower = idea.addedBy.toLowerCase();
      if (addedByLower.includes("eagle")) idea.responsibleAgent = "eagle";
      else if (addedByLower.includes("spark")) idea.responsibleAgent = "spark";
      else if (addedByLower.includes("beacon")) idea.responsibleAgent = "beacon";
      else if (addedByLower.includes("compass")) idea.responsibleAgent = "compass";
      else if (addedByLower.includes("signal")) idea.responsibleAgent = "signal";
      else if (addedByLower.includes("anchor")) idea.responsibleAgent = "anchor";
      else idea.responsibleAgent = "eagle"; // EAGLE scan is most common source
    }
  }

  // Compute safety level with actionable remediation (SOUL.md §8.3 — Proactive Behaviors)
  const failedCronJobs = cronJobs.filter(j => j.consecutiveErrors > 0);
  const cronErrors = failedCronJobs.length;
  const overdueAgents = enhancedAgents.filter(a => a.activityStatus === "overdue").length;

  // Build remediation actions per HELM Autonomy Framework (AGENTS.md):
  // - T1: Run status checks (autonomous)
  // - T2: Pause/reschedule cron jobs, flag overdue items (execute & notify)
  const safetyActions: Array<{ id: string; label: string; description: string; severity: "info" | "warn" | "critical"; cronJobId?: string; agentId?: string; type: "retry_cron" | "reset_errors" | "delegate_helm" | "escalate" }> = [];

  for (const job of failedCronJobs) {
    const agentName = (job.agentId || "unknown").toUpperCase();
    safetyActions.push({
      id: `retry-${job.jobId}`,
      label: `Retry ${job.name}`,
      description: `${job.consecutiveErrors} consecutive errors on ${agentName}'s cron. Trigger immediate re-run.`,
      severity: job.consecutiveErrors >= 3 ? "critical" : "warn",
      cronJobId: job.jobId,
      agentId: job.agentId,
      type: "retry_cron",
    });
    if (job.consecutiveErrors >= 3) {
      safetyActions.push({
        id: `reset-${job.jobId}`,
        label: `Reset ${job.name} errors`,
        description: `Clear error counter and re-enable job. Per Fleet Captain Authority, HELM can reschedule cron jobs (T2).`,
        severity: "warn",
        cronJobId: job.jobId,
        agentId: job.agentId,
        type: "reset_errors",
      });
    }
  }

  // If there are unresolved errors, offer HELM delegation (SOUL.md delegation protocol)
  if (cronErrors > 0) {
    safetyActions.push({
      id: "delegate-helm",
      label: "Delegate to HELM",
      description: `Route cron failures to HELM Command for triage. HELM will diagnose, reschedule, or escalate per priority rules.`,
      severity: cronErrors >= 3 ? "critical" : "warn",
      type: "delegate_helm",
    });
  }

  let safety: { level: "green" | "amber" | "red"; label: string; message: string; actions?: typeof safetyActions };
  if (cronErrors > 3 || cases.high > 5) {
    safety = { level: "red", label: "CRITICAL", message: `${cronErrors} cron errors · ${cases.high} high-priority cases`, actions: safetyActions };
  } else if (cronErrors > 0 || overdueAgents > 0) {
    safety = { level: "amber", label: "WARNING", message: `${cronErrors} cron error${cronErrors !== 1 ? "s" : ""} · ${overdueAgents} agent${overdueAgents !== 1 ? "s" : ""} overdue`, actions: safetyActions };
  } else {
    safety = { level: "green", label: "ALL CLEAR", message: "Fleet nominal · All systems operational" };
  }

  // Compute resource mode (token budget tracking)
  const today = new Date().toISOString().split("T")[0];
  const todayRuns = parseCronRuns().filter(r => new Date(r.ts).toISOString().split("T")[0] === today);
  const todayTokens = todayRuns.reduce((sum, r) => sum + (r.usage?.total_tokens || 0), 0);
  const dailyBudget = 3.33;
  const estimatedCost = todayTokens * 0.00001;
  const fuelPct = Math.max(0, Math.min(100, Math.round((1 - estimatedCost / dailyBudget) * 100)));
  const resourceMode = {
    mode: fuelPct > 60 ? "FULL_POWER" : fuelPct > 30 ? "BALANCED" : "CONSERVATION",
    pct: fuelPct,
    todayCrons: todayRuns.length,
  };

  const nightWatch = new Date().getHours() >= 22 || new Date().getHours() < 6;

  return {
    timestamp: new Date().toISOString(),
    gateway: getGatewayStatus(),
    safety,
    agents: enhancedAgents,
    cronJobs,
    cases,
    manning: getManningStatus(),
    intel: getIntelStatus(),
    deadlines: getDeadlines(),
    weekPrep: getWeekPrep(),
    flywheel,
    activity: getActivityTimeline(),
    watchdog: getWatchdogStatus(),
    projects: getProjects(flywheel.items, taskboard, incomePipeline.ideas),
    warRoom: warRoomData.entries,
    fleetIdleMinutes,
    incomePipeline,
    intelFindings,
    contentPlan,
    founderInbox,
    resourceMode,
    nightWatch,
    taskboard,
    agentSparklines: getAgentSparklines(),
    agentGrowth: getAgentGrowthMetrics(),
    dashboardMonitoring: getDashboardMonitoring(cronJobs),
    redundancy: getRedundancyData(),
    spawning: getSpawningData(),
  };
}

// ── AI Redundancy Data ──────────────────────────────────────────────
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

function getRedundancyData(): RedundancyData {
  // Read config
  const configRaw = readFileOrNull(CONFIG_FILE);
  const config = configRaw ? JSON.parse(configRaw) : {};
  const agentList = config?.agents?.list || [];
  const defaults = config?.agents?.defaults || {};
  const globalFallbacks = defaults?.model?.fallbacks || [];

  // Read provider state
  const stateFile = path.join(OPENCLAW_DIR, "provider-state.json");
  const stateRaw = readFileOrNull(stateFile);
  const providerState = stateRaw ? JSON.parse(stateRaw) : {};
  const availableProviders = providerState.availableProviders || {};

  // Read failover log
  const failoverLogFile = path.join(OPENCLAW_DIR, "logs", "failover.jsonl");
  const failoverRaw = readFileOrNull(failoverLogFile);
  const failoverHistory: FailoverEvent[] = [];
  if (failoverRaw) {
    for (const line of failoverRaw.trim().split("\n")) {
      try { failoverHistory.push(JSON.parse(line)); } catch { /* skip */ }
    }
  }
  failoverHistory.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Check env for credentials
  const envFile = path.join(OPENCLAW_DIR, ".env");
  const envRaw = readFileOrNull(envFile) || "";
  const hasOpenAI = (envRaw.includes("OPENAI_API_KEY=") && !envRaw.includes("OPENAI_API_KEY=\n"))
    || !!(config?.auth?.profiles?.["openai-codex:default"])
    || !!(config?.auth?.profiles?.["openai:default"]);
  const hasAnthropic = !!(config?.auth?.profiles?.["anthropic:default"]);
  const hasGoogle = !!(config?.skills?.entries?.["nano-banana-pro"]?.apiKey)
    || !!(config?.auth?.profiles?.["google:default"]);

  // Count rate limit hits from failover log (last 24h)
  const now = Date.now();
  const last24h = failoverHistory.filter(e => now - new Date(e.timestamp).getTime() < 86400000);
  const rateLimitsByProvider: Record<string, number> = {};
  for (const e of last24h) {
    if (e.reason.includes("rate_limit") || e.reason.includes("429")) {
      const prov = e.fromModel.split("/")[0];
      rateLimitsByProvider[prov] = (rateLimitsByProvider[prov] || 0) + 1;
    }
  }

  // Build provider health list (exclude xAI — no credentials)
  const providers: ProviderHealth[] = [];
  for (const [pid, pdata] of Object.entries(availableProviders)) {
    if (pid === "xai") continue; // Removed — no credentials
    const p = pdata as { label: string; models: Record<string, { label: string; default?: boolean }> };
    const hasCreds = pid === "anthropic" ? hasAnthropic : pid === "openai" ? hasOpenAI : pid === "google" ? hasGoogle : false;
    const rlHits = rateLimitsByProvider[pid] || 0;
    providers.push({
      provider: pid,
      label: p.label,
      status: hasCreds ? (rlHits > 5 ? "degraded" : "online") : "offline",
      hasCredentials: hasCreds,
      models: Object.entries(p.models).map(([mid, m]) => ({ id: mid, label: m.label, default: m.default })),
      lastChecked: new Date().toISOString(),
      lastError: rlHits > 0 ? `${rlHits} rate limit hits in last 24h` : null,
      rateLimitHits24h: rlHits,
    });
  }

  // Build per-agent fallback chains
  const agentChains: AgentFallbackChain[] = agentList.map((a: { id: string; name: string; model?: { primary: string; fallbacks?: string[] } }) => {
    const primaryModel = a.model?.primary || defaults?.model?.primary || "anthropic/claude-opus-4-6";
    const primaryProvider = primaryModel.split("/")[0];
    const agentFallbacks = a.model?.fallbacks || globalFallbacks;
    // Filter out xAI models from fallback chains
    const cleanFallbacks = agentFallbacks.filter((m: string) => !m.startsWith("xai/"));
    return {
      agentId: a.id,
      agentName: a.name,
      primaryModel,
      primaryProvider,
      fallbacks: cleanFallbacks,
      currentModel: primaryModel, // Will be overridden if failover is active
      isOnFallback: false,
      lastFailoverAt: null,
      lastFailoverReason: null,
    };
  });

  // Enrich with failover history — but config primary is source of truth
  // If the config primary was changed after the last failover event, the config wins.
  for (const chain of agentChains) {
    const lastEvent = failoverHistory.find(e => e.agentId === chain.agentId);
    if (lastEvent) {
      const configPrimary = chain.primaryModel; // Already read from config above
      if (lastEvent.toModel === configPrimary) {
        // Failover target matches current primary — agent is on-primary
        chain.currentModel = configPrimary;
        chain.isOnFallback = false;
      } else if (lastEvent.fromModel !== configPrimary && lastEvent.toModel !== configPrimary) {
        // Neither from nor to matches current config primary — config was changed since failover
        // Config is source of truth — agent should be on its configured primary
        chain.currentModel = configPrimary;
        chain.isOnFallback = false;
      } else {
        // Genuine active failover — agent is on a non-primary model
        chain.currentModel = lastEvent.toModel;
        chain.isOnFallback = lastEvent.toModel !== configPrimary;
      }
      chain.lastFailoverAt = lastEvent.timestamp;
      chain.lastFailoverReason = lastEvent.reason;
    }
  }

  // Enrich with live provider-health.json (from HELM fleet monitoring)
  const providerHealthFile = path.join(OPENCLAW_DIR, "workspace", "shared-kb", "fleet", "provider-health.json");
  const phRaw = readFileOrNull(providerHealthFile);
  if (phRaw) {
    try {
      const ph = JSON.parse(phRaw);
      for (const [pid, pdata] of Object.entries(ph.providers || {})) {
        const p = pdata as { status: string; cooldownRemaining?: string };
        const match = providers.find(pr => pr.provider === pid);
        if (match && p.status === "cooldown") {
          match.status = "degraded";
          match.lastError = `Auth cooldown: ${p.cooldownRemaining || "unknown"} remaining`;
        }
      }
      for (const chain of agentChains) {
        const primaryProv = chain.primaryProvider;
        const provHealth = (ph.providers || {})[primaryProv] as { status: string } | undefined;
        if (provHealth && provHealth.status === "cooldown") {
          chain.isOnFallback = true;
          for (const fb of chain.fallbacks) {
            const fbProv = fb.split("/")[0];
            const fbHealth = (ph.providers || {})[fbProv] as { status: string } | undefined;
            if (!fbHealth || fbHealth.status === "active") {
              chain.currentModel = fb;
              break;
            }
          }
        }
      }
    } catch { /* skip parse errors */ }
  }

  // Read auto-failover setting
  const failoverConfigFile = path.join(OPENCLAW_DIR, "failover-config.json");
  const failoverConfigRaw = readFileOrNull(failoverConfigFile);
  const failoverConfig = failoverConfigRaw ? JSON.parse(failoverConfigRaw) : { autoFailoverEnabled: true };

  return {
    providers,
    agentChains,
    failoverHistory: failoverHistory.slice(0, 50),
    autoFailoverEnabled: failoverConfig.autoFailoverEnabled ?? true,
    globalFallbackChain: globalFallbacks.filter((m: string) => !m.startsWith("xai/")),
    totalProvidersOnline: providers.filter(p => p.status === "online" || p.status === "degraded").length,
    totalModelsAvailable: providers.reduce((sum, p) => sum + p.models.length, 0),
  };
}

// ── Agent Spawning Data ──────────────────────────────────────────────
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

function getSpawningData(): SpawningData {
  const spawnQueueFile = path.join(SHARED_KB, "fleet", "spawn-queue.json");
  const spawnUsageFile = path.join(SHARED_KB, "fleet", "spawn-usage.json");

  const queueRaw = readFileOrNull(spawnQueueFile);
  const usageRaw = readFileOrNull(spawnUsageFile);

  const queue = queueRaw ? JSON.parse(queueRaw) : { meta: { dailyBudget: 2000000, dailyUsed: 0, maxFleetSubAgents: 10, activeSubAgents: 0 }, spawns: [] };
  const usage = usageRaw ? JSON.parse(usageRaw) : { byParent: {} };

  const activeSubs = (queue.spawns || []).filter((s: SpawnRequest) =>
    s.status === "approved" || s.status === "active" || s.status === "queued"
  ).length;

  return {
    meta: {
      dailyBudget: queue.meta?.dailyBudget || 2000000,
      dailyUsed: queue.meta?.dailyUsed || 0,
      maxFleetSubAgents: queue.meta?.maxFleetSubAgents || 10,
      activeSubAgents: activeSubs,
    },
    spawns: queue.spawns || [],
    byParent: usage.byParent || {},
  };
}
