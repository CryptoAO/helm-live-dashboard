import fs from "fs";
import path from "path";

const OPENCLAW_DIR = path.join(
  process.env.HOME || "/Users/rizaldomadanlo",
  ".openclaw"
);
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
  status: "PROPOSED" | "REVIEW" | "IN_PROGRESS" | "SHIPPED" | "APPROVED" | "REJECTED" | "DEFERRED" | "PARKED" | "DEPRIORITIZED" | "GO" | "MERGED" | "PLANNING";
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
  dashboardMonitoring: DashboardMonitoring;
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
        jobId: j.jobId,
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

      // Skip completed/archived items
      if (block.includes("Completed:") || block.includes("\u2705")) continue;

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

      // Parse frontmatter
      const nameMatch = content.match(/^project:\s*(.+)/m);
      const statusMatch = content.match(/^status:\s*(.+)/m);
      const priorityMatch = content.match(/^priority:\s*(.+)/m);
      const roleMatch = content.match(/^role:\s*(.+)/m);

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

      // Count flywheel items for this project
      const projectFwItems = flywheelItems.filter((fw) => fw.project === slug);
      const itemCount = projectFwItems.length;
      const fwIds = projectFwItems.map(fw => fw.id);

      // Find linked pipeline ideas — match by project name in title or slug
      const projectName = nameMatch ? nameMatch[1].trim() : file.replace(".md", "");
      const linkedIdeas = ideas.filter(i => {
        const titleLower = i.title.toLowerCase();
        const slugLower = slug.toLowerCase();
        return titleLower.includes(slugLower) || titleLower.includes(projectName.toLowerCase().replace(/\s+/g, ""));
      });
      const linkedIdeaIds = linkedIdeas.map(i => i.id);

      // Find linked taskboard tasks — match by idea prefix (IDEA010 → IDEA-010)
      const linkedTasks: string[] = [];
      for (const ideaId of linkedIdeaIds) {
        const prefix = ideaId.replace("-", "").replace("IDEA", "IDEA");
        const matching = taskboard.filter(t => t.id.toUpperCase().startsWith(prefix) || t.description.includes(ideaId));
        linkedTasks.push(...matching.map(t => t.id));
      }

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

      // Compute progress from linked tasks
      const allLinkedTasks = taskboard.filter(t => linkedTasks.includes(t.id));
      const completedTasks = allLinkedTasks.filter(t => t.status === "DONE").length;
      const totalTasks = allLinkedTasks.length;
      const progressPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      // Parse description (first paragraph after frontmatter)
      const descMatch = content.match(/(?:^|\n\n)([A-Z][\s\S]*?)(?=\n\n|\n##|$)/);
      const description = descMatch ? descMatch[1].replace(/\n/g, " ").trim().substring(0, 200) : "";

      projects.push({
        name: projectName,
        slug,
        status: statusMatch ? statusMatch[1].trim() : "UNKNOWN",
        priority: priorityMatch ? priorityMatch[1].trim() : "SECONDARY",
        role: roleMatch ? roleMatch[1].trim() : "",
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
    const ideaPrefix = idea.id.replace("-", "");
    const linkedTasks = taskboard.filter(t => t.id.toUpperCase().startsWith(ideaPrefix) || t.description.includes(idea.id));
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
    projects.push({
      name: "HELM Fleet (System)",
      slug: "SYSTEM",
      status: "ACTIVE",
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
      description: "Fleet infrastructure, tooling, and operational systems",
    });
  }

  return projects;
}

const INCOME_PIPELINE_FILE = path.join(SHARED_KB, "income", "pipeline.md");
const CONTENT_PLAN_FILE = path.join(SHARED_KB, "content", "daily-plan.md");

const CRON_RUNS_FILE = path.join(OPENCLAW_DIR, "cron", "runs", "undefined.jsonl");

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

function parseCronRuns(): CronRunRecord[] {
  const raw = readFileOrNull(CRON_RUNS_FILE);
  if (!raw) return [];
  const records: CronRunRecord[] = [];
  const lines = raw.trim().split("\n");
  // Only parse last 200 lines for performance
  const recentLines = lines.slice(-200);
  for (const line of recentLines) {
    if (!line.trim()) continue;
    try {
      const rec = JSON.parse(line);
      if (rec.action === "finished" && rec.sessionKey) {
        records.push(rec);
      }
    } catch { /* skip malformed lines */ }
  }
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

  // Sort by timestamp descending, limit to 50
  entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return { entries: entries.slice(0, 50), lastActivityMs };
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
  if (upper.startsWith("GO")) return "GO";
  if (upper.includes("MERGED")) return "MERGED";
  if (upper === "PROPOSED") return "PROPOSED";
  if (upper === "REVIEW") return "REVIEW";
  if (upper.includes("IN_PROGRESS") || upper.includes("IN PROGRESS")) return "IN_PROGRESS";
  if (upper === "SHIPPED") return "SHIPPED";
  if (upper.includes("APPROVED") || upper.includes("CLEARED")) return "APPROVED";
  if (upper === "REJECTED") return "REJECTED";
  if (upper === "DEFERRED") return "DEFERRED";
  if (upper === "PARKED") return "PARKED";
  if (upper === "DEPRIORITIZED") return "DEPRIORITIZED";
  if (upper.includes("PLANNING") || upper.includes("BEACON") || upper.includes("COMPASS") || upper.includes("SIGNAL") || upper.includes("SPARK")) return "PLANNING";
  // Review stage names as statuses (BEACON_PLAN, SPARK_GTM, SIGNAL_MARKET, etc.)
  if (upper.includes("_") && !upper.includes("IN_PROGRESS")) return "PLANNING";
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

      if (beforeBlock.includes("## New Ideas") || beforeBlock.includes("## Unreviewed")) {
        currentSection = "new";
      } else if (beforeBlock.includes("## Parked") || beforeBlock.includes("## Deprioritized")) {
        currentSection = "parked";
      } else if (beforeBlock.includes("## Active") || beforeBlock.includes("## Approved")) {
        currentSection = "active";
      }

      const lines = rawBlock.split("\n");
      const heading = lines[0].replace(/^###\s*/, "").trim();
      const block = lines.slice(1).join("\n");

      // Parse IDEA-XXX format: ### IDEA-010: MaritimeHub [GO — APPROVED ...]
      const ideaMatch = heading.match(/^(IDEA-\d{3}):\s*(.+)/);
      // Parse date-titled new ideas: ### 2026-02-24 — STCW Phase 2 ...
      const dateMatch = heading.match(/^(\d{4}-\d{2}-\d{2})\s*(?:—|–|-)\s*(.+)/);

      let id: string;
      let title: string;
      let addedDate = "";

      if (ideaMatch) {
        id = ideaMatch[1];
        title = ideaMatch[2].trim();
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
      const potential = extractField(block, "Potential") || extractField(block, "Revenue potential");
      const effort = extractField(block, "Effort");
      const timeToFirst = extractField(block, "Time to first \\$");
      const nextStep = extractField(block, "Next step");
      const brand = extractField(block, "Brand");
      const merges = extractField(block, "Merges");
      const deadline = extractField(block, "Phase 1 MVP deadline") || extractField(block, "Deadline");
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
      if (status === "MERGED" || merges || title.toLowerCase().includes("merged into") || block.toLowerCase().includes("merged into")) {
        const mergedMatch = title.match(/[Mm]erged into (IDEA-\d{3})/) || heading.match(/[Mm]erged into (IDEA-\d{3})/) || block.match(/[Mm]erged into (IDEA-\d{3})/);
        if (mergedMatch) mergedInto = mergedMatch[1];
        // Also check for parent merge reference
        if (!mergedInto && merges) {
          const mergesIdea = merges.match(/(IDEA-\d{3})/);
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

  return {
    ideas,
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

    // Compute activity status
    let activityStatus: AgentInfo["activityStatus"] = "idle";
    if (la) {
      const hoursSince = (now - new Date(la.time).getTime()) / 3600000;
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
    // Find taskboard tasks linked to this idea (e.g., IDEA010-B1 → IDEA-010)
    const ideaPrefix = idea.id.replace("-", "");
    const linkedTasks = taskboard.filter(t =>
      t.id.toUpperCase().startsWith(ideaPrefix) || t.description.includes(idea.id)
    );
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

  // Compute safety level
  const cronErrors = cronJobs.filter(j => j.consecutiveErrors > 0).length;
  const overdueAgents = enhancedAgents.filter(a => a.activityStatus === "overdue").length;
  let safety: { level: "green" | "amber" | "red"; label: string; message: string };
  if (cronErrors > 3 || cases.high > 5) {
    safety = { level: "red", label: "CRITICAL", message: `${cronErrors} cron errors · ${cases.high} high-priority cases` };
  } else if (cronErrors > 0 || overdueAgents > 0) {
    safety = { level: "amber", label: "WARNING", message: `${cronErrors} cron error${cronErrors !== 1 ? "s" : ""} · ${overdueAgents} agent${overdueAgents !== 1 ? "s" : ""} overdue` };
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
    dashboardMonitoring: getDashboardMonitoring(cronJobs),
  };
}
