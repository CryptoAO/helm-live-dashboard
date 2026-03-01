import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const IS_VERCEL = !!process.env.VERCEL;
const ANALYTICS_SNAPSHOT = path.join(process.cwd(), "public", "analytics-snapshot.json");
const OPENCLAW_DIR = path.join(process.env.HOME || "/Users/rizaldomadanlo", ".openclaw");
const CRON_RUNS_DIR = path.join(OPENCLAW_DIR, "cron", "runs");
const CRON_FILE = path.join(OPENCLAW_DIR, "cron", "jobs.json");
const CONFIG_FILE = path.join(OPENCLAW_DIR, "openclaw.json");

interface CronRunRecord {
  ts: number;
  action: string;
  status: string;
  summary: string;
  sessionKey: string;
  runAtMs: number;
  durationMs: number;
  usage?: { input_tokens: number; output_tokens: number; total_tokens: number };
}

function readFileOrNull(fp: string): string | null {
  try { return fs.readFileSync(fp, "utf-8"); } catch { return null; }
}

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
  const files = getAllCronRunFiles();
  const records: CronRunRecord[] = [];
  for (const file of files) {
    const raw = readFileOrNull(file);
    if (!raw) continue;
    const lines = raw.trim().split("\n");
    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const rec = JSON.parse(line);
        if (rec.action === "finished" && rec.sessionKey) {
          records.push(rec);
        }
      } catch { /* skip */ }
    }
  }
  records.sort((a, b) => (b.ts || 0) - (a.ts || 0));
  return records;
}

function extractAgentFromSessionKey(sk: string): string | null {
  const m = sk.match(/^agent:([^:]+):/);
  return m ? m[1] : null;
}

function getAgentNames(): Record<string, string> {
  const raw = readFileOrNull(CONFIG_FILE);
  if (!raw) return {};
  try {
    const cfg = JSON.parse(raw);
    const names: Record<string, string> = {};
    for (const a of cfg.agents?.list || []) {
      names[a.id] = a.name;
    }
    return names;
  } catch { return {}; }
}

function computeLiveAnalytics() {
  const runs = parseCronRuns();
  const agentNames = getAgentNames();
  const now = new Date();
  const today = now.toISOString().split("T")[0];

  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400000);
    days.push(d.toISOString().split("T")[0]);
  }

  const tokenUsage = days.map(date => {
    const dayRuns = runs.filter(r => new Date(r.ts).toISOString().split("T")[0] === date);
    const totalTokens = dayRuns.reduce((sum, r) => sum + (r.usage?.total_tokens || 0), 0);
    const byAgent: Record<string, number> = {};
    for (const r of dayRuns) {
      const agentId = extractAgentFromSessionKey(r.sessionKey) || "unknown";
      byAgent[agentId] = (byAgent[agentId] || 0) + (r.usage?.total_tokens || 0);
    }
    const estimatedCost = totalTokens * 0.00001;
    return { date, totalTokens, estimatedCost, cronRuns: dayRuns.length, byAgent };
  });

  const todayData = tokenUsage.find(d => d.date === today);
  const totalTokensToday = todayData?.totalTokens || 0;
  const estimatedCostToday = todayData?.estimatedCost || 0;
  const dailyBudget = 3.33;
  const budgetPct = Math.min(100, (estimatedCostToday / dailyBudget) * 100);

  const pipelineVelocity: { stageName: string; avgHours: number; ideaCount: number }[] = [];

  const allAgentIds = [...new Set(runs.map(r => extractAgentFromSessionKey(r.sessionKey)).filter(Boolean))] as string[];
  const agentHeatmap = allAgentIds.map(agentId => {
    const hours = Array(24).fill(0);
    const agentRuns = runs.filter(r => extractAgentFromSessionKey(r.sessionKey) === agentId);
    for (const r of agentRuns) {
      const h = new Date(r.ts).getHours();
      hours[h]++;
    }
    return { agentId, agentName: agentNames[agentId] || agentId.toUpperCase(), hours };
  });

  const cronRaw = readFileOrNull(CRON_FILE);
  if (cronRaw) {
    try {
      const cronData = JSON.parse(cronRaw);
      for (const _job of cronData.jobs || []) { /* job names available if needed */ }
    } catch { /* ignore */ }
  }

  const jobRuns: Record<string, CronRunRecord[]> = {};
  for (const r of runs) {
    const agentId = extractAgentFromSessionKey(r.sessionKey) || "unknown";
    if (!jobRuns[agentId]) jobRuns[agentId] = [];
    jobRuns[agentId].push(r);
  }

  const cronHealth = Object.entries(jobRuns).map(([agentId, agentRunList]) => {
    const successCount = agentRunList.filter(r => r.status === "ok").length;
    const failCount = agentRunList.filter(r => r.status !== "ok").length;
    const avgDurationMs = agentRunList.length > 0
      ? agentRunList.reduce((sum, r) => sum + (r.durationMs || 0), 0) / agentRunList.length
      : 0;
    return {
      jobId: agentId,
      jobName: agentNames[agentId] || agentId.toUpperCase(),
      totalRuns: agentRunList.length,
      successCount,
      failCount,
      avgDurationMs,
    };
  });

  return { tokenUsage, pipelineVelocity, agentHeatmap, cronHealth, totalTokensToday, estimatedCostToday, budgetPct };
}

export async function GET() {
  try {
    if (IS_VERCEL) {
      if (fs.existsSync(ANALYTICS_SNAPSHOT)) {
        const raw = fs.readFileSync(ANALYTICS_SNAPSHOT, "utf-8");
        return NextResponse.json(JSON.parse(raw), {
          headers: { "X-Data-Source": "snapshot" },
        });
      }
      return NextResponse.json({
        tokenUsage: [], pipelineVelocity: [], agentHeatmap: [], cronHealth: [],
        totalTokensToday: 0, estimatedCostToday: 0, budgetPct: 0,
      }, { headers: { "X-Data-Source": "empty" } });
    }

    const data = computeLiveAnalytics();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to compute analytics", details: String(error) },
      { status: 500 }
    );
  }
}
